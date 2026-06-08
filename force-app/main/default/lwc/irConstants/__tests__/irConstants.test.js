import {
  BRAND,
  COLOR_TOKENS,
  CHART_PALETTE,
  colorForToken,
  CONFIDENCE,
  CONFIDENCE_BUCKET,
  getConfidenceBucket,
  CONFIDENCE_THEME,
  STATUS_THEME_MAP,
  getStatusTheme,
  getTierConfig,
  TREND_CONFIG
} from "c/irConstants";

describe("c-ir-constants", () => {
  describe("brand palette", () => {
    it("exposes the DPEG brand hex values", () => {
      expect(BRAND.NAVY).toBe("#032D60");
      expect(BRAND.BLUE).toBe("#0070D2");
      expect(BRAND.TEAL).toBe("#2BAFAC");
    });

    it("freezes the palette to prevent mutation", () => {
      expect(Object.isFrozen(BRAND)).toBe(true);
    });
  });

  describe("colorForToken", () => {
    it("resolves a named token to a hex value", () => {
      expect(colorForToken("teal")).toBe(BRAND.TEAL);
      expect(colorForToken("NAVY".toLowerCase())).toBe(BRAND.NAVY);
    });

    it("passes through an explicit hex string", () => {
      expect(colorForToken("#abc123")).toBe("#abc123");
    });

    it("falls back to the palette by index for unknown tokens", () => {
      expect(colorForToken(undefined, 1)).toBe(CHART_PALETTE[1]);
      expect(colorForToken("mystery", 0)).toBe(CHART_PALETTE[0]);
    });

    it("keeps known token map and palette aligned to brand", () => {
      expect(COLOR_TOKENS.blue).toBe(BRAND.BLUE);
    });
  });

  describe("getConfidenceBucket", () => {
    it("classifies auto-settle at or above the high threshold", () => {
      expect(getConfidenceBucket(99)).toBe(CONFIDENCE_BUCKET.AUTO_SETTLE);
      expect(getConfidenceBucket(100)).toBe(CONFIDENCE_BUCKET.AUTO_SETTLE);
    });

    it("classifies review in the mid band", () => {
      expect(getConfidenceBucket(85)).toBe(CONFIDENCE_BUCKET.REVIEW);
      expect(getConfidenceBucket(CONFIDENCE.REVIEW_MIN)).toBe(CONFIDENCE_BUCKET.REVIEW);
    });

    it("classifies unmatched below the review threshold", () => {
      expect(getConfidenceBucket(40)).toBe(CONFIDENCE_BUCKET.UNMATCHED);
      expect(getConfidenceBucket(null)).toBe(CONFIDENCE_BUCKET.UNMATCHED);
    });

    it("maps each bucket to a theme with an icon (color independence)", () => {
      Object.values(CONFIDENCE_BUCKET).forEach((bucket) => {
        expect(CONFIDENCE_THEME[bucket].icon).toBeTruthy();
        expect(CONFIDENCE_THEME[bucket].theme).toBeTruthy();
      });
    });
  });

  describe("getStatusTheme", () => {
    it("resolves known statuses case-insensitively", () => {
      expect(getStatusTheme("Active")).toBe("success");
      expect(getStatusTheme("PENDING APPROVAL")).toBe("warning");
      expect(getStatusTheme("Unmatched")).toBe("error");
    });

    it("honors a per-instance override map", () => {
      expect(getStatusTheme("Active", { Active: "warning" })).toBe("warning");
    });

    it("defaults unknown / blank statuses to neutral", () => {
      expect(getStatusTheme("Wibble")).toBe("neutral");
      expect(getStatusTheme(null)).toBe("neutral");
    });

    it("keeps the default map frozen", () => {
      expect(Object.isFrozen(STATUS_THEME_MAP)).toBe(true);
    });
  });

  describe("getTierConfig", () => {
    it("returns the matching tier config with a label", () => {
      const anchor = getTierConfig("Anchor");
      expect(anchor.token).toBe("navy");
      expect(anchor.label).toBe("Anchor");
    });

    it("defaults unknown tiers to Dormant styling", () => {
      const unknown = getTierConfig("Mystery");
      expect(unknown.cssClass).toBe("tier-dormant");
      expect(unknown.label).toBe("Mystery");
    });
  });

  describe("trend config", () => {
    it("exposes icon + assistive label for every direction", () => {
      ["up", "down", "flat"].forEach((dir) => {
        expect(TREND_CONFIG[dir].icon).toBeTruthy();
        expect(TREND_CONFIG[dir].label).toBeTruthy();
      });
    });
  });
});
