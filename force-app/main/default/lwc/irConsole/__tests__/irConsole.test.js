import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrConsole from "c/irConsole";
import getConsole from "@salesforce/apex/IRConsoleController.getConsole";

// Mock the imperative Apex method imported by the component.
jest.mock("@salesforce/apex/IRConsoleController.getConsole", () => ({ default: jest.fn() }), {
  virtual: true
});

// Capture NavigationMixin.Navigate calls. Keep the real Navigate/GenerateUrl
// symbols from the sfdx-lwc-jest stub (so the component's
// `this[NavigationMixin.Navigate]` resolves) and only override the mixin's
// navigate method to route into a spy.
const mockNavigate = jest.fn();
jest.mock("lightning/navigation", () => {
  const actual = jest.requireActual("lightning/navigation");
  const Navigate = actual.NavigationMixin.Navigate;
  const GenerateUrl = actual.NavigationMixin.GenerateUrl;
  const NavigationMixinMock = (Base) =>
    class extends Base {
      [Navigate](...args) {
        mockNavigate(...args);
      }
      [GenerateUrl]() {
        return Promise.resolve("https://www.example.com");
      }
    };
  NavigationMixinMock.Navigate = Navigate;
  NavigationMixinMock.GenerateUrl = GenerateUrl;
  return { ...actual, NavigationMixin: NavigationMixinMock };
});

beforeAll(() => {
  registerSa11yMatcher();
});

const CONSOLE_DATA = {
  kpis: [
    {
      key: "raisedThisPeriod",
      label: "Raised This Period",
      value: 1200000,
      displayValue: "$1.2M",
      unit: "currency"
    },
    {
      key: "wiresInReview",
      label: "Wires In Review",
      value: 2,
      displayValue: "2",
      unit: "number"
    }
  ],
  activeOfferings: [
    {
      offeringId: "a01000000000001",
      name: "Maple Grove Apartments",
      offeringDisplayId: "OFF-001",
      status: "Open",
      amountRaised: 6000000,
      targetRaise: 10000000,
      raisedPct: 60,
      committedInvestorCount: 12
    }
  ],
  distributionSplit: [
    { label: "ACH", amount: 750000, pct: 75, colorToken: "teal" },
    { label: "Cheque", amount: 250000, pct: 25, colorToken: "navy" }
  ],
  actionQueue: [
    {
      recordId: "a02000000000001",
      category: "Signature",
      label: "Smith Family Trust",
      sublabel: "Subscription document awaiting signature",
      status: "Pending",
      objectApiName: "Subscription_Doc__c"
    }
  ]
};

function createComponent() {
  const element = createElement("c-ir-console", { is: IrConsole });
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-ir-console", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getConsole once on connect", async () => {
    getConsole.mockResolvedValue(CONSOLE_DATA);
    createComponent();
    await flush();
    expect(getConsole).toHaveBeenCalledTimes(1);
  });

  it("renders one kpiCard per KPI returned", async () => {
    getConsole.mockResolvedValue(CONSOLE_DATA);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelectorAll("c-kpi-card").length).toBe(2);
  });

  it("passes active offerings down to the active offerings table child", async () => {
    getConsole.mockResolvedValue(CONSOLE_DATA);
    const element = createComponent();
    await flush();
    const table = element.shadowRoot.querySelector("c-ir-active-offerings-table");
    expect(table).not.toBeNull();
    expect(table.offerings.length).toBe(1);
  });

  it("maps split slices onto the donut chart value shape", async () => {
    getConsole.mockResolvedValue(CONSOLE_DATA);
    const element = createComponent();
    await flush();
    const donut = element.shadowRoot.querySelector("c-donut-chart");
    expect(donut).not.toBeNull();
    expect(donut.slices.length).toBe(2);
    expect(donut.slices[0]).toEqual({
      label: "ACH",
      value: 750000,
      colorToken: "teal"
    });
    expect(donut.centerValue).toContain("$1,000,000");
  });

  it("passes the action queue down to the action queue child", async () => {
    getConsole.mockResolvedValue(CONSOLE_DATA);
    const element = createComponent();
    await flush();
    const queue = element.shadowRoot.querySelector("c-ir-action-queue");
    expect(queue).not.toBeNull();
    expect(queue.items.length).toBe(1);
    expect(queue.items[0].label).toBe("Smith Family Trust");
  });

  it("renders the static automation baselines card", async () => {
    getConsole.mockResolvedValue(CONSOLE_DATA);
    const element = createComponent();
    await flush();
    const rows = element.shadowRoot.querySelectorAll(".ir-console__baseline-row");
    expect(rows.length).toBe(4);
  });

  it("navigates to the record when an action item is selected", async () => {
    getConsole.mockResolvedValue(CONSOLE_DATA);
    const element = createComponent();
    await flush();
    const queue = element.shadowRoot.querySelector("c-ir-action-queue");
    queue.dispatchEvent(
      new CustomEvent("itemselect", {
        detail: {
          recordId: "a02000000000001",
          objectApiName: "Subscription_Doc__c"
        }
      })
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    const navArg = mockNavigate.mock.calls[0][0];
    expect(navArg.type).toBe("standard__recordPage");
    expect(navArg.attributes.recordId).toBe("a02000000000001");
  });

  it("does not navigate when the selected item has no record id", async () => {
    getConsole.mockResolvedValue(CONSOLE_DATA);
    const element = createComponent();
    await flush();
    const queue = element.shadowRoot.querySelector("c-ir-action-queue");
    queue.dispatchEvent(new CustomEvent("itemselect", { detail: { recordId: null } }));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows an error alert and no content when the call rejects", async () => {
    getConsole.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-kpi-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getConsole.mockResolvedValue(CONSOLE_DATA);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
