import { LightningElement, api } from "lwc";

export default class ClosedInvestmentsSummaryChild extends LightningElement {
  @api value = "";
  @api label = "";
  @api iconName = "standard:metrics";
}
