import { LightningElement } from "lwc";

export default class OfferingDetailPageCard extends LightningElement {
  metrics = [
    {
      key: "targetRaise",
      displayValue: "$12M",
      label: "Target Raise",
      iconName: "utility:opportunity",
      iconColor: "#e8a33d"
    },
    {
      key: "CommittedCapital",
      displayValue: "$8.6M",
      label: "Commitments",
      iconName: "utility:currency",
      iconColor: "#2e844a"
    },
    {
      key: "contributed",
      displayValue: "$1.3M",
      label: "Contributions",
      iconName: "utility:contract",
      iconColor: "#06a59a"
    },
    {
      key: "investorContacts",
      displayValue: "15",
      label: "Committed Investors",
      iconName: "utility:contact",
      iconColor: "#5867e8"
    },
    {
      key: "FundedInvestors",
      displayValue: "10",
      label: "Funded",
      iconName: "utility:check",
      iconColor: "#dd7a01"
    },
    {
      key: "closing",
      displayValue: " 10 July 2026",
      label: "Closing Date",
      iconName: "utility:event",
      iconColor: "#9050e9"
    }
  ];
}
