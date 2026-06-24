import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";

/**
 * offeringWireMatching
 *
 * Self-contained "Wire Matching" view with four sub-tabs:
 *   1. Total Matched  — Auto Matched + Manual Review (all reconciled / in-pipeline)
 *   2. Auto Matched   — high-confidence automatic matches (confidence >= 90)
 *   3. Manual Review  — medium confidence, needs a human (60 <= confidence < 90)
 *   4. Mismatch       — low-confidence / failed matches (confidence < 60)
 *
 * DATA PATTERN: none — all data is seeded in-memory below. No Apex, no @wire,
 * no server calls. Records are deep-cloned per instance via the `_records` getter.
 */

// Seed records: { id, sender, amount (Number), memo, confidence (Number) }.
const SEED = [
  // Auto Matched (>= 90)
  {
    id: "wm-1",
    sender: "John A. Carter",
    amount: 250000,
    memo: "Capital contribution – Fund III",
    confidence: 98
  },
  {
    id: "wm-2",
    sender: "Meridian Holdings LLC",
    amount: 500000,
    memo: "Wire ref #88213 commitment",
    confidence: 96
  },
  {
    id: "wm-3",
    sender: "Sarah Whitman",
    amount: 125000,
    memo: "PPM funding – Project Aspen",
    confidence: 94
  },
  {
    id: "wm-4",
    sender: "Blue Oak Capital",
    amount: 1000000,
    memo: "Subscription – Aspen LP",
    confidence: 92
  },
  { id: "wm-5", sender: "David Nguyen", amount: 75000, memo: "Contribution Q2", confidence: 91 },
  // Manual Review (60–89)
  {
    id: "wm-6",
    sender: "R. Patel",
    amount: 300000,
    memo: "Wire – partial name match",
    confidence: 78
  },
  {
    id: "wm-7",
    sender: "Greenfield Trust",
    amount: 200000,
    memo: "Memo unclear, funding?",
    confidence: 71
  },
  { id: "wm-8", sender: "M. Gonzalez", amount: 150000, memo: "ref 5521", confidence: 66 },
  {
    id: "wm-9",
    sender: "Anonymous Sender",
    amount: 90000,
    memo: "No investor reference",
    confidence: 62
  },
  // Mismatch (< 60)
  {
    id: "wm-10",
    sender: "Unknown Originator",
    amount: 45000,
    memo: "No matching commitment",
    confidence: 41
  },
  {
    id: "wm-11",
    sender: "Cayman SPV 12",
    amount: 610000,
    memo: "Amount exceeds commitment",
    confidence: 35
  },
  { id: "wm-12", sender: "J. Doe", amount: 10000, memo: "Duplicate wire?", confidence: 22 }
];

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

// Each Wire Number links to its Wire record page. In real data every row would
// carry its own record URL; the demo rows share one sample Wire record.
const WIRE_RECORD_URL = "/lightning/r/Unison__Wire__c/a0IFW0003rNQMzk2AH/view";

// Wire numbers run WR-0088 onward, assigned by record position.
const WIRE_NUMBER_START = 88;

// Shared pill aesthetic — same base used by commitmentsOfferingCom (Prospects).
const PILL_BASE =
  "display:inline-flex;align-items:center;padding:0.125rem 0.5rem;border-radius:0.25rem;font-size:0.75rem;font-weight:600;";

// Tiered confidence pill styles. high (>=90) green, medium (60-89) amber, low (<60) red.
const PILL_TIERS = {
  high: PILL_BASE + "background:#d7f4d3;color:#2e844a;",
  medium: PILL_BASE + "background:#fcefd9;color:#a96a00;",
  low: PILL_BASE + "background:#fde2e0;color:#ba0517;"
};

// Columns rendered by the shared c-offering-datatable. The `pill` type and the
// per-row `pillStyle` type-attribute mirror the Prospects table exactly.
const COLUMNS = [
  {
    label: "Wire Number",
    fieldName: "wireUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "wireNumber" }, target: "_self" },
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Sender",
    fieldName: "sender",
    type: "text",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Amount",
    fieldName: "amount",
    type: "text",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Memo",
    fieldName: "memo",
    type: "text",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Confidence Score",
    fieldName: "confidenceLabel",
    type: "pill",
    typeAttributes: { pillStyle: { fieldName: "confidenceStyle" } },
    cellAttributes: { alignment: "left" }
  }
];

