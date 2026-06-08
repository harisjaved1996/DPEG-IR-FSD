import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrShareTransfers from "c/irShareTransfers";
import getShareTransfers from "@salesforce/apex/ShareTransferController.getShareTransfers";

jest.mock(
  "@salesforce/apex/ShareTransferController.getShareTransfers",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

// Capture NavigationMixin.Navigate calls.
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

const SHARE_TRANSFERS = {
  kpis: [
    {
      key: "totalTransfers",
      label: "Total Transfers",
      value: 3,
      displayValue: "3",
      unit: "number"
    },
    { key: "status_Active", label: "Active", value: 1, displayValue: "1", unit: "number" },
    {
      key: "status_Pending IR Approval",
      label: "Pending IR Approval",
      value: 1,
      displayValue: "1",
      unit: "number"
    },
    { key: "status_Completed", label: "Completed", value: 1, displayValue: "1", unit: "number" }
  ],
  board: [
    {
      status: "Active",
      count: 1,
      items: [
        {
          recordId: "a10000000000001",
          name: "ST-001",
          fromEntity: "Acme Capital LLC",
          toEntity: "Beta Holdings LP",
          offeringName: "Maple Grove",
          units: 100,
          amount: 250000,
          status: "Active"
        }
      ]
    }
  ],
  transfers: [
    {
      recordId: "a10000000000001",
      name: "ST-001",
      fromEntity: "Acme Capital LLC",
      toEntity: "Beta Holdings LP",
      offeringName: "Maple Grove",
      units: 100,
      amount: 250000,
      status: "Active",
      approvalStatus: "Pending",
      transferDate: "2026-04-10"
    }
  ]
};

function createComponent() {
  const element = createElement("c-ir-share-transfers", { is: IrShareTransfers });
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-ir-share-transfers", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getShareTransfers once on load", async () => {
    getShareTransfers.mockResolvedValue(SHARE_TRANSFERS);
    createComponent();
    await flush();
    expect(getShareTransfers).toHaveBeenCalledTimes(1);
  });

  it("renders one kpiCard per KPI", async () => {
    getShareTransfers.mockResolvedValue(SHARE_TRANSFERS);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelectorAll("c-kpi-card").length).toBe(4);
  });

  it("passes the board lanes to the transfer board child", async () => {
    getShareTransfers.mockResolvedValue(SHARE_TRANSFERS);
    const element = createComponent();
    await flush();
    const board = element.shadowRoot.querySelector("c-ir-transfer-board");
    expect(board).not.toBeNull();
    expect(board.lanes.length).toBe(1);
    expect(board.lanes[0].status).toBe("Active");
  });

  it("passes the transfers to the data table card with stable ids", async () => {
    getShareTransfers.mockResolvedValue(SHARE_TRANSFERS);
    const element = createComponent();
    await flush();
    const table = element.shadowRoot.querySelector("c-data-table-card");
    expect(table).not.toBeNull();
    expect(table.rows.length).toBe(1);
    expect(table.rows[0].id).toBe("a10000000000001");
  });

  it("navigates to the transfer record when a board card is selected", async () => {
    getShareTransfers.mockResolvedValue(SHARE_TRANSFERS);
    const element = createComponent();
    await flush();
    const board = element.shadowRoot.querySelector("c-ir-transfer-board");
    board.dispatchEvent(
      new CustomEvent("transferselect", { detail: { recordId: "a10000000000001" } })
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate.mock.calls[0][0]).toEqual({
      type: "standard__recordPage",
      attributes: {
        recordId: "a10000000000001",
        objectApiName: "Share_Transfer__c",
        actionName: "view"
      }
    });
  });

  it("shows an error alert when the call rejects", async () => {
    getShareTransfers.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-kpi-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getShareTransfers.mockResolvedValue(SHARE_TRANSFERS);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
