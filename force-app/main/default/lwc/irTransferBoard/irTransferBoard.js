import { LightningElement, api } from "lwc";
import { formatCurrency } from "c/irFormatters";

/**
 * irTransferBoard
 *
 * Focused presentational child that renders the share-transfer lifecycle board:
 * one lane per status (`IRDTO.TransferLaneDTO`), each lane showing a status badge
 * header with a count and the transfer cards that belong to that status. A
 * `lightning-datatable` cannot host the custom `c/statusBadge`, so this component
 * lays out the lanes/cards by hand inside the shared `c/sectionCard`.
 *
 * PRESENTATIONAL / PURE: `lanes` array in, `transferselect` event out. No
 * Apex/wire/LDS. The parent page component supplies already-fetched lanes.
 *
 * Expected `lanes` shape (IRDTO.TransferLaneDTO):
 *   { status, count, items: [IRDTO.TransferRowDTO] }
 *
 * @fires irTransferBoard#transferselect Detail: { recordId } when a card is activated.
 */
export default class IrTransferBoard extends LightningElement {
  _lanes = [];

  /** Card title (overridable). */
  @api title = "Transfer Lifecycle";

  /** Array of lifecycle lane DTOs. */
  @api
  get lanes() {
    return this._lanes;
  }
  set lanes(value) {
    this._lanes = Array.isArray(value) ? value : [];
  }

  /** Per-lane view-model: stable key + formatted transfer cards. */
  get laneViews() {
    return this._lanes.map((lane, laneIndex) => ({
      key: lane.status || `lane-${laneIndex}`,
      status: lane.status,
      count: lane.count || (Array.isArray(lane.items) ? lane.items.length : 0),
      cards: (lane.items || []).map((item, itemIndex) => ({
        key: item.recordId || `${lane.status}-${itemIndex}`,
        recordId: item.recordId,
        name: item.name || "—",
        fromEntity: item.fromEntity || "—",
        toEntity: item.toEntity || "—",
        offeringName: item.offeringName || "—",
        unitsText: item.units === undefined || item.units === null ? "—" : String(item.units),
        amountText: formatCurrency(item.amount)
      }))
    }));
  }

  get hasLanes() {
    return this._lanes.length > 0;
  }

  handleSelect(event) {
    const recordId = event.currentTarget.dataset.id;
    if (!recordId) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("transferselect", {
        detail: { recordId }
      })
    );
  }
}
