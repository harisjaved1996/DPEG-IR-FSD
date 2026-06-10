import { LightningElement, track } from "lwc";

const PAGE_SIZE = 10;

const CLOSED_DATA = [
  {
    id: "c1",
    name: "Legacy Tower Corp",
    gpEntity: "DPEG GP I LLC",
    committed: "$4.2M",
    contributed: "$4.2M",
    distributed: "$6.8M",
    targetIrr: "14%",
    holdPeriod: "4 Years"
  },
  {
    id: "c2",
    name: "Pacific Rim REIT",
    gpEntity: "DPEG GP II LLC",
    committed: "$18.0M",
    contributed: "$18.0M",
    distributed: "$28.5M",
    targetIrr: "16%",
    holdPeriod: "6 Years"
  },
  {
    id: "c3",
    name: "Brookfield Office Park",
    gpEntity: "DPEG GP III LLC",
    committed: "$6.5M",
    contributed: "$6.5M",
    distributed: "$9.1M",
    targetIrr: "13%",
    holdPeriod: "5 Years"
  },
  {
    id: "c4",
    name: "Magnolia Retail Center",
    gpEntity: "DPEG GP I LLC",
    committed: "$3.0M",
    contributed: "$3.0M",
    distributed: "$4.2M",
    targetIrr: "11%",
    holdPeriod: "3 Years"
  },
  {
    id: "c5",
    name: "Ironwood Capital Fund",
    gpEntity: "DPEG GP II LLC",
    committed: "$22.0M",
    contributed: "$22.0M",
    distributed: "$35.0M",
    targetIrr: "18%",
    holdPeriod: "7 Years"
  },
  {
    id: "c6",
    name: "Ridgeline Industrial, LLC",
    gpEntity: "DPEG GP III LLC",
    committed: "$7.8M",
    contributed: "$7.5M",
    distributed: "$11.2M",
    targetIrr: "15%",
    holdPeriod: "5 Years"
  },
  {
    id: "c7",
    name: "Suncoast Apartments",
    gpEntity: "DPEG GP I LLC",
    committed: "$5.1M",
    contributed: "$5.1M",
    distributed: "$7.4M",
    targetIrr: "12%",
    holdPeriod: "4 Years"
  },
  {
    id: "c8",
    name: "Grandview Commons",
    gpEntity: "DPEG GP II LLC",
    committed: "$9.0M",
    contributed: "$9.0M",
    distributed: "$13.5M",
    targetIrr: "17%",
    holdPeriod: "6 Years"
  },
  {
    id: "c9",
    name: "Emerald Bay Holdings",
    gpEntity: "DPEG GP III LLC",
    committed: "$11.5M",
    contributed: "$11.0M",
    distributed: "$16.8M",
    targetIrr: "14%",
    holdPeriod: "5 Years"
  },
  {
    id: "c10",
    name: "Cornerstone Mixed Use",
    gpEntity: "DPEG GP I LLC",
    committed: "$4.4M",
    contributed: "$4.4M",
    distributed: "$6.0M",
    targetIrr: "13%",
    holdPeriod: "4 Years"
  },
  {
    id: "c11",
    name: "Timberline Logistics Park",
    gpEntity: "DPEG GP II LLC",
    committed: "$14.0M",
    contributed: "$13.5M",
    distributed: "$20.1M",
    targetIrr: "16%",
    holdPeriod: "6 Years"
  },
  {
    id: "c12",
    name: "Harbor Heights Residences",
    gpEntity: "DPEG GP III LLC",
    committed: "$8.3M",
    contributed: "$8.3M",
    distributed: "$11.9M",
    targetIrr: "15%",
    holdPeriod: "5 Years"
  },
  {
    id: "c13",
    name: "Bluewater Office Complex",
    gpEntity: "DPEG GP I LLC",
    committed: "$6.0M",
    contributed: "$6.0M",
    distributed: "$8.4M",
    targetIrr: "12%",
    holdPeriod: "4 Years"
  },
  {
    id: "c14",
    name: "Crestview Partners, LLC",
    gpEntity: "DPEG GP II LLC",
    committed: "$10.2M",
    contributed: "$10.2M",
    distributed: "$15.6M",
    targetIrr: "19%",
    holdPeriod: "7 Years"
  },
  {
    id: "c15",
    name: "Maplewood Town Center",
    gpEntity: "DPEG GP III LLC",
    committed: "$5.6M",
    contributed: "$5.6M",
    distributed: "$7.8M",
    targetIrr: "13%",
    holdPeriod: "4 Years"
  }
];

export default class ClosedInvestmentListingChild extends LightningElement {
  @track searchTerm = "";
  @track currentPage = 1;

  get filteredData() {
    const term = this.searchTerm.toLowerCase();
    if (!term) return CLOSED_DATA;
    return CLOSED_DATA.filter((r) => r.name.toLowerCase().includes(term));
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredData.length / PAGE_SIZE));
  }

  get paginatedData() {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredData.slice(start, start + PAGE_SIZE).map((row) => ({
      ...row,
      distributedDisplay: row.distributed || "—",
      distributedClass: row.distributed ? "td-teal td-right" : "td-dash td-right"
    }));
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => ({
      number: i + 1,
      cssClass: i + 1 === this.currentPage ? "page-btn page-active" : "page-btn"
    }));
  }

  get prevDisabled() {
    return this.currentPage <= 1;
  }

  get nextDisabled() {
    return this.currentPage >= this.totalPages;
  }

  get isEmpty() {
    return this.paginatedData.length === 0;
  }

  handleSearch(event) {
    this.searchTerm = event.detail.value;
    this.currentPage = 1;
  }

  handlePageClick(event) {
    this.currentPage = parseInt(event.currentTarget.dataset.page, 10);
  }

  handlePrev() {
    if (!this.prevDisabled) this.currentPage -= 1;
  }

  handleNext() {
    if (!this.nextDisabled) this.currentPage += 1;
  }
}
