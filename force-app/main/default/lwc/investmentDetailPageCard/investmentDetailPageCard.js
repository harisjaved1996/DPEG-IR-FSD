import { LightningElement } from "lwc";

export default class InvestmentDetailPageCard extends LightningElement {
  metrics = [
    {
      key: "lp Capital",
      displayValue: "$7.5M",
      label: "LP Capital",
      iconName: "utility:opportunity",
      iconColor: "#e8a33d"
    },
    {
      key: "dpegStakge",
      displayValue: "$1.3M",
      label: "DPEG Stake",
      iconName: "utility:currency",
      iconColor: "#2e844a"
    },
    {
      key: "investorContacts",
      displayValue: "15",
      label: "Total Ivesting Entities",
      iconName: "utility:contact",
      iconColor: "#5867e8"
    },
    {
      key: "contributed",
      displayValue: "5M",
      label: "Total Contributed",
      iconName: "utility:trending",
      iconColor: "#06a59a"
    },
    {
      key: "distributed",
      displayValue: "$1.3M",
      label: "Total Distributed",
      iconName: "utility:contract",
      iconColor: "#dd7a01"
    },
    {
      key: "start Date",
      displayValue: "02 May 2021",
      label: "Start Date",
      iconName: "utility:event",
      iconColor: "#9050e9"
    }
  ];
}
