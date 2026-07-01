import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import getRecipientOptions from "@salesforce/apex/DocuSignWizardController.getRecipientOptions";
import getRecipientsByIds from "@salesforce/apex/DocuSignWizardController.getRecipientsByIds";
import getDocumentOptions from "@salesforce/apex/DocuSignWizardController.getDocumentOptions";
import getTemplateOptions from "@salesforce/apex/DocuSignWizardController.getTemplateOptions";
import sendForSignature from "@salesforce/apex/DocuSignWizardController.send";

const STEP_DOCUMENTS = "documents";
const STEP_RECIPIENTS = "recipients";
const STEP_PREPARE = "prepare";
const STEP_SEND = "send";

const STEPS = [STEP_DOCUMENTS, STEP_RECIPIENTS, STEP_PREPARE, STEP_SEND];

/**
 * docuSignSendWizard
 *
 * Feature host for the 4-step DocuSign "Send for E-Signature" wizard launched from the
 * Unison__Offering__c record page. Holds all state and Apex wiring; delegates each step's
 * presentation to a stateless child (documents / recipients / prepare / send).
 *
 * Data access: imperative Apex only (the wizard composes Offering files, DocuSign templates,
 * and a Plaid-style fan-out send that LDS cannot express). All errors surface as toasts.
 */
export default class DocuSignSendWizard extends LightningElement {
  @api recordId;

  @track currentStep = STEP_DOCUMENTS;

  // Document step state — selected docs keyed by a STABLE uid (bug C2), never by array index.
  @track templateOptions = [];
  @track documentOptions = [];
  selectedTemplateId = null;
  // Map<uid, { uid, contentDocumentId, title }>
  selectedDocumentsByUid = new Map();

  // Recipient step state.
  @track recipientOptions = [];
  // Set<contactId> of currently selected recipients.
  selectedRecipientIds = new Set();

  // Prepare step state — field (tab) definitions defined once, applied to all recipients.
  @track tabDefinitions = [];

  // Send result.
  @track sendResult = null;
  isSending = false;
  loading = true;
  errorMessage = null;

  connectedCallback() {
    this.loadInitialData();
  }

  async loadInitialData() {
    this.loading = true;
    this.errorMessage = null;
    try {
      // Critical, SOQL-only data: recipients + Salesforce files. Reliable, loaded together.
      const [recipients, documents] = await Promise.all([
        getRecipientOptions({ offeringId: this.recordId }),
        getDocumentOptions({ offeringId: this.recordId })
      ]);

      this.recipientOptions = recipients.map((r) => ({ ...r }));
      this.documentOptions = documents.map((d) => ({ ...d }));

      // Pre-select recipients flagged by the email filter (deselectable).
      this.selectedRecipientIds = new Set(
        this.recipientOptions.filter((r) => r.preChecked).map((r) => r.contactId)
      );

      // Seed the default "tag once" fields: Signature, Full Name, Date Signed.
      this.tabDefinitions = this.defaultTabDefinitions();
    } catch (error) {
      this.errorMessage = this.reduceError(error);
    } finally {
      this.loading = false;
    }

    // DocuSign templates load INDEPENDENTLY (a DocuSign callout). A failure here must never blank
    // out the recipients/files loaded above — templates are optional.
    try {
      const templates = await getTemplateOptions();
      this.templateOptions = templates.map((t) => ({ ...t }));
    } catch (templateError) {
      this.templateOptions = [];
    }
  }

  defaultTabDefinitions() {
    return [
      { key: "sign", type: "SignHere", anchorText: "\\s1\\", required: true, label: "Signature" },
      { key: "name", type: "FullName", anchorText: "\\n1\\", required: false, label: "Full Name" },
      {
        key: "date",
        type: "DateSigned",
        anchorText: "\\d1\\",
        required: false,
        label: "Date Signed"
      }
    ];
  }

  // ─── Step navigation ───────────────────────────────────────────────────

  get stepIndex() {
    return STEPS.indexOf(this.currentStep);
  }

  get isFirstStep() {
    return this.stepIndex === 0;
  }

  get isLastStep() {
    return this.stepIndex === STEPS.length - 1;
  }

  get isDocumentsStep() {
    return this.currentStep === STEP_DOCUMENTS;
  }
  get isRecipientsStep() {
    return this.currentStep === STEP_RECIPIENTS;
  }
  get isPrepareStep() {
    return this.currentStep === STEP_PREPARE;
  }
  get isSendStep() {
    return this.currentStep === STEP_SEND;
  }

  get progressSteps() {
    return [
      { label: "Documents", value: STEP_DOCUMENTS },
      { label: "Recipients", value: STEP_RECIPIENTS },
      { label: "Prepare", value: STEP_PREPARE },
      { label: "Send", value: STEP_SEND }
    ];
  }

  get nextLabel() {
    return this.isLastStep ? "Send" : "Next";
  }

  get nextDisabled() {
    if (this.isDocumentsStep) {
      return this.selectedDocumentsByUid.size === 0 && !this.selectedTemplateId;
    }
    if (this.isRecipientsStep) {
      return this.selectedRecipientIds.size === 0;
    }
    return this.isSending;
  }

  handleBack() {
    if (!this.isFirstStep) {
      this.currentStep = STEPS[this.stepIndex - 1];
    }
  }

  handleNext() {
    if (this.isLastStep) {
      this.handleSend();
      return;
    }
    this.currentStep = STEPS[this.stepIndex + 1];
  }

