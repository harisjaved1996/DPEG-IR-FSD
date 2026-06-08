# Design Requirements — Offering Detail Page: Native Record Page Conversion

> Prepared by: salesforce-design agent · Date: 2026-06-08
> Object: `Offering__c` · API version: 66.0 · Namespace: `Unison`

## What User Requested

Modify the Offering Detail record page (`Offering__c`) with three changes:

1. Switch from the custom workspace component to a **native Salesforce record page**.
2. Add a **Highlights Panel** showing 5 fields with these labels:
   - Target Raise → `Target_Raise__c`
   - Raised → `Amount_Raised__c`
   - Overbook → `Overbook_Cap__c`
   - Committed → `Total_Committed__c`
   - Closing → `Closing_Date__c`
3. Add a **native Salesforce Path** component driven by `Status__c`.

---

## CRITICAL CONFLICT — MUST RESOLVE BEFORE IMPLEMENTATION

The request says: "the existing LWC sub-components retained as **tabs/sections below the path**" and lists 9 components (`offeringWorkspace, offeringHeader, offeringRoster, offeringCommitments, offeringContributions, offeringDistributions, offeringSignatures, offeringWaitlist, offeringWireMatching`) as if each can be dropped onto the FlexiPage individually.

**They cannot.** Verified by reading every `.js-meta.xml`:

| Component               | `isExposed` | `lightning__RecordPage` target? |
| ----------------------- | ----------- | ------------------------------- |
| `offeringWorkspace`     | **true**    | **Yes** (Offering\_\_c)         |
| `offeringHeader`        | false       | No                              |
| `offeringRoster`        | false       | No                              |
| `offeringCommitments`   | false       | No                              |
| `offeringContributions` | false       | No                              |
| `offeringDistributions` | false       | No                              |
| `offeringSignatures`    | false       | No                              |
| `offeringWaitlist`      | false       | No                              |
| `offeringWireMatching`  | false       | No                              |

Only **`offeringWorkspace`** is exposed to the record page. The other 8 are private child components it renders internally. Per `offeringWorkspace.js-meta.xml`: it "renders the offering header and an 8-tab tabset whose tab feature components each lazily fetch their own data slice." So the 8 tabs are **already inside** `offeringWorkspace` and are not placeable as standalone FlexiPage items without re-exposing each one.

**Second conflict — duplicate Highlights / Path:** `offeringHeader` (inside `offeringWorkspace`) already "renders the 8-stage stageTracker plus a 6-tile kpiCard row (Target, Amount Raised, Raised %, Overbook Cap, Committed Investors, Closing Date)." That is effectively a custom stage-path **and** a custom highlights panel. The request adds a **native** Highlights Panel (compact-layout driven) and a **native** Path — both overlapping the custom header that lives inside `offeringWorkspace`.

### Questions for the user (answer before any agent runs)

1. **Tabs placement.** Keep the 8 tabs where they are (inside `offeringWorkspace`, dropped as one component below the native Path) — OR re-expose each tab component (`isExposed=true` + `lightning__RecordPage` target on all 8) so they sit as separate FlexiPage tabs/regions? The first is a config-only change; the second is dev work on 8 LWC bundles.
2. **Duplicate header.** `offeringWorkspace` (via `offeringHeader`) already renders a custom stage tracker + KPI tiles that duplicate the new native Path and native Highlights Panel. Do you want to (a) suppress/remove the custom header inside `offeringWorkspace` to avoid double display — which is **dev work** on the LWC — or (b) accept the visual duplication for now?

The plan below assumes the **lowest-scope answers** (Q1 = keep tabs inside `offeringWorkspace`; Q2 = accept duplication, no LWC change). If you choose otherwise, dev work and agent routing change as noted.

---

## ADMIN WORK (salesforce-admin)

### A1. Compact Layout update — `Offering_Compact`

File: `force-app/main/default/objects/Offering__c/compactLayouts/Offering_Compact.compactLayout-meta.xml`

