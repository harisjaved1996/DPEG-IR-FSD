import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import OfferingWorkspace from "c/offeringWorkspace";

beforeAll(() => {
  registerSa11yMatcher();
});

const RECORD_ID = "a01000000000001AAA";

function createComponent(props = {}) {
  const element = createElement("c-offering-workspace", { is: OfferingWorkspace });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-offering-workspace", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders the offering header and forwards recordId to it", () => {
    const element = createComponent({ recordId: RECORD_ID });
    const header = element.shadowRoot.querySelector("c-offering-header");
    expect(header).not.toBeNull();
    expect(header.recordId).toBe(RECORD_ID);
  });

  it("renders an 8-tab tabset", () => {
    const element = createComponent({ recordId: RECORD_ID });
    const tabs = element.shadowRoot.querySelectorAll("lightning-tab");
    expect(tabs.length).toBe(8);
  });

  it("mounts only the default property-overview tab child before activation", () => {
    const element = createComponent({ recordId: RECORD_ID });
    expect(element.shadowRoot.querySelector("c-offering-property-overview")).not.toBeNull();
    // Other tab children are not mounted yet (lazy).
    expect(element.shadowRoot.querySelector("c-offering-roster")).toBeNull();
    expect(element.shadowRoot.querySelector("c-offering-waitlist")).toBeNull();
  });

  it("passes recordId to the default-open tab child", () => {
    const element = createComponent({ recordId: RECORD_ID });
    const overview = element.shadowRoot.querySelector("c-offering-property-overview");
    expect(overview.recordId).toBe(RECORD_ID);
  });

  it("lazily mounts a tab child and forwards recordId when its tab activates", async () => {
    const element = createComponent({ recordId: RECORD_ID });
    expect(element.shadowRoot.querySelector("c-offering-roster")).toBeNull();

    const rosterTab = [...element.shadowRoot.querySelectorAll("lightning-tab")].find(
      (t) => t.value === "roster"
    );
    rosterTab.dispatchEvent(new CustomEvent("active"));
    await flush();

    const roster = element.shadowRoot.querySelector("c-offering-roster");
    expect(roster).not.toBeNull();
    expect(roster.recordId).toBe(RECORD_ID);
  });

  it("keeps a tab child mounted after switching away (cached)", async () => {
    const element = createComponent({ recordId: RECORD_ID });
    const tabs = [...element.shadowRoot.querySelectorAll("lightning-tab")];
    const rosterTab = tabs.find((t) => t.value === "roster");
    const waitlistTab = tabs.find((t) => t.value === "waitlist");

    rosterTab.dispatchEvent(new CustomEvent("active"));
    await flush();
    waitlistTab.dispatchEvent(new CustomEvent("active"));
    await flush();

    // Both remain mounted once activated.
    expect(element.shadowRoot.querySelector("c-offering-roster")).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-offering-waitlist")).not.toBeNull();
  });

  it("is accessible", async () => {
    const element = createComponent({ recordId: RECORD_ID });
    await flush();
    await expect(element).toBeAccessible();
  });
});
