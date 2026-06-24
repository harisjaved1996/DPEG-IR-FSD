import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";

// Same type value always maps to the same pill colour.
const TYPE_VARIANT = {
  Retail: "blue",
  Multifamily: "purple",
  Land: "green",
  Office: "orange",
  Industrial: "teal"
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
  { label: "Distributed", fieldName: "distributed", type: "text" },
  { label: "Target IRR", fieldName: "targetIrr", type: "text" },
  { label: "Investment Period", fieldName: "holdPeriod", type: "text" }
];

export default class IrInvestmentsList extends NavigationMixin(LightningElement) {
  columns = COLUMNS;

  investments = [
    {
      id: 1,
      name: "Global Zante, LLC",
      type: "Retail",
      committed: "$1.3M",
      contributed: "$1.9M",
      distributed: "$450K",
      targetIrr: "12%",
      holdPeriod: "3 Years"
    },
    {
      id: 2,
      name: "FX Series Fund 1, LP",
      type: "Multifamily",
      committed: "$12.0M",
      contributed: "$12.0M",
      distributed: "$20.5M",
      targetIrr: "15%",
      holdPeriod: "5 Years"
    },
    {
      id: 3,
      name: "Fuqua Park Row, LLC",
      type: "Land",
      committed: "$5.0M",
      contributed: "$5.0M",
      distributed: "—",
      targetIrr: "13%",
      holdPeriod: "4 Years"
    },
    {
      id: 4,
      name: "Falvel Apartments, LLC",
      type: "Multifamily",
      committed: "$3.7M",
      contributed: "$4.0M",
      distributed: "$5.5M",
      targetIrr: "16%",
      holdPeriod: "5 Years"
    },
    {
      id: 5,
      name: "DPEG Zarzamora, LLC",
      type: "Retail",
      committed: "$7.4M",
      contributed: "$7.4M",
      distributed: "$1.5M",
      targetIrr: "11%",
      holdPeriod: "3 Years"
    }
  ];

  get rows() {
    return this.investments.map((row) => ({
      ...row,
      typeVariant: TYPE_VARIANT[row.type] || "gray",
      recordUrl: INVESTMENT_RECORD_URL
    }));
  }

  get recordCount() {
    return this.investments.length;
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
