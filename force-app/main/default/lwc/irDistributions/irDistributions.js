import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { formatCurrency } from "c/irFormatters";
import getDistributions from "@salesforce/apex/DistributionsController.getDistributions";

const DEFAULT_PERIOD_MONTHS = 18;

const BATCH_COLUMNS = [
  {
    label: "Batch",
    fieldName: "name",
    type: "button",
    typeAttributes: {
      label: { fieldName: "name" },
      name: "viewDetail",
      variant: "base"
    }
  },
  { label: "Offering", fieldName: "offeringName", type: "text", wrapText: true },
  { label: "Type", fieldName: "batchType", type: "text" },
  {
    label: "Total",
    fieldName: "totalAmount",
    type: "currency",
    cellAttributes: { alignment: "right" },
    typeAttributes: { currencyCode: "USD", maximumFractionDigits: 0 }
  },
  {
    label: "Investors",
    fieldName: "investorCount",
    type: "number",
    cellAttributes: { alignment: "right" }
  },
  {
    label: "ACH",
    fieldName: "achAmount",
    type: "currency",
    cellAttributes: { alignment: "right" },
    typeAttributes: { currencyCode: "USD", maximumFractionDigits: 0 }
  },
  {
    label: "Cheque",
    fieldName: "chequeAmount",
    type: "currency",
    cellAttributes: { alignment: "right" },
    typeAttributes: { currencyCode: "USD", maximumFractionDigits: 0 }
  },
  { label: "Status", fieldName: "status", type: "text" },
  { label: "Date", fieldName: "distDate", type: "date-local" }
];

/**
 * irDistributions
 *
 * Page-level feature component for the IR Distributions App Page. Makes a SINGLE
 * imperative Apex call (`DistributionsController.getDistributions`) and distributes
 * the resulting `IRDTO.DistributionsDTO` down to focused/presentational children:
 *   - KPI row              -> iterates `c/kpiCard` (4 KPIs)
 *   - ACH vs Cheque split  -> `c/sectionCard` > `c/donutChart`
 *   - Batch list           -> `c/dataTableCard`
 *
 * Selecting a batch row opens the focused `c/irDistributionBatchDetail` modal,
 * which owns its own narrowly-scoped getBatchDetail fetch. The parent does the
 * single primary fetch and passes the selected batchId down.
 *
 * DATA PATTERN: imperative Apex (cacheable controller) in `connectedCallback`.
 * Children never call the primary controller method. Errors surface via a toast.
 */
export default class IrDistributions extends LightningElement {
  @track kpis = [];
  @track batches = [];
  @track distributionSplit = [];

  selectedBatchId;
  selectedBatchName;

  isLoading = true;
  hasError = false;
  loaded = false;

  batchColumns = BATCH_COLUMNS;

  /** Look-back window (months) for "this period" KPIs. App-Builder configurable. */
  @api periodMonths = DEFAULT_PERIOD_MONTHS;

  _kpiAccents = ["navy", "blue", "teal"];
  _kpiIcons = {
    distributedThisPeriod: "utility:moneybag",
    investorsPaid: "utility:people",
    achShare: "utility:money",
    pendingApproval: "utility:approval"
  };

  connectedCallback() {
    this.loadDistributions();
  }

  async loadDistributions() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getDistributions({ periodMonths: this.periodMonths });
      this.applyData(data);
      this.loaded = true;
    } catch (error) {
      this.hasError = true;
      this.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  applyData(data) {
    const dto = data || {};
    this.kpis = (dto.kpis || []).map((kpi, index) => ({
      ...kpi,
      accent: this._kpiAccents[index % this._kpiAccents.length],
      iconName: this._kpiIcons[kpi.key] || "utility:metrics"
    }));
    const batches = (dto.batches || []).map((batch, index) => ({
      ...batch,
      id: batch.recordId || `batch-${index}`
    }));
    this.batches = batches;
    this.distributionSplit = this.buildSplit(batches);
  }

  /** Aggregate the batch ACH/Cheque amounts into the two donut slices. */
  buildSplit(batches) {
    let ach = 0;
    let cheque = 0;
    batches.forEach((batch) => {
      ach += Number(batch.achAmount) || 0;
      cheque += Number(batch.chequeAmount) || 0;
    });
    return [
      { label: "ACH", value: ach, colorToken: "teal" },
      { label: "Cheque", value: cheque, colorToken: "navy" }
    ];
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) ||
      (error && error.message) ||
      "An unexpected error occurred while loading distributions.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load Distributions",
        message,
        variant: "error"
      })
    );
  }

  /** Open the batch-detail modal for the selected row. */
  handleBatchAction(event) {
    const { action, row } = event.detail || {};
    if (!action || action.name !== "viewDetail" || !row) {
      return;
    }
    this.selectedBatchId = row.id;
    this.selectedBatchName = row.name;
  }

  handleDetailClose() {
    this.selectedBatchId = undefined;
    this.selectedBatchName = undefined;
  }

  get hasKpis() {
    return this.kpis.length > 0;
  }

  get hasSplit() {
    return this.distributionSplit.some((s) => Number(s.value) > 0);
  }

  /** Total distributed across batches for the donut center value. */
  get splitTotalText() {
    const total = this.distributionSplit.reduce((sum, s) => sum + (Number(s.value) || 0), 0);
    return formatCurrency(total);
  }

  get showDetail() {
    return Boolean(this.selectedBatchId);
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
