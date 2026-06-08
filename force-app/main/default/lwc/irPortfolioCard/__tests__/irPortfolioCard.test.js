import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrPortfolioCard from "c/irPortfolioCard";

beforeAll(() => {
  registerSa11yMatcher();
});

const CARD = {
  offeringId: "a01000000000001",
  offeringName: "Maple Grove Fund I",
  propertyName: "Maple Grove Apartments",
  propertyType: "Multifamily",
  occupancyPct: 94.5,
  capRate: 5.8,
  cashOnCash: 7.2,
  irrToDate: 12,
  targetIrr: 18,
  lpCapital: 6000000,
  investorCount: 12,
  distributed: 1250000,
  targetIrrProgressPct: 66.7
};

function createComponent(props = {}) {
  const element = createElement("c-ir-portfolio-card", { is: IrPortfolioCard });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-ir-portfolio-card", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders the property name as the card title", () => {
    const element = createComponent({ card: CARD });
    const sectionCard = element.shadowRoot.querySelector("c-section-card");
    expect(sectionCard).not.toBeNull();
    expect(sectionCard.title).toBe("Maple Grove Apartments");
  });

  it("renders the three performance metric tiles with formatted percents", () => {
    const element = createComponent({ card: CARD });
    const values = element.shadowRoot.querySelectorAll(".ir-portfolio-card__metric-value");
    expect(values.length).toBe(3);
    expect(values[0].textContent.trim()).toBe("94.5%");
    expect(values[1].textContent.trim()).toBe("5.8%");
    expect(values[2].textContent.trim()).toBe("7.2%");
  });

  it("passes the IRR progress percent to the progress bar", () => {
    const element = createComponent({ card: CARD });
    const bar = element.shadowRoot.querySelector("c-progress-bar");
    expect(bar).not.toBeNull();
    expect(bar.percent).toBe(66.7);
    expect(bar.variant).toBe("teal");
  });

  it("renders the LP roll-up footer figures with formatted currency / number", () => {
    const element = createComponent({ card: CARD });
    const values = element.shadowRoot.querySelectorAll(".ir-portfolio-card__footer-value");
    expect(values.length).toBe(3);
    expect(values[0].textContent.trim()).toBe("$6,000,000");
    expect(values[1].textContent.trim()).toBe("12");
    expect(values[2].textContent.trim()).toBe("$1,250,000");
  });

  it("falls back to the offering name when there is no property name", () => {
    const element = createComponent({
      card: { offeringName: "Fund Only", targetIrrProgressPct: 0 }
    });
    const sectionCard = element.shadowRoot.querySelector("c-section-card");
    expect(sectionCard.title).toBe("Fund Only");
  });

  it("clamps the IRR progress to 0 when not provided", () => {
    const element = createComponent({ card: { propertyName: "X" } });
    const bar = element.shadowRoot.querySelector("c-progress-bar");
    expect(bar.percent).toBe(0);
  });

  it("is accessible with data", async () => {
    const element = createComponent({ card: CARD });
    await expect(element).toBeAccessible();
  });
});
