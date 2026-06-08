import { LightningElement, api } from "lwc";

/**
 * offeringWorkspace
 *
 * Record-page HOST for the Offering Workspace (Phase B mockup screens 4 & 5).
 * Renders the `c/offeringHeader` feature component above an 8-tab
 * `lightning-tabset`. Each tab hosts a single-responsibility feature component
 * that fetches its OWN data slice lazily (on first activation).
 *
 * DATA PATTERN: this host does NOT call Apex. It only receives `recordId` from
 * the Lightning record page and forwards it to every child. Each tab feature
 * component is the data-fetching parent for its own presentational children,
 * satisfying "parent fetches, children display" per tab. Tabs are rendered
 * lazily via `lwc:if` keyed off the active tab so a tab's Apex call only fires
 * the first time it is opened (and never again, once mounted).
 */
export default class OfferingWorkspace extends LightningElement {
  /** Offering__c record id supplied by the Lightning record page. */
  @api recordId;

  /** API name of the first tab; the workspace opens on Property Overview. */
  activeTab = "propertyOverview";

  // A tab's feature component is only created once it has been activated, then
  // kept alive so its cacheable Apex result is reused. These flags flip true on
  // first activation and never flip back.
  _mounted = {
    propertyOverview: true, // default-open tab loads immediately
    roster: false,
    contributions: false,
    distributions: false,
    commitments: false,
    wireMatching: false,
    signatures: false,
    waitlist: false
  };

  handleTabActive(event) {
    const tab = event.target.value;
    this.activeTab = tab;
    if (Object.prototype.hasOwnProperty.call(this._mounted, tab) && !this._mounted[tab]) {
      // Spread into a new object so the template re-evaluates the lwc:if getters.
      this._mounted = { ...this._mounted, [tab]: true };
    }
  }

  get showPropertyOverview() {
    return this._mounted.propertyOverview;
  }
  get showRoster() {
    return this._mounted.roster;
  }
  get showContributions() {
    return this._mounted.contributions;
  }
  get showDistributions() {
    return this._mounted.distributions;
  }
  get showCommitments() {
    return this._mounted.commitments;
  }
  get showWireMatching() {
    return this._mounted.wireMatching;
  }
  get showSignatures() {
    return this._mounted.signatures;
  }
  get showWaitlist() {
    return this._mounted.waitlist;
  }
}
