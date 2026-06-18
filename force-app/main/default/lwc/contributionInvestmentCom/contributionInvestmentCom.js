import { LightningElement } from "lwc";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

// Each row links to its Contribution and Investing Entity record pages. In real
// data every row would carry its own record URLs; the demo rows share one each.
const CONTRIBUTION_URL = "/lightning/r/Unison__Contribution__c/a01FW004UbmvfeuYIA/view";
const INVESTING_ENTITY_URL = "/lightning/r/Unison__Investing_Entity__c/a0LFW0032uqkigG2AQ/view";

const COLUMNS = [
  {
    label: "Contribution Number",
    fieldName: "contributionUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "contributionNumber" },
      target: "_self"
    }
  },
  {
    label: "Investing Entity",
    fieldName: "entityUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "name" }, target: "_self" }
  },
  { label: "Amount", fieldName: "amount", type: "text" },
  { label: "Contribution Date", fieldName: "contributionDate", type: "text" },
  { label: "Payment Details", fieldName: "paymentDetails", type: "text" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    contributionNumber: "Cont - 008",
    contributionUrl: CONTRIBUTION_URL,
    name: "12830 Oak Village Dr, LLC",
    entityUrl: INVESTING_ENTITY_URL,
    amount: "$5000",
    contributionDate: "03/14/2026",
    paymentDetails: "Full"
  },
  {
    id: "2",
    contributionNumber: "Cont - 009",
    contributionUrl: CONTRIBUTION_URL,
    name: "18825 Sea, LLC",
    entityUrl: INVESTING_ENTITY_URL,
    amount: "$9500",
    contributionDate: "02/08/2026",
    paymentDetails: "Partial"
  },
  {
    id: "3",
    contributionNumber: "Cont - 010",
    contributionUrl: CONTRIBUTION_URL,
    name: "1988 Venture LLC",
    entityUrl: INVESTING_ENTITY_URL,
    amount: "$12000",
    contributionDate: "01/22/2026",
    paymentDetails: "Full"
  }
];

export default class ContributionInvestmentCom extends LightningElement {
  columns = COLUMNS;
  data = DATA;

  get recordCount() {
    return this.data.length;
  }

  handleViewAll(event) {
    event.preventDefault();
    // Placeholder for the View All action.
  }

  handleRowAction(event) {
    const { name } = event.detail.action;
    const { name: entityName } = event.detail.row;
    // Placeholder: handle `name` (edit/delete) for `entityName`.
    return { name, entityName };
  }
}
