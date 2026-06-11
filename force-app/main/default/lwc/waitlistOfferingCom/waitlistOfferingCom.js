import { LightningElement } from "lwc";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

const COLUMNS = [
  {
    label: "Contact",
    fieldName: "contactUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "contact" }, target: "_self" }
  },
  { label: "Investing Entity", fieldName: "investingEntity", type: "text" },
  { label: "Amount", fieldName: "amount", type: "text" },
  { label: "Date", fieldName: "date", type: "text" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    contact: "K. Mehta",
    contactUrl: "#",
    investingEntity: "24 Seven REH, LLC",
    amount: "$250,000.00",
    date: "14/11/2025"
  },
  {
    id: "2",
    contact: "Albert Stein",
    contactUrl: "#",
    investingEntity: "5As Capital Group LLC",
    amount: "$400,000.00",
    date: "02/12/2025"
  },
  {
    id: "3",
    contact: "L. Brooks",
    contactUrl: "#",
    investingEntity: "18825 Sea, LLC",
    amount: "$320,000.00",
    date: "27/10/2025"
  }
];

export default class WaitlistOfferingCom extends LightningElement {
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
    const { contact } = event.detail.row;
    // Placeholder: handle `name` (edit/delete) for `contact`.
    return { name, contact };
  }
}
