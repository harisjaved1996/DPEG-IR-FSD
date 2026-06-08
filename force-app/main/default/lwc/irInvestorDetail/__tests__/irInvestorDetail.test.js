import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrInvestorDetail from "c/irInvestorDetail";
import getInvestorDetail from "@salesforce/apex/InvestorDetailController.getInvestorDetail";

jest.mock(
  "@salesforce/apex/InvestorDetailController.getInvestorDetail",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

beforeAll(() => {
  registerSa11yMatcher();
});

const RECORD_ID = "a20000000000001";

const DETAIL = {
  investorId: RECORD_ID,
  investorName: "Smith Family Trust",
  tier: "Anchor",
  kycStatus: "Verified",
  summary: [
    {
      key: "lifetimeInvested",
      label: "Lifetime Invested",
      value: 2500000,
      displayValue: "$2.5M",
      unit: "currency"
    },
    {
      key: "totalCommitments",
      label: "Total Commitments",
      value: 3,
      displayValue: "3",
      unit: "number"
    },
    {
      key: "activePositions",
      label: "Active Positions",
      value: 2,
      displayValue: "2",
      unit: "number"
    },
    {
      key: "investingEntities",
      label: "Investing Entities",
      value: 2,
      displayValue: "2",
      unit: "number"
    }
  ],
  positions: [
    {
      investmentId: "a40000000000001",
      entityName: "Acme Capital LLC",
      units: 100,
      lpCapital: 250000,
      equityPct: 5.5,
      costBasis: 250000,
      status: "Active"
    }
  ],
  commitments: [
    {
      recordId: "a50000000000001",
      entityName: "Acme Capital LLC",
      committedAmount: 300000,
      status: "Funded",
      commitDate: "2025-04-01",
      funded: true
    }
  ],
  distributions: [
    {
      recordId: "a60000000000001",
      entityName: "Acme Capital LLC",
      equityPct: 5.5,
      amount: 15000,
      method: "ACH",
      achStatus: "Completed"
    }
  ],
  documents: [
    {
      recordId: "a30000000000001",
      fileName: "2025 K-1.pdf",
      category: "K-1",
      offeringName: "Maple Grove",
      entityName: "Acme Capital LLC",
      uploaded: "2026-03-15",
      portalVisible: true
    }
  ]
};

function createComponent(recordId = RECORD_ID) {
  const element = createElement("c-ir-investor-detail", { is: IrInvestorDetail });
  element.recordId = recordId;
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-ir-investor-detail", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("fetches detail with the host recordId", async () => {
    getInvestorDetail.mockResolvedValue(DETAIL);
    createComponent();
    await flush();
    expect(getInvestorDetail).toHaveBeenCalledTimes(1);
    expect(getInvestorDetail).toHaveBeenCalledWith({ investorId: RECORD_ID });
  });

  it("renders one kpiCard per summary metric", async () => {
    getInvestorDetail.mockResolvedValue(DETAIL);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelectorAll("c-kpi-card").length).toBe(4);
  });

  it("renders the tier pill and KYC status badge in the header", async () => {
    getInvestorDetail.mockResolvedValue(DETAIL);
    const element = createComponent();
    await flush();
    const pill = element.shadowRoot.querySelector("c-tier-pill");
    const badge = element.shadowRoot.querySelector("c-status-badge");
    expect(pill.tier).toBe("Anchor");
    expect(badge.status).toBe("Verified");
  });

  it("renders four related-section tables with rows", async () => {
    getInvestorDetail.mockResolvedValue(DETAIL);
    const element = createComponent();
    await flush();
    const tables = element.shadowRoot.querySelectorAll("c-data-table-card");
    expect(tables.length).toBe(4); // positions, commitments, distributions, documents
    // positions table id derived from investmentId
    expect(tables[0].rows[0].id).toBe("a40000000000001");
    expect(tables[3].rows[0].id).toBe("a30000000000001");
  });

  it("shows a not-found state when the controller returns null", async () => {
    getInvestorDetail.mockResolvedValue(null);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="status"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-kpi-card")).toBeNull();
  });

  it("shows an error alert when the call rejects", async () => {
    getInvestorDetail.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
  });

  it("does not fetch when no recordId is supplied", async () => {
    getInvestorDetail.mockResolvedValue(DETAIL);
    const element = createElement("c-ir-investor-detail", { is: IrInvestorDetail });
    document.body.appendChild(element);
    await flush();
    expect(getInvestorDetail).not.toHaveBeenCalled();
  });

  it("is accessible with data loaded", async () => {
    getInvestorDetail.mockResolvedValue(DETAIL);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
