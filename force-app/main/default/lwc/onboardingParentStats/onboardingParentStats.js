import { LightningElement } from "lwc";

// Dummy onboarding stats passed down to the presentational c-stat-card child.
// Each entry sends a standard SLDS icon, a label, and a display value.
const STATS = [
  {
    id: "inQueue",
    iconName: "standard:task",
    label: "In Queue",
    value: "24"
  },
  {
    id: "web",
    iconName: "standard:lead",
    label: "Web",
    value: "63"
  },
  {
    id: "email",
    iconName: "standard:email",
    label: "Email",
    value: "38"
  }
];

export default class OnboardingParentStats extends LightningElement {
  stats = STATS;
}
