import { LightningElement } from "lwc";

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
  },
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
