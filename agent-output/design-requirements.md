# Design Requirements — Distribution Investment: Source & Type Columns + Picklist Fields

**Prepared by:** salesforce-design subagent
**Date:** 2026-07-07
**Target org:** DPEG-IR-FSD-V3 (org namespace: `Unison`)
**Status:** PLAN ONLY — awaiting user confirmation (Gate 1)

---

## 1. Summary of the Request

Three linked changes:

1. **LWC `distributionInvestment`** — add two new columns at the END of the datatable, labeled **"Source"** and **"Type"**.
2. **`Distribution Batch` object** — convert the two existing fields **Source** and **Type** into **Picklists** with defined value sets.
3. **FLS** — grant field-level security (read + edit) on both fields to the **Admin profile**, then deploy.

---

## 2. Verified Facts (validated against the repo)

| Fact                                           | Confirmation                                                                                                                                                                                                                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Namespace = `Unison`                           | Local bare `Distribution_Batch__c` → live as `Unison__Distribution_Batch__c`; fields deploy as `Unison__Source__c` / `Unison__Type__c`. Confirmed in the LWC GraphQL query (`Unison__Distribution_Batch__c`).                                                           |
| `Source__c` exists as **Text(255)**            | `objects/Distribution_Batch__c/fields/Source__c.field-meta.xml` → `<type>Text</type>`, `<length>255</length>`.                                                                                                                                                          |
| `Type__c` exists as **Text(255)**              | `objects/Distribution_Batch__c/fields/Type__c.field-meta.xml` → `<type>Text</type>`, `<length>255</length>`.                                                                                                                                                            |
| LWC COLUMNS ends with a row-action column      | `distributionInvestment.js` line 23: `{ type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }`.                                                                                                                                                                 |
| Mock DATA rows already carry `source` + `type` | Rows have `source`/`type` props with VARIED values (row 2 = `Sale of Property` / `Return of Capital`, row 3 type = `Other`), NOT the fixed `Cash Flow`/`Preferred Return` the request states.                                                                           |
| Admin profile is undeployable in V3            | `memory/admin-profile-undeployable-v3.md`: dangling `flowAccesses` entry (`sfdc_default_ReportExport_Protection_Flow`) blocks full-profile deploys. FLS previously granted via `FieldPermissions` rows on the profile's parent PermissionSet (Id `0PSFW000K5T0EeK4IV`). |

---

## 3. Components Affected

| #   | Component                                                                              | Type        | Change                             |
| --- | -------------------------------------------------------------------------------------- | ----------- | ---------------------------------- |
| 1   | `force-app/main/default/lwc/distributionInvestment/distributionInvestment.js`          | LWC         | Add two text columns to `COLUMNS`. |
| 2   | `force-app/main/default/objects/Distribution_Batch__c/fields/Source__c.field-meta.xml` | CustomField | Text → Picklist.                   |
| 3   | `force-app/main/default/objects/Distribution_Batch__c/fields/Type__c.field-meta.xml`   | CustomField | Text → Picklist.                   |
| 4   | FLS for `Unison__Source__c` + `Unison__Type__c` → Admin                                | Security    | Grant read+edit (mechanism below). |

---

## 4. Recommended Approach — by Component

### 4.1 LWC datatable columns (developer)

- Insert two `type: "text"` columns into `COLUMNS`, bound to the existing row properties `source` and `type`:
  ```js
  { label: "Source", fieldName: "source", type: "text" },
  { label: "Type",   fieldName: "type",   type: "text" },
  ```
- **Placement recommendation:** the request says "at the END of the datatable." The action column (`type: "action"`) is a control column, not a data column. Recommended order: the two new data columns placed AFTER the current last data column (`Distribution Date`) and BEFORE the action column, so the row-action menu stays flush-right per SLDS convention. Net visible result: Source and Type are the last two _data_ columns. **Confirm** if the user instead wants them literally after the action column.
- **Fixed vs. bound values (OPEN QUESTION — see §7):** The request specifies Source='Cash Flow' and Type='Preferred Return', but the mock DATA already has varied values. Recommended: **bind columns to the existing `source`/`type` row fields** (no data mutation) so the table reflects real per-row values. The stated fixed values already match row 1. Only override every row to the fixed pair if the user explicitly wants a static display.
- Jest test (`__tests__/distributionInvestment.test.js`) + `@sa11y/jest` a11y assertion per ARCHITECTURE §5. No `__tests__` folder exists in the bundle today (only `.js`, `.html`, `.css`, `.js-meta.xml`); one is added if tests are in scope.
- Run the SLDS 2 linter before deploy (no styling change expected, but per policy).

### 4.2 Text → Picklist conversion (admin — see §6)

**Risk flag — field-type change on an existing field that may hold data:**

Salesforce _does_ allow converting Text → Picklist via the Metadata API / Setup, but:

- If the field already contains data in the org, existing Text values that do NOT match a picklist value are retained as **non-configured/inactive** values (data is generally preserved but flagged as non-standard); reporting and validation behavior changes.
- A **restricted picklist** will reject/flag any stored value outside the defined set and can cause the deploy/validation to fail if such values exist.
- Per project rule `no-hand-authored-metadata` and MEMORY, **do not fabricate** — the admin/devops step should first check whether `Unison__Source__c` / `Unison__Type__c` hold any data in the org (SOQL count + distinct values) before converting. If populated, surface the values to the user before choosing restricted vs. unrestricted.

**Recommended conversion strategy:**

