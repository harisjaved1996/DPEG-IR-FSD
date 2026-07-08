import { LightningElement } from "lwc";

// Static auto-matched prospect summary shown on the Wire record page for the
// Auto Match record type. Prototype only — display card, no actions.
const MATCH_ROWS = [
  {
    key: "name",
    label: "Name",
    value: "GreenTree",
    icon: "utility:success",
    variant: "success"
  },
  {
    key: "entity",
    label: "Investing Entity",
    value: "Greentree LLC",
    icon: "utility:success",
    variant: "success"
  },
  {
    key: "amount",
    label: "Amount",
    value: "$100,000.00",
    icon: "utility:success",
    variant: "success"
  }
];

export default class AutoMatchedProspect extends LightningElement {
  confidence = 99;

  get rows() {
    return MATCH_ROWS.map((row) => ({
      ...row,
      badgeClass: row.variant === "success" ? "badge badge_success" : "badge badge_warning"
    }));
  }

  get confidenceLabel() {
    return `${this.confidence}%`;
  }
}
