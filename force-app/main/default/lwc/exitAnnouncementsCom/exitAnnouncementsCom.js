import { LightningElement } from "lwc";

const COLUMNS = [
  { label: "Title", fieldName: "title", type: "text" },
  { label: "Description", fieldName: "description", type: "text" },
  { label: "Investment", fieldName: "investment", type: "text" },
  { label: "Type", fieldName: "type", type: "text" },
  { label: "Created Date", fieldName: "createdDate", type: "text" }
];

// Exit announcements only.
const DATA = [
  {
    id: "1",
    title: "Riverside Commerce Park Sold",
    description: "Disposition closed; final distribution scheduled.",
    investment: "Riverside Commerce Park",
    type: "Exit",
    createdDate: "06/05/2026"
  },
  {
    id: "2",
    title: "Legacy Tower Exit Complete",
    description: "Asset realized at a 1.9x equity multiple.",
    investment: "Legacy Tower Corp",
    type: "Exit",
    createdDate: "05/19/2026"
  },
  {
    id: "3",
    title: "Pacific Rim REIT Wind-Down",
    description: "Fund position fully exited and proceeds returned.",
    investment: "Pacific Rim REIT",
    type: "Exit",
    createdDate: "05/02/2026"
  },
  {
    id: "4",
    title: "Magnolia Retail Center Sale",
    description: "Sale completed ahead of the projected hold period.",
    investment: "Magnolia Retail Center",
    type: "Exit",
    createdDate: "04/20/2026"
  },
  {
    id: "5",
    title: "Ironwood Capital Fund Closed",
    description: "Final close-out distribution issued to all LPs.",
    investment: "Ironwood Capital Fund",
    type: "Exit",
    createdDate: "04/06/2026"
  }
];

export default class ExitAnnouncementsCom extends LightningElement {
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
