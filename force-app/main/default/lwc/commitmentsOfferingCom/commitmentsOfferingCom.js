import { LightningElement } from "lwc";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

const PILL_BASE =
  "display:inline-flex;align-items:center;padding:0.125rem 0.5rem;border-radius:0.25rem;font-size:0.75rem;font-weight:600;";

// Light, native success-green pill for "Yes"; neutral pill otherwise.
function pillStyle(value) {
  return value === "Yes"
    ? PILL_BASE + "background:#d7f4d3;color:#2e844a;"
    : PILL_BASE + "background:#ecebea;color:#5c5c5c;";
}

// Demo links — every row points to one Contact / Investing Entity record.
const CONTACT_URL = "/lightning/r/Contact/003FW004msa80XgYAI/view";
const INVESTING_ENTITY_URL = "/lightning/r/Unison__Investing_Entity__c/a0LFW0032uqkigG2AQ/view";

const COLUMNS = [
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
  { label: "Commitment Date", fieldName: "commitmentDate", type: "text" },
  { label: "Committed Amount", fieldName: "committedAmount", type: "text" },
  {
    label: "PPM Sent",
    fieldName: "ppmSent",
    type: "pill",
    typeAttributes: { pillStyle: { fieldName: "ppmSentStyle" } }
  },
  {
    label: "PPM Signed",
    fieldName: "ppmSigned",
    type: "pill",
    typeAttributes: { pillStyle: { fieldName: "ppmSignedStyle" } }
  },
  { label: "Funded", fieldName: "funded", type: "boolean" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

// PPM Signed can only be "Yes" when PPM Sent is "Yes".
const DATA = [
  {
    id: "1",
    commitmentNumber: "CMT-0001",
    commitmentUrl: "#",
    commitmentDate: "05/11/2025",
    committedAmount: "$200,000.00",
    contact: "A. Greentree",
    contactUrl: CONTACT_URL,
    investingEntity: "18825 Sea, LLC",
    investingEntityUrl: INVESTING_ENTITY_URL,
    ppmSent: "Yes",
    ppmSigned: "Yes"
  },
  {
    id: "2",
    commitmentNumber: "CMT-0002",
    commitmentUrl: "#",
    commitmentDate: "12/11/2025",
    committedAmount: "$100,000.00",
    contact: "R. Thompson",
    contactUrl: CONTACT_URL,
    investingEntity: "1988 Venture LLC",
    investingEntityUrl: INVESTING_ENTITY_URL,
    ppmSent: "Yes",
    ppmSigned: "No"
  },
  {
    id: "3",
    commitmentNumber: "CMT-0003",
    commitmentUrl: "#",
    commitmentDate: "28/10/2025",
    committedAmount: "$500,000.00",
    contact: "P. Sharma",
    contactUrl: CONTACT_URL,
    investingEntity: "24 Seven REH, LLC",
    investingEntityUrl: INVESTING_ENTITY_URL,
    ppmSent: "No",
    ppmSigned: "No"
  }
];

const MEMBERSHIP_OPTIONS = [
  { label: "General Partner", value: "General Partner" },
  { label: "Limited Partner", value: "Limited Partner" },
  { label: "Member", value: "Member" },
  { label: "Manager", value: "Manager" }
];

export default class CommitmentsOfferingCom extends LightningElement {
  columns = COLUMNS;
  data = DATA.map((row) => ({
    ...row,
    funded: true,
    ppmSentStyle: pillStyle(row.ppmSent),
    ppmSignedStyle: pillStyle(row.ppmSigned)
  }));

  membershipOptions = MEMBERSHIP_OPTIONS;

  // Add Prospect modal state
  showModal = false;
  prospectContact = null;
  prospectEntity = null;
  committedAmount = null;
  commitmentDate = null;
  membership = null;

  get recordCount() {
    return this.data.length;
  }

  handleNew() {
    this.resetForm();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  handleContactChange(event) {
    this.prospectContact = event.detail.recordId;
  }

  handleEntityChange(event) {
    this.prospectEntity = event.detail.recordId;
  }

  handleAmountChange(event) {
    this.committedAmount = event.detail.value;
  }

  handleDateChange(event) {
    this.commitmentDate = event.detail.value;
  }

  handleMembershipChange(event) {
    this.membership = event.detail.value;
  }

  handleSave() {
    // Placeholder: persist the new prospect here.
    this.closeModal();
  }

  resetForm() {
    this.prospectContact = null;
    this.prospectEntity = null;
    this.committedAmount = null;
    this.commitmentDate = null;
    this.membership = null;
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
