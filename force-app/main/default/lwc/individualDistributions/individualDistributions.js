import { LightningElement } from "lwc";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

// Each investing entity links to its Investing Entity record page. In real data
// every row would carry its own record URL; the demo rows share one record.
const INVESTING_ENTITY_URL = "/lightning/r/Unison__Investing_Entity__c/a0LFW0032uqkigG2AQ/view";

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
    label: "Investing Entity",
    fieldName: "investingEntityUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "investingEntity" },
      target: "_self"
    }
  },
  { label: "Amount", fieldName: "amountLabel", type: "text" },
  { label: "Distribution Date", fieldName: "distributionDate", type: "text" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    distributionNumber: "DIST-2400",
    distributionUrl: "/lightning/r/Unison__Distribution__c/a05FW0018gTCjbMYAT/view",
    investingEntity: "Gabri Investments LLC",
    investingEntityUrl: INVESTING_ENTITY_URL,
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
    distributionUrl: "/lightning/r/Unison__Distribution__c/a05FW0018gTCjbMYAT/view",
    investingEntity: "KBMM MSO LLC",
    investingEntityUrl: INVESTING_ENTITY_URL,
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
    distributionUrl: "/lightning/r/Unison__Distribution__c/a05FW0018gTCjbMYAT/view",
    investingEntity: "Kilam Ventures LTD",
    investingEntityUrl: INVESTING_ENTITY_URL,
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

export default class IndividualDistributions extends LightningElement {
  columns = COLUMNS;
  data = DATA;
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
