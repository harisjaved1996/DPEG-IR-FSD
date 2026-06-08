import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrInvestorTable from "c/irInvestorTable";

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

function createComponent(props = {}) {
  const element = createElement("c-ir-investor-table", { is: IrInvestorTable });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-ir-investor-table", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders one row per investor", () => {
    const element = createComponent({ investors: INVESTORS });
    return Promise.resolve().then(() => {
      const rows = element.shadowRoot.querySelectorAll(".ir-investor-table__row");
      expect(rows.length).toBe(2);
    });
  });

  it("renders a tier pill and KYC status badge per row", () => {
    const element = createComponent({ investors: INVESTORS });
    return Promise.resolve().then(() => {
      const pills = element.shadowRoot.querySelectorAll("c-tier-pill");
      const badges = element.shadowRoot.querySelectorAll("c-status-badge");
      expect(pills.length).toBe(2);
      expect(badges.length).toBe(2);
      expect(pills[0].tier).toBe("Anchor");
      expect(badges[1].status).toBe("Pending");
    });
  });

  it("formats the lifetime invested as currency", () => {
    const element = createComponent({ investors: INVESTORS });
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.textContent).toContain("$2,500,000");
    });
  });

  it("emits investorselect with the record id on name click", () => {
    const element = createComponent({ investors: INVESTORS });
    const handler = jest.fn();
    element.addEventListener("investorselect", handler);
    return Promise.resolve().then(() => {
      const name = element.shadowRoot.querySelector(".ir-investor-table__name");
      name.click();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail).toEqual({ recordId: "a20000000000001" });
    });
  });

  it("renders an empty state when there are no investors", () => {
    const element = createComponent({ investors: [] });
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.querySelector(".ir-investor-table__row")).toBeNull();
      expect(element.shadowRoot.textContent).toContain("No investors");
    });
  });

  it("guards against a non-array investors value", () => {
    const element = createComponent({ investors: undefined });
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.querySelector(".ir-investor-table__row")).toBeNull();
    });
  });

  it("is accessible", async () => {
    const element = createComponent({ investors: INVESTORS });
    await Promise.resolve();
    await expect(element).toBeAccessible();
  });
});
