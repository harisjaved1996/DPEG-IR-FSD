# 📋 DESIGN REQUIREMENTS — Investment Listing LWCs: Remove Type Column; Swap Target IRR / Investment Period for Unreturned Capital + Net Equity (active child)

**Prepared by:** salesforce-design subagent
**Date:** 2026-07-07
**Target org:** DPEG-IR-FSD-V3 (org namespace: `Unison`)
**Components touched:** `lwc/activeInvestmentListingChild`, `lwc/closedInvestmentListingChild`, `lwc/irInvestmentsList` — **JS files only** (no HTML/CSS/meta changes)
**Classification:** 100% LWC DEVELOPMENT work → 🟢 salesforce-developer → 🟣 salesforce-code-review → 🔴 salesforce-devops. **No Apex** → no unit-testing agent. **No Jest tests exist for these 3 bundles → do NOT add any** (scope guard). No admin work. Documentation step skipped (session preference).

---

## WHAT USER REQUESTED (verbatim scope — nothing more)

1. `activeInvestmentListingChild` **and** `closedInvestmentListingChild`: remove the **Type** column and its value.
2. `activeInvestmentListingChild` only: replace **Target IRR** and **Investment Period** columns with **Unreturned Capital** and **Net Equity**, using arbitrary demo values — Unreturned Capital between **$3,000,000–$4,000,000**, Net Equity between **$20,106,551–$25,500,233**.
3. `irInvestmentsList`: remove the **Type** column. (Its Target IRR / Investment Period columns are **NOT** touched.)

---

## VERIFIED FINDINGS (repo inspection, 2026-07-07)

| #   | Finding                                                                                                                                                                                                                                                                                                                                                                                        | Evidence                                                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | **All three components are fully self-contained.** Columns are a `COLUMNS` const and rows are hardcoded demo-data arrays inside each component's own JS. No `@api` inputs, no Apex controller, no data from parents. The only wire is a GraphQL lookup of one Investment Id ("DPEG Vicksburg, LP") used solely to attach `recordUrl` to the Name link — untouched by this change.              | `activeInvestmentListingChild.js`, `closedInvestmentListingChild.js`, `irInvestmentsList.js`                                              |
| F2  | **Render paths:** activeInvestmentListingChild + closedInvestmentListingChild are placed **directly** on `flexipages/Active_Investments.flexipage-meta.xml` (lines 52, 62). irInvestmentsList is placed **directly** on `flexipages/IR_Console.flexipage-meta.xml` (line 26). Flexipages pass NO componentInstanceProperties → **no flexipage edits needed**.                                  | Both flexipage files                                                                                                                      |
| F3  | Wrapper components `investmentListingParent` (renders both children) and `irActiveListingTabs` (renders irInvestmentsList) exist but are **not placed on any flexipage and not consumed by any other component** — and they pass no data anyway. **No parent edits needed.** `investmentListingParent.css` only sets host-level `display/margin` — column-agnostic.                            | Grep for `c-investment-listing-parent`, `c-ir-active-listing-tabs` across `force-app` → no consumers                                      |
| F4  | Tables render via shared `c-pill-datatable` (extends `lightning/datatable`; custom types `pill`, `progressBar`, `emailLink`). The Type column is the only `pill`-type column in these 3 components. After removal, the `pill` custom type is **still used by 6 other components** (`irOfferingsList`, `onboardingContactsList`, `shareTransferComponent`, etc.) → **pillDatatable untouched.** | `lwc/pillDatatable/pillDatatable.js`; grep `type: "pill"` → 9 files                                                                       |
| F5  | **No sorting, no column-width classes, no colspan, no CSS grid** tied to columns anywhere in the three bundles. Each bundle's CSS styles only the "View All" footer. Column count is fully driven by the `COLUMNS` array → removal/replacement is safe with zero layout side effects.                                                                                                          | All 3 `.html`/`.css` files (identical card + `c-pill-datatable` + footer structure)                                                       |
| F6  | **Type value origin differs:** in active/closed children, `type`/`typeVariant` are **computed** in `buildBaseRows()` from module consts `TYPES` + `TYPE_VARIANT` (round-robin by row index) — the data arrays contain no `type` key. In `irInvestmentsList`, `type` **is a data key** on each of the 5 rows, mapped to `typeVariant` in `buildBaseRows()` via its own `TYPE_VARIANT` const.    | `activeInvestmentListingChild.js:7-14,305-315`; `closedInvestmentListingChild.js:7-14,200-210`; `irInvestmentsList.js:5-12,42-93,100-105` |
| F7  | `activeInvestmentListingChild` shows only the **first 5 rows** (`DEFAULT_ROWS = 5`, `ACTIVE_DATA.slice(0, DEFAULT_ROWS)`) of a 25-row array (ids `a1`–`a25`). There is no in-component "show more" — "View All" navigates away to the Investment list view. So rows a1–a5 are the only visible rows.                                                                                           | `activeInvestmentListingChild.js:5,39-290,306`                                                                                            |
| F8  | `closedInvestmentListingChild` has **no Target IRR / Investment Period columns** (only Name, Type, Committed, Contributed, Distributed) — its `CLOSED_DATA` rows carry unused `targetIrr`/`holdPeriod` keys already (pre-existing pattern). Only the Type removal applies here.                                                                                                                | `closedInvestmentListingChild.js:20-36,38-189`                                                                                            |
| F9  | Currency display convention in these tables = **hardcoded `$`-prefixed strings in `type: "text"` columns** (e.g. `"$1.3M"`). The new columns follow the same mechanism (hardcoded strings, text type) but at full-dollar precision — see Decision Point 1.                                                                                                                                     | `COLUMNS` arrays in all 3 files                                                                                                           |
| F10 | **No Jest tests exist** for any of the three bundles (no `__tests__` folders). Other unrelated components independently use the terms "Unreturned Capital"/"Target IRR" (`irPortfolioCard`, `irrProgressCard`, `offeringPropertyOverview`) with their own definitions — **no shared column definitions anywhere; do not touch them.**                                                          | Glob `lwc/**/__tests__/**`; grep for the column terms                                                                                     |

