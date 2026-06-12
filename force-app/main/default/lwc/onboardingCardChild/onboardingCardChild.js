import { LightningElement, api } from "lwc";

export default class OnboardingCardChild extends LightningElement {
  @api value = "";
  @api label = "";
  @api iconName = "standard:metrics";
}
