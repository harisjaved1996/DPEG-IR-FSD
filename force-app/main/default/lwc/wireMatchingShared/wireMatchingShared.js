import { gql } from "lightning/uiGraphQLApi";

/**
 * wireMatchingShared
 *
 * Shared seed data, columns and row-building helpers for the four wire
 * matching category components (offeringWireTotalMatched, offeringWireAutoMatched,
 * offeringWireManualReview, offeringWireMismatch).
 *
 * DATA PATTERN: none — all data is seeded in-memory below. No Apex, no server
 * calls. Categories are derived from the confidence score:
 *   Auto Matched   — confidence >= 90
 *   Manual Review  — 60 <= confidence < 90
 *   Mismatch       — confidence < 60
 *   Total Matched  — Auto Matched + Manual Review
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
export const COLUMNS = [
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

// Resolves one real Wire Id so every row can link to a record page.
export const WIRE_ID_QUERY = gql`
  query wire {
    uiapi {
      query {
        Unison__Wire__c(first: 1) {
          edges {
            node {
              Id
            }
          }
        }
      }
    }
  }
`;

// All seed records with their assigned wire number and shared record link.
export function getRecords(wireUrl) {
  return SEED.map((r, index) => ({
    ...r,
    wireNumber: `WR-${String(WIRE_NUMBER_START + index).padStart(4, "0")}`,
    wireUrl
  }));
}

export function autoMatched(records) {
  return records.filter((r) => r.confidence >= 90);
}

export function manualReview(records) {
  return records.filter((r) => r.confidence >= 60 && r.confidence < 90);
}

export function mismatch(records) {
  return records.filter((r) => r.confidence < 60);
}

export function totalMatched(records) {
  return [...autoMatched(records), ...manualReview(records)];
}

// >= 90 -> high (green) | 60-89 -> medium (amber) | < 60 -> low (red)
function tier(confidence) {
  if (confidence >= 90) {
    return { name: "high", label: "High" };
  }
  if (confidence >= 60) {
    return { name: "medium", label: "Medium" };
  }
  return { name: "low", label: "Low" };
}

// Datatable view-model rows for a category's records.
export function toRows(records) {
  return records.map((r) => {
    const t = tier(r.confidence);
    return {
      id: r.id,
      wireNumber: r.wireNumber,
      wireUrl: r.wireUrl,
      sender: r.sender,
      amount: CURRENCY.format(r.amount),
      memo: r.memo,
      confidenceLabel: `${r.confidence} · ${t.label}`,
      confidenceStyle: PILL_TIERS[t.name]
    };
  });
}
