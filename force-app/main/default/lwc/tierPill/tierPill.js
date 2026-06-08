import { LightningElement, api } from "lwc";
import { getTierConfig } from "c/irConstants";

/**
 * tierPill
 *
 * Renders an investor tier ('Anchor' | 'Active' | 'Dormant') as a colored pill
 * with an icon and visible label. Unknown tiers fall back to Dormant styling so
 * the pill always renders.
 *
 * PRESENTATIONAL / PURE: props in, no events, no Apex/wire/LDS.
 */
export default class TierPill extends LightningElement {
  /** Investor tier value. */
  @api tier;

  get config() {
    return getTierConfig(this.tier);
  }

  get pillClass() {
    return `ir-tier-pill ${this.config.cssClass}`;
  }

  get iconName() {
    return this.config.icon;
  }

  get label() {
    return this.config.label;
  }

  get hasTier() {
    return this.tier !== null && this.tier !== undefined && this.tier !== "";
  }
}
