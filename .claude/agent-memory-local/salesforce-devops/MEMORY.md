# Salesforce DevOps — Memory Index

- [Environment & tooling](environment-tooling.md) — default org alias, scratch org ID, and the MCP/CLI tooling availability constraint observed in this workspace.

## Deployment errors & fixes
- **LWC1116 "Illegal folder name ... must start with a lowercase character"**: LWC bundle folder name AND its 4 file basenames must be camelCase (start lowercase). PascalCase folders like `ReportsDocCom` fail. Fix: rename folder + all files to `reportsDocCom` (the JS `export default class` name may stay PascalCase). On Windows (case-insensitive FS) a case-only rename needs a temp two-step: `X -> X_tmp -> reportsDocCom`. Before renaming an LWC, grep for references (`c-<kebab-name>`, bundle name) to avoid breaking FlexiPages/parent components.
- `deploy_metadata` is atomic (`rollbackOnError:true`): one component error rolls back the whole batch even if `componentSuccesses` lists others. Read `componentFailures` for the real cause; a partial `numberComponentsDeployed` does NOT mean those persisted.

## Production guard
- Detect via `list_all_orgs`: scratch = `isScratchOrg:true` (safe). Production = `isSandbox:false isScratchOrg:false isDevHub:false` + a real (non-scratch) my.salesforce.com URL -> STOP and require explicit confirmation.
