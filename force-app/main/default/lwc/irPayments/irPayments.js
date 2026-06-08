import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getPayments from "@salesforce/apex/PaymentsController.getPayments";

const DEFAULT_PERIOD_MONTHS = 18;

const CONTRIBUTION_COLUMNS = [
  { label: "Entity", fieldName: "entityName", type: "text", wrapText: true },
  {
    label: "Amount",
    fieldName: "amount",
    type: "currency",
    cellAttributes: { alignment: "right" },
    typeAttributes: { currencyCode: "USD", maximumFractionDigits: 0 }
  },
  { label: "Method", fieldName: "method", type: "text" },
  { label: "Wire", fieldName: "wireName", type: "text" },
  { label: "Date", fieldName: "contributionDate", type: "date-local" },
  { label: "Match Status", fieldName: "matchStatus", type: "text" }
];

/**
 * irPayments
 *
 * Page-level feature component for the IR Payments App Page. Makes a SINGLE
 * imperative Apex call (`PaymentsController.getPayments`) and distributes the
 * resulting `IRDTO.PaymentsDTO` down to focused/presentational children:
 *   - KPI row              -> iterates `c/kpiCard` (4 KPIs)
 *   - Inbound wire feed     -> `c/irWireFeed` (rows w/ confidence + status badges)
 *   - Contributions table   -> `c/dataTableCard`
 *
 * DATA PATTERN: imperative Apex (cacheable controller) in `connectedCallback`.
 * Children never call Apex — they only receive props. Errors surface via a toast.
 */
export default class IrPayments extends LightningElement {
  @track kpis = [];
  @track wires = [];
  @track contributions = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  contributionColumns = CONTRIBUTION_COLUMNS;

  /** Look-back window (months) for the "this period" feed. App-Builder configurable. */
  @api periodMonths = DEFAULT_PERIOD_MONTHS;

  _kpiAccents = ["navy", "blue", "teal"];
  _kpiIcons = {
    contributionsThisPeriod: "utility:moneybag",
    wiresReceived: "utility:money",
    wiresInReview: "utility:warning",
    wiresUnmatched: "utility:error"
  };

  connectedCallback() {
    this.loadPayments();
  }

  async loadPayments() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getPayments({ periodMonths: this.periodMonths });
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
    this.wires = dto.wires || [];
    this.contributions = (dto.contributions || []).map((row, index) => ({
      ...row,
      id: row.recordId || `contribution-${index}`
    }));
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) ||
      (error && error.message) ||
      "An unexpected error occurred while loading payments.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load Payments",
        message,
        variant: "error"
      })
    );
  }

  get hasKpis() {
    return this.kpis.length > 0;
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
