import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import ProgressBar from "c/progressBar";

beforeAll(() => {
  registerSa11yMatcher();
});

function createComponent(props = {}) {
  const element = createElement("c-progress-bar", { is: ProgressBar });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-progress-bar", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("uses the explicit percent when provided", () => {
    const element = createComponent({ percent: 73, label: "Raised" });
    const track = element.shadowRoot.querySelector('[role="progressbar"]');
    expect(track.getAttribute("aria-valuenow")).toBe("73");
    const fill = element.shadowRoot.querySelector(".ir-progress-bar__fill");
    expect(fill.style.width).toBe("73%");
  });

  it("computes percent from value and max", () => {
    const element = createComponent({ value: 25, max: 50 });
    const track = element.shadowRoot.querySelector('[role="progressbar"]');
    expect(track.getAttribute("aria-valuenow")).toBe("50");
  });

  it("clamps percentages above 100", () => {
    const element = createComponent({ percent: 140 });
    const track = element.shadowRoot.querySelector('[role="progressbar"]');
    expect(track.getAttribute("aria-valuenow")).toBe("100");
  });

  it("falls back to 0 when no usable input is provided", () => {
    const element = createComponent({ label: "Empty" });
    const track = element.shadowRoot.querySelector('[role="progressbar"]');
    expect(track.getAttribute("aria-valuenow")).toBe("0");
  });

  it("applies the variant fill class", () => {
    const element = createComponent({ percent: 40, variant: "teal" });
    const fill = element.shadowRoot.querySelector(".ir-progress-bar__fill");
    expect(fill.classList.contains("fill-teal")).toBe(true);
  });

  it("exposes aria min/max and a human-readable valuetext", () => {
    const element = createComponent({ value: 30, max: 60, label: "Raised" });
    const track = element.shadowRoot.querySelector('[role="progressbar"]');
    expect(track.getAttribute("aria-valuemin")).toBe("0");
    expect(track.getAttribute("aria-valuemax")).toBe("100");
    expect(track.getAttribute("aria-valuetext")).toContain("30 of 60");
  });

  it("hides the numeric value text when hideValue is true", () => {
    const element = createComponent({
      percent: 40,
      label: "Raised",
      hideValue: true
    });
    expect(element.shadowRoot.querySelector(".ir-progress-bar__value")).toBeNull();
  });

  it("is accessible", async () => {
    const element = createComponent({
      percent: 65,
      label: "Target IRR progress"
    });
    await expect(element).toBeAccessible();
  });
});
