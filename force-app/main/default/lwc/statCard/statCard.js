import { LightningElement, api } from "lwc";

export default class StatCard extends LightningElement {
  @api value = "";
  @api label = "";
  @api iconName = "utility:chart";
  @api valueColor = "#5867e8";

  get valueStyle() {
    return `color: ${this.valueColor};`;
  }

  get badgeStyle() {
    return `background-color: ${this.valueColor};`;
  }
}
