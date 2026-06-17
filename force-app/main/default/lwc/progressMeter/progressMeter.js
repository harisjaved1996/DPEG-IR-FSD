import { LightningElement, api } from "lwc";

/**
 * Presentational funded-progress meter used inside the offerings datatable.
 */
export default class ProgressMeter extends LightningElement {
  @api barStyle;
  @api pctStyle;
  @api pctLabel;
}
