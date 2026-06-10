import { LightningElement } from "lwc";

const STATS = [
  { key: "closedInvestments", label: "Closed Investments", value: "30", valueColor: "#181818" },
  { key: "committed", label: "Committed", value: "$9.1M", valueColor: "#0176d3" },
  { key: "contributed", label: "Contributed", value: "$750K", valueColor: "#0176d3" },
  { key: "distributed", label: "Distributed", value: "$10.5M", valueColor: "#2e844a" }
];

export default class ClosedInvestmentsSummaryParent extends LightningElement {
  stats = STATS;
}
