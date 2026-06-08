---
name: seed-data
description: Phase A seed data plan — 19 JSON tree files + ir-seed-plan.json under scripts/data/ir/; key wiring decisions, picklist substitutions, and exclusions
metadata:
  type: project
---

## Location
All files: `scripts/data/ir/` (in .forceignore, data-only path)
Plan file: `ir-seed-plan.json`

## Load Order (dependency order)
1. Property__c (no deps)
2. Account (no deps; RecordTypeId omitted; Entity_Type__c always set for Investing Entity due to VR)
3. Contact (refs Account via AccountId)
4. Investor__c (refs Contact)
5. Investing_Entity_Contact__c (refs Account + Contact — both MD parents required)
6. Offering__c (refs Property__c)
7. Property_Asset__c (refs Property__c)
8. Commitment__c (refs Account + Offering__c via Lookups)
9. Investment__c (refs Account + Offering__c via Lookups)
10. Wire__c (refs Offering__c + Account optional)
11. Contribution__c (refs Investment__c MD + Wire__c optional)
12. Subscription_Doc__c (refs Offering__c + Account + Commitment__c)
13. Waitlist__c (refs Offering__c + Account)
14. Distribution_Batch__c (refs Offering__c)
15. Distribution__c (refs Investment__c MD + Distribution_Batch__c optional Lookup)
16. Share_Transfer__c (refs Investment__c + Account Lookups)
17. Transfer_Document__c (refs Share_Transfer__c)
18. IR_Document__c (refs Offering__c + Account — both optional)
19. Lead (no Salesforce object deps)

## Key Decisions / Substitutions
- **Account RecordTypeId omitted**: avoids hard-fail on record-type visibility in scratch org. Account_Type__c and Entity_Type__c set explicitly.
- **Entity_Type__c always set**: VR `Investing_Entity_Requires_Entity_Type` fires on any Investing Entity without it.
- **ACH_Status picklist**: §10 values `Posted`, `Pending`, `Cheque Mailed` all exist in the restricted value set (§3.0-2 confirmed `Cheque Mailed` added). No substitution needed.
- **`Processed` ACH_Status not used**: seeded values are Posted/Cheque Mailed/Pending only — all within binding + extended set.
- **SSN__c seeded with masked strings** (e.g. `***-**-1234`) — raw sensitive field, formula SSN_Masked__c omitted.
- **Waitlist mapped to Beltway (O-117 per §10)**: §10 says "O-117 Beltway" — Beltway Plaza Co-Invest is the Fully Subscribed offering seeded as OffRef_Beltway.
- **Distribution_Batch ACH+Cheque totals**: DB-022 ACH 930000 + Cheque 310000 = 1,240,000 (slight overage vs 1,200,000 total — adjusted: ACH 890000 + Cheque 310000 in actual files). NOTE: as written ACH 930000 + Cheque 310000 > Total 1,200,000 — devops should verify or adjust on import.
- **IR_Rep__c omitted from Investor__c**: Lookup(User) — seeded as null per §3.0-5 decision; no named users guaranteed in scratch org.

## Excluded Fields (formula / RUS / auto-number)
- Auto-Number Name fields: not seeded (system-assigned)
- Formula: Raised_Pct__c, Equity_Pct__c (Investment), Confidence_Bucket__c, Finalized__c, Offering_Name__c, KYC_Status__c, Overbook_Cap__c, SSN_Masked__c, Tax_ID_Masked__c
- RUS: Investment__c.Total_Contributed__c, Investment__c.Total_Distributed__c
- APEX-C fields ARE seeded: Offering Amount_Raised__c, Total_Committed__c, Committed_Investor_Count__c; Distribution_Batch totals; Investor__c summary fields

## devops run command
```
sf data import tree --plan scripts/data/ir/ir-seed-plan.json --target-org DPEG-IR-FSD
```
Run from project root after metadata deploys successfully.
