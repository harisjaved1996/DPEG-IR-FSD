import { LightningElement } from "lwc";

const STATS = [
  {
    key: "ppmsSent",
    label: "PPMs Sent",
    value: "24",
    iconName: "standard:email"
  },
  {
    key: "ppmsSigned",
    label: "PPMs Signed",
    value: "18",
    iconName: "standard:contract"
  },
  {
    key: "unsignedPPMs",
    label: "Unsigned PPMs",
    value: "6",
    iconName: "standard:approval"
  }
];

export default class PpmStatsParent extends LightningElement {
  stats = STATS;
}