// Tab definitions in display order; accent drives the per-tab summary + chip color.
const TABS = [
  { key: "total", label: "Total Matched", icon: "utility:summary", accent: "#0176d3" },
  { key: "auto", label: "Auto Matched", icon: "utility:success", accent: "#2e7d32" },
  { key: "manual", label: "Manual Review", icon: "utility:clock", accent: "#bf5d0a" },
  { key: "mismatch", label: "Mismatch", icon: "utility:warning", accent: "#ba0517" }
];

export default class OfferingWireMatching extends NavigationMixin(LightningElement) {
  // FlexiPage provides recordId; unused here — the component is fully self-contained.
  @api recordId;

  // Static datatable column definitions.
  columns = COLUMNS;

  // Active sub-tab; defaults to "Total Matched".
  activeTab = "total";

  // --- Derived source lists (deep-cloned per instance) -----------------------
  get _records() {
    return SEED.map((r, index) => ({
      ...r,
      wireNumber: `WR-${String(WIRE_NUMBER_START + index).padStart(4, "0")}`,
      wireUrl: WIRE_RECORD_URL
    }));
  }

  get _autoMatched() {
    return this._records.filter((r) => r.confidence >= 90);
  }

  get _manualReview() {
    return this._records.filter((r) => r.confidence >= 60 && r.confidence < 90);
  }

  get _mismatch() {
    return this._records.filter((r) => r.confidence < 60);
  }

  get _totalMatched() {
    return [...this._autoMatched, ...this._manualReview];
  }

  // --- Active-tab resolution -------------------------------------------------
  get _activeRecords() {
    switch (this.activeTab) {
      case "auto":
        return this._autoMatched;
      case "manual":
        return this._manualReview;
      case "mismatch":
        return this._mismatch;
      case "total":
      default:
        return this._totalMatched;
    }
  }

  get _activeMeta() {
    return TABS.find((t) => t.key === this.activeTab) || TABS[0];
  }

  // --- Tab chips (label + count badge) ---------------------------------------
  get tabs() {
    const counts = {
      total: this._totalMatched.length,
      auto: this._autoMatched.length,
      manual: this._manualReview.length,
      mismatch: this._mismatch.length
    };
    return TABS.map((t) => {
      const isActive = t.key === this.activeTab;
      return {
        key: t.key,
        label: t.label,
        count: counts[t.key],
        isActive,
        chipClass: isActive ? "wm-tab wm-tab--active" : "wm-tab",
        accentStyle: `--wm-accent: ${t.accent};`
      };
    });
  }

  // --- Rows for the active tab (datatable view model) ------------------------
  get rows() {
    return this._activeRecords.map((r) => {
      const tier = this._tier(r.confidence);
      return {
        id: r.id,
        wireNumber: r.wireNumber,
        wireUrl: r.wireUrl,
        sender: r.sender,
        amount: CURRENCY.format(r.amount),
        memo: r.memo,
        confidenceLabel: `${r.confidence} · ${tier.label}`,
        confidenceStyle: PILL_TIERS[tier.name]
      };
    });
  }

  // --- Per-tab summary header ------------------------------------------------
  get summaryIcon() {
    return this._activeMeta.icon;
  }

  get summaryTitle() {
    return this._activeMeta.label;
  }

  get summaryCount() {
    return this._activeRecords.length;
  }

  get summaryCountLabel() {
    const n = this.summaryCount;
    return `${n} ${n === 1 ? "wire" : "wires"}`;
  }

  get summaryTotalLabel() {
    const total = this._activeRecords.reduce((sum, r) => sum + r.amount, 0);
    return CURRENCY.format(total);
  }

  get summaryStyle() {
    return `--wm-accent: ${this._activeMeta.accent};`;
  }

  get hasRows() {
    return this._activeRecords.length > 0;
  }

  // --- Confidence tier helper ------------------------------------------------
  // >= 90 -> high (green) | 60-89 -> medium (amber) | < 60 -> low (red)
  _tier(confidence) {
    if (confidence >= 90) {
      return { name: "high", label: "High" };
    }
    if (confidence >= 60) {
      return { name: "medium", label: "Medium" };
    }
    return { name: "low", label: "Low" };
  }

  // --- Interaction -----------------------------------------------------------
  handleTabSelect(event) {
    const key = event.currentTarget.dataset.key;
    if (key && key !== this.activeTab) {
      this.activeTab = key;
    }
  }

  // Keyboard support for the custom chip-tab row (Enter / Space activate).
  handleTabKey(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handleTabSelect(event);
    }
  }

  // Navigate to the Wire object list page, showing the "All" list view.
  handleViewAll(event) {
    event.preventDefault();
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Wire__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All"
      }
    });
  }
}
