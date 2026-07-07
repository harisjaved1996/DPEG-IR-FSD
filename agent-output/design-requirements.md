# 📋 DESIGN REQUIREMENTS — Property Valuation / Loan Balance / Loan-to-Value Fields, Page Placement & FLS

**Prepared by:** salesforce-design subagent
**Date:** 2026-07-07
**Target org:** DPEG-IR-FSD-V3 (org namespace: `Unison`)
**Objects touched:** Property (repo `Property__c` / runtime `Unison__Property__c`) — new fields; Offering + Investment — record-page display only (NO new fields on them)
**Classification:** 100% ADMIN (declarative) work + one data update. **No Apex, no LWC** → no unit-testing / code-review agents needed. Documentation step skipped (user preference carried from prior task).

---

## WHAT USER REQUESTED

1. Three new fields on **Property**:
   - **Valuation** — Currency
   - **Loan Balance** — Currency
   - **Loan to Value** — Formula: if Loan Balance is empty or zero → 0, otherwise `(Loan Balance / Valuation) * 100`
2. Show all three fields on the **Property record page**.
3. FLS for all three on the **Admin profile**.
4. Show the three fields on the **Offering record page** inside the existing **"Property Details"** section.
5. Show them "similarly" on the **Investment record page**.
6. Data update on Property **"DPEG Vicksburg, LP"**: Valuation = 125,000,000; Loan Balance = 85,050,000.

---

## VERIFIED FINDINGS (repo + org inspection, 2026-07-07)

