# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DPEG** is a Salesforce DX project targeting API version 63.0 (Spring '25) on Developer Edition scratch orgs. All metadata lives under `force-app/main/default/` in source format.

## Common Commands

### Org Authentication & Scratch Orgs
```bash
# Authenticate to a Dev Hub
sf org login web --set-default-dev-hub --alias DevHub

# Create a scratch org
sf org create scratch --definition-file config/project-scratch-def.json --alias DPEG-dev --duration-days 30 --set-default

# Open the scratch org
sf org open
```

### Deploy & Retrieve
```bash
# Push local changes to scratch org
sf project deploy start

# Pull changes from scratch org
sf project retrieve start

# Deploy to a sandbox/production org
sf project deploy start --target-org <alias>

# Validate (check-only) deploy
sf project deploy validate --target-org <alias>
```

### Apex
```bash
# Run all Apex tests
sf apex run test --test-level RunLocalTests --result-format human --output-dir test-results

# Run a single test class
sf apex run test --class-names MyClassName --result-format human

# Execute anonymous Apex
sf apex run --file scripts/apex/hello.apex
```

### Source & Metadata
```bash
# Retrieve specific metadata from org
sf project retrieve start --metadata ApexClass:MyClass

# Generate Apex class
sf apex generate class --name MyClass --output-dir force-app/main/default/classes

# Generate LWC component
sf lightning generate component --name myComponent --type lwc --output-dir force-app/main/default/lwc
```

## Project Structure

```
force-app/main/default/
├── classes/          # Apex classes (.cls + .cls-meta.xml)
├── triggers/         # Apex triggers (.trigger + .trigger-meta.xml)
├── lwc/              # Lightning Web Components (folder per component)
├── aura/             # Aura components (folder per component)
├── objects/          # Custom objects (folder per object, subfolders for fields/etc.)
├── flows/            # Flows (.flow-meta.xml)
├── permissionsets/   # Permission sets (.permissionset-meta.xml)
├── layouts/          # Page layouts (.layout-meta.xml)
├── staticresources/  # Static resources (.resource + .resource-meta.xml)
└── tabs/             # Custom tabs (.tab-meta.xml)
config/
└── project-scratch-def.json   # Scratch org shape (Developer Edition, API 63.0)
```

## Metadata Conventions

- Every source file requires a paired `-meta.xml` file with `apiVersion` set to `63.0`.
- Object folder structure: `objects/<ObjectName__c>/fields/`, `objects/<ObjectName__c>/validationRules/`, etc.
- LWC components: each lives in its own folder under `lwc/<componentName>/` with `.html`, `.js`, `.js-meta.xml`.

## Key Configuration

- **API Version**: 63.0 (Spring '25)
- **Package directory**: `force-app` (default)
- **Namespace**: none (unlocked package or org-dependent)
- **Scratch org edition**: Developer
