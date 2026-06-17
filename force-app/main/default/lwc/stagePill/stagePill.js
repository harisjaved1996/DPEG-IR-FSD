import { LightningElement, api } from "lwc";

/**
 * Presentational stage pill used inside the offerings datatable.
 * Light tinted background, rectangular shape, and a colored status dot.
 */
export default class StagePill extends LightningElement {
  @api label;
  @api variant; // gray | blue | purple | orange | teal | green | red

  get pillClass() {
    const v = this.variant || "gray";
    return `pill pill_${v}`;
  }
}
