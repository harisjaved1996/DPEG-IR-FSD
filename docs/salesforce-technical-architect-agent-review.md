# Agent Review: salesforce-technical-architect.md

**File:** `.claude/agents/salesforce-technical-architect.md`
**Reviewed:** 2026-04-21 (updated after skills refresh)
**Reviewer:** Claude Code (Sonnet 4.6)

---

## What's Good

- Clear 6-area responsibility breakdown (Apex, Integration, Data, LWC, Performance, Deployment)
- Solid implementation workflow: Research → Explore → Design → Implement → Test → Validate
- `opus` model + `acceptEdits` permission mode appropriate for hands-on implementation work
- `disallowedTools: Task` correctly prevents sub-agent spawning — TA stays focused on implementation
- `sf-integration`, `sf-connected-apps`, `sf-data`, `sf-soql`, `sf-debug`, `sf-deploy`, `sf-lwc` all confirmed valid and available

---

## Issues & Gaps

### 1. One Wrong Skill Name (`sf-apex` Does Not Exist)

After skills refresh, most skills in the agent are now valid — except one:

| Agent References | Status | Fix |
|---|---|---|
| `sf-apex` | ❌ Does not exist | Replace with `sf-apex` |
| `sf-integration` | ✅ Valid | — |
| `sf-connected-apps` | ✅ Valid | — |
| `sf-data` | ✅ Valid | — |
| `sf-soql` | ✅ Valid | — |
| `sf-debug` | ✅ Valid | — |
| `sf-deploy` | ✅ Valid | — |
| `sf-lwc` | ✅ Valid | — |

**Additional skills that should be added (available but missing from agent):**

| Skill | Why It Should Be Added |
|---|---|
| `sf-apex` | Replaces invalid `sf-apex`; primary Apex authoring skill |
| `sf-apex-test` | Test class generation with TestDataFactory patterns + bulk testing |
| `sf-metadata` | Metadata generation and querying — needed for object/field work |
| `sf-docs` | Official Salesforce documentation retrieval |
| `sf-testing` | Apex test execution, coverage analysis, and test-fix loops |
| `sf-flow` | Flow creation and validation — TA may need to build invocable methods consumed by flows |

---

### 2. No DPEG Project Architecture Context

The agent has zero awareness of this project's mandatory patterns defined in `ARCHITECTURE.md`. It should explicitly enforce:

| Rule | Source |
|---|---|
| `with sharing` on every class | ARCHITECTURE.md §2 — Non-Negotiable |
| `WITH USER_MODE` in all SOQL | ARCHITECTURE.md §2 (API 66.0 requirement) |
| Service / Selector / Domain / Trigger-handler layering | ARCHITECTURE.md §2 |
| `TestDataFactory` for all test data — never `@isTest(SeeAllData=true)` | ARCHITECTURE.md §2 |
| 90%+ coverage target per class | ARCHITECTURE.md §2 |
| `AuraHandledException` for all `@AuraEnabled` LWC controller methods | ARCHITECTURE.md §7 |
| No SOQL/DML inside loops | ARCHITECTURE.md §2 |
| All SOQL in Selector classes only — never inline in Service or Domain | ARCHITECTURE.md §2 |
| Bulk methods only — accept `List<SObject>`, never single records | ARCHITECTURE.md §2 |
| All callouts via `PlaidCalloutService` wrapping ASB — never direct to Plaid/Yardi | ARCHITECTURE.md §4 |
| Named Credential points to ASB only — never to external systems directly | ARCHITECTURE.md §4.8 |

Currently the agent only says *"follow SOLID principles and bulkification patterns"* — too vague and does not enforce DPEG-specific conventions.

---

### 3. No Reference to Global Metadata Rule

The agent does not reference `.claude/rules/salesforce-global-rule.md`, which enforces the mandatory:

```
skill load → API context → file generation
```

gating sequence for ALL Salesforce metadata work. Any TA generating metadata files without this awareness will violate the project's generation discipline.

---

### 4. Name Mismatch (Frontmatter vs Filename)

- **Frontmatter `name`:** `ps-technical-architect`
- **Filename:** `salesforce-technical-architect.md`

These are inconsistent. The `name` field is what the system uses to identify and invoke the agent. Pick one convention and align both.

---

### 5. `maxTurns: 25` Is Too Low

Complex TA tasks in this project can easily exceed 25 turns:

- Plaid callout service with ASB integration + Named Credential setup
- Share Transfer service (Conversion 9) — multi-object, approval process, cost basis logic
- Full LWC component with Jest tests and SLDS 2 uplift
- Bulk distribution batch with Plaid Transfer API wiring

**Recommendation:** Increase to **40 turns**.

---

### 6. Deployment Responsibility Conflict

The agent includes a dedicated "Deployment" section:

> *Deploy implementation work using `sf project deploy start`. Run tests as part of deployment validation. Use `sf-deploy` skill for deployment automation.*

This directly conflicts with `CLAUDE.md` which states:

> *"All deployment to org must go through the **salesforce-devops** subagent (uses Salesforce MCP), not direct CLI calls from the main agent."*

The TA should **not** own deployment to the org. This section should be **removed** or narrowed to **local validation only** (e.g., running tests locally before handing off to the devops agent).

---

## Summary of Recommended Changes

| # | Change | Priority | Status |
|---|---|---|---|
| 1 | Replace `sf-apex` with `sf-apex` in frontmatter | High | Pending |
| 2 | Add missing skills: `sf-apex-test`, `sf-metadata`, `sf-docs`, `sf-testing`, `sf-flow` | High | Pending |
| 3 | Add DPEG-specific coding standards (sharing, SOQL mode, layering, TDF, coverage, callout rules) | High | Pending |
| 4 | Add reference to `.claude/rules/salesforce-global-rule.md` | High | Pending |
| 5 | Remove or narrow Deployment section — avoid conflict with devops agent | High | Pending |
| 6 | Align `name` frontmatter with filename convention | Medium | Pending |
| 7 | Increase `maxTurns` from 25 to 40 | Medium | Pending |
| 8 | Add DPEG integration context (ASB hub-and-spoke, Named Credential policy) | Low | Pending |

---

## Decision

Review the above and confirm which changes to apply. Once approved, the agent file can be updated accordingly.
