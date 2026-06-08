---
name: phase-a-layouts-vr
description: DPEG Phase A — record types, validation rules, page/compact layout decisions, FLS-on-layout rules, record type visibility approach
metadata:
  type: project
---

## Record Types (Account only)

Two record types created: `Investing_Entity` (default) and `Broker_Firm`.
Files: `force-app/main/default/objects/Account/recordTypes/`

**Record type visibility is profile-based in Salesforce Metadata API** — `RecordType` files alone do not make them visible to users. Visibility must be granted via `layoutAssignments` in a Profile metadata file.

**Why:** Chose NOT to create a profile file (high risk of overwriting org profile state). Instead, documented for devops as a manual post-deploy step.

**How to apply:** Always flag this to devops for any future record type deployment.

## Validation Rules (9 total)

All 9 rules use `< 0` (not `<= 0`) for amount fields — factory-safe.
XML-special characters (`<`) are written as `&lt;` for simple single-expression rules. CDATA used for multi-function rules (AND/NOT/ISBLANK).

| Object | Rule API name | Location |
|---|---|---|
| Account | Investing_Entity_Requires_Entity_Type | validationRules/ |
| Offering__c | Closing_Not_Before_Launch | validationRules/ |
| Offering__c | Target_Raise_Not_Negative | validationRules/ |
| Commitment__c | Committed_Amount_Not_Negative | validationRules/ |
| Investment__c | Amount_Funded_Not_Negative | validationRules/ |
| Distribution__c | Amount_Not_Negative | validationRules/ |
| Contribution__c | Amount_Not_Negative | validationRules/ |
| Share_Transfer__c | Units_Not_Negative | validationRules/ |
| Waitlist__c | Position_Min_One | validationRules/ |

## Page Layouts — FLS on Layout Rules

- `Plaid_Access_Token__c` NEVER appears on any layout.
- `SSN__c` raw field only on the IR Manager variant layout.
- `Tax_ID_EIN__c` raw field only on the IR Manager variant layout.
- `SSN_Masked__c` and `Tax_ID_Masked__c` (formula) use `<behavior>Readonly</behavior>`.
- Auto-number `Name` fields use `<behavior>Readonly</behavior>`.
- Formula, RUS, APEX-C fields use `<behavior>Readonly</behavior>`.

## IR Manager Layout Variants (two extra layouts)

- `Account-Investing Entity Layout (IR Manager).layout-meta.xml` — adds `Tax_ID_EIN__c` editable.
- `Contact-Contact Layout (IR Manager).layout-meta.xml` — adds `SSN__c` editable.

**DevOps must:** After deploy, in Setup > Profiles > IR Manager, set layout assignments for:
  - Account + Investing_Entity RT → "Investing Entity Layout (IR Manager)"
  - Contact → "Contact Layout (IR Manager)"

## Compact Layouts

`<compactLayoutAssignment>` added to each custom object-meta.xml.
Account has two compact layouts: `Investing_Entity_Compact` and `Broker_Firm_Compact`.
Standard objects (Account, Contact, Lead) compact layouts deployed as standalone files; primary assignment for Account must be set in org UI or via Profile metadata per RT.
