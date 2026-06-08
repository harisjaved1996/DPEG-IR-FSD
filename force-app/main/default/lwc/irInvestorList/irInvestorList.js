import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import getInvestors from "@salesforce/apex/InvestorListController.getInvestors";

/**
 * irInvestorList
 *
 * Page-level feature component for the IR Investors App Page. Makes the imperative
 * Apex call (`InvestorListController.getInvestors`) and distributes the resulting
 * `List<IRDTO.InvestorRowDTO>` down to focused / presentational children:
 *   - Tier filter   -> `c/irTierFilter` (emits tierchange)
 *   - Investor list  -> `c/irInvestorTable` (tier pill + KYC badge per row)
 *
 * The initial load calls `getInvestors(null)` (all tiers). When the filter child
 * emits `tierchange`, the parent RE-FETCHES `getInvestors(tier)` so the list
 * reflects the selected tier. When the table child emits `investorselect`, the
 * parent navigates to the Investor__c record page via `NavigationMixin`.
 *
 * DATA PATTERN: imperative Apex (cacheable controller). Children never call Apex —
 * they only receive props and emit events. Errors surface via a toast.
 */
export default class IrInvestorList extends NavigationMixin(LightningElement) {
  @track investors = [];

  selectedTier = null;

  isLoading = true;
  hasError = false;
  loaded = false;

  connectedCallback() {
    this.loadInvestors(null);
  }

  async loadInvestors(tier) {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getInvestors({ tier });
      this.investors = Array.isArray(data) ? data : [];
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
      "An unexpected error occurred while loading investors.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load Investors",
        message,
        variant: "error"
      })
    );
  }

  /** Re-fetch the investor list for the newly selected tier. */
  handleTierChange(event) {
    const { tier } = event.detail || {};
    this.selectedTier = tier || null;
    this.loadInvestors(this.selectedTier);
  }

  /** Navigate to the selected Investor__c record page. */
  handleInvestorSelect(event) {
    const { recordId } = event.detail || {};
    if (!recordId) {
      return;
    }
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId,
        objectApiName: "Investor__c",
        actionName: "view"
      }
    });
  }

  get investorCount() {
    return this.investors.length;
  }

  /** True before the first successful load (full-page spinner shown). */
  get hasNoContentYet() {
    return !this.loaded;
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
