import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import OfferingContributions from "c/offeringContributions";
import getContributions from "@salesforce/apex/OfferingWorkspaceController.getContributions";

jest.mock(
  "@salesforce/apex/OfferingWorkspaceController.getContributions",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

beforeAll(() => {
  registerSa11yMatcher();
});

const RECORD_ID = "a01000000000001AAA";

const CONTRIBUTION_DATA = [
  {
    recordId: "a07000000000001AAA",
    entityName: "Acme Capital LLC",
    amount: 250000,
    method: "Wire",
    wireName: "WIRE-001",
    contributionDate: "2025-04-12",
    matchStatus: "Matched"
  },
  {
    recordId: "a07000000000002AAA",
    entityName: "Beta Holdings LP",
    amount: 125000,
    method: "ACH",
    wireName: null,
    contributionDate: "2025-04-15",
    matchStatus: "Unmatched"
  }
];

function createComponent() {
  const element = createElement("c-offering-contributions", { is: OfferingContributions });
  element.recordId = RECORD_ID;
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-offering-contributions", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getContributions once with the offering id", async () => {
    getContributions.mockResolvedValue(CONTRIBUTION_DATA);
    createComponent();
    await flush();
    expect(getContributions).toHaveBeenCalledTimes(1);
    expect(getContributions.mock.calls[0][0]).toEqual({ offeringId: RECORD_ID });
  });

  it("renders a dataTableCard with the mapped rows", async () => {
    getContributions.mockResolvedValue(CONTRIBUTION_DATA);
    const element = createComponent();
    await flush();
    const card = element.shadowRoot.querySelector("c-data-table-card");
    expect(card).not.toBeNull();
    expect(card.rows.length).toBe(2);
    expect(card.rows[0].id).toBe("a07000000000001AAA");
  });

  it("passes an empty row set to the card when there are no contributions", async () => {
    getContributions.mockResolvedValue([]);
    const element = createComponent();
    await flush();
    const card = element.shadowRoot.querySelector("c-data-table-card");
    expect(card.rows.length).toBe(0);
  });

  it("shows an error alert when the call rejects", async () => {
    getContributions.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-data-table-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getContributions.mockResolvedValue(CONTRIBUTION_DATA);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
