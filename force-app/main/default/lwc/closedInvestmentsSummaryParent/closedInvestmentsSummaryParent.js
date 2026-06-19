import { LightningElement } from "lwc";

const STATS = [
  {
    key: "closedInvestments",
    label: "Closed Investments",
    value: "12",
    iconName: "utility:account",
    iconColor: "#5867e8"
  },
  {
    key: "committed",
    label: "Total Committed",
    value: "$7M",
    iconName: "utility:contract",
    iconColor: "#dd7a01"
  },
  {
    key: "contributed",
    label: "Total Contributed",
    value: "$4.7M",
    iconName: "utility:trending",
    iconColor: "#06a59a"
  },
  {
    key: "distributed",
    label: "Total Distributed",
    value: "$500K",
    iconName: "utility:money",
    iconColor: "#2e844a"
  }
];

export default class ClosedInvestmentsSummaryParent extends LightningElement {
  stats = STATS;
}
