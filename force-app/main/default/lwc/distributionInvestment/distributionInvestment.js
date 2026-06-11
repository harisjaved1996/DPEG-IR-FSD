import { LightningElement } from "lwc";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

// Light, native success-green pill for the Paid status.
const PILL_GREEN =
  "display:inline-flex;align-items:center;padding:0.125rem 0.5rem;border-radius:999px;font-size:0.75rem;font-weight:600;background:#dcfce7;color:#166534;";

const COLUMNS = [
  {
    label: "Distribution Number",
    fieldName: "distributionUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "distributionNumber" },
      target: "_self"
    }
  },
  {
    label: "Paid Status",
    fieldName: "paidStatus",
    type: "pill",
    typeAttributes: { pillStyle: { fieldName: "paidStyle" } }
  },
  { label: "Amount", fieldName: "amountLabel", type: "text" },
  { label: "Distribution Date", fieldName: "distributionDate", type: "text" },
  {
    label: "",
    type: "button",
    typeAttributes: {
      label: "Repeat Distribution",
      name: "repeat",
      variant: "brand-outline"
    }
  },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    distributionNumber: "DIST-2400",
    distributionUrl: "#",
    paidStatus: "Paid",
    amount: 40000,
    amountLabel: "$40,000.00",
    distributionDate: "15/04/2026",
    date: "15/04/2026",
    effectiveDate: "15/04/2026",
    period: "Q2 2026",
    description: "Quarterly Cash Distribution",
    source: "Cash Flow",
    type: "Preferred Return"
  },
  {
    id: "2",
    distributionNumber: "DIST-2401",
    distributionUrl: "#",
    paidStatus: "Paid",
    amount: 25000,
    amountLabel: "$25,000.00",
    distributionDate: "20/05/2026",
    date: "20/05/2026",
    effectiveDate: "21/05/2026",
    period: "Q2 2026",
    description: "Return of Capital",
    source: "Sale of Property",
    type: "Return of Capital"
  },
  {
    id: "3",
    distributionNumber: "DIST-2402",
    distributionUrl: "#",
    paidStatus: "Paid",
    amount: 60000,
    amountLabel: "$60,000.00",
    distributionDate: "10/06/2026",
    date: "10/06/2026",
    effectiveDate: "10/06/2026",
    period: "Q3 2026",
    description: "Quarterly Cash Distribution",
    source: "Cash Flow",
    type: "Other"
  }
];

export default class DistributionInvestment extends LightningElement {
  columns = COLUMNS;
  data = DATA.map((row) => ({ ...row, paidStyle: PILL_GREEN }));
  showModal = false;
  selectedRecords = [];

  get recordCount() {
    return this.data.length;
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;
    if (actionName === "repeat") {
      this.selectedRecords = [row];
      this.showModal = true;
    }
    // edit / delete row actions are placeholders for now.
  }

  closeModal() {
    this.showModal = false;
    this.selectedRecords = [];
  }

  handleNew() {
    // Placeholder for the New action.
  }

  handleViewAll(event) {
    event.preventDefault();
    // Placeholder for the View All action.
  }
}
