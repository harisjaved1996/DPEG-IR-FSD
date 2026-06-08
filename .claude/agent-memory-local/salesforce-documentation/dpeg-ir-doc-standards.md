---
name: dpeg-ir-doc-standards
description: Naming conventions, namespace finding, phase structure, and confirmed doc patterns for the DPEG IR module documentation
metadata:
  type: project
---

## File naming

Follow `.claude/agent-memory/salesforce-documentation/dpeg-doc-standards.md`:
`DPEG_<Module>_<DocType>_v<version>.md` saved under `docs/`.

IR Phase A was saved as: `docs/DPEG_IR_PhaseA_Foundation_v1.0.md`

## Namespace finding (critical for all DPEG-IR-FSD docs)

The scratch org `DPEG-IR-FSD` is registered to the **`Unison` managed namespace**.
All custom objects/fields carry `Unison__` prefix in-org.
- Source files remain unprefixed
- Seed plan and data JSON use `Unison__` prefixed sobject names (handled by `scripts/ns_prefix_seed.js`)
- In-org Apex/LWC/Flows resolve unprefixed names automatically
- External access (CLI SOQL, REST) must use `Unison__` prefix

**Why:** Dev Hub org has the Unison namespace registered; scratch orgs inherit it.

**How to apply:** Always document this in any Phase doc that touches deployment or seed data. Flag it in any troubleshooting section.

## Phase structure

| Phase | Scope |
|---|---|
| A (done) | Data model + app shell + security + seed data |
| B | LWC components for 5 placeholder FlexiPages |
| C | Apex automation (rollups, Plaid/ASB callouts, approval processes) |
| D | Experience Cloud investor portal |

## APEX-C fields

Fields created in Phase A whose maintenance Apex is deferred to Phase C:
- `Offering__c.Amount_Raised__c`, `Offering__c.Total_Committed__c`
- `Distribution_Batch__c` totals (Total_Amount__c, ACH_Amount__c, Cheque_Amount__c, Investor_Count__c)
- `Investor__c` summaries (Lifetime_Invested__c, Total_Commitments__c, Active_Positions__c, Investing_Entities_Count__c)

## Deferred manual post-deploy steps (Metadata API limitations)

Always remind in deployment docs:
1. Record-type visibility per profile (Profiles > Record Type Settings)
2. Page-layout assignment per profile/RT (Profiles > Page Layout Assignments)
3. Account compact-layout RT mapping (Object Manager > Account > Compact Layouts)
4. FlexiPage activation and app assignment (App Builder > Activate)
