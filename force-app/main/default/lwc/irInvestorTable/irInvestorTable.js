import { LightningElement, api } from "lwc";
import { formatCurrency, formatNumber, formatDate } from "c/irFormatters";

/**
 * irInvestorTable
 *
 * Focused presentational child that renders the investor list. A
 * `lightning-datatable` cannot host the custom `c/tierPill` and `c/statusBadge`
 * in cells, so this component lays out one clickable row per investor (Name,
 * Tier pill, Lifetime Invested, Total Commitments, Entities, KYC status badge,
 * Last Activity, IR Rep) inside the shared `c/sectionCard`.
 *
 * PRESENTATIONAL / PURE: `investors` array in, `investorselect` event out. No
 * Apex/wire/LDS. The parent page supplies already-fetched rows and owns the
 * navigation that follows the emitted event.
 *
 * Expected `investors` shape (IRDTO.InvestorRowDTO):
 *   { recordId, investorName, tier, lifetimeInvested, totalCommitments,
 *     entitiesCount, kycStatus, lastActivity, irRep }
 *
 * @fires irInvestorTable#investorselect Detail: { recordId } when a row is activated.
 */
export default class IrInvestorTable extends LightningElement {
  _investors = [];

  /** Card title (overridable). */
  @api title = "Investors";

  /** Array of investor row DTOs. */
  @api
  get investors() {
    return this._investors;
  }
  set investors(value) {
    this._investors = Array.isArray(value) ? value : [];
  }

  /** Per-row view-model: stable key + formatted values for display. */
  get rows() {
    return this._investors.map((investor, index) => ({
      key: investor.recordId || `investor-${index}`,
      recordId: investor.recordId,
      investorName: investor.investorName || "—",
      tier: investor.tier,
      kycStatus: investor.kycStatus,
      lifetimeInvestedText: formatCurrency(investor.lifetimeInvested),
      totalCommitmentsText: formatNumber(investor.totalCommitments),
      entitiesCountText: formatNumber(investor.entitiesCount),
      lastActivityText: formatDate(investor.lastActivity),
      irRep: investor.irRep || "—"
    }));
  }

  get hasInvestors() {
    return this._investors.length > 0;
  }

  get rowCount() {
    return this._investors.length;
  }

  handleSelect(event) {
    const recordId = event.currentTarget.dataset.id;
    if (!recordId) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("investorselect", {
        detail: { recordId }
      })
    );
  }
}
