import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";

// Dummy Contact record URL used for the linked Name column.
const CONTACT_URL = "/lightning/r/Contact/003FW004msa80XgYAI/view";

const COLUMNS = [
  {
    label: "Name",
    fieldName: "nameUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "name" },
      target: "_self"
    },
    cellAttributes: { alignment: "left" }
  },
  { label: "Email", fieldName: "email", type: "text", cellAttributes: { alignment: "left" } },
  { label: "Phone", fieldName: "phone", type: "text", cellAttributes: { alignment: "left" } },
  { label: "Primary", fieldName: "primary", type: "text", cellAttributes: { alignment: "left" } }
];

// Dummy data modelled on the Associated Contacts screenshot.
const DATA = [
  {
    id: "1",
    name: "Taj Merchant",
    nameUrl: CONTACT_URL,
    email: "merchanttaj@yahoo.com",
    phone: "(832) 875-1702",
    primary: "Yes"
  },
  {
    id: "2",
    name: "A. Greentree",
    nameUrl: CONTACT_URL,
    email: "a.greentree@greentreellc.com",
    phone: "(713) 555-0148",
    primary: "No"
  },
  {
    id: "3",
    name: "Sarah Lin",
    nameUrl: CONTACT_URL,
    email: "sarah.lin@greentreellc.com",
    phone: "(281) 555-0092",
    primary: "No"
  }
];

export default class AssociatedContacts extends NavigationMixin(LightningElement) {
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
    // Navigate to the Contact object list page, showing the "All Contacts" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Contact",
        actionName: "list"
      },
      state: {
        filterName: "Unison__AllContacts"
      }
    });
  }
}
