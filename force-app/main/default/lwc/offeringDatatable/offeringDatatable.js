import LightningDatatable from "lightning/datatable";
import pillColumn from "./pillColumn.html";

/**
 * Custom datatable that inherits all native lightning-datatable behaviour and
 * adds a `pill` cell type (a small rounded badge). The pill's inline style is
 * passed per-row via the `pillStyle` type attribute so it renders independently
 * of bundle CSS scoping.
 */
export default class OfferingDatatable extends LightningDatatable {
  static customTypes = {
    pill: {
      template: pillColumn,
      standardCellLayout: true,
      typeAttributes: ["pillStyle"]
    }
  };
}
