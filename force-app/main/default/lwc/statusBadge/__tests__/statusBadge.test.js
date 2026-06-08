import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import StatusBadge from "c/statusBadge";

beforeAll(() => {
  registerSa11yMatcher();
});

function createComponent(props = {}) {
  const element = createElement("c-status-badge", { is: StatusBadge });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-status-badge", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders the status text", () => {
    const element = createComponent({ status: "Active" });
    expect(element.shadowRoot.querySelector(".ir-status-badge__label").textContent).toBe("Active");
  });

  it("applies the success theme for a positive status", () => {
    const element = createComponent({ status: "Approved" });
    const badge = element.shadowRoot.querySelector(".slds-badge");
    expect(badge.classList.contains("slds-theme_success")).toBe(true);
  });

  it("applies the error theme for a negative status", () => {
    const element = createComponent({ status: "Unmatched" });
    const badge = element.shadowRoot.querySelector(".slds-badge");
    expect(badge.classList.contains("slds-theme_error")).toBe(true);
  });

  it("honors a per-instance variantMap override", () => {
    const element = createComponent({
      status: "Active",
      variantMap: { Active: "warning" }
    });
    const badge = element.shadowRoot.querySelector(".slds-badge");
    expect(badge.classList.contains("slds-theme_warning")).toBe(true);
  });

  it("always renders an icon for color independence", () => {
    const element = createComponent({ status: "Pending Approval" });
    expect(element.shadowRoot.querySelector("lightning-icon")).not.toBeNull();
  });

  it("renders nothing when status is blank", () => {
    const element = createComponent({ status: "" });
    expect(element.shadowRoot.querySelector(".slds-badge")).toBeNull();
  });

  it("is accessible", async () => {
    const element = createComponent({ status: "Completed" });
    await expect(element).toBeAccessible();
  });
});
