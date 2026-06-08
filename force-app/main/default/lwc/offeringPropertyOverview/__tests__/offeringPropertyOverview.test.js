import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import OfferingPropertyOverview from "c/offeringPropertyOverview";
import getPropertyOverview from "@salesforce/apex/OfferingWorkspaceController.getPropertyOverview";

jest.mock(
  "@salesforce/apex/OfferingWorkspaceController.getPropertyOverview",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

beforeAll(() => {
  registerSa11yMatcher();
});

const RECORD_ID = "a01000000000001AAA";

const OVERVIEW_DATA = {
  propertyId: "a05000000000001AAA",
  name: "Maple Grove Apartments",
  propertyType: "Multifamily",
  address: "123 Grove St",
  county: "Harris",
  submarket: "Northwest",
  rentableSqFt: 240000,
  units: 312,
  yearBuilt: 2005,
  yearRenovated: 2021,
  occupancyPct: 94.5,
  annualNoi: 4800000,
  capRate: 5.25,
  cashOnCash: 8.1,
  irrToDate: 12.4,
  targetIrr: 15,
  projectedExit: "Q3 2028",
  lpCapital: 18500000,
  dpegStake: 10,
  lender: "Acme Bank",
  debtStructure: "Senior fixed 5yr"
};

function createComponent() {
  const element = createElement("c-offering-property-overview", { is: OfferingPropertyOverview });
  element.recordId = RECORD_ID;
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-offering-property-overview", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getPropertyOverview once with the offering id", async () => {
    getPropertyOverview.mockResolvedValue(OVERVIEW_DATA);
    createComponent();
    await flush();
    expect(getPropertyOverview).toHaveBeenCalledTimes(1);
    expect(getPropertyOverview.mock.calls[0][0]).toEqual({ offeringId: RECORD_ID });
  });

  it("renders two section cards (detail + financial snapshot)", async () => {
    getPropertyOverview.mockResolvedValue(OVERVIEW_DATA);
    const element = createComponent();
    await flush();
    const cards = element.shadowRoot.querySelectorAll("c-section-card");
    expect(cards.length).toBe(2);
  });

  it("renders the property detail rows", async () => {
    getPropertyOverview.mockResolvedValue(OVERVIEW_DATA);
    const element = createComponent();
    await flush();
    const rows = element.shadowRoot.querySelectorAll(".ir-property-overview__row");
    // 8 detail fields + 10 financial fields
    expect(rows.length).toBe(18);
  });

  it("renders an empty state when no property is linked", async () => {
    getPropertyOverview.mockResolvedValue(null);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector("c-section-card")).toBeNull();
    expect(element.shadowRoot.textContent).toContain("No property is linked");
  });

  it("shows an error alert when the call rejects", async () => {
    getPropertyOverview.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-section-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getPropertyOverview.mockResolvedValue(OVERVIEW_DATA);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
