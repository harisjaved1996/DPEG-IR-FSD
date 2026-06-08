import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getCommitments from "@salesforce/apex/OfferingWorkspaceController.getCommitments";

/**
 * offeringCommitments
 *
 * Tab feature component for the Offering Workspace "Commitments" tab. Fetches
 * `OfferingWorkspaceController.getCommitments` and renders the commitments in a
 * `c/dataTableCard` (Entity, Committed Amount, Status, Date, Funded). This
 * component is the data-fetching parent for its presentational `dataTableCard`
 * child.
 *
 * DATA PATTERN: imperative cacheable Apex on connect; errors -> toast.
 */
const COLUMNS = [
  { label: "Entity", fieldName: "entityName", type: "text", wrapText: true },
  {
    label: "Committed Amount",
    fieldName: "committedAmount",
    type: "currency",
    typeAttributes: { minimumFractionDigits: 0 },
    cellAttributes: { alignment: "right" }
  },
  { label: "Status", fieldName: "status", type: "text" },
  { label: "Date", fieldName: "commitDate", type: "date-local" },
  { label: "Funded", fieldName: "funded", type: "boolean", cellAttributes: { alignment: "center" } }
];

export default class OfferingCommitments extends LightningElement {
  /** Offering__c record id, forwarded from the workspace host. */
  @api recordId;

  columns = COLUMNS;
  @track rows = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  connectedCallback() {
    this.loadCommitments();
  }

  async loadCommitments() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getCommitments({ offeringId: this.recordId });
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
      "An unexpected error occurred while loading commitments.";
    this.dispatchEvent(
      new ShowToastEvent({ title: "Unable to load commitments", message, variant: "error" })
    );
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
