import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getOnboarding from "@salesforce/apex/OnboardingController.getOnboarding";

/**
 * irOnboarding
 *
 * Page-level feature component for the IR Onboarding App Page. Makes a SINGLE
 * imperative Apex call (`OnboardingController.getOnboarding`) and distributes the
 * resulting `IRDTO.OnboardingDTO` down to focused/presentational children:
 *   - KPI row              -> iterates `c/kpiCard` (Open Queue, Invited, + per-KYC tiles)
 *   - Lead queue            -> `c/irLeadQueue` (rows w/ KYC + portal-invite badges)
 *
 * DATA PATTERN: imperative Apex (cacheable controller) in `connectedCallback`.
 * Children never call Apex — they only receive props. Errors surface via a toast.
 */
export default class IrOnboarding extends LightningElement {
  @track kpis = [];
  @track leads = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  // Accent rotation so the KPI row reads as a branded set. The KPI count is
  // dynamic (Open Queue + Invited + one tile per KYC status), so the icon falls
  // back to a metrics glyph for the per-status tiles.
  _kpiAccents = ["navy", "blue", "teal"];
  _kpiIcons = {
    openQueue: "utility:add_contact",
    invited: "utility:email"
  };

  connectedCallback() {
    this.loadOnboarding();
  }

  async loadOnboarding() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getOnboarding();
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
      iconName: this._kpiIcons[kpi.key] || "utility:identity"
    }));
    this.leads = dto.leads || [];
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) ||
      (error && error.message) ||
      "An unexpected error occurred while loading onboarding.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load Onboarding",
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
