import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import OfferingWaitlist from "c/offeringWaitlist";
import getWaitlist from "@salesforce/apex/OfferingWorkspaceController.getWaitlist";

jest.mock(
  "@salesforce/apex/OfferingWorkspaceController.getWaitlist",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

beforeAll(() => {
  registerSa11yMatcher();
});

const RECORD_ID = "a01000000000001AAA";

const WAITLIST_DATA = [
  {
    recordId: "a12000000000001AAA",
    position: 1,
    entityName: "Delta Ventures LLC",
    amount: 100000,
    added: "2025-05-01",
    autoPromote: true,
    status: "Waitlisted"
  },
  {
    recordId: "a12000000000002AAA",
    position: 2,
    entityName: "Epsilon Group LP",
    amount: 75000,
    added: "2025-05-03",
    autoPromote: false,
    status: "Waitlisted"
  }
];

function createComponent() {
  const element = createElement("c-offering-waitlist", { is: OfferingWaitlist });
  element.recordId = RECORD_ID;
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-offering-waitlist", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getWaitlist once with the offering id", async () => {
    getWaitlist.mockResolvedValue(WAITLIST_DATA);
    createComponent();
    await flush();
    expect(getWaitlist).toHaveBeenCalledTimes(1);
    expect(getWaitlist.mock.calls[0][0]).toEqual({ offeringId: RECORD_ID });
  });

  it("renders a dataTableCard with the position-ordered rows", async () => {
    getWaitlist.mockResolvedValue(WAITLIST_DATA);
    const element = createComponent();
    await flush();
    const card = element.shadowRoot.querySelector("c-data-table-card");
    expect(card).not.toBeNull();
    expect(card.rows.length).toBe(2);
    expect(card.rows[0].position).toBe(1);
    expect(card.rows[0].id).toBe("a12000000000001AAA");
  });

  it("passes an empty row set to the card when the waitlist is empty", async () => {
    getWaitlist.mockResolvedValue([]);
    const element = createComponent();
    await flush();
    const card = element.shadowRoot.querySelector("c-data-table-card");
    expect(card.rows.length).toBe(0);
  });

  it("shows an error alert when the call rejects", async () => {
    getWaitlist.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-data-table-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getWaitlist.mockResolvedValue(WAITLIST_DATA);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
