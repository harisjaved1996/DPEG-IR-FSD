import { LightningElement } from "lwc";

// Dummy Investment record URL used for the linked Investment column.
const INVESTMENT_URL = "/lightning/r/Unison__Investment__c/a01FW000000DPEG359/view";

const COLUMNS = [
  {
    label: "Investment",
    fieldName: "investmentUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "investment" },
      target: "_self"
    }
  },
  { label: "Ownership", fieldName: "ownership", type: "text" },
  { label: "Committed", fieldName: "committed", type: "text" },
  { label: "Contributed", fieldName: "contributed", type: "text" },
  { label: "Distributed", fieldName: "distributed", type: "text" }
];

// Dummy data modelled on the Positions screenshot.
const DATA = [
  {
    id: "1",
    investment: "DPEG 359, LLC",
    investmentUrl: INVESTMENT_URL,
    ownership: "2.5000%",
    committed: "$222,500.00",
    contributed: "$227,500.00",
    distributed: "$0.00"
  },
  {
    id: "2",
    investment: "DPEG 412, LLC",
    investmentUrl: INVESTMENT_URL,
    ownership: "1.2500%",
    committed: "$100,000.00",
    contributed: "$100,000.00",
    distributed: "$15,000.00"
  },
  {
    id: "3",
    investment: "DPEG 287, LLC",
    investmentUrl: INVESTMENT_URL,
    ownership: "3.0000%",
    committed: "$300,000.00",
    contributed: "$280,000.00",
    distributed: "$45,000.00"
  }
];

export default class PositionsInvestingEnity extends LightningElement {
  columns = COLUMNS;
  data = DATA;

  get recordCount() {
    return this.data.length;
  }

  handleViewAll(event) {
    event.preventDefault();
    // Placeholder for the View All action.
  }
}
