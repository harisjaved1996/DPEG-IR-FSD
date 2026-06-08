import { LightningElement, api } from "lwc";

/**
 * dataTableCard
 *
 * Reusable card-wrapped data table. Renders a `lightning-datatable` inside a
 * `sectionCard`, shows a row-count badge and an empty state, and re-emits the
 * datatable's row events upward so feature components can react.
 *
 * PRESENTATIONAL / PURE: props in (`title`, `columns`, `rows`, `keyField`,
 * `iconName`), events out (`rowaction`, `rowselect`). No Apex/wire/LDS — the
 * parent feature component supplies already-fetched, mapped rows.
 *
 * @fires dataTableCard#rowaction Detail: { action, row } from the datatable.
 * @fires dataTableCard#rowselect Detail: { selectedRows } from the datatable.
 */
export default class DataTableCard extends LightningElement {
  _columns = [];
  _rows = [];

  /** Card heading. */
  @api title;
  /** Optional SLDS icon for the card header. */
  @api iconName;
  /** Field used as the datatable key-field. Defaults to 'id'. */
  @api keyField = "id";
  /**
   * Show the selection checkbox column. Defaults to false (column hidden) so
   * the public boolean defaults to false per the LWC contract.
   */
  @api showCheckboxColumn = false;
  /** Show the row-number column (default false). */
  @api showRowNumberColumn = false;
  /** Message shown when there are no rows. */
  @api emptyMessage = "No records to display";
  /** Compact padding on the wrapping card. */
  @api compact = false;

  /** lightning-datatable column definitions. */
  @api
  get columns() {
    return this._columns;
  }
  set columns(value) {
    this._columns = Array.isArray(value) ? value : [];
  }

  /** Row data array. */
  @api
  get rows() {
    return this._rows;
  }
  set rows(value) {
    this._rows = Array.isArray(value) ? value : [];
  }

  /** lightning-datatable hides the checkbox column unless explicitly shown. */
  get computedHideCheckbox() {
    return !this.showCheckboxColumn;
  }

  get hasRows() {
    return this._rows.length > 0;
  }

  get rowCount() {
    return this._rows.length;
  }

  handleRowAction(event) {
    const { action, row } = event.detail;
    this.dispatchEvent(
      new CustomEvent("rowaction", {
        detail: { action, row }
      })
    );
  }

  handleRowSelection(event) {
    this.dispatchEvent(
      new CustomEvent("rowselect", {
        detail: { selectedRows: event.detail.selectedRows }
      })
    );
  }
}
