/**
 * irConstants
 *
 * Shared, framework-free constants and pure resolver helpers for the DPEG
 * Investor Relations UI. Imported by presentational LWCs (charts, badges,
 * pills) and — later — by feature components.
 *
 * PURE MODULE: no Apex, no wire, no LDS, no DOM. Exports immutable data and
 * pure functions only.
 *
 * @module c/irConstants
 */

/**
 * DPEG brand palette + status accent hex values.
 *
 * SVG fills (donut/funnel) cannot reliably consume CSS custom properties across
 * all renderers, so charts read hex values from here (per design spec §4.1).
 * CSS-rendered components should prefer the `--dpeg-*` custom properties.
 */
export const BRAND = Object.freeze({
  NAVY: "#032D60", // headers, KPI accent stripe, stage-tracker active
  BLUE: "#0070D2", // links, progress fill, primary accents
  TEAL: "#2BAFAC", // positive/status accents, ACH slice
  AMBER: "#FE9339", // review / warning
  RED: "#EA001E", // unmatched / error
  GREEN: "#2E844A", // success
  GREY: "#747474" // neutral / dormant
});

/**
 * Map of lower-cased color token -> hex. Used to resolve a slice/segment
 * `colorToken` (e.g. 'teal') into a concrete fill for inline SVG.
 */
export const COLOR_TOKENS = Object.freeze({
  navy: BRAND.NAVY,
  blue: BRAND.BLUE,
  teal: BRAND.TEAL,
  amber: BRAND.AMBER,
  red: BRAND.RED,
  green: BRAND.GREEN,
  grey: BRAND.GREY,
  gray: BRAND.GREY
});

/** Ordered fallback palette for chart slices with no explicit colorToken. */
export const CHART_PALETTE = Object.freeze([
  BRAND.NAVY,
  BRAND.BLUE,
  BRAND.TEAL,
  BRAND.AMBER,
  BRAND.GREEN,
  BRAND.GREY,
  BRAND.RED
]);

/**
 * Resolve a color token / hex / index into a hex string.
 *
 * @param {string} token  A token ('teal'), a hex string ('#abc123'), or undefined.
 * @param {number} [index=0]  Fallback index into CHART_PALETTE when no token.
 * @returns {string} hex color
 */
