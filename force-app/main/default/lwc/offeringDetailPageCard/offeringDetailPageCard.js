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
      key: "CommittedCapital",
      displayValue: "$8.6M",
      label: "Committed Capital",
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
      key: "contributed",
      displayValue: "$1.3M",
      label: "Total Contributed",
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
