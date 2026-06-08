import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import getShareTransfers from "@salesforce/apex/ShareTransferController.getShareTransfers";

const TRANSFER_COLUMNS = [
  { label: "From Entity", fieldName: "fromEntity", type: "text", wrapText: true },
  { label: "To Account", fieldName: "toEntity", type: "text", wrapText: true },
  { label: "Offering", fieldName: "offeringName", type: "text", wrapText: true },
  {
    label: "Units",
    fieldName: "units",
    type: "number",
    cellAttributes: { alignment: "right" }
  },
  {
    label: "Amount",
    fieldName: "amount",
    type: "currency",
    cellAttributes: { alignment: "right" },
    typeAttributes: { currencyCode: "USD", maximumFractionDigits: 0 }
  },
  { label: "Status", fieldName: "status", type: "text" },
  { label: "Date", fieldName: "transferDate", type: "date-local" }
];

/**
 * irShareTransfers
 *
 * Page-level feature component for the IR Share Transfers App Page. Makes a
 * SINGLE imperative Apex call (`ShareTransferController.getShareTransfers`) and
 * distributes the resulting `IRDTO.ShareTransferDTO` down to focused /
 * presentational children:
 *   - KPI row            -> iterates `c/kpiCard` (Total + per-status counts)
 *   - Lifecycle board    -> `c/irTransferBoard` (lanes grouped by status)
 *   - Transfers table    -> `c/dataTableCard`
 *
 * DATA PATTERN: imperative Apex (cacheable controller) in `connectedCallback`.
 * Children never call Apex — they only receive props. Errors surface via a toast.
 * `NavigationMixin` is used only to open a transfer record when a board card is
 * activated.
 */
export default class IrShareTransfers extends NavigationMixin(LightningElement) {
  @track kpis = [];
  @track board = [];
  @track transfers = [];

  isLoading = true;
  hasError = false;
  loaded = false;

  transferColumns = TRANSFER_COLUMNS;

  _kpiAccents = ["navy", "blue", "teal"];
  _kpiIcons = {
    totalTransfers: "utility:share",
    status_Active: "utility:flow",
    "status_Pending E-Signature": "utility:edit_form",
    "status_Pending IR Approval": "utility:approval",
    status_Completed: "utility:success"
  };

  connectedCallback() {
    this.loadShareTransfers();
  }

  async loadShareTransfers() {
    this.isLoading = true;
    this.hasError = false;
    try {
      const data = await getShareTransfers();
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
    this.board = dto.board || [];
    this.transfers = (dto.transfers || []).map((row, index) => ({
      ...row,
      id: row.recordId || `transfer-${index}`
    }));
  }

  showError(error) {
    const message =
      (error && error.body && error.body.message) ||
      (error && error.message) ||
      "An unexpected error occurred while loading share transfers.";
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Unable to load Share Transfers",
        message,
        variant: "error"
      })
    );
  }

  /** Open the transfer record when a board card is activated. */
  handleTransferSelect(event) {
    const { recordId } = event.detail || {};
    if (!recordId) {
      return;
    }
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId,
        objectApiName: "Share_Transfer__c",
        actionName: "view"
      }
    });
  }

  get hasKpis() {
    return this.kpis.length > 0;
  }

  get showContent() {
    return this.loaded && !this.hasError;
  }
}
