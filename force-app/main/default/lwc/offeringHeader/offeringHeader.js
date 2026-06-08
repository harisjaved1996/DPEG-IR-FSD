import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { formatCurrencyAbbrev, formatPercent, formatNumber, formatDate } from "c/irFormatters";
import getHeader from "@salesforce/apex/OfferingWorkspaceController.getHeader";

/**
 * offeringHeader
 *
 * Feature component for the Offering Workspace header. Makes ONE imperative
 * Apex call (`OfferingWorkspaceController.getHeader`) and distributes the
 * resulting `IRDTO.OfferingHeaderDTO` to presentational children:
 *   - 8-stage lifecycle -> `c/stageTracker`
 *   - KPI row (Target, Amount Raised, Raised %, Overbook Cap, Committed count,
 *     Closing date) -> 6x `c/kpiCard`
 *
 * DATA PATTERN: imperative Apex (cacheable controller) in `connectedCallback`.
 * Children never call Apex. Errors surface via a toast.
 */
export default class OfferingHeader extends LightningElement {
  /** Offering__c record id, forwarded from the workspace host. */
  @api recordId;

  @track stages = [];
  currentStageIndex = 0;
  offeringName = "";
  offeringDisplayId = "";
  status = "";
  @track kpis = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  connectedCallback() {
    this.loadHeader();
  }

  async loadHeader() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getHeader({ offeringId: this.recordId });
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
    this.offeringName = dto.name || "";
    this.offeringDisplayId = dto.offeringDisplayId || "";
    this.status = dto.status || "";
    this.stages = dto.stages || [];
    this.currentStageIndex = Number.isFinite(Number(dto.currentStageIndex))
      ? Number(dto.currentStageIndex)
      : 0;
    this.kpis = this.buildKpis(dto);
  }

  /** Map the header DTO into the six pre-formatted KPI tiles shown in the row. */
  buildKpis(dto) {
    return [
      {
        key: "targetRaise",
        label: "Target Raise",
        displayValue: formatCurrencyAbbrev(dto.targetRaise),
        unit: "currency",
        iconName: "utility:goal",
        accent: "navy"
      },
      {
        key: "amountRaised",
        label: "Amount Raised",
        displayValue: formatCurrencyAbbrev(dto.amountRaised),
        unit: "currency",
        iconName: "utility:moneybag",
        accent: "blue"
      },
      {
        key: "raisedPct",
        label: "Raised %",
        displayValue: formatPercent(dto.raisedPct),
        unit: "percent",
        iconName: "utility:percent",
        accent: "teal"
      },
      {
        key: "overbookCap",
        label: "Overbook Cap",
        displayValue: formatCurrencyAbbrev(dto.overbookCap),
        unit: "currency",
        iconName: "utility:upload",
        accent: "navy"
      },
      {
        key: "committedCount",
        label: "Committed Investors",
        displayValue: formatNumber(dto.committedCount),
        unit: "number",
        iconName: "utility:people",
        accent: "blue"
      },
      {
        key: "closingDate",
        label: "Closing Date",
        displayValue: formatDate(dto.closingDate),
        unit: "number",
        iconName: "utility:event",
        accent: "teal"
      }
    ];
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) ||
      (error && error.message) ||
      "An unexpected error occurred while loading the offering header.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load offering header",
        message,
        variant: "error"
      })
    );
  }

  get hasStages() {
    return this.stages.length > 0;
  }

  get hasKpis() {
    return this.kpis.length > 0;
  }

  get titleText() {
    if (this.offeringName && this.offeringDisplayId) {
      return `${this.offeringName} · ${this.offeringDisplayId}`;
    }
    return this.offeringName || this.offeringDisplayId || "";
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
