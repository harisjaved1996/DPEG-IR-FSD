import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import TierPill from "c/tierPill";

beforeAll(() => {
  registerSa11yMatcher();
});

function createComponent(props = {}) {
  const element = createElement("c-tier-pill", { is: TierPill });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-tier-pill", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders the tier label", () => {
    const element = createComponent({ tier: "Anchor" });
    expect(element.shadowRoot.querySelector(".ir-tier-pill__label").textContent).toBe("Anchor");
  });

  it("applies tier-specific styling classes", () => {
    const anchor = createComponent({ tier: "Anchor" });
    expect(anchor.shadowRoot.querySelector(".ir-tier-pill").classList.contains("tier-anchor")).toBe(
      true
    );

    const active = createComponent({ tier: "Active" });
    expect(active.shadowRoot.querySelector(".ir-tier-pill").classList.contains("tier-active")).toBe(
      true
    );
  });

  it("falls back to dormant styling for an unknown tier", () => {
    const element = createComponent({ tier: "Platinum" });
    const pill = element.shadowRoot.querySelector(".ir-tier-pill");
    expect(pill.classList.contains("tier-dormant")).toBe(true);
    // label still reflects the provided value
    expect(element.shadowRoot.querySelector(".ir-tier-pill__label").textContent).toBe("Platinum");
  });

  it("renders an icon for color independence", () => {
    const element = createComponent({ tier: "Active" });
    expect(element.shadowRoot.querySelector("lightning-icon")).not.toBeNull();
  });

  it("renders nothing when tier is blank", () => {
    const element = createComponent({ tier: "" });
    expect(element.shadowRoot.querySelector(".ir-tier-pill")).toBeNull();
  });

  it("is accessible", async () => {
    const element = createComponent({ tier: "Anchor" });
    await expect(element).toBeAccessible();
  });
});
