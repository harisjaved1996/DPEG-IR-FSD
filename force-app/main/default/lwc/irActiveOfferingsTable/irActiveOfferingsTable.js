import { LightningElement, api } from "lwc";
import { clampPercent } from "c/irFormatters";

/**
 * irActiveOfferingsTable
 *
 * Focused presentational child that renders the IR Console "Active Offerings"
 * table. Receives an already-fetched offerings array from its parent page
 * component and shapes it into `lightning-datatable` column defs + rows, wrapped
 * in the shared `c/dataTableCard`. Raised progress is shown via the datatable's
 * native percent column (0-1 scale) and a formatted text fallback; status is a
 * dedicated column. Re-emits the table's row action upward as `offeringselect`.
 *
 * PRESENTATIONAL / PURE: props in, `offeringselect` out. No Apex/wire/LDS.
 *
 * Expected `offerings` shape (IRDTO.OfferingProgressDTO):
 *   { offeringId, name, offeringDisplayId, status, amountRaised, targetRaise,
 *     raisedPct, committedInvestorCount, closingDate }
 */
export default class IrActiveOfferingsTable extends LightningElement {
  _offerings = [];

  /** Card title (overridable). */
  @api title = "Active Offerings";

  /** Array of offering progress DTOs. */
  @api
  get offerings() {
    return this._offerings;
  }
  set offerings(value) {
    this._offerings = Array.isArray(value) ? value : [];
  }

  columns = [
    { label: "Offering", fieldName: "name", type: "text", wrapText: true },
    { label: "Offering ID", fieldName: "displayId", type: "text" },
    { label: "Status", fieldName: "status", type: "text" },
    {
      label: "Raised",
      fieldName: "amountRaised",
      type: "currency",
      cellAttributes: { alignment: "right" },
      typeAttributes: { currencyCode: "USD", maximumFractionDigits: 0 }
    },
    {
      label: "Target",
      fieldName: "targetRaise",
      type: "currency",
      cellAttributes: { alignment: "right" },
      typeAttributes: { currencyCode: "USD", maximumFractionDigits: 0 }
    },
    {
      label: "Raised %",
      fieldName: "raisedFraction",
      type: "percent",
      cellAttributes: { alignment: "right" },
      typeAttributes: { minimumFractionDigits: 0, maximumFractionDigits: 1 }
    },
    {
      label: "Committed Investors",
      fieldName: "committedInvestorCount",
      type: "number",
      cellAttributes: { alignment: "right" }
    }
  ];

  /** Datatable rows: keyed by offering id, raised% normalized to 0-1 fraction. */
  get rows() {
    return this._offerings.map((offering, index) => {
      const raised = Number(offering.amountRaised) || 0;
      const target = Number(offering.targetRaise) || 0;
      const pct =
        offering.raisedPct !== undefined && offering.raisedPct !== null
          ? clampPercent(offering.raisedPct)
          : target > 0
            ? clampPercent((raised / target) * 100)
            : 0;
      return {
        id: offering.offeringId || `offering-${index}`,
        name: offering.name,
        displayId: offering.offeringDisplayId,
        status: offering.status,
        amountRaised: raised,
        targetRaise: target,
        // lightning-datatable percent type expects a 0-1 fraction.
        raisedFraction: pct / 100,
        committedInvestorCount: offering.committedInvestorCount
      };
    });
  }

  get hasOfferings() {
    return this._offerings.length > 0;
  }

  /** Bubble the wrapped datatable row action up as a typed offering event. */
  handleRowAction(event) {
    const row = event.detail && event.detail.row;
    this.dispatchEvent(
      new CustomEvent("offeringselect", {
        detail: { offeringId: row ? row.id : null }
      })
    );
  }
}
