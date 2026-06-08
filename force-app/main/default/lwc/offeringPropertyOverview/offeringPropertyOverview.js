import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { formatCurrency, formatCurrencyAbbrev, formatPercent, formatNumber } from "c/irFormatters";
import getPropertyOverview from "@salesforce/apex/OfferingWorkspaceController.getPropertyOverview";

/**
 * offeringPropertyOverview
 *
 * Tab feature component for the Offering Workspace "Property Overview" tab.
 * Fetches `OfferingWorkspaceController.getPropertyOverview` and renders the
 * property detail and financial-snapshot field grids inside `c/sectionCard`
 * shells. This component is the data-fetching parent for its presentational
 * children (the section cards / field lists).
 *
 * DATA PATTERN: imperative cacheable Apex on connect; errors -> toast.
 */
export default class OfferingPropertyOverview extends LightningElement {
  /** Offering__c record id, forwarded from the workspace host. */
  @api recordId;

  propertyName = "";
  @track detailFields = [];
  @track financialFields = [];

  isLoading = true;
  hasError = false;
  loaded = false;
  hasProperty = false;

  connectedCallback() {
    this.loadOverview();
  }

  async loadOverview() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getPropertyOverview({ offeringId: this.recordId });
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
      this.hasProperty = false;
      return;
    }
    this.hasProperty = true;
    this.propertyName = data.name || "";

    const yearRange = data.yearRenovated
      ? `${formatNumber(data.yearBuilt)} (renovated ${formatNumber(data.yearRenovated)})`
      : formatNumber(data.yearBuilt);

    this.detailFields = [
      { key: "type", label: "Property Type", value: this.orDash(data.propertyType) },
      { key: "address", label: "Address", value: this.orDash(data.address) },
      { key: "county", label: "County", value: this.orDash(data.county) },
      { key: "submarket", label: "Submarket", value: this.orDash(data.submarket) },
      { key: "sqft", label: "Rentable Sq Ft", value: formatNumber(data.rentableSqFt) },
      { key: "units", label: "Units", value: formatNumber(data.units) },
      { key: "year", label: "Year Built", value: yearRange },
      { key: "occupancy", label: "Occupancy", value: formatPercent(data.occupancyPct) }
    ];

    this.financialFields = [
      { key: "noi", label: "Annual NOI", value: formatCurrency(data.annualNoi) },
      { key: "cap", label: "Cap Rate", value: formatPercent(data.capRate) },
      { key: "coc", label: "Cash on Cash", value: formatPercent(data.cashOnCash) },
      { key: "irr", label: "IRR To Date", value: formatPercent(data.irrToDate) },
      { key: "targetIrr", label: "Target IRR", value: formatPercent(data.targetIrr) },
      { key: "exit", label: "Projected Exit", value: this.orDash(data.projectedExit) },
      { key: "lp", label: "LP Capital", value: formatCurrencyAbbrev(data.lpCapital) },
      { key: "stake", label: "DPEG Stake", value: formatPercent(data.dpegStake) },
      { key: "lender", label: "Lender", value: this.orDash(data.lender) },
      { key: "debt", label: "Debt Structure", value: this.orDash(data.debtStructure) }
    ];
  }

  orDash(value) {
    return value === null || value === undefined || value === "" ? "—" : value;
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) ||
      (error && error.message) ||
      "An unexpected error occurred while loading the property overview.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load property overview",
        message,
        variant: "error"
      })
    );
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }

  get showEmpty() {
    return this.showContent && !this.hasProperty;
  }
}
