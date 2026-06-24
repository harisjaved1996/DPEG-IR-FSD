import { LightningElement } from "lwc";

const COLUMNS = [
  { label: "Title", fieldName: "title", type: "text" },
  { label: "Description", fieldName: "description", type: "text" },
  { label: "Type", fieldName: "type", type: "text" },
  { label: "Created Date", fieldName: "createdDate", type: "text" }
];

// Investor Event announcements only.
const DATA = [
  {
    id: "1",
    title: "Annual Investor Gala 2026",
    description: "Evening of networking and a portfolio outlook keynote.",
    type: "Investor Event",
    createdDate: "06/01/2026"
  },
  {
    id: "2",
    title: "Q2 Earnings Webinar",
    description: "Live walkthrough of quarterly results with the IR team.",
    type: "Investor Event",
    createdDate: "05/18/2026"
  },
  {
    id: "3",
    title: "Property Tour — Magnolia Crossing",
    description: "On-site tour for prospective and current investors.",
    type: "Investor Event",
    createdDate: "05/04/2026"
  },
  {
    id: "4",
    title: "Tax Planning Roundtable",
    description: "K-1 and year-end tax planning discussion for LPs.",
    type: "Investor Event",
    createdDate: "04/24/2026"
  },
  {
    id: "5",
    title: "Fund IV Launch Reception",
    description: "Introductory reception for the upcoming Fund IV offering.",
    type: "Investor Event",
    createdDate: "04/09/2026"
  }
];

export default class InvestorEventAnnouncementsCom extends LightningElement {
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
