import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import SectionCard from "c/sectionCard";

beforeAll(() => {
  registerSa11yMatcher();
});

function createComponent(props = {}) {
  const element = createElement("c-section-card", { is: SectionCard });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-section-card", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders the title in a heading and links it via aria-labelledby", () => {
    const element = createComponent({ title: "Active Offerings" });

    const heading = element.shadowRoot.querySelector("h2");
    expect(heading.textContent.trim()).toBe("Active Offerings");

    const article = element.shadowRoot.querySelector("article");
    expect(article.getAttribute("aria-labelledby")).toBe(heading.id);
  });

  it("renders an icon only when iconName is provided", () => {
    const withIcon = createComponent({
      title: "Wires",
      iconName: "utility:moneybag"
    });
    expect(withIcon.shadowRoot.querySelector("lightning-icon")).not.toBeNull();
  });

  it("omits the icon when iconName is absent", () => {
    const noIcon = createComponent({ title: "Plain" });
    expect(noIcon.shadowRoot.querySelector("lightning-icon")).toBeNull();
  });

  it("applies the compact modifier class when compact is true", () => {
    const element = createComponent({ title: "Dense", compact: true });
    const article = element.shadowRoot.querySelector("article");
    expect(article.classList.contains("ir-section-card_compact")).toBe(true);
  });

  it("exposes default and actions slots", () => {
    const element = createComponent({ title: "Slots" });
    const slots = element.shadowRoot.querySelectorAll("slot");
    const slotNames = Array.from(slots).map((s) => s.getAttribute("name") || "default");
    expect(slotNames).toContain("default");
    expect(slotNames).toContain("actions");
  });

  it("is accessible", async () => {
    const element = createComponent({
      title: "Accessible Card",
      iconName: "utility:moneybag"
    });
    await expect(element).toBeAccessible();
  });
});
