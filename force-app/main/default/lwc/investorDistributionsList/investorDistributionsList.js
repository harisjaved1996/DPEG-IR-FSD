import { LightningElement } from "lwc";

/**
 * investorDistributionsList
 *
 * Presentational child of `c/investorFinancialTabs`. Renders a paginated SLDS
 * data table of investor distributions (Type, Amount, Method, Status). The
 * Status column shows a coloured pill: green for "Completed", amber for
 * "Processing". Data is hardcoded dummy data — no Apex, wire, or LDS — so this
 * bundle stays purely presentational (`isExposed=false`).
 *
 * PAGINATION: client-side slicing, 5 rows per page, with Previous/Next controls
 * and a "Page X of Y" indicator. State is held in `currentPage`.
 *
 * Each row carries a derived `statusClass` so the template binds a class
 * directly (LWC cannot compute classes inline in a `for:each`).
 */
const PAGE_SIZE = 5;

const STATUS_CLASS = {
  Completed: "status-completed",
  Processing: "status-processing"
};

const RAW_DISTRIBUTIONS = [
  { id: "1", type: "Quarterly", amount: "$50K", method: "ACH", status: "Completed" },
  { id: "2", type: "Monthly", amount: "$1M", method: "ACH", status: "Completed" },
  { id: "3", type: "Quarterly", amount: "$2.5M", method: "ACH", status: "Processing" },
  { id: "4", type: "Monthly", amount: "$75K", method: "ACH", status: "Completed" },
  { id: "5", type: "Quarterly", amount: "$3.4M", method: "ACH", status: "Completed" },
  { id: "6", type: "Monthly", amount: "$150K", method: "ACH", status: "Processing" },
  { id: "7", type: "Quarterly", amount: "$800K", method: "ACH", status: "Completed" },
  { id: "8", type: "Monthly", amount: "$1.2M", method: "ACH", status: "Completed" },
  { id: "9", type: "Quarterly", amount: "$500K", method: "ACH", status: "Processing" },
  { id: "10", type: "Monthly", amount: "$4.1M", method: "ACH", status: "Completed" },
  { id: "11", type: "Quarterly", amount: "$90K", method: "ACH", status: "Completed" },
  { id: "12", type: "Monthly", amount: "$2.8M", method: "ACH", status: "Processing" },
  { id: "13", type: "Quarterly", amount: "$350K", method: "ACH", status: "Completed" },
  { id: "14", type: "Monthly", amount: "$600K", method: "ACH", status: "Completed" },
  { id: "15", type: "Quarterly", amount: "$1.7M", method: "ACH", status: "Processing" },
  { id: "16", type: "Monthly", amount: "$250K", method: "ACH", status: "Completed" },
  { id: "17", type: "Quarterly", amount: "$5.2M", method: "ACH", status: "Completed" },
  { id: "18", type: "Monthly", amount: "$120K", method: "ACH", status: "Processing" },
  { id: "19", type: "Quarterly", amount: "$3M", method: "ACH", status: "Completed" },
  { id: "20", type: "Monthly", amount: "$450K", method: "ACH", status: "Completed" }
];

export default class InvestorDistributionsList extends LightningElement {
  records = RAW_DISTRIBUTIONS.map((row) => ({
    ...row,
    statusClass: STATUS_CLASS[row.status] || "status-processing"
  }));
  pageSize = PAGE_SIZE;
  currentPage = 1;

  /** Records to display for the current page. */
  get pagedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.records.slice(start, start + this.pageSize);
  }

  /** Total number of pages (minimum 1). */
  get totalPages() {
    return Math.max(1, Math.ceil(this.records.length / this.pageSize));
  }

  /** True when the Previous button should be disabled. */
  get isFirstPage() {
    return this.currentPage <= 1;
  }

  /** True when the Next button should be disabled. */
  get isLastPage() {
    return this.currentPage >= this.totalPages;
  }

  handlePrevious() {
    if (!this.isFirstPage) {
      this.currentPage -= 1;
    }
  }

  handleNext() {
    if (!this.isLastPage) {
      this.currentPage += 1;
    }
  }
}
