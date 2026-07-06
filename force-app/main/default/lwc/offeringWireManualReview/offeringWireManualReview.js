import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { graphql } from "lightning/uiGraphQLApi";
import { COLUMNS, WIRE_ID_QUERY, getRecords, manualReview, toRows } from "c/wireMatchingShared";

/**
 * OfferingWireManualReview - the "Manual Review" wire matching category table.
 * Data comes from c/wireMatchingShared (in-memory seed, no server calls).
 */
export default class OfferingWireManualReview extends NavigationMixin(LightningElement) {
  // FlexiPage provides recordId; unused here - the component is fully self-contained.
  @api recordId;

  columns = COLUMNS;

  // Generated at runtime from the resolved Wire Id; every row links here.
  wireUrl;

  get _filtered() {
    return manualReview(getRecords(this.wireUrl));
  }

  get rows() {
    return toRows(this._filtered);
  }

  get summaryCount() {
    return this._filtered.length;
  }

  get hasRows() {
    return this._filtered.length > 0;
  }

  // Navigate to the Wire object list page, showing the "All" list view.
  handleViewAll(event) {
    event.preventDefault();
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Wire__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All"
      }
    });
  }

  @wire(graphql, { query: WIRE_ID_QUERY })
  wiredWire({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Unison__Wire__c?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachRecordUrl(edges[0].node.Id);
  }

  async attachRecordUrl(recordId) {
    try {
      this.wireUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Unison__Wire__c",
          actionName: "view"
        }
      });
    } catch (error) {
      // Leave rows without links if URL generation fails so the table still renders.
    }
  }
}
