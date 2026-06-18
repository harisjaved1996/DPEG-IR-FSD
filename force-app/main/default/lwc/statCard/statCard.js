import { LightningElement, api } from "lwc";

export default class StatCard extends LightningElement {
  @api value = "";
  @api label = "";
  @api iconName = "standard:metrics";
  @api plainIcon = false;
  @api iconColor;

  get iconStyle() {
    return this.iconColor
      ? `--slds-c-icon-color-foreground-default: ${this.iconColor}; --sds-c-icon-color-foreground-default: ${this.iconColor};`
      : "";
  }
}
