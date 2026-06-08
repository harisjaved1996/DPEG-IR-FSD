import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrOnboarding from "c/irOnboarding";
import getOnboarding from "@salesforce/apex/OnboardingController.getOnboarding";

jest.mock("@salesforce/apex/OnboardingController.getOnboarding", () => ({ default: jest.fn() }), {
  virtual: true
});

beforeAll(() => {
  registerSa11yMatcher();
});

const ONBOARDING = {
  kpis: [
    { key: "openQueue", label: "Open Queue", value: 6, displayValue: "6", unit: "number" },
    { key: "invited", label: "Invited", value: 2, displayValue: "2", unit: "number" },
    { key: "kyc_Pending", label: "KYC: Pending", value: 3, displayValue: "3", unit: "number" },
    { key: "kyc_Verified", label: "KYC: Verified", value: 3, displayValue: "3", unit: "number" }
  ],
  leads: [
    {
      recordId: "00Q000000000001",
      name: "Jordan Pierce",
      channel: "Referral",
      kycStatus: "Pending",
      portalStatus: "Invited",
      created: "2026-05-20T10:00:00.000Z"
    }
  ]
};

function createComponent() {
  const element = createElement("c-ir-onboarding", { is: IrOnboarding });
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-ir-onboarding", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getOnboarding once on connect", async () => {
    getOnboarding.mockResolvedValue(ONBOARDING);
    createComponent();
    await flush();
    expect(getOnboarding).toHaveBeenCalledTimes(1);
  });

  it("renders one kpiCard per KPI returned (dynamic count)", async () => {
    getOnboarding.mockResolvedValue(ONBOARDING);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelectorAll("c-kpi-card").length).toBe(4);
  });

  it("passes the pre-formatted displayValue and rotating accent to kpiCard", async () => {
    getOnboarding.mockResolvedValue(ONBOARDING);
    const element = createComponent();
    await flush();
    const cards = element.shadowRoot.querySelectorAll("c-kpi-card");
    expect(cards[0].value).toBe("6");
    expect(cards[0].accent).toBe("navy");
    expect(cards[1].accent).toBe("blue");
    expect(cards[2].accent).toBe("teal");
  });

  it("passes the leads down to the lead queue child", async () => {
    getOnboarding.mockResolvedValue(ONBOARDING);
    const element = createComponent();
    await flush();
    const queue = element.shadowRoot.querySelector("c-ir-lead-queue");
    expect(queue).not.toBeNull();
    expect(queue.leads.length).toBe(1);
    expect(queue.leads[0].name).toBe("Jordan Pierce");
  });

  it("hides the spinner after data resolves", async () => {
    getOnboarding.mockResolvedValue(ONBOARDING);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector("lightning-spinner")).toBeNull();
    expect(element.shadowRoot.querySelector("c-ir-lead-queue")).not.toBeNull();
  });

  it("shows an error alert when the call rejects", async () => {
    getOnboarding.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-kpi-card")).toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getOnboarding.mockResolvedValue(ONBOARDING);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
