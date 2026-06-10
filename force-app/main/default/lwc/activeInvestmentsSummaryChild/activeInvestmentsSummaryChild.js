import { LightningElement, api } from "lwc";

export default class ActiveInvestmentsSummaryChild extends LightningElement {
  @api value = "";
  @api label = "";
  @api iconName = "standard:metrics";
}
