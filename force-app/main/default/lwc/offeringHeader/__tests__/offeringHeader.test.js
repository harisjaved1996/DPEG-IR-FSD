import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import OfferingHeader from "c/offeringHeader";
import getHeader from "@salesforce/apex/OfferingWorkspaceController.getHeader";

jest.mock(
  "@salesforce/apex/OfferingWorkspaceController.getHeader",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

beforeAll(() => {
  registerSa11yMatcher();
});

const RECORD_ID = "a01000000000001AAA";

const HEADER_DATA = {
  offeringId: RECORD_ID,
  name: "Maple Grove Apartments",
  offeringDisplayId: "OFF-001",
  status: "Active Fundraising",
  stages: [
    "Draft",
    "Pre-Launch",
    "Active Fundraising",
    "Fully Subscribed",
    "Signatures Pending",
    "Ready to Activate",
    "Investment Active",
    "Closed Funded"
  ],
  currentStageIndex: 2,
  targetRaise: 10000000,
  amountRaised: 6000000,
  raisedPct: 60,
  overbookCap: 12000000,
  committedCount: 12,
  closingDate: "2026-09-30"
};

function createComponent() {
  const element = createElement("c-offering-header", { is: OfferingHeader });
  element.recordId = RECORD_ID;
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-offering-header", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getHeader once with the offering id", async () => {
    getHeader.mockResolvedValue(HEADER_DATA);
    createComponent();
    await flush();
    expect(getHeader).toHaveBeenCalledTimes(1);
    expect(getHeader.mock.calls[0][0]).toEqual({ offeringId: RECORD_ID });
  });

  it("renders the stage tracker with the current index", async () => {
    getHeader.mockResolvedValue(HEADER_DATA);
    const element = createComponent();
    await flush();
    const tracker = element.shadowRoot.querySelector("c-stage-tracker");
    expect(tracker).not.toBeNull();
    expect(tracker.stages.length).toBe(8);
    expect(tracker.currentIndex).toBe(2);
  });

  it("renders six KPI cards", async () => {
    getHeader.mockResolvedValue(HEADER_DATA);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelectorAll("c-kpi-card").length).toBe(6);
  });

  it("formats KPI display values from the DTO", async () => {
    getHeader.mockResolvedValue(HEADER_DATA);
    const element = createComponent();
    await flush();
    const cards = element.shadowRoot.querySelectorAll("c-kpi-card");
    const values = [...cards].map((c) => c.value);
    expect(values).toContain("$10M"); // target raise
    expect(values).toContain("$6M"); // amount raised
    expect(values).toContain("60%"); // raised pct
    expect(values).toContain("12"); // committed count
  });

  it("renders the status badge", async () => {
    getHeader.mockResolvedValue(HEADER_DATA);
    const element = createComponent();
    await flush();
    const badge = element.shadowRoot.querySelector("c-status-badge");
    expect(badge).not.toBeNull();
    expect(badge.status).toBe("Active Fundraising");
  });

  it("shows an error alert and no content when the call rejects", async () => {
    getHeader.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-kpi-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getHeader.mockResolvedValue(HEADER_DATA);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
