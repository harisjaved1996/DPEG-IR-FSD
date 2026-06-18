import { LightningElement } from "lwc";

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
  { label: "Distributed", fieldName: "distributedDisplay", type: "text" },
  { label: "Target IRR", fieldName: "targetIrr", type: "text" },
  { label: "Investment Period", fieldName: "holdPeriod", type: "text" }
];

const ACTIVE_DATA = [
  {
    id: "a1",
    name: "Global Zante, LLC",
    gpEntity: "DPEG GP I LLC",
    committed: "$1.3M",
    contributed: "$1.9M",
    distributed: "$450K",
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
    targetIrr: "15%",
    holdPeriod: "5 Years"
  },
  {
    id: "a3",
    name: "Fuqua Park Row, LLC",
    gpEntity: "DPEG GP I LLC",
    committed: "$5.0M",
    contributed: "$5.0M",
    distributed: "",
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
    targetIrr: "17%",
    holdPeriod: "5 Years"
  }
];

export default class ActiveInvestmentListingChild extends LightningElement {
  columns = COLUMNS;

  get rows() {
    return ACTIVE_DATA.slice(0, DEFAULT_ROWS).map((row, index) => {
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
    // Placeholder for the View All action.
  }
}
