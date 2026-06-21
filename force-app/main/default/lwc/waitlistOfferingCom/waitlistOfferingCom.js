import { LightningElement } from "lwc";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

// Demo links — every row points to one Waitlist / Contact / Investing Entity record.
const WAITLIST_URL = "/lightning/r/Unison__Waitlist__c/a0HFW0003OEiSWS2Q3/view";
const CONTACT_URL = "/lightning/r/Contact/003FW004msa80XgYAI/view";
const INVESTING_ENTITY_URL = "/lightning/r/Unison__Investing_Entity__c/a0LFW0032uqkigG2AQ/view";

const COLUMNS = [
  {
    label: "Waitlist Number",
    fieldName: "waitlistUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "waitlistNumber" }, target: "_self" }
  },
  {
    label: "Contact",
    fieldName: "contactUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "contact" }, target: "_self" }
  },
  {
    label: "Investing Entity",
    fieldName: "investingEntityUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "investingEntity" }, target: "_self" }
  },
  {
    label: "Share Count",
    fieldName: "shareCount",
    type: "number",
    cellAttributes: { alignment: "left" }
  },
  { label: "Amount", fieldName: "amount", type: "text" },
  { label: "Date", fieldName: "date", type: "text" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    waitlistNumber: "WL-001",
    waitlistUrl: WAITLIST_URL,
    contact: "K. Mehta",
    contactUrl: CONTACT_URL,
    investingEntity: "24 Seven REH, LLC",
    investingEntityUrl: INVESTING_ENTITY_URL,
    shareCount: 2,
    amount: "$250,000.00",
    date: "14/11/2025"
  },
  {
    id: "2",
    waitlistNumber: "WL-002",
    waitlistUrl: WAITLIST_URL,
    contact: "Albert Stein",
    contactUrl: CONTACT_URL,
    investingEntity: "5As Capital Group LLC",
    investingEntityUrl: INVESTING_ENTITY_URL,
    shareCount: 3,
    amount: "$400,000.00",
    date: "02/12/2025"
  },
  {
    id: "3",
    waitlistNumber: "WL-003",
    waitlistUrl: WAITLIST_URL,
    contact: "L. Brooks",
    contactUrl: CONTACT_URL,
    investingEntity: "18825 Sea, LLC",
    investingEntityUrl: INVESTING_ENTITY_URL,
    shareCount: 1,
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
