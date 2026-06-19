import { LightningElement } from "lwc";

const STATS = [
  {
    key: "new",
    iconName: "utility:task",
    iconColor: "#5867e8",
    label: "New",
    value: "24"
  },
  {
    key: "underReview",
    iconName: "utility:approval",
    iconColor: "#dd7a01",
    label: "Under Review",
    value: "63"
  },
  {
    key: "createProfile",
    iconName: "utility:contact",
    iconColor: "#06a59a",
    label: "Create Profile",
    value: "38"
  },
  {
    key: "web",
    iconName: "utility:world",
    iconColor: "#9050e9",
    label: "Web",
    value: "15"
  },
  {
    key: "phone",
    iconName: "utility:call",
    iconColor: "#2e844a",
    label: "Phone",
    value: "55"
  },
  {
    key: "other",
    iconName: "utility:record",
    iconColor: "#e8a33d",
    label: "Other",
    value: "45"
  }
];

export default class OnboardingCardParent extends LightningElement {
  stats = STATS;
  headerIconStyle =
    "--slds-c-icon-color-foreground-default: #5867e8; --sds-c-icon-color-foreground-default: #5867e8;";
}
