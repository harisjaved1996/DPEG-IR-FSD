# Design Requirements — Amount Funded by Status widget on Investments Dashboard

**Prepared by:** salesforce-design subagent
**Date:** 2026-06-17
**Org:** `DPEG-IR-FSD` (namespace `Unison`)
**Status:** PLAN ONLY — no implementation performed.

---

## 1. Request Summary

Add a widget to the **Investments Dashboard** that shows the **Sum of Amount Funded grouped by Investment Status**, rendered as a **vertical bar chart** (status labels on the X-axis: "Active" / "Closed"; Sum of Amount on the Y-axis).

The user's "reuse if a suitable report exists, otherwise create" branch resolves to **create a new report**: the only existing status-grouped report (`IRInvestmentReports/Investments_by_Status`) summarizes by **record count only** and has no amount aggregate — it cannot drive a Sum-of-Amount chart. Confirmed by inspecting the file (no `<aggregateTypes>` on any column).

---

## 2. Confirmed Facts (verified against repo, do not re-investigate)

| Fact            | Value                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard file  | `force-app/main/default/dashboards/IR_Dashboards/oqdpeKcyYJeCLYsSDLytJHvmNmtOzb.dashboard-meta.xml` (title "Investments Dashboard") |
| Layout          | `isGridLayout=true`, `numberOfColumns=12`, `rowHeight=36`                                                                           |
| Existing comp 1 | Line "Distributions by Months" — colIndex 0, colSpan 5, rowIndex 0, rowSpan 9                                                       |
| Existing comp 2 | Donut "Investments by Status" — colIndex 5, colSpan 3, rowIndex 0, rowSpan 9                                                        |
| Free grid space | Columns **8–11** in rowIndex 0 are open                                                                                             |
| Status field    | `Investment__c.Status__c` → values **Active** (8 recs), **Closed** (6 recs)                                                         |
| Amount field    | `Investment__c.Amount_Funded__c` (label "Amount Funded", Currency). Active = $1,364,000; Closed = $1,277,000                        |
| Report type     | `CustomEntity$Investment__c` (bare reference — namespace implicit)                                                                  |
| Folder          | `IRInvestmentReports` (label "IR Investment Reports")                                                                               |
| Vertical bars   | `componentType=Column` (NOT `Bar`, which is horizontal)                                                                             |

Aggregate-column pattern confirmed from sibling report `Average_Returns_by_Status.report-meta.xml`: a summarized numeric column is a `<columns>` block with `<aggregateTypes>` + `<field>`.

---

## 3. Deliverable 1 — New Report

**Type:** Reports metadata (declarative).
**File:** `force-app/main/default/reports/IRInvestmentReports/Investment_Amount_by_Status.report-meta.xml`
**API/Developer name:** `Investment_Amount_by_Status` (folder `IRInvestmentReports`)
**Report label (`<name>`):** `Investment Amount by Status`

| Element                   | Value                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| `format`                  | `Summary`                                                                                                 |
| `reportType`              | `CustomEntity$Investment__c` (bare — matches all working reports)                                         |
| `groupingsDown` → `field` | `Investment__c.Status__c` (sortOrder `Asc`)                                                               |
| Summary column            | `<columns>` with `<aggregateTypes>Sum</aggregateTypes>` + `<field>Investment__c.Amount_Funded__c</field>` |
| `showGrandTotal`          | `true`                                                                                                    |
| `showSubTotals`           | `true`                                                                                                    |
| `showDetails`             | `false`                                                                                                   |
| `scope`                   | `organization`                                                                                            |
| `description`             | e.g. "Sum of Amount Funded grouped by Investment Status (portfolio funding by status)."                   |

Notes:

- The Sum aggregate on `Amount_Funded__c` is what makes the chart's Y-axis bind to a summable amount. Without `<aggregateTypes>Sum</aggregateTypes>` the dashboard `chartSummary` with `aggregate=Sum` will have nothing to bind to.
- `timeFrameFilter` is optional and NOT required for this chart; omit unless the user wants a date filter.

---

## 4. Deliverable 2 — Dashboard Widget

**Type:** Dashboard metadata (declarative).
**File (EDIT, do not recreate):** `force-app/main/default/dashboards/IR_Dashboards/oqdpeKcyYJeCLYsSDLytJHvmNmtOzb.dashboard-meta.xml`

Add a third `<dashboardGridComponents>` block inside `<dashboardGridLayout>` (before `<numberOfColumns>`):

