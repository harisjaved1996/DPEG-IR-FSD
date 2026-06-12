import { LightningElement } from "lwc";

// Dummy stat data passed down to the presentational c-stat-card child.
// Each entry maps to a standard SLDS icon, a label, and a display value.
const STATS = [
  {
    id: "contribution",
    iconName: "standard:currency",
    label: "Total Contribution",
    value: "$10M"
  },
  {
    id: "distribution",
    iconName: "standard:partner_fund_allocation",
    label: "Total Distribution",
    value: "$70K"
  },
  {
    id: "contacts",
    iconName: "standard:contact",
    label: "Associated Contacts",
    value: "3"
  }
];

export default class InvestingEntityStatParent extends LightningElement {
  stats = STATS;
}
