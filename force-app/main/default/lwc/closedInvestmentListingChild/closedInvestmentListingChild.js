import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";

const DEFAULT_ROWS = 5;

const TYPES = ["Retail", "Multifamily", "Land"];

// Same type value always maps to the same pill colour.
const TYPE_VARIANT = {
  Retail: "blue",
  Multifamily: "purple",
  Land: "green"
};

// Each investment name links to its Investment record page. In real data every
// row would carry its own record URL; the demo rows share one sample record.
const INVESTMENT_RECORD_URL = "/lightning/r/Unison__Investment__c/a08FW003rCMBVNoYQP/view";

const COLUMNS = [
  {
    label: "Name",
    fieldName: "recordUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "name" }, target: "_self" }
  },
  {
    label: "Type",
    fieldName: "type",
    type: "pill",
    typeAttributes: { variant: { fieldName: "typeVariant" } }
  },
  { label: "Committed", fieldName: "committed", type: "text" },
  { label: "Contributed", fieldName: "contributed", type: "text" },
  { label: "Distributed", fieldName: "distributedDisplay", type: "text" }
];

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

export default class ClosedInvestmentListingChild extends NavigationMixin(LightningElement) {
  columns = COLUMNS;

  get rows() {
    return CLOSED_DATA.slice(0, DEFAULT_ROWS).map((row, index) => {
      const type = TYPES[index % TYPES.length];
      return {
        ...row,
        type,
        typeVariant: TYPE_VARIANT[type],
        distributedDisplay: row.distributed || "—",
        recordUrl: INVESTMENT_RECORD_URL
      };
    });
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
