/**
 * @description Structured input/output containers for the DocuSign "Send for E-Signature"
 *              wizard. These DTOs cross the LWC `@AuraEnabled` boundary, so every field is
 *              `@AuraEnabled`. Pure data containers — no SOQL, DML, or business logic.
 *
 *              Layer: DTO (per ARCHITECTURE.md §2). No sharing keyword required.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
@SuppressWarnings('PMD.ApexDoc')
public class DocuSignWizardDTO {
    // ─────────────────────────────────────────────────────────────────────
    //  REQUEST (LWC → Apex)
    // ─────────────────────────────────────────────────────────────────────

    /**
     * @description Top-level request payload assembled by the wizard's Send step.
     */
    public class SendRequest {
        /** The Unison__Offering__c record the wizard was launched from (the bulk-send source). */
        @AuraEnabled
        public Id offeringId { get; set; }

        /** Selected DocuSign Template Id (18-char Salesforce-side surrogate), or null when none chosen. */
        @AuraEnabled
        public String templateId { get; set; }

        /** ContentDocument Ids selected "from Salesforce" / freshly uploaded, in display order. */
        @AuraEnabled
        public List<Id> contentDocumentIds { get; set; }

        /** Contact Ids selected as recipients (one signed copy each). */
        @AuraEnabled
        public List<Id> recipientContactIds { get; set; }

        /** Field (tab) definitions to apply once to every recipient via anchor tabs. */
        @AuraEnabled
        public List<TabDefinition> tabs { get; set; }

        /** Email subject for the envelopes; service supplies a default when blank. */
        @AuraEnabled
        public String emailSubject { get; set; }

        /** Email body/message for the envelopes; optional. */
        @AuraEnabled
        public String emailMessage { get; set; }

        public SendRequest() {
            this.contentDocumentIds = new List<Id>();
            this.recipientContactIds = new List<Id>();
            this.tabs = new List<TabDefinition>();
        }
    }

    /**
     * @description A single field placement applied once and inherited by every recipient's copy.
     *              Two placement modes are supported:
     *               - 'anchor' (legacy): DocuSign searches the document(s) for `anchorText` and drops
     *                 the tab relative to that anchor (offset by xOffset/yOffset pixels).
     *               - 'position' (visual tagger): the tab is placed at an absolute
     *                 documentSequence/pageNumber/x/y/width/height, in DocuSign points, captured by the
     *                 in-wizard visual PDF tagger.
     *              A null/blank `mode` is treated as 'anchor' so existing callers keep working.
     */
    public class TabDefinition {
        /** One of TabType: 'SignHere', 'FullName', 'DateSigned', 'Text'. */
        @AuraEnabled
        public String type { get; set; }

        /** Placement mode: 'position' (visual tagger) or 'anchor' (legacy). Null/blank → 'anchor'. */
        @AuraEnabled
        public String mode { get; set; }

        // ── Positional fields (mode == 'position') ──

        /** 1-based document ordinal within the envelope's document list. */
        @AuraEnabled
        public Integer documentSequence { get; set; }

        /** 1-based page number the field was placed on. */
        @AuraEnabled
        public Integer pageNumber { get; set; }

        /** X offset from page top-left, in DocuSign points (Integer — Position ctor is Integer). */
        @AuraEnabled
        public Integer x { get; set; }

        /** Y offset from page top-left, in DocuSign points. */
        @AuraEnabled
        public Integer y { get; set; }

        /** Field width in points. */
        @AuraEnabled
        public Integer width { get; set; }

        /** Field height in points. */
        @AuraEnabled
        public Integer height { get; set; }

        // ── Anchor fields (mode == 'anchor', legacy — unchanged) ──

        /** Anchor string DocuSign matches in the documents (e.g. '\\s1\\', 'Full Name:'). */
        @AuraEnabled
        public String anchorText { get; set; }

        /** Whether the field is required (applies to signature tabs). */
        @AuraEnabled
        public Boolean required { get; set; }

        /** Horizontal pixel offset from the anchor. Null → 0. */
        @AuraEnabled
        public Integer xOffset { get; set; }

        /** Vertical pixel offset from the anchor. Null → 0. */
        @AuraEnabled
        public Integer yOffset { get; set; }

        public TabDefinition() {
            this.mode = 'anchor'; // default preserves legacy anchor behavior for any existing caller
            this.required = true;
            this.xOffset = 0;
            this.yOffset = 0;
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  RESPONSE (Apex → LWC)
    // ─────────────────────────────────────────────────────────────────────

    /**
     * @description Outcome of a send/enqueue operation surfaced to the wizard's final screen.
     */
    public class SendResult {
        /** True when the bulk list / envelopes were accepted by DocuSign (or queued async). */
        @AuraEnabled
        public Boolean success { get; set; }

        /** True when processing was handed to the async (Queueable) path for a large list. */
        @AuraEnabled
        public Boolean processedAsync { get; set; }

        /** True when the per-contact fallback loop was used (Bulk Send unavailable/not entitled). */
        @AuraEnabled
        public Boolean usedFallback { get; set; }

        /** Number of recipient copies actually dispatched (sync) or enqueued (async). */
        @AuraEnabled
        public Integer recipientCount { get; set; }

        /** DocuSign bulk list Id (sync bulk path only), null otherwise. */
        @AuraEnabled
        public String bulkListId { get; set; }

        /** User-safe status message for the toast / summary panel. */
        @AuraEnabled
        public String message { get; set; }

        /** Number of recipient copies that failed (per-contact path). */
        @AuraEnabled
        public Integer failureCount { get; set; }

        /** Per-recipient outcomes so a partial failure is visible per contact. */
        @AuraEnabled
        public List<RecipientResult> recipientResults { get; set; }

        public SendResult() {
            this.success = false;
            this.processedAsync = false;
            this.usedFallback = false;
            this.recipientCount = 0;
            this.failureCount = 0;
            this.recipientResults = new List<RecipientResult>();
        }
    }

    /**
     * @description Base64-encoded bytes of a selected document, delivered to the in-wizard visual
     *              PDF tagger so PDF.js can render the master file for placement. `tooLarge` is set
     *              (with no base64) when the file exceeds the preview heap ceiling, so the tagger can
     *              show a "too large to preview" state instead of loading a huge blob into heap.
     */
    public class DocumentContent {
        /** EncodingUtil.base64Encode of the latest ContentVersion.VersionData. Null when tooLarge. */
        @AuraEnabled
        public String base64 { get; set; }

        /** File extension of the latest version (e.g. 'pdf'). */
        @AuraEnabled
        public String fileExtension { get; set; }

        /** Raw (pre-base64) byte size of the file. */
        @AuraEnabled
        public Integer contentSize { get; set; }

        /** File title. */
        @AuraEnabled
        public String title { get; set; }

        /** True when the file exceeds MAX_PREVIEW_BYTES; base64 is then omitted. */
        @AuraEnabled
        public Boolean tooLarge { get; set; }

        public DocumentContent() {
            this.tooLarge = false;
        }
    }

    /**
     * @description Outcome for a single recipient in the per-contact send path, so a partial
     *              failure (e.g. one bad email) is surfaced without aborting the whole send.
     */
    public class RecipientResult {
        @AuraEnabled
        public Id contactId { get; set; }
        @AuraEnabled
        public String name { get; set; }
        @AuraEnabled
        public String email { get; set; }
        @AuraEnabled
        public Boolean success { get; set; }
        @AuraEnabled
        public String envelopeId { get; set; }
        @AuraEnabled
        public String errorMessage { get; set; }

        public RecipientResult() {
            this.success = false;
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  LOOKUP DTOs (read responses for the wizard's pick lists)
    // ─────────────────────────────────────────────────────────────────────

    /**
     * @description A DocuSign template option for the Documents step picker.
     */
    public class TemplateOption {
        @AuraEnabled
        public String id { get; set; }
        @AuraEnabled
        public String name { get; set; }

        public TemplateOption(String id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    /**
     * @description A Salesforce file (ContentDocument) linked to the Offering, for the
     *              "Add from Salesforce" picker. `uid` is a stable client key (the
     *              ContentDocumentId) so the LWC never keys rows by array index (bug C2).
     */
    public class DocumentOption {
        @AuraEnabled
        public String uid { get; set; }
        @AuraEnabled
        public Id contentDocumentId { get; set; }
        @AuraEnabled
        public String title { get; set; }
        @AuraEnabled
        public String fileExtension { get; set; }
        @AuraEnabled
        public Long contentSize { get; set; }

        public DocumentOption() {
        }
    }

    /**
     * @description A Contact recipient option for the Recipients step. `preChecked` reflects the
     *              email-filter auto-select rule (e.g. email contains 'haris').
     */
    public class RecipientOption {
        @AuraEnabled
        public Id contactId { get; set; }
        @AuraEnabled
        public String name { get; set; }
        @AuraEnabled
        public String email { get; set; }
        @AuraEnabled
        public Boolean preChecked { get; set; }

        /** True when the user added this Contact manually via the "Add Recipient" picker. */
        @AuraEnabled
        public Boolean manuallyAdded { get; set; }

        public RecipientOption() {
            this.preChecked = false;
            this.manuallyAdded = false;
        }
    }
}
