import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import OfferingCommitments from "c/offeringCommitments";
import getCommitments from "@salesforce/apex/OfferingWorkspaceController.getCommitments";

jest.mock(
  "@salesforce/apex/OfferingWorkspaceController.getCommitments",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

beforeAll(() => {
  registerSa11yMatcher();
});

const RECORD_ID = "a01000000000001AAA";

const COMMITMENT_DATA = [
  {
    recordId: "a09000000000001AAA",
    entityName: "Acme Capital LLC",
    committedAmount: 250000,
    status: "Approved",
    commitDate: "2025-03-01",
    funded: true
  },
  {
    recordId: "a09000000000002AAA",
    entityName: "Beta Holdings LP",
    committedAmount: 125000,
    status: "Pending",
    commitDate: "2025-03-05",
    funded: false
  }
];

function createComponent() {
  const element = createElement("c-offering-commitments", { is: OfferingCommitments });
  element.recordId = RECORD_ID;
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-offering-commitments", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getCommitments once with the offering id", async () => {
    getCommitments.mockResolvedValue(COMMITMENT_DATA);
    createComponent();
    await flush();
    expect(getCommitments).toHaveBeenCalledTimes(1);
    expect(getCommitments.mock.calls[0][0]).toEqual({ offeringId: RECORD_ID });
  });

  it("renders a dataTableCard with the mapped rows", async () => {
    getCommitments.mockResolvedValue(COMMITMENT_DATA);
    const element = createComponent();
    await flush();
    const card = element.shadowRoot.querySelector("c-data-table-card");
    expect(card).not.toBeNull();
    expect(card.rows.length).toBe(2);
    expect(card.rows[0].id).toBe("a09000000000001AAA");
  });

  it("passes an empty row set to the card when there are no commitments", async () => {
    getCommitments.mockResolvedValue([]);
    const element = createComponent();
    await flush();
    const card = element.shadowRoot.querySelector("c-data-table-card");
    expect(card.rows.length).toBe(0);
  });

  it("shows an error alert when the call rejects", async () => {
    getCommitments.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-data-table-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getCommitments.mockResolvedValue(COMMITMENT_DATA);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
