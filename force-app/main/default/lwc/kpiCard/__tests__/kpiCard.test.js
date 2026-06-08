import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import KpiCard from "c/kpiCard";

beforeAll(() => {
  registerSa11yMatcher();
});

function createComponent(props = {}) {
  const element = createElement("c-kpi-card", { is: KpiCard });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-kpi-card", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders label and pre-formatted value", () => {
    const element = createComponent({
      label: "Total Committed",
      value: "$8.6M"
    });
    expect(element.shadowRoot.querySelector(".ir-kpi-card__label").textContent).toContain(
      "Total Committed"
    );
    expect(element.shadowRoot.querySelector(".ir-kpi-card__value").textContent).toBe("$8.6M");
  });

  it("applies the accent class for the chosen accent", () => {
    const element = createComponent({
      label: "Raised",
      value: "$1.2M",
      accent: "teal"
    });
    const card = element.shadowRoot.querySelector(".ir-kpi-card");
    expect(card.classList.contains("accent-teal")).toBe(true);
  });

  it("defaults to the blue accent when none provided", () => {
    const element = createComponent({ label: "Raised", value: "$1" });
    const card = element.shadowRoot.querySelector(".ir-kpi-card");
    expect(card.classList.contains("accent-blue")).toBe(true);
  });

  it("renders a trend indicator with assistive text", () => {
    const element = createComponent({
      label: "Raised",
      value: "$1.2M",
      trend: "up"
    });
    const trend = element.shadowRoot.querySelector(".ir-kpi-card__trend");
    expect(trend).not.toBeNull();
    expect(trend.classList.contains("trend-up")).toBe(true);
    expect(element.shadowRoot.querySelector(".slds-assistive-text").textContent).toContain("up");
  });

  it("renders a static, non-button card by default", () => {
    const element = createComponent({ label: "Raised", value: "$1" });
    expect(element.shadowRoot.querySelector("button")).toBeNull();
    expect(element.shadowRoot.querySelector('[role="group"]')).not.toBeNull();
  });

  it("renders a button and dispatches select when selectable", () => {
    const element = createComponent({
      key: "committed",
      label: "Total Committed",
      value: "$8.6M",
      selectable: true
    });

    const handler = jest.fn();
    element.addEventListener("select", handler);

    const button = element.shadowRoot.querySelector("button");
    expect(button).not.toBeNull();
    button.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({
      key: "committed",
      label: "Total Committed",
      value: "$8.6M"
    });
  });

  it("exposes a descriptive aria-label including the value", () => {
    const element = createComponent({
      label: "Total Raised",
      value: "$1.2M",
      unit: "currency"
    });
    const card = element.shadowRoot.querySelector(".ir-kpi-card");
    expect(card.getAttribute("aria-label")).toContain("Total Raised");
    expect(card.getAttribute("aria-label")).toContain("$1.2M");
  });

  it("is accessible (static variant)", async () => {
    const element = createComponent({
      label: "Active Offerings",
      value: "5",
      iconName: "utility:opportunity",
      unit: "number"
    });
    await expect(element).toBeAccessible();
  });

  it("is accessible (selectable variant)", async () => {
    const element = createComponent({
      label: "Active Offerings",
      value: "5",
      selectable: true
    });
    await expect(element).toBeAccessible();
  });
});
