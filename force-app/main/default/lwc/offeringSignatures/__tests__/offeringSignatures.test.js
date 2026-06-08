import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import OfferingSignatures from "c/offeringSignatures";
import getSignatures from "@salesforce/apex/OfferingWorkspaceController.getSignatures";

jest.mock(
  "@salesforce/apex/OfferingWorkspaceController.getSignatures",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

beforeAll(() => {
  registerSa11yMatcher();
});

const RECORD_ID = "a01000000000001AAA";

const SIGNATURE_DATA = [
  {
    recordId: "a11000000000001AAA",
    entityName: "Acme Capital LLC",
    primaryStatus: "Signed",
    secondaryStatus: "Signed",
    finalized: true,
    fundingInstructions: "Verified",
    singleSigner: false
  },
  {
    recordId: "a11000000000002AAA",
    entityName: "Beta Holdings LP",
    primaryStatus: "Pending",
    secondaryStatus: "Not Started",
    finalized: false,
    fundingInstructions: "Pending",
    singleSigner: true
  }
];

function createComponent() {
  const element = createElement("c-offering-signatures", { is: OfferingSignatures });
  element.recordId = RECORD_ID;
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-offering-signatures", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getSignatures once with the offering id", async () => {
    getSignatures.mockResolvedValue(SIGNATURE_DATA);
    createComponent();
    await flush();
    expect(getSignatures).toHaveBeenCalledTimes(1);
    expect(getSignatures.mock.calls[0][0]).toEqual({ offeringId: RECORD_ID });
  });

  it("renders a dataTableCard with the mapped rows", async () => {
    getSignatures.mockResolvedValue(SIGNATURE_DATA);
    const element = createComponent();
    await flush();
    const card = element.shadowRoot.querySelector("c-data-table-card");
    expect(card).not.toBeNull();
    expect(card.rows.length).toBe(2);
    expect(card.rows[0].id).toBe("a11000000000001AAA");
  });

  it("passes an empty row set to the card when there are no documents", async () => {
    getSignatures.mockResolvedValue([]);
    const element = createComponent();
    await flush();
    const card = element.shadowRoot.querySelector("c-data-table-card");
    expect(card.rows.length).toBe(0);
  });

  it("shows an error alert when the call rejects", async () => {
    getSignatures.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-data-table-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getSignatures.mockResolvedValue(SIGNATURE_DATA);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
