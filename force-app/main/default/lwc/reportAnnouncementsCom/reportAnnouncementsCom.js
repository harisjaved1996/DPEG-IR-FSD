import { LightningElement } from "lwc";

const COLUMNS = [
  { label: "Title", fieldName: "title", type: "text" },
  { label: "Description", fieldName: "description", type: "text" },
  { label: "Investment", fieldName: "investment", type: "text" },
  { label: "Type", fieldName: "type", type: "text" },
  { label: "Created Date", fieldName: "createdDate", type: "text" }
];

// Performance Report announcements only.
const DATA = [
  {
    id: "1",
    title: "Q2 2026 Performance Report",
    description: "Comprehensive quarterly returns across all active funds.",
    investment: "DPEG 359, LLC",
    type: "Performance Report",
    createdDate: "06/10/2026"
  },
  {
    id: "2",
    title: "Fund I Annual Review",
    description: "Year-end IRR and equity multiple breakdown for Fund I.",
    investment: "FX Series Fund 1, LP",
    type: "Performance Report",
    createdDate: "05/30/2026"
  },
  {
    id: "3",
    title: "Distribution Yield Summary",
    description: "Trailing twelve-month distribution yield by investment.",
    investment: "Falvel Apartments, LLC",
    type: "Performance Report",
    createdDate: "05/12/2026"
  },
  {
    id: "4",
    title: "Portfolio Occupancy Metrics",
    description: "Occupancy and NOI trends across the multifamily portfolio.",
    investment: "Global Zante, LLC",
    type: "Performance Report",
    createdDate: "04/22/2026"
  },
  {
    id: "5",
    title: "Capital Account Statements Ready",
    description: "Updated capital account statements posted to the portal.",
    investment: "DPEG Zarzamora, LLC",
    type: "Performance Report",
    createdDate: "04/03/2026"
  }
];

export default class ReportAnnouncementsCom extends LightningElement {
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
