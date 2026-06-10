import { LightningElement } from "lwc";

/**
 * investorContributionsList
 *
 * Presentational child of `c/investorFinancialTabs`. Renders a paginated SLDS
 * data table of investor capital contributions (Date Received, Amount,
 * Investment). Data is hardcoded dummy data — no Apex, wire, or LDS — so this
 * bundle stays purely presentational (`isExposed=false`).
 *
 * PAGINATION: client-side slicing, 5 rows per page, with Previous/Next controls
 * and a "Page X of Y" indicator. State is held in `currentPage`.
 */
const PAGE_SIZE = 5;

const CONTRIBUTIONS = [
  { id: "1", dateReceived: "02 May 2019", amount: "$100K", investment: "10 Katy Developers LLC" },
  { id: "2", dateReceived: "15 Dec 2020", amount: "$9.1M", investment: "Mayde Creek Apartments" },
  { id: "3", dateReceived: "08 Mar 2022", amount: "$50K", investment: "DPEG Bear Creek LP" },
  { id: "4", dateReceived: "21 Jan 2021", amount: "$2.5M", investment: "Garth Developers LLC" },
  { id: "5", dateReceived: "30 Nov 2018", amount: "$750K", investment: "JK Pentix Investment II" },
  { id: "6", dateReceived: "14 Jul 2023", amount: "$1.2M", investment: "Rosenberg Entrepreneurs" },
  { id: "7", dateReceived: "05 Sep 2020", amount: "$300K", investment: "Memorial Entrepreneurs" },
  { id: "8", dateReceived: "27 Feb 2022", amount: "$4.5M", investment: "LK S9 Developers" },
  { id: "9", dateReceived: "11 Oct 2019", amount: "$80K", investment: "Parker Y-Shops LLC" },
  { id: "10", dateReceived: "18 Aug 2021", amount: "$600K", investment: "Dairy Ashford Apts LP" },
  { id: "11", dateReceived: "03 Apr 2022", amount: "$1.8M", investment: "Cullen Beltway Props" },
  { id: "12", dateReceived: "22 Jun 2020", amount: "$250K", investment: "D&M Retail LLC" },
  { id: "13", dateReceived: "09 Dec 2021", amount: "$3.2M", investment: "Peek Entrepreneurs LLC" },
  { id: "14", dateReceived: "16 Mar 2019", amount: "$120K", investment: "Tejas 105 Developers" },
  { id: "15", dateReceived: "25 Jul 2022", amount: "$500K", investment: "DPEG Cottage Green LP" },
  { id: "16", dateReceived: "07 Jan 2023", amount: "$2.1M", investment: "Greenhouse Partners LLC" },
  { id: "17", dateReceived: "13 May 2021", amount: "$75K", investment: "Ella Entrepreneurs LLC" },
  { id: "18", dateReceived: "29 Aug 2020", amount: "$1.5M", investment: "Highway 6 Y-Shops LLC" },
  { id: "19", dateReceived: "04 Nov 2022", amount: "$400K", investment: "Cavalcade S9 Developers" },
  { id: "20", dateReceived: "19 Feb 2019", amount: "$6.7M", investment: "Rankin Developers LLC" }
];

export default class InvestorContributionsList extends LightningElement {
  records = CONTRIBUTIONS.slice().sort(
    (a, b) => new Date(b.dateReceived) - new Date(a.dateReceived)
  );
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
