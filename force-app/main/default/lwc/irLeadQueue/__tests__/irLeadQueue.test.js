import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrLeadQueue from "c/irLeadQueue";

beforeAll(() => {
  registerSa11yMatcher();
});

const LEADS = [
  {
    recordId: "00Q000000000001",
    name: "Jordan Pierce",
    channel: "Referral",
    kycStatus: "Pending",
    portalStatus: "Invited",
    created: "2026-05-20T10:00:00.000Z"
  },
  {
    recordId: "00Q000000000002",
    name: "Dana Okoye",
    channel: "Web",
    kycStatus: "Verified",
    portalStatus: "Not Started",
    created: "2026-05-22T16:45:00.000Z"
  }
];

function createComponent(props = {}) {
  const element = createElement("c-ir-lead-queue", { is: IrLeadQueue });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-ir-lead-queue", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders a row per lead", () => {
    const element = createComponent({ leads: LEADS });
    expect(element.shadowRoot.querySelectorAll("tbody tr").length).toBe(2);
  });

  it("renders KYC and portal-invite badges per row", () => {
    const element = createComponent({ leads: LEADS });
    const badges = element.shadowRoot.querySelectorAll("c-status-badge");
    // Two badges per row (KYC + portal invite) across two rows.
    expect(badges.length).toBe(4);
    expect(badges[0].status).toBe("Pending");
    expect(badges[1].status).toBe("Invited");
  });

  it("shows the row count badge in the header", () => {
    const element = createComponent({ leads: LEADS });
    const count = element.shadowRoot.querySelector(".ir-lead-queue__count");
    expect(count.textContent.trim()).toBe("2");
  });

  it("renders an empty state when there are no leads", () => {
    const element = createComponent({ leads: [] });
    expect(element.shadowRoot.querySelector("tbody")).toBeNull();
    expect(element.shadowRoot.querySelector(".ir-lead-queue__empty")).not.toBeNull();
  });

  it("guards against a non-array leads value", () => {
    const element = createComponent({ leads: undefined });
    expect(element.shadowRoot.querySelector(".ir-lead-queue__empty")).not.toBeNull();
  });

  it("is accessible with rows", async () => {
    const element = createComponent({ leads: LEADS });
    await expect(element).toBeAccessible();
  });

  it("is accessible in the empty state", async () => {
    const element = createComponent({ leads: [] });
    await expect(element).toBeAccessible();
  });
});
