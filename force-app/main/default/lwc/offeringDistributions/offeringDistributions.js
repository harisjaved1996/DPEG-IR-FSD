import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getDistributionBatches from "@salesforce/apex/OfferingWorkspaceController.getDistributionBatches";

/**
 * offeringDistributions
 *
 * Tab feature component for the Offering Workspace "Distributions" tab. Fetches
 * `OfferingWorkspaceController.getDistributionBatches` and renders the
 * distribution batches in a `c/dataTableCard` (Batch, Type, Total, ACH, Cheque,
 * Status, Date). This component is the data-fetching parent for its
 * presentational `dataTableCard` child.
 *
 * DATA PATTERN: imperative cacheable Apex on connect; errors -> toast.
 */
const COLUMNS = [
  { label: "Batch", fieldName: "name", type: "text", wrapText: true },
  { label: "Type", fieldName: "batchType", type: "text" },
  {
    label: "Total",
    fieldName: "totalAmount",
    type: "currency",
    typeAttributes: { minimumFractionDigits: 0 },
    cellAttributes: { alignment: "right" }
  },
  {
    label: "ACH",
    fieldName: "achAmount",
    type: "currency",
    typeAttributes: { minimumFractionDigits: 0 },
    cellAttributes: { alignment: "right" }
  },
  {
    label: "Cheque",
    fieldName: "chequeAmount",
    type: "currency",
    typeAttributes: { minimumFractionDigits: 0 },
    cellAttributes: { alignment: "right" }
  },
  { label: "Status", fieldName: "status", type: "text" },
  { label: "Date", fieldName: "distDate", type: "date-local" }
];

export default class OfferingDistributions extends LightningElement {
  /** Offering__c record id, forwarded from the workspace host. */
  @api recordId;

  columns = COLUMNS;
  @track rows = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  connectedCallback() {
    this.loadBatches();
  }

  async loadBatches() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getDistributionBatches({ offeringId: this.recordId });
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
      "An unexpected error occurred while loading distribution batches.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load distribution batches",
        message,
        variant: "error"
      })
    );
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
