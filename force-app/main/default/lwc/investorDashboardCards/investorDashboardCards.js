import { LightningElement } from "lwc";

export default class InvestorDashboardCards extends LightningElement {
  metrics = [
    {
      key: "activeOfferings",
      displayValue: "5",
      label: "Active Offerings",
      iconName: "utility:opportunity",
      iconColor: "#e8a33d"
    },
    {
      key: "wiresToday",
      displayValue: "14",
      label: "Wires Today",
      iconName: "utility:currency",
      iconColor: "#2e844a"
    },
    {
      key: "investorContacts",
      displayValue: "7,724",
      label: "Investor Contacts",
      iconName: "utility:contact",
      iconColor: "#5867e8"
    },
    {
      key: "activeInvestments",
      displayValue: "99",
      label: "Active Investments",
      iconName: "utility:account",
      iconColor: "#06a59a"
    },
    {
      key: "committed",
      displayValue: "$901.6M",
      label: "Committed",
      iconName: "utility:contract",
      iconColor: "#dd7a01"
    },
    {
      key: "contributed",
      displayValue: "$963.3M",
      label: "Contributed",
      iconName: "utility:trending",
      iconColor: "#9050e9"
    },
    {
      key: "distributed",
      displayValue: "$248.6M",
      label: "Distributed",
      iconName: "utility:money",
      iconColor: "#c23934"
    }
  ];
}
