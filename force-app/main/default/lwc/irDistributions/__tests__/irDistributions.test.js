import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrDistributions from "c/irDistributions";
import getDistributions from "@salesforce/apex/DistributionsController.getDistributions";

jest.mock(
  "@salesforce/apex/DistributionsController.getDistributions",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

// The batch-detail child imports getBatchDetail; mock it so the modal mounts cleanly.
jest.mock(
  "@salesforce/apex/DistributionsController.getBatchDetail",
  () => ({ default: jest.fn(() => Promise.resolve([])) }),
  { virtual: true }
);

beforeAll(() => {
  registerSa11yMatcher();
});

const DISTRIBUTIONS = {
  kpis: [
    {
      key: "distributedThisPeriod",
      label: "Distributed This Period",
      value: 1250000,
      displayValue: "$1.3M",
      unit: "currency"
    },
    { key: "investorsPaid", label: "Investors Paid", value: 8, displayValue: "8", unit: "number" },
    { key: "achShare", label: "ACH Share", value: 82.5, displayValue: "82.5%", unit: "percent" },
    {
      key: "pendingApproval",
      label: "Pending Approval",
      value: 1,
      displayValue: "1",
      unit: "number"
    }
  ],
  batches: [
    {
      recordId: "a03000000000001",
      name: "Batch 7",
      offeringName: "Maple Grove Fund I",
      batchType: "Quarterly",
      totalAmount: 1000000,
      investorCount: 6,
      achAmount: 800000,
      chequeAmount: 200000,
      status: "Completed",
      distDate: "2026-04-15"
    },
    {
      recordId: "a03000000000002",
      name: "Batch 8",
      offeringName: "Riverside Fund II",
      batchType: "Special",
      totalAmount: 250000,
      investorCount: 2,
      achAmount: 250000,
      chequeAmount: 0,
      status: "Pending Approval",
      distDate: "2026-05-01"
    }
  ]
};

function createComponent() {
  const element = createElement("c-ir-distributions", { is: IrDistributions });
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-ir-distributions", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getDistributions once with the default 18-month period", async () => {
    getDistributions.mockResolvedValue(DISTRIBUTIONS);
    createComponent();
    await flush();
    expect(getDistributions).toHaveBeenCalledTimes(1);
    expect(getDistributions).toHaveBeenCalledWith({ periodMonths: 18 });
  });

  it("renders one kpiCard per KPI", async () => {
    getDistributions.mockResolvedValue(DISTRIBUTIONS);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelectorAll("c-kpi-card").length).toBe(4);
  });

  it("builds the ACH vs Cheque donut slices from batch totals", async () => {
    getDistributions.mockResolvedValue(DISTRIBUTIONS);
    const element = createComponent();
    await flush();
    const donut = element.shadowRoot.querySelector("c-donut-chart");
    expect(donut).not.toBeNull();
    expect(donut.slices.length).toBe(2);
    expect(donut.slices[0]).toEqual({ label: "ACH", value: 1050000, colorToken: "teal" });
    expect(donut.slices[1]).toEqual({ label: "Cheque", value: 200000, colorToken: "navy" });
  });

  it("passes the batch rows to the data table card", async () => {
    getDistributions.mockResolvedValue(DISTRIBUTIONS);
    const element = createComponent();
    await flush();
    const table = element.shadowRoot.querySelector("c-data-table-card");
    expect(table).not.toBeNull();
    expect(table.rows.length).toBe(2);
  });

  it("opens the batch-detail modal on a viewDetail row action", async () => {
    getDistributions.mockResolvedValue(DISTRIBUTIONS);
    const element = createComponent();
    await flush();
    const table = element.shadowRoot.querySelector("c-data-table-card");
    table.dispatchEvent(
      new CustomEvent("rowaction", {
        detail: { action: { name: "viewDetail" }, row: { id: "a03000000000001", name: "Batch 7" } }
      })
    );
    await flush();
    const detail = element.shadowRoot.querySelector("c-ir-distribution-batch-detail");
    expect(detail).not.toBeNull();
    expect(detail.batchId).toBe("a03000000000001");
    expect(detail.batchName).toBe("Batch 7");
  });

  it("closes the batch-detail modal on the close event", async () => {
    getDistributions.mockResolvedValue(DISTRIBUTIONS);
    const element = createComponent();
    await flush();
    const table = element.shadowRoot.querySelector("c-data-table-card");
    table.dispatchEvent(
      new CustomEvent("rowaction", {
        detail: { action: { name: "viewDetail" }, row: { id: "a03000000000001", name: "Batch 7" } }
      })
    );
    await flush();
    let detail = element.shadowRoot.querySelector("c-ir-distribution-batch-detail");
    detail.dispatchEvent(new CustomEvent("close"));
    await flush();
    detail = element.shadowRoot.querySelector("c-ir-distribution-batch-detail");
    expect(detail).toBeNull();
  });

  it("shows an error alert when the call rejects", async () => {
    getDistributions.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-kpi-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getDistributions.mockResolvedValue(DISTRIBUTIONS);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