1. Query the org for existing distinct values / row count on both fields.
2. Rewrite each `field-meta.xml`: replace `<type>Text</type>` + `<length>255</length>` with `<type>Picklist</type>` and a `<valueSet>` block (values in §5).
3. Set restriction on the value set: recommend **`restricted=false`** for the first deploy if any data exists (avoids deploy/validation errors), or **`restricted=true`** if the field is confirmed empty and the user wants strict enforcement. Default recommendation: **restricted=true only after confirming the field is empty.**
4. Deploy the object/field metadata via devops.
5. Metadata generation MUST follow `.claude/rules/salesforce-global-rule.md`: load `sf-custom-field` skill → attempt `salesforce-api-context` MCP for the CustomField/Picklist type → then generate. One type at a time.

### 4.3 Admin FLS (admin/devops — special handling required)

**Do NOT rely on a full Admin.profile deploy** — it is blocked in V3 by the dangling `flowAccesses` entry (documented in memory). Two options:

- **Option A (recommended, matches prior precedent):** Grant FLS by inserting `FieldPermissions` rows (read=true, edit=true) directly on the System Administrator profile's **parent PermissionSet** (`0PSFW000K5T0EeK4IV` in V3) via the data API, for `Unison__Distribution_Batch__c.Unison__Source__c` and `...Unison__Type__c`. This is exactly how `Unison__Offering__c` FLS was applied on 2026-07-07. Optionally also add matching `<fieldPermissions>` entries to the repo `Admin.profile-meta.xml` so file and org agree (but do not deploy the profile).
- **Option B:** Create/extend a dedicated **PermissionSet** in the repo granting FLS on both fields and deploy that (cleaner for source control, assignable). Choose if the user prefers a deployable, tracked artifact over a direct data insert.

**Recommendation:** Option A for immediate parity with existing org practice; Option B noted as the source-controlled alternative. Flag both for the devops step. Full-profile deploys remain blocked until the user approves removing the dangling flow entry or the flow exists in the org.

---

## 5. Picklist Value Sets (exactly as specified)

**Source** (`Unison__Source__c`):

1. Cash Flow
2. Redemption
3. Refinance
4. Sale of Property

**Type** (`Unison__Type__c`):

1. Catch Up
2. Fee
3. Interest
4. Other
5. Preferred Return
6. Return of Capital

(Order above = requested order; recommend preserving it — do not auto-sort.)

---

## 6. Complexity Routing Recommendation

| Work item                                                                | Complexity                                                                                                          | Route to                                                                                                                                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text → Picklist conversion on 2 existing fields (with data-safety check) | Field-type change with a known data-preservation caveat, but single-object, 2 fields, no multi-object schema design | **`salesforce-admin`** (routine field work). If the org-data check reveals populated fields requiring a migration/cleanup strategy → escalate to **`salesforce-solution-architect`**. |
| LWC datatable column additions + Jest test                               | Standard LWC change                                                                                                 | **`salesforce-developer`**                                                                                                                                                            |
| FLS via FieldPermissions / PermissionSet                                 | Routine security                                                                                                    | **`salesforce-admin`** (executes the insert / permission-set edit) → **`salesforce-devops`** for deploy.                                                                              |

No Apex is created → **skip `salesforce-unit-testing`**. Code review still applies to the LWC + metadata before deploy.

---

## 7. Open Questions / Confirmation Points

1. **Fixed vs. bound column values:** Bind the new columns to the existing per-row `source`/`type` values (recommended), or override ALL rows to a static `Cash Flow` / `Preferred Return`?
2. **Column placement:** Place Source/Type as the last two _data_ columns (before the action menu, recommended), or literally after the action column?
3. **Restricted picklist?** Should the picklists be **restricted** (reject values outside the set) or **unrestricted**? Depends on whether the fields currently hold data — we will run a value/count check first. Confirm your preferred enforcement level.
4. **FLS mechanism:** Approve **Option A** (FieldPermissions insert on parent PermissionSet `0PSFW000K5T0EeK4IV`, matching prior practice) — or prefer **Option B** (a deployable, source-controlled PermissionSet)?
5. **Admin profile file:** Should we also add matching `<fieldPermissions>` entries to the repo `Admin.profile-meta.xml` (for file/org parity) even though it is not deployed?
6. **Target org:** Confirm deployment target is **DPEG-IR-FSD-V3**.

---

## 8. Ordered Execution Steps (post-confirmation)

1. **[admin]** Check org for existing data on `Unison__Source__c` / `Unison__Type__c` (SOQL count + distinct values). Surface findings; decide restricted vs. unrestricted with the user.
2. **[admin]** Per `salesforce-global-rule`: load `sf-custom-field` skill → `salesforce-api-context` MCP for CustomField/Picklist → rewrite `Source__c.field-meta.xml` (Text → Picklist + valueSet from §5).
3. **[admin]** Same cycle for `Type__c.field-meta.xml` (one type at a time).
4. **[developer]** Edit `distributionInvestment.js` COLUMNS: add "Source" and "Type" text columns (placement per §4.1); add/adjust Jest + a11y test; run SLDS 2 linter.
5. **[code-review]** Review LWC change + both field metadata changes.
6. **[Gate 2]** Await review verdict.
7. **[devops]** Deploy the two field metadata changes + the LWC to the target org (with deployment confirmation).
8. **[admin/devops]** Grant Admin FLS via the chosen mechanism (Option A: FieldPermissions insert on PermSet `0PSFW000K5T0EeK4IV`; or Option B: deploy PermissionSet). Do NOT attempt full Admin.profile deploy.
9. **[documentation]** (parallel) Document the field-type change, picklist values, and FLS mechanism.
10. **[main]** Summarize results.
