import { LightningElement } from "lwc";

const COLUMNS = [
  { label: "Title", fieldName: "title", type: "text" },
  { label: "Description", fieldName: "description", type: "text" },
  { label: "Type", fieldName: "type", type: "text" },
  { label: "Created Date", fieldName: "createdDate", type: "text" }
];

// Total Announcements — a mix of every announcement type.
const DATA = [
  {
    id: "1",
    title: "Q2 Fund Performance Posted",
    description: "Quarterly performance summary is now available in the portal.",
    type: "Performance Report",
    createdDate: "06/02/2026"
  },
  {
    id: "2",
    title: "New Acquisition — Magnolia Crossing",
    description: "DPEG Fund LP opens a new multifamily investment opportunity.",
    type: "Opportunity",
    createdDate: "05/21/2026"
  },
  {
    id: "3",
    title: "Riverside Commerce Park Exit",
    description: "Asset sold above pro forma; distributions to follow.",
    type: "Exit",
    createdDate: "05/09/2026"
  },
  {
    id: "4",
    title: "Annual Investor Gala 2026",
    description: "Join us for the annual investor networking evening.",
    type: "Investor Event",
    createdDate: "04/28/2026"
  },
  {
    id: "5",
    title: "Fund III Mid-Year Update",
    description: "Portfolio metrics and returns review for all LPs.",
    type: "Performance Report",
    createdDate: "04/15/2026"
  }
];

export default class TotalAnnoucementsCom extends LightningElement {
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
