import { LightningElement } from "lwc";

const STATS = [
  {
    key: "new",
    iconName: "standard:task",
    label: "New",
    value: "24"
  },
  {
    key: "underReview",
    iconName: "standard:approval",
    label: "Under Review",
    value: "63"
  },
  {
    key: "createProfile",
    iconName: "standard:contact",
    label: "Create Profile",
    value: "38"
  },
  {
    key: "web",
    iconName: "standard:lead",
    label: "Web",
    value: "15"
  },
  {
    key: "phone",
    iconName: "standard:call",
    label: "Phone",
    value: "55"
  },
  {
    key: "other",
    iconName: "standard:record",
    label: "Other",
    value: "45"
  }
];

export default class OnboardingCardParent extends LightningElement {
  stats = STATS;
}
