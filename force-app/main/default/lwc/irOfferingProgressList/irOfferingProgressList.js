import { LightningElement, api } from "lwc";
import { formatCurrency, clampPercent } from "c/irFormatters";

/**
 * irOfferingProgressList
 *
 * Focused presentational child that renders one `c/progressBar` row per active
 * offering (raised vs target). Used inside the "Active Offerings" section on the
 * IR Dashboard. Receives an already-fetched array of offering progress DTOs from
 * its parent page component and shapes them into bar rows.
 *
 * PRESENTATIONAL / PURE: props in, no Apex/wire/LDS. No events emitted.
 *
 * Expected `offerings` shape (IRDTO.OfferingProgressDTO):
 *   { offeringId, name, offeringDisplayId, status, amountRaised, targetRaise,
 *     raisedPct, committedInvestorCount, closingDate }
 */
export default class IrOfferingProgressList extends LightningElement {
  _offerings = [];

  /** Array of offering progress DTOs (widest/most-raised first). */
  @api
  get offerings() {
    return this._offerings;
  }
  set offerings(value) {
    this._offerings = Array.isArray(value) ? value : [];
  }

  get hasOfferings() {
    return this._offerings.length > 0;
  }

  /** Per-row view-model: progress-bar inputs + formatted raised/target caption. */
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
        key: offering.offeringId || `offering-${index}`,
        name: offering.name,
        displayId: offering.offeringDisplayId,
        status: offering.status,
        percent: pct,
        // Alternate brand variants so consecutive bars are visually distinct.
        variant: index % 2 === 0 ? "blue" : "teal",
        raisedText: formatCurrency(raised),
        targetText: formatCurrency(target),
        investorText:
          offering.committedInvestorCount !== undefined && offering.committedInvestorCount !== null
            ? `${offering.committedInvestorCount} committed`
            : ""
      };
    });
  }
}
