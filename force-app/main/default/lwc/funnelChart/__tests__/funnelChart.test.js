import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import FunnelChart from "c/funnelChart";

beforeAll(() => {
  registerSa11yMatcher();
});

const STAGES = [
  { label: "Commitments", count: 20, pct: 100 },
  { label: "Funded Investments", count: 15, pct: 75 },
  { label: "Active", count: 12, pct: 60 }
];

function createComponent(props = {}) {
  const element = createElement("c-funnel-chart", { is: FunnelChart });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-funnel-chart", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders an ordered list with one item per stage", () => {
    const element = createComponent({ stages: STAGES });
    const ol = element.shadowRoot.querySelector("ol");
    expect(ol).not.toBeNull();
    const items = element.shadowRoot.querySelectorAll(".ir-funnel__stage");
    expect(items.length).toBe(3);
  });

  it("renders label, formatted count, and percent for each stage", () => {
    const element = createComponent({ stages: STAGES });
    const labels = element.shadowRoot.querySelectorAll(".ir-funnel__label");
    const counts = element.shadowRoot.querySelectorAll(".ir-funnel__count");
    const pcts = element.shadowRoot.querySelectorAll(".ir-funnel__pct");
    expect(labels[0].textContent).toBe("Commitments");
    expect(counts[0].textContent).toBe("20");
    expect(pcts[1].textContent).toBe("(75%)");
  });

  it("applies a clip-path trapezoid background to each bar", () => {
    const element = createComponent({ stages: STAGES });
    const bar = element.shadowRoot.querySelector(".ir-funnel__bar");
    expect(bar.style.clipPath || bar.getAttribute("style")).toContain("polygon");
  });

  it("derives width from count when pct is absent (no crash)", () => {
    const element = createComponent({
      stages: [
        { label: "A", count: 10 },
        { label: "B", count: 5 }
      ]
    });
    const items = element.shadowRoot.querySelectorAll(".ir-funnel__stage");
    expect(items.length).toBe(2);
    // percent text is omitted when pct is not supplied
    expect(element.shadowRoot.querySelector(".ir-funnel__pct")).toBeNull();
  });

  it("renders an empty state when there are no stages", () => {
    const element = createComponent({ stages: [] });
    expect(element.shadowRoot.querySelector(".ir-funnel__empty")).not.toBeNull();
    expect(element.shadowRoot.querySelector("ol")).toBeNull();
  });

  it("is accessible", async () => {
    const element = createComponent({ stages: STAGES });
    await expect(element).toBeAccessible();
  });
});
