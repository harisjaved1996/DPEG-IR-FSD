import { LightningElement } from "lwc";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

const COLUMNS = [
  {
    label: "Commitment Number",
    fieldName: "commitmentUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "commitmentNumber" },
      target: "_self"
    }
  },
  { label: "Commitment Date", fieldName: "commitmentDate", type: "text" },
  { label: "Committed Amount", fieldName: "committedAmount", type: "text" },
  {
    label: "Contact",
    fieldName: "contactUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "contact" }, target: "_self" }
  },
  { label: "Investing Entity", fieldName: "investingEntity", type: "text" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    commitmentNumber: "CMT-0001",
    commitmentUrl: "#",
    commitmentDate: "05/11/2025",
    committedAmount: "$200,000.00",
    contact: "A. Greentree",
    contactUrl: "#",
    investingEntity: "18825 Sea, LLC"
  },
  {
    id: "2",
    commitmentNumber: "CMT-0002",
    commitmentUrl: "#",
    commitmentDate: "12/11/2025",
    committedAmount: "$100,000.00",
    contact: "R. Thompson",
    contactUrl: "#",
    investingEntity: "1988 Venture LLC"
  },
  {
    id: "3",
    commitmentNumber: "CMT-0003",
    commitmentUrl: "#",
    commitmentDate: "28/10/2025",
    committedAmount: "$500,000.00",
    contact: "P. Sharma",
    contactUrl: "#",
    investingEntity: "24 Seven REH, LLC"
  }
];

export default class CommitmentsOfferingCom extends LightningElement {
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
    const { commitmentNumber } = event.detail.row;
    // Placeholder: handle `name` (edit/delete) for `commitmentNumber`.
    return { name, commitmentNumber };
  }
}
