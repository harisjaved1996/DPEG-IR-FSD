---
name: offering-workspace-lwc-structure
description: Offering__c record-page LWC structure — only offeringWorkspace is FlexiPage-exposed; its 8 tab components are private children, not placeable standalone. Relevant to any Offering page redesign.
metadata:
  type: project
---

`Offering__c` record page LWC layout (verified 2026-06-08 by reading js-meta.xml of all 10 bundles).

**Fact:** Only `offeringWorkspace` is exposed (`isExposed=true`, `lightning__RecordPage` target, object `Offering__c`). It internally renders `offeringHeader` plus an 8-tab tabset (`offeringRoster, offeringCommitments, offeringContributions, offeringDistributions, offeringSignatures, offeringWaitlist, offeringWireMatching` + roster). All 8 children are `isExposed=false` with NO record-page target — they CANNOT be dropped onto a FlexiPage individually without first re-exposing each bundle.

`offeringHeader` already renders a custom 8-stage stageTracker + 6-tile KPI row (Target, Amount Raised, Raised %, Overbook Cap, Committed Investors, Closing Date) — this DUPLICATES a native Path + native Highlights Panel if both are added to the same page.

**Why:** A 2026-06-08 request to convert the Offering page to native (highlights panel + native Path on `Status__c` + retain tabs) listed all 9 components as if individually placeable. They are not — surfaced this conflict before any agent ran.

**How to apply:** Any future "retain/rearrange the Offering tabs on the FlexiPage" request must first decide: keep them bundled inside `offeringWorkspace` (config-only, drop one component) vs. re-expose all 8 child bundles (dev work: set `isExposed=true` + add `lightning__RecordPage`/`Offering__c` targetConfig to each). Also flag duplicate-display risk between the custom `offeringHeader` and any native Path/Highlights Panel. `Status__c` picklist already has the 8 path stages (Draft → Closed Funded) so native Path needs no field change.

See also [[dpeg-phase-b-conventions]] (Unison namespace, imperative-DTO controllers).
