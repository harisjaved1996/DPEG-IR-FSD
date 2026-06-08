import { LightningElement, api } from "lwc";
import { formatCurrency, formatPercent, formatNumber, clampPercent } from "c/irFormatters";

/**
 * irPortfolioCard
 *
 * Focused presentational child that renders ONE investment/property card for the
 * Portfolio (Active Investments) screen. Shows the property metrics (occupancy,
 * cap rate, cash-on-cash, IRR-to-date), an IRR-vs-target `c/progressBar`, and the
 * LP roll-up figures (LP capital, investor count, distributed-to-date). Wrapped in
 * the shared `c/sectionCard` shell.
 *
 * PRESENTATIONAL / PURE: a single `card` prop in, no Apex/wire/LDS. No events.
 *
 * Expected `card` shape (IRDTO.PortfolioCardDTO):
 *   { offeringId, offeringName, propertyName, propertyType, occupancyPct, capRate,
 *     cashOnCash, irrToDate, targetIrr, lpCapital, investorCount, distributed,
 *     targetIrrProgressPct }
 */
export default class IrPortfolioCard extends LightningElement {
  _card = {};

  /** A single PortfolioCardDTO. */
  @api
  get card() {
    return this._card;
  }
  set card(value) {
    this._card = value && typeof value === "object" ? value : {};
  }

  get title() {
    return this._card.propertyName || this._card.offeringName || "Investment";
  }

  get offeringName() {
    return this._card.offeringName;
  }

  get propertyType() {
    return this._card.propertyType;
  }

  get hasSubtitle() {
    return Boolean(this._card.offeringName || this._card.propertyType);
  }

  /** IRR progress toward the target IRR goal (0-100), clamped. */
  get irrProgressPercent() {
    const pct = this._card.targetIrrProgressPct;
    return pct === undefined || pct === null ? 0 : clampPercent(pct);
  }

  get irrToDateText() {
    return formatPercent(this._card.irrToDate);
  }

  get targetIrrText() {
    return formatPercent(this._card.targetIrr);
  }

  /** Top performance metric tiles (occupancy / cap rate / cash-on-cash). */
  get metrics() {
    return [
      { key: "occupancy", label: "Occupancy", value: formatPercent(this._card.occupancyPct) },
      { key: "capRate", label: "Cap Rate", value: formatPercent(this._card.capRate) },
      { key: "cashOnCash", label: "Cash-on-Cash", value: formatPercent(this._card.cashOnCash) }
    ];
  }

  /** LP roll-up footer figures (LP capital / investors / distributed). */
  get footerStats() {
    return [
      { key: "lpCapital", label: "LP Capital", value: formatCurrency(this._card.lpCapital) },
      {
        key: "investorCount",
        label: "LP Investors",
        value: formatNumber(this._card.investorCount)
      },
      { key: "distributed", label: "Distributed", value: formatCurrency(this._card.distributed) }
    ];
  }
}
