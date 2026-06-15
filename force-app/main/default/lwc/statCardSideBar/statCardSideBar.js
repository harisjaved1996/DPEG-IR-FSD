import { LightningElement, api } from "lwc";

export default class StatCardSideBar extends LightningElement {
  @api value = "";
  @api label = "";
  @api iconName = "standard:metrics";
}
