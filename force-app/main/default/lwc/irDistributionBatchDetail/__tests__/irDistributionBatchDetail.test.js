import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrDistributionBatchDetail from "c/irDistributionBatchDetail";
import getBatchDetail from "@salesforce/apex/DistributionsController.getBatchDetail";

jest.mock(
  "@salesforce/apex/DistributionsController.getBatchDetail",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

beforeAll(() => {
  registerSa11yMatcher();
});

const DETAIL = [
  {
    recordId: "a02000000000001",
    entityName: "Acme Capital LLC",
    equityPct: 12.5,
    amount: 250000,
    method: "ACH",
    achStatus: "Settled"
  },
  {
    recordId: "a02000000000002",
    entityName: "Beta Holdings LP",
    equityPct: 7.25,
    amount: 100000,
    method: "Cheque",
    achStatus: "N/A"
  }
];

function createComponent(props = {}) {
  const element = createElement("c-ir-distribution-batch-detail", {
    is: IrDistributionBatchDetail
  });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-ir-distribution-batch-detail", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getBatchDetail with the batchId when set", async () => {
    getBatchDetail.mockResolvedValue(DETAIL);
    createComponent({ batchId: "a01000000000099" });
    await flush();
    expect(getBatchDetail).toHaveBeenCalledTimes(1);
    expect(getBatchDetail).toHaveBeenCalledWith({ batchId: "a01000000000099" });
  });

  it("renders a row per distribution and normalizes equity % to a fraction", async () => {
    getBatchDetail.mockResolvedValue(DETAIL);
    const element = createComponent({ batchId: "a01000000000099", batchName: "Batch 7" });
    await flush();
    const table = element.shadowRoot.querySelector("lightning-datatable");
    expect(table).not.toBeNull();
    expect(table.data.length).toBe(2);
    expect(table.data[0].equityPct).toBeCloseTo(0.125);
  });

  it("renders the batch name in the modal header", async () => {
    getBatchDetail.mockResolvedValue(DETAIL);
    const element = createComponent({ batchId: "a01000000000099", batchName: "Batch 7" });
    await flush();
    const heading = element.shadowRoot.querySelector(".slds-modal__title");
    expect(heading.textContent).toContain("Batch 7");
  });

  it("emits close when the footer button is clicked", async () => {
    getBatchDetail.mockResolvedValue(DETAIL);
    const element = createComponent({ batchId: "a01000000000099" });
    await flush();
    const handler = jest.fn();
    element.addEventListener("close", handler);
    const closeBtn = element.shadowRoot.querySelector(".slds-modal__footer button");
    closeBtn.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("renders an empty state when the batch has no distributions", async () => {
    getBatchDetail.mockResolvedValue([]);
    const element = createComponent({ batchId: "a01000000000099" });
    await flush();
    expect(element.shadowRoot.querySelector("lightning-datatable")).toBeNull();
    expect(element.shadowRoot.querySelector('[role="status"]')).not.toBeNull();
  });

  it("shows an error alert when the call rejects", async () => {
    getBatchDetail.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent({ batchId: "a01000000000099" });
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getBatchDetail.mockResolvedValue(DETAIL);
    const element = createComponent({ batchId: "a01000000000099", batchName: "Batch 7" });
    await flush();
    await expect(element).toBeAccessible();
  });
});
