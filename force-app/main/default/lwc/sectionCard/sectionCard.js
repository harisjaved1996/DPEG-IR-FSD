import { LightningElement, api } from "lwc";

let CARD_UID = 0;

/**
 * sectionCard
 *
 * Reusable card shell that wraps any content block in a branded SLDS card with
 * an optional icon + heading and an `actions` slot in the header. The default
 * slot is the card body.
 *
 * PRESENTATIONAL / PURE: props in (`title`, `iconName`, `compact`), content via
 * slots, no events, no Apex, no wire, no LDS.
 *
 * @slot default Card body content.
 * @slot actions Header right-aligned actions (buttons, badges, filters).
 */
export default class SectionCard extends LightningElement {
  /** Card heading text. */
  @api title;
  /** Optional SLDS icon name shown left of the title, e.g. "utility:moneybag". */
  @api iconName;
  /** When true, reduces header/body padding for dense layouts. */
  @api compact = false;

  /** Unique id linking the <article> to its heading for assistive tech. */
  headingId = `section-card-heading-${CARD_UID++}`;

  get computedClass() {
    const base = "ir-section-card slds-card";
    return this.compact ? `${base} ir-section-card_compact` : base;
  }

  get hasIcon() {
    return Boolean(this.iconName);
  }
}
