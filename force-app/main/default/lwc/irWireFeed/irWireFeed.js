import { LightningElement, api } from "lwc";
import { formatCurrency, formatDateTime } from "c/irFormatters";

/**
 * irWireFeed
 *
 * Focused presentational child that renders the inbound Wire feed for the IR
 * Payments screen. A `lightning-datatable` cannot host the custom
 * `c/confidenceBadge` / `c/statusBadge` in a cell, so this component lays out one
 * row per wire (Sender, Amount, Memo, Received, Confidence badge, Match Status
 * badge) inside the shared `c/sectionCard`.
 *
 * PRESENTATIONAL / PURE: `wires` array in, no Apex/wire/LDS. No events.
 *
 * Expected `wires` shape (IRDTO.WireRowDTO):
 *   { recordId, sender, amount, memo, received, confidence, bucket, matchStatus,
 *     matchedAccount }
 */
export default class IrWireFeed extends LightningElement {
  _wires = [];

  /** Card title (overridable). */
  @api title = "Inbound Wire Feed";

  /** Array of wire row DTOs. */
  @api
  get wires() {
    return this._wires;
  }
  set wires(value) {
    this._wires = Array.isArray(value) ? value : [];
  }

  /** Per-row view-model: formatted figures + badge inputs. */
  get rows() {
    return this._wires.map((wire, index) => ({
      key: wire.recordId || `wire-${index}`,
      sender: wire.sender || "—",
      amountText: formatCurrency(wire.amount),
      memo: wire.memo || "—",
      receivedText: formatDateTime(wire.received),
      confidence: wire.confidence,
      bucket: wire.bucket,
      matchStatus: wire.matchStatus,
      matchedAccount: wire.matchedAccount
    }));
  }

  get hasWires() {
    return this._wires.length > 0;
  }

  get rowCount() {
    return this._wires.length;
  }
}