  // ─── Documents step handlers ─────────────────────────────────────────────

  handleTemplateChange(event) {
    this.selectedTemplateId = event.detail.templateId || null;
  }

  handleDocumentToggle(event) {
    // Child passes the full document option; we key by its stable uid (bug C2).
    const doc = event.detail;
    const next = new Map(this.selectedDocumentsByUid);
    if (next.has(doc.uid)) {
      next.delete(doc.uid);
    } else {
      next.set(doc.uid, {
        uid: doc.uid,
        contentDocumentId: doc.contentDocumentId,
        title: doc.title
      });
    }
    this.selectedDocumentsByUid = next;
  }

  handleDocumentsUploaded(event) {
    // Newly uploaded files come back as {uid, contentDocumentId, title}; add + select them.
    const uploaded = event.detail || [];
    const nextOptions = [...this.documentOptions];
    const nextSelected = new Map(this.selectedDocumentsByUid);
    uploaded.forEach((doc) => {
      nextOptions.push({ ...doc });
      nextSelected.set(doc.uid, {
        uid: doc.uid,
        contentDocumentId: doc.contentDocumentId,
        title: doc.title
      });
    });
    this.documentOptions = nextOptions;
    this.selectedDocumentsByUid = nextSelected;
  }

  // ─── Recipients step handlers ────────────────────────────────────────────

  handleRecipientToggle(event) {
    const contactId = event.detail.contactId;
    const next = new Set(this.selectedRecipientIds);
    if (next.has(contactId)) {
      next.delete(contactId);
    } else {
      next.add(contactId);
    }
    this.selectedRecipientIds = next;
  }

  async handleAddRecipient(event) {
    const contactId = event.detail.contactId;
    if (!contactId) {
      return;
    }
    // Dedup: if already in the list, just ensure it's checked.
    const existing = this.recipientOptions.find((r) => r.contactId === contactId);
    if (existing) {
      const next = new Set(this.selectedRecipientIds);
      next.add(contactId);
      this.selectedRecipientIds = next;
      return;
    }
    try {
      const resolved = await getRecipientsByIds({ contactIds: [contactId] });
      if (!resolved || resolved.length === 0) {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Recipient",
            message: "That contact has no email address or is not accessible.",
            variant: "warning"
          })
        );
        return;
      }
      const option = { ...resolved[0] };
      this.recipientOptions = [...this.recipientOptions, option];
      const next = new Set(this.selectedRecipientIds);
      next.add(option.contactId);
      this.selectedRecipientIds = next;
    } catch (error) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Add recipient failed",
          message: this.reduceError(error),
          variant: "error"
        })
      );
    }
  }

  handleRemoveRecipient(event) {
    const contactId = event.detail.contactId;
    this.recipientOptions = this.recipientOptions.filter((r) => r.contactId !== contactId);
    const next = new Set(this.selectedRecipientIds);
    next.delete(contactId);
    this.selectedRecipientIds = next;
  }

  // ─── Prepare step handlers ───────────────────────────────────────────────

  handleTabsChange(event) {
    this.tabDefinitions = (event.detail || []).map((t) => ({ ...t }));
  }

  // ─── Send ────────────────────────────────────────────────────────────────

  async handleSend() {
    this.isSending = true;
    this.errorMessage = null;
    try {
      console.log("working fine1");
      const request = {
        offeringId: this.recordId,
        templateId: this.selectedTemplateId,
        contentDocumentIds: Array.from(this.selectedDocumentsByUid.values()).map(
          (d) => d.contentDocumentId
        ),
        recipientContactIds: Array.from(this.selectedRecipientIds),
        tabs: this.tabDefinitions.map((t) => ({
          type: t.type,
          anchorText: t.anchorText,
          required: t.required,
          xOffset: 0,
          yOffset: 0
        })),
        emailSubject: "Please sign: Offering documents",
        emailMessage: ""
      };
      // Pass the request as a JSON string: the Aura framework fails to bind a typed custom-DTO
      // parameter (with Id/List<Id> members) in this namespaced org, so the Apex method is never
      // invoked. A string parameter binds reliably; the controller deserializes it.
      this.sendResult = await sendForSignature({ requestJson: JSON.stringify(request) });
      if (this.sendResult && this.sendResult.success) {
        console.log("working fine4");
        this.dispatchEvent(
          new ShowToastEvent({
            title: "DocuSign",
            message: this.sendResult.message,
            variant: "success"
          })
        );
      } else {
        this.errorMessage =
          (this.sendResult && this.sendResult.message) || "Send did not complete.";
      }
    } catch (error) {
      this.errorMessage = this.reduceError(error);
      this.dispatchEvent(
        new ShowToastEvent({
          title: "DocuSign send failed",
          message: this.errorMessage,
          variant: "error"
        })
      );
    } finally {
      this.isSending = false;
    }
  }

  // ─── Pass-through getters for child components ───────────────────────────

  get selectedDocumentUids() {
    return Array.from(this.selectedDocumentsByUid.keys());
  }

  get selectedRecipientIdArray() {
    return Array.from(this.selectedRecipientIds);
  }

  get hasError() {
    return !!this.errorMessage;
  }

  reduceError(error) {
    if (Array.isArray(error?.body)) {
      return error.body.map((e) => e.message).join(", ");
    }
    if (error?.body?.message) {
      return error.body.message;
    }
    if (typeof error?.message === "string") {
      return error.message;
    }
    return "Unexpected error.";
  }
}
