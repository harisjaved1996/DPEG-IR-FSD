import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";

const COLUMNS = [
  {
    label: "Position Number",
    fieldName: "positionUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "positionNumber" }, target: "_blank" },
    sortable: true
  },
  {
    label: "Investing Entity",
    fieldName: "entityUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "entity" }, target: "_blank" },
    sortable: true
  },
  { label: "Ownership", fieldName: "ownership", type: "text", sortable: true },
  { label: "Contributed", fieldName: "contributed", type: "text", sortable: true },
  { label: "Distributed", fieldName: "distributed", type: "text", sortable: true }
];

const DATA = [
  {
    id: "1",
    positionNumber: "POS-1001",
    positionUrl: "/lightning/r/Unison__Position__c/a0MFW000BzmP2ua2IC/view",
    entity: "1988 Venture LLC",
    entityUrl: "/lightning/r/Unison__Investing_Entity__c/a0LFW0032uqkigG2AQ/view",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "2",
    positionNumber: "POS-1002",
    positionUrl: "/lightning/r/Unison__Position__c/a0MFW000BzmP2ua2IC/view",
    entity: "3D Way, LLC",
    entityUrl: "/lightning/r/Unison__Investing_Entity__c/a0LFW0032uqkigG2AQ/view",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "3",
    positionNumber: "POS-1003",
    positionUrl: "/lightning/r/Unison__Position__c/a0MFW000BzmP2ua2IC/view",
    entity: "5As Capital Group LLC",
    entityUrl: "/lightning/r/Unison__Investing_Entity__c/a0LFW0032uqkigG2AQ/view",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "4",
    positionNumber: "POS-1004",
    positionUrl: "/lightning/r/Unison__Position__c/a0MFW000BzmP2ua2IC/view",
    entity: "A&S Meghjiani Investments, LLC",
    entityUrl: "/lightning/r/Unison__Investing_Entity__c/a0LFW0032uqkigG2AQ/view",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "5",
    positionNumber: "POS-1005",
    positionUrl: "/lightning/r/Unison__Position__c/a0MFW000BzmP2ua2IC/view",
    entity: "Aamir Pirani and Nisha Pirani",
    entityUrl: "/lightning/r/Unison__Investing_Entity__c/a0LFW0032uqkigG2AQ/view",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "6",
    positionNumber: "POS-1006",
    positionUrl: "/lightning/r/Unison__Position__c/a0MFW000BzmP2ua2IC/view",
    entity: "AANA LLC",
    entityUrl: "/lightning/r/Unison__Investing_Entity__c/a0LFW0032uqkigG2AQ/view",
    ownership: "0.1000%",
    contributed: "$50,000.00",
    distributed: "$2,500.02"
  }
];

export default class PositionInvestments extends NavigationMixin(LightningElement) {
  columns = COLUMNS;
  data = DATA;
  sortedBy = "entityUrl";
  sortedDirection = "asc";

  get recordCount() {
    return this.data.length;
  }

  handleSort(event) {
    const { fieldName, sortDirection } = event.detail;
    let key = fieldName;
    if (fieldName === "entityUrl") {
      key = "entity";
    } else if (fieldName === "positionUrl") {
      key = "positionNumber";
    }
    const sorted = [...this.data];
    sorted.sort((a, b) => {
      const x = (a[key] || "").toString();
      const y = (b[key] || "").toString();
      const result = x.localeCompare(y, undefined, { numeric: true });
      return sortDirection === "asc" ? result : -result;
    });
    this.data = sorted;
    this.sortedBy = fieldName;
    this.sortedDirection = sortDirection;
  }

  handleNew() {
    // Placeholder for the New action.
  }

  handleViewAll(event) {
    event.preventDefault();
    // Navigate to the Position object list page, showing the "All" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Position__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All"
      }
    });
  }
}
