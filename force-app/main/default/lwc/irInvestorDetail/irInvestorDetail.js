import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getInvestorDetail from "@salesforce/apex/InvestorDetailController.getInvestorDetail";

const POSITION_COLUMNS = [
  { label: "Entity", fieldName: "entityName", type: "text", wrapText: true },
  { label: "Units", fieldName: "units", type: "number", cellAttributes: { alignment: "right" } },
  {
    label: "LP Capital",
    fieldName: "lpCapital",
    type: "currency",
    cellAttributes: { alignment: "right" },
    typeAttributes: { currencyCode: "USD", maximumFractionDigits: 0 }
  },
  {
    label: "Equity %",
    fieldName: "equityPct",
    type: "percent",
    cellAttributes: { alignment: "right" },
    typeAttributes: { maximumFractionDigits: 2 }
  },
  {
    label: "Cost Basis",
    fieldName: "costBasis",
    type: "currency",
    cellAttributes: { alignment: "right" },
    typeAttributes: { currencyCode: "USD", maximumFractionDigits: 0 }
  },
  { label: "Status", fieldName: "status", type: "text" }
];

const COMMITMENT_COLUMNS = [
  { label: "Entity", fieldName: "entityName", type: "text", wrapText: true },
  {
    label: "Committed",
    fieldName: "committedAmount",
    type: "currency",
    cellAttributes: { alignment: "right" },
    typeAttributes: { currencyCode: "USD", maximumFractionDigits: 0 }
  },
  { label: "Status", fieldName: "status", type: "text" },
  { label: "Date", fieldName: "commitDate", type: "date-local" },
  { label: "Funded", fieldName: "funded", type: "boolean", cellAttributes: { alignment: "center" } }
];

const DISTRIBUTION_COLUMNS = [
  { label: "Entity", fieldName: "entityName", type: "text", wrapText: true },
  {
    label: "Equity %",
    fieldName: "equityPct",
    type: "percent",
    cellAttributes: { alignment: "right" },
    typeAttributes: { maximumFractionDigits: 2 }
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

const DOCUMENT_COLUMNS = [
  { label: "File Name", fieldName: "fileName", type: "text", wrapText: true },
  { label: "Category", fieldName: "category", type: "text" },
  { label: "Offering", fieldName: "offeringName", type: "text", wrapText: true },
  { label: "Uploaded", fieldName: "uploaded", type: "date-local" },
  {
    label: "Portal Visible",
    fieldName: "portalVisible",
    type: "boolean",
    cellAttributes: { alignment: "center" }
  }
];

/**
 * irInvestorDetail
 *
 * Record-page feature component for the Investor__c record page. Reads the host
 * `@api recordId`, makes a SINGLE imperative Apex call
 * (`InvestorDetailController.getInvestorDetail`) and distributes the resulting
 * `IRDTO.InvestorDetailDTO` down to focused / presentational children:
 *   - Summary KPIs   -> iterates `c/kpiCard` (Lifetime Invested, Commitments,
 *                       Active Positions, Entities) + a KYC `c/statusBadge`
 *   - Positions       -> `c/dataTableCard`
 *   - Commitments     -> `c/dataTableCard`
 *   - Distributions   -> `c/dataTableCard`
 *   - Documents       -> `c/dataTableCard`
 *
 * DATA PATTERN: imperative Apex (cacheable controller). The fetch is triggered by
 * the `recordId` setter (so it fires once the record context is available, and
 * re-fires if the host swaps records). Children never call Apex. Errors surface
 * via a toast.
 */
export default class IrInvestorDetail extends LightningElement {
  @track summary = [];
  @track positions = [];
  @track commitments = [];
  @track distributions = [];
  @track documents = [];

  investorName;
  tier;
  kycStatus;

  isLoading = true;
  hasError = false;
  loaded = false;
  notFound = false;

  positionColumns = POSITION_COLUMNS;
  commitmentColumns = COMMITMENT_COLUMNS;
  distributionColumns = DISTRIBUTION_COLUMNS;
  documentColumns = DOCUMENT_COLUMNS;

  _recordId;
  _kpiAccents = ["navy", "blue", "teal"];
  _kpiIcons = {
    lifetimeInvested: "utility:moneybag",
    totalCommitments: "utility:contract",
    activePositions: "utility:portfolio",
    investingEntities: "utility:company"
  };

  /** Investor__c record Id supplied by the record page. Drives the fetch. */
  @api
  get recordId() {
    return this._recordId;
  }
  set recordId(value) {
    this._recordId = value;
    if (value) {
      this.loadDetail(value);
    }
  }

  async loadDetail(investorId) {
    this.isLoading = true;
    this.hasError = false;
    this.notFound = false;
    try {
      const data = await getInvestorDetail({ investorId });
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
    if (!data) {
      this.notFound = true;
      return;
    }
    this.investorName = data.investorName;
    this.tier = data.tier;
    this.kycStatus = data.kycStatus;
    this.summary = (data.summary || []).map((kpi, index) => ({
      ...kpi,
      accent: this._kpiAccents[index % this._kpiAccents.length],
      iconName: this._kpiIcons[kpi.key] || "utility:metrics"
    }));
    this.positions = this.withKeys(data.positions, "investmentId", "position");
    this.commitments = this.withKeys(data.commitments, "recordId", "commitment");
    this.distributions = this.withKeys(data.distributions, "recordId", "distribution");
    this.documents = this.withKeys(data.documents, "recordId", "document");
  }

  /** Attach a stable `id` to each row for the datatable key-field. */
  withKeys(rows, idField, prefix) {
    return (rows || []).map((row, index) => ({
      ...row,
      id: row[idField] || `${prefix}-${index}`
    }));
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) ||
      (error && error.message) ||
      "An unexpected error occurred while loading the investor detail.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load Investor Detail",
        message,
        variant: "error"
      })
    );
  }

  get hasSummary() {
    return this.summary.length > 0;
  }

  get showContent() {
    return this.loaded && !this.hasError && !this.notFound;
  }
}
