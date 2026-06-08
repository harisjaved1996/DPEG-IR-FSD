---
name: dpeg-ir-conflicts-resolved
description: Recurring ambiguities in DPEG IR requirements and the recommended resolutions surfaced to the user (Phase A design). Re-raise if user hasn't confirmed.
metadata:
  type: project
---

Ambiguities that recur when designing DPEG IR from the mockups + task prompts. Recommendations were given in `agent-output/design-requirements.md` §3.0; treat as PROPOSED until the user confirms.

**Why:** the literal mockup, the task prompt text, and the binding factory occasionally disagree; resolving the same way each time keeps phases consistent.

**How to apply:**
- **`CONT-` prefix:** mockup IR5.6 labels `CONT-001…007` as `Contribution__c`. Prompt text once called it "Commitment CONT-001" — that's the conflict. Resolution: `Contribution__c` Name = `CONT-{000}`; `Commitment__c` = `CMT-{0000}`.
- **`Distribution__c.ACH_Status__c`:** binding literals Pending/Posted/Failed/Returned; mockup shows "Processed"/"Cheque mailed". Resolution: keep the 4 binding literals and ADD `Processed`, `Cheque Mailed`.
- **Auto-number seed IDs** (`O-119`, `INV-1000`, `DIST-2400`, `DB-024`, `WR-0088`, `ST-010`, `SD-1000`, `D-0441`): cannot be guaranteed via `sf data import tree` (system-assigned, consumed by tests). Set `startingNumber` to approximate; tell the user exact IDs are illustrative.
- **Investor portfolio summaries** (Lifetime_Invested, Total_Commitments, Active_Positions, Investing_Entities_Count): no MD path → not native RUS. Resolution: plain Number/Currency, seeded in Phase A; automate Phase C.
- **Investing_Entity_Contact__c** = two Master-Detail junction (Account primary + Contact secondary).
- **Offering record types by asset class:** recommend NONE; asset class is a picklist on `Property__c`.

See also [[dpeg-ir-testdatafactory-contract]].
