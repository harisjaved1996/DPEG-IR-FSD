import { LightningElement, api } from "lwc";
import { formatDateTime } from "c/irFormatters";

/**
 * irLeadQueue
 *
 * Focused presentational child that renders the onboarding Lead queue for the IR
 * Onboarding screen. A `lightning-datatable` cannot host the custom
 * `c/statusBadge` in a cell, so this component lays out one row per lead (Name,
 * Channel, KYC Status badge, Portal Invite Status badge, Created Date) inside the
 * shared `c/sectionCard`.
 *
 * PRESENTATIONAL / PURE: `leads` array in, no Apex/wire/LDS. No events.
 *
 * Expected `leads` shape (IRDTO.LeadRowDTO):
 *   { recordId, name, channel, kycStatus, portalStatus, created }
 */
export default class IrLeadQueue extends LightningElement {
  _leads = [];

  /** Card title (overridable). */
  @api title = "Lead Queue";

  /** Array of lead row DTOs. */
  @api
  get leads() {
    return this._leads;
  }
  set leads(value) {
    this._leads = Array.isArray(value) ? value : [];
  }

  /** Per-row view-model: formatted created date + badge inputs. */
  get rows() {
    return this._leads.map((lead, index) => ({
      key: lead.recordId || `lead-${index}`,
      name: lead.name || "—",
      channel: lead.channel || "—",
      kycStatus: lead.kycStatus,
      portalStatus: lead.portalStatus,
      createdText: formatDateTime(lead.created)
    }));
  }

  get hasLeads() {
    return this._leads.length > 0;
  }

  get rowCount() {
    return this._leads.length;
  }
}
