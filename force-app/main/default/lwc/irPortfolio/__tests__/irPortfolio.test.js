import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrPortfolio from "c/irPortfolio";
import getPortfolio from "@salesforce/apex/PortfolioController.getPortfolio";

jest.mock("@salesforce/apex/PortfolioController.getPortfolio", () => ({ default: jest.fn() }), {
  virtual: true
});

beforeAll(() => {
  registerSa11yMatcher();
});

const PORTFOLIO = {
  kpis: [
    {
      key: "activeInvestments",
      label: "Active Investments",
      value: 15,
      displayValue: "15",
      unit: "number"
    },
    {
      key: "lpCapitalDeployed",
      label: "LP Capital Deployed",
      value: 8600000,
      displayValue: "$8.6M",
      unit: "currency"
    },
    {
      key: "totalLpInvestors",
      label: "Total LP Investors",
      value: 8,
      displayValue: "8",
      unit: "number"
    },
    {
      key: "distributedToDate",
      label: "Distributed To Date",
      value: 1250000,
      displayValue: "$1.3M",
      unit: "currency"
    },
    { key: "avgIrr", label: "Avg IRR", value: 12.4, displayValue: "12.4%", unit: "percent" },
    { key: "nearestExit", label: "Nearest Exit", value: 0, displayValue: "Q3 2028", unit: "text" }
  ],
  cards: [
    {
      offeringId: "a01000000000001",
      offeringName: "Maple Grove Fund I",
      propertyName: "Maple Grove Apartments",
      propertyType: "Multifamily",
      occupancyPct: 94.5,
      capRate: 5.8,
      cashOnCash: 7.2,
      irrToDate: 12,
      targetIrr: 18,
      lpCapital: 6000000,
      investorCount: 12,
      distributed: 1250000,
      targetIrrProgressPct: 66.7
    },
    {
      offeringId: "a01000000000002",
      offeringName: "Riverside Fund II",
      propertyName: "Riverside Plaza",
      propertyType: "Retail",
      occupancyPct: 88,
      capRate: 6.1,
      cashOnCash: 6.5,
      irrToDate: 9,
      targetIrr: 15,
      lpCapital: 2600000,
      investorCount: 5,
      distributed: 0,
      targetIrrProgressPct: 60
    }
  ]
};

function createComponent() {
  const element = createElement("c-ir-portfolio", { is: IrPortfolio });
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-ir-portfolio", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getPortfolio once on connect", async () => {
    getPortfolio.mockResolvedValue(PORTFOLIO);
    createComponent();
    await flush();
    expect(getPortfolio).toHaveBeenCalledTimes(1);
  });

  it("renders one kpiCard per KPI returned", async () => {
    getPortfolio.mockResolvedValue(PORTFOLIO);
    const element = createComponent();
    await flush();
    const cards = element.shadowRoot.querySelectorAll("c-kpi-card");
    expect(cards.length).toBe(6);
  });

  it("passes the pre-formatted displayValue and rotating accent to kpiCard", async () => {
    getPortfolio.mockResolvedValue(PORTFOLIO);
    const element = createComponent();
    await flush();
    const cards = element.shadowRoot.querySelectorAll("c-kpi-card");
    expect(cards[0].value).toBe("15");
    expect(cards[0].accent).toBe("navy");
    expect(cards[1].accent).toBe("blue");
    expect(cards[2].accent).toBe("teal");
  });

  it("renders one irPortfolioCard per card and passes the DTO down", async () => {
    getPortfolio.mockResolvedValue(PORTFOLIO);
    const element = createComponent();
    await flush();
    const portfolioCards = element.shadowRoot.querySelectorAll("c-ir-portfolio-card");
    expect(portfolioCards.length).toBe(2);
    expect(portfolioCards[0].card.propertyName).toBe("Maple Grove Apartments");
    expect(portfolioCards[1].card.propertyName).toBe("Riverside Plaza");
  });

  it("hides the spinner after data resolves", async () => {
    getPortfolio.mockResolvedValue(PORTFOLIO);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector("lightning-spinner")).toBeNull();
    expect(element.shadowRoot.querySelector("c-kpi-card")).not.toBeNull();
  });

  it("renders an empty state when there are no cards", async () => {
    getPortfolio.mockResolvedValue({ kpis: PORTFOLIO.kpis, cards: [] });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector("c-ir-portfolio-card")).toBeNull();
    expect(element.shadowRoot.querySelector('[role="status"]')).not.toBeNull();
  });

  it("shows an error alert and no content when the call rejects", async () => {
    getPortfolio.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-kpi-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getPortfolio.mockResolvedValue(PORTFOLIO);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
