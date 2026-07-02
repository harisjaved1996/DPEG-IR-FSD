import { LightningElement, api } from "lwc";

/**
 * docuSignPlacedField (stateless)
 *
 * Renders ONE placed field box on the visual PDF tagger's page overlay. Props are all in CSS
 * pixels already converted from DocuSign points by the parent (the parent owns the points→px
 * math so this child never touches the render scale). Props in, events out — no Apex, no state
 * beyond the transient drag bookkeeping needed to compute a move delta.
 *
 * Events dispatched to the parent (c-docu-sign-visual-tagger):
 *   - remove : detail { id }                       — user clicked the × button
 *   - move   : detail { id, deltaX, deltaY }        — user dragged the box (delta in CSS px)
 */
export default class DocuSignPlacedField extends LightningElement {
  /** Stable client key for this placement (parent generates it). */
  @api fieldId;
  /** Human label shown inside the box (e.g. "Signature"). */
  @api label;
  /** Field type token ('SignHere' | 'FullName' | 'DateSigned') — drives the box modifier class. */
  @api type;
  /** Absolute CSS-px geometry within the page overlay (parent converts points→px at the page scale). */
  @api left = 0;
  @api top = 0;
  @api width = 108;
  @api height = 24;

  // Transient drag bookkeeping — the pointer position where the current drag started, so we can
  // emit a delta rather than an absolute position (the parent re-clamps to page bounds in points).
  _dragStartX = null;
  _dragStartY = null;

  get boxStyle() {
    return (
      "left:" +
      this.left +
      "px;top:" +
      this.top +
      "px;width:" +
      this.width +
      "px;height:" +
      this.height +
      "px;"
    );
  }

  get boxClass() {
    // SLDS-token-styled base class + a type modifier so signature/name/date can differ visually.
    const modifier = (this.type || "field").toLowerCase();
    return "placed-field placed-field_" + modifier;
  }

  // ─── Move (drag the whole box) ─────────────────────────────────────────────

  handleDragStart(event) {
    // Record the origin pointer position; suppress the native drag image ghost where supported.
    this._dragStartX = event.clientX;
    this._dragStartY = event.clientY;
    if (event.dataTransfer) {
      // LWS may sanitize dataTransfer payloads, so we never rely on setData here — this is only to
      // keep the browser from showing a default "copy" cursor for a same-element move.
      event.dataTransfer.effectAllowed = "move";
    }
  }

  handleDragEnd(event) {
    if (this._dragStartX === null || this._dragStartY === null) {
      return;
    }
    // dragend clientX/clientY of 0/0 means the drop happened outside a valid target — ignore it so
    // the box does not jump to the top-left corner.
    if (event.clientX === 0 && event.clientY === 0) {
      this._dragStartX = null;
      this._dragStartY = null;
      return;
    }
    const deltaX = event.clientX - this._dragStartX;
    const deltaY = event.clientY - this._dragStartY;
    this._dragStartX = null;
    this._dragStartY = null;
    if (deltaX === 0 && deltaY === 0) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("move", {
        detail: { id: this.fieldId, deltaX, deltaY }
      })
    );
  }

  // ─── Remove ────────────────────────────────────────────────────────────────

  handleRemove(event) {
    // Stop the click from also starting a drag / bubbling to the overlay's drop handling.
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent("remove", { detail: { id: this.fieldId } }));
  }
}