The native Highlights Panel renders the object's compact layout. Current fields: `Name, Offering_ID__c, Status__c, Target_Raise__c, Amount_Raised__c`. Add the 3 missing highlight fields so all 5 requested fields appear:

- Add `Overbook_Cap__c`
- Add `Total_Committed__c`
- Add `Closing_Date__c`

Result field order: `Name, Offering_ID__c, Status__c, Target_Raise__c, Amount_Raised__c, Overbook_Cap__c, Total_Committed__c, Closing_Date__c`.

**Note on field labels:** The Highlights Panel displays each field's **own label**, not the short labels in the request (Target Raise / Raised / Overbook / Committed / Closing). To get those exact short labels, the field labels themselves would have to change — **the user did NOT request field-label changes**, so none are made. Confirm if you want the field labels renamed (separate admin change with downstream impact).

### A2. FlexiPage rebuild — `Offering_Record_Page`

File: `force-app/main/default/flexipages/Offering_Record_Page.flexipage-meta.xml`

Rebuild as a native `RecordPage` for `Offering__c`:

- **Header region:** `force:highlightsPanel` (already present — drives the Highlights Panel from the updated compact layout).
- **Main region:** add native Path (`flexipage:path`) configured on `Status__c`, then below it the existing `Unison:offeringWorkspace` component (retained; carries the 8 tabs).
- **Sidebar region:** retain `force:relatedListContainer` (no change requested; keep as-is).
- Keep `<sobjectType>Offering__c</sobjectType>` and the `flexipage:recordHomeTemplateDesktop` template.

> FlexiPage is FlexiPage metadata, not point-and-click, but it is config-only authored from a skill. Routing it through admin (not solution-architect) is correct: there is no multi-object schema, security model, or subflow design — it is a single-page layout edit. If Q1 requires re-exposing 8 LWCs, that portion moves to dev.

---

## DEVELOPMENT WORK (salesforce-developer)

**Under the lowest-scope assumptions (Q1 = keep tabs inside workspace, Q2 = accept duplication): NO development work required.** All three requested changes are achievable via the compact-layout + FlexiPage edits above. The `Status__c` picklist already matches the requested path stages exactly — no field change.

Development work is required ONLY if the user answers:

- **Q1 = re-expose tabs individually:** dev work to set `isExposed=true` and add a `lightning__RecordPage` target (+ `Offering__c` object targetConfig) to all 8 child bundles (`offeringHeader, offeringRoster, offeringCommitments, offeringContributions, offeringDistributions, offeringSignatures, offeringWaitlist, offeringWireMatching`). Routes to `salesforce-developer` (standard LWC config; no integration/LDV/architecture → not technical-architect).
- **Q2 = remove duplicate custom header:** dev work to suppress the custom stage tracker / KPI row inside `offeringWorkspace`/`offeringHeader`. Routes to `salesforce-developer`.

Neither path touches ASB/Plaid/Yardi integration, Named Credentials, LDV, or service-layer architecture, so **technical-architect is not needed** for this request.

---

## AGENT ROUTING SUMMARY

| Work                                                | Agent                  | Why this agent (not the architect variant)                                              |
| --------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| Compact Layout update                               | `salesforce-admin`     | Single declarative metadata edit                                                        |
| FlexiPage rebuild (native page + Path + highlights) | `salesforce-admin`     | Single-page config-only edit; no multi-object schema, security model, or subflow design |
| (Conditional) Re-expose 8 LWC tabs                  | `salesforce-developer` | Standard LWC metadata config; no integration/LDV/arch                                   |
| (Conditional) Remove duplicate custom header        | `salesforce-developer` | Standard LWC edit                                                                       |
| `Status__c` picklist                                | none                   | Values already match requested path stages — no change                                  |

No unit-testing agent unless dev work (Q1/Q2) produces Apex — these LWC config changes do not.

---

## EXECUTION ORDER

