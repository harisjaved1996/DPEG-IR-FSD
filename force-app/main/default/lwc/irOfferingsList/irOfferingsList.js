import { LightningElement } from "lwc";

// Same stage value always maps to the same tag/badge style.
const STAGE_BADGE = {
  "Active Fundraising": "badge badge-blue",
  Draft: "badge badge-gray",
  "Signatures Pending": "badge badge-orange",
  Closed: "badge badge-green",
  Cancelled: "badge badge-red"
};

export default class IrOfferingsList extends LightningElement {
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
      badgeCss: STAGE_BADGE[row.stage] || "badge badge-gray"
    }));
  }
}
