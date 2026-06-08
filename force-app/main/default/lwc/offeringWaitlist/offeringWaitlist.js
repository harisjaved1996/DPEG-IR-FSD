import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getWaitlist from "@salesforce/apex/OfferingWorkspaceController.getWaitlist";

/**
 * offeringWaitlist
 *
 * Tab feature component for the Offering Workspace "Waitlist" tab. Fetches
 * `OfferingWorkspaceController.getWaitlist` and renders the waitlist (ordered by
 * position) in a `c/dataTableCard` (Position, Entity, Amount, Added,
 * Auto-Promote). This component is the data-fetching parent for its
 * presentational `dataTableCard` child.
 *
 * DATA PATTERN: imperative cacheable Apex on connect; errors -> toast.
 */
const COLUMNS = [
  {
    label: "#",
    fieldName: "position",
    type: "number",
    fixedWidth: 64,
    cellAttributes: { alignment: "center" }
  },
  { label: "Entity", fieldName: "entityName", type: "text", wrapText: true },
  {
    label: "Amount",
    fieldName: "amount",
    type: "currency",
    typeAttributes: { minimumFractionDigits: 0 },
    cellAttributes: { alignment: "right" }
  },
  { label: "Added", fieldName: "added", type: "date-local" },
  {
    label: "Auto-Promote",
    fieldName: "autoPromote",
    type: "boolean",
    cellAttributes: { alignment: "center" }
  }
];

export default class OfferingWaitlist extends LightningElement {
  /** Offering__c record id, forwarded from the workspace host. */
  @api recordId;

  columns = COLUMNS;
  @track rows = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  connectedCallback() {
    this.loadWaitlist();
  }

  async loadWaitlist() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getWaitlist({ offeringId: this.recordId });
      // Controller/selector already orders by position; map for the key-field.
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
      "An unexpected error occurred while loading the waitlist.";
    this.dispatchEvent(
      new ShowToastEvent({ title: "Unable to load waitlist", message, variant: "error" })
    );
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
