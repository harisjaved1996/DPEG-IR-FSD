import { LightningElement } from "lwc";

const COLUMNS = [
  { label: "Title", fieldName: "title", type: "text" },
  { label: "Description", fieldName: "description", type: "text" },
  { label: "Offering", fieldName: "offering", type: "text" },
  { label: "Type", fieldName: "type", type: "text" },
  { label: "Created Date", fieldName: "createdDate", type: "text" }
];

// Opportunity announcements only.
const DATA = [
  {
    id: "1",
    title: "Magnolia Crossing — Now Open",
    description: "New multifamily opportunity accepting commitments.",
    offering: "Magnolia Crossing — DPEG Fund LP",
    type: "Opportunity",
    createdDate: "06/08/2026"
  },
  {
    id: "2",
    title: "Westpark Retail Center",
    description: "Value-add retail acquisition in the Houston metro.",
    offering: "Westpark Entrepreneurs, LLC",
    type: "Opportunity",
    createdDate: "05/27/2026"
  },
  {
    id: "3",
    title: "Triangle Y-Shops Expansion",
    description: "Follow-on capital raise for the Triangle Y-Shops project.",
    offering: "Triangle Y-Shops, LP",
    type: "Opportunity",
    createdDate: "05/14/2026"
  },
  {
    id: "4",
    title: "Pearland Industrial Park",
    description: "Ground-up industrial development opportunity.",
    offering: "Pearland Entrepreneurs, LLC",
    type: "Opportunity",
    createdDate: "04/30/2026"
  },
  {
    id: "5",
    title: "Fund IV Early Access",
    description: "Priority allocation window open for existing investors.",
    offering: "Parkwest Y Shops, LLC",
    type: "Opportunity",
    createdDate: "04/11/2026"
  }
];

export default class OpportunityAnnouncementsCom extends LightningElement {
  columns = COLUMNS;
  data = DATA;

  get rows() {
    return this.data;
  }

  handleViewAll(event) {
    event.preventDefault();
    // Placeholder for the View All action.
  }
}
