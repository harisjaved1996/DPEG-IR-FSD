import { LightningElement } from "lwc";

const STATS = [
  { key: "activeInvestments", label: "Active Investments", value: "2", valueColor: "#2e844a" },
  { key: "lpCapitalDeployed", label: "LP Capital Deployed", value: "$13M", valueColor: "#2e844a" },
  { key: "totalLpInvestors", label: "Total LP Investors", value: "376", valueColor: "" },
  { key: "distributedToDate", label: "Distributed to Date", value: "$628K", valueColor: "#2e844a" },
  { key: "avgIrrToDate", label: "Avg IRR to Date", value: "11.3%", valueColor: "#2e844a" },
  { key: "nearestProjectedExit", label: "Nearest Projected Exit", value: "Q1 2027", valueColor: "" }
];

export default class ActiveInvestmentsSummaryParent extends LightningElement {
  stats = STATS;
}
