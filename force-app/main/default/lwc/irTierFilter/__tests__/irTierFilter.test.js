import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrTierFilter from "c/irTierFilter";

beforeAll(() => {
  registerSa11yMatcher();
});

function createComponent(props = {}) {
  const element = createElement("c-ir-tier-filter", { is: IrTierFilter });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-ir-tier-filter", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders an All button plus the three default tiers", () => {
    const element = createComponent();
    return Promise.resolve().then(() => {
      const buttons = element.shadowRoot.querySelectorAll("lightning-button");
      expect(buttons.length).toBe(4); // All + Anchor + Active + Dormant
      expect(buttons[0].label).toBe("All Tiers");
      expect(buttons[1].label).toBe("Anchor");
    });
  });

  it("marks the All button as brand when nothing is selected", () => {
    const element = createComponent();
    return Promise.resolve().then(() => {
      const buttons = element.shadowRoot.querySelectorAll("lightning-button");
      expect(buttons[0].variant).toBe("brand");
    });
  });

  it("marks the selected tier button as brand", () => {
    const element = createComponent({ selected: "Active" });
    return Promise.resolve().then(() => {
      const buttons = element.shadowRoot.querySelectorAll("lightning-button");
      expect(buttons[0].variant).toBe("neutral");
      expect(buttons[2].variant).toBe("brand"); // Active
    });
  });

  it("emits tierchange with the tier on selection", () => {
    const element = createComponent();
    const handler = jest.fn();
    element.addEventListener("tierchange", handler);
    return Promise.resolve().then(() => {
      const buttons = element.shadowRoot.querySelectorAll("lightning-button");
      buttons[1].click(); // Anchor
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail).toEqual({ tier: "Anchor" });
    });
  });

  it("emits tierchange with null when All is selected", () => {
    const element = createComponent({ selected: "Anchor" });
    const handler = jest.fn();
    element.addEventListener("tierchange", handler);
    return Promise.resolve().then(() => {
      const buttons = element.shadowRoot.querySelectorAll("lightning-button");
      buttons[0].click(); // All
      expect(handler.mock.calls[0][0].detail).toEqual({ tier: null });
    });
  });

  it("is accessible", async () => {
    const element = createComponent();
    await Promise.resolve();
    await expect(element).toBeAccessible();
  });
});
