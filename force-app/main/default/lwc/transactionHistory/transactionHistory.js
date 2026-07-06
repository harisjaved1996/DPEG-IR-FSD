import { LightningElement } from "lwc";

const PAGE_SIZE = 7;

const LEFT = { alignment: "left" };

const COLUMNS = [
  {
    label: "Transaction Id",
    fieldName: "transactionId",
    type: "text",
    cellAttributes: LEFT
  },
  { label: "Name", fieldName: "name", type: "text", cellAttributes: LEFT },
  {
    label: "Description",
    fieldName: "description",
    type: "text",
    cellAttributes: LEFT
  },
  {
    label: "Amount",
    fieldName: "amount",
    type: "currency",
    typeAttributes: { currencyCode: "USD" },
    cellAttributes: LEFT
  },
  {
    label: "Date",
    fieldName: "transactionDate",
    type: "date-local",
    cellAttributes: LEFT
  }
];

// Prototype seed data: 30 investor-relations transactions. Intentionally NOT in
// date order - display order is always derived programmatically (date desc).
const TRANSACTIONS = [
  {
    transactionId: "TXN-0001",
    name: "Greentree LLC",
    description: "Amount invested for Magnolia project",
    amount: 750000,
    transactionDate: "2026-01-08"
  },
  {
    transactionId: "TXN-0002",
    name: "Horizon Capital Partners",
    description: "Amount invested for Harborview project",
    amount: 1250000,
    transactionDate: "2026-02-11"
  },
  {
    transactionId: "TXN-0003",
    name: "Silver Oak Holdings",
    description: "Amount invested for Magnolia project",
    amount: 86500,
    transactionDate: "2026-01-15"
  },
  {
    transactionId: "TXN-0004",
    name: "Nadia Rahim",
    description: "Amount invested for Cedar Creek project",
    amount: 50000,
    transactionDate: "2026-03-02"
  },
  {
    transactionId: "TXN-0005",
    name: "Kalani Holdings, LLC",
    description: "Amount invested for Maple Plaza project",
    amount: 340000,
    transactionDate: "2026-04-28"
  },
  {
    transactionId: "TXN-0006",
    name: "Bluewater Equity Group",
    description: "Amount invested for Maple Plaza project",
    amount: 2100000,
    transactionDate: "2026-02-25"
  },
  {
    transactionId: "TXN-0007",
    name: "Noorani Investments LLC",
    description: "Amount invested for Magnolia project",
    amount: 41200,
    transactionDate: "2026-01-31"
  },
  {
    transactionId: "TXN-0008",
    name: "Pickford Square Capital LLC",
    description: "Amount invested for Cedar Creek project",
    amount: 980000,
    transactionDate: "2026-03-17"
  },
  {
    transactionId: "TXN-0009",
    name: "Farhan Dhanani",
    description: "Amount invested for Pinecrest project",
    amount: 125000,
    transactionDate: "2026-05-06"
  },
  {
    transactionId: "TXN-0010",
    name: "Crescent Bay Investments",
    description: "Amount invested for Harborview project",
    amount: 2500000,
    transactionDate: "2026-04-09"
  },
  {
    transactionId: "TXN-0011",
    name: "Amara Siddiqui",
    description: "Amount invested for Magnolia project",
    amount: 18750,
    transactionDate: "2026-04-15"
  },
  {
    transactionId: "TXN-0012",
    name: "Redstone Family Trust",
    description: "Amount invested for Cedar Creek project",
    amount: 460000,
    transactionDate: "2026-05-21"
  },
  {
    transactionId: "TXN-0013",
    name: "MacGregor Retail, LLC",
    description: "Amount invested for Pinecrest project",
    amount: 615000,
    transactionDate: "2026-06-03"
  },
  {
    transactionId: "TXN-0014",
    name: "Lakeview Ventures LLC",
    description: "Amount invested for Maple Plaza project",
    amount: 97500,
    transactionDate: "2026-02-06"
  },
  {
    transactionId: "TXN-0015",
    name: "Omar Hashwani",
    description: "Amount invested for Magnolia project",
    amount: 25000,
    transactionDate: "2026-01-22"
  },
  {
    transactionId: "TXN-0016",
    name: "Summit Ridge Partners",
    description: "Amount invested for Lakeside Plaza project",
    amount: 1875000,
    transactionDate: "2026-03-25"
  },
  {
    transactionId: "TXN-0017",
    name: "Nathani Family Investments LLC",
    description: "Amount invested for Harborview project",
    amount: 720000,
    transactionDate: "2026-05-13"
  },
  {
    transactionId: "TXN-0018",
    name: "Ivy Grove Capital",
    description: "Amount invested for Pinecrest project",
    amount: 54300,
    transactionDate: "2026-04-02"
  },
  {
    transactionId: "TXN-0019",
    name: "Priya Malhotra",
    description: "Amount invested for Lakeside Plaza project",
    amount: 62500,
    transactionDate: "2026-06-11"
  },
  {
    transactionId: "TXN-0020",
    name: "Stonebridge Holdings LLC",
    description: "Amount invested for Harborview project",
    amount: 1425000,
    transactionDate: "2026-06-24"
  },
  {
    transactionId: "TXN-0021",
    name: "Rowzani Family Partnership",
    description: "Amount invested for Magnolia project",
    amount: 512000,
    transactionDate: "2026-03-30"
  },
  {
    transactionId: "TXN-0022",
    name: "Golden Gate Equity LLC",
    description: "Amount invested for Cedar Creek project",
    amount: 28400,
    transactionDate: "2026-02-18"
  },
  {
    transactionId: "TXN-0023",
    name: "Zafar Merchant",
    description: "Amount invested for Maple Plaza project",
    amount: 100000,
    transactionDate: "2026-05-28"
  },
  {
    transactionId: "TXN-0024",
    name: "Willow Bend Investors",
    description: "Amount invested for Lakeside Plaza project",
    amount: 1650000,
    transactionDate: "2026-07-01"
  },
  {
    transactionId: "TXN-0025",
    name: "Sapphire Coast Capital",
    description: "Amount invested for Pinecrest project",
    amount: 890000,
    transactionDate: "2026-01-27"
  },
  {
    transactionId: "TXN-0026",
    name: "Hina Lakhani",
    description: "Amount invested for Cedar Creek project",
    amount: 9800,
    transactionDate: "2026-06-30"
  },
  {
    transactionId: "TXN-0027",
    name: "Oakmont Realty Partners",
    description: "Amount invested for Magnolia project",
    amount: 375000,
    transactionDate: "2026-02-13"
  },
  {
    transactionId: "TXN-0028",
    name: "Evergreen Trust Holdings",
    description: "Amount invested for Pinecrest project",
    amount: 2300000,
    transactionDate: "2026-04-22"
  },
  {
    transactionId: "TXN-0029",
    name: "Danish Kurji",
    description: "Amount invested for Maple Plaza project",
    amount: 1200,
    transactionDate: "2026-03-09"
  },
  {
    transactionId: "TXN-0030",
    name: "Harborlight Investments LLC",
    description: "Amount invested for Lakeside Plaza project",
    amount: 233000,
    transactionDate: "2026-07-03"
  }
];

export default class TransactionHistory extends LightningElement {
  columns = COLUMNS;
  searchTerm = "";
  currentPage = 1;

  // Filter first, then sort (date desc) - pagination slices the result.
  get filteredTransactions() {
    const term = this.searchTerm.trim().toLowerCase();
    const matches = TRANSACTIONS.filter((row) => {
      if (!term) {
        return true;
      }
      return (
        row.transactionId.toLowerCase().includes(term) ||
        row.name.toLowerCase().includes(term) ||
        row.description.toLowerCase().includes(term) ||
        String(row.amount).toLowerCase().includes(term)
      );
    });
    // Always newest first, regardless of seed array order.
    return matches
      .map((row) => ({ ...row }))
      .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredTransactions.length / PAGE_SIZE));
  }

  get pagedTransactions() {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredTransactions.slice(start, start + PAGE_SIZE);
  }

  get isFirstPage() {
    return this.currentPage <= 1;
  }

  get isLastPage() {
    return this.currentPage >= this.totalPages;
  }

  handleSearch(event) {
    this.searchTerm = event.target.value || "";
    this.currentPage = 1;
  }

  handlePrevious() {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  handleNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }
}
