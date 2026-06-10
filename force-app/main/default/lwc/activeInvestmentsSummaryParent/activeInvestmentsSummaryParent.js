import { LightningElement } from "lwc";

const STATS = [
  {
    key: "activeInvestments",
    label: "Active Investments",
    value: "2",
    iconName: "standard:investment_account"
  },
  {
    key: "lpCapitalDeployed",
    label: "LP Capital Deployed",
    value: "$13M",
    iconName: "standard:currency"
  },
  {
    key: "totalLpInvestors",
    label: "Total LP Investors",
    value: "376",
    iconName: "standard:groups"
  },
  {
    key: "distributedToDate",
    label: "Distributed to Date",
    value: "$628K",
    iconName: "standard:partner_fund_allocation"
  },
  {
    key: "avgIrrToDate",
    label: "Avg IRR to Date",
    value: "11.3%",
    iconName: "standard:metrics"
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