| Element                           | Value                                                                                                                                                                                                                                                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grid placement                    | `columnIndex=8`, `colSpan=4`, `rowIndex=0`, `rowSpan=9` (fills free cols 8–11, same height as siblings)                                                                                                                                                                                                           |
| `componentType`                   | `Column` (vertical bars)                                                                                                                                                                                                                                                                                          |
| `header`                          | `Amount Funded by Status`                                                                                                                                                                                                                                                                                         |
| `report`                          | `IRInvestmentReports/Investment_Amount_by_Status`                                                                                                                                                                                                                                                                 |
| `groupingColumn`                  | `Investment__c.Status__c`                                                                                                                                                                                                                                                                                         |
| `chartSummary`                    | `aggregate=Sum`, `axisBinding=y`, `column=Investment__c.Amount_Funded__c`                                                                                                                                                                                                                                         |
| `useReportChart`                  | `false`                                                                                                                                                                                                                                                                                                           |
| `autoselectColumnsFromReport`     | `false`                                                                                                                                                                                                                                                                                                           |
| Supporting props (match siblings) | `chartAxisRange=Auto`, `decimalPrecision=-1`, `displayUnits=Auto`, `drillEnabled=false`, `drillToDetailEnabled=false`, `enableHover=false`, `expandOthers=false`, `legendPosition=Bottom`, `maxValuesDisplayed=6`, `showPercentage=false`, `showValues=true`, `sortBy=RowLabelAscending`, `sortLegendValues=true` |
| Grouping sort                     | `<groupingSortProperties>` → `groupingLevel=g1`, `sortOrder=a`                                                                                                                                                                                                                                                    |

X-axis = grouping (`Status__c` → Active/Closed); Y-axis = `chartSummary` Sum of `Amount_Funded__c`. Exactly the vertical-bar / sum-of-amount layout requested.

---

## 5. Ordered Build Plan & Agent Routing

This is **pure declarative work (Report + Dashboard)** — no Apex, no LWC, no tests, no code review.

| #   | Metadata type | Action                                                                                                                   | Agent                                               |
| --- | ------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| 1   | Report        | Create `Investment_Amount_by_Status.report-meta.xml`                                                                     | **salesforce-admin**                                |
| 2   | Dashboard     | Edit `oqdpeKcyYJeCLYsSDLytJHvmNmtOzb.dashboard-meta.xml` to add the Column widget                                        | **salesforce-admin**                                |
| 3   | Deploy        | Deploy Report + Dashboard together to org `DPEG-IR-FSD` (report must exist before/with the dashboard that references it) | **salesforce-devops**                               |
| 4   | Document      | Document the new report + widget                                                                                         | **salesforce-documentation** (parallel with devops) |

Build the **Report first**, then the **Dashboard** (the dashboard component references the report by `folder/DeveloperName`; deploying the dashboard without the report in the org will fail). Per the global metadata rule, the admin agent must load the per-type skill and attempt `salesforce-api-context` for **each** type (Report, then Dashboard) before generating files.

---

## 6. Key Implementation Constraints (call-outs)

1. **Namespace / bare-reference gotcha (CRITICAL).** Live object is `Unison__Investment__c`, but every working report/dashboard references it **bare**: `Investment__c.<Field>__c` and `reportType=CustomEntity$Investment__c`. The new report and the dashboard `groupingColumn` / `chartSummary.column` MUST use the bare form (`Investment__c.Status__c`, `Investment__c.Amount_Funded__c`). Adding the `Unison__` prefix will break deployment or cause the chart to bind to nothing. Match the existing pattern exactly.

2. **Grid-overlap risk (CRITICAL).** Fixed 12-column grid. Existing components occupy cols 0–4 (span 5) and 5–7 (span 3) at rowIndex 0, rowSpan 9. The new component must sit at `columnIndex=8, colSpan=4` (cols 8–11) at the same `rowIndex=0, rowSpan=9` so it does not overlap. Any other coordinate at rowIndex 0 must move to a new row at `rowIndex=9`. Overlapping coordinates fail validation/render.

3. **Report must carry the Sum aggregate.** The dashboard `chartSummary aggregate=Sum` on `Amount_Funded__c` only works if the report column has `<aggregateTypes>Sum</aggregateTypes>`. The existing count-only `Investments_by_Status` report is not reusable — hence the new report.

4. **Edit, don't recreate, the dashboard file.** Preserve all dashboard-level properties and the two existing components; only append the third `<dashboardGridComponents>` block.

---

## 7. Confirmation Gate

Proceed? (yes / no / changes). On `yes`: route to **salesforce-admin** to build the Report then the Dashboard widget, then **salesforce-devops** (deploy) + **salesforce-documentation** (docs) in parallel.
