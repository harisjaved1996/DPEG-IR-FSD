import { LightningElement, api } from "lwc";

/**
 * docuSignRecipientsStep (stateless)
 *
 * Recipients step:
 *  - Lists candidate Contacts (resolved by the email filter on the server, e.g. email contains
 *    "haris"). Filter-matched contacts arrive pre-checked and are deselectable.
 *  - "Add Recipient": a lightning-record-picker (Contact) lets the user search and add ANY Contact;
 *    each added contact joins the same selected-recipients list and gets their own copy to sign.
 *
 * Selection/list state is owned by the parent. This child renders props and dispatches:
 *   - recipienttoggle { contactId }            (check/uncheck an existing row)
 *   - addrecipient    { contactId }            (a Contact was picked to be added)
 *   - removerecipient { contactId }            (remove a manually-added recipient)
 */
export default class DocuSignRecipientsStep extends LightningElement {
  @api recipientOptions = [];
  @api selectedRecipientIds = [];

  contactFilter = {
    criteria: [
      {
        fieldPath: "Email",
        operator: "ne",
        value: null
      }
    ]
  };

  displayInfo = {
    primaryField: "Name",
    additionalFields: ["Email"]
  };

  matchingInfo = {
    primaryField: { fieldPath: "Name" },
    additionalFields: [{ fieldPath: "Email" }]
  };

  get rows() {
    const selected = new Set(this.selectedRecipientIds);
    return this.recipientOptions.map((option) => ({
      ...option,
      checked: selected.has(option.contactId),
      manuallyAdded: !!option.manuallyAdded
    }));
  }

  get hasRecipients() {
    return this.recipientOptions.length > 0;
  }

  get selectedCount() {
    return this.selectedRecipientIds.length;
  }

  handleToggle(event) {
    const contactId = event.currentTarget.dataset.id;
    this.dispatchEvent(new CustomEvent("recipienttoggle", { detail: { contactId } }));
  }

  handleRemove(event) {
    const contactId = event.currentTarget.dataset.id;
    this.dispatchEvent(new CustomEvent("removerecipient", { detail: { contactId } }));
  }

  handlePicked(event) {
    const contactId = event.detail.recordId;
    if (!contactId) {
      return;
    }
    this.dispatchEvent(new CustomEvent("addrecipient", { detail: { contactId } }));
    // Clear the picker so the next add starts fresh.
    const picker = this.refs.contactPicker;
    if (picker && typeof picker.clearSelection === "function") {
      picker.clearSelection();
    }
  }
}
