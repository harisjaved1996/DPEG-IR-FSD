import { LightningElement } from "lwc";

const STATS = [
  {
    id: "duplicate",
    iconName: "standard:record_lookup",
    label: "Duplicate Detected",
    value: "15"
  },
  {
    key: "verified",
    label: "Verified",
    value: "55",
    iconName: "standard:approval"
  },
  {
    key: "pending",
    label: "Pending",
    value: "45",
    iconName: "standard:task"
  }
];

export default class OnboardingCardParent extends LightningElement {
  stats = STATS;
}
