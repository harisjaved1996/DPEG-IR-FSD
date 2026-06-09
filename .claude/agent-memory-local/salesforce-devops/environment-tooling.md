# Environment & Tooling

## Default target org
- Alias: `DPEG-IR-FSD` (from `.sf/config.json` -> `target-org`).
- Org ID: `00DFW000csUtXOK2A3`. Has `.sf/orgs/<id>/localSourceTracking` -> source tracking active, consistent with a **scratch org** (treat as non-production).
- Project API version: `66.0` (`sfdx-project.json` -> `sourceApiVersion`). LWC bundles in repo use `<apiVersion>66.0</apiVersion>`.

## Tooling availability constraint (IMPORTANT)
- In at least one session, the salesforce-devops agent was invoked with ONLY file tools (Read/Write/Edit/Glob/Grep) — **no Salesforce MCP deploy tool and no Bash/CLI execution tool** were exposed.
- Consequence: could complete all pre-deployment validation (org check, component discovery, metadata sanity) but **could not execute the deployment**.
- How to apply: before promising a deploy, confirm a deployment-capable tool is actually present. If not, do the full pre-flight, present the confirmation gate, and clearly report that execution is blocked on missing tooling — provide the ready-to-run `sf project deploy start --source-dir ... --target-org DPEG-IR-FSD` command so a human can run it.

## Verify before recommending
- These facts are point-in-time. Re-check `.sf/config.json` for the current `target-org` and confirm the org is still a scratch/sandbox before any production-style warnings are skipped.
