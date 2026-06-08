# DPEG

Salesforce DX project.

- **Source API:** see `sfdx-project.json` → `sourceApiVersion`
- **Package directory:** `force-app/main/default`
- **Architecture:** see [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Agent orchestration rules** (for Claude Code): see [`CLAUDE.md`](./CLAUDE.md)

---

## Quick start

```bash
# 1. Install the Salesforce CLI
#    https://developer.salesforce.com/tools/sfdxcli

# 2. Install Node dependencies (Prettier, ESLint, Jest)
npm install

# 3. Authenticate to an org (DevHub or sandbox)
sf org login web --alias dpeg-dev
sf config set target-org dpeg-dev

# 4. (Optional) Create a scratch org
sf org create scratch --definition-file config/project-scratch-def.json --alias dpeg-scratch --duration-days 7 --set-default

# 5. Deploy source to the org
sf project deploy start --source-dir force-app

# 6. Run all local Apex tests
sf apex run test --test-level RunLocalTests --wait 10 --code-coverage --result-format human

# 7. Open the org
sf org open
```

## Common commands

```bash
# Deploy a single class
sf project deploy start --source-dir force-app/main/default/classes/MyClass.cls

# Run one test class
sf apex run test --class-names MyClassTest --wait 10 --result-format human

# Retrieve a metadata type from the org
sf project retrieve start --source-dir force-app/main/default/objects

# Anonymous Apex
sf apex run --file scripts/apex/hello.apex

# LWC unit tests
npm run test:unit

# Lint + format
npm run lint
npm run prettier
```

## Project layout

```
force-app/main/default/   ← all deployable metadata
  classes/                ← Apex (with TestDataFactory.cls)
  triggers/               ← thin triggers → handler classes
  lwc/                    ← Lightning Web Components
  objects/                ← custom objects + fields
  flows/                  ← flows
  permissionsets/         ← permission sets
config/                   ← scratch org definition
manifest/                 ← package.xml for partial deploys
scripts/apex/             ← anonymous Apex snippets
docs/                     ← generated docs (from salesforce-documentation agent)
.github/                  ← PR template, CI workflows
.claude/                  ← agents, skills, rules, slash commands
ARCHITECTURE.md           ← domain + Apex + OmniStudio + LWC conventions
CLAUDE.md                 ← Claude agent orchestration rules
```

## Working with Claude Code

The project uses a 7-agent workflow: **design → admin → developer → unit-testing → code-review → devops + documentation**. See `CLAUDE.md` for the full orchestration contract and `.claude/agents/` for individual agent definitions.

Custom slash commands live in `.claude/commands/`. Skill-based metadata generation lives in `.claude/skills/`.

## Standards

- `with sharing` + `WITH USER_MODE` SOQL on every service/selector
- Handler pattern for triggers
- All test data via `force-app/main/default/classes/TestDataFactory.cls` — never `SeeAllData=true`
- 90%+ Apex coverage per class
- SLDS 2 tokens for LWC styling
- Named Credentials (not hardcoded endpoints) for callouts

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full set.
