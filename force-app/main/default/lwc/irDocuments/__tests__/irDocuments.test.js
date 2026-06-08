import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import IrDocuments from "c/irDocuments";
import getDocuments from "@salesforce/apex/DocumentController.getDocuments";

jest.mock("@salesforce/apex/DocumentController.getDocuments", () => ({ default: jest.fn() }), {
  virtual: true
});

beforeAll(() => {
  registerSa11yMatcher();
});

const DOCUMENTS = {
  kpis: [
    {
      key: "totalDocuments",
      label: "Total Documents",
      value: 12,
      displayValue: "12",
      unit: "number"
    },
    { key: "portalVisible", label: "Portal Visible", value: 8, displayValue: "8", unit: "number" },
    { key: "categories", label: "Categories", value: 3, displayValue: "3", unit: "number" }
  ],
  categories: [
    { category: "K-1", count: 4 },
    { category: "Report", count: 6 },
    { category: "Statement", count: 2 }
  ],
  docs: [
    {
      recordId: "a30000000000001",
      fileName: "2025 K-1 - Acme.pdf",
      category: "K-1",
      offeringName: "Maple Grove",
      entityName: "Acme Capital LLC",
      uploaded: "2026-03-15",
      portalVisible: true
    },
    {
      recordId: "a30000000000002",
      fileName: "Q1 Report.pdf",
      category: "Report",
      offeringName: "Oak Ridge",
      entityName: "Beta Holdings LP",
      uploaded: "2026-04-01",
      portalVisible: false
    }
  ]
};

const FILTERED = {
  ...DOCUMENTS,
  docs: [DOCUMENTS.docs[0]]
};

function createComponent() {
  const element = createElement("c-ir-documents", { is: IrDocuments });
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-ir-documents", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("calls getDocuments with a null category on initial load", async () => {
    getDocuments.mockResolvedValue(DOCUMENTS);
    createComponent();
    await flush();
    expect(getDocuments).toHaveBeenCalledTimes(1);
    expect(getDocuments).toHaveBeenCalledWith({ category: null });
  });

  it("renders one kpiCard per KPI", async () => {
    getDocuments.mockResolvedValue(DOCUMENTS);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelectorAll("c-kpi-card").length).toBe(3);
  });

  it("passes the categories and selection to the category filter child", async () => {
    getDocuments.mockResolvedValue(DOCUMENTS);
    const element = createComponent();
    await flush();
    const filter = element.shadowRoot.querySelector("c-ir-category-filter");
    expect(filter).not.toBeNull();
    expect(filter.categories.length).toBe(3);
    expect(filter.selected).toBeNull();
  });

  it("passes the docs to the data table card with stable ids", async () => {
    getDocuments.mockResolvedValue(DOCUMENTS);
    const element = createComponent();
    await flush();
    const table = element.shadowRoot.querySelector("c-data-table-card");
    expect(table.rows.length).toBe(2);
    expect(table.rows[0].id).toBe("a30000000000001");
  });

  it("re-fetches getDocuments with the selected category on filter change", async () => {
    getDocuments.mockResolvedValue(DOCUMENTS);
    const element = createComponent();
    await flush();

    getDocuments.mockResolvedValue(FILTERED);
    const filter = element.shadowRoot.querySelector("c-ir-category-filter");
    filter.dispatchEvent(new CustomEvent("categorychange", { detail: { category: "K-1" } }));
    await flush();

    expect(getDocuments).toHaveBeenCalledTimes(2);
    expect(getDocuments).toHaveBeenLastCalledWith({ category: "K-1" });
    expect(filter.selected).toBe("K-1");
    const table = element.shadowRoot.querySelector("c-data-table-card");
    expect(table.rows.length).toBe(1);
  });

  it("shows an error alert when the call rejects", async () => {
    getDocuments.mockRejectedValue({ body: { message: "boom" } });
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
  });

  it("is accessible with data loaded", async () => {
    getDocuments.mockResolvedValue(DOCUMENTS);
    const element = createComponent();
    await flush();
    await expect(element).toBeAccessible();
  });
});
