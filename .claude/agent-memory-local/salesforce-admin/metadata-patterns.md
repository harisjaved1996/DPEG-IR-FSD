---
name: dpeg-metadata-patterns
description: Confirmed metadata patterns for DPEG project — tabs, flexipages, apps, permission sets
metadata:
  type: feedback
---

## Custom Tabs (sf-custom-tab)

Object tabs: only `<customObject>true</customObject>` + `<motif>`. No `<label>`, no `<sobjectName>`, nothing else.

Lightning Page Tabs (for App Pages/FlexiPages): use `<flexiPage>DeveloperName</flexiPage>` + `<motif>`. No `<customObject>` element. File name = FlexiPage developer name (no suffix).

**Why:** Object tabs and Lightning Page tabs have different required elements. Mixing them causes deploy errors.

**How to apply:** Custom object tab = `<customObject>true</customObject>` + `<motif>`. Lightning Page tab = `<flexiPage>Name</flexiPage>` + `<motif>`.

## FlexiPages (sf-flexipage)

Use `sf template generate flexipage --name <Name> --template AppPage --output-dir force-app/main/default/flexipages` to bootstrap. The CLI exits with code 1 due to beta warning but the file IS created.

For placeholder App Pages: use `flexipage:defaultAppHomeTemplate` (NOT `flexipage:appHomeTemplatePage` — that template does not exist and causes deploy error). Place the richText component in the region named `main`.

**Why:** `flexipage:appHomeTemplatePage` is not a valid template name in the platform. The valid name is `flexipage:defaultAppHomeTemplate`. Alternative: `flexipage:appHomeWithStandardSidebarTemplate`.

## Custom Application (sf-custom-application)

App Page FlexiPages referenced in `<tabs>` by developer name only (e.g., `IR_Dashboard`). Object tabs by API name with `__c` suffix.

File: `force-app/main/default/applications/<AppName>.app-meta.xml`

`<brand>` with `<headerColor>` required for professional identity.

## Permission Sets (sf-permission-set)

Tab settings for App Page FlexiPages use the FlexiPage developer name (no suffix): `<tab>IR_Dashboard</tab>`.
Tab settings for custom object tabs use the object API name with `__c`: `<tab>Offering__c</tab>`.
App visibility: `<application>Investor_Relations</application>` (matches the app file `fullName`/file name).

**Why:** The platform resolves App Page tabs by FlexiPage name in perm sets.
