import { LightningElement } from "lwc";

const STATS = [
  {
    key: "totalBalance",
    label: "Total Balance",
    value: "$93.2M",
    iconName: "utility:currency",
    iconColor: "#2e844a"
  },
  {
    key: "linkedAccounts",
    label: "Linked Accounts",
    value: "10",
    iconName: "utility:account",
    iconColor: "#5867e8"
  }
];

export default class PaymentStatsParent extends LightningElement {
  stats = STATS;
}