| #   | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Evidence                                                                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | **No field overlap.** Org Property has exactly 26 `Unison__` custom fields — exact 1:1 parity with the 26 repo field files. None is a valuation/loan/LTV field (`Debt_Structure__c` is a Text(255) description of loan terms — different purpose, not a duplicate). Clean to create all three.                                                                                                                                                                                                                                                                                                           | FieldDefinition query (39 rows incl. standard); `force-app/main/default/objects/Property__c/fields/`                                      |
| F2  | **Property's active record page = `Property_Record_Page`** (Dynamic Forms; org-default via View actionOverrides, Large + Small). Its detail tab has two sections: "Property Details" (`flexipage_fieldSection`) and "System Information" (`flexipage_fieldSection6`). Left column facet `Facet-088154a7-88af-4ae1-9017-1cbb1dc0cd11` ends with `Record.Land_Acres__c`; right column facet `Facet-55e41348-a3e9-4344-a69b-e93f00f8e92f` ends with `Record.Year_Built__c`.                                                                                                                                 | `Property__c.object-meta.xml` lines 129–148; `flexipages/Property_Record_Page.flexipage-meta.xml`; Tooling FlexiPage query                |
| F3  | **Investment has a DIRECT lookup to Property** (`Investment__c.Property__c`, runtime `Unison__Property__c`) in addition to its `Offering__c` lookup → only **1 relationship hop** needed, same as Offering.                                                                                                                                                                                                                                                                                                                                                                                              | `objects/Investment__c/fields/Property__c.field-meta.xml`                                                                                 |
| F4  | **Cross-object Dynamic Forms fieldInstances are already deployed and working on BOTH target pages.** `Offering_Record_Page1` and `Investment_Record_Page` each render 7 Property fields via `<fieldItem>Record.Unison__Property__r.&lt;Field&gt;__c</fieldItem>` (namespaced relationship + bare leaf field, **no** `fieldInstanceProperties` — cross-object fields are inherently read-only). This is the proven mechanism — no mirror formula fields needed on Offering/Investment.                                                                                                                    | `flexipages/Offering_Record_Page1.flexipage-meta.xml` lines 273–318; `flexipages/Investment_Record_Page.flexipage-meta.xml` lines 187–232 |
| F5  | **Offering page:** active page is `Offering_Record_Page1`; its "Property Details" section = `flexipage_fieldSection2`, columns facet `Facet-1c0b6776-5191-4e0d-9983-cd4917b21ff5` → left column facet `Facet-749f1b10-1ca1-485a-bef9-97c7d872d6c5` (Property lookup, Property Type, Units, Square Feet), right column facet `Facet-dae1c67d-4cea-40b2-adac-521aa8a61a42` (Address, County, Acquisition Date, **Land Acres = last item**).                                                                                                                                                                | Same file, lines 262–345, 435–452                                                                                                         |
| F6  | **Investment page:** active page is `Investment_Record_Page` (org-default via View actionOverrides). It **already has a "Property Detail" section** (`flexipage_fieldSection2`, label "Property Detail" — singular) with identical column structure: left facet `Facet-bd9bb4e7-7ecc-49e5-aa4d-1213e0dff522`, right facet `Facet-8e826283-749e-4d15-8452-98479d489f94` (Address, County, Acquisition Date, **Land Acres = last item**). "Similarly" = reuse this section; **no new section needed**.                                                                                                     | `Investment__c.object-meta.xml` lines 129–144; `flexipages/Investment_Record_Page.flexipage-meta.xml`                                     |
| F7  | **Currency convention on Property:** siblings `LP_Capital__c`, `Annual_NOI__c`, `DPEG_Stake__c` are metadata `precision 16 / scale 2` (org displays Currency(14,2)). 125,000,000 (9 digits) fits comfortably.                                                                                                                                                                                                                                                                                                                                                                                            | Field metas; FieldDefinition query                                                                                                        |
| F8  | **Formula-field repo shape:** formulas are written with **bare field references** (`Target_Raise__c * Overbook_Multiplier__c`) — org auto-applies the namespace on deploy. Existing formula fields carry `formulaTreatBlanksAs=BlankAsZero`, `precision 18 / scale 2`. Reference: `Offering__c/fields/Overbook_Cap__c.field-meta.xml`, `Raised_Pct__c`, `Investment__c/fields/Equity_Pct__c`.                                                                                                                                                                                                            | Grep `<formula>` across objects                                                                                                           |
| F9  | **Target record verified:** Id **`a0lFW000E9AWviiYID`**, Name "DPEG Vicksburg, LP" (exactly one match; comma in name → update by Id). Expected LTV after update: **85,050,000 / 125,000,000 × 100 = 68.04**.                                                                                                                                                                                                                                                                                                                                                                                             | SOQL                                                                                                                                      |
| F10 | **FLS delivery pattern (known blocker):** `profiles/Admin.profile-meta.xml` does NOT deploy to V3 (dangling `sfdc_default_ReportExport_Protection_Flow` flowAccesses entry; rule: do not strip it). Working pattern from the prior task: update the repo profile file for repo truth, deliver org FLS via `FieldPermissions` inserts on the System Administrator profile's parent PermissionSet **`0PSFW000K5T0EeK4IV`** — re-verified valid today (Profile.Name = "System Administrator"). Profile fieldPermissions in the repo file use bare refs (`Property__c.Field__c`), case-sensitive ASCII sort. | PermissionSet SOQL; `Admin.profile-meta.xml` lines 1442–1568                                                                              |
| F11 | All three target flexipages exist in org under the `Unison` namespace (`Property_Record_Page`, `Offering_Record_Page1`, `Investment_Record_Page`).                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Tooling FlexiPage query                                                                                                                   |
| F12 | **New fields deployed via Metadata API get NO FLS for anyone** (including System Administrator) until FieldPermissions rows exist → the FLS inserts are functionally mandatory, not just requested; they must also run **before** the record data update (REST/CLI DML enforces field visibility).                                                                                                                                                                                                                                                                                                       | Platform behavior + prior-task experience                                                                                                 |

---

## ⚠ DECISION POINTS (orchestrator: confirm with user; recommendations proceed unless changed)

### Decision Point 1 — Loan-to-Value formula: guard against Valuation = 0/blank (RECOMMENDED: add guard)

The literal request only guards Loan Balance. If Valuation is 0/blank while Loan Balance > 0, the literal formula renders **#Error!** on every page.

- **Option A — RECOMMENDED (guarded):** `IF(OR(ISBLANK(Loan_Balance__c), Loan_Balance__c = 0, ISBLANK(Valuation__c), Valuation__c = 0), 0, (Loan_Balance__c / Valuation__c) * 100)` — returns 0 instead of an error. Slight deviation from the literal request, matches repo convention (`Raised_Pct__c` guards its divisor).
- **Option B (literal):** `IF(OR(ISBLANK(Loan_Balance__c), Loan_Balance__c = 0), 0, (Loan_Balance__c / Valuation__c) * 100)` — #Error! when Valuation empty/0 and Loan Balance set.

