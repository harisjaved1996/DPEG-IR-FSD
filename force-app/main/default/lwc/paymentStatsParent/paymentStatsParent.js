import { LightningElement } from "lwc";

const STATS = [
  {
    key: "totalBalance",
    label: "Total Balance",
    value: "$93.2M",
    iconName: "standard:currency"
  },
  {
    key: "linkedAccounts",
    label: "Linked Accounts",
    value: "10",
    iconName: "standard:account"
  }
];

export default class PaymentStatsParent extends LightningElement {
  stats = STATS;
}
