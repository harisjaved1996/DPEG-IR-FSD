import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getRoster from "@salesforce/apex/OfferingWorkspaceController.getRoster";

/**
 * offeringRoster
 *
 * Tab feature component for the Offering Workspace "Roster" tab. Fetches
 * `OfferingWorkspaceController.getRoster` and renders the investment positions
 * in a `c/dataTableCard` (Investor/Entity, Units, LP Capital, Equity %,
 * Cost Basis, Status). This component is the data-fetching parent for its
 * presentational `dataTableCard` child.
 *
 * DATA PATTERN: imperative cacheable Apex on connect; errors -> toast.
 */
const COLUMNS = [
  { label: "Investor / Entity", fieldName: "entityName", type: "text", wrapText: true },
  {
    label: "Units",
    fieldName: "units",
    type: "number",
    cellAttributes: { alignment: "right" }
  },
  {
    label: "LP Capital",
    fieldName: "lpCapital",
    type: "currency",
    typeAttributes: { minimumFractionDigits: 0 },
    cellAttributes: { alignment: "right" }
  },
  {
    label: "Equity %",
    fieldName: "equityPct",
    type: "percent",
    typeAttributes: { minimumFractionDigits: 1, maximumFractionDigits: 2 },
    cellAttributes: { alignment: "right" }
  },
  {
    label: "Cost Basis",
    fieldName: "costBasis",
    type: "currency",
    typeAttributes: { minimumFractionDigits: 0 },
    cellAttributes: { alignment: "right" }
  },
  { label: "Status", fieldName: "status", type: "text" }
];

export default class OfferingRoster extends LightningElement {
  /** Offering__c record id, forwarded from the workspace host. */
  @api recordId;

  columns = COLUMNS;
  @track rows = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  connectedCallback() {
    this.loadRoster();
  }

  async loadRoster() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getRoster({ offeringId: this.recordId });
      // lightning-datatable percent cells expect a 0-1 fraction; DTO equityPct
      // is a whole-number percent, so scale it for display.
      this.rows = (data || []).map((row) => ({
        ...row,
        id: row.investmentId,
        equityPct:
          row.equityPct === null || row.equityPct === undefined ? null : row.equityPct / 100
      }));
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
      "An unexpected error occurred while loading the roster.";
    this.dispatchEvent(
      new ShowToastEvent({ title: "Unable to load roster", message, variant: "error" })
    );
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
