import { LightningElement } from "lwc";

export default class InvestmentDetailPageCard extends LightningElement {
  metrics = [
    {
      key: "lp Capital",
      displayValue: "$7.5M",
      label: "LP Capital",
      iconName: "standard:opportunity"
    },
    {
      key: "dpegStakge",
      displayValue: "$1.3M",
      label: "DPEG Stake",
      iconName: "standard:currency"
    },
    {
      key: "investorContacts",
      displayValue: "15",
      label: "Total Investors",
      iconName: "standard:contact"
    },
    {
      key: "contributed",
      displayValue: "5M",
      label: "Total Contributed",
      iconName: "standard:investment_account"
    },
    {
      key: "distributed",
      displayValue: "$1.3M",
      label: "Total Distributed",
      iconName: "standard:contract"
    },
    {
      key: "start Date",
      displayValue: "02 May 2021",
      label: "Start Date",
      iconName: "standard:contract"
    }
  ];
}
