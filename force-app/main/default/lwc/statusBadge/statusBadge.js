import { LightningElement, api } from "lwc";
import { getStatusTheme, BADGE_THEME } from "c/irConstants";

/**
 * statusBadge
 *
 * Renders a lifecycle status as an SLDS badge. The theme is resolved from the
 * shared status->theme map, with an optional per-instance `variantMap`
 * override. Color is never the only signal: each theme carries an icon and the
 * status text is always visible (WCAG 1.4.1).
 *
 * PRESENTATIONAL / PURE: props in, no events, no Apex/wire/LDS.
 */
export default class StatusBadge extends LightningElement {
  /** The status / picklist value to display. */
  @api status;
  /** Optional per-instance map of status value -> BADGE_THEME key. */
  @api variantMap;

  get themeKey() {
    return getStatusTheme(this.status, this.variantMap);
  }

  get themeConfig() {
    return BADGE_THEME[this.themeKey] || BADGE_THEME.neutral;
  }

  get badgeClass() {
    return `slds-badge ir-status-badge ${this.themeConfig.cssClass}`.trim();
  }

  get iconName() {
    return this.themeConfig.icon;
  }

  get hasStatus() {
    return this.status !== null && this.status !== undefined && this.status !== "";
  }
}
