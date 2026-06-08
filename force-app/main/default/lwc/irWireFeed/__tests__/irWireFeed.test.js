import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrWireFeed from "c/irWireFeed";

beforeAll(() => {
  registerSa11yMatcher();
});

const WIRES = [
  {
    recordId: "a04000000000001",
    sender: "Acme Capital LLC",
    amount: 250000,
    memo: "Maple Grove subscription",
    received: "2026-04-10T14:30:00.000Z",
    confidence: 99,
    bucket: "Auto-Settle",
    matchStatus: "Matched",
    matchedAccount: "Acme Capital LLC"
  },
  {
    recordId: "a04000000000002",
    sender: "Unknown Originator",
    amount: 50000,
    memo: "",
    received: "2026-04-11T09:00:00.000Z",
    confidence: 42,
    bucket: "Unmatched",
    matchStatus: "Unmatched",
    matchedAccount: null
  }
];

function createComponent(props = {}) {
  const element = createElement("c-ir-wire-feed", { is: IrWireFeed });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-ir-wire-feed", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders a row per wire", () => {
    const element = createComponent({ wires: WIRES });
    const bodyRows = element.shadowRoot.querySelectorAll("tbody tr");
    expect(bodyRows.length).toBe(2);
  });

  it("renders a confidence badge and status badge per row", () => {
    const element = createComponent({ wires: WIRES });
    const confidenceBadges = element.shadowRoot.querySelectorAll("c-confidence-badge");
    const statusBadges = element.shadowRoot.querySelectorAll("c-status-badge");
    expect(confidenceBadges.length).toBe(2);
    expect(statusBadges.length).toBe(2);
    expect(confidenceBadges[0].bucket).toBe("Auto-Settle");
    expect(confidenceBadges[0].confidence).toBe(99);
    expect(statusBadges[0].status).toBe("Matched");
  });

  it("shows the row count badge in the header", () => {
    const element = createComponent({ wires: WIRES });
    const count = element.shadowRoot.querySelector(".ir-wire-feed__count");
    expect(count.textContent.trim()).toBe("2");
  });

  it("renders an empty state when there are no wires", () => {
    const element = createComponent({ wires: [] });
    expect(element.shadowRoot.querySelector("tbody")).toBeNull();
    expect(element.shadowRoot.querySelector(".ir-wire-feed__empty")).not.toBeNull();
  });

  it("guards against a non-array wires value", () => {
    const element = createComponent({ wires: null });
    expect(element.shadowRoot.querySelector(".ir-wire-feed__empty")).not.toBeNull();
  });

  it("is accessible with rows", async () => {
    const element = createComponent({ wires: WIRES });
    await expect(element).toBeAccessible();
  });

  it("is accessible in the empty state", async () => {
    const element = createComponent({ wires: [] });
    await expect(element).toBeAccessible();
  });
});
