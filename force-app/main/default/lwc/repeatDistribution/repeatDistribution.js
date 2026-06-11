import { LightningElement, api } from "lwc";

// Same paid-status value always maps to the same pill style.
const STATUS_BADGE = {
  PAID: "badge badge-green",
  UNPAID: "badge badge-gray",
  Paid: "badge badge-green",
  Unpaid: "badge badge-gray"
};

const DISTRIBUTIONS = [
  {
    id: "1",
    date: "11/21/25",
    effectiveDate: "11/21/25",
    period: "Q4 2025",
    description: "IDV MUD REIMBURSEMENT",
    source: "Cash Flow",
    paidStatus: "PAID",
    type: "Other",
    amount: 4800000
  },
  {
    id: "2",
    date: "09/15/25",
    effectiveDate: "09/15/25",
    period: "Q3 2025",
    description: "Quarterly Cash Distribution",
    source: "Cash Flow",
    paidStatus: "PAID",
    type: "Preferred Return",
    amount: 1250000
  },
  {
    id: "3",
    date: "06/30/25",
    effectiveDate: "07/01/25",
    period: "Q2 2025",
    description: "Sale Proceeds Distribution",
    source: "Sale of Property",
    paidStatus: "UNPAID",
    type: "Return of Capital",
    amount: 2000000
  }
];

export default class RepeatDistribution extends LightningElement {
  // Provided automatically when launched as a record quick action.
  @api recordId;
  @api objectApiName;

  // When supplied by a parent, these rows are shown instead of the defaults.
  @api records;

  get rows() {
    const source =
      this.records && this.records.length
        ? this.records
        : DISTRIBUTIONS.filter((row) => row.paidStatus === "PAID");
    return source.map((row) => ({
      ...row,
      statusBadge: STATUS_BADGE[row.paidStatus] || "badge badge-gray"
    }));
  }

  handleVerify() {
    // Placeholder for the Verify action.
  }
}
