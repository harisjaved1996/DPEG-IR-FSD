import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrOfferingProgressList from "c/irOfferingProgressList";

beforeAll(() => {
  registerSa11yMatcher();
});

const OFFERINGS = [
  {
    offeringId: "a01000000000001",
    name: "Maple Grove Apartments",
    offeringDisplayId: "OFF-001",
    status: "Open",
    amountRaised: 6000000,
    targetRaise: 10000000,
    raisedPct: 60,
    committedInvestorCount: 12
  },
  {
    offeringId: "a01000000000002",
    name: "Cedar Point Plaza",
    offeringDisplayId: "OFF-002",
    status: "Open",
    amountRaised: 2500000,
    targetRaise: 5000000,
    raisedPct: 50,
    committedInvestorCount: 7
  }
];

function createComponent(props = {}) {
  const element = createElement("c-ir-offering-progress-list", {
    is: IrOfferingProgressList
  });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-ir-offering-progress-list", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders one progress bar per offering", () => {
    const element = createComponent({ offerings: OFFERINGS });
    return Promise.resolve().then(() => {
      const bars = element.shadowRoot.querySelectorAll("c-progress-bar");
      expect(bars.length).toBe(2);
    });
  });

  it("passes the computed percent and label down to each progress bar", () => {
    const element = createComponent({ offerings: OFFERINGS });
    return Promise.resolve().then(() => {
      const bars = element.shadowRoot.querySelectorAll("c-progress-bar");
      expect(bars[0].percent).toBe(60);
      expect(bars[0].label).toBe("Maple Grove Apartments");
      expect(bars[1].percent).toBe(50);
    });
  });

  it("derives percent from raised/target when raisedPct is absent", () => {
    const element = createComponent({
      offerings: [
        {
          offeringId: "x",
          name: "Derived",
          amountRaised: 250,
          targetRaise: 1000
        }
      ]
    });
    return Promise.resolve().then(() => {
      const bar = element.shadowRoot.querySelector("c-progress-bar");
      expect(bar.percent).toBe(25);
    });
  });

  it("alternates the brand variant between consecutive bars", () => {
    const element = createComponent({ offerings: OFFERINGS });
    return Promise.resolve().then(() => {
      const bars = element.shadowRoot.querySelectorAll("c-progress-bar");
      expect(bars[0].variant).toBe("blue");
      expect(bars[1].variant).toBe("teal");
    });
  });

  it("renders the raised vs target caption for each row", () => {
    const element = createComponent({ offerings: OFFERINGS });
    return Promise.resolve().then(() => {
      const raised = element.shadowRoot.querySelector(".ir-offering-progress-list__raised");
      expect(raised.textContent).toContain("$6,000,000");
    });
  });

  it("renders an empty state when no offerings are provided", () => {
    const element = createComponent({ offerings: [] });
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.querySelector("c-progress-bar")).toBeNull();
      expect(element.shadowRoot.textContent).toContain("No active offerings");
    });
  });

  it("guards against a non-array offerings value", () => {
    const element = createComponent({ offerings: null });
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.querySelector("c-progress-bar")).toBeNull();
    });
  });

  it("is accessible", async () => {
    const element = createComponent({ offerings: OFFERINGS });
    await Promise.resolve();
    await expect(element).toBeAccessible();
  });
});
