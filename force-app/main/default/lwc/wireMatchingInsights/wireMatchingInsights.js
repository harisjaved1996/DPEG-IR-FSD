import { LightningElement } from "lwc";

// Bucket cards have a light-tinted header band (match range) + PPM-style body.
// The "Total Settled" card has no header — just icon + value + label.
// All icons are plain (utility) glyphs: own color, no background box. Counts dummy.
const RAW = [
  {
    key: "totalSettled",
    value: "56",
    label: "Total Settled",
    iconName: "utility:summary",
    color: "#5867e8"
  },
  {
    key: "autoSettled",
    matchLabel: "≥ 99% match",
    value: "20",
    label: "Auto-Settled",
    iconName: "utility:check",
    color: "#2e844a"
  },
  {
    key: "reviewQueue",
    matchLabel: "70–98% match",
    value: "30",
    label: "Review Queue",
    iconName: "utility:clock",
    color: "#dd7a01"
  },
  {
    key: "unmatched",
    matchLabel: "< 70% match",
    value: "6",
    label: "Unmatched",
    iconName: "utility:close",
    color: "#c23934"
  }
];

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export default class WireMatchingInsights extends LightningElement {
  get stats() {
    return RAW.map((s) => ({
      ...s,
      showHeader: Boolean(s.matchLabel),
      headerStyle: s.matchLabel
        ? `background-color: rgba(${hexToRgb(s.color)}, 0.15); color: ${s.color};`
        : "",
      iconStyle: `--slds-c-icon-color-foreground-default: ${s.color}; --sds-c-icon-color-foreground-default: ${s.color};`
    }));
  }
}
