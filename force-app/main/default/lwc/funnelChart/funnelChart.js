import { LightningElement, api } from "lwc";
import { CHART_PALETTE } from "c/irConstants";
import { formatNumber } from "c/irFormatters";

const MIN_WIDTH = 12; // floor (%) so a tiny stage stays visible/clickable

/**
 * funnelChart
 *
 * Pure CSS funnel built from stacked trapezoids (clip-path). No third-party
 * libraries. Renders an accessible ordered list so the stage sequence and
 * values are available to assistive tech.
 *
 * PRESENTATIONAL / PURE: props in, no events, no Apex/wire/LDS.
 */
export default class FunnelChart extends LightningElement {
  _stages = [];

  /** Array of { label, count, pct } stages, widest first. */
  @api
  get stages() {
    return this._stages;
  }
  set stages(value) {
    this._stages = Array.isArray(value) ? value : [];
  }

  get hasStages() {
    return this._stages.length > 0;
  }

  get maxCount() {
    return this._stages.reduce((max, s) => Math.max(max, Number(s.count) || 0), 0);
  }

  /** Resolve a stage's width percentage (0-100) from pct, or count ratio. */
  widthFor(stage) {
    if (stage.pct !== undefined && stage.pct !== null) {
      return Math.max(MIN_WIDTH, Math.min(100, Number(stage.pct) || 0));
    }
    const max = this.maxCount;
    if (max > 0) {
      const ratio = ((Number(stage.count) || 0) / max) * 100;
      return Math.max(MIN_WIDTH, ratio);
    }
    return MIN_WIDTH;
  }

  /** Derived per-stage view-model with trapezoid geometry + caption text. */
  get computedStages() {
    const stages = this._stages;
    return stages.map((stage, index) => {
      const topWidth = this.widthFor(stage);
      const next = stages[index + 1];
      const bottomWidth = next ? this.widthFor(next) : topWidth;
      const color = CHART_PALETTE[index % CHART_PALETTE.length];
      // Trapezoid: top edge = topWidth, bottom edge = bottomWidth, centered.
      const clipPath = `polygon(${50 - topWidth / 2}% 0, ${
        50 + topWidth / 2
      }% 0, ${50 + bottomWidth / 2}% 100%, ${50 - bottomWidth / 2}% 100%)`;
      const pct =
        stage.pct !== undefined && stage.pct !== null ? Math.round(Number(stage.pct)) : null;
      return {
        key: `${index}-${stage.label}`,
        index,
        label: stage.label,
        count: Number(stage.count) || 0,
        countText: formatNumber(stage.count),
        pct,
        pctText: pct !== null ? `${pct}%` : "",
        hasPct: pct !== null,
        barStyle: `clip-path: ${clipPath}; -webkit-clip-path: ${clipPath}; background-color: ${color};`
      };
    });
  }
}
