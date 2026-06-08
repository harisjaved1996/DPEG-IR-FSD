import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import DataTableCard from "c/dataTableCard";

beforeAll(() => {
  registerSa11yMatcher();
});

const COLUMNS = [
  { label: "Investor", fieldName: "entityName" },
  { label: "Amount", fieldName: "amount", type: "currency" },
  {
    type: "action",
    typeAttributes: { rowActions: [{ label: "View", name: "view" }] }
  }
];

const ROWS = [
  { id: "a01000000000001", entityName: "Acme Capital LLC", amount: 250000 },
  { id: "a01000000000002", entityName: "Beta Holdings LP", amount: 100000 }
];

function createComponent(props = {}) {
  const element = createElement("c-data-table-card", { is: DataTableCard });
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });
  document.body.appendChild(element);
  return element;
}

describe("c-data-table-card", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders a datatable with the supplied rows and columns", () => {
    const element = createComponent({
      title: "Roster",
      columns: COLUMNS,
      rows: ROWS,
      keyField: "id"
    });
    const table = element.shadowRoot.querySelector("lightning-datatable");
    expect(table).not.toBeNull();
    expect(table.data.length).toBe(2);
    expect(table.columns.length).toBe(3);
    expect(table.keyField).toBe("id");
  });

  it("hides the checkbox column by default", () => {
    const element = createComponent({
      title: "Roster",
      columns: COLUMNS,
      rows: ROWS
    });
    const table = element.shadowRoot.querySelector("lightning-datatable");
    expect(table.hideCheckboxColumn).toBe(true);
  });

  it("shows the checkbox column when showCheckboxColumn is true", () => {
    const element = createComponent({
      title: "Roster",
      columns: COLUMNS,
      rows: ROWS,
      showCheckboxColumn: true
    });
    const table = element.shadowRoot.querySelector("lightning-datatable");
    expect(table.hideCheckboxColumn).toBe(false);
  });

  it("wraps the table in a section card with the title and row count", () => {
    const element = createComponent({
      title: "Roster",
      columns: COLUMNS,
      rows: ROWS,
      iconName: "utility:people"
    });
    const card = element.shadowRoot.querySelector("c-section-card");
    expect(card).not.toBeNull();
    expect(card.title).toBe("Roster");
    const count = element.shadowRoot.querySelector(".ir-data-table-card__count");
    expect(count.textContent.trim()).toBe("2");
  });

  it("renders an empty state when there are no rows", () => {
    const element = createComponent({
      title: "Roster",
      columns: COLUMNS,
      rows: []
    });
    expect(element.shadowRoot.querySelector("lightning-datatable")).toBeNull();
    expect(element.shadowRoot.querySelector(".ir-data-table-card__empty")).not.toBeNull();
  });

  it("re-emits rowaction from the datatable", () => {
    const element = createComponent({
      title: "Roster",
      columns: COLUMNS,
      rows: ROWS
    });
    const handler = jest.fn();
    element.addEventListener("rowaction", handler);

    const table = element.shadowRoot.querySelector("lightning-datatable");
    table.dispatchEvent(
      new CustomEvent("rowaction", {
        detail: { action: { name: "view" }, row: ROWS[0] }
      })
    );

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({
      action: { name: "view" },
      row: ROWS[0]
    });
  });

  it("re-emits rowselect from the datatable", () => {
    const element = createComponent({
      title: "Roster",
      columns: COLUMNS,
      rows: ROWS,
      showCheckboxColumn: true
    });
    const handler = jest.fn();
    element.addEventListener("rowselect", handler);

    const table = element.shadowRoot.querySelector("lightning-datatable");
    table.dispatchEvent(
      new CustomEvent("rowselection", {
        detail: { selectedRows: [ROWS[0]] }
      })
    );

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({
      selectedRows: [ROWS[0]]
    });
  });

  it("is accessible with rows", async () => {
    const element = createComponent({
      title: "Roster",
      columns: COLUMNS,
      rows: ROWS
    });
    await expect(element).toBeAccessible();
  });

  it("is accessible in the empty state", async () => {
    const element = createComponent({
      title: "Roster",
      columns: COLUMNS,
      rows: []
    });
    await expect(element).toBeAccessible();
  });
});