---

## ⚠ DECISION POINTS (recommendations proceed unless user changes them)

### Decision Point 1 — New-value display format (RECOMMENDED: full-digit currency `"$3,247,500"`)

Neighbouring columns use compact strings (`"$1.3M"`), but the user specified ranges at exact-dollar precision (`$20,106,551–$25,500,233`) — compact formatting would collapse every Unreturned Capital value into near-identical `$3.x M` figures and lose the requested precision. **Recommendation:** full-digit, comma-separated, `$`-prefixed strings in `type: "text"` columns (same mechanism as existing currency columns). Alternative (compact `"$3.2M"`) only if the user prefers visual uniformity over precision.

### Decision Point 2 — How many ACTIVE_DATA rows get the new values (RECOMMENDED: all 25)

Only rows a1–a5 render (F7). **Recommendation:** populate `unreturnedCapital` + `netEquity` on **all 25 rows** so every row object keeps a uniform shape and no blank cells appear if `DEFAULT_ROWS` is ever raised. Exact values for all 25 are specified below (deterministic hardcoded demo values — no `Math.random`). Minimal alternative: populate only a1–a5.

### Decision Point 3 — Dead-data cleanup boundaries (RECOMMENDED: as below)

- **Keep** the now-undisplayed `targetIrr`/`holdPeriod` keys in `ACTIVE_DATA` — matches the existing precedent in `closedInvestmentListingChild` (carries them unused today) and keeps the diff minimal.
- **Remove** the `type: "…"` key from the 5 `investments` rows in `irInvestmentsList.js` — with the column and `TYPE_VARIANT` mapping gone they are fully dead, and the user's intent ("remove the Type column and its value") covers the stored values.
- **Remove** the now-unused `TYPES` / `TYPE_VARIANT` consts (and their comment lines) in all three files — leaving them would fail `no-unused-vars` linting.

---

## 🟢 DEVELOPMENT WORK (salesforce-developer) — 3 JS files, nothing else

### File 1: `force-app/main/default/lwc/activeInvestmentListingChild/activeInvestmentListingChild.js`

**Edit A1 — delete lines 7–14** (the `TYPES` const, the pill-colour comment, and the `TYPE_VARIANT` const). Keep `const DEFAULT_ROWS = 5;`.

**Edit A2 — replace the `COLUMNS` const (lines 16–34)** with:

```js
const COLUMNS = [
  {
    label: "Name",
    fieldName: "recordUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "name" }, target: "_self" }
  },
  { label: "Committed", fieldName: "committed", type: "text" },
  { label: "Contributed", fieldName: "contributed", type: "text" },
  { label: "Distributed", fieldName: "distributedDisplay", type: "text" },
  { label: "Unreturned Capital", fieldName: "unreturnedCapital", type: "text" },
  { label: "Net Equity", fieldName: "netEquity", type: "text" }
];
```

