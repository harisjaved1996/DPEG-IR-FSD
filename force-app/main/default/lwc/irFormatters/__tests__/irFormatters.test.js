import {
  formatCurrency,
  formatPercent,
  formatNumber,
  abbreviateNumber,
  formatCurrencyAbbrev,
  formatDate,
  formatDateTime,
  maskValue,
  maskSSN,
  maskTaxId,
  clampPercent
} from "c/irFormatters";

describe("c-ir-formatters", () => {
  describe("formatCurrency", () => {
    it("formats a whole number as USD with no decimals", () => {
      expect(formatCurrency(1234567)).toBe("$1,234,567");
    });

    it("honors fraction digit options", () => {
      expect(
        formatCurrency(1234.5, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      ).toBe("$1,234.50");
    });

    it("returns the fallback for blank or non-numeric input", () => {
      expect(formatCurrency(null)).toBe("—");
      expect(formatCurrency(undefined)).toBe("—");
      expect(formatCurrency("")).toBe("—");
      expect(formatCurrency("abc")).toBe("—");
    });
  });

  describe("formatPercent", () => {
    it("appends a percent sign without scaling", () => {
      expect(formatPercent(42.5)).toBe("42.5%");
    });

    it("respects the decimals option", () => {
      expect(formatPercent(42.555, { decimals: 2 })).toBe("42.56%");
      expect(formatPercent(42, { decimals: 0 })).toBe("42%");
    });

    it("returns fallback for blank input", () => {
      expect(formatPercent(null)).toBe("—");
    });
  });

  describe("formatNumber", () => {
    it("adds thousands separators", () => {
      expect(formatNumber(1234)).toBe("1,234");
    });

    it("returns fallback for NaN", () => {
      expect(formatNumber("xyz")).toBe("—");
    });
  });

  describe("abbreviateNumber", () => {
    it("abbreviates thousands, millions, and billions", () => {
      expect(abbreviateNumber(1200)).toBe("1.2K");
      expect(abbreviateNumber(1200000)).toBe("1.2M");
      expect(abbreviateNumber(3400000000)).toBe("3.4B");
    });

    it("trims trailing zeros", () => {
      expect(abbreviateNumber(1000000)).toBe("1M");
    });

    it("preserves the sign for negatives", () => {
      expect(abbreviateNumber(-1500000)).toBe("-1.5M");
    });

    it("returns small numbers unscaled", () => {
      expect(abbreviateNumber(950)).toBe("950");
    });
  });

  describe("formatCurrencyAbbrev", () => {
    it("prefixes the dollar sign before the abbreviation", () => {
      expect(formatCurrencyAbbrev(1200000)).toBe("$1.2M");
    });

    it("places the sign before the dollar symbol for negatives", () => {
      expect(formatCurrencyAbbrev(-2500000)).toBe("-$2.5M");
    });

    it("returns fallback for blank input", () => {
      expect(formatCurrencyAbbrev(null)).toBe("—");
    });
  });

  describe("formatDate / formatDateTime", () => {
    it("formats an ISO date string", () => {
      // Use a date-only string parsed as UTC midnight; assert key parts.
      const out = formatDate("2026-06-05T12:00:00Z");
      expect(out).toContain("2026");
      expect(out).toContain("Jun");
    });

    it("returns fallback for an invalid date", () => {
      expect(formatDate("not-a-date")).toBe("—");
      expect(formatDate(null)).toBe("—");
    });

    it("includes time for formatDateTime", () => {
      const out = formatDateTime("2026-06-05T14:30:00Z");
      expect(out).toContain("2026");
      // contains a colon from the time portion
      expect(out).toMatch(/\d:\d{2}/);
    });
  });

  describe("masking helpers", () => {
    it("masks a generic value revealing the last 4", () => {
      expect(maskValue("123456789")).toBe("•••• 6789");
    });

    it("masks an SSN", () => {
      expect(maskSSN("123-45-6789")).toBe("•••-••-6789");
    });

    it("masks a Tax ID", () => {
      expect(maskTaxId("12-3456789")).toBe("••-•••6789");
    });

    it("returns fallback for blank masking input", () => {
      expect(maskValue(null)).toBe("—");
      expect(maskSSN("")).toBe("—");
    });
  });

  describe("clampPercent", () => {
    it("clamps into the 0-100 range by default", () => {
      expect(clampPercent(150)).toBe(100);
      expect(clampPercent(-10)).toBe(0);
      expect(clampPercent(42.5)).toBe(42.5);
    });

    it("returns min for non-numeric input", () => {
      expect(clampPercent("abc")).toBe(0);
    });
  });
});
