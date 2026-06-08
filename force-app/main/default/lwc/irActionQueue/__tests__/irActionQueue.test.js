import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrActionQueue from "c/irActionQueue";

beforeAll(() => {
  registerSa11yMatcher();
});

const ITEMS = [
  {
    recordId: "a02000000000001",
    category: "Signature",
    label: "Smith Family Trust",
    sublabel: "Subscription document awaiting signature",
    status: "Pending",
    objectApiName: "Subscription_Doc__c"
  },
  {
    recordId: "a03000000000002",
    category: "Waitlist",
    label: "Jones Holdings LLC",
    sublabel: "Waitlisted at position 3",
    amount: 250000,
    status: "Waitlisted",
    objectApiName: "Waitlist__c"
  }
];

function createComponent(props = {}) {
  const element = createElement("c-ir-action-queue", { is: IrActionQueue });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-ir-action-queue", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders one row per action item", () => {
    const element = createComponent({ items: ITEMS });
    return Promise.resolve().then(() => {
      const rows = element.shadowRoot.querySelectorAll(".ir-action-queue__item");
      expect(rows.length).toBe(2);
    });
  });

  it("renders a status badge child for each item", () => {
    const element = createComponent({ items: ITEMS });
    return Promise.resolve().then(() => {
      const badges = element.shadowRoot.querySelectorAll("c-status-badge");
      expect(badges.length).toBe(2);
      expect(badges[0].status).toBe("Pending");
      expect(badges[1].status).toBe("Waitlisted");
    });
  });

  it("renders the formatted amount only when present", () => {
    const element = createComponent({ items: ITEMS });
    return Promise.resolve().then(() => {
      const amounts = element.shadowRoot.querySelectorAll(".ir-action-queue__amount");
      expect(amounts.length).toBe(1);
      expect(amounts[0].textContent).toContain("$250,000");
    });
  });

  it("emits itemselect with the record id and object api name on click", () => {
    const element = createComponent({ items: ITEMS });
    const handler = jest.fn();
    element.addEventListener("itemselect", handler);

    return Promise.resolve().then(() => {
      const button = element.shadowRoot.querySelector(".ir-action-queue__button");
      button.click();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail).toEqual({
        recordId: "a02000000000001",
        objectApiName: "Subscription_Doc__c"
      });
    });
  });

  it("renders an empty state when there are no items", () => {
    const element = createComponent({ items: [] });
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.querySelector(".ir-action-queue__item")).toBeNull();
      expect(element.shadowRoot.textContent).toContain("all caught up");
    });
  });

  it("guards against a non-array items value", () => {
    const element = createComponent({ items: undefined });
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.querySelector(".ir-action-queue__item")).toBeNull();
    });
  });

  it("is accessible", async () => {
    const element = createComponent({ items: ITEMS });
    await Promise.resolve();
    await expect(element).toBeAccessible();
  });
});
