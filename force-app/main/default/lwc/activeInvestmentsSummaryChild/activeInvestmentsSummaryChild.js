import { LightningElement, api } from "lwc";

export default class ActiveInvestmentsSummaryChild extends LightningElement {
  @api value = "";
  @api label = "";
  @api iconName = "utility:summary";
  @api iconColor;

  get iconStyle() {
    return this.iconColor
      ? `--slds-c-icon-color-foreground-default: ${this.iconColor}; --sds-c-icon-color-foreground-default: ${this.iconColor};`
      : "";
  }
}
