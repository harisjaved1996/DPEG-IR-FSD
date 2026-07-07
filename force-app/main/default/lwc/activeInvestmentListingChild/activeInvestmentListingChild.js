import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

const DEFAULT_ROWS = 5;

const COLUMNS = [
  {
    label: "Name",
    fieldName: "recordUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "name" }, target: "_self" }
  },
  { label: "Committed", fieldName: "committed", type: "text" },
  { label: "Contributed", fieldName: "contributed", type: "text" },
  { label: "Distributed", fieldName: "distributedDisplay", type: "text" },
  { label: "Unreturned Capital", fieldName: "unreturnedCapital", type: "text" },
  { label: "Net Equity", fieldName: "netEquity", type: "text" }
];

// Demo data with placeholder ids (a1…a25). Once wired to real Investment
// records, each row.id becomes the real Salesforce Id and the Name links
// resolve automatically through NavigationMixin.GenerateUrl.
const ACTIVE_DATA = [
  {
    id: "a1",
    name: "Global Zante, LLC",
    gpEntity: "DPEG GP I LLC",
    committed: "$1.3M",
    contributed: "$1.9M",
    distributed: "$450K",
    unreturnedCapital: "$3,247,500",
    netEquity: "$21,483,920",
    targetIrr: "12%",
    holdPeriod: "3 Years"
  },
  {
    id: "a2",
    name: "FX Series Fund 1, LP",
    gpEntity: "DPEG GP II LLC",
    committed: "$12.0M",
    contributed: "$12.0M",
    distributed: "$20.5M",
    unreturnedCapital: "$3,861,200",
    netEquity: "$24,067,315",
    targetIrr: "15%",
    holdPeriod: "5 Years"
  },
  {
    id: "a3",
    name: "Fuqua Park Row, LLC",
    gpEntity: "DPEG GP I LLC",
    committed: "$5.0M",
    contributed: "$5.0M",
    distributed: "$10.5M",
    unreturnedCapital: "$3,094,750",
    netEquity: "$20,762,048",
    targetIrr: "13%",
    holdPeriod: "4 Years"
  },
  {
    id: "a4",
    name: "Falvel Apartments, LLC",
    gpEntity: "DPEG GP III LLC",
    committed: "$3.7M",
    contributed: "$4.0M",
    distributed: "$5.5M",
    unreturnedCapital: "$3,578,300",
    netEquity: "$23,214,586",
    targetIrr: "16%",
    holdPeriod: "5 Years"
  },
  {
    id: "a5",
    name: "DPEG Zarzamora, LLC",
    gpEntity: "DPEG GP II LLC",
    committed: "$7.4M",
    contributed: "$7.4M",
    distributed: "$1.5M",
    unreturnedCapital: "$3,912,640",
    netEquity: "$25,108,772",
    targetIrr: "11%",
    holdPeriod: "3 Years"
  },
  {
    id: "a6",
    name: "Riverside Commerce Park",
    gpEntity: "DPEG GP I LLC",
    committed: "$8.2M",
    contributed: "$8.2M",
    distributed: "$2.1M",
    unreturnedCapital: "$3,405,880",
    netEquity: "$22,391,450",
    targetIrr: "14%",
    holdPeriod: "5 Years"
  },
  {
    id: "a7",
    name: "Oakwood Industrial, LLC",
    gpEntity: "DPEG GP II LLC",
    committed: "$4.5M",
    contributed: "$4.2M",
    distributed: "",
    unreturnedCapital: "$3,156,020",
    netEquity: "$20,948,637",
    targetIrr: "12%",
    holdPeriod: "4 Years"
  },
  {
    id: "a8",
    name: "Harbor View Towers",
    gpEntity: "DPEG GP III LLC",
    committed: "$15.0M",
    contributed: "$14.5M",
    distributed: "$6.0M",
    unreturnedCapital: "$3,733,415",
    netEquity: "$24,832,190",
    targetIrr: "18%",
    holdPeriod: "6 Years"
  },
  {
    id: "a9",
    name: "Sunset Ridge Partners",
    gpEntity: "DPEG GP I LLC",
    committed: "$3.2M",
    contributed: "$3.2M",
    distributed: "$800K",
    unreturnedCapital: "$3,289,940",
    netEquity: "$21,076,514",
    targetIrr: "13%",
    holdPeriod: "3 Years"
  },
  {
    id: "a10",
    name: "Lakeside Office Complex",
    gpEntity: "DPEG GP II LLC",
    committed: "$6.8M",
    contributed: "$6.5M",
    distributed: "",
    unreturnedCapital: "$3,644,180",
    netEquity: "$23,647,825",
    targetIrr: "11%",
    holdPeriod: "4 Years"
  },
  {
    id: "a11",
    name: "Metro Center Plaza",
    gpEntity: "DPEG GP III LLC",
    committed: "$9.1M",
    contributed: "$9.1M",
    distributed: "$3.2M",
    unreturnedCapital: "$3,982,305",
    netEquity: "$25,283,946",
    targetIrr: "15%",
    holdPeriod: "5 Years"
  },
  {
    id: "a12",
    name: "Northgate Business Park",
    gpEntity: "DPEG GP I LLC",
    committed: "$5.4M",
    contributed: "$5.0M",
    distributed: "$1.2M",
    unreturnedCapital: "$3,071,650",
    netEquity: "$20,415,208",
    targetIrr: "12%",
    holdPeriod: "3 Years"
  },
  {
    id: "a13",
    name: "Westfield Logistics, LLC",
    gpEntity: "DPEG GP II LLC",
    committed: "$11.0M",
    contributed: "$10.5M",
    distributed: "$4.5M",
    unreturnedCapital: "$3,518,720",
    netEquity: "$22,957,360",
    targetIrr: "16%",
    holdPeriod: "6 Years"
  },
  {
    id: "a14",
    name: "Eastview Apartments",
    gpEntity: "DPEG GP III LLC",
    committed: "$7.2M",
    contributed: "$7.0M",
    distributed: "",
    unreturnedCapital: "$3,826,090",
    netEquity: "$24,509,671",
    targetIrr: "13%",
    holdPeriod: "4 Years"
  },
  {
    id: "a15",
    name: "Pinnacle Realty Fund",
    gpEntity: "DPEG GP I LLC",
    committed: "$20.0M",
    contributed: "$18.5M",
    distributed: "$8.0M",
    unreturnedCapital: "$3,368,540",
    netEquity: "$21,864,935",
    targetIrr: "17%",
    holdPeriod: "7 Years"
  },
  {
    id: "a16",
    name: "Clearwater Holdings",
    gpEntity: "DPEG GP II LLC",
    committed: "$4.8M",
    contributed: "$4.8M",
    distributed: "$1.8M",
    unreturnedCapital: "$3,690,275",
    netEquity: "$23,082,417",
    targetIrr: "14%",
    holdPeriod: "5 Years"
  },
  {
    id: "a17",
    name: "Stonegate Mixed Use",
    gpEntity: "DPEG GP III LLC",
    committed: "$6.3M",
    contributed: "$6.0M",
    distributed: "",
    unreturnedCapital: "$3,127,830",
    netEquity: "$20,633,742",
    targetIrr: "12%",
    holdPeriod: "3 Years"
  },
  {
    id: "a18",
    name: "Valley Green Retail",
    gpEntity: "DPEG GP I LLC",
    committed: "$3.9M",
    contributed: "$3.7M",
    distributed: "$700K",
    unreturnedCapital: "$3,459,610",
    netEquity: "$22,148,569",
    targetIrr: "11%",
    holdPeriod: "4 Years"
  },
  {
    id: "a19",
    name: "Central Station REIT",
    gpEntity: "DPEG GP II LLC",
    committed: "$16.0M",
    contributed: "$15.0M",
    distributed: "$7.2M",
    unreturnedCapital: "$3,905,120",
    netEquity: "$25,391,084",
    targetIrr: "19%",
    holdPeriod: "6 Years"
  },
  {
    id: "a20",
    name: "Redwood Park Ventures",
    gpEntity: "DPEG GP III LLC",
    committed: "$5.5M",
    contributed: "$5.5M",
    distributed: "$2.0M",
    unreturnedCapital: "$3,214,385",
    netEquity: "$21,527,806",
    targetIrr: "15%",
    holdPeriod: "5 Years"
  },
  {
    id: "a21",
    name: "Highland Commons",
    gpEntity: "DPEG GP I LLC",
    committed: "$8.7M",
    contributed: "$8.2M",
    distributed: "",
    unreturnedCapital: "$3,752,860",
    netEquity: "$24,275,138",
    targetIrr: "13%",
    holdPeriod: "4 Years"
  },
  {
    id: "a22",
    name: "Bayshore Industrial",
    gpEntity: "DPEG GP II LLC",
    committed: "$12.5M",
    contributed: "$12.0M",
    distributed: "$5.1M",
    unreturnedCapital: "$3,037,490",
    netEquity: "$20,896,320",
    targetIrr: "16%",
    holdPeriod: "5 Years"
  },
  {
    id: "a23",
    name: "Creekside Residential",
    gpEntity: "DPEG GP III LLC",
    committed: "$4.1M",
    contributed: "$4.0M",
    distributed: "$900K",
    unreturnedCapital: "$3,596,745",
    netEquity: "$23,764,951",
    targetIrr: "12%",
    holdPeriod: "3 Years"
  },
  {
    id: "a24",
    name: "Summit Office Park",
    gpEntity: "DPEG GP I LLC",
    committed: "$7.8M",
    contributed: "$7.5M",
    distributed: "$2.8M",
    unreturnedCapital: "$3,880,930",
    netEquity: "$25,032,467",
    targetIrr: "14%",
    holdPeriod: "6 Years"
  },
  {
    id: "a25",
    name: "Downtown Loft Partners",
    gpEntity: "DPEG GP II LLC",
    committed: "$9.5M",
    contributed: "$9.5M",
    distributed: "$4.0M",
    unreturnedCapital: "$3,321,070",
    netEquity: "$22,619,703",
    targetIrr: "17%",
    holdPeriod: "5 Years"
  }
];

