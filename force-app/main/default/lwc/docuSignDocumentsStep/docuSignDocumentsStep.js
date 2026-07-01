import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import uploadFiles from "@salesforce/apex/DocuSignWizardController.uploadFiles";

/**
 * docuSignDocumentsStep (stateless)
 *
 * Documents step of the DocuSign wizard: pick a DocuSign template, select Salesforce files
 * linked to the record, or upload new files. Selection state is owned by the parent — this
 * component only renders props and dispatches events:
 *   - templatechange  { templateId }
 *   - documenttoggle  { uid, contentDocumentId, title, ... }  (the toggled document option)
 *   - documentsuploaded  [ { uid, contentDocumentId, title } ]
 *
 * Bug C2: rows are keyed and reconciled by the stable `uid` (ContentDocumentId), never by
 * array index, so toggling/removing one row never affects another.
 */
export default class DocuSignDocumentsStep extends LightningElement {
  @api recordId;
  @api templateOptions = [];
  @api documentOptions = [];
  @api selectedTemplateId;
  @api selectedDocumentUids = [];

  get templateComboOptions() {
    return [
      { label: "— None —", value: "" },
      ...this.templateOptions.map((t) => ({ label: t.name, value: t.id }))
    ];
  }

  get documentRows() {
    const selected = new Set(this.selectedDocumentUids);
    return this.documentOptions.map((doc) => ({
      ...doc,
      selected: selected.has(doc.uid),
      variant: selected.has(doc.uid) ? "brand" : "neutral",
      buttonLabel: selected.has(doc.uid) ? "Selected" : "Select"
    }));
  }

  get hasDocuments() {
    return this.documentOptions.length > 0;
  }

  handleTemplateChange(event) {
    this.dispatchEvent(
      new CustomEvent("templatechange", { detail: { templateId: event.detail.value } })
    );
  }

  handleToggle(event) {
    const uid = event.currentTarget.dataset.uid;
    const doc = this.documentOptions.find((d) => d.uid === uid);
    if (doc) {
      this.dispatchEvent(new CustomEvent("documenttoggle", { detail: { ...doc } }));
    }
  }

  async handleUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    try {
      const names = [];
      const contents = [];
      for (let i = 0; i < files.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        const base64 = await this.readAsBase64(files[i]);
        names.push(files[i].name);
        contents.push(base64);
      }
      const documentIds = await uploadFiles({
        offeringId: this.recordId,
        fileNames: names,
        base64Contents: contents
      });
      const uploaded = documentIds.map((id, index) => ({
        uid: id,
        contentDocumentId: id,
        title: names[index],
        fileExtension: "",
        contentSize: 0
      }));
      this.dispatchEvent(new CustomEvent("documentsuploaded", { detail: uploaded }));
    } catch (error) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Upload failed",
          message: this.reduceError(error),
          variant: "error"
        })
      );
    }
  }

  readAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result || "";
        const base64 = result.indexOf(",") >= 0 ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  reduceError(error) {
    if (error?.body?.message) {
      return error.body.message;
    }
    return "Unexpected error.";
  }
}