### Decision Point 2 — Loan-to-Value return type: Number(18,2), NOT Percent (RECOMMENDED: Number)

The requested formula multiplies by 100, so the correct return type is **Number, 2 decimals** → displays **68.04**. A Percent return type with the same formula would display **6,804%**. (If the user wants a "%" sign displayed, the alternative is Percent type WITHOUT the ×100 — but that deviates from the formula as written. Recommendation: Number(18,2) as specified.)

### Decision Point 3 — Cross-object display mechanism for Offering/Investment (RECOMMENDED: Dynamic Forms cross-object fieldInstances)

- **Option A — RECOMMENDED:** add `Record.Unison__Property__r.<Field>__c` fieldInstances to the existing sections — zero new metadata on Offering/Investment, values always live, read-only by nature, and **both pages already use exactly this pattern for 7 other Property fields** (proven deployable + rendering in this org).
- **Option B (rejected):** 6 mirror formula fields on Offering/Investment + their FLS — more metadata, no benefit.

### Decision Point 4 — Placement detail (proposal; proceeds as below unless changed)

One consistent rule on all three pages: **insert the trio contiguously, in order Valuation → Loan Balance → Loan to Value, immediately after the existing `Land_Acres__c` item**:

- Property page → end of **left** column of "Property Details" (Land Acres is last there).
- Offering page → end of **right** column of "Property Details" (Land Acres is last there).
- Investment page → end of **right** column of "Property Detail" (Land Acres is last there).
  Columns become slightly uneven (cosmetic only). Alternative: split the trio across columns for balance — breaks the requested order, not recommended.

### Decision Point 5 — API naming (proposal; proceeds as below)

`Valuation__c`, `Loan_Balance__c`, `Loan_to_Value__c` — mirrors the user's labels and Property sibling style (`LP_Capital__c`, `Annual_NOI__c` carry no `Amount` suffix, despite the ARCHITECTURE.md general guidance). Runtime names after deploy: `Unison__Valuation__c`, `Unison__Loan_Balance__c`, `Unison__Loan_to_Value__c`.

---

## 🔵 ADMIN WORK (salesforce-admin)

### A. Three new field files — `force-app/main/default/objects/Property__c/fields/`

All files **bare** (no `Unison__` prefix) per repo convention. Formula references bare (F8).

**1. `Valuation__c.field-meta.xml`** (mirror `LP_Capital__c` shape):

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Valuation__c</fullName>
    <description>Current market valuation of the property.</description>
    <inlineHelpText>Enter the current property valuation in USD.</inlineHelpText>
    <label>Valuation</label>
    <precision>16</precision>
    <required>false</required>
    <scale>2</scale>
    <trackTrending>false</trackTrending>
    <type>Currency</type>
</CustomField>
```

**2. `Loan_Balance__c.field-meta.xml`** — identical shape; `fullName` `Loan_Balance__c`, label `Loan Balance`, description "Outstanding loan balance on the property.", help "Enter the outstanding loan balance in USD.", Currency, precision 16, scale 2.

**3. `Loan_to_Value__c.field-meta.xml`** (mirror `Overbook_Cap__c` formula shape; formula per Decision Point 1 Option A):

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Loan_to_Value__c</fullName>
    <description
  >Loan-to-value ratio: Loan Balance divided by Valuation, expressed as a number out of 100. Returns 0 when Loan Balance or Valuation is empty or zero.</description>
    <formula
  >IF(OR(ISBLANK(Loan_Balance__c), Loan_Balance__c = 0, ISBLANK(Valuation__c), Valuation__c = 0), 0, (Loan_Balance__c / Valuation__c) * 100)</formula>
    <formulaTreatBlanksAs>BlankAsZero</formulaTreatBlanksAs>
    <inlineHelpText>Automatically calculated: (Loan Balance / Valuation) x 100.</inlineHelpText>
    <label>Loan to Value</label>
    <precision>18</precision>
    <required>false</required>
    <scale>2</scale>
    <trackTrending>false</trackTrending>
    <type>Number</type>
    <unique>false</unique>
</CustomField>
```

(If the user overrides Decision Point 1 → Option B literal formula: `IF(OR(ISBLANK(Loan_Balance__c), Loan_Balance__c = 0), 0, (Loan_Balance__c / Valuation__c) * 100)`.)