export function colorForToken(token, index = 0) {
  if (typeof token === "string" && token.charAt(0) === "#") {
    return token;
  }
  if (typeof token === "string" && COLOR_TOKENS[token.toLowerCase()]) {
    return COLOR_TOKENS[token.toLowerCase()];
  }
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

/** Wire-match confidence thresholds (0-100 scale). */
export const CONFIDENCE = Object.freeze({
  AUTO_SETTLE_MIN: 99, // >= 99  -> Auto-Settle (teal)
  REVIEW_MIN: 70 //  70-98 -> Review (amber); < 70 -> Unmatched (red)
});

/** Canonical wire-match bucket labels. */
export const CONFIDENCE_BUCKET = Object.freeze({
  AUTO_SETTLE: "Auto-Settle",
  REVIEW: "Review",
  UNMATCHED: "Unmatched"
});

/**
 * Derive the confidence bucket label from a numeric confidence score.
 *
 * @param {number} confidence 0-100
 * @returns {string} one of CONFIDENCE_BUCKET values
 */
export function getConfidenceBucket(confidence) {
  const n = Number(confidence);
  if (!Number.isFinite(n)) {
    return CONFIDENCE_BUCKET.UNMATCHED;
  }
  if (n >= CONFIDENCE.AUTO_SETTLE_MIN) {
    return CONFIDENCE_BUCKET.AUTO_SETTLE;
  }
  if (n >= CONFIDENCE.REVIEW_MIN) {
    return CONFIDENCE_BUCKET.REVIEW;
  }
  return CONFIDENCE_BUCKET.UNMATCHED;
}

/** Confidence bucket -> { theme, color token, icon } for badge rendering. */
export const CONFIDENCE_THEME = Object.freeze({
  [CONFIDENCE_BUCKET.AUTO_SETTLE]: {
    theme: "success",
    token: "teal",
    icon: "utility:check"
  },
  [CONFIDENCE_BUCKET.REVIEW]: {
    theme: "warning",
    token: "amber",
    icon: "utility:warning"
  },
  [CONFIDENCE_BUCKET.UNMATCHED]: {
    theme: "error",
    token: "red",
    icon: "utility:close"
  }
});

/**
 * Badge themes used across the IR UI. Each maps to an SLDS badge utility class
 * and a status icon (so color is never the only signal — WCAG 1.4.1).
 */
export const BADGE_THEME = Object.freeze({
  success: { cssClass: "slds-theme_success", icon: "utility:success" },
  warning: { cssClass: "slds-theme_warning", icon: "utility:warning" },
  error: { cssClass: "slds-theme_error", icon: "utility:error" },
  info: { cssClass: "slds-badge_inverse", icon: "utility:info" },
  neutral: { cssClass: "", icon: "utility:record" }
});

/**
 * Default lifecycle picklist value -> badge theme map. Keys are lower-cased on
 * lookup so callers do not have to normalize. Feature components may override
 * per-instance via the `variantMap` prop on `statusBadge`.
 */
export const STATUS_THEME_MAP = Object.freeze({
  // positive / terminal-good
  active: "success",
  completed: "success",
  complete: "success",
  matched: "success",
  approved: "success",
  funded: "success",
  signed: "success",
  settled: "success",
  "auto-settle": "success",
  verified: "success",
  promoted: "success",
  "closed funded": "success",
  paid: "success",
  // in-flight / needs attention
  draft: "warning",
  pending: "warning",
  "pending approval": "warning",
  review: "warning",
  "in review": "warning",
  "in progress": "warning",
  partial: "warning",
  submitted: "warning",
  invited: "warning",
  waitlisted: "warning",
  processing: "warning",
  // negative / terminal-bad
  unmatched: "error",
  rejected: "error",
  failed: "error",
  cancelled: "error",
  canceled: "error",
  declined: "error",
  expired: "error",
  overdue: "error",
  returned: "error",
  // neutral / closed
  closed: "info",
  inactive: "info",
  dormant: "info",
  withdrawn: "info",
  "not started": "neutral"
});

/**
 * Resolve a status value to a badge theme key.
 *
 * @param {string} status     The picklist value.
 * @param {object} [overrideMap]  Optional per-instance status->theme overrides.
 * @returns {string} a BADGE_THEME key (defaults to 'neutral')
 */
export function getStatusTheme(status, overrideMap) {
  if (status === null || status === undefined || status === "") {
    return "neutral";
  }
  const key = String(status).trim().toLowerCase();
  if (overrideMap) {
    // allow override keys in any case
    const direct = overrideMap[status] || overrideMap[key];
    if (direct) {
      return direct;
    }
  }
  return STATUS_THEME_MAP[key] || "neutral";
}

/** Investor tier -> presentation config. */
export const TIER_CONFIG = Object.freeze({
  Anchor: { token: "navy", cssClass: "tier-anchor", icon: "utility:anchor" },
  Active: { token: "teal", cssClass: "tier-active", icon: "utility:success" },
  Dormant: { token: "grey", cssClass: "tier-dormant", icon: "utility:clock" }
});

/**
 * Resolve a tier value to its presentation config (defaults to Dormant styling
 * for unknown tiers so the pill always renders).
 *
 * @param {string} tier
 * @returns {{token:string, cssClass:string, icon:string, label:string}}
 */
export function getTierConfig(tier) {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.Dormant;
  return { ...cfg, label: tier || "Dormant" };
}

/** KPI accent name -> css class (maps to --dpeg-* custom properties in CSS). */
export const ACCENT_CLASS = Object.freeze({
  navy: "accent-navy",
  blue: "accent-blue",
  teal: "accent-teal"
});

/**
 * SLDS 2 global styling-hook token names used by the IR components. Centralized
 * so CSS authors reference the same tokens (spacing / radius / sizing). These
 * are NAMES, not values — values come from the SLDS 2 design system at runtime.
 */
export const SLDS_TOKENS = Object.freeze({
  spacingXSmall: "--slds-g-spacing-1",
  spacingSmall: "--slds-g-spacing-2",
  spacingMedium: "--slds-g-spacing-4",
  spacingLarge: "--slds-g-spacing-6",
  radiusBorder: "--slds-g-radius-border-2",
  radiusBorderLarge: "--slds-g-radius-border-3",
  colorBorder: "--slds-g-color-border-1",
  colorSurface: "--slds-g-color-surface-container-1",
  colorOnSurface: "--slds-g-color-on-surface-1"
});

/** Trend direction -> icon + assistive label (color independence). */
export const TREND_CONFIG = Object.freeze({
  up: { icon: "utility:arrowup", cssClass: "trend-up", label: "Trending up" },
  down: {
    icon: "utility:arrowdown",
    cssClass: "trend-down",
    label: "Trending down"
  },
  flat: { icon: "utility:dash", cssClass: "trend-flat", label: "No change" }
});

/**
 * KPI unit -> short suffix/label, used only for assistive text. Visible values
 * arrive pre-formatted from the controller (`displayValue`).
 */
export const UNIT_LABEL = Object.freeze({
  currency: "US dollars",
  percent: "percent",
  number: ""
});
