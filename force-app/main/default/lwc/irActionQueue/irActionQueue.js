import { LightningElement, api } from "lwc";
import { formatCurrency } from "c/irFormatters";

const CATEGORY_ICON = {
  Signature: "utility:edit_form",
  Waitlist: "utility:clock",
  Wire: "utility:money",
  Default: "utility:task"
};

/**
 * irActionQueue
 *
 * Focused presentational child that lists the IR Console operational action
 * queue (unsigned subscription docs, active waitlist entries, wires in review /
 * unmatched). Receives an already-fetched `items` array from its parent page
 * component and renders each row with a `c/statusBadge`. Emits `itemselect`
 * when a row is activated so the parent can navigate to the record.
 *
 * PRESENTATIONAL / PURE: props in, `itemselect` out. No Apex/wire/LDS.
 *
 * Expected `items` shape (IRDTO.ActionItemDTO):
 *   { recordId, category, label, sublabel, amount, status, objectApiName }
 */
export default class IrActionQueue extends LightningElement {
  _items = [];

  /** Array of action-item DTOs. */
  @api
  get items() {
    return this._items;
  }
  set items(value) {
    this._items = Array.isArray(value) ? value : [];
  }

  get hasItems() {
    return this._items.length > 0;
  }

  get itemCount() {
    return this._items.length;
  }

  /** Per-row view-model with icon + formatted amount. */
  get rows() {
    return this._items.map((item, index) => ({
      key: item.recordId || `action-${index}`,
      recordId: item.recordId,
      objectApiName: item.objectApiName,
      category: item.category,
      iconName: CATEGORY_ICON[item.category] || CATEGORY_ICON.Default,
      label: item.label,
      sublabel: item.sublabel,
      status: item.status,
      hasAmount: item.amount !== undefined && item.amount !== null,
      amountText: formatCurrency(item.amount)
    }));
  }

  handleSelect(event) {
    const recordId = event.currentTarget.dataset.id;
    const objectApiName = event.currentTarget.dataset.object;
    this.dispatchEvent(
      new CustomEvent("itemselect", {
        detail: { recordId, objectApiName }
      })
    );
  }
}