### B. Admin profile — `force-app/main/default/profiles/Admin.profile-meta.xml` (repo truth only; NOT deployable — see F10)

Insert three `fieldPermissions` blocks in the Property block, preserving the file's case-sensitive ASCII sort:

Between `Property__c.Lender__c` (≈ line 1508) and `Property__c.Occupancy_Pct__c`:

```xml
    <fieldPermissions>
        <editable>true</editable>
        <field>Property__c.Loan_Balance__c</field>
        <readable>true</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Property__c.Loan_to_Value__c</field>
        <readable>true</readable>
    </fieldPermissions>
```

Between `Property__c.Units__c` (≈ line 1553) and `Property__c.Year_Built__c`:

```xml
<fieldPermissions>
        <editable>true</editable>
        <field>Property__c.Valuation__c</field>
        <readable>true</readable>
    </fieldPermissions>
```

**`Loan_to_Value__c` must be `editable=false`** — formula fields reject edit FLS.

### C. Flexipage edits (3 files)

**C1. `force-app/main/default/flexipages/Property_Record_Page.flexipage-meta.xml`** — own-object fields.
In facet `Facet-088154a7-88af-4ae1-9017-1cbb1dc0cd11` (left column of "Property Details"), insert after the `Record.Land_Acres__c` itemInstance (identifier `RecordUnison_Land_Acres_cField`, lines 79–88), in this order:

```xml
        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>none</value>
                </fieldInstanceProperties>
                <fieldItem>Record.Valuation__c</fieldItem>
                <identifier>RecordUnison_Valuation_cField</identifier>
            </fieldInstance>
        </itemInstances>
        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>none</value>
                </fieldInstanceProperties>
                <fieldItem>Record.Loan_Balance__c</fieldItem>
                <identifier>RecordUnison_Loan_Balance_cField</identifier>
            </fieldInstance>
        </itemInstances>
        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>none</value>
                </fieldInstanceProperties>
                <fieldItem>Record.Loan_to_Value__c</fieldItem>
                <identifier>RecordUnison_Loan_to_Value_cField</identifier>
            </fieldInstance>
        </itemInstances>
```

(Formula field renders read-only automatically; `uiBehavior none` matches page convention.)

**C2. `force-app/main/default/flexipages/Offering_Record_Page1.flexipage-meta.xml`** — cross-object, read-only.
In facet `Facet-dae1c67d-4cea-40b2-adac-521aa8a61a42` (right column of "Property Details" / `flexipage_fieldSection2`), insert after the `Record.Unison__Property__r.Land_Acres__c` itemInstance (identifier `RecordUnison_Property_rUnison_Land_Acres_cField`, lines 313–318), in this order (NO fieldInstanceProperties — matches the 7 existing cross-object entries):

```xml
        <itemInstances>
            <fieldInstance>
                <fieldItem>Record.Unison__Property__r.Valuation__c</fieldItem>
                <identifier>RecordUnison_Property_rUnison_Valuation_cField</identifier>
            </fieldInstance>
        </itemInstances>
        <itemInstances>
            <fieldInstance>
                <fieldItem>Record.Unison__Property__r.Loan_Balance__c</fieldItem>
                <identifier>RecordUnison_Property_rUnison_Loan_Balance_cField</identifier>
            </fieldInstance>
        </itemInstances>
        <itemInstances>
            <fieldInstance>
                <fieldItem>Record.Unison__Property__r.Loan_to_Value__c</fieldItem>
                <identifier>RecordUnison_Property_rUnison_Loan_to_Value_cField</identifier>
            </fieldInstance>
        </itemInstances>
```

**C3. `force-app/main/default/flexipages/Investment_Record_Page.flexipage-meta.xml`** — cross-object, read-only.
Identical three itemInstances blocks as C2, inserted in facet `Facet-8e826283-749e-4d15-8452-98479d489f94` (right column of "Property Detail" / `flexipage_fieldSection2`) after the `Record.Unison__Property__r.Land_Acres__c` itemInstance (identifier `RecordUnison_Property_rUnison_Land_Acres_cField`, lines 227–232). Identifiers are page-scoped, so the same identifier values are safe here.

**No other changes:** no new sections, no permission sets, no layouts, no validation rules, no fields on Offering/Investment.

