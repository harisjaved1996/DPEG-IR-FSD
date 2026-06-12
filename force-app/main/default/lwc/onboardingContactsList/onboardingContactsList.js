import { LightningElement } from "lwc";

// Same status value always maps to the same pill style.
const STATUS_BADGE = {
  Verified: "badge badge-green",
  Pending: "badge badge-orange",
  Duplicate: "badge badge-red"
};

const CONTACTS = [
  {
    id: 1,
    name: "Taj Merchant",
    email: "merchanttaj@yahoo.com",
    address: "1820 Greentree Ln, Houston, TX",
    status: "Verified",
    phone: "(832) 875-1702",
    date: "12/18/2025"
  },
  {
    id: 2,
    name: "A. Greentree",
    email: "a.greentree@greentreellc.com",
    address: "4400 Westpark Dr, Houston, TX",
    status: "Pending",
    phone: "(713) 555-0148",
    date: "11/02/2025"
  },
  {
    id: 3,
    name: "Sarah Lin",
    email: "sarah.lin@parkwest.com",
    address: "9001 Pearland Pkwy, Pearland, TX",
    status: "Duplicate",
    phone: "(281) 555-0092",
    date: "10/14/2025"
  },
  {
    id: 4,
    name: "Marcus Webb",
    email: "marcus.webb@triangle.com",
    address: "250 Triangle Blvd, Austin, TX",
    status: "Verified",
    phone: "(512) 555-0231",
    date: "09/27/2025"
  },
  {
    id: 5,
    name: "Elena Ruiz",
    email: "elena.ruiz@williamsway.com",
    address: "77 Williams Way, Dallas, TX",
    status: "Pending",
    phone: "(469) 555-0177",
    date: "09/03/2025"
  },
  {
    id: 6,
    name: "David Okafor",
    email: "d.okafor@parkwestyshops.com",
    address: "1200 Parkwest Ave, Katy, TX",
    status: "Duplicate",
    phone: "(832) 555-0310",
    date: "08/19/2025"
  }
];

// Parse an MM/DD/YYYY string into a sortable timestamp.
function parseDate(value) {
  const [month, day, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day).getTime();
}

export default class OnboardingContactsList extends LightningElement {
  contacts = CONTACTS;

  // Rows ordered by date, latest first.
  get rows() {
    return [...this.contacts]
      .sort((a, b) => parseDate(b.date) - parseDate(a.date))
      .map((row) => ({
        ...row,
        badgeCss: STATUS_BADGE[row.status] || "badge badge-gray"
      }));
  }
}
