import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getSignatures from "@salesforce/apex/OfferingWorkspaceController.getSignatures";

/**
 * offeringSignatures
 *
 * Tab feature component for the Offering Workspace "Signatures" tab. Fetches
 * `OfferingWorkspaceController.getSignatures` and renders the subscription-doc
 * signature rows in a `c/dataTableCard` (Entity, Primary sig, Secondary sig,
 * Finalized, Funding Instructions). This component is the data-fetching parent
 * for its presentational `dataTableCard` child.
 *
 * DATA PATTERN: imperative cacheable Apex on connect; errors -> toast.
 */
const COLUMNS = [
  { label: "Entity", fieldName: "entityName", type: "text", wrapText: true },
  { label: "Primary Signature", fieldName: "primaryStatus", type: "text" },
  { label: "Secondary Signature", fieldName: "secondaryStatus", type: "text" },
  {
    label: "Finalized",
    fieldName: "finalized",
    type: "boolean",
    cellAttributes: { alignment: "center" }
  },
  { label: "Funding Instructions", fieldName: "fundingInstructions", type: "text" }
];

export default class OfferingSignatures extends LightningElement {
  /** Offering__c record id, forwarded from the workspace host. */
  @api recordId;

  columns = COLUMNS;
  @track rows = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  connectedCallback() {
    this.loadSignatures();
  }

  async loadSignatures() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getSignatures({ offeringId: this.recordId });
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
      "An unexpected error occurred while loading signatures.";
    this.dispatchEvent(
      new ShowToastEvent({ title: "Unable to load signatures", message, variant: "error" })
    );
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
