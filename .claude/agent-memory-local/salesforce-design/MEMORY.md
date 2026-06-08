# salesforce-design — local memory index

- [DPEG IR TestDataFactory contract](dpeg-ir-testdatafactory-contract.md) — Auto-Number-vs-Text Name rule, mandatory picklist literals, fixed MD/Lookup relationships the IR schema must obey.
- [DPEG IR conflicts resolved](dpeg-ir-conflicts-resolved.md) — recurring mockup/prompt/factory ambiguities + recommended resolutions (CONT- prefix, ACH status values, auto-number seed IDs, junction modeling).
- [DPEG Phase B conventions](dpeg-phase-b-conventions.md) — Unison namespace (flips Phase A "no namespace"), imperative-DTO-first controllers, pure-SVG charts, TestDataFactory + App-Page gaps.
- [Offering Workspace LWC structure](offering-workspace-lwc-structure.md) — only offeringWorkspace is FlexiPage-exposed; its 8 tab children are private/not placeable standalone; custom header duplicates native Path+Highlights.

Notes:
- Repo also ships seed design memory at `.claude/agent-memory/salesforce-design/project-context.md` (business domain, vocabulary, conversion chain) and admin memory at `.claude/agent-memory/salesforce-admin/dpeg-objects.md` (OWD, FLS, profiles). Read both before IR work.
- IR build is phased: A = data model + app shell + seed; B = LWC screens; C = Apex/Flows/approvals; D = test hardening; E (deferred) = Experience Cloud portal.
