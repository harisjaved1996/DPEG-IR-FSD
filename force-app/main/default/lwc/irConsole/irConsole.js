import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import { formatCurrency } from "c/irFormatters";
import getConsole from "@salesforce/apex/IRConsoleController.getConsole";

/**
 * irConsole
 *
 * Page-level feature component for the IR Console App Page. Makes a SINGLE
 * imperative Apex call (`IRConsoleController.getConsole`) and distributes the
 * resulting `IRDTO.ConsoleDTO` down to focused/presentational children:
 *   - KPI row              -> iterates `c/kpiCard`
 *   - Active Offerings     -> `c/irActiveOfferingsTable` (wraps `c/dataTableCard`)
 *   - Distribution Split   -> `c/sectionCard` > `c/donutChart` (ACH vs Cheque)
 *   - Action Queue         -> `c/sectionCard` > `c/irActionQueue`
 *   - Automation Baselines -> static `c/sectionCard`
 *
 * DATA PATTERN: imperative Apex (cacheable controller) in `connectedCallback`.
 * Children never call Apex. Errors surface via a toast. `NavigationMixin` is
 * used only to open a record when an action-queue item is selected.
 */
export default class IrConsole extends NavigationMixin(LightningElement) {
  @track kpis = [];
  @track activeOfferings = [];
  @track distributionSplit = [];
  @track actionQueue = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  _kpiAccents = ["navy", "blue", "teal"];
  _kpiIcons = {
    raisedThisPeriod: "utility:moneybag",
    wiresInReview: "utility:warning",
    wiresUnmatched: "utility:error",
    totalInvestors: "utility:people",
    onboardingQueue: "utility:add_contact",
    pendingSignatures: "utility:edit_form"
  };

  // Static automation baselines surfaced as an at-a-glance reference card.
  automationBaselines = [
    { key: "autoSettle", label: "Wire auto-settle confidence", value: "≥ 99%" },
    { key: "reviewBand", label: "Wire review band", value: "70 – 98%" },
    { key: "distPeriod", label: "Distribution KPI window", value: "18 months" },
    { key: "owd", label: "Financial object sharing", value: "Private (OWD)" }
  ];

  connectedCallback() {
    this.loadConsole();
  }

  async loadConsole() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getConsole();
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
    this.activeOfferings = dto.activeOfferings || [];
    // Map split slices onto donut input shape ({ label, value, colorToken }).
    this.distributionSplit = (dto.distributionSplit || []).map((slice) => ({
      label: slice.label,
      value: Number(slice.amount) || 0,
      colorToken: slice.colorToken
    }));
    this.actionQueue = dto.actionQueue || [];
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) ||
      (error && error.message) ||
      "An unexpected error occurred while loading the console.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load IR Console",
        message,
        variant: "error"
      })
    );
  }

  handleActionSelect(event) {
    const { recordId, objectApiName } = event.detail || {};
    if (!recordId) {
      return;
    }
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId,
        objectApiName,
        actionName: "view"
      }
    });
  }

  get hasKpis() {
    return this.kpis.length > 0;
  }

  get hasSplit() {
    return this.distributionSplit.some((s) => Number(s.value) > 0);
  }

  /** Total distributed amount for the donut center value. */
  get splitTotalText() {
    const total = this.distributionSplit.reduce((sum, s) => sum + (Number(s.value) || 0), 0);
    return formatCurrency(total);
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
