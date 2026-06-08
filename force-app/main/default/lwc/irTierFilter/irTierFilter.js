import { LightningElement, api } from "lwc";

const ALL_VALUE = "__all__";
const DEFAULT_TIERS = ["Anchor", "Active", "Dormant"];

/**
 * irTierFilter
 *
 * Focused presentational child: a segmented filter (button group) of investor
 * tiers. Renders an "All" option plus one button per tier and highlights the
 * active selection. Emits `tierchange` when the user picks a different tier; the
 * parent page re-fetches the investor list with the new filter.
 *
 * PRESENTATIONAL / PURE: props in (`tiers`, `selected`), `tierchange` event out.
 * No Apex/wire/LDS.
 *
 * @fires irTierFilter#tierchange Detail: { tier } — null when "All".
 */
export default class IrTierFilter extends LightningElement {
  _tiers = DEFAULT_TIERS;

  /** Currently-selected tier value, or null/blank for "All". */
  @api selected;

  /** Array of tier string values. Defaults to the standard three tiers. */
  @api
  get tiers() {
    return this._tiers;
  }
  set tiers(value) {
    this._tiers = Array.isArray(value) && value.length ? value : DEFAULT_TIERS;
  }

  /** The value representing the "All" option. */
  get allValue() {
    return ALL_VALUE;
  }

  /** Button view-models including the leading "All" option, with active state. */
  get options() {
    const activeValue = this.selected || ALL_VALUE;
    const all = {
      key: ALL_VALUE,
      value: ALL_VALUE,
      label: "All Tiers",
      variant: activeValue === ALL_VALUE ? "brand" : "neutral"
    };
    const rest = this._tiers.map((tier) => ({
      key: tier,
      value: tier,
      label: tier,
      variant: activeValue === tier ? "brand" : "neutral"
    }));
    return [all, ...rest];
  }

  handleSelect(event) {
    const value = event.currentTarget.dataset.value;
    const tier = value === ALL_VALUE ? null : value;
    this.dispatchEvent(
      new CustomEvent("tierchange", {
        detail: { tier }
      })
    );
  }
}
