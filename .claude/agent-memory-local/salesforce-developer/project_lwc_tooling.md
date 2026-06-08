---
name: project-lwc-tooling
description: Two latent LWC tooling bugs in this repo (Prettier corrupts LWC HTML bindings; jest sa11y global setup key is misspelled) and the conventions that work around them. Read before any LWC work.
metadata:
  type: project
---

Two latent tooling issues affect every LWC bundle in this repo. Both were hit and worked around during Phase B Run 1 (the shared presentational component library under `force-app/main/default/lwc/`).

## 1. Prettier corrupts LWC HTML templates — do NOT format `.html`
Running `prettier --write` on `lwc/**/*.html` (Prettier 3.2.5, `html` parser — even explicitly) quotes attribute bindings (`attr={expr}` → `attr="{expr}"`) and rewrites `on*` handlers into `"{ handler; }"`, which breaks the LWC compiler (`LWC1034: Ambiguous attribute value`).

**Why:** Prettier's html parser normalizes unquoted attribute values; LWC's unquoted `{binding}` syntax is collateral damage. The repo's `npm run prettier` glob AND the lint-staged precommit hook (`**/lwc/**/*.{js,html,css}` → `prettier --write`) both target LWC html.

**How to apply:** LWC `.html` is now excluded in `.prettierignore` (`force-app/main/default/lwc/**/*.html`), which Prettier honors even for explicitly-passed files, so both the CLI and the precommit hook are safe. Keep that exclusion. Hand-format templates (4-space indent). `.js`/`.css` in `lwc/` ARE Prettier-formatted normally — run `prettier --write` on those.

## 2. Jest sa11y global setup is dead — register the matcher per test file
`jest.config.js` uses `setupFilesAfterEach: ["@sa11y/jest/dist/setup"]`. `setupFilesAfterEach` is NOT a valid Jest option (the correct key is `setupFilesAfterEnv`), so Jest prints "Unknown option" and the global sa11y registration never runs — `toBeAccessible()` would be undefined.

**Why:** typo in the config key; also `@sa11y/jest/dist/setup` only exports `setup`/`registerSa11yMatcher` and does not auto-run on import.

**How to apply:** every LWC test registers the matcher itself (idempotent, works regardless of the global):
```js
import { registerSa11yMatcher } from '@sa11y/jest';
beforeAll(() => { registerSa11yMatcher(); });
// then: await expect(element).toBeAccessible();
```
This pattern is used across all Run-1 test files; copy it for future LWC tests. Fixing the config key to `setupFilesAfterEnv` is optional cleanup but not required given the per-test registration. Both findings were flagged to the user at end of Run 1.

## Established Run-1 conventions (reuse, don't reinvent)
- Shared pure JS modules: `c/irConstants` (brand hex, confidence thresholds, status/tier theme maps + pure resolvers) and `c/irFormatters` (currency/percent/number/abbrev/date/mask). Charts resolve `colorToken`→hex via `irConstants.colorForToken` because SVG can't read CSS vars reliably.
- Public boolean `@api` props MUST default to `false` (`LWC1099`); invert semantics if needed (e.g. `showCheckboxColumn=false` instead of `hideCheckboxColumn=true`).
- Presentational components are pure: `@api` props in, `CustomEvent` out, no Apex/wire/LDS. `isExposed=false` (no targets) for all child/presentational bundles and for the JS-only util modules.
- `key={...}` in a `for:each` must sit on the DIRECT child element/`<template>` of the loop (e.g. the `lightning-layout-item`), NOT on a nested custom element inside it — putting `key` on an inner `c-kpi-card` triggers `LWC1149` (key ignored). The LSP also flags `import { createElement } from "lwc"` in every `__tests__/*.test.js` with a bogus `LWC1702` error — it is a false positive (validates test files as component modules); all existing Run-1/2/3 tests import it the same way and pass. Ignore it.