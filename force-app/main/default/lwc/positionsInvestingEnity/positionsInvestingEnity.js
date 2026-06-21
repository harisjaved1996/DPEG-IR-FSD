import { LightningElement } from "lwc";

// Dummy record URLs used for the linked columns.
const INVESTMENT_URL = "/lightning/r/Unison__Investment__c/a08FW003rCMBVNoYQP/view";
const POSITION_URL = "/lightning/r/Unison__Position__c/a0MFW000BzmP2ua2IC/view";

const COLUMNS = [
  {
    label: "Position Number",
    fieldName: "positionUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "positionNumber" },
      target: "_self"
    },
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Investment",
    fieldName: "investmentUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "investment" },
      target: "_self"
    },
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Ownership",
    fieldName: "ownership",
    type: "text",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Committed",
    fieldName: "committed",
    type: "text",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Contributed",
    fieldName: "contributed",
    type: "text",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Distributed",
    fieldName: "distributed",
    type: "text",
    cellAttributes: { alignment: "left" }
  }
];

// Dummy data modelled on the Positions screenshot.
const DATA = [
  {
    id: "1",
    positionNumber: "POS - 001",
    positionUrl: POSITION_URL,
    investment: "DPEG 359, LLC",
    investmentUrl: INVESTMENT_URL,
    ownership: "2.5000%",
    committed: "$222,500.00",
    contributed: "$227,500.00",
    distributed: "$0.00"
  },
  {
    id: "2",
    positionNumber: "POS - 002",
    positionUrl: POSITION_URL,
    investment: "DPEG 412, LLC",
    investmentUrl: INVESTMENT_URL,
    ownership: "1.2500%",
    committed: "$100,000.00",
    contributed: "$100,000.00",
    distributed: "$15,000.00"
  },
  {
    id: "3",
    positionNumber: "POS - 003",
    positionUrl: POSITION_URL,
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
