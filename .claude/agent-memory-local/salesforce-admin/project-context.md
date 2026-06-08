---
name: dpeg-project-context
description: DPEG IR Phase A project context — org, API version, key decisions made during Phase A admin work
metadata:
  type: project
---

DPEG Investor Relations Phase A — metadata-only build targeting scratch org `DPEG-IR-FSD`, API 66.0.

**Why:** Build the data model + app shell so Phase B LWC/Apex work has a target org.

**How to apply:** All metadata must use API 66.0. No namespace. Objects/fields use PascalCase with `__c` suffix per ARCHITECTURE.md.

Key Phase A decisions:
- 16 custom objects created by solution-architect agent; tabs/app/flexipages/listviews/perm-set visibility built by admin agent
- App nav uses `Standard` navType (not Console) — Phase A only
- 5 FlexiPages are placeholder AppPages with richText; Phase B replaces with LWCs
- FlexiPage template used: `flexipage:appHomeTemplatePage` with single `main` region
- Permission-set tab entries for App Page FlexiPages use the FlexiPage developer name (no suffix) — e.g., `IR_Dashboard` not `IR_Dashboard__c`
- Custom object tabs: only `<customObject>true</customObject>` + `<motif>` — no other elements
- App file lives at `force-app/main/default/applications/Investor_Relations.app-meta.xml`
- List views use `filterScope=Everything` and omit `sharedTo` for public visibility
- Boolean list view filter value: `0` = false, `1` = true
- Formula fields (KYC_Status__c) can be filtered with `equals` in list views
