import { LightningElement } from "lwc";

// Same status value always maps to the same pill colour.
const STATUS_VARIANT = {
  New: "blue",
  "Under Review": "orange"
};

// Each Name links to its Lead record page. In real data every row would carry
// its own record URL; the demo rows share one sample Lead record.
const LEAD_RECORD_URL = "/lightning/r/Lead/00QFW003AVYXACC2Y5/view";

const CONTACTS = [
  {
    id: 1,
    name: "Taj Merchant",
    email: "merchanttaj@yahoo.com",
    address: "1820 Greentree Ln, Houston, TX",
    status: "New",
    phone: "(832) 875-1702",
    date: "12/18/2025",
    source: "Email"
  },
  {
    id: 2,
    name: "A. Greentree",
    email: "a.greentree@greentreellc.com",
    address: "4400 Westpark Dr, Houston, TX",
    status: "Under Review",
    phone: "(713) 555-0148",
    date: "11/02/2025",
    source: "Web"
  },
  {
    id: 3,
    name: "Sarah Lin",
    email: "sarah.lin@parkwest.com",
    address: "9001 Pearland Pkwy, Pearland, TX",
    status: "Under Review",
    phone: "(281) 555-0092",
    date: "10/14/2025",
    source: "Email"
  },
  {
    id: 4,
    name: "Marcus Webb",
    email: "marcus.webb@triangle.com",
    address: "250 Triangle Blvd, Austin, TX",
    status: "New",
    phone: "(512) 555-0231",
    date: "09/27/2025",
    source: "Web"
  },
  {
    id: 5,
    name: "Elena Ruiz",
    email: "elena.ruiz@williamsway.com",
    address: "77 Williams Way, Dallas, TX",
    status: "Under Review",
    phone: "(469) 555-0177",
    date: "09/03/2025",
    source: "Email"
  },
  {
    id: 6,
    name: "David Okafor",
    email: "d.okafor@parkwestyshops.com",
    address: "1200 Parkwest Ave, Katy, TX",
    status: "New",
    phone: "(832) 555-0310",
    date: "08/19/2025",
    source: "Web"
  }
];

// Parse an MM/DD/YYYY string into a sortable timestamp.
function parseDate(value) {
  const [month, day, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day).getTime();
}

const COLUMNS = [
  {
    label: "Name",
    fieldName: "recordUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "name" }, target: "_self" }
  },
  { label: "Email", fieldName: "email", type: "text" },
  { label: "Source", fieldName: "source", type: "text" },
  { label: "Address", fieldName: "address", type: "text" },
  {
    label: "Status",
    fieldName: "status",
    type: "pill",
    typeAttributes: { variant: { fieldName: "statusVariant" } }
  },
  { label: "Phone", fieldName: "phone", type: "text" },
  { label: "Date", fieldName: "date", type: "text" }
];

export default class OnboardingContactsList extends LightningElement {
  columns = COLUMNS;
  contacts = CONTACTS;

  // Rows ordered by date, latest first.
  get rows() {
    return [...this.contacts]
      .sort((a, b) => parseDate(b.date) - parseDate(a.date))
      .map((row) => ({
        ...row,
        statusVariant: STATUS_VARIANT[row.status] || "gray",
        recordUrl: LEAD_RECORD_URL
      }));
  }

  get recordCount() {
    return this.contacts.length;
  }

  handleViewAll(event) {
    event.preventDefault();
    // Placeholder for the View All action.
  }
}