1. **Compact Layout update (A1)** first — the Highlights Panel reads the compact layout, so it must include all 5 fields before the page renders meaningfully.
2. **FlexiPage rebuild (A2)** second — references `force:highlightsPanel` (compact-layout driven) and `Unison:offeringWorkspace`.
3. _(Conditional)_ Any Q1/Q2 LWC dev work — before or alongside A2; the FlexiPage region layout depends on whether tabs are re-exposed.

---

## FILES TO CREATE / MODIFY

| Action                               | File                                                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Modify                               | `force-app/main/default/objects/Offering__c/compactLayouts/Offering_Compact.compactLayout-meta.xml`         |
| Modify (rebuild)                     | `force-app/main/default/flexipages/Offering_Record_Page.flexipage-meta.xml`                                 |
| Modify (only if Q1 = re-expose)      | `force-app/main/default/lwc/offeringHeader/offeringHeader.js-meta.xml` + 7 sibling tab `.js-meta.xml` files |
| Modify (only if Q2 = de-dupe header) | `force-app/main/default/lwc/offeringHeader/*` (and/or `offeringWorkspace/*`)                                |

No new files are created under the lowest-scope assumptions.

---

## PROMPTS FOR SPECIALIST AGENTS (pending user answers to Q1/Q2)

### PROMPT FOR salesforce-admin

```
Project: DPEG (API 66.0, namespace "Unison", package dir force-app/main/default).
Do NOT deploy — create/modify metadata files only.

Task 1 — Compact Layout. Modify
force-app/main/default/objects/Offering__c/compactLayouts/Offering_Compact.compactLayout-meta.xml
to add three fields (Overbook_Cap__c, Total_Committed__c, Closing_Date__c) after the
existing Amount_Raised__c. Final field order:
Name, Offering_ID__c, Status__c, Target_Raise__c, Amount_Raised__c, Overbook_Cap__c,
Total_Committed__c, Closing_Date__c. Do NOT rename any field labels.

Task 2 — FlexiPage. Rebuild
force-app/main/default/flexipages/Offering_Record_Page.flexipage-meta.xml
as a native Offering__c RecordPage using template flexipage:recordHomeTemplateDesktop:
- header region: force:highlightsPanel (retain)
- main region: native Path component (flexipage:path) bound to Status__c, placed ABOVE the
  retained Unison:offeringWorkspace component
- sidebar region: force:relatedListContainer (retain)
Keep <sobjectType>Offering__c</sobjectType>. Do NOT re-expose or add the individual
offering tab components as separate regions — offeringWorkspace already contains the 8 tabs.
Follow the FlexiPage metadata skill and salesforce-api-context gates per .claude/rules.
```

### PROMPT FOR salesforce-developer

```
(Invoke ONLY if user answered Q1 = re-expose tabs and/or Q2 = remove duplicate header.)
Project: DPEG (API 66.0, namespace "Unison"). Do NOT deploy — modify files only.

Q1 (if chosen): set isExposed=true and add a lightning__RecordPage target with an
Offering__c objects targetConfig to each of: offeringHeader, offeringRoster,
offeringCommitments, offeringContributions, offeringDistributions, offeringSignatures,
offeringWaitlist, offeringWireMatching (.js-meta.xml files). No JS/HTML logic changes.

Q2 (if chosen): suppress the custom stage tracker + KPI tile row rendered by
offeringHeader inside offeringWorkspace so it does not duplicate the new native Path
and native Highlights Panel.

Add nothing beyond what is listed. No test classes (no Apex changed).
```

---

## SCOPE GUARDRAILS (what was NOT added)

- No field-label renames (request listed display labels but did not ask to change field labels).
- No new fields, validation rules, permission sets, or page layouts.
- No `Status__c` picklist edit (values already match).
- No changes to the `force:relatedListContainer` sidebar.
- No Apex, no tests, no deployment (deployment is a separate gated step via salesforce-devops).
