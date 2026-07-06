import { LightningElement, api } from "lwc";

/**
 * stageTracker
 *
 * Horizontal, ordered stage indicator (e.g. the 8-stage Offering lifecycle).
 * Renders an accessible <ol>; the current step carries aria-current="step".
 * When `clickable` is true each step becomes a button and emits `stageclick`.
 *
 * PRESENTATIONAL / PURE: props in, `stageclick` out. No Apex/wire/LDS.
 *
 * @fires stageTracker#stageclick Detail: { index, label }. Only when clickable.
 */
export default class StageTracker extends LightningElement {
  _stages = [];
  _currentIndex = 0;

  /** Ordered list of stage labels (Array<String>). */
  @api
  get stages() {
    return this._stages;
  }
  set stages(value) {
    this._stages = Array.isArray(value) ? value : [];
  }

  /** Zero-based index of the current stage. */
  @api
  get currentIndex() {
    return this._currentIndex;
  }
  set currentIndex(value) {
    const n = Number(value);
    this._currentIndex = Number.isFinite(n) ? n : 0;
  }

  /** When true, each step is an activatable button that emits `stageclick`. */
  @api clickable = false;

  /** Derived view-model: one entry per stage with state + a11y metadata. */
  get computedStages() {
    return this._stages.map((label, index) => {
      let state = "upcoming";
      if (index < this._currentIndex) {
        state = "complete";
      } else if (index === this._currentIndex) {
        state = "current";
      }
      const isComplete = state === "complete";
      const isCurrent = state === "current";
      return {
        key: `${index}-${label}`,
        index,
        label,
        state,
        isComplete,
        isCurrent,
        stepNumber: index + 1,
        markerIcon: isComplete ? "utility:check" : "",
        itemClass: `ir-stage-tracker__item ir-stage-tracker__item_${state}`,
        ariaCurrent: isCurrent ? "step" : null,
        // SR text disambiguates color/position-only meaning
        statusText: isComplete ? "completed" : isCurrent ? "current step" : "upcoming"
      };
    });
  }

  get hasStages() {
    return this._stages.length > 0;
  }

  handleStageClick(event) {
    if (!this.clickable) {
      return;
    }
    const index = Number(event.currentTarget.dataset.index);
    this.dispatchEvent(
      new CustomEvent("stageclick", {
        detail: { index, label: this._stages[index] }
      })
    );
  }
}
