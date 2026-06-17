import LightningDatatable from "lightning/datatable";
import pill from "./pill.html";
import progressBar from "./progressBar.html";
import emailLink from "./emailLink.html";

/**
 * Shared custom datatable extending the native lightning-datatable so every list
 * keeps the exact Salesforce table look and feel, while still rendering light
 * rectangular status/type pills and a progress meter as custom column types.
 *
 * Custom column types:
 *  - pill        : renders c-stage-pill  (typeAttributes: variant)
 *  - progressBar : renders c-progress-meter (typeAttributes: barStyle, pctStyle, pctLabel)
 *  - emailLink   : mailto link with no envelope icon
 */
export default class PillDatatable extends LightningDatatable {
  static customTypes = {
    pill: {
      template: pill,
      standardCellLayout: true,
      typeAttributes: ["variant"]
    },
    progressBar: {
      template: progressBar,
      standardCellLayout: true,
      typeAttributes: ["barStyle", "pctStyle", "pctLabel"]
    },
    emailLink: {
      template: emailLink,
      standardCellLayout: true,
      typeAttributes: []
    }
  };
}
