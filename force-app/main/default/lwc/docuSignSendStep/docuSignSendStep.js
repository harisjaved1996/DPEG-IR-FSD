import { LightningElement, api } from "lwc";

/**
 * docuSignSendStep (stateless)
 *
 * Send step: shows a pre-send summary (counts) and, after the parent fires the send, renders the
 * SendResult returned by Apex (sync/async, bulk vs fallback, message). Pure presentational — no
 * Apex calls; the parent owns the send action.
 */
export default class DocuSignSendStep extends LightningElement {
  @api documentCount = 0;
  @api recipientCount = 0;
  @api sendResult;
  @api isSending = false;

  get hasResult() {
    return !!this.sendResult;
  }

  get resultTheme() {
    if (!this.sendResult) {
      return "";
    }
    return this.sendResult.success ? "slds-theme_success" : "slds-theme_warning";
  }

  get showSummary() {
    return !this.hasResult && !this.isSending;
  }
}
