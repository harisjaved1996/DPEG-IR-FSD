import { LightningElement, api } from "lwc";

export default class StatCard extends LightningElement {
  @api value = "";
  @api label = "";
  @api iconName = "standard:metrics";
}
