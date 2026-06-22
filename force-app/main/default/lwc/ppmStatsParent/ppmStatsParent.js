import { LightningElement } from "lwc";

const STATS = [
  {
    key: "ppmsSent",
    label: "PPMs Sent",
    value: "24",
    iconName: "utility:email",
    iconColor: "#2e844a"
  },
  {
    key: "ppmsSigned",
    label: "PPMs Signed",
    value: "18",
    iconName: "utility:contract",
    iconColor: "#5867e8"
  },
  {
    key: "unsignedPPMs",
    label: "Unsigned PPMs",
    value: "6",
    iconName: "utility:approval",
    iconColor: "#dd7a01"
  }
];

export default class PpmStatsParent extends LightningElement {
  stats = STATS;
}
