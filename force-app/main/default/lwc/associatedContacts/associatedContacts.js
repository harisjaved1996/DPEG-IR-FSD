import { LightningElement } from "lwc";

const COLUMNS = [
  { label: "Name", fieldName: "name", type: "text" },
  { label: "Email", fieldName: "email", type: "email" },
  { label: "Phone", fieldName: "phone", type: "phone" },
  { label: "Primary", fieldName: "primary", type: "text" }
];

// Dummy data modelled on the Associated Contacts screenshot.
const DATA = [
  {
    id: "1",
    name: "Taj Merchant",
    email: "merchanttaj@yahoo.com",
    phone: "(832) 875-1702",
    primary: "Yes"
  },
  {
    id: "2",
    name: "A. Greentree",
    email: "a.greentree@greentreellc.com",
    phone: "(713) 555-0148",
    primary: "No"
  },
  {
    id: "3",
    name: "Sarah Lin",
    email: "sarah.lin@greentreellc.com",
    phone: "(281) 555-0092",
    primary: "No"
  }
];

export default class AssociatedContacts extends LightningElement {
  columns = COLUMNS;
  data = DATA;

  get recordCount() {
    return this.data.length;
  }

  handleNew() {
    // Placeholder for the Add Contact action.
  }

  handleViewAll(event) {
    event.preventDefault();
    // Placeholder for the View All action.
  }
}
