import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getContributions from "@salesforce/apex/OfferingWorkspaceController.getContributions";

/**
 * offeringContributions
 *
 * Tab feature component for the Offering Workspace "Contributions" tab. Fetches
 * `OfferingWorkspaceController.getContributions` and renders the contribution
 * feed in a `c/dataTableCard` (Entity, Amount, Method, Wire, Date, Match
 * Status). This component is the data-fetching parent for its presentational
 * `dataTableCard` child.
 *
 * DATA PATTERN: imperative cacheable Apex on connect; errors -> toast.
 */
const COLUMNS = [
  { label: "Entity", fieldName: "entityName", type: "text", wrapText: true },
  {
    label: "Amount",
    fieldName: "amount",
    type: "currency",
    typeAttributes: { minimumFractionDigits: 0 },
    cellAttributes: { alignment: "right" }
  },
  { label: "Method", fieldName: "method", type: "text" },
  { label: "Wire", fieldName: "wireName", type: "text" },
  { label: "Date", fieldName: "contributionDate", type: "date-local" },
  { label: "Match Status", fieldName: "matchStatus", type: "text" }
];

export default class OfferingContributions extends LightningElement {
  /** Offering__c record id, forwarded from the workspace host. */
  @api recordId;

  columns = COLUMNS;
  @track rows = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  connectedCallback() {
    this.loadContributions();
  }

  async loadContributions() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getContributions({ offeringId: this.recordId });
      this.rows = (data || []).map((row) => ({ ...row, id: row.recordId }));
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
      "An unexpected error occurred while loading contributions.";
    this.dispatchEvent(
      new ShowToastEvent({ title: "Unable to load contributions", message, variant: "error" })
    );
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