---

## 🟢 DEVELOPMENT WORK

**None.** No Apex, no LWC. Skip salesforce-developer, salesforce-unit-testing, salesforce-code-review.

---

## 🔴 DEPLOYMENT + DATA (salesforce-devops) — run in PowerShell (not Git Bash)

**⛔ Do NOT deploy `Admin.profile-meta.xml`** (known blocker, F10). FLS goes in-org via FieldPermissions inserts.

**Stage 1 — deploy the 3 field files:**

```powershell
sf project deploy start --source-dir "force-app/main/default/objects/Property__c/fields/Valuation__c.field-meta.xml" --source-dir "force-app/main/default/objects/Property__c/fields/Loan_Balance__c.field-meta.xml" --source-dir "force-app/main/default/objects/Property__c/fields/Loan_to_Value__c.field-meta.xml" -o DPEG-IR-FSD-V3
```

**Stage 2 — verify runtime API names:**

```powershell
sf data query --query "SELECT QualifiedApiName, DataType FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName='Unison__Property__c' AND QualifiedApiName IN ('Unison__Valuation__c','Unison__Loan_Balance__c','Unison__Loan_to_Value__c')" -o DPEG-IR-FSD-V3 --json
```

Expect 3 rows: Currency(14,2), Currency(14,2), Number(16,2)-style formula.

**Stage 3 — FLS inserts on PermissionSet `0PSFW000K5T0EeK4IV`** (System Administrator profile parent; formula row MUST be PermissionsEdit=false):

```powershell
sf data create record --sobject FieldPermissions --values "ParentId=0PSFW000K5T0EeK4IV SobjectType=Unison__Property__c Field=Unison__Property__c.Unison__Valuation__c PermissionsRead=true PermissionsEdit=true" -o DPEG-IR-FSD-V3 --json
sf data create record --sobject FieldPermissions --values "ParentId=0PSFW000K5T0EeK4IV SobjectType=Unison__Property__c Field=Unison__Property__c.Unison__Loan_Balance__c PermissionsRead=true PermissionsEdit=true" -o DPEG-IR-FSD-V3 --json
sf data create record --sobject FieldPermissions --values "ParentId=0PSFW000K5T0EeK4IV SobjectType=Unison__Property__c Field=Unison__Property__c.Unison__Loan_to_Value__c PermissionsRead=true PermissionsEdit=false" -o DPEG-IR-FSD-V3 --json
```

**Stage 4 — deploy the 3 flexipages** (after fields exist):

```powershell
sf project deploy start --source-dir "force-app/main/default/flexipages/Property_Record_Page.flexipage-meta.xml" --source-dir "force-app/main/default/flexipages/Offering_Record_Page1.flexipage-meta.xml" --source-dir "force-app/main/default/flexipages/Investment_Record_Page.flexipage-meta.xml" -o DPEG-IR-FSD-V3
```

**Stage 5 — data update (by verified Id — name contains a comma):**

```powershell
sf data update record --sobject Unison__Property__c --record-id a0lFW000E9AWviiYID --values "Unison__Valuation__c=125000000 Unison__Loan_Balance__c=85050000" -o DPEG-IR-FSD-V3 --json
```

**Stage 6 — final verification:**

```powershell
sf data query --query "SELECT Id, Name, Unison__Valuation__c, Unison__Loan_Balance__c, Unison__Loan_to_Value__c FROM Unison__Property__c WHERE Id = 'a0lFW000E9AWviiYID'" -o DPEG-IR-FSD-V3 --json
sf data query --query "SELECT Field, PermissionsRead, PermissionsEdit FROM FieldPermissions WHERE ParentId = '0PSFW000K5T0EeK4IV' AND SobjectType = 'Unison__Property__c' AND Field IN ('Unison__Property__c.Unison__Valuation__c','Unison__Property__c.Unison__Loan_Balance__c','Unison__Property__c.Unison__Loan_to_Value__c')" -o DPEG-IR-FSD-V3 --json
```

Expected: Valuation = 125000000, Loan_Balance = 85050000, **Loan_to_Value = 68.04**; 3 FLS rows (read/edit, read/edit, read-only).

---

## EXECUTION ORDER