// Prototype: every row links to this one real Investment record, looked up by
// Name at runtime (no hardcoded Id) so it works in any org.
const TARGET_INVESTMENT_NAME = "DPEG Vicksburg, LP";

export default class ActiveInvestmentListingChild extends NavigationMixin(LightningElement) {
  columns = COLUMNS;
  rows = [];

  connectedCallback() {
    // Show the demo rows immediately; links attach once the Id resolves.
    this.rows = this.buildBaseRows();
  }

  buildBaseRows() {
    return ACTIVE_DATA.slice(0, DEFAULT_ROWS).map((row) => ({
      ...row,
      distributedDisplay: row.distributed || "—"
    }));
  }

  get investmentVariables() {
    return { name: TARGET_INVESTMENT_NAME };
  }

  @wire(graphql, {
    query: gql`
      query investmentByName($name: String) {
        uiapi {
          query {
            Unison__Investment__c(where: { Name: { eq: $name } }, first: 1) {
              edges {
                node {
                  Id
                }
              }
            }
          }
        }
      }
    `,
    variables: "$investmentVariables"
  })
  wiredInvestment({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Unison__Investment__c?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachRecordUrl(edges[0].node.Id);
  }

  async attachRecordUrl(recordId) {
    try {
      const recordUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Unison__Investment__c",
          actionName: "view"
        }
      });
      this.rows = this.buildBaseRows().map((row) => ({ ...row, recordUrl }));
    } catch (error) {
      // Leave rows without links if URL generation fails so the table still renders.
    }
  }

  handleViewAll(event) {
    event.preventDefault();
    // Navigate to the Investment object list page, showing the "All Investments" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Investment__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All_Investments"
      }
    });
  }
}
