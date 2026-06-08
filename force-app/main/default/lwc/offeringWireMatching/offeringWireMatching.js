import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { CONFIDENCE_BUCKET } from "c/irConstants";
import { formatCurrency } from "c/irFormatters";
import getWireMatching from "@salesforce/apex/OfferingWorkspaceController.getWireMatching";

/**
 * offeringWireMatching
 *
 * Tab feature component for the Offering Workspace "Wire Matching" tab. Fetches
 * `OfferingWorkspaceController.getWireMatching` (a list of confidence
 * `WireBucketDTO`s) and renders three buckets in display order — Auto-Settle
 * (>=99), Review (70-98), Unmatched (<70) — each as a `c/sectionCard` whose
 * header carries a `c/confidenceBadge` and whose body lists the wire detail
 * rows (each row also showing a per-wire `c/confidenceBadge`). This component
 * is the data-fetching parent for its presentational children.
 *
 * DATA PATTERN: imperative cacheable Apex on connect; errors -> toast.
 */
const BUCKET_ORDER = [
  { name: CONFIDENCE_BUCKET.AUTO_SETTLE, icon: "utility:check" },
  { name: CONFIDENCE_BUCKET.REVIEW, icon: "utility:warning" },
  { name: CONFIDENCE_BUCKET.UNMATCHED, icon: "utility:close" }
];

export default class OfferingWireMatching extends LightningElement {
  /** Offering__c record id, forwarded from the workspace host. */
  @api recordId;

  @track buckets = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  connectedCallback() {
    this.loadWires();
  }

  async loadWires() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getWireMatching({ offeringId: this.recordId });
      this.buckets = this.orderBuckets(data || []);
      this.loaded = true;
    } catch (error) {
      this.hasError = true;
      this.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  /** Arrange the returned buckets into the fixed Auto-Settle/Review/Unmatched order. */
  orderBuckets(rawBuckets) {
    const byName = {};
    rawBuckets.forEach((b) => {
      byName[b.bucket] = b;
    });
    return BUCKET_ORDER.map((cfg) => {
      const match = byName[cfg.name];
      const wires = match && match.wires ? match.wires : [];
      return {
        key: cfg.name,
        bucket: cfg.name,
        icon: cfg.icon,
        count: match ? match.count : 0,
        totalDisplay: formatCurrency(match ? match.totalAmount : 0),
        hasWires: wires.length > 0,
        wires: wires.map((w) => ({
          ...w,
          amountDisplay: formatCurrency(w.amount)
        }))
      };
    });
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) ||
      (error && error.message) ||
      "An unexpected error occurred while loading wire matching.";
    this.dispatchEvent(
      new ShowToastEvent({ title: "Unable to load wire matching", message, variant: "error" })
    );
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
