import { LightningElement, api } from "lwc";

const TYPE_OPTIONS = [
  { label: "Signature", value: "SignHere" },
  { label: "Full Name", value: "FullName" },
  { label: "Date Signed", value: "DateSigned" },
  { label: "Text", value: "Text" }
];

/**
 * docuSignPrepareStep (stateless)
 *
 * Prepare step: define the signing fields (tabs) ONCE. They are applied to ALL recipients via
 * anchor tabs on the bulk template envelope (or carried by the chosen DocuSign template). The
 * parent owns the tab list; this child renders it and dispatches the full updated list on change:
 *   - tabschange  [ { key, type, anchorText, required, label } ]
 */
export default class DocuSignPrepareStep extends LightningElement {
  @api tabDefinitions = [];

  get typeOptions() {
    return TYPE_OPTIONS;
  }

  get rows() {
    return this.tabDefinitions.map((tab) => ({ ...tab }));
  }

  handleAnchorChange(event) {
    this.updateRow(event.currentTarget.dataset.key, "anchorText", event.detail.value);
  }

  handleTypeChange(event) {
    this.updateRow(event.currentTarget.dataset.key, "type", event.detail.value);
  }

  handleRequiredChange(event) {
    this.updateRow(event.currentTarget.dataset.key, "required", event.target.checked);
  }

  handleRemove(event) {
    const key = event.currentTarget.dataset.key;
    const next = this.tabDefinitions.filter((tab) => tab.key !== key);
    this.dispatchEvent(new CustomEvent("tabschange", { detail: next }));
  }

  handleAdd() {
    const key = "tab-" + Date.now();
    const next = [
      ...this.tabDefinitions,
      { key, type: "SignHere", anchorText: "", required: true, label: "Field" }
    ];
    this.dispatchEvent(new CustomEvent("tabschange", { detail: next }));
  }

  updateRow(key, field, value) {
    const next = this.tabDefinitions.map((tab) =>
      tab.key === key ? { ...tab, [field]: value } : { ...tab }
    );
    this.dispatchEvent(new CustomEvent("tabschange", { detail: next }));
  }
}
