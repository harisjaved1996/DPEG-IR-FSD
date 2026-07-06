import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getBatchDetail from "@salesforce/apex/DistributionsController.getBatchDetail";

const COLUMNS = [
  { label: "Investor / Entity", fieldName: "entityName", type: "text", wrapText: true },
  {
    label: "Equity %",
    fieldName: "equityPct",
    type: "percent",
    cellAttributes: { alignment: "right" },
    typeAttributes: { minimumFractionDigits: 0, maximumFractionDigits: 2 }
  },
  {
    label: "Amount",
    fieldName: "amount",
    type: "currency",
    cellAttributes: { alignment: "right" },
    typeAttributes: { currencyCode: "USD", maximumFractionDigits: 0 }
  },
  { label: "Method", fieldName: "method", type: "text" },
  { label: "ACH Status", fieldName: "achStatus", type: "text" }
];

/**
 * irDistributionBatchDetail
 *
 * Focused child that loads and displays the per-investor distribution rows for a
 * SINGLE distribution batch. Rendered as a modal by the parent `irDistributions`
 * when a batch row is selected. It owns one narrowly-scoped imperative call
 * (`DistributionsController.getBatchDetail`) keyed by `batchId`; the parent owns
 * the primary `getDistributions` fetch. Re-fetches whenever `batchId` changes.
 *
 * DATA PATTERN: imperative Apex keyed by a reactive `@api batchId`. Errors surface
 * via a toast. Emits `close` so the parent can dismiss the modal.
 *
 * @fires irDistributionBatchDetail#close When the user dismisses the modal.
 */
export default class IrDistributionBatchDetail extends LightningElement {
  _batchId;

  @track rows = [];
  isLoading = false;
  hasError = false;
  loaded = false;

  columns = COLUMNS;

  /** The Distribution_Batch__c Id whose detail rows to display. */
  @api
  get batchId() {
    return this._batchId;
  }
  set batchId(value) {
    this._batchId = value;
    if (value) {
      this.loadDetail();
    } else {
      this.rows = [];
      this.loaded = false;
    }
  }

  /** Optional human-readable batch name shown in the modal header. */
  @api batchName;

  async loadDetail() {
    this.isLoading = true;
    this.hasError = false;
    this.loaded = false;
    try {
      const data = await getBatchDetail({ batchId: this._batchId });
      this.rows = (data || []).map((row, index) => ({
        ...row,
        // lightning-datatable percent type expects a 0-1 fraction.
        equityPct:
          row.equityPct === undefined || row.equityPct === null
            ? null
            : Number(row.equityPct) / 100,
        id: row.recordId || `dist-${index}`
      }));
      this.loaded = true;
    } catch (error) {
      this.hasError = true;
      this.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) ||
      (error && error.message) ||
      "An unexpected error occurred while loading the batch detail.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load batch detail",
        message,
        variant: "error"
      })
    );
  }

  handleClose() {
    this.dispatchEvent(new CustomEvent("close"));
  }

  get headerLabel() {
    return this.batchName ? `Batch Detail — ${this.batchName}` : "Batch Detail";
  }

  get hasRows() {
    return this.rows.length > 0;
  }

  get rowCount() {
    return this.rows.length;
  }

  get showEmpty() {
    return this.loaded && !this.hasError && !this.hasRows;
  }

  get showTable() {
    return this.loaded && !this.hasError && this.hasRows;
  }
}
