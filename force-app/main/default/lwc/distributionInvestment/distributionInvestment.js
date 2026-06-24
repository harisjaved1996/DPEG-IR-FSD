import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

const COLUMNS = [
  {
    label: "Distribution Batch Number",
    fieldName: "distributionUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "distributionNumber" },
      target: "_self"
    }
  },
  { label: "Status", fieldName: "paidStatus", type: "text" },
  { label: "Amount", fieldName: "amountLabel", type: "text" },
  { label: "Distribution Date", fieldName: "distributionDate", type: "text" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    distributionNumber: "DB-020",
    distributionUrl: "/lightning/r/Unison__Distribution_Batch__c/a04FW000Or3e6hUYIQ/view",
    paidStatus: "Completed",
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
    distributionNumber: "DB-021",
    distributionUrl: "/lightning/r/Unison__Distribution_Batch__c/a04FW000Or3e6hUYIQ/view",
    paidStatus: "Completed",
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
    distributionNumber: "DB-023",
    distributionUrl: "/lightning/r/Unison__Distribution_Batch__c/a04FW000Or3e6hUYIQ/view",
    paidStatus: "Completed",
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

export default class DistributionInvestment extends NavigationMixin(LightningElement) {
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
    // Navigate to the Distribution Batch object list page, showing the "All" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Distribution_Batch__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All"
      }
    });
  }
}
