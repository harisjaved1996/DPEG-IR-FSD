import { LightningElement } from "lwc";

export default class IrrProgressCard extends LightningElement {
  irrToDate = "11.3%";
  targetIrr = "16%";
  progressLabel = "IRR progress to target";
  progressMeta = "11.3% of 16% target (71%)";
  barStyle = "width: 71%;";
}
