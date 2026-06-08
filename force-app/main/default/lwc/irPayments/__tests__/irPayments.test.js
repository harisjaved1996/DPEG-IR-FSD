import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrPayments from "c/irPayments";
import getPayments from "@salesforce/apex/PaymentsController.getPayments";

jest.mock("@salesforce/apex/PaymentsController.getPayments", () => ({ default: jest.fn() }), {
  virtual: true
});

beforeAll(() => {
  registerSa11yMatcher();
});

const PAYMENTS = {
  kpis: [
    {
      key: "contributionsThisPeriod",
      label: "Contributions This Period",
      value: 3000000,
      displayValue: "$3.0M",
      unit: "currency"
    },
    {
      key: "wiresReceived",
      label: "Wires Received",
      value: 12,
      displayValue: "12",
      unit: "number"
    },
    { key: "wiresInReview", label: "Wires In Review", value: 3, displayValue: "3", unit: "number" },
    { key: "wiresUnmatched", label: "Wires Unmatched", value: 1, displayValue: "1", unit: "number" }
  ],
  wires: [
    {
      recordId: "a04000000000001",
      sender: "Acme Capital LLC",
      amount: 250000,
      memo: "Subscription",
      received: "2026-04-10T14:30:00.000Z",
      confidence: 99,
      bucket: "Auto-Settle",
      matchStatus: "Matched",
      matchedAccount: "Acme Capital LLC"
    }
  ],
  contributions: [
    {
      recordId: "a05000000000001",
      entityName: "Acme Capital LLC",
      amount: 250000,
      method: "Wire",
      wireName: "W-001",
      contributionDate: "2026-04-10",
      matchStatus: "Matched"
    },
    {
      recordId: "a05000000000002",
      entityName: "Beta Holdings LP",
      amount: 100000,
      method: "Wire",
      wireName: "W-002",
      contributionDate: "2026-04-12",
      matchStatus: "Matched"
    }
  ]
};

function createComponent() {
  const element = createElement("c-ir-payments", { is: IrPayments });
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-ir-payments", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getPayments once with the default 18-month period", async () => {
    getPayments.mockResolvedValue(PAYMENTS);
    createComponent();
    await flush();
    expect(getPayments).toHaveBeenCalledTimes(1);
    expect(getPayments).toHaveBeenCalledWith({ periodMonths: 18 });
  });

  it("renders one kpiCard per KPI", async () => {
    getPayments.mockResolvedValue(PAYMENTS);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelectorAll("c-kpi-card").length).toBe(4);
  });

  it("passes the wires down to the wire feed child", async () => {
    getPayments.mockResolvedValue(PAYMENTS);
    const element = createComponent();
    await flush();
    const feed = element.shadowRoot.querySelector("c-ir-wire-feed");
    expect(feed).not.toBeNull();
    expect(feed.wires.length).toBe(1);
    expect(feed.wires[0].sender).toBe("Acme Capital LLC");
  });

  it("passes the contributions to the data table card", async () => {
    getPayments.mockResolvedValue(PAYMENTS);
    const element = createComponent();
    await flush();
    const table = element.shadowRoot.querySelector("c-data-table-card");
    expect(table).not.toBeNull();
    expect(table.rows.length).toBe(2);
    expect(table.rows[0].id).toBe("a05000000000001");
  });

  it("hides the spinner after data resolves", async () => {
    getPayments.mockResolvedValue(PAYMENTS);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector("lightning-spinner")).toBeNull();
    expect(element.shadowRoot.querySelector("c-ir-wire-feed")).not.toBeNull();
  });

  it("shows an error alert when the call rejects", async () => {
    getPayments.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-kpi-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getPayments.mockResolvedValue(PAYMENTS);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
