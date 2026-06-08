import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getPortfolio from "@salesforce/apex/PortfolioController.getPortfolio";

/**
 * irPortfolio
 *
 * Page-level feature component for the Active Investments (Portfolio) App Page.
 * Makes a SINGLE imperative Apex call (`PortfolioController.getPortfolio`) and
 * distributes the resulting `IRDTO.PortfolioDTO` down to focused/presentational
 * children:
 *   - KPI row              -> iterates `c/kpiCard` (6 portfolio KPIs)
 *   - Investment cards     -> iterates `c/irPortfolioCard` (one per active offering)
 *
 * DATA PATTERN: imperative Apex (cacheable controller) in `connectedCallback`.
 * Children never call Apex — they only receive props. Errors surface via a toast
 * (`lightning/platformShowToastEvent`).
 */
export default class IrPortfolio extends LightningElement {
  @track kpis = [];
  @track cards = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  // Accent rotation so the KPI row reads as a branded set.
  _kpiAccents = ["navy", "blue", "teal"];
  // Per-KPI icon hints keyed by the DTO `key`.
  _kpiIcons = {
    activeInvestments: "utility:opportunity",
    lpCapitalDeployed: "utility:moneybag",
    totalLpInvestors: "utility:people",
    distributedToDate: "utility:share",
    avgIrr: "utility:trending",
    nearestExit: "utility:event"
  };

  connectedCallback() {
    this.loadPortfolio();
  }

  async loadPortfolio() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getPortfolio();
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
    this.cards = (dto.cards || []).map((card, index) => ({
      ...card,
      key: card.offeringId || `card-${index}`
    }));
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) ||
      (error && error.message) ||
      "An unexpected error occurred while loading the portfolio.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load Active Investments",
        message,
        variant: "error"
      })
    );
  }

  get hasKpis() {
    return this.kpis.length > 0;
  }

  get hasCards() {
    return this.cards.length > 0;
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
