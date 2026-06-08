import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getDocuments from "@salesforce/apex/DocumentController.getDocuments";

const DOCUMENT_COLUMNS = [
  { label: "File Name", fieldName: "fileName", type: "text", wrapText: true },
  { label: "Category", fieldName: "category", type: "text" },
  { label: "Offering", fieldName: "offeringName", type: "text", wrapText: true },
  { label: "Investing Entity", fieldName: "entityName", type: "text", wrapText: true },
  { label: "Uploaded", fieldName: "uploaded", type: "date-local" },
  {
    label: "Portal Visible",
    fieldName: "portalVisible",
    type: "boolean",
    cellAttributes: { alignment: "center" }
  }
];

/**
 * irDocuments
 *
 * Page-level feature component for the IR Documents App Page. Makes the imperative
 * Apex call (`DocumentController.getDocuments`) and distributes the resulting
 * `IRDTO.DocumentsDTO` down to focused / presentational children:
 *   - KPI row          -> iterates `c/kpiCard` (Total + Portal Visible + Categories)
 *   - Category filter   -> `c/irCategoryFilter` (emits categorychange)
 *   - Documents table   -> `c/dataTableCard`
 *
 * The initial load calls `getDocuments(null)` (all categories). When the filter
 * child emits `categorychange`, the parent RE-FETCHES `getDocuments(category)`
 * so the table reflects the selected category. KPI and category tiles are taken
 * from the unfiltered first load and preserved across filter changes (counts are
 * category-independent), so re-fetching only swaps the document rows.
 *
 * DATA PATTERN: imperative Apex (cacheable controller). Children never call Apex —
 * they only receive props and emit events. Errors surface via a toast.
 */
export default class IrDocuments extends LightningElement {
  @track kpis = [];
  @track categories = [];
  @track docs = [];

  selectedCategory = null;

  isLoading = true;
  hasError = false;
  loaded = false;

  documentColumns = DOCUMENT_COLUMNS;

  _kpiAccents = ["navy", "blue", "teal"];
  _kpiIcons = {
    totalDocuments: "utility:file",
    portalVisible: "utility:preview",
    categories: "utility:filter"
  };

  connectedCallback() {
    this.loadDocuments(null);
  }

  async loadDocuments(category) {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getDocuments({ category });
      this.applyData(data);
      this.loaded = true;
    } catch (error) {
      this.hasError = true;
      this.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  applyData(data) {
    const dto = data || {};
    this.kpis = (dto.kpis || []).map((kpi, index) => ({
      ...kpi,
      accent: this._kpiAccents[index % this._kpiAccents.length],
      iconName: this._kpiIcons[kpi.key] || "utility:metrics"
    }));
    this.categories = dto.categories || [];
    this.docs = (dto.docs || []).map((row, index) => ({
      ...row,
      id: row.recordId || `document-${index}`
    }));
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) ||
      (error && error.message) ||
      "An unexpected error occurred while loading documents.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load Documents",
        message,
        variant: "error"
      })
    );
  }

  /** Re-fetch the document list for the newly selected category. */
  handleCategoryChange(event) {
    const { category } = event.detail || {};
    this.selectedCategory = category || null;
    this.loadDocuments(this.selectedCategory);
  }

  get hasKpis() {
    return this.kpis.length > 0;
  }

  /** True before the first successful load (full-page spinner shown). */
  get hasNoContentYet() {
    return !this.loaded;
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