(Type pill column removed; Target IRR and Investment Period replaced in place, after Distributed.)

**Edit A3 — add two keys to every `ACTIVE_DATA` row (a1–a25)**, placed after the `distributed` key, keeping `targetIrr`/`holdPeriod` untouched (DP3). Exact values:

| id  | unreturnedCapital | netEquity       |
| --- | ----------------- | --------------- |
| a1  | `"$3,247,500"`    | `"$21,483,920"` |
| a2  | `"$3,861,200"`    | `"$24,067,315"` |
| a3  | `"$3,094,750"`    | `"$20,762,048"` |
| a4  | `"$3,578,300"`    | `"$23,214,586"` |
| a5  | `"$3,912,640"`    | `"$25,108,772"` |
| a6  | `"$3,405,880"`    | `"$22,391,450"` |
| a7  | `"$3,156,020"`    | `"$20,948,637"` |
| a8  | `"$3,733,415"`    | `"$24,832,190"` |
| a9  | `"$3,289,940"`    | `"$21,076,514"` |
| a10 | `"$3,644,180"`    | `"$23,647,825"` |
| a11 | `"$3,982,305"`    | `"$25,283,946"` |
| a12 | `"$3,071,650"`    | `"$20,415,208"` |
| a13 | `"$3,518,720"`    | `"$22,957,360"` |
| a14 | `"$3,826,090"`    | `"$24,509,671"` |
| a15 | `"$3,368,540"`    | `"$21,864,935"` |
| a16 | `"$3,690,275"`    | `"$23,082,417"` |
| a17 | `"$3,127,830"`    | `"$20,633,742"` |
| a18 | `"$3,459,610"`    | `"$22,148,569"` |
| a19 | `"$3,905,120"`    | `"$25,391,084"` |
| a20 | `"$3,214,385"`    | `"$21,527,806"` |
| a21 | `"$3,752,860"`    | `"$24,275,138"` |
| a22 | `"$3,037,490"`    | `"$20,896,320"` |
| a23 | `"$3,596,745"`    | `"$23,764,951"` |
| a24 | `"$3,880,930"`    | `"$25,032,467"` |
| a25 | `"$3,321,070"`    | `"$22,619,703"` |

Example (row a1, lines 40–49) after the edit:

```js
  {
    id: "a1",
    name: "Global Zante, LLC",
    gpEntity: "DPEG GP I LLC",
    committed: "$1.3M",
    contributed: "$1.9M",
    distributed: "$450K",
    unreturnedCapital: "$3,247,500",
    netEquity: "$21,483,920",
    targetIrr: "12%",
    holdPeriod: "3 Years"
  },
```

(All values are inside the requested ranges: $3,000,000–$4,000,000 and $20,106,551–$25,500,233; every row distinct.)

**Edit A4 — replace `buildBaseRows()` (lines 305–315)** with (drops the now-unused `index` param and the `type`/`typeVariant` assignments):

```js
  buildBaseRows() {
    return ACTIVE_DATA.slice(0, DEFAULT_ROWS).map((row) => ({
      ...row,
      distributedDisplay: row.distributed || "—"
    }));
  }
```

**No other changes** — HTML, CSS, js-meta.xml, the GraphQL wire, `attachRecordUrl`, and `handleViewAll` stay exactly as they are.

### File 2: `force-app/main/default/lwc/closedInvestmentListingChild/closedInvestmentListingChild.js`

**Edit C1 — delete lines 7–14** (`TYPES`, comment, `TYPE_VARIANT`).

**Edit C2 — remove the Type entry (lines 27–32) from `COLUMNS`**, leaving:

```js
const COLUMNS = [
  {
    label: "Name",
    fieldName: "recordUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "name" }, target: "_self" }
  },
  { label: "Committed", fieldName: "committed", type: "text" },
  { label: "Contributed", fieldName: "contributed", type: "text" },
  { label: "Distributed", fieldName: "distributedDisplay", type: "text" }
];
```

**Edit C3 — replace `buildBaseRows()` (lines 200–210)** with:

```js
  buildBaseRows() {
    return CLOSED_DATA.slice(0, DEFAULT_ROWS).map((row) => ({
      ...row,
      distributedDisplay: row.distributed || "—"
    }));
  }
```

