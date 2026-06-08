import { LightningElement, api } from "lwc";
import { colorForToken } from "c/irConstants";

// Radius chosen so the circle's circumference ~= 100 user units, letting us
// express stroke-dasharray segments directly as percentages.
const RADIUS = 15.91549430918954;
const CIRCUMFERENCE = 100;
const START_OFFSET = 25; // rotates the first segment to the 12 o'clock position

/**
 * donutChart
 *
 * Pure inline-SVG donut chart. Each slice is a <circle> segment drawn with
 * stroke-dasharray. No third-party chart libraries. A parallel, SR-readable
 * legend list conveys all data for assistive tech.
 *
 * PRESENTATIONAL / PURE: props in, `slicehover` out. No Apex/wire/LDS. SVG fills
 * are resolved from `colorToken` via the shared brand palette (CSS custom
 * properties are not reliable inside SVG).
 *
 * @fires donutChart#slicehover Detail: { label, value, pct, index }.
 */
export default class DonutChart extends LightningElement {
  _slices = [];

  /** Array of { label, value, colorToken } slices. */
  @api
  get slices() {
    return this._slices;
  }
  set slices(value) {
    this._slices = Array.isArray(value) ? value : [];
  }

  /** Rendered pixel size of the square SVG. Default 160. */
  @api size = 160;
  /** Small caption rendered in the donut center. */
  @api centerLabel;
  /** Emphasized value rendered in the donut center. */
  @api centerValue;

  radius = RADIUS;

  get total() {
    return this._slices.reduce((sum, s) => sum + (Number(s.value) || 0), 0);
  }

  get hasData() {
    return this.total > 0;
  }

  get svgStyle() {
    return `width: ${this.size}px; height: ${this.size}px;`;
  }

  /** Derived per-slice view-model with dash geometry + resolved color. */
  get segments() {
    const total = this.total;
    if (total <= 0) {
      return [];
    }
    let cumulative = 0;
    return this._slices.map((slice, index) => {
      const value = Number(slice.value) || 0;
      const pct = (value / total) * 100;
      const dashOffset = (CIRCUMFERENCE - cumulative + START_OFFSET) % CIRCUMFERENCE;
      cumulative += pct;
      return {
        key: `${index}-${slice.label}`,
        index,
        label: slice.label,
        value,
        pct,
        roundedPct: Math.round(pct),
        color: colorForToken(slice.colorToken, index),
        dashArray: `${pct} ${CIRCUMFERENCE - pct}`,
        dashOffset,
        swatchStyle: `background-color: ${colorForToken(slice.colorToken, index)};`
      };
    });
  }

  /** Single concatenated label summarizing the chart for the SVG role=img. */
  get chartAriaLabel() {
    if (!this.hasData) {
      return "Donut chart, no data";
    }
    const parts = this.segments.map((s) => `${s.label} ${s.roundedPct} percent`);
    const prefix = this.centerLabel ? `${this.centerLabel}. ` : "";
    return `Donut chart. ${prefix}${parts.join(", ")}`;
  }

  get hasCenter() {
    return Boolean(this.centerLabel || this.centerValue);
  }

  dispatchHover(index) {
    const seg = this.segments[index];
    if (!seg) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("slicehover", {
        detail: {
          index: seg.index,
          label: seg.label,
          value: seg.value,
          pct: seg.pct
        }
      })
    );
  }

  handleSegmentHover(event) {
    this.dispatchHover(Number(event.currentTarget.dataset.index));
  }

  handleLegendFocus(event) {
    this.dispatchHover(Number(event.currentTarget.dataset.index));
  }
}
