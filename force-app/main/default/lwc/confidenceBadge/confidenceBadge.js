import { LightningElement, api } from "lwc";
import { getConfidenceBucket, CONFIDENCE_THEME, BADGE_THEME } from "c/irConstants";

/**
 * confidenceBadge
 *
 * Renders a wire-match confidence as a themed pill: Auto-Settle (>=99, teal),
 * Review (70-98, amber), or Unmatched (<70, red). The bucket may be supplied
 * explicitly via `bucket`; otherwise it is derived from `confidence`.
 *
 * PRESENTATIONAL / PURE: props in, no events, no Apex/wire/LDS. Color is paired
 * with an icon and text label so it is never the only signal (WCAG 1.4.1).
 */
export default class ConfidenceBadge extends LightningElement {
  /** Explicit bucket: 'Auto-Settle' | 'Review' | 'Unmatched'. Optional. */
  @api bucket;
  /** Numeric confidence score 0-100 (used to derive bucket when not given). */
  @api confidence;

  get resolvedBucket() {
    if (this.bucket) {
      return this.bucket;
    }
    if (this.confidence !== null && this.confidence !== undefined) {
      return getConfidenceBucket(this.confidence);
    }
    return null;
  }

  get themeConfig() {
    const cfg = CONFIDENCE_THEME[this.resolvedBucket];
    return cfg || CONFIDENCE_THEME.Unmatched;
  }

  get badgeClass() {
    const themeKey = this.themeConfig.theme;
    const slds = (BADGE_THEME[themeKey] || BADGE_THEME.neutral).cssClass;
    return `slds-badge ir-confidence-badge ${slds}`.trim();
  }

  get iconName() {
    return this.themeConfig.icon;
  }

  get hasConfidenceValue() {
    return this.confidence !== null && this.confidence !== undefined;
  }

  get confidenceText() {
    return `${Math.round(Number(this.confidence))}%`;
  }

  get hasContent() {
    return Boolean(this.resolvedBucket);
  }

  /** Combined SR label, e.g. "Auto-Settle, 99% confidence". */
  get ariaLabel() {
    if (this.hasConfidenceValue) {
      return `${this.resolvedBucket}, ${this.confidenceText} confidence`;
    }
    return this.resolvedBucket;
  }
}
