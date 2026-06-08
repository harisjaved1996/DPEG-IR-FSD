import { LightningElement, api } from "lwc";
import { ACCENT_CLASS, TREND_CONFIG, UNIT_LABEL } from "c/irConstants";

/**
 * kpiCard
 *
 * A single KPI tile: accent stripe, optional icon, label, large pre-formatted
 * value, optional unit and trend indicator. Optionally selectable (emits
 * `select` on click/keyboard activation).
 *
 * PRESENTATIONAL / PURE: props in, `select` event out. No Apex, wire, or LDS.
 * The `value` is expected pre-formatted by the controller (DTO `displayValue`).
 *
 * @fires kpiCard#select Detail: { key, label, value }. Only when `selectable`.
 */
export default class KpiCard extends LightningElement {
  /** Optional stable key returned in the `select` event detail. */
  @api key;
  /** KPI caption, e.g. "Total Committed". */
  @api label;
  /** Pre-formatted display value, e.g. "$8.6M" or "142". */
  @api value;
  /** Unit hint for assistive text: 'currency' | 'number' | 'percent'. */
  @api unit;
  /** Trend direction: 'up' | 'down' | 'flat'. */
  @api trend;
  /** Optional SLDS icon name, e.g. "utility:moneybag". */
  @api iconName;
  /** Accent color: 'navy' | 'blue' | 'teal'. Defaults to 'blue'. */
  @api accent = "blue";
  /** When true, the tile is a button and emits `select` on activation. */
  @api selectable = false;

  get accentClass() {
    return `ir-kpi-card ${ACCENT_CLASS[this.accent] || ACCENT_CLASS.blue}`;
  }

  get hasIcon() {
    return Boolean(this.iconName);
  }

  get trendConfig() {
    return this.trend ? TREND_CONFIG[this.trend] : null;
  }

  get hasTrend() {
    return Boolean(this.trendConfig);
  }

  get trendIcon() {
    return this.trendConfig ? this.trendConfig.icon : "";
  }

  get trendClass() {
    return this.trendConfig
      ? `ir-kpi-card__trend ${this.trendConfig.cssClass}`
      : "ir-kpi-card__trend";
  }

  get trendAssistiveText() {
    return this.trendConfig ? this.trendConfig.label : "";
  }

  /** Full accessible label combining label, value, and unit. */
  get ariaLabel() {
    const unitText = this.unit ? ` ${UNIT_LABEL[this.unit] || ""}` : "";
    return `${this.label}: ${this.value}${unitText}`.trim();
  }

  handleActivate() {
    if (!this.selectable) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("select", {
        detail: {
          key: this.key,
          label: this.label,
          value: this.value
        }
      })
    );
  }
}
