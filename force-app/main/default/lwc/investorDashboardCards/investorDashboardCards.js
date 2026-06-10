import { LightningElement } from "lwc";

export default class InvestorDashboardCards extends LightningElement {
  metrics = [
    {
      key: "activeOfferings",
      displayValue: "5",
      label: "Active Offerings",
      iconName: "utility:open_folder",
      valueColor: "#5867e8"
    },
    {
      key: "wiresToday",
      displayValue: "14",
      label: "Wires Today",
      iconName: "utility:send",
      valueColor: "#0076c5"
    },
    {
      key: "investorContacts",
      displayValue: "7,724",
      label: "Investor Contacts",
      iconName: "utility:people",
      valueColor: "#7f64d3"
    },
    {
      key: "activeInvestments",
      displayValue: "99",
      label: "Active Investments",
      iconName: "utility:chart",
      valueColor: "#e8a000"
    },
    {
      key: "committed",
      displayValue: "$901.6M",
      label: "Committed",
      iconName: "utility:contract",
      valueColor: "#2e844a"
    },
    {
      key: "contributed",
      displayValue: "$963.3M",
      label: "Contributed",
      iconName: "utility:currency",
      valueColor: "#e45c02"
    },
    {
      key: "distributed",
      displayValue: "$248.6M",
      label: "Distributed",
      iconName: "utility:download",
      valueColor: "#04844b"
    }
  ];
}
