import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import ConfidenceBadge from "c/confidenceBadge";

beforeAll(() => {
  registerSa11yMatcher();
});

function createComponent(props = {}) {
  const element = createElement("c-confidence-badge", {
    is: ConfidenceBadge
  });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-confidence-badge", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("derives the Auto-Settle bucket and success theme from a high score", () => {
    const element = createComponent({ confidence: 99 });
    expect(element.shadowRoot.querySelector(".ir-confidence-badge__bucket").textContent).toBe(
      "Auto-Settle"
    );
    expect(
      element.shadowRoot.querySelector(".slds-badge").classList.contains("slds-theme_success")
    ).toBe(true);
  });

  it("derives the Review bucket and warning theme from a mid score", () => {
    const element = createComponent({ confidence: 85 });
    expect(element.shadowRoot.querySelector(".ir-confidence-badge__bucket").textContent).toBe(
      "Review"
    );
    expect(
      element.shadowRoot.querySelector(".slds-badge").classList.contains("slds-theme_warning")
    ).toBe(true);
  });

  it("derives the Unmatched bucket and error theme from a low score", () => {
    const element = createComponent({ confidence: 40 });
    expect(element.shadowRoot.querySelector(".ir-confidence-badge__bucket").textContent).toBe(
      "Unmatched"
    );
    expect(
      element.shadowRoot.querySelector(".slds-badge").classList.contains("slds-theme_error")
    ).toBe(true);
  });

  it("shows the numeric score when confidence is provided", () => {
    const element = createComponent({ confidence: 99 });
    expect(element.shadowRoot.querySelector(".ir-confidence-badge__score").textContent).toBe("99%");
  });

  it("respects an explicit bucket and omits the score when no confidence", () => {
    const element = createComponent({ bucket: "Review" });
    expect(element.shadowRoot.querySelector(".ir-confidence-badge__bucket").textContent).toBe(
      "Review"
    );
    expect(element.shadowRoot.querySelector(".ir-confidence-badge__score")).toBeNull();
  });

  it("exposes a combined aria-label", () => {
    const element = createComponent({ confidence: 99 });
    const badge = element.shadowRoot.querySelector(".slds-badge");
    expect(badge.getAttribute("aria-label")).toContain("Auto-Settle");
    expect(badge.getAttribute("aria-label")).toContain("99%");
  });

  it("renders nothing when neither bucket nor confidence is provided", () => {
    const element = createComponent({});
    expect(element.shadowRoot.querySelector(".slds-badge")).toBeNull();
  });

  it("is accessible", async () => {
    const element = createComponent({ confidence: 85 });
    await expect(element).toBeAccessible();
  });
});
