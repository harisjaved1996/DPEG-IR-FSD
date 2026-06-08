import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import DonutChart from "c/donutChart";

beforeAll(() => {
  registerSa11yMatcher();
});

const SLICES = [
  { label: "ACH", value: 75, colorToken: "teal" },
  { label: "Cheque", value: 25, colorToken: "navy" }
];

function createComponent(props = {}) {
  const element = createElement("c-donut-chart", { is: DonutChart });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-donut-chart", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders one SVG segment per slice", () => {
    const element = createComponent({ slices: SLICES });
    const segments = element.shadowRoot.querySelectorAll(".ir-donut__segment");
    expect(segments.length).toBe(2);
  });

  it("computes dash-array percentages from slice values", () => {
    const element = createComponent({ slices: SLICES });
    const segments = element.shadowRoot.querySelectorAll(".ir-donut__segment");
    // 75 / 100 total -> "75 25"
    expect(segments[0].getAttribute("stroke-dasharray")).toBe("75 25");
    // 25 / 100 total -> "25 75"
    expect(segments[1].getAttribute("stroke-dasharray")).toBe("25 75");
  });

  it("resolves brand color tokens to hex strokes", () => {
    const element = createComponent({ slices: SLICES });
    const segments = element.shadowRoot.querySelectorAll(".ir-donut__segment");
    expect(segments[0].getAttribute("stroke")).toBe("#2BAFAC"); // teal
    expect(segments[1].getAttribute("stroke")).toBe("#032D60"); // navy
  });

  it("renders an SR-readable legend with label and percent", () => {
    const element = createComponent({ slices: SLICES });
    const labels = element.shadowRoot.querySelectorAll(".ir-donut__legend-label");
    const pcts = element.shadowRoot.querySelectorAll(".ir-donut__legend-pct");
    expect(labels[0].textContent).toBe("ACH");
    expect(pcts[0].textContent).toBe("75%");
  });

  it("renders the center label and value overlay", () => {
    const element = createComponent({
      slices: SLICES,
      centerLabel: "Split",
      centerValue: "$1.2M"
    });
    expect(element.shadowRoot.querySelector(".ir-donut__center-value").textContent).toBe("$1.2M");
    expect(element.shadowRoot.querySelector(".ir-donut__center-label").textContent).toBe("Split");
  });

  it("exposes a descriptive aria-label on the SVG", () => {
    const element = createComponent({ slices: SLICES });
    const svg = element.shadowRoot.querySelector("svg");
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-label")).toContain("ACH 75 percent");
  });

  it("dispatches slicehover on legend focus", () => {
    const element = createComponent({ slices: SLICES });
    const handler = jest.fn();
    element.addEventListener("slicehover", handler);

    const buttons = element.shadowRoot.querySelectorAll(".ir-donut__legend-button");
    buttons[1].dispatchEvent(new CustomEvent("focus"));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toMatchObject({
      index: 1,
      label: "Cheque",
      value: 25
    });
  });

  it("renders an empty state when there is no data", () => {
    const element = createComponent({ slices: [] });
    expect(element.shadowRoot.querySelector(".ir-donut__empty")).not.toBeNull();
    expect(element.shadowRoot.querySelectorAll(".ir-donut__segment").length).toBe(0);
  });

  it("is accessible", async () => {
    const element = createComponent({
      slices: SLICES,
      centerLabel: "Distribution Split",
      centerValue: "$1.2M"
    });
    await expect(element).toBeAccessible();
  });
});
