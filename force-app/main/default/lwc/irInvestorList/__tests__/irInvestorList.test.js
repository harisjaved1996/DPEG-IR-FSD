import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrInvestorList from "c/irInvestorList";
import getInvestors from "@salesforce/apex/InvestorListController.getInvestors";

jest.mock("@salesforce/apex/InvestorListController.getInvestors", () => ({ default: jest.fn() }), {
  virtual: true
});

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

const INVESTORS = [
  {
    recordId: "a20000000000001",
    investorName: "Smith Family Trust",
    tier: "Anchor",
    lifetimeInvested: 2500000,
    totalCommitments: 3,
    entitiesCount: 2,
    kycStatus: "Verified",
    lastActivity: "2026-04-10",
    irRep: "Jordan Lee"
  },
  {
    recordId: "a20000000000002",
    investorName: "Jones Holdings LLC",
    tier: "Active",
    lifetimeInvested: 750000,
    totalCommitments: 1,
    entitiesCount: 1,
    kycStatus: "Pending",
    lastActivity: "2026-03-01",
    irRep: "Casey Kim"
  }
];

const ANCHOR_ONLY = [INVESTORS[0]];

function createComponent() {
  const element = createElement("c-ir-investor-list", { is: IrInvestorList });
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-ir-investor-list", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getInvestors with a null tier on initial load", async () => {
    getInvestors.mockResolvedValue(INVESTORS);
    createComponent();
    await flush();
    expect(getInvestors).toHaveBeenCalledTimes(1);
    expect(getInvestors).toHaveBeenCalledWith({ tier: null });
  });

  it("passes the investors to the investor table child", async () => {
    getInvestors.mockResolvedValue(INVESTORS);
    const element = createComponent();
    await flush();
    const table = element.shadowRoot.querySelector("c-ir-investor-table");
    expect(table).not.toBeNull();
    expect(table.investors.length).toBe(2);
  });

  it("renders the tier filter child", async () => {
    getInvestors.mockResolvedValue(INVESTORS);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector("c-ir-tier-filter")).not.toBeNull();
  });

  it("re-fetches getInvestors with the selected tier on filter change", async () => {
    getInvestors.mockResolvedValue(INVESTORS);
    const element = createComponent();
    await flush();

    getInvestors.mockResolvedValue(ANCHOR_ONLY);
    const filter = element.shadowRoot.querySelector("c-ir-tier-filter");
    filter.dispatchEvent(new CustomEvent("tierchange", { detail: { tier: "Anchor" } }));
    await flush();

    expect(getInvestors).toHaveBeenCalledTimes(2);
    expect(getInvestors).toHaveBeenLastCalledWith({ tier: "Anchor" });
    expect(filter.selected).toBe("Anchor");
    const table = element.shadowRoot.querySelector("c-ir-investor-table");
    expect(table.investors.length).toBe(1);
  });

  it("navigates to the Investor record when a row is selected", async () => {
    getInvestors.mockResolvedValue(INVESTORS);
    const element = createComponent();
    await flush();
    const table = element.shadowRoot.querySelector("c-ir-investor-table");
    table.dispatchEvent(
      new CustomEvent("investorselect", { detail: { recordId: "a20000000000001" } })
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate.mock.calls[0][0]).toEqual({
      type: "standard__recordPage",
      attributes: {
        recordId: "a20000000000001",
        objectApiName: "Investor__c",
        actionName: "view"
      }
    });
  });

  it("shows an error alert when the call rejects", async () => {
    getInvestors.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getInvestors.mockResolvedValue(INVESTORS);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
