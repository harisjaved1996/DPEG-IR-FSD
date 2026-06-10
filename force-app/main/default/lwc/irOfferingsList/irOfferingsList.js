import { LightningElement } from "lwc";

export default class IrOfferingsList extends LightningElement {
  offerings = [
    {
      id: 1,
      name: "Williams Way Apartments, LLC",
      stage: "Active Fundraising",
      badgeCss: "badge badge-blue",
      target: "$12.0M",
      committed: "$10.5M",
      funded: "$8.6M",
      barStyle: "width: 72%; background-color: #2e844a;",
      pctStyle: "color: #2e844a;",
      pctLabel: "72%"
    },
    {
      id: 2,
      name: "Westpark Entrepreneurs, LLC",
      stage: "Draft",
      badgeCss: "badge badge-purple",
      target: "$21.0M",
      committed: "$16.8M",
      funded: "$13.9M",
      barStyle: "width: 66%; background-color: #2e844a;",
      pctStyle: "color: #2e844a;",
      pctLabel: "66%"
    },
    {
      id: 3,
      name: "Triangle Y-Shops, LP",
      stage: "Signatures Pending",
      badgeCss: "badge badge-orange",
      target: "$7.5M",
      committed: "$7.0M",
      funded: "$6.5M",
      barStyle: "width: 87%; background-color: #2e844a;",
      pctStyle: "color: #2e844a;",
      pctLabel: "87%"
    },
    {
      id: 4,
      name: "Pearland Entrepreneurs, LLC",
      stage: "Active Fundraising",
      badgeCss: "badge badge-blue",
      target: "$4.2M",
      committed: "$3.6M",
      funded: "$3.1M",
      barStyle: "width: 74%; background-color: #2e844a;",
      pctStyle: "color: #2e844a;",
      pctLabel: "74%"
    },
    {
      id: 5,
      name: "Parkwest Y Shops, LLC",
      stage: "Draft",
      badgeCss: "badge badge-purple",
      target: "$8.8M",
      committed: "$8.0M",
      funded: "$7.2M",
      barStyle: "width: 82%; background-color: #2e844a;",
      pctStyle: "color: #2e844a;",
      pctLabel: "82%"
    }
  ];

  handleNameClick(event) {
    event.preventDefault();
  }
}
