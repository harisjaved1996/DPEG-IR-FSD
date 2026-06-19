import { LightningElement } from "lwc";

const PILL_BASE =
  "display:inline-flex;align-items:center;padding:0.125rem 0.5rem;border-radius:0.25rem;font-size:0.75rem;font-weight:600;";

// Same status value always maps to the same pill style.
const STATUS_PILL = {
  "Pending e-sig": PILL_BASE + "background:#dbeafe;color:#1d6fc4;",
  "IR Approval": PILL_BASE + "background:#fff0e0;color:#c05e00;",
  Completed: PILL_BASE + "background:#dcfce7;color:#166534;"
};

// All rows link to the Share Transfer record inserted in the org (demo data).
const SHARE_TRANSFER_URL = "/lightning/r/Unison__Share_Transfer__c/a0DFW0012wPIiem2AD/view";

const COLUMNS = [
  {
    label: "Share Transfer Number",
    fieldName: "shareTransferUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "id" }, target: "_blank" }
  },
  { label: "Transfer From", fieldName: "from", type: "text" },
  { label: "Transfer To", fieldName: "to", type: "text" },
  { label: "Shares To Transfer", fieldName: "units", type: "text" },
  { label: "Sale Price", fieldName: "amount", type: "text" },
  { label: "Purchase Price", fieldName: "purchasePrice", type: "text" },
  {
    label: "Status",
    fieldName: "status",
    type: "pill",
    typeAttributes: { pillStyle: { fieldName: "statusStyle" } }
  },
  { label: "Date", fieldName: "date", type: "text" }
];

const TRANSFERS = [
  {
    id: "ST-012",
    from: "18825 Sea, LLC",
    to: "1988 Venture LLC",
    units: "2",
    amount: "$125K",
    purchasePrice: "$120K",
    status: "Completed",
    date: "Apr 18 2025"
  },
  {
    id: "ST-011",
    from: "24 Seven Entrepreneurs LLC",
    to: "24 Seven REH, LLC",
    units: "1",
    amount: "$250K",
    purchasePrice: "$245K",
    status: "Completed",
    date: "Apr 14 2025"
  },
  {
    id: "ST-010",
    from: "3Bet Holdings LLC",
    to: "3D Way, LLC",
    units: "3",
    amount: "$50K",
    purchasePrice: "$48K",
    status: "Completed",
    date: "Mar 02 2026"
  }
];

const TRANSFER_TYPE_OPTIONS = [
  { label: "Partial", value: "Partial" },
  { label: "Full", value: "Full" }
];

// Each share is valued at $50,000; Sale Price = Shares To Transfer * this rate.
const PRICE_PER_SHARE = 50000;

export default class ShareTransferComponent extends LightningElement {
  columns = COLUMNS;

  rows = TRANSFERS.map((row) => ({
    ...row,
    shareTransferUrl: SHARE_TRANSFER_URL,
    statusStyle: STATUS_PILL[row.status] || PILL_BASE + "background:#ecebea;color:#5c5c5c;"
  }));

  // New Share Transfer modal state
  showModal = false;
  transferTypeOptions = TRANSFER_TYPE_OPTIONS;

  transferFrom = null;
  transferTo = null;
  salePrice = null;
  purchasePrice = null;
  transferType = null;
  sharesToTransfer = null;
  transferDate = null;

  get recordCount() {
    return this.rows.length;
  }

  handleViewAll(event) {
    event.preventDefault();
    // Placeholder for the View All action.
  }

  handleNew() {
    this.resetForm();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  handleTransferFromChange(event) {
    this.transferFrom = event.detail.recordId;
  }

  handleTransferToChange(event) {
    this.transferTo = event.detail.recordId;
  }

  handleSalePriceChange(event) {
    this.salePrice = event.detail.value;
  }

  handlePurchasePriceChange(event) {
    this.purchasePrice = event.detail.value;
  }

  handleTransferTypeChange(event) {
    this.transferType = event.detail.value;
  }

  handleSharesChange(event) {
    this.sharesToTransfer = event.detail.value;
    const shares = parseFloat(this.sharesToTransfer);
    // Auto-calculate Sale Price from shares; clear it when the input is empty/invalid.
    this.salePrice = isNaN(shares) ? null : shares * PRICE_PER_SHARE;
  }

  handleTransferDateChange(event) {
    this.transferDate = event.detail.value;
  }

  handleSave() {
    // Placeholder: persist the new share transfer here.
    this.closeModal();
  }

  resetForm() {
    this.transferFrom = null;
    this.transferTo = null;
    this.salePrice = null;
    this.purchasePrice = null;
    this.transferType = null;
    this.sharesToTransfer = null;
    this.transferDate = null;
  }
}