| Step | Agent                | Work                                                                                                                       |
| ---- | -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 1    | 🔵 salesforce-admin  | Create 3 field files (§A), edit Admin profile (§B, repo truth), edit 3 flexipages (§C)                                     |
| 2    | 🔴 salesforce-devops | Stages 1–6 above, in order (fields → verify names → FLS inserts → flexipages → data update → verify). Skip profile deploy. |
| —    | Skipped              | developer / unit-testing / code-review (no code); documentation (user preference)                                          |

---

## 📝 PROMPTS

### Prompt for salesforce-admin

```
Use the salesforce-admin subagent to: Implement the Property Valuation/Loan Balance/Loan-to-Value design in agent-output/design-requirements.md exactly as specified. Repo-only changes, NO deployment:
1. Create three field files under force-app/main/default/objects/Property__c/fields/ (bare API names, no Unison__ prefix): Valuation__c (Currency, precision 16, scale 2), Loan_Balance__c (Currency, precision 16, scale 2), Loan_to_Value__c (Formula, return type Number, precision 18, scale 2, formulaTreatBlanksAs BlankAsZero, formula with bare references: IF(OR(ISBLANK(Loan_Balance__c), Loan_Balance__c = 0, ISBLANK(Valuation__c), Valuation__c = 0), 0, (Loan_Balance__c / Valuation__c) * 100)). Use the exact XML shapes in §A of the design doc (mirror sibling files LP_Capital__c and Offering's Overbook_Cap__c).
2. Edit force-app/main/default/profiles/Admin.profile-meta.xml: add fieldPermissions for Property__c.Valuation__c (editable true/readable true), Property__c.Loan_Balance__c (true/true), Property__c.Loan_to_Value__c (editable FALSE/readable true — formula), inserted at the ASCII-sorted positions given in §B. This file is repo-truth only; it will NOT be deployed.
3. Edit three flexipages per §C with the exact XML given there: Property_Record_Page (3 own-object fieldInstances with uiBehavior none appended after Record.Land_Acres__c in facet Facet-088154a7-88af-4ae1-9017-1cbb1dc0cd11), Offering_Record_Page1 (3 cross-object fieldInstances Record.Unison__Property__r.Valuation__c / Loan_Balance__c / Loan_to_Value__c, no fieldInstanceProperties, appended after the Land_Acres cross-object item in facet Facet-dae1c67d-4cea-40b2-adac-521aa8a61a42), Investment_Record_Page (same 3 cross-object fieldInstances appended after the Land_Acres cross-object item in facet Facet-8e826283-749e-4d15-8452-98479d489f94). Order everywhere: Valuation, Loan Balance, Loan to Value. Match the existing cross-object syntax already present in those two files. Create no other metadata.
```

### Prompt for salesforce-devops

```
Use the salesforce-devops subagent to: Deploy and verify the Property Valuation/Loan Balance/Loan-to-Value work per agent-output/design-requirements.md §DEPLOYMENT+DATA, against org DPEG-IR-FSD-V3, running all sf commands in PowerShell. CRITICAL constraints:
- Do NOT deploy force-app/main/default/profiles/Admin.profile-meta.xml (known blocker: dangling flowAccesses entry; do not strip it).
- Stage 1: deploy only the 3 new Property field files. Stage 2: verify runtime API names via FieldDefinition query (expect Unison__Valuation__c, Unison__Loan_Balance__c, Unison__Loan_to_Value__c). Stage 3: deliver Admin FLS via three FieldPermissions record inserts on PermissionSet 0PSFW000K5T0EeK4IV (System Administrator profile parent) — Valuation and Loan_Balance PermissionsRead=true/PermissionsEdit=true; Loan_to_Value PermissionsRead=true/PermissionsEdit=FALSE (formula fields reject edit FLS). Stage 4: deploy the 3 edited flexipages (Property_Record_Page, Offering_Record_Page1, Investment_Record_Page). Stage 5: update record Id a0lFW000E9AWviiYID (Property "DPEG Vicksburg, LP" — update by Id, name contains a comma) with Unison__Valuation__c=125000000 and Unison__Loan_Balance__c=85050000. Stage 6: verify with the SOQL in the design doc — expect Valuation 125000000, Loan Balance 85050000, computed Loan_to_Value = 68.04, and 3 FieldPermissions rows.
Use the exact commands in the design doc Stages 1–6.
```