**⛔ Scope guard:** `CLOSED_DATA` is untouched (its unused `targetIrr`/`holdPeriod` keys stay — F8/DP3). This component gets **no** new columns.

### File 3: `force-app/main/default/lwc/irInvestmentsList/irInvestmentsList.js`

**Edit I1 — delete lines 5–12** (pill-colour comment + `TYPE_VARIANT` const).

**Edit I2 — remove the Type entry (lines 25–30) from `COLUMNS`**, leaving:

```js
const COLUMNS = [
  {
    label: "Name",
    fieldName: "recordUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "name" }, target: "_self" }
  },
  { label: "Committed", fieldName: "committed", type: "text" },
  { label: "Contributed", fieldName: "contributed", type: "text" },
  { label: "Distributed", fieldName: "distributed", type: "text" },
  { label: "Target IRR", fieldName: "targetIrr", type: "text" },
  { label: "Investment Period", fieldName: "holdPeriod", type: "text" }
];
```

**⛔ Scope guard:** Target IRR and Investment Period stay in this component.

**Edit I3 — remove the `type: "…"` key** from each of the 5 `investments` rows (lines 46, 56, 66, 76, 86) — DP3.

**Edit I4 — replace `buildBaseRows()` (lines 100–105)** with (drops the dead `typeVariant` mapping; keeps the shallow copy so `investments` objects are never shared into `rows`):

```js
  buildBaseRows() {
    return this.investments.map((row) => ({ ...row }));
  }
```

**No other changes** (the unused `recordCount` getter is pre-existing — leave it).

### Global scope guards (all files)

- No HTML/CSS/js-meta.xml edits in any bundle. No edits to `pillDatatable`, `investmentListingParent`, `irActiveListingTabs`, any flexipage, or the unrelated components that mention "Unreturned Capital"/"Target IRR" (`irPortfolioCard`, `irrProgressCard`, `offeringPropertyOverview`).
- **Do NOT add Jest tests** — none exist for these bundles.
- No `Math.random()` — values are the deterministic hardcoded strings above.
- After edits, verify no remaining references to `TYPES`, `TYPE_VARIANT`, `type`, or `typeVariant` in the three files (ESLint `no-unused-vars` clean).

---

## 🔵 ADMIN WORK

**None.** No objects, fields, flexipages, profiles, or permission sets change.

---

## 🔴 DEPLOYMENT (salesforce-devops) — run in PowerShell (not Git Bash)

The three components are live in DPEG-IR-FSD-V3 (placed on `Active_Investments` and `IR_Console` flexipages — F2). Redeploy **only the three changed bundles**; flexipages are unchanged:

```powershell
sf project deploy start --source-dir "force-app/main/default/lwc/activeInvestmentListingChild" --source-dir "force-app/main/default/lwc/closedInvestmentListingChild" --source-dir "force-app/main/default/lwc/irInvestmentsList" -o DPEG-IR-FSD-V3
```

- If source tracking raises conflict errors (tracking on this org is stale/noisy), re-run the same command with `--ignore-conflicts`.
- Expected result: 3 `LightningComponentBundle` components deployed, 0 failures.
- Verification: deploy output shows the 3 bundles Succeeded; optionally open the org (`sf org open -o DPEG-IR-FSD-V3`) → Active Investments page shows both tables without a Type column, active table showing Unreturned Capital ($3.0M–$4.0M range values) + Net Equity ($20.1M–$25.5M range values) after Distributed; IR Console's investments list shows no Type column but still shows Target IRR + Investment Period.

---

## EXECUTION ORDER

| Step | Agent                     | Work                                                                                                                 |
| ---- | ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1    | 🟢 salesforce-developer   | Edits A1–A4, C1–C3, I1–I4 above (3 JS files only)                                                                    |
| 2    | 🟣 salesforce-code-review | Review the 3 changed files for scope + cleanliness (checklist in prompt)                                             |
| 3    | 🔴 salesforce-devops      | Deploy the 3 LWC bundles to DPEG-IR-FSD-V3 (command above)                                                           |
| —    | Skipped                   | admin (no declarative work) / unit-testing (no Apex; no Jest additions per F10) / documentation (session preference) |

---

## 📝 PROMPTS

### Prompt for salesforce-developer

