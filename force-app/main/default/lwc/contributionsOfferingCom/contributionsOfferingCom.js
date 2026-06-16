import { LightningElement } from "lwc";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

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
    label: "Contact",
    fieldName: "contactUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "contact" }, target: "_self" }
  },
  { label: "Contributed Date", fieldName: "contributedDate", type: "text" },
  { label: "Amount", fieldName: "amount", type: "text" },
  { label: "Investing Entity", fieldName: "investingEntity", type: "text" },
  { label: "Type", fieldName: "type", type: "text" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    contributionNumber: "Con-0001",
    contributionUrl: "#",
    contributedDate: "08/11/2025",
    amount: "$25,000.00",
    contact: "Johnson",
    contactUrl: "#",
    investingEntity: "3D Way, LLC",
    type: "Full"
  },
  {
    id: "2",
    contributionNumber: "Con-0002",
    contributionUrl: "#",
    contributedDate: "21/10/2025",
    amount: "$40,000.00",
    contact: "Albert Stein",
    contactUrl: "#",
    investingEntity: "3DXB LLC",
    type: "Full"
  },
  {
    id: "3",
    contributionNumber: "Con-0003",
    contributionUrl: "#",
    contributedDate: "03/12/2025",
    amount: "$32,000.00",
    contact: "M. Patel",
    contactUrl: "#",
    investingEntity: "5As Capital Group LLC",
    type: "Full"
  }
];

export default class ContributionsOfferingCom extends LightningElement {
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

  handleRowAction(event) {
    const { name } = event.detail.action;
    const { contributionNumber } = event.detail.row;
    // Placeholder: handle `name` (edit/delete) for `contributionNumber`.
    return { name, contributionNumber };
  }
}
