import { LightningElement } from "lwc";

const COLUMNS = [
  { label: "Document Name", fieldName: "documentName", type: "text" },
  { label: "Year", fieldName: "year", type: "text" },
  { label: "Type", fieldName: "type", type: "text" }
];

const DATA = [
  {
    id: "1",
    documentName: "Q4 2025 Performance Report",
    year: "2025",
    type: "Reporting and Statements"
  },
  {
    id: "2",
    documentName: "Subscription Agreement",
    year: "2024",
    type: "Agreements"
  },
  {
    id: "3",
    documentName: "Schedule K-1 (Form 1065)",
    year: "2024",
    type: "Tax Documents"
  }
];

const TYPE_OPTIONS = [
  { label: "Reporting and Statements", value: "Reporting and Statements" },
  { label: "Agreements", value: "Agreements" },
  { label: "General Documents", value: "General Documents" },
  { label: "Tax Documents", value: "Tax Documents" },
  { label: "Verification", value: "Verification" }
];

const YEAR_OPTIONS = [
  { label: "2026", value: "2026" },
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
  { label: "2023", value: "2023" },
  { label: "2022", value: "2022" }
];

// Investing entities offered for distribution of the uploaded document.
const ENTITY_NAMES = [
  "12830 Oak Village Dr, LLC",
  "18825 Sea, LLC",
  "1988 Venture LLC",
  "Gabri Investments LLC",
  "KBMM MSO LLC",
  "Kilam Ventures LTD"
];

export default class InvestmentDocuments extends LightningElement {
  columns = COLUMNS;
  data = DATA;
  typeOptions = TYPE_OPTIONS;
  yearOptions = YEAR_OPTIONS;

  showModal = false;
  // Share With Contacts is disabled until at least one document row is selected.
  shareDisabled = true;
  selectedDocumentIds = [];
  documentName = "";
  type = "";
  year = "";
  // Each entity row carries its own selected flag; all selected by default.
  entities = ENTITY_NAMES.map((name, index) => ({
    id: String(index + 1),
    name,
    selected: true
  }));

  _nextId = 100;

  get recordCount() {
    return this.data.length;
  }

  handleNew() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.documentName = "";
    this.type = "";
    this.year = "";
    this.entities = this.entities.map((entity) => ({
      ...entity,
      selected: true
    }));
  }

  handleFileChange(event) {
    const files = event.target.files;
    if (files && files.length) {
      // Auto-populate the document name from the selected file (without extension).
      const fileName = files[0].name;
      const dotIndex = fileName.lastIndexOf(".");
      this.documentName = dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
    }
  }

  handleNameChange(event) {
    this.documentName = event.detail.value;
  }

  handleTypeChange(event) {
    this.type = event.detail.value;
  }

  handleYearChange(event) {
    this.year = event.detail.value;
  }

  handleEntityToggle(event) {
    const entityId = event.target.dataset.id;
    const checked = event.target.checked;
    this.entities = this.entities.map((entity) =>
      entity.id === entityId ? { ...entity, selected: checked } : entity
    );
  }

  handleSelectAllEntities() {
    this.entities = this.entities.map((entity) => ({ ...entity, selected: true }));
  }

  handleUnselectAllEntities() {
    this.entities = this.entities.map((entity) => ({ ...entity, selected: false }));
  }

  handleSave() {
    if (!this.documentName) {
      return;
    }
    const newRow = {
      id: String(this._nextId++),
      documentName: this.documentName,
      year: this.year,
      type: this.type
    };
    this.data = [newRow, ...this.data];
    this.closeModal();
  }

  handleRowSelection(event) {
    const selectedRows = event.detail.selectedRows || [];
    this.selectedDocumentIds = selectedRows.map((row) => row.id);
    this.shareDisabled = this.selectedDocumentIds.length === 0;
  }

  handleShareWithContacts() {
    // Placeholder: share the selected documents with contacts.
    return this.selectedDocumentIds;
  }

  handleViewAll(event) {
    event.preventDefault();
    // Placeholder for the View All action.
  }
}
