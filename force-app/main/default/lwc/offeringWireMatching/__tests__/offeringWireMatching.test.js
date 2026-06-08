import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import OfferingWireMatching from "c/offeringWireMatching";
import getWireMatching from "@salesforce/apex/OfferingWorkspaceController.getWireMatching";

jest.mock(
  "@salesforce/apex/OfferingWorkspaceController.getWireMatching",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

beforeAll(() => {
  registerSa11yMatcher();
});

const RECORD_ID = "a01000000000001AAA";

const WIRE_DATA = [
  {
    bucket: "Review",
    count: 1,
    totalAmount: 50000,
    wires: [
      {
        recordId: "a10000000000002AAA",
        sender: "Beta Holdings LP",
        amount: 50000,
        memo: "Subscription",
        confidence: 82,
        bucket: "Review",
        matchStatus: "Review",
        matchedAccount: "Beta Holdings LP"
      }
    ]
  },
  {
    bucket: "Auto-Settle",
    count: 2,
    totalAmount: 375000,
    wires: [
      {
        recordId: "a10000000000001AAA",
        sender: "Acme Capital LLC",
        amount: 250000,
        memo: "OFF-001 contribution",
        confidence: 100,
        bucket: "Auto-Settle",
        matchStatus: "Matched",
        matchedAccount: "Acme Capital LLC"
      },
      {
        recordId: "a10000000000003AAA",
        sender: "Gamma Trust",
        amount: 125000,
        memo: "Capital call",
        confidence: 99,
        bucket: "Auto-Settle",
        matchStatus: "Matched",
        matchedAccount: "Gamma Trust"
      }
    ]
  }
];

function createComponent() {
  const element = createElement("c-offering-wire-matching", { is: OfferingWireMatching });
  element.recordId = RECORD_ID;
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-offering-wire-matching", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getWireMatching once with the offering id", async () => {
    getWireMatching.mockResolvedValue(WIRE_DATA);
    createComponent();
    await flush();
    expect(getWireMatching).toHaveBeenCalledTimes(1);
    expect(getWireMatching.mock.calls[0][0]).toEqual({ offeringId: RECORD_ID });
  });

  it("renders three bucket section cards in fixed order", async () => {
    getWireMatching.mockResolvedValue(WIRE_DATA);
    const element = createComponent();
    await flush();
    const cards = element.shadowRoot.querySelectorAll("c-section-card");
    expect(cards.length).toBe(3);
    expect([...cards].map((c) => c.title)).toEqual(["Auto-Settle", "Review", "Unmatched"]);
  });

  it("renders a header confidence badge for each bucket plus one per wire", async () => {
    getWireMatching.mockResolvedValue(WIRE_DATA);
    const element = createComponent();
    await flush();
    // 3 bucket-header badges + 3 wire-row badges (2 auto-settle + 1 review)
    const badges = element.shadowRoot.querySelectorAll("c-confidence-badge");
    expect(badges.length).toBe(6);
  });

  it("renders the wire rows within their buckets", async () => {
    getWireMatching.mockResolvedValue(WIRE_DATA);
    const element = createComponent();
    await flush();
    const rows = element.shadowRoot.querySelectorAll(".ir-wire-matching__row");
    expect(rows.length).toBe(3);
  });

  it("shows the empty Unmatched bucket with a no-wires message", async () => {
    getWireMatching.mockResolvedValue(WIRE_DATA);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.textContent).toContain("No wires in this bucket.");
  });

  it("renders all three empty buckets when no wires are returned", async () => {
    getWireMatching.mockResolvedValue([]);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelectorAll("c-section-card").length).toBe(3);
    expect(element.shadowRoot.querySelectorAll(".ir-wire-matching__row").length).toBe(0);
  });

  it("shows an error alert when the call rejects", async () => {
    getWireMatching.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-section-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getWireMatching.mockResolvedValue(WIRE_DATA);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
