import { LightningElement } from "lwc";

const COLUMNS = [
  {
    label: "Investing Entity",
    fieldName: "entityUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "entity" }, target: "_self" },
    sortable: true
  },
  { label: "Ownership", fieldName: "ownership", type: "text", sortable: true },
  { label: "Contributed", fieldName: "contributed", type: "text", sortable: true },
  { label: "Distributed", fieldName: "distributed", type: "text", sortable: true }
];

const DATA = [
  {
    id: "1",
    entity: "1988 Venture LLC",
    entityUrl: "#",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "2",
    entity: "3D Way, LLC",
    entityUrl: "#",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "3",
    entity: "5As Capital Group LLC",
    entityUrl: "#",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "4",
    entity: "A&S Meghjiani Investments, LLC",
    entityUrl: "#",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "5",
    entity: "Aamir Pirani and Nisha Pirani",
    entityUrl: "#",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "6",
    entity: "AANA LLC",
    entityUrl: "#",
    ownership: "0.1000%",
    contributed: "$50,000.00",
    distributed: "$2,500.02"
  }
];

export default class PositionInvestments extends LightningElement {
  columns = COLUMNS;
  data = DATA;
  sortedBy = "entityUrl";
  sortedDirection = "asc";

  get recordCount() {
    return this.data.length;
  }

  handleSort(event) {
    const { fieldName, sortDirection } = event.detail;
    const key = fieldName === "entityUrl" ? "entity" : fieldName;
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
    // Placeholder for the View All action.
  }
}
