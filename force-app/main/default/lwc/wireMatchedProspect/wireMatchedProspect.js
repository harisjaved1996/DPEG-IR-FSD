import { LightningElement } from "lwc";

// Static suggested-match summary shown on the Wire record page. Prototype only —
// the three action buttons are placeholders with no backend wired up yet.
const MATCH_ROWS = [
  {
    key: "name",
    label: "Name",
    value: "Rahul Patel",
    icon: "utility:warning",
    variant: "warning"
  },
  {
    key: "amount",
    label: "Amount",
    value: "$300,000.00",
    icon: "utility:success",
    variant: "success"
  },
  {
    key: "entity",
    label: "Investing Entity",
    value: "GreenTree LLC",
    icon: "utility:warning",
    variant: "warning"
  }
];

export default class WireMatchedProspect extends LightningElement {
  rows = MATCH_ROWS;

  handleConfirm() {
    // Placeholder: confirm match & create contribution.
  }

  handlePartialPayment() {
    // Placeholder: record partial payment.
  }

  handleContactInvestor() {
    // Placeholder: contact investor.
  }
}