```
Use the salesforce-developer subagent to: Implement the LWC column changes in agent-output/design-requirements.md exactly as specified — edits to THREE JS files only, no other files:

1. force-app/main/default/lwc/activeInvestmentListingChild/activeInvestmentListingChild.js:
   (A1) Delete the TYPES const, the "Same type value always maps..." comment, and the TYPE_VARIANT const (lines 7-14).
   (A2) Replace COLUMNS with the 6-column version in the design doc: Name (url), Committed, Contributed, Distributed (distributedDisplay), Unreturned Capital (fieldName unreturnedCapital, type text), Net Equity (fieldName netEquity, type text) — Type pill column removed, Target IRR and Investment Period replaced in place.
   (A3) Add unreturnedCapital and netEquity keys (after the distributed key) to ALL 25 ACTIVE_DATA rows using the EXACT per-row values in the design doc table (a1: "$3,247,500"/"$21,483,920" ... a25: "$3,321,070"/"$22,619,703"). Keep targetIrr/holdPeriod keys untouched. No Math.random.
   (A4) Replace buildBaseRows() with the version in the doc that only adds distributedDisplay (drop the index param, type, typeVariant).
2. force-app/main/default/lwc/closedInvestmentListingChild/closedInvestmentListingChild.js:
   (C1) Delete TYPES, the pill-colour comment, and TYPE_VARIANT (lines 7-14).
   (C2) Remove only the Type entry from COLUMNS (leaving Name, Committed, Contributed, Distributed).
   (C3) Replace buildBaseRows() per the doc (only adds distributedDisplay; drop index/type/typeVariant).
   Do NOT add any columns here and do NOT touch CLOSED_DATA.
3. force-app/main/default/lwc/irInvestmentsList/irInvestmentsList.js:
   (I1) Delete the pill-colour comment and TYPE_VARIANT const (lines 5-12).
   (I2) Remove only the Type entry from COLUMNS — Target IRR and Investment Period STAY.
   (I3) Remove the type: "..." key from each of the 5 investments rows.
   (I4) Replace buildBaseRows() with: return this.investments.map((row) => ({ ...row }));
Scope guards: no HTML/CSS/js-meta.xml changes; do not touch pillDatatable, investmentListingParent, irActiveListingTabs, any flexipage, or other components; do NOT create Jest tests (none exist for these bundles); after editing, confirm zero remaining references to TYPES/TYPE_VARIANT/typeVariant in the three files. Do not deploy.
```

### Prompt for salesforce-code-review

```
Use the salesforce-code-review subagent to: Review the three changed LWC JS files (activeInvestmentListingChild.js, closedInvestmentListingChild.js, irInvestmentsList.js) against agent-output/design-requirements.md. Checklist:
1. Type column (pill) removed from all three COLUMNS arrays; no leftover TYPES/TYPE_VARIANT consts, typeVariant mappings, or unused function params (ESLint no-unused-vars clean).
2. activeInvestmentListingChild: Target IRR + Investment Period columns replaced by Unreturned Capital (unreturnedCapital) + Net Equity (netEquity) after Distributed; all 25 ACTIVE_DATA rows carry the exact hardcoded values from the design doc; every unreturnedCapital value within $3,000,000-$4,000,000 and every netEquity value within $20,106,551-$25,500,233; values distinct per row; no Math.random.
3. closedInvestmentListingChild: ONLY the Type column removed (no new columns, CLOSED_DATA untouched).
4. irInvestmentsList: ONLY the Type column removed; Target IRR + Investment Period still present; type keys removed from the 5 data rows.
5. No changes to HTML/CSS/meta files, pillDatatable, parents, flexipages, or any other component; no Jest tests added; GraphQL wire / attachRecordUrl / handleViewAll logic unchanged in all three files.
Report APPROVED / APPROVED WITH WARNINGS / CHANGES REQUIRED.
```

### Prompt for salesforce-devops

```
Use the salesforce-devops subagent to: Deploy the three changed LWC bundles to org DPEG-IR-FSD-V3, running commands in PowerShell (not Git Bash):
sf project deploy start --source-dir "force-app/main/default/lwc/activeInvestmentListingChild" --source-dir "force-app/main/default/lwc/closedInvestmentListingChild" --source-dir "force-app/main/default/lwc/irInvestmentsList" -o DPEG-IR-FSD-V3
If source-tracking conflict errors occur (tracking is stale/noisy on this org), re-run with --ignore-conflicts. Deploy ONLY these three bundles — no flexipages, no other metadata. Confirm the deploy result lists the 3 LightningComponentBundle components as Succeeded and report the deploy Id.
```
