import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrActiveOfferingsTable from "c/irActiveOfferingsTable";

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
    status: "Closing",
    amountRaised: 4000000,
    targetRaise: 5000000,
    raisedPct: 80,
    committedInvestorCount: 9
  }
];

function createComponent(props = {}) {
  const element = createElement("c-ir-active-offerings-table", {
    is: IrActiveOfferingsTable
  });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-ir-active-offerings-table", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("passes mapped rows and columns to the shared data table card", () => {
    const element = createComponent({ offerings: OFFERINGS });
    return Promise.resolve().then(() => {
      const card = element.shadowRoot.querySelector("c-data-table-card");
      expect(card).not.toBeNull();
      expect(card.rows.length).toBe(2);
      expect(card.columns.length).toBeGreaterThan(0);
      expect(card.keyField).toBe("id");
    });
  });

  it("normalizes raisedPct to a 0-1 fraction for the percent column", () => {
    const element = createComponent({ offerings: OFFERINGS });
    return Promise.resolve().then(() => {
      const card = element.shadowRoot.querySelector("c-data-table-card");
      expect(card.rows[0].raisedFraction).toBeCloseTo(0.6);
      expect(card.rows[1].raisedFraction).toBeCloseTo(0.8);
    });
  });

  it("derives the raised fraction from amounts when raisedPct is absent", () => {
    const element = createComponent({
      offerings: [{ offeringId: "x", name: "Derived", amountRaised: 750, targetRaise: 1000 }]
    });
    return Promise.resolve().then(() => {
      const card = element.shadowRoot.querySelector("c-data-table-card");
      expect(card.rows[0].raisedFraction).toBeCloseTo(0.75);
    });
  });

  it("maps the offering id onto the datatable key field", () => {
    const element = createComponent({ offerings: OFFERINGS });
    return Promise.resolve().then(() => {
      const card = element.shadowRoot.querySelector("c-data-table-card");
      expect(card.rows[0].id).toBe("a01000000000001");
      expect(card.rows[0].status).toBe("Open");
    });
  });

  it("emits offeringselect when the wrapped row action fires", () => {
    const element = createComponent({ offerings: OFFERINGS });
    const handler = jest.fn();
    element.addEventListener("offeringselect", handler);

    return Promise.resolve().then(() => {
      const card = element.shadowRoot.querySelector("c-data-table-card");
      card.dispatchEvent(
        new CustomEvent("rowaction", {
          detail: { action: { name: "view" }, row: { id: "a01000000000002" } }
        })
      );
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail.offeringId).toBe("a01000000000002");
    });
  });

  it("passes an empty rows array down when no offerings are provided", () => {
    const element = createComponent({ offerings: [] });
    return Promise.resolve().then(() => {
      const card = element.shadowRoot.querySelector("c-data-table-card");
      expect(card.rows.length).toBe(0);
    });
  });

  it("is accessible", async () => {
    const element = createComponent({ offerings: OFFERINGS });
    await Promise.resolve();
    await expect(element).toBeAccessible();
  });
});
