import { gql } from "lightning/uiGraphQLApi";

/**
 * wireMatchingShared
 *
 * Shared seed data, columns and row-building helpers for the four wire
 * matching category components (offeringWireTotalMatched, offeringWireAutoMatched,
 * offeringWireManualReview, offeringWireMismatch).
 *
 * DATA PATTERN: none — all data is seeded in-memory below. No Apex, no server
 * calls. Each record carries an explicit category; confidence ranges per category:
 *   Auto Matched   — 99
 *   Manual Review  — 75–80
 *   Mismatch       — 60–65
 *   Total Matched  — Auto Matched + Manual Review (79–99)
 */

// Seed records: { id, sender, amount (Number), memo, confidence (Number), category }.
const SEED = [
  // Auto Matched (99)
  {
    id: "wm-1",
    sender: "John A. Carter",
    amount: 250000,
    memo: "Capital contribution – Fund III",
    confidence: 99,
    category: "auto"
  },
  {
    id: "wm-2",
    sender: "Meridian Holdings LLC",
    amount: 500000,
    memo: "Wire ref #88213 commitment",
    confidence: 99,
    category: "auto"
  },
  {
    id: "wm-3",
    sender: "Sarah Whitman",
    amount: 125000,
    memo: "PPM funding – Project Aspen",
    confidence: 99,
    category: "auto"
  },
  {
    id: "wm-4",
    sender: "Blue Oak Capital",
    amount: 1000000,
    memo: "Subscription – Aspen LP",
    confidence: 99,
    category: "auto"
  },
  {
    id: "wm-5",
    sender: "David Nguyen",
    amount: 75000,
    memo: "Contribution Q2",
    confidence: 99,
    category: "auto"
  },
  // Manual Review (79–80 so Total Matched stays within 79–99)
  {
    id: "wm-6",
    sender: "R. Patel",
    amount: 300000,
    memo: "Wire – partial name match",
    confidence: 79,
    category: "manual"
  },
  {
    id: "wm-7",
    sender: "Greenfield Trust",
    amount: 200000,
    memo: "Memo unclear, funding?",
    confidence: 80,
    category: "manual"
  },
  {
    id: "wm-8",
    sender: "M. Gonzalez",
    amount: 150000,
    memo: "ref 5521",
    confidence: 79,
    category: "manual"
  },
  {
    id: "wm-9",
    sender: "Anonymous Sender",
    amount: 90000,
    memo: "No investor reference",
    confidence: 80,
    category: "manual"
  },
  // Mismatch (60–65)
  {
    id: "wm-10",
    sender: "Unknown Originator",
    amount: 45000,
    memo: "No matching commitment",
    confidence: 62,
    category: "mismatch"
  },
  {
    id: "wm-11",
    sender: "Cayman SPV 12",
    amount: 610000,
    memo: "Amount exceeds commitment",
    confidence: 64,
    category: "mismatch"
  },
  {
    id: "wm-12",
    sender: "J. Doe",
    amount: 10000,
    memo: "Duplicate wire?",
    confidence: 61,
    category: "mismatch"
  }
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

// Per-category confidence pill styles. auto green, manual amber, mismatch red.
const CATEGORY_PILLS = {
  auto: PILL_BASE + "background:#d7f4d3;color:#2e844a;",
  manual: PILL_BASE + "background:#fcefd9;color:#a96a00;",
  mismatch: PILL_BASE + "background:#fde2e0;color:#ba0517;"
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

// Resolves a Wire whose Match Confidence = 79 — used by the Manual Review table so
// its rows link to a wire record with that matching confidence score.
export const WIRE_ID_MATCH_79_QUERY = gql`
  query wireMatch79 {
    uiapi {
      query {
        Unison__Wire__c(where: { Unison__Match_Confidence__c: { eq: 79 } }, first: 1) {
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

// Resolves the Wire whose Name (wire number) = 'WR-0027' — used by the Mismatch table so
// every row's Wire Number links to that specific wire record.
export const WIRE_ID_WR0027_QUERY = gql`
  query wireWr0027 {
    uiapi {
      query {
        Unison__Wire__c(where: { Name: { eq: "WR-0027" } }, first: 1) {
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

// Resolves the Wire whose Name (wire number) = 'WR-0026' — used by the Auto Matched
// table so every row's Wire Number links to that specific wire record.
export const WIRE_ID_WR0026_QUERY = gql`
  query wireWr0026 {
    uiapi {
      query {
        Unison__Wire__c(where: { Name: { eq: "WR-0026" } }, first: 1) {
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
  return records.filter((r) => r.category === "auto");
}

export function manualReview(records) {
  return records.filter((r) => r.category === "manual");
}

export function mismatch(records) {
  return records.filter((r) => r.category === "mismatch");
}

export function totalMatched(records) {
  return [...autoMatched(records), ...manualReview(records)];
}

// Datatable view-model rows for a category's records.
export function toRows(records) {
  return records.map((r) => ({
    id: r.id,
    wireNumber: r.wireNumber,
    wireUrl: r.wireUrl,
    sender: r.sender,
    amount: CURRENCY.format(r.amount),
    memo: r.memo,
    confidenceLabel: `${r.confidence}%`,
    confidenceStyle: CATEGORY_PILLS[r.category]
  }));
}
