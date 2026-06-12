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
  { label: "Date", fieldName: "date", type: "text" },
  { label: "Amount", fieldName: "amount", type: "text" }
];

// Dummy data modelled on the Contributions / payments screenshot.
const DATA = [
  {
    id: "1",
    investment: "DPEG 359, LLC",
    investmentUrl: INVESTMENT_URL,
    date: "12/18/2025",
    amount: "$90,000.00"
  },
  {
    id: "2",
    investment: "DPEG 359, LLC",
    investmentUrl: INVESTMENT_URL,
    date: "02/13/2024",
    amount: "$25,000.00"
  },
  {
    id: "3",
    investment: "DPEG 359, LLC",
    investmentUrl: INVESTMENT_URL,
    date: "02/10/2023",
    amount: "$25,000.00"
  },
  {
    id: "4",
    investment: "DPEG 359, LLC",
    investmentUrl: INVESTMENT_URL,
    date: "09/02/2022",
    amount: "$87,500.00"
  }
];

export default class ContributionInvestingEntity extends LightningElement {
  columns = COLUMNS;
  data = DATA;

  get recordCount() {
    return this.data.length;
  }

  handleNew() {
    // Placeholder for the New action.
  }

  handleViewAll(event) {
    event.preventDefault();
    // Placeholder for the View All action.
  }
}
