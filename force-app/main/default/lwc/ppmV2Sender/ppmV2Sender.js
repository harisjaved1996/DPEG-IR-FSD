import { LightningElement, api } from "lwc";

/**
 * PPM V2 tab content for the Offering record page.
 *
 * NOTE: DocuSign's native sending experience (the dfsle:Sending Aura component /
 * dfsle__Sending Visualforce page) cannot be embedded in a custom tab, launched
 * by a raw URL (Salesforce blocks it with a CSRF token error), or referenced from
 * a custom quick action. The only supported launch is the "Send with DocuSign"
 * action that DocuSign generates through its own eSignature Setup. Once that action
 * exists it can be placed on the Offering page; this component documents the flow.
 */
export default class PpmV2Sender extends LightningElement {
  @api recordId;
}
