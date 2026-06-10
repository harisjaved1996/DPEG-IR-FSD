import { LightningElement } from "lwc";

const STATS = [
  {
    key: "activeInvestments",
    label: "Active Investments",
    value: "25",
    iconName: "standard:investment_account"
  },
  {
    key: "activeTotalCommited",
    label: "Total Commited",
    value: "$13M",
    iconName: "standard:currency"
  },
  {
    key: "activeTotalContributed",
    label: "Total Contributed",
    value: "$10M",
    iconName: "standard:currency"
  },
  {
    key: "activeTotalDistribued",
    label: "Total Distributed",
    value: "$200K",
    iconName: "standard:currency"
  },
  {
    key: "activeTotalInvestors",
    label: "Total Investors",
    value: "215",
    iconName: "standard:partner_fund_allocation"
  },
  {
    key: "nearestProjectedExit",
    label: "Nearest Projected Exit",
    value: "Q1 2027",
    iconName: "standard:event"
  }
];

export default class ActiveInvestmentsSummaryParent extends LightningElement {
  stats = STATS;
}
