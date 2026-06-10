import { LightningElement, api } from "lwc";

export default class ActiveInvestmentsSummaryChild extends LightningElement {
  @api label = "";
  @api value = "";
  @api valueColor = "";

  get valueStyle() {
    return this.valueColor ? `color: ${this.valueColor};` : "";
  }
}
