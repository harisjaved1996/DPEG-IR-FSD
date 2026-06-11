import { LightningElement } from "lwc";

export default class OfferingDetailPageCard extends LightningElement {
  metrics = [
    {
      key: "targetRaise",
      displayValue: "$12M",
      label: "Target Raise",
      iconName: "standard:opportunity"
    },
    {
      key: "raised",
      displayValue: "$8.6M",
      label: "Raised",
      iconName: "standard:currency"
    },
    {
      key: "investorContacts",
      displayValue: "15",
      label: "Committed Investors",
      iconName: "standard:contact"
    },
    {
      key: "FundedInvestors",
      displayValue: "10",
      label: "Funded Investors",
      iconName: "standard:contact"
    },
    {
      key: "distributed",
      displayValue: "$1.3M",
      label: "Total Distributed",
      iconName: "standard:contract"
    },
    {
      key: "closing",
      displayValue: " 10 July 2026",
      label: "Closing Date",
      iconName: "standard:contract"
    }
  ];
}
