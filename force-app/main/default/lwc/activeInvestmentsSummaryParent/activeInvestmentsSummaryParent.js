import { LightningElement } from "lwc";

const STATS = [
  {
    key: "activeInvestments",
    label: "Active Investments",
    value: "25",
    iconName: "utility:account",
    iconColor: "#5867e8"
  },
  {
    key: "activeTotalCommited",
    label: "Total Commited",
    value: "$13M",
    iconName: "utility:contract",
    iconColor: "#dd7a01"
  },
  {
    key: "activeTotalContributed",
    label: "Total Contributed",
    value: "$10M",
    iconName: "utility:trending",
    iconColor: "#06a59a"
  },
  {
    key: "activeTotalDistribued",
    label: "Total Distributed",
    value: "$200K",
    iconName: "utility:money",
    iconColor: "#2e844a"
  },
  {
    key: "activeTotalInvestors",
    label: "Total Investors",
    value: "215",
    iconName: "utility:people",
    iconColor: "#9050e9"
  },
  {
    key: "nearestProjectedExit",
    label: "Nearest Projected Exit",
    value: "Q1 2027",
    iconName: "utility:event",
    iconColor: "#e8a33d"
  }
];

export default class ActiveInvestmentsSummaryParent extends LightningElement {
  stats = STATS;
}
