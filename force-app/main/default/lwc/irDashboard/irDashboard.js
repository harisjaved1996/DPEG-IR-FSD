import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getDashboard from "@salesforce/apex/IRDashboardController.getDashboard";

/**
 * irDashboard
 *
 * Page-level feature component for the IR Dashboard App Page. Makes a SINGLE
 * imperative Apex call (`IRDashboardController.getDashboard`) and distributes the
 * resulting `IRDTO.DashboardDTO` down to focused/presentational children:
 *   - KPI row              -> iterates `c/kpiCard`
 *   - Active Offerings     -> `c/sectionCard` > `c/irOfferingProgressList`
 *   - Commitment Funnel    -> `c/sectionCard` > `c/funnelChart`
 *
 * DATA PATTERN: imperative Apex (cacheable controller) in `connectedCallback`.
 * Children never call Apex — they only receive props. Errors surface via a
 * toast (`lightning/platformShowToastEvent`).
 */
export default class IrDashboard extends LightningElement {
  @track kpis = [];
  @track activeOfferings = [];
  @track funnel = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  // Accent rotation for the KPI tiles so the row reads as a branded set.
  _kpiAccents = ["navy", "blue", "teal"];
  // Per-KPI icon hints keyed by the DTO `key`.
  _kpiIcons = {
    activeOfferings: "utility:opportunity",
    totalCommitted: "utility:contract",
    totalRaised: "utility:moneybag",
    totalDistributed: "utility:share",
    activeInvestors: "utility:people",
    pendingAccreditation: "utility:approval"
  };

  connectedCallback() {
    this.loadDashboard();
  }

  async loadDashboard() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getDashboard();
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
    this.funnel = dto.funnel || [];
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) ||
      (error && error.message) ||
      "An unexpected error occurred while loading the dashboard.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load IR Dashboard",
        message,
        variant: "error"
      })
    );
  }

  get hasKpis() {
    return this.kpis.length > 0;
  }

  get hasFunnel() {
    return this.funnel.length > 0;
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
