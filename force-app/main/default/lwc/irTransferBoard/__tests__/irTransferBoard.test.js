import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrTransferBoard from "c/irTransferBoard";

beforeAll(() => {
  registerSa11yMatcher();
});

const LANES = [
  {
    status: "Pending IR Approval",
    count: 2,
    items: [
      {
        recordId: "a10000000000001",
        name: "ST-001",
        fromEntity: "Acme Capital LLC",
        toEntity: "Beta Holdings LP",
        offeringName: "Maple Grove",
        units: 100,
        amount: 250000
      },
      {
        recordId: "a10000000000002",
        name: "ST-002",
        fromEntity: "Gamma Trust",
        toEntity: "Delta Fund",
        offeringName: "Oak Ridge",
        units: 50,
        amount: 125000
      }
    ]
  },
  {
    status: "Completed",
    count: 1,
    items: [
      {
        recordId: "a10000000000003",
        name: "ST-003",
        fromEntity: "Epsilon LP",
        toEntity: "Zeta LLC",
        offeringName: "Pine Valley",
        units: 25,
        amount: 60000
      }
    ]
  }
];

function createComponent(props = {}) {
  const element = createElement("c-ir-transfer-board", { is: IrTransferBoard });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-ir-transfer-board", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders one lane per status with a status badge", () => {
    const element = createComponent({ lanes: LANES });
    return Promise.resolve().then(() => {
      const lanes = element.shadowRoot.querySelectorAll(".ir-transfer-board__lane");
      expect(lanes.length).toBe(2);
      const badges = element.shadowRoot.querySelectorAll("c-status-badge");
      expect(badges.length).toBe(2);
      expect(badges[0].status).toBe("Pending IR Approval");
    });
  });

  it("renders one card per transfer in each lane", () => {
    const element = createComponent({ lanes: LANES });
    return Promise.resolve().then(() => {
      const cards = element.shadowRoot.querySelectorAll(".ir-transfer-board__card");
      expect(cards.length).toBe(3);
    });
  });

  it("emits transferselect with the record id on card click", () => {
    const element = createComponent({ lanes: LANES });
    const handler = jest.fn();
    element.addEventListener("transferselect", handler);
    return Promise.resolve().then(() => {
      const card = element.shadowRoot.querySelector(".ir-transfer-board__card");
      card.click();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail).toEqual({ recordId: "a10000000000001" });
    });
  });

  it("renders an empty state when there are no lanes", () => {
    const element = createComponent({ lanes: [] });
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.querySelector(".ir-transfer-board__lane")).toBeNull();
      expect(element.shadowRoot.textContent).toContain("No share transfers");
    });
  });

  it("guards against a non-array lanes value", () => {
    const element = createComponent({ lanes: undefined });
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.querySelector(".ir-transfer-board__lane")).toBeNull();
    });
  });

  it("is accessible", async () => {
    const element = createComponent({ lanes: LANES });
    await Promise.resolve();
    await expect(element).toBeAccessible();
  });
});
