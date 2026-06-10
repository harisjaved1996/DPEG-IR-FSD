import { LightningElement } from "lwc";

const STATS = [
  {
    key: "closedInvestments",
    label: "Closed Investments",
    value: "12",
    iconName: "standard:investment_account"
  },
  {
    key: "committed",
    label: "Total Committed",
    value: "$7M",
    iconName: "standard:contract"
  },
  {
    key: "contributed",
    label: "Total Contributed",
    value: "$4.7M",
    iconName: "standard:metrics"
  },
  {
    key: "distributed",
    label: "Total Distributed",
    value: "$500K",
    iconName: "standard:partner_fund_allocation"
  }
];

export default class ClosedInvestmentsSummaryParent extends LightningElement {
  stats = STATS;
}
