# Design Requirements — Investor Financial Tabs (Contact Record Page LWC)

> Prepared by: salesforce-design agent · Date: 2026-06-09
> Target: `lightning__RecordPage` (Contact) · API version: 66.0 · Data: dummy/hardcoded (no Apex)

═══════════════════════════════════════════════════════════════════════════════
DESIGN REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

## WHAT USER REQUESTED

One parent LWC and two child LWCs for the **Contact Record Page**:

- **Parent** (`investorFinancialTabs`): two-tab container — "Contributions" and "Distributions".
  Clicking a tab shows the matching child component.
- **Child 1** (`investorContributionsList`): table + pagination, columns Date Received / Amount / Investment.
- **Child 2** (`investorDistributionsList`): table + pagination, columns Type / Amount / Method / Status.
- Placed on the **right column** of the Contact Record Page.
- **5 rows per page** default, with pagination controls.
- **Dummy/hardcoded data** — no Apex.
- **SLDS** styling; clean, modern, professional Lightning look.

───────────────────────────────────────────────────────────────────────────────
ADMIN WORK (salesforce-admin)
───────────────────────────────────────────────────────────────────────────────

No admin work required for this request.

- No new objects, fields, or metadata.
- The user will place `investorFinancialTabs` on the Contact Record Page via the Lightning App Builder (right column). The component only needs `isExposed=true` + the `lightning__RecordPage` target to appear in the builder. No FlexiPage file change is requested.

───────────────────────────────────────────────────────────────────────────────
DEVELOPMENT WORK (salesforce-developer)
───────────────────────────────────────────────────────────────────────────────

Three LWC bundles, all presentational, all dummy data, no Apex, no LDS wires.

**1. `investorFinancialTabs` (parent — exposed)**

- Renders an SLDS tab set with two tabs: "Contributions" and "Distributions".
- Tracks the active tab; conditionally renders `<c-investor-contributions-list>` or `<c-investor-distributions-list>`.
- meta.xml: `apiVersion 66.0`, `isExposed=true`, single target `lightning__RecordPage`.

**2. `investorContributionsList` (child — NOT exposed)**

- Hardcoded array of rows. Columns:
  - **Date Received** — random dates formatted like "02 May 2019", "15 Dec 2020".
  - **Amount** — formatted like "$100K", "$9.1M", "$50K".
  - **Investment** — short random text names (e.g. "10 Katy Developers LLC", "Mayde Creek Apartments").
- SLDS table; client-side pagination, 5 rows/page, with pagination controls.
- meta.xml: `apiVersion 66.0`, `isExposed=false`, single target `lightning__RecordPage`.

**3. `investorDistributionsList` (child — NOT exposed)**

- Hardcoded array of rows. Columns:
  - **Type** — "Quarterly" or "Monthly" (random).
  - **Amount** — formatted like "$50K", "$1M", "$2.5M".
  - **Method** — "ACH" for all rows.
  - **Status** — "Processing" or "Completed".
- SLDS table; client-side pagination, 5 rows/page, with pagination controls.
- meta.xml: `apiVersion 66.0`, `isExposed=false`, single target `lightning__RecordPage`.

**Shared dev conventions to apply (from ARCHITECTURE.md §5 + project memory):**

- SLDS 2 styling via design tokens where practical; no hardcoded colors/spacing beyond what SLDS provides. Use SLDS table, tabset, and badge classes.
- Status column on Distributions should use an SLDS visual cue (e.g. badge) for "Processing" vs "Completed".
- Jest test required for every LWC (`__tests__/<component>.test.js`) per ARCHITECTURE.md §5 — include unless user says skip tests.
- Pagination: presentational only (Prev/Next + page indicator). Disable Prev on first page and Next on last page.

───────────────────────────────────────────────────────────────────────────────
EXECUTION ORDER
───────────────────────────────────────────────────────────────────────────────

1. Build both child components first (`investorContributionsList`, `investorDistributionsList`) — the parent references them as `<c-investor-contributions-list>` / `<c-investor-distributions-list>`.
2. Build the parent (`investorFinancialTabs`) that hosts the tabs and renders the children.

(All three can be authored in one developer pass; the order only matters for nesting correctness.)

───────────────────────────────────────────────────────────────────────────────
NOTES / AWARENESS (not added scope)
───────────────────────────────────────────────────────────────────────────────

- **Domain-model note (no action needed for this request):** In DPEG, Contributions and Distributions are modeled around `Investor__c`, not `Contact` directly (see project memory / glossary). Because this build uses dummy data with no Apex, placing it on the Contact Record Page is fine. If/when real data is wired later, the source object and the page target may need revisiting. Flagging only — not changing the requested target.
- **Namespace:** This scratch org (`DPEG-IR-FSD`) is `Unison`-namespaced per Phase B memory, but component references and tags are authored UNPREFIXED and resolve in-namespace. The developer authors `<c-...>` selectors normally.

───────────────────────────────────────────────────────────────────────────────
PROMPT FOR salesforce-developer
───────────────────────────────────────────────────────────────────────────────

"""
Create three presentational Lightning Web Components for the DPEG project. All use hardcoded dummy data — NO Apex, NO LDS wires, NO @salesforce/schema imports. API version 66.0. Author all component tags/imports UNPREFIXED (they resolve in the org's Unison namespace). Do not deploy — create files only.

COMPONENT 1 — investorContributionsList (child; isExposed=false; target lightning\_\_RecordPage)

- Hardcoded array of ~15–20 rows so pagination is visible.
- Columns: "Date Received", "Amount", "Investment".
  - Date Received: dates rendered like "02 May 2019", "15 Dec 2020".
  - Amount: rendered like "$100K", "$9.1M", "$50K".
  - Investment: short text names, e.g. "10 Katy Developers LLC", "Mayde Creek Apartments", "Grand Parkway Plaza".
- SLDS table. Client-side pagination, default 5 rows per page, Prev/Next controls + page indicator (e.g. "Page 1 of 4"). Disable Prev on first page, Next on last page.

COMPONENT 2 — investorDistributionsList (child; isExposed=false; target lightning\_\_RecordPage)

- Hardcoded array of ~15–20 rows.
- Columns: "Type", "Amount", "Method", "Status".
  - Type: "Quarterly" or "Monthly" (mix).
  - Amount: rendered like "$50K", "$1M", "$2.5M".
  - Method: "ACH" for all rows.
  - Status: "Processing" or "Completed" (mix). Render Status with an SLDS badge styling cue distinguishing the two states.
- SLDS table. Client-side pagination, default 5 rows per page, Prev/Next controls + page indicator. Same disable rules as Component 1.

COMPONENT 3 — investorFinancialTabs (parent; isExposed=TRUE; target lightning\_\_RecordPage)

- SLDS tabset with two tabs: "Contributions" and "Distributions".
- Track active tab; render <c-investor-contributions-list> under the Contributions tab and <c-investor-distributions-list> under the Distributions tab (lazy/conditional render is fine).
- This is the only component placeable in the Lightning App Builder; the user will drop it into the right column of the Contact Record Page.

CROSS-CUTTING:

- SLDS 2 styling; use SLDS table/tabset/badge classes and design tokens; avoid hardcoded colors/spacing beyond SLDS.
- Each bundle: <component>.js, .html, .css (if needed), and .js-meta.xml (apiVersion 66.0, correct isExposed + single lightning\_\_RecordPage target).
- Add a Jest test per component under **tests**/ (rendering + pagination Next/Prev behavior). If the user has said skip tests, omit them.
- Clean, modern, professional Lightning look consistent with the existing DPEG IR components.
  """

═══════════════════════════════════════════════════════════════════════════════
