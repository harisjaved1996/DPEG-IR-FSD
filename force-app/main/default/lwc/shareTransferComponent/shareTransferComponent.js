import { LightningElement } from "lwc";

const PILL_BASE =
  "display:inline-flex;align-items:center;padding:0.125rem 0.5rem;border-radius:999px;font-size:0.75rem;font-weight:600;";

// Same status value always maps to the same pill style.
const STATUS_PILL = {
  "Pending e-sig": PILL_BASE + "background:#dbeafe;color:#1d6fc4;",
  "IR Approval": PILL_BASE + "background:#fff0e0;color:#c05e00;",
  Completed: PILL_BASE + "background:#dcfce7;color:#166534;"
};

const COLUMNS = [
  { label: "ID", fieldName: "id", type: "text" },
  { label: "From", fieldName: "from", type: "text" },
  { label: "To", fieldName: "to", type: "text" },
  { label: "Units", fieldName: "units", type: "text" },
  { label: "Amount", fieldName: "amount", type: "text" },
  {
    label: "Status",
    fieldName: "status",
    type: "pill",
    typeAttributes: { pillStyle: { fieldName: "statusStyle" } }
  },
  { label: "Date", fieldName: "date", type: "text" }
];

const TRANSFERS = [
  {
    id: "ST-012",
    from: "18825 Sea, LLC",
    to: "1988 Venture LLC",
    units: "2",
    amount: "$125K",
    status: "Pending e-sig",
    date: "Apr 18 2025"
  },
  {
    id: "ST-011",
    from: "24 Seven Entrepreneurs LLC",
    to: "24 Seven REH, LLC",
    units: "1",
    amount: "$250K",
    status: "IR Approval",
    date: "Apr 14 2025"
  },
  {
    id: "ST-010",
    from: "3Bet Holdings LLC",
    to: "3D Way, LLC",
    units: "3",
    amount: "$50K",
    status: "Completed",
    date: "Mar 02 2026"
  }
];

export default class ShareTransferComponent extends LightningElement {
  columns = COLUMNS;

  rows = TRANSFERS.map((row) => ({
    ...row,
    statusStyle: STATUS_PILL[row.status] || PILL_BASE + "background:#ecebea;color:#5c5c5c;"
  }));

  get recordCount() {
    return this.rows.length;
  }

  handleViewAll(event) {
    event.preventDefault();
    // Placeholder for the View All action.
  }
}
