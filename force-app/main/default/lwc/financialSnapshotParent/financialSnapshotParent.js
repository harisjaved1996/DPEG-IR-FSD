import { LightningElement } from "lwc";

export default class FinancialSnapshotParent extends LightningElement {
  items = [
    { key: "annualNoi", label: "Annual NOI", value: "$742K" },
    { key: "projectedExit", label: "Projected exit", value: "Q3 2028" }
  ];
}
