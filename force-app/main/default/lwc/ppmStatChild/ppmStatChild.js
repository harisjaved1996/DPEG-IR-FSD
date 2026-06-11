import { LightningElement, api } from "lwc";

export default class PpmStatChild extends LightningElement {
  @api value = "";
  @api label = "";
  @api iconName = "standard:metrics";
}
