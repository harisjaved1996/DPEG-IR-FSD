import { LightningElement } from "lwc";

const STATS = [
  { key: "closedInvestments", label: "Closed Investments", value: "30", valueColor: "#181818" },
  { key: "committed", label: "Committed", value: "$95,752,160", valueColor: "#0176d3" },
  { key: "contributed", label: "Contributed", value: "$78,870,285", valueColor: "#0176d3" },
  { key: "distributed", label: "Distributed", value: "$101,998,673", valueColor: "#2e844a" }
];

export default class ClosedInvestmentsSummaryParent extends LightningElement {
  stats = STATS;
}
