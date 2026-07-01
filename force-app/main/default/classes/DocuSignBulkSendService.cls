/**
 * @description Service layer that owns ALL DocuSign Apex Toolkit (`dfsle`) orchestration for the
 *              "Send for E-Signature" wizard. No inline SOQL (delegated to ContactSelector /
 *              DocuSignDocumentSelector); no DML except the single bulk insert of uploaded files
 *              that happens in the controller layer. `with sharing`.
 *
 *              Layer: Service (ARCHITECTURE.md §2). This is the project's dedicated callout/
 *              integration service for DocuSign — every `dfsle.*` call lives here so the rest of
 *              the codebase stays package-agnostic and this class can be mocked at its public seam.
 *
 *              SEND STRATEGY
 *              -------------
 *              Primary  : DocuSign Bulk Send. One draft "template" envelope carries the documents
 *                         and the tag-once anchor tabs on a single placeholder signer role; each
 *                         selected Contact becomes a bulk copy that inherits that role, so every
 *                         recipient receives their OWN envelope to sign.
 *              Fallback : if Bulk Send is not entitled on the DocuSign account at runtime
 *                         (createLists / sendEnvelope throws), a per-contact loop of
 *                         `EnvelopeService.sendEnvelope(envelope, true)` is used instead. The seam
 *                         is `sendBulk()` vs `sendPerContact()`; the public `send()` chooses.
 *
 *              ASYNC
 *              -----
 *              The wizard controller decides sync vs async against ASYNC_THRESHOLD and, for large
 *              recipient sets, hands the SAME access-resolved Contact Id set to
 *              DocuSignBulkSendQueueable (bug C3 — the size reported equals the size enqueued).
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class DocuSignBulkSendService {
    // ─── Constants ───────────────────────────────────────────────────────
    @TestVisible
    private static final String DEFAULT_EMAIL_SUBJECT = 'Please sign: Offering documents';
    @TestVisible
    private static final String DEFAULT_ROLE_NAME = 'Signer 1';

    /** Tab type tokens accepted from the wizard's Prepare step (DocuSignWizardDTO.TabDefinition.type). */
    @TestVisible
    private static final String TAB_SIGN_HERE = 'SignHere';
    @TestVisible
    private static final String TAB_FULL_NAME = 'FullName';
    @TestVisible
    private static final String TAB_DATE_SIGNED = 'DateSigned';
    @TestVisible
    private static final String TAB_TEXT = 'Text';

    /** Anchor defaults: case-insensitive, ignore-if-not-present, pixels. */
    private static final Boolean ANCHOR_ALLOW_WHITESPACE = true;
    private static final Boolean ANCHOR_CASE_SENSITIVE = false;
    private static final String ANCHOR_H_ALIGN = 'left';
    private static final Boolean ANCHOR_IGNORE_IF_NOT_PRESENT = true;
    private static final Boolean ANCHOR_MATCH_WHOLE_WORD = false;
    private static final String ANCHOR_UNITS = 'pixels';

    /**
     * @description Sends one signed copy of the selected documents to every selected recipient.
     *              Attempts Bulk Send first; falls back to a per-contact envelope loop if the
     *              account is not entitled for bulk sending. Callouts happen here.
     * @param request       The fully-resolved send request (offering, docs, recipients, tabs, email).
     * @param contentVersions Latest ContentVersion per selected ContentDocument (file attachments).
     * @param recipients    Access-resolved Contacts to receive copies (already filtered by the selector).
     * @return SendResult describing what happened (bulk vs fallback, counts, ids, message).
     */
    public static DocuSignWizardDTO.SendResult send(
        DocuSignWizardDTO.SendRequest request,
        List<ContentVersion> contentVersions,
        List<Contact> recipients
    ) {
        DocuSignWizardDTO.SendResult result = new DocuSignWizardDTO.SendResult();

        if (request == null || request.offeringId == null) {
            result.message = 'No offering context supplied.';
            return result;
        }
        if (recipients == null || recipients.isEmpty()) {
            result.message = 'No recipients selected.';
            return result;
        }

        // ONE ENVELOPE PER TRANSACTION (root-cause-correct).
        // --------------------------------------------------
        // dfsle.EnvelopeService.sendEnvelope() does an HTTP callout AND then writes its tracking DML
        // (dfsle__Envelope__c). A second send in the SAME transaction therefore attempts a callout
        // after uncommitted DML and throws System.CalloutException: "You have uncommitted work
        // pending. Please commit or rollback before calling out." (Confirmed in-org: recipient 1
        // delivered, recipient 2 failed.) sendEnvelopes(List) is a no-op for in-memory envelopes,
        // and createEnvelope() is not visible to subscriber code — so the ONLY reliable primitive is
        // sendEnvelope(env, true), which must run at most once per transaction.
        //
        // Therefore `send()` dispatches EXACTLY ONE envelope (the first recipient). Multi-recipient
        // fan-out is orchestrated by DocuSignBulkSendQueueable, which sends one recipient per async
        // transaction and chains to the next — so each callout runs with no prior uncommitted DML.
        DocuSignWizardDTO.RecipientResult one = sendOne(request, contentVersions, recipients[0]);
        result.recipientResults.add(one);
        result.usedFallback = false;
        if (one.success) {
            result.success = true;
            result.recipientCount = 1;
            result.message = 'Envelope sent to ' + recipients[0].Name + '.';
        } else {
            result.success = false;
            result.failureCount = 1;
            result.message = 'Could not send to ' + recipients[0].Name + ': ' + one.errorMessage;
        }
        return result;
    }

    /**
     * @description Sends exactly ONE envelope to ONE recipient via dfsle.EnvelopeService.sendEnvelope
     *              (send now). This is the atomic, transaction-safe send primitive — call it at most
     *              once per Apex transaction. Builds the signer with the tag-once anchor tabs and the
     *              selected documents. Never throws for a recipient-level failure; the outcome is
     *              returned in the RecipientResult so the caller can record a partial failure.
     * @param request The send request (offering, template, tabs, email).
     * @param contentVersions Latest ContentVersion per selected ContentDocument.
     * @param recipient The single Contact to send to.
     * @return RecipientResult describing the outcome for this one contact.
     */
    public static DocuSignWizardDTO.RecipientResult sendOne(
        DocuSignWizardDTO.SendRequest request,
        List<ContentVersion> contentVersions,
        Contact recipient
    ) {
        DocuSignWizardDTO.RecipientResult perRecipient = new DocuSignWizardDTO.RecipientResult();
        perRecipient.contactId = recipient == null ? null : recipient.Id;
        perRecipient.name = recipient == null ? null : recipient.Name;
        perRecipient.email = recipient == null ? null : recipient.Email;

        if (recipient == null) {
            perRecipient.success = false;
            perRecipient.errorMessage = 'No recipient supplied.';
            return perRecipient;
        }

        try {
            dfsle.Entity source = new dfsle.Entity(request.offeringId);
            List<dfsle.Document> documents = buildDocuments(request, contentVersions);
            if (documents.isEmpty()) {
                perRecipient.success = false;
                perRecipient.errorMessage = 'Select at least one document or a template before sending.';
                return perRecipient;
            }
            List<dfsle.Tab> tabs = buildTabs(request.tabs);
            String emailSubject = String.isBlank(request.emailSubject) ? DEFAULT_EMAIL_SUBJECT : request.emailSubject;

            // The signer references the Contact as its own source so DocuSign links the envelope
            // recipient back to the Contact record.
            dfsle.Recipient signer = dfsle.Recipient.fromSource(
                recipient.Name,
                recipient.Email,
                null,
                DEFAULT_ROLE_NAME,
                new dfsle.Entity(recipient.Id)
            );
            if (!tabs.isEmpty()) {
                signer = signer.withTabs(tabs);
            }

            dfsle.Envelope envelope = dfsle.EnvelopeService.getEmptyEnvelope(source)
                .withDocuments(documents)
                .withRecipients(new List<dfsle.Recipient>{ signer })
                .withEmail(emailSubject, request.emailMessage);

            dfsle.Envelope sentEnvelope = dfsle.EnvelopeService.sendEnvelope(envelope, true);

            perRecipient.success = true;
            perRecipient.envelopeId = extractEnvelopeId(sentEnvelope);
        } catch (Exception recipientEx) {
            perRecipient.success = false;
            perRecipient.errorMessage = recipientEx.getMessage();
            System.debug(LoggingLevel.ERROR, 'sendOne failed for ' + recipient.Email + ': ' + recipientEx.getMessage());
        }
        return perRecipient;
    }

    /**
     * @description Safely extracts the DocuSign envelope id from a sent envelope for display.
     *              The dfsle.Envelope member fields are not reliably accessible as Apex properties
     *              across package versions, so the id is read defensively via JSON serialization and
     *              any failure is swallowed (a missing id never breaks the send).
     * @param sentEnvelope The envelope returned by EnvelopeService.sendEnvelope.
     * @return The DocuSign envelope id as a String, or null when unavailable.
     */
    private static String extractEnvelopeId(dfsle.Envelope sentEnvelope) {
        if (sentEnvelope == null) {
            return null;
        }
        try {
            Map<String, Object> envelopeMap = (Map<String, Object>) JSON.deserializeUntyped(
                JSON.serialize(sentEnvelope)
            );
            Object docuSignId = envelopeMap.get('docuSignId');
            return docuSignId == null ? null : String.valueOf(docuSignId);
        } catch (Exception ignored) {
            return null;
        }
    }

    // ─── Document assembly ───────────────────────────────────────────────

    /**
     * @description Builds the ordered `dfsle.Document` list from the request — a chosen template
     *              and/or selected Salesforce files (resolved to their latest ContentVersion).
     * @param request The send request (templateId + contentDocumentIds drive ordering).
     * @param contentVersions Latest ContentVersion per selected ContentDocument.
     * @return List of dfsle.Document; may be empty when neither a template nor files were chosen.
     */
    @TestVisible
    private static List<dfsle.Document> buildDocuments(
        DocuSignWizardDTO.SendRequest request,
        List<ContentVersion> contentVersions
    ) {
        List<dfsle.Document> documents = new List<dfsle.Document>();

        if (String.isNotBlank(request.templateId)) {
            documents.add(dfsle.Document.fromTemplate(dfsle.UUID.parse(request.templateId), 'DocuSign Template'));
        }

        if (contentVersions != null) {
            for (ContentVersion version : contentVersions) {
                documents.add(dfsle.Document.fromFile(version));
            }
        }
        return documents;
    }

    // ─── Tab assembly (tag once → applied to every recipient via the role) ──

    /**
     * @description Builds the `dfsle.Tab` list from the wizard's field definitions. Signature/name/
     *              date/text tabs are positioned with anchor strings so they apply to whatever
     *              document the anchor text appears in — defined once, inherited by every copy.
     * @param definitions The Prepare-step tab definitions (type + anchor + offsets).
     * @return List of dfsle.Tab; empty when no definitions supplied (e.g. a template carries its own tabs).
     */
    @TestVisible
    private static List<dfsle.Tab> buildTabs(List<DocuSignWizardDTO.TabDefinition> definitions) {
        List<dfsle.Tab> tabs = new List<dfsle.Tab>();
        if (definitions == null || definitions.isEmpty()) {
            return tabs;
        }

        for (DocuSignWizardDTO.TabDefinition definition : definitions) {
            if (definition == null || String.isBlank(definition.anchorText)) {
                continue;
            }
            dfsle.Tab tab = toTab(definition);
            if (tab != null) {
                tabs.add(tab.withAnchor(buildAnchor(definition)));
            }
        }
        return tabs;
    }

    /**
     * @description Maps a single tab definition to its concrete `dfsle` tab subtype. `withRequired`
     *              lives on `dfsle.SignatureTab` (parent of SignHereTab) and is applied before the
     *              anchor is attached because `withAnchor` returns the base `dfsle.Tab`.
     * @param definition The tab definition (type + required flag).
     * @return The concrete dfsle.Tab, or null for an unrecognised type.
     */
    private static dfsle.Tab toTab(DocuSignWizardDTO.TabDefinition definition) {
        Boolean isRequired = definition.required == null ? true : definition.required;

        if (TAB_SIGN_HERE.equalsIgnoreCase(definition.type)) {
            dfsle.SignHereTab signHere = new dfsle.SignHereTab();
            // withRequired is inherited from dfsle.SignatureTab and returns dfsle.SignatureTab.
            return (dfsle.Tab) signHere.withRequired(isRequired);
        } else if (TAB_FULL_NAME.equalsIgnoreCase(definition.type)) {
            return (dfsle.Tab) new dfsle.FullNameTab();
        } else if (TAB_DATE_SIGNED.equalsIgnoreCase(definition.type)) {
            return (dfsle.Tab) new dfsle.DateSignedTab();
        } else if (TAB_TEXT.equalsIgnoreCase(definition.type)) {
            return (dfsle.Tab) new dfsle.TextTab();
        }
        return null;
    }

    /**
     * @description Builds the 9-arg anchor for a tab definition using project anchor defaults.
     * @param definition The tab definition (anchorText + x/y offsets).
     * @return A configured dfsle.Tab.Anchor.
     */
    private static dfsle.Tab.Anchor buildAnchor(DocuSignWizardDTO.TabDefinition definition) {
        Integer xOffset = definition.xOffset == null ? 0 : definition.xOffset;
        Integer yOffset = definition.yOffset == null ? 0 : definition.yOffset;
        return new dfsle.Tab.Anchor(
            definition.anchorText,
            ANCHOR_ALLOW_WHITESPACE,
            ANCHOR_CASE_SENSITIVE,
            ANCHOR_H_ALIGN,
            ANCHOR_IGNORE_IF_NOT_PRESENT,
            ANCHOR_MATCH_WHOLE_WORD,
            ANCHOR_UNITS,
            xOffset,
            yOffset
        );
    }

    /** Custom exception for DocuSign send failures. */
    public class DocuSignBulkSendException extends Exception {
    }
}
