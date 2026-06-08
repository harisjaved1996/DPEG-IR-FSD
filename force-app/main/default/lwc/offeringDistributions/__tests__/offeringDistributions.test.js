import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import OfferingDistributions from "c/offeringDistributions";
import getDistributionBatches from "@salesforce/apex/OfferingWorkspaceController.getDistributionBatches";

jest.mock(
  "@salesforce/apex/OfferingWorkspaceController.getDistributionBatches",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

beforeAll(() => {
  registerSa11yMatcher();
});

const RECORD_ID = "a01000000000001AAA";

const BATCH_DATA = [
  {
    recordId: "a08000000000001AAA",
    name: "DB-001",
    offeringName: "Maple Grove Apartments",
    batchType: "Quarterly",
    totalAmount: 500000,
    investorCount: 10,
    achAmount: 400000,
    chequeAmount: 100000,
    status: "Completed",
    distDate: "2026-04-15"
  }
];

function createComponent() {
  const element = createElement("c-offering-distributions", { is: OfferingDistributions });
  element.recordId = RECORD_ID;
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-offering-distributions", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getDistributionBatches once with the offering id", async () => {
    getDistributionBatches.mockResolvedValue(BATCH_DATA);
    createComponent();
    await flush();
    expect(getDistributionBatches).toHaveBeenCalledTimes(1);
    expect(getDistributionBatches.mock.calls[0][0]).toEqual({ offeringId: RECORD_ID });
  });

  it("renders a dataTableCard with the mapped rows", async () => {
    getDistributionBatches.mockResolvedValue(BATCH_DATA);
    const element = createComponent();
    await flush();
    const card = element.shadowRoot.querySelector("c-data-table-card");
    expect(card).not.toBeNull();
    expect(card.rows.length).toBe(1);
    expect(card.rows[0].id).toBe("a08000000000001AAA");
  });

  it("passes an empty row set to the card when there are no batches", async () => {
    getDistributionBatches.mockResolvedValue([]);
    const element = createComponent();
    await flush();
    const card = element.shadowRoot.querySelector("c-data-table-card");
    expect(card.rows.length).toBe(0);
  });

  it("shows an error alert when the call rejects", async () => {
    getDistributionBatches.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-data-table-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getDistributionBatches.mockResolvedValue(BATCH_DATA);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
