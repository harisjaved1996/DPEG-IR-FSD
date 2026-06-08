/**
 * irFormatters
 *
 * Pure display formatters for the DPEG Investor Relations UI: currency, percent,
 * number, compact/abbreviated values ($1.2M), dates, and masking helpers.
 *
 * PURE MODULE: no Apex, no wire, no LDS, no DOM. Every export is a pure function
 * with no side effects. Controllers also send pre-formatted `displayValue` for
 * KPI tiles; these helpers are used for client-side table/cell formatting.
 *
 * @module c/irFormatters
 */

const NBSP = "—"; // em dash, shown for null/empty values

/**
 * True when the value is null, undefined, or an empty string.
 * @param {*} value
 * @returns {boolean}
 */
function isBlank(value) {
  return value === null || value === undefined || value === "";
}

/**
 * Format a number as USD currency.
 *
 * @param {number|string} value
 * @param {object} [options]
 * @param {number} [options.minimumFractionDigits=0]
 * @param {number} [options.maximumFractionDigits=0]
 * @param {string} [options.fallback='—'] Returned when value is blank/NaN.
 * @returns {string} e.g. "$1,234,567"
 */
export function formatCurrency(value, options = {}) {
  const { minimumFractionDigits = 0, maximumFractionDigits = 0, fallback = NBSP } = options;
  if (isBlank(value)) {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits
  }).format(n);
}

/**
 * Format a percent value. Input is expected in percent units already
 * (Salesforce percent fields store 42.5 for 42.5%), so no x100 is applied.
 *
 * @param {number|string} value  e.g. 42.5
 * @param {object} [options]
 * @param {number} [options.decimals=1] Maximum fraction digits.
 * @param {string} [options.fallback='—']
 * @returns {string} e.g. "42.5%"
 */
export function formatPercent(value, options = {}) {
  const { decimals = 1, fallback = NBSP } = options;
  if (isBlank(value)) {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  const formatted = n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
  return `${formatted}%`;
}

/**
 * Format a plain number with thousands separators.
 *
 * @param {number|string} value
 * @param {object} [options]
 * @param {number} [options.decimals=0]
 * @param {string} [options.fallback='—']
 * @returns {string} e.g. "1,234"
 */
export function formatNumber(value, options = {}) {
  const { decimals = 0, fallback = NBSP } = options;
  if (isBlank(value)) {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

/**
 * Abbreviate a large number to a compact string with a magnitude suffix.
 * 1200 -> "1.2K", 1_200_000 -> "1.2M", 3_400_000_000 -> "3.4B".
 *
 * @param {number|string} value
 * @param {object} [options]
 * @param {number} [options.decimals=1]
 * @param {string} [options.fallback='—']
 * @returns {string}
 */
export function abbreviateNumber(value, options = {}) {
  const { decimals = 1, fallback = NBSP } = options;
  if (isBlank(value)) {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  const units = [
    { limit: 1e9, suffix: "B" },
    { limit: 1e6, suffix: "M" },
    { limit: 1e3, suffix: "K" }
  ];
  for (const { limit, suffix } of units) {
    if (abs >= limit) {
      const scaled = abs / limit;
      // trim trailing zeros: 1.0M -> 1M, 1.20M -> 1.2M
      const text = scaled
        .toFixed(decimals)
        .replace(/\.0+$/, "")
        .replace(/(\.\d*?)0+$/, "$1");
      return `${sign}${text}${suffix}`;
    }
  }
  return `${sign}${abs.toLocaleString("en-US")}`;
}

/**
 * Abbreviate a number as compact currency. 1_200_000 -> "$1.2M".
 *
 * @param {number|string} value
 * @param {object} [options]
 * @returns {string}
 */
export function formatCurrencyAbbrev(value, options = {}) {
  const { fallback = NBSP } = options;
  if (isBlank(value) || !Number.isFinite(Number(value))) {
    return fallback;
  }
  const n = Number(value);
  const sign = n < 0 ? "-" : "";
  const body = abbreviateNumber(Math.abs(n), options);
  return `${sign}$${body}`;
}

/**
 * Format a date value as a short, human-readable date.
 *
 * @param {Date|string|number} value  Date, ISO string, or epoch millis.
 * @param {object} [options]
 * @param {object} [options.intlOptions] Intl.DateTimeFormat options override.
 * @param {string} [options.fallback='—']
 * @returns {string} e.g. "Jun 5, 2026"
 */
export function formatDate(value, options = {}) {
  const { fallback = NBSP, intlOptions = { year: "numeric", month: "short", day: "numeric" } } =
    options;
  if (isBlank(value)) {
    return fallback;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }
  return new Intl.DateTimeFormat("en-US", intlOptions).format(date);
}

/**
 * Format a datetime value with date + short time.
 *
 * @param {Date|string|number} value
 * @param {object} [options]
 * @param {string} [options.fallback='—']
 * @returns {string} e.g. "Jun 5, 2026, 2:30 PM"
 */
export function formatDateTime(value, options = {}) {
  return formatDate(value, {
    ...options,
    intlOptions: {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  });
}

/**
 * Mask a sensitive value, revealing only the last N characters.
 * "123456789" -> "•••• 6789".
 *
 * @param {string|number} value
 * @param {object} [options]
 * @param {number} [options.visible=4] Trailing characters to reveal.
 * @param {string} [options.maskChar='•']
 * @param {string} [options.fallback='—']
 * @returns {string}
 */
export function maskValue(value, options = {}) {
  const { visible = 4, maskChar = "•", fallback = NBSP } = options;
  if (isBlank(value)) {
    return fallback;
  }
  const str = String(value).replace(/\s+/g, "");
  if (str.length <= visible) {
    return maskChar.repeat(Math.max(str.length, 1));
  }
  const tail = str.slice(-visible);
  return `${maskChar.repeat(4)} ${tail}`;
}

/**
 * Mask a US SSN, revealing only the last 4 digits: "•••-••-6789".
 *
 * @param {string|number} value
 * @param {object} [options]
 * @returns {string}
 */
export function maskSSN(value, options = {}) {
  const { fallback = NBSP } = options;
  if (isBlank(value)) {
    return fallback;
  }
  const digits = String(value).replace(/\D/g, "");
  if (digits.length < 4) {
    return "•••-••-••••";
  }
  return `•••-••-${digits.slice(-4)}`;
}

/**
 * Mask a Tax ID / EIN, revealing only the last 4 digits: "••-•••6789".
 *
 * @param {string|number} value
 * @param {object} [options]
 * @returns {string}
 */
export function maskTaxId(value, options = {}) {
  const { fallback = NBSP } = options;
  if (isBlank(value)) {
    return fallback;
  }
  const digits = String(value).replace(/\D/g, "");
  if (digits.length < 4) {
    return "••-•••••••";
  }
  return `••-•••${digits.slice(-4)}`;
}

/**
 * Clamp a number to the inclusive [min, max] range.
 *
 * @param {number} value
 * @param {number} [min=0]
 * @param {number} [max=100]
 * @returns {number}
 */
export function clampPercent(value, min = 0, max = 100) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return min;
  }
  return Math.min(max, Math.max(min, n));
}
