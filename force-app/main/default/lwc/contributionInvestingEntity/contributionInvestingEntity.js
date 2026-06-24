import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";

// Dummy record URLs used for the linked columns.
const INVESTMENT_URL = "/lightning/r/Unison__Investment__c/a08FW003rCMBVNoYQP/view";
const CONTRIBUTION_URL = "/lightning/r/Unison__Contribution__c/a01FW004UbmvfeuYIA/view";

const COLUMNS = [
  {
    label: "Contribution Number",
    fieldName: "contributionUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "contributionNumber" },
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
  { label: "Date", fieldName: "date", type: "text", cellAttributes: { alignment: "left" } },
  { label: "Amount", fieldName: "amount", type: "text", cellAttributes: { alignment: "left" } }
];

// Dummy data modelled on the Contributions / payments screenshot.
const DATA = [
  {
    id: "1",
    contributionNumber: "Con - 0001",
    contributionUrl: CONTRIBUTION_URL,
    investment: "DPEG 359, LLC",
    investmentUrl: INVESTMENT_URL,
    date: "12/18/2025",
    amount: "$90,000.00"
  },
  {
    id: "2",
    contributionNumber: "Con - 0002",
    contributionUrl: CONTRIBUTION_URL,
    investment: "DPEG 359, LLC",
    investmentUrl: INVESTMENT_URL,
    date: "02/13/2024",
    amount: "$25,000.00"
  },
  {
    id: "3",
    contributionNumber: "Con - 0003",
    contributionUrl: CONTRIBUTION_URL,
    investment: "DPEG 359, LLC",
    investmentUrl: INVESTMENT_URL,
    date: "02/10/2023",
    amount: "$25,000.00"
  },
  {
    id: "4",
    contributionNumber: "Con - 0004",
    contributionUrl: CONTRIBUTION_URL,
    investment: "DPEG 359, LLC",
    investmentUrl: INVESTMENT_URL,
    date: "09/02/2022",
    amount: "$87,500.00"
  }
];

export default class ContributionInvestingEntity extends NavigationMixin(LightningElement) {
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
    // Navigate to the Contribution object list page, showing the "All" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Contribution__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All"
      }
    });
  }
}
