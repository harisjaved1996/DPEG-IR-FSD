import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";

// Same stage value always maps to the same pill colour.
const STAGE_VARIANT = {
  "Active Fundraising": "blue",
  Draft: "gray",
  "Signatures Pending": "orange",
  Closed: "green",
  Cancelled: "red"
};

// Each offering name links to its Offering record page. In real data every row
// would carry its own record URL; the demo rows share one sample record.
const OFFERING_RECORD_URL = "/lightning/r/Unison__Offering__c/a0AFW002mMT3KWu2QN/view";

const COLUMNS = [
  {
    label: "Offering",
    fieldName: "recordUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "name" }, target: "_self" }
  },
  {
    label: "Stage",
    fieldName: "stage",
    type: "pill",
    typeAttributes: { variant: { fieldName: "stageVariant" } }
  },
  { label: "Target", fieldName: "target", type: "text" },
  { label: "Committed", fieldName: "committed", type: "text" },
  { label: "Funded", fieldName: "funded", type: "text" },
  {
    label: "Progress",
    fieldName: "pctLabel",
    type: "progressBar",
    typeAttributes: {
      barStyle: { fieldName: "barStyle" },
      pctStyle: { fieldName: "pctStyle" },
      pctLabel: { fieldName: "pctLabel" }
    }
  }
];

export default class IrOfferingsList extends NavigationMixin(LightningElement) {
  columns = COLUMNS;

  offerings = [
    {
      id: 1,
      name: "Williams Way Apartments, LLC",
      stage: "Active Fundraising",
      target: "$12.0M",
      committed: "$10.5M",
      funded: "$8.6M",
      barStyle: "width: 72%; height: 100%; background-color: #2e844a; border-radius: 999px;",
      pctStyle: "color: #2e844a; font-size: 0.75rem; font-weight: 600;",
      pctLabel: "72%"
    },
    {
      id: 2,
      name: "Westpark Entrepreneurs, LLC",
      stage: "Draft",
      target: "$21.0M",
      committed: "$16.8M",
      funded: "$13.9M",
      barStyle: "width: 66%; height: 100%; background-color: #2e844a; border-radius: 999px;",
      pctStyle: "color: #2e844a; font-size: 0.75rem; font-weight: 600;",
      pctLabel: "66%"
    },
    {
      id: 3,
      name: "Triangle Y-Shops, LP",
      stage: "Signatures Pending",
      target: "$7.5M",
      committed: "$7.0M",
      funded: "$6.5M",
      barStyle: "width: 87%; height: 100%; background-color: #2e844a; border-radius: 999px;",
      pctStyle: "color: #2e844a; font-size: 0.75rem; font-weight: 600;",
      pctLabel: "87%"
    },
    {
      id: 4,
      name: "Pearland Entrepreneurs, LLC",
      stage: "Active Fundraising",
      target: "$4.2M",
      committed: "$3.6M",
      funded: "$3.1M",
      barStyle: "width: 74%; height: 100%; background-color: #2e844a; border-radius: 999px;",
      pctStyle: "color: #2e844a; font-size: 0.75rem; font-weight: 600;",
      pctLabel: "74%"
    },
    {
      id: 5,
      name: "Parkwest Y Shops, LLC",
      stage: "Draft",
      target: "$8.8M",
      committed: "$8.0M",
      funded: "$7.2M",
      barStyle: "width: 82%; height: 100%; background-color: #2e844a; border-radius: 999px;",
      pctStyle: "color: #2e844a; font-size: 0.75rem; font-weight: 600;",
      pctLabel: "82%"
    }
  ];

  get rows() {
    return this.offerings.map((row) => ({
      ...row,
      stageVariant: STAGE_VARIANT[row.stage] || "gray",
      recordUrl: OFFERING_RECORD_URL
    }));
  }

  get recordCount() {
    return this.offerings.length;
  }

  handleViewAll(event) {
    event.preventDefault();
    // Navigate to the Offering object list page, showing the "All" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Offering__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All_Offerings"
      }
    });
  }
}
