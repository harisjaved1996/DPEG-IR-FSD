import { LightningElement, api } from "lwc";
import { clampPercent } from "c/irFormatters";

/**
 * progressBar
 *
 * Accessible CSS-width progress bar. The fill percentage is taken from `percent`
 * when supplied, otherwise computed from `value` / `max`.
 *
 * PRESENTATIONAL / PURE: props in, no events, no Apex/wire/LDS.
 *
 * Accessibility: exposes role="progressbar" with aria-valuenow/min/max and a
 * human-readable aria-valuetext.
 */
export default class ProgressBar extends LightningElement {
  /** Current value (used with `max` when `percent` is not provided). */
  @api value;
  /** Maximum value (used with `value`). */
  @api max;
  /** Explicit percentage 0-100; overrides value/max when set. */
  @api percent;
  /** Optional caption shown above the bar. */
  @api label;
  /** Fill color: 'navy' | 'blue' | 'teal'. Defaults to 'blue'. */
  @api variant = "blue";
  /** When true, hides the numeric percent text (still in aria-valuetext). */
  @api hideValue = false;

  get computedPercent() {
    if (this.percent !== undefined && this.percent !== null) {
      return clampPercent(this.percent);
    }
    const max = Number(this.max);
    const value = Number(this.value);
    if (Number.isFinite(max) && max > 0 && Number.isFinite(value)) {
      return clampPercent((value / max) * 100);
    }
    return 0;
  }

  get roundedPercent() {
    return Math.round(this.computedPercent);
  }

  get fillStyle() {
    return `width: ${this.computedPercent}%;`;
  }

  get fillClass() {
    const variants = { navy: "fill-navy", teal: "fill-teal", blue: "fill-blue" };
    return `ir-progress-bar__fill ${variants[this.variant] || variants.blue}`;
  }

  get displayText() {
    return `${this.roundedPercent}%`;
  }

  get showValue() {
    return !this.hideValue;
  }

  /** Screen-reader text describing fill, including label and raw value/max. */
  get ariaValueText() {
    if (this.value !== undefined && this.max !== undefined) {
      return `${this.roundedPercent}% (${this.value} of ${this.max})`;
    }
    return `${this.roundedPercent}%`;
  }

  get hasLabel() {
    return Boolean(this.label);
  }
}
