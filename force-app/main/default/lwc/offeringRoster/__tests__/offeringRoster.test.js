import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import OfferingRoster from "c/offeringRoster";
import getRoster from "@salesforce/apex/OfferingWorkspaceController.getRoster";

jest.mock(
  "@salesforce/apex/OfferingWorkspaceController.getRoster",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

beforeAll(() => {
  registerSa11yMatcher();
});

const RECORD_ID = "a01000000000001AAA";

const ROSTER_DATA = [
  {
    investmentId: "a06000000000001AAA",
    entityName: "Acme Capital LLC",
    units: 100,
    lpCapital: 250000,
    equityPct: 12.5,
    costBasis: 250000,
    status: "Active"
  },
  {
    investmentId: "a06000000000002AAA",
    entityName: "Beta Holdings LP",
    units: 50,
    lpCapital: 125000,
    equityPct: 6.25,
    costBasis: 125000,
    status: "Active"
  }
];

function createComponent() {
  const element = createElement("c-offering-roster", { is: OfferingRoster });
  element.recordId = RECORD_ID;
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-offering-roster", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getRoster once with the offering id", async () => {
    getRoster.mockResolvedValue(ROSTER_DATA);
    createComponent();
    await flush();
    expect(getRoster).toHaveBeenCalledTimes(1);
    expect(getRoster.mock.calls[0][0]).toEqual({ offeringId: RECORD_ID });
  });

  it("renders a dataTableCard with the mapped rows", async () => {
    getRoster.mockResolvedValue(ROSTER_DATA);
    const element = createComponent();
    await flush();
    const card = element.shadowRoot.querySelector("c-data-table-card");
    expect(card).not.toBeNull();
    expect(card.rows.length).toBe(2);
    expect(card.keyField).toBe("id");
    expect(card.rows[0].id).toBe("a06000000000001AAA");
  });

  it("scales equityPct to a fraction for the datatable percent column", async () => {
    getRoster.mockResolvedValue(ROSTER_DATA);
    const element = createComponent();
    await flush();
    const card = element.shadowRoot.querySelector("c-data-table-card");
    expect(card.rows[0].equityPct).toBeCloseTo(0.125);
  });

  it("passes an empty row set to the card when there are no investments", async () => {
    getRoster.mockResolvedValue([]);
    const element = createComponent();
    await flush();
    const card = element.shadowRoot.querySelector("c-data-table-card");
    expect(card.rows.length).toBe(0);
  });

  it("shows an error alert when the call rejects", async () => {
    getRoster.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-data-table-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getRoster.mockResolvedValue(ROSTER_DATA);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
