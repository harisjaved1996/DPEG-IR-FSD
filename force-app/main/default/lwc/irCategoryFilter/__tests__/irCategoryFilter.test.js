import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrCategoryFilter from "c/irCategoryFilter";

beforeAll(() => {
  registerSa11yMatcher();
});

const CATEGORIES = [
  { category: "K-1", count: 4 },
  { category: "Report", count: 6 },
  { category: "Statement", count: 2 }
];

function createComponent(props = {}) {
  const element = createElement("c-ir-category-filter", { is: IrCategoryFilter });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-ir-category-filter", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders an All button plus one button per category", () => {
    const element = createComponent({ categories: CATEGORIES });
    return Promise.resolve().then(() => {
      const buttons = element.shadowRoot.querySelectorAll("lightning-button");
      // All + 3 categories
      expect(buttons.length).toBe(4);
      expect(buttons[0].label).toContain("All");
      expect(buttons[0].label).toContain("12"); // total count 4+6+2
    });
  });

  it("marks the All button as brand when nothing is selected", () => {
    const element = createComponent({ categories: CATEGORIES });
    return Promise.resolve().then(() => {
      const buttons = element.shadowRoot.querySelectorAll("lightning-button");
      expect(buttons[0].variant).toBe("brand");
      expect(buttons[1].variant).toBe("neutral");
    });
  });

  it("marks the selected category button as brand", () => {
    const element = createComponent({ categories: CATEGORIES, selected: "Report" });
    return Promise.resolve().then(() => {
      const buttons = element.shadowRoot.querySelectorAll("lightning-button");
      expect(buttons[0].variant).toBe("neutral");
      expect(buttons[2].variant).toBe("brand"); // Report
    });
  });

  it("emits categorychange with the category on selection", () => {
    const element = createComponent({ categories: CATEGORIES });
    const handler = jest.fn();
    element.addEventListener("categorychange", handler);
    return Promise.resolve().then(() => {
      const buttons = element.shadowRoot.querySelectorAll("lightning-button");
      buttons[1].click(); // K-1
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail).toEqual({ category: "K-1" });
    });
  });

  it("emits categorychange with null when All is selected", () => {
    const element = createComponent({ categories: CATEGORIES, selected: "K-1" });
    const handler = jest.fn();
    element.addEventListener("categorychange", handler);
    return Promise.resolve().then(() => {
      const buttons = element.shadowRoot.querySelectorAll("lightning-button");
      buttons[0].click(); // All
      expect(handler.mock.calls[0][0].detail).toEqual({ category: null });
    });
  });

  it("renders nothing when there are no categories", () => {
    const element = createComponent({ categories: [] });
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.querySelector("lightning-button")).toBeNull();
    });
  });

  it("is accessible", async () => {
    const element = createComponent({ categories: CATEGORIES });
    await Promise.resolve();
    await expect(element).toBeAccessible();
  });
});
