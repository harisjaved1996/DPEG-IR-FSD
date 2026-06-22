import { LightningElement } from "lwc";

// Dummy stat data passed down to the presentational c-stat-card child.
// Each entry maps to a standard SLDS icon, a label, and a display value.
const STATS = [
  {
    id: "contribution",
    iconName: "utility:currency",
    iconColor: "#2e844a",
    label: "Total Contribution",
    value: "$10M"
  },
  {
    id: "distribution",
    iconName: "utility:money",
    iconColor: "#5867e8",
    label: "Total Distribution",
    value: "$70K"
  },
  {
    id: "contacts",
    iconName: "utility:contact",
    iconColor: "#e8a33d",
    label: "Associated Contacts",
    value: "3"
  }
];

export default class InvestingEntityStatParent extends LightningElement {
  stats = STATS;
}
