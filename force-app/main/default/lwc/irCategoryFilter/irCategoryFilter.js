import { LightningElement, api } from "lwc";

const ALL_VALUE = "__all__";

/**
 * irCategoryFilter
 *
 * Focused presentational child: a segmented filter (button group) of document
 * categories. Renders an "All" option plus one button per category and
 * highlights the active selection. Emits `categorychange` when the user picks a
 * different category; the parent page re-fetches the document list with the new
 * filter.
 *
 * PRESENTATIONAL / PURE: props in (`categories`, `selected`), `categorychange`
 * event out. No Apex/wire/LDS.
 *
 * Expected `categories` shape (IRDTO.CategoryCountDTO):
 *   { category, count }
 *
 * @fires irCategoryFilter#categorychange Detail: { category } — null when "All".
 */
export default class IrCategoryFilter extends LightningElement {
  _categories = [];

  /** Currently-selected category value, or null/blank for "All". */
  @api selected;

  /** Array of category count DTOs. */
  @api
  get categories() {
    return this._categories;
  }
  set categories(value) {
    this._categories = Array.isArray(value) ? value : [];
  }

  /** The value representing the "All" option. */
  get allValue() {
    return ALL_VALUE;
  }

  /** Button view-models including the leading "All" option, with active state. */
  get options() {
    const activeValue = this.selected || ALL_VALUE;
    const total = this._categories.reduce((sum, c) => sum + (Number(c.count) || 0), 0);
    const all = {
      key: ALL_VALUE,
      value: ALL_VALUE,
      label: `All (${total})`,
      variant: activeValue === ALL_VALUE ? "brand" : "neutral"
    };
    const rest = this._categories.map((category) => ({
      key: category.category,
      value: category.category,
      label: `${category.category} (${Number(category.count) || 0})`,
      variant: activeValue === category.category ? "brand" : "neutral"
    }));
    return [all, ...rest];
  }

  get hasOptions() {
    return this._categories.length > 0;
  }

  handleSelect(event) {
    const value = event.currentTarget.dataset.value;
    const category = value === ALL_VALUE ? null : value;
    this.dispatchEvent(
      new CustomEvent("categorychange", {
        detail: { category }
      })
    );
  }
}
