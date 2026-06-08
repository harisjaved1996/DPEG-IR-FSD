---
name: dpeg-phase-b-conventions
description: DPEG IR Phase B (LWC + Apex read layer) conventions — Unison namespace, imperative-DTO-first data access, pure-SVG charts. Verify against current org/prompt before relying.
metadata:
  type: project
---

DPEG IR Phase B builds the 10 IR screens on top of deployed Phase A. Conventions that recur across Phase B developer runs:

**Why:** these were directives in the Phase B kickoff and partly CONTRADICT Phase A docs — capturing avoids re-deriving and avoids carrying the stale "no namespace" assumption.

**How to apply** when designing/reviewing Phase B (and likely C/D) IR work:
- **Namespace flip:** the scratch org `DPEG-IR-FSD` is **`Unison`-namespaced**, even though Phase A `agent-output/design-requirements.md` and `CLAUDE.md` say "No namespace." Author ALL Apex/LWC and `@salesforce/apex/...` imports with **UNPREFIXED** names (resolve in-namespace). Verify the org's namespace before relying — it may differ per scratch def.
- **Data access:** favor **imperative `@AuraEnabled(cacheable=true)` controllers returning DTOs** for all data; keep LDS / `@salesforce/schema` usage minimal (avoids namespace import friction). One controller per screen; thin; calls selectors only.
- **Charts:** pure **SVG/CSS**, no 3rd-party libs (donut = stroke-dasharray, funnel = CSS trapezoids, stage tracker = ol+connectors).
- **Brand tokens:** navy `#032D60`, accent blue `#0070D2`, teal `#2BAFAC`; SLDS2 styling hooks for spacing/radius; SVG fills from a `lwc/utils` JS constants module (SVG can't reliably read CSS vars).
- **TestDataFactory gap:** Phase B Apex tests need NEW builders for objects the factory doesn't cover yet: `Property__c`, `Wire__c`, `Distribution_Batch__c`, `Subscription_Doc__c`, `IR_Document__c`, `Waitlist__c`, `Transfer_Document__c`, plus `Lead` IR fields + Investor→Contact→IEC→Account chain helpers.
- **Hosting gap:** Phase A built only 5 App-Page placeholders (IR_Dashboard, IR_Console, Active_Investments, IR_Onboarding, IR_Payments). Distributions/Share Transfers/Documents/Investors-list screens need 4 NEW App Pages + nav re-point (their Phase A nav items are object tabs).
- Full spec: `agent-output/phase-b-design.md`.

See also [[dpeg-ir-testdatafactory-contract]], [[dpeg-ir-conflicts-resolved]].
