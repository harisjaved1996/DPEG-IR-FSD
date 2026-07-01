/**
 * @description Thin `@AuraEnabled` controller for the DocuSign "Send for E-Signature" wizard LWC.
 *              Holds no business logic and no `dfsle` calls — it resolves data through the selectors,
 *              delegates the actual send to DocuSignBulkSendService (sync) or
 *              DocuSignBulkSendQueueable (async), and translates every failure into an
 *              `AuraHandledException` with a user-safe message. `with sharing`.
 *
 *              Layer: Controller (ARCHITECTURE.md §2). The only DML it performs is the single bulk
 *              insert of uploaded files (ContentVersion), executed in user mode.
 *
 *              BUG FIXES enforced here:
 *               - C3: the async path enqueues the SAME access-filtered Contact Id set whose size is
 *                     reported. Recipients are re-resolved through ContactSelector.selectByIds and the
 *                     resolved Ids (not the raw request) are what is sent / enqueued.
 *               - W2: ASYNC_THRESHOLD is a non-final @TestVisible constant so the async branch is
 *                     reachable from tests without inserting hundreds of records.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class DocuSignWizardController {
    /**
     * Recipient count at/above which the send is handed to the async chaining Queueable instead of
     * running inline. Set to 2 because a single Apex transaction can make at most one
     * dfsle.EnvelopeService.sendEnvelope() callout (the toolkit writes tracking DML after the callout,
     * so a second callout in the same transaction fails with "uncommitted work pending"). One
     * recipient sends synchronously; two or more fan out one-per-async-transaction.
     * Non-final + @TestVisible (bug W2) so tests can adjust the boundary.
     */
    @TestVisible
    private static Integer ASYNC_THRESHOLD = 2;

    /** Custom Metadata developer name of the singleton wizard setting record. */
    private static final String SETTING_RECORD = 'Default';

    /** Fallback email filter when the Custom Metadata setting is missing/blank. */
    @TestVisible
    private static final String FALLBACK_EMAIL_FILTER = 'haris';

    private static final String GENERIC_ERROR = 'Something went wrong preparing the DocuSign wizard. Please try again or contact your administrator.';

    // ─── Read endpoints (Documents / Recipients / Prepare steps) ─────────

    /**
     * @description Returns the Contact recipient options for the Recipients step, auto-pre-checking
     *              Contacts whose Email contains the configured filter value (Custom Metadata;
     *              default 'haris'). Pre-checked rows are deselectable in the UI.
     * @param offeringId The Offering record the wizard launched from (reserved for future scoping).
     * @return List of RecipientOption DTOs (preChecked reflects the email filter).
     */
    @AuraEnabled(cacheable=true)
    public static List<DocuSignWizardDTO.RecipientOption> getRecipientOptions(Id offeringId) {
        try {
            String emailFilter = resolveEmailFilter();
            List<Contact> matches = ContactSelector.selectByEmailContains(emailFilter);

            List<DocuSignWizardDTO.RecipientOption> options = new List<DocuSignWizardDTO.RecipientOption>();
            for (Contact contact : matches) {
                DocuSignWizardDTO.RecipientOption option = new DocuSignWizardDTO.RecipientOption();
                option.contactId = contact.Id;
                option.name = contact.Name;
                option.email = contact.Email;
                option.preChecked = true; // matched the filter → auto-selected, deselectable
                options.add(option);
            }
            return options;
        } catch (Exception ex) {
            throw buildAuraException(ex);
        }
    }

    /**
     * @description Resolves Name + Email for Contacts the user added manually via the "Add Recipient"
     *              picker on the Recipients step. Runs through ContactSelector (WITH USER_MODE), so a
     *              user can only add Contacts they can access. Returned options are flagged
     *              manuallyAdded=true and preChecked=true so they join the selected list, checked,
     *              with a remove affordance.
     * @param contactIds The Contact Ids picked by the user.
     * @return List of RecipientOption DTOs for the accessible picked Contacts.
     */
    @AuraEnabled(cacheable=true)
    public static List<DocuSignWizardDTO.RecipientOption> getRecipientsByIds(List<Id> contactIds) {
        try {
            Set<Id> ids = contactIds == null ? new Set<Id>() : new Set<Id>(contactIds);
            List<Contact> contacts = ContactSelector.selectByIds(ids);

            List<DocuSignWizardDTO.RecipientOption> options = new List<DocuSignWizardDTO.RecipientOption>();
            for (Contact contact : contacts) {
                DocuSignWizardDTO.RecipientOption option = new DocuSignWizardDTO.RecipientOption();
                option.contactId = contact.Id;
                option.name = contact.Name;
                option.email = contact.Email;
                option.preChecked = true;
                option.manuallyAdded = true;
                options.add(option);
            }
            return options;
        } catch (Exception ex) {
            throw buildAuraException(ex);
        }
    }

    /**
     * @description Returns the Salesforce files linked to the Offering for the "Add from Salesforce"
     *              picker. Each option is keyed by a stable uid (ContentDocumentId) so the LWC never
     *              keys selected rows by array index (bug C2).
     * @param offeringId The Offering record whose linked files to list.
     * @return List of DocumentOption DTOs.
     */
    @AuraEnabled(cacheable=true)
    public static List<DocuSignWizardDTO.DocumentOption> getDocumentOptions(Id offeringId) {
        try {
            List<ContentDocumentLink> links = DocuSignDocumentSelector.selectLinkedToRecord(offeringId);

            List<DocuSignWizardDTO.DocumentOption> options = new List<DocuSignWizardDTO.DocumentOption>();
            for (ContentDocumentLink link : links) {
                DocuSignWizardDTO.DocumentOption option = new DocuSignWizardDTO.DocumentOption();
                option.contentDocumentId = link.ContentDocumentId;
                option.uid = String.valueOf(link.ContentDocumentId);
                option.title = link.ContentDocument.Title;
                option.fileExtension = link.ContentDocument.FileExtension;
                option.contentSize = link.ContentDocument.ContentSize;
                options.add(option);
            }
            return options;
        } catch (Exception ex) {
            throw buildAuraException(ex);
        }
    }

    /**
     * @description Returns the available DocuSign templates for the Documents step template picker.
     * @return List of TemplateOption DTOs.
     */
    // NOT cacheable: dfsle.TemplateService performs an internal callout/DML, which is illegal in a
    // cacheable (read-only) Apex context and fails with "dfsle:Too many DML statements: 1".
    @AuraEnabled
    public static List<DocuSignWizardDTO.TemplateOption> getTemplateOptions() {
        try {
            List<DocuSignWizardDTO.TemplateOption> options = new List<DocuSignWizardDTO.TemplateOption>();
            for (dfsle.Template template : dfsle.TemplateService.getTemplates()) {
                options.add(new DocuSignWizardDTO.TemplateOption(String.valueOf(template.id), template.name));
            }
            return options;
        } catch (Exception ex) {
            throw buildAuraException(ex);
        }
    }

    // ─── Upload endpoint (Documents step) ────────────────────────────────

    /**
     * @description Persists files uploaded in the Documents step and links them to the Offering.
     *              All ContentVersions are inserted in a single bulk DML in user mode; the resulting
     *              ContentDocument Ids are returned so the wizard can include them as documents.
     * @param offeringId The Offering to link the uploaded files to.
     * @param fileNames Parallel list of file titles.
     * @param base64Contents Parallel list of base64-encoded file bodies.
     * @return List of ContentDocument Ids created.
     */
    @AuraEnabled
    public static List<Id> uploadFiles(Id offeringId, List<String> fileNames, List<String> base64Contents) {
        if (offeringId == null || fileNames == null || base64Contents == null || fileNames.isEmpty()) {
            return new List<Id>();
        }
        if (fileNames.size() != base64Contents.size()) {
            throw new AuraHandledException('Uploaded file names and contents do not match.');
        }

        try {
            List<ContentVersion> versions = new List<ContentVersion>();
            for (Integer i = 0; i < fileNames.size(); i++) {
                versions.add(
                    new ContentVersion(
                        Title = fileNames[i],
                        PathOnClient = fileNames[i],
                        VersionData = EncodingUtil.base64Decode(base64Contents[i])
                    )
                );
            }
            insert as user versions;

            // Re-query to resolve ContentDocumentIds, then link each to the Offering in one bulk insert.
            Set<Id> versionIds = new Map<Id, ContentVersion>(versions).keySet();

            List<Id> documentIds = new List<Id>();
            List<ContentDocumentLink> linksToInsert = new List<ContentDocumentLink>();
            for (ContentVersion version : DocuSignDocumentSelector.selectByVersionIds(versionIds)) {
                documentIds.add(version.ContentDocumentId);
                linksToInsert.add(
                    new ContentDocumentLink(
                        ContentDocumentId = version.ContentDocumentId,
                        LinkedEntityId = offeringId,
                        ShareType = 'V'
                    )
                );
            }
            if (!linksToInsert.isEmpty()) {
                insert as user linksToInsert;
            }
            return documentIds;
        } catch (Exception ex) {
            throw buildAuraException(ex);
        }
    }

    // ─── Send endpoint (Send step) ───────────────────────────────────────

    /**
     * @description Sends one signed copy of the selected documents to every selected recipient.
     *              Re-resolves the recipient Contacts under the running user's sharing (bug C3),
     *              then either sends inline or — for large lists (>= ASYNC_THRESHOLD) — enqueues
     *              DocuSignBulkSendQueueable with the SAME resolved Id set whose size is reported.
     * @param request The send request assembled by the wizard.
     * @return SendResult describing the outcome (sync/async, bulk/fallback, counts, message).
     */
    @AuraEnabled
    public static DocuSignWizardDTO.SendResult send(String requestJson) {
        // The request is received as a JSON STRING (not a typed DTO) on purpose. The Aura/LWC
        // framework's strict typed-parameter binding for a custom Apex class whose members include
        // Id / List<Id> fails to bind in this namespaced org — the Apex method was never invoked
        // (confirmed via debug log: no inner code unit, zero SOQL/DML), surfacing to the LWC as a
        // generic "internal server error". A plain String parameter always binds; deserializing it
        // here is verified to reconstruct the request reliably.
        if (String.isBlank(requestJson)) {
            throw new AuraHandledException('No send request supplied.');
        }
        DocuSignWizardDTO.SendRequest request;
        try {
            request = (DocuSignWizardDTO.SendRequest) JSON.deserialize(
                requestJson,
                DocuSignWizardDTO.SendRequest.class
            );
        } catch (Exception parseEx) {
            throw buildAuraException(parseEx);
        }
        if (request == null) {
            throw new AuraHandledException('No send request supplied.');
        }

        try {
            // C3: resolve the recipient set under user mode; this resolved set is the single source
            // of truth for both the reported count and the records actually sent/enqueued.
            Set<Id> requestedIds = request.recipientContactIds == null
                ? new Set<Id>()
                : new Set<Id>(request.recipientContactIds);
            List<Contact> resolved = ContactSelector.selectByIds(requestedIds);

            if (resolved.isEmpty()) {
                DocuSignWizardDTO.SendResult empty = new DocuSignWizardDTO.SendResult();
                empty.message = 'No accessible recipients with an email address were selected.';
                return empty;
            }

            // C3: build the ordered Id list from the selector-resolved recipients (not the raw
            // request), so the count reported equals the Ids actually sent/enqueued.
            List<Id> resolvedIds = new List<Id>();
            for (Contact contact : resolved) {
                resolvedIds.add(contact.Id);
            }
            Set<Id> documentIds = request.contentDocumentIds == null
                ? new Set<Id>()
                : new Set<Id>(request.contentDocumentIds);

            // SEND MODE BY RECIPIENT COUNT (root-cause-correct):
            //  - 1 recipient  -> synchronous single send (one callout; safe in this transaction).
            //  - 2+ recipients -> async chain. Each dfsle send does a callout THEN tracking DML, so a
            //    second send in the same transaction would throw CalloutException ("uncommitted work
            //    pending"). The Queueable sends one recipient per async transaction and chains the rest.
            // W2: ASYNC_THRESHOLD is @TestVisible and non-final, so this boundary is testable.
            if (resolvedIds.size() >= ASYNC_THRESHOLD) {
                System.enqueueJob(new DocuSignBulkSendQueueable(request, resolvedIds, documentIds));

                DocuSignWizardDTO.SendResult asyncResult = new DocuSignWizardDTO.SendResult();
                asyncResult.success = true;
                asyncResult.processedAsync = true;
                asyncResult.recipientCount = resolvedIds.size(); // == enqueued Id list size (C3)
                asyncResult.message =
                    'Sending ' +
                    resolvedIds.size() +
                    ' envelope(s) in the background. ' +
                    'Each recipient will receive their own envelope to sign shortly.';
                return asyncResult;
            }

            List<ContentVersion> contentVersions = DocuSignDocumentSelector.selectLatestVersionsByDocumentIds(
                documentIds
            );
            return DocuSignBulkSendService.send(request, contentVersions, resolved);
        } catch (Exception ex) {
            throw buildAuraException(ex);
        }
    }

    // ─── Private helpers ─────────────────────────────────────────────────

    /**
     * @description Resolves the recipient email filter from Custom Metadata, falling back to 'haris'.
     * @return The email filter fragment.
     */
    private static String resolveEmailFilter() {
        DocuSign_Wizard_Setting__mdt setting = DocuSign_Wizard_Setting__mdt.getInstance(SETTING_RECORD);
        if (setting != null && String.isNotBlank(setting.Default_Email_Filter__c)) {
            return setting.Default_Email_Filter__c;
        }
        return FALLBACK_EMAIL_FILTER;
    }

    /**
     * @description Wraps any caught exception in an AuraHandledException carrying a clear, user-safe
     *              message so the LWC never surfaces a generic "internal server error". The full
     *              detail is logged for diagnostics.
     *
     *              IMPORTANT: the AuraHandledException message MUST be supplied via the constructor.
     *              Calling `setMessage()` throws `System.LimitException: Can only throw this exception
     *              type from VisualForce or Aura context` outside an Aura context, which previously
     *              masked the real error with a generic server fault. The two-argument constructor
     *              (userMessage, devMessage) reliably surfaces the user message to the LWC `body.message`.
     * @param ex The caught exception.
     * @return An AuraHandledException to throw at the LWC boundary.
     */
    private static AuraHandledException buildAuraException(Exception ex) {
        String detail = ex == null ? 'Unknown error.' : ex.getMessage();
        System.debug(
            LoggingLevel.ERROR,
            'DocuSignWizardController error: ' + detail + '\n' + (ex == null ? '' : ex.getStackTraceString())
        );
        String userMessage = GENERIC_ERROR + ' (Details: ' + sanitize(detail) + ')';
        return new AuraHandledException(userMessage);
    }

    /**
     * @description Trims a raw exception message to a bounded, user-safe string for display.
     * @param raw The raw exception message.
     * @return A sanitized, length-bounded message.
     */
    private static String sanitize(String raw) {
        if (String.isBlank(raw)) {
            return 'see logs';
        }
        String trimmed = raw.trim();
        return trimmed.length() > 200 ? trimmed.substring(0, 200) : trimmed;
    }
}
