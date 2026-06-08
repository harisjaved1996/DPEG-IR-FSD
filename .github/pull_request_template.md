# Pull Request

> **Title must follow:** `type(scope): description` (5+ chars)
> Allowed types: `feat` `fix` `hotfix` `chore` `docs` `refactor` `test` `style` `perf` `ci` `build` `revert`
> Example: `feat(acquisitions): Add lead-to-opportunity conversion service`

## Summary

<!-- 1–3 sentences on what changed and why. Link the ticket/issue. -->

## Type of Change

- [ ] `feat` — New feature
- [ ] `fix` — Bug fix
- [ ] `hotfix` — Emergency production fix
- [ ] `chore` — Maintenance, dependencies, config
- [ ] `docs` — Documentation only
- [ ] `refactor` — Code refactor (no functional change)
- [ ] `test` — Test coverage improvement
- [ ] `ci` — CI/CD pipeline change

## Salesforce Components Changed

| Component | Metadata Type | Action (Added / Modified / Deleted) |
| --------- | ------------- | ----------------------------------- |
|           |               |                                     |

## Scope

- [ ] Admin / declarative (objects, fields, flows, permission sets)
- [ ] Apex (classes, triggers, tests)
- [ ] LWC
- [ ] Integration (callouts, named credentials, platform events)
- [ ] Tooling / CI / docs only

## Destructive Changes

- [ ] No destructive changes (no metadata files removed)
- [ ] Yes — destructive changes present

<!-- If yes, explain what was removed, why it's safe to delete, and confirm it has been tested: -->

## Checklist

- [ ] PR title follows `type(scope): description` convention
- [ ] `ARCHITECTURE.md` updated if new conventions introduced
- [ ] `with sharing` on all new service/selector/domain classes
- [ ] SOQL uses `WITH USER_MODE` (or justified in class header comment)
- [ ] Trigger logic in handler class — trigger file is thin
- [ ] Test data via `TestDataFactory` — no `SeeAllData=true`
- [ ] 90%+ coverage per new/modified Apex class
- [ ] Bulk-safe methods tested with 251+ records where applicable
- [ ] `AuraHandledException` used at all LWC boundaries
- [ ] SLDS 2 tokens used in LWC styling (no hardcoded colours/spacing)
- [ ] No hardcoded credentials, IDs, or org-specific values in code
- [ ] `npm run prettier:check` passes locally
- [ ] `npm run lint` passes locally
- [ ] `npm run test:unit` passes locally

## Deployment Notes

<!-- Any post-deploy manual steps?
     - Named Credential to configure?
     - Custom Setting / Custom Metadata record to insert?
     - Permission Set to assign?
     - Feature flag to toggle?
     - Data migration required?
     - Dependent PR or metadata that must deploy first? -->

## Screenshots / Evidence

<!-- Optional. For UI changes, Flow screenshots, or test coverage reports. -->
