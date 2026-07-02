═══════════════════════════════════════════════════════════════════════════════
📋 DESIGN REQUIREMENTS
Option 2 — In-Wizard Visual PDF Tagger (positional DocuSign tabs)
═══════════════════════════════════════════════════════════════════════════════

🎯 WHAT USER REQUESTED
Replace the current anchor-text "Prepare" step of the WORKING 4-step DocuSign send
wizard with a visual PDF tagger: render the selected master PDF in-browser, let the
user drag Signature / Full Name / Date Signed fields onto rendered pages, capture
field type + page number + position/size per placement, and on Send convert those
captured coordinates into `dfsle.Tab.Position(...)` tabs fed through the existing
per-recipient fan-out. Everything else (fan-out, recipient auto-select, Add Recipient,
document selection/upload, send engine) is unchanged.

───────────────────────────────────────────────────────────────────────────────

## 1. Summary

───────────────────────────────────────────────────────────────────────────────

We swap ONLY the Prepare step's UI and the tab-building path in `DocuSignBulkSendService`.
A new presentational LWC (`docuSignVisualTagger`) renders the selected master PDF with
Mozilla **PDF.js** (delivered as a Static Resource, loaded via
`lightning/platformResourceLoader`), overlays an absolutely-positioned drag layer per
page, and emits placed-field records (type, page, x/y/w/h in DocuSign points) to the host.
The host (`docuSignSendWizard`) keeps its existing `tabDefinitions` array but now populates
it with positional fields and includes them in the SAME JSON-string send payload. Apex adds
a **positional branch** to `DocuSignBulkSendService.buildTabs` that builds
`dfsle.Tab.Position(documentSequence, pageNumber, x, y, width, height)` tabs (real signature,
confirmed in `docs/docusign-apex-toolkit-api.md` line 271) attached via `tab.withPosition(...)`.
`TabDefinition` gains positional fields plus a `mode` flag so the anchor path stays intact for
backward compatibility. PDF bytes reach the browser through a NEW cacheable `@AuraEnabled`
selector-backed method returning base64 of the latest `ContentVersion.VersionData`. The single
hard risk is the DocuSign coordinate **unit** — the toolkit `Position` constructor takes `Integer`
args but the doc does not state the unit (points vs pixels); §10 defines an empirical calibration
test to lock it before go-live.

───────────────────────────────────────────────────────────────────────────────

## 2. Files to CREATE

───────────────────────────────────────────────────────────────────────────────

**LWC — new visual tagger (replaces docuSignPrepareStep as the Prepare UI)**

- `force-app/main/default/lwc/docuSignVisualTagger/docuSignVisualTagger.js`
  Feature-ish presentational component: loads PDF.js, renders pages to canvas, hosts the
  drag/drop overlay, owns per-field placement state, emits `fieldschange` to the host.
- `force-app/main/default/lwc/docuSignVisualTagger/docuSignVisualTagger.html`
  Palette (Signature / Full Name / Date Signed) + scrollable page stack with an overlay layer.
- `force-app/main/default/lwc/docuSignVisualTagger/docuSignVisualTagger.css`
  SLDS 2 design-token styling for palette chips, page frame, placed-field boxes, drag ghost.
- `force-app/main/default/lwc/docuSignVisualTagger/docuSignVisualTagger.js-meta.xml`
  `isExposed=false` (used only inside the wizard). API 66.0.
- `force-app/main/default/lwc/docuSignVisualTagger/__tests__/docuSignVisualTagger.test.js`
  Jest: palette renders, `loadScript` mocked, coordinate-mapping pure fn unit tests,
  `fieldschange` payload shape, `@sa11y/jest` a11y assertion.

**LWC — small presentational child for a single placed field (optional but recommended)**

- `force-app/main/default/lwc/docuSignPlacedField/docuSignPlacedField.js`
  Stateless: renders one placed field box (label + resize/remove handles), emits
  `fieldmove` / `fieldresize` / `fieldremove`. Props in, events out — no Apex.
- `force-app/main/default/lwc/docuSignPlacedField/docuSignPlacedField.html`
- `force-app/main/default/lwc/docuSignPlacedField/docuSignPlacedField.css`
- `force-app/main/default/lwc/docuSignPlacedField/docuSignPlacedField.js-meta.xml` (`isExposed=false`)
- `force-app/main/default/lwc/docuSignPlacedField/__tests__/docuSignPlacedField.test.js`

**Static resource — PDF.js library**

- `force-app/main/default/staticresources/pdfjs.resource-meta.xml`
  `contentType application/zip`, `cacheControl Public`.
- `force-app/main/default/staticresources/pdfjs/` (zipped by SFDX at deploy) containing
  `pdf.min.mjs` (or `pdf.min.js`) and `pdf.worker.min.mjs` — see §4 for exact layout.

**Apex — new byte-delivery method's selector query (added to existing selector, see §3) — no new class needed.**

> Note: **No new Apex class is created.** The byte-delivery method is added to the existing
> `DocuSignWizardController` (controller layer), backed by a NEW selector method in the existing
> `DocuSignDocumentSelector`. This respects the layering rule (SOQL in selector only).

───────────────────────────────────────────────────────────────────────────────

## 3. Files to MODIFY

───────────────────────────────────────────────────────────────────────────────

- `force-app/main/default/classes/DocuSignWizardDTO.cls`
  Extend `TabDefinition` with positional fields + `mode`. Keep existing anchor fields for
  backward compatibility. (Shape in §7.)

- `force-app/main/default/classes/DocuSignBulkSendService.cls`
  In `buildTabs`, branch on `definition.mode`:
  - `mode == 'position'` → build `dfsle.Tab.Position(...)` and attach with `tab.withPosition(pos)`.
  - `mode == 'anchor'` (or null/legacy) → existing `tab.withAnchor(buildAnchor(...))` path.
    Add a `buildPosition(TabDefinition)` helper and a `toTab(...)` reuse. The `sendOne`/fan-out
    path is UNTOUCHED — it already calls `buildTabs(request.tabs)` and `signer.withTabs(tabs)`. (§8.)

- `force-app/main/default/classes/DocuSignDocumentSelector.cls`
  Add `selectVersionDataByDocumentId(Id contentDocumentId)` — latest `ContentVersion`
  (`Id, VersionData, ContentSize, FileExtension, Title`, `IsLatest = TRUE`) `WITH USER_MODE`,
  for the byte-delivery method. (§5.)

- `force-app/main/default/classes/DocuSignWizardController.cls`
  Add `@AuraEnabled(cacheable=true) getDocumentContent(Id contentDocumentId)` returning a small
  DTO `{ base64; fileExtension; contentSize; title }`. Cacheable is legal here (SOQL only, no dfsle).
  Add a heap-safe guard (reject/So-flag files over a configured byte ceiling — see §5/§10). (§5.)

- `force-app/main/default/lwc/docuSignSendWizard/docuSignSendWizard.js`
  - `defaultTabDefinitions()` no longer seeds anchor strings for positional mode; instead the
    Prepare step starts EMPTY (user places fields) OR seeds one default Signature at page 1
    (product choice — default to EMPTY, user must place at least one signature to proceed).
  - Compute the "master document" to render: the FIRST selected `contentDocumentId`
    (`Array.from(this.selectedDocumentsByUid.values())[0].contentDocumentId`). Templates carry
    their own tabs, so the tagger applies to the selected master FILE.
  - `handleTabsChange` (rename to `handleFieldsChange`) stores the positional field list.
  - In `handleSend`, map each placed field to a positional `TabDefinition`
    (`mode:'position', type, documentSequence, pageNumber, x, y, width, height`) instead of the
    anchor mapping. Keep the JSON-string send pattern unchanged. (§9.)
  - Gate `nextDisabled` on the Prepare step: require ≥1 placed Signature field before Send.

- `force-app/main/default/lwc/docuSignSendWizard/docuSignSendWizard.html`
  Replace `<c-docu-sign-prepare-step ...>` with `<c-docu-sign-visual-tagger ...>` passing
  `content-document-id`, existing `field-definitions`, and `onfieldschange`.

- **DELETE / RETIRE** `force-app/main/default/lwc/docuSignPrepareStep/**`
  Removed from the wizard. Delete the bundle (and its `__tests__`) OR keep it unreferenced.
  Recommended: delete to avoid dead code. (DevOps step handles destructive deploy.)

───────────────────────────────────────────────────────────────────────────────

## 4. Static resource(s)

───────────────────────────────────────────────────────────────────────────────

**Name:** `pdfjs`

**Contents (zip):** Mozilla PDF.js prebuilt (pin a specific version, e.g. pdf.js v4.x legacy build
for broadest engine compatibility inside LWS). Layout inside the resource root:

```
pdfjs/
  pdf.min.mjs            (or pdf.min.js — the main library)
  pdf.worker.min.mjs     (or pdf.worker.min.js — the worker)
```

`pdfjs.resource-meta.xml`: `<contentType>application/zip</contentType>`, `<cacheControl>Public</cacheControl>`.

**How loaded (LWS/Locker-safe):**

```js
import { loadScript } from "lightning/platformResourceLoader";
import PDFJS from "@salesforce/resourceUrl/pdfjs";
// in renderedCallback (guard with a loaded flag so it runs once):
await loadScript(this, PDFJS + "/pdf.min.js"); // exposes window.pdfjsLib
const pdfjsLib = window.pdfjsLib;
```

**Worker configuration (the LWS pitfall):**
PDF.js needs a Web Worker. In a locked-down Lightning/LWS context you CANNOT let PDF.js fetch the
worker from an arbitrary/CDN URL. Two supported options, in priority order:

1. **Point the worker at the static-resource URL** (preferred):

   ```js
   pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "/pdf.worker.min.js";
   ```

   This is a same-CSP static-resource URL, allowed by LWS.

2. **Fallback — disable the worker (main-thread rendering):**
   If the worker fails to load (worker construction blocked, or a `SecurityError`/CSP violation
   is thrown), catch it and set:
   ```js
   pdfjsLib.GlobalWorkerOptions.workerSrc = ""; // or workerPort = null
   // pdfjsLib.disableWorker = true; (version-dependent)
   ```
   Rendering then runs on the main thread — slower for large PDFs but functional. Surface a
   non-blocking toast ("Preview running in compatibility mode") so the user knows.

**Fallback if PDF.js cannot load at all:** if `loadScript` rejects, the tagger shows an inline
error state with a "Reload preview" action and DISABLES the Next→Send gate (so a user can't send
un-tagged). Do NOT silently fall back to anchor mode — that would send envelopes with no fields.

───────────────────────────────────────────────────────────────────────────────

## 5. PDF bytes delivery

───────────────────────────────────────────────────────────────────────────────

**Chosen approach:** a NEW cacheable `@AuraEnabled` Apex method returning **base64 of the latest
`ContentVersion.VersionData`** for the selected master `ContentDocumentId`, with a heap guard.

**Why this over `/sfc/servlet.shepherd/version/download/<ContentVersionId>`:**

- The Shepherd download URL requires the LWC to first know the ContentVersion Id and then `fetch()`
  it. Inside LWS a same-origin `fetch` to `/sfc/...` can work, but it is fragile across Experience
  Cloud vs internal contexts and adds a CSP/session dependency. The wizard already runs entirely on
  imperative Apex (see `docuSignSendWizard.js` header) — a base64 Apex method is consistent with the
  existing architecture, respects `WITH USER_MODE` sharing, and needs no extra CSP trusted site.
- PDF.js accepts bytes directly: `pdfjsLib.getDocument({ data: uint8Array })`. Base64 → `Uint8Array`
  in JS (atob → typed array) feeds `getDocument` with no network round-trip beyond the Apex call.

**Governor / heap caveat (call this out to the developer):**

- Apex heap limit is **6 MB synchronous / 12 MB async**. Base64 inflates bytes ~1.33×. A raw 4 MB
  PDF → ~5.3 MB base64 string, close to the sync ceiling. **Reject/guard files above a byte ceiling**
  (recommend a `MAX_PREVIEW_BYTES` constant ≈ 3.5 MB of raw `ContentSize`); above it, return a DTO
  flag `tooLarge=true` and the tagger shows "This document is too large to preview; use anchor text
  or split the file." (The anchor Prepare step can be retained as a hidden fallback for this case if
  product wants — otherwise block.)
- Query `ContentSize` FIRST (cheap) and short-circuit before selecting `VersionData` to avoid loading
  a huge blob into heap just to reject it.

**Apex signatures:**

Controller (add to `DocuSignWizardController`):

```apex
@AuraEnabled(cacheable=true)
public static DocuSignWizardDTO.DocumentContent getDocumentContent(Id contentDocumentId) {
    // 1. ContactSelector-style guard; 2. size pre-check via selector; 3. base64 encode VersionData.
    // Throws AuraHandledException on error (user-safe). SOQL only → cacheable legal.
}
```

Selector (add to `DocuSignDocumentSelector`):

```apex
public static ContentVersion selectVersionDataByDocumentId(Id contentDocumentId) {
    // SELECT Id, Title, FileExtension, ContentSize, VersionData
    // FROM ContentVersion
    // WHERE ContentDocumentId = :contentDocumentId AND IsLatest = TRUE
    // WITH USER_MODE  LIMIT 1
}
```

New DTO (add to `DocuSignWizardDTO`):

```apex
public class DocumentContent {
  @AuraEnabled
  public String base64 { get; set; } // EncodingUtil.base64Encode(VersionData)
  @AuraEnabled
  public String fileExtension { get; set; }
  @AuraEnabled
  public Long contentSize { get; set; }
  @AuraEnabled
  public String title { get; set; }
  @AuraEnabled
  public Boolean tooLarge { get; set; } // true when > MAX_PREVIEW_BYTES
}
```

> Layer compliance: SOQL lives in `DocuSignDocumentSelector` (`WITH USER_MODE`); the controller is a
> thin wrapper that encodes + wraps errors as `AuraHandledException`. Matches ARCHITECTURE.md §2.

───────────────────────────────────────────────────────────────────────────────

## 6. Coordinate mapping (CRITICAL)

───────────────────────────────────────────────────────────────────────────────

**Goal:** translate a drop point in the rendered canvas (CSS pixels) into DocuSign `Tab.Position`
`x`/`y` in **PDF points**, with origin at the **TOP-LEFT of the page** (DocuSign's tab origin is the
page top-left; PDF.js user space origin is BOTTOM-left — the Y axis must be flipped relative to raw
PDF space, but because we render top-down and measure from the rendered canvas top, the mapping below
already yields a top-left origin).

**Definitions (per page):**

- `S` — PDF.js render scale passed to `page.getViewport({ scale: S })`. Choose a fixed `S`
  (e.g. `S = 1.5`) OR compute `S = targetCssWidthPx / pageWidthPts` to fit the container.
- `viewport = page.getViewport({ scale: S })` → `viewport.width`, `viewport.height` are in **device
  pixels at scale S** (i.e. `pageWidthPts * S`, `pageHeightPts * S`).
- `DPR = window.devicePixelRatio || 1`. We render the canvas backing store at `S * DPR` for crispness
  but set the canvas CSS size to `viewport.width` × `viewport.height` CSS px. **All drag math uses CSS
  px** (getBoundingClientRect returns CSS px), so DPR cancels out of the coordinate formula as long as
  the CSS size equals `viewport.width/height`. Keep DPR ONLY in the canvas backing store, never in the
  coordinate formula.
- `pageWidthPts = viewport.width / S`, `pageHeightPts = viewport.height / S` — the page size in points
  (1 pt = 1/72 inch; a US-Letter page is 612 × 792 pts).
- Drop point relative to the page's rendered top-left, in CSS px:
  `dropX_css = event.clientX - pageRect.left`
  `dropY_css = event.clientY - pageRect.top`
  where `pageRect = pageContainer.getBoundingClientRect()`.

**Formula (CSS px → PDF points, top-left origin):**

```
x_points = round( dropX_css / S )
y_points = round( dropY_css / S )
```

Because `viewport.width = pageWidthPts * S`, dividing a CSS-px offset by `S` yields points directly.
Since we measure `dropY_css` from the page TOP, `y_points` is already a top-left-origin Y — no
`pageHeightPts - y` flip is needed for the DocuSign tab (DocuSign x/y are offsets from page top-left).

**Anchor the field by its TOP-LEFT corner** (DocuSign positions tabs by the tab's top-left). If the UI
drags by the field's center, subtract half the field size first:

```
x_points = round( (dropX_css - fieldWidthPx/2)  / S )
y_points = round( (dropY_css - fieldHeightPx/2) / S )
```

**Default field width/height (in points):**
| Field type | width (pts) | height (pts) | Notes |
|--------------|-------------|--------------|-----------------------------------------|
| Signature | 108 | 24 | DocuSign default signature box ≈ 1.5"×0.33" |
| Full Name | 108 | 16 | text-height name field |
| Date Signed | 72 | 16 | short date field |

Store `width`/`height` in **points** on the placed field so Apex passes them straight to
`Tab.Position(width, height)`. If the user resizes, convert the resize handle's CSS-px delta to points
the same way (`Δpts = Δpx / S`).

**Clamp** every value to page bounds: `0 ≤ x ≤ pageWidthPts - width`, `0 ≤ y ≤ pageHeightPts - height`,
and ensure `Integer` (DocuSign `Position` constructor args are all `Integer` — doc line 271). Use
`Math.round` and cast; never pass fractional points.

**`documentSequence` and `pageNumber`:** `pageNumber` is the 1-based PDF.js page number the field was
dropped on. `documentSequence` is the 1-based ordinal of the master FILE within the envelope's document
list built by `buildDocuments` (§8) — if a template is also attached, files come AFTER the template, so
`documentSequence` must account for a leading template (see §8 note).

───────────────────────────────────────────────────────────────────────────────

## 7. DTO contract changes

───────────────────────────────────────────────────────────────────────────────

Extend `DocuSignWizardDTO.TabDefinition` (keep existing anchor fields for backward compatibility):

```apex
public class TabDefinition {
  /** 'SignHere' | 'FullName' | 'DateSigned' | 'Text' (unchanged). */
  @AuraEnabled
  public String type { get; set; }

  /** Placement mode: 'position' (visual tagger) or 'anchor' (legacy). Null → treat as 'anchor'. */
  @AuraEnabled
  public String mode { get; set; }

  // ── Positional fields (mode == 'position') ──
  /** 1-based document ordinal within the envelope's document list. */
  @AuraEnabled
  public Integer documentSequence { get; set; }
  /** 1-based page number the field was placed on. */
  @AuraEnabled
  public Integer pageNumber { get; set; }
  /** X offset from page top-left, in DocuSign points (Integer — Position ctor is Integer). */
  @AuraEnabled
  public Integer x { get; set; }
  /** Y offset from page top-left, in DocuSign points. */
  @AuraEnabled
  public Integer y { get; set; }
  /** Field width in points. */
  @AuraEnabled
  public Integer width { get; set; }
  /** Field height in points. */
  @AuraEnabled
  public Integer height { get; set; }

  // ── Anchor fields (mode == 'anchor', legacy — unchanged) ──
  @AuraEnabled
  public String anchorText { get; set; }
  @AuraEnabled
  public Boolean required { get; set; }
  @AuraEnabled
  public Integer xOffset { get; set; }
  @AuraEnabled
  public Integer yOffset { get; set; }

  public TabDefinition() {
    this.mode = 'anchor'; // default preserves legacy behavior for any existing caller
    this.required = true;
    this.xOffset = 0;
    this.yOffset = 0;
  }
}
```

> Types are all `Integer` to match `dfsle.Tab.Position(Integer, Integer, Integer, Integer, Integer,
Integer)` (doc line 271). JSON numbers deserialize into `Integer` cleanly for whole values.

───────────────────────────────────────────────────────────────────────────────

## 8. Apex service changes — `buildTabs` positional branch

───────────────────────────────────────────────────────────────────────────────

Modify `DocuSignBulkSendService.buildTabs` to branch on `mode`. Real signatures cited from
`docs/docusign-apex-toolkit-api.md`:

- `dfsle.Tab.Position(Integer documentSequence, Integer pageNumber, Integer x, Integer y, Integer width, Integer height)` — **line 271**.
- `dfsle.Tab withPosition(Position position)` — **line 230**.
- Concrete tab subtypes `dfsle.SignHereTab()`, `dfsle.FullNameTab()`, `dfsle.DateSignedTab()`,
  `dfsle.TextTab()` — **lines 318–355** (already used by `toTab`).
- `dfsle.Recipient.withTabs(List tabs)` — **line 195** (already used by `sendOne`, unchanged).

```apex
@TestVisible
private static List<dfsle.Tab> buildTabs(List<DocuSignWizardDTO.TabDefinition> definitions) {
    List<dfsle.Tab> tabs = new List<dfsle.Tab>();
    if (definitions == null || definitions.isEmpty()) {
        return tabs;
    }
    for (DocuSignWizardDTO.TabDefinition def : definitions) {
        if (def == null) { continue; }
        Boolean isPositional = def.mode != null && def.mode.equalsIgnoreCase('position');

        if (isPositional) {
            dfsle.Tab tab = toTab(def);                    // existing type→subtype mapper (reused)
            if (tab != null && def.pageNumber != null && def.x != null && def.y != null) {
                tab = tab.withPosition(buildPosition(def)); // dfsle.Tab.withPosition (line 230)
                tabs.add(tab);
            }
        } else {
            // ── legacy anchor path (UNCHANGED) ──
            if (String.isBlank(def.anchorText)) { continue; }
            dfsle.Tab tab = toTab(def);
            if (tab != null) {
                tabs.add(tab.withAnchor(buildAnchor(def)));
            }
        }
    }
    return tabs;
}

/** Builds a positional dfsle.Tab.Position from a TabDefinition (all Integer — Position ctor line 271). */
private static dfsle.Tab.Position buildPosition(DocuSignWizardDTO.TabDefinition def) {
    Integer docSeq = def.documentSequence == null ? 1 : def.documentSequence;
    Integer page   = def.pageNumber == null ? 1 : def.pageNumber;
    Integer x      = def.x == null ? 0 : def.x;
    Integer y      = def.y == null ? 0 : def.y;
    Integer w      = def.width  == null ? 108 : def.width;
    Integer h      = def.height == null ? 24  : def.height;
    return new dfsle.Tab.Position(docSeq, page, x, y, w, h);
}
```

Notes:

- `toTab(...)` already returns the correct concrete subtype and applies `withRequired` for signatures;
  reuse it as-is. `withPosition` returns base `dfsle.Tab`, so apply it AFTER `toTab` (same ordering
  discipline the current anchor path uses with `withAnchor`).
- `sendOne` and the whole fan-out (`send` → `sendOne` → Queueable chain) are UNTOUCHED — they call
  `buildTabs(request.tabs)` then `signer.withTabs(tabs)`. Because tabs are rebuilt per envelope inside
  `sendOne`, the SAME placement set is correctly applied to every recipient's own copy for free.
- **documentSequence & template ordering:** `buildDocuments` (lines 209–226) adds the template FIRST
  (if any), then files. So if a template is selected, the master FILE's `documentSequence` is `2`
  (template = 1); if no template, the first file is `1`. The host must compute `documentSequence`
  accordingly, OR — simpler and recommended — **positional tagging applies only to the selected master
  FILE and the wizard disallows combining a positional master with a template** (product rule). Default
  the host to `documentSequence = 1 + (templateSelected ? 1 : 0)` for the master file and pass it down.

───────────────────────────────────────────────────────────────────────────────

## 9. LWC component design

───────────────────────────────────────────────────────────────────────────────

### `docuSignVisualTagger` (new — the Prepare UI)

**Public API (props from host):**

- `@api contentDocumentId` — the master file to render (first selected doc).
- `@api documentSequence` — precomputed by host (§8 note).
- `@api fieldDefinitions` — current placed fields (for round-trip when navigating Back/Next).

**Internal state:**

- `pdfDoc` (PDF.js document proxy), `pageViewports[]` (per-page `{ scale, widthPts, heightPts }`),
  `placedFields` (array of `{ key, type, pageNumber, xPts, yPts, wPts, hPts }`), `pdfLoaded`,
  `loadError`, `compatibilityMode` (worker fallback).

**Lifecycle / rendering:**

1. `renderedCallback` (guarded by `this._scriptLoaded`): `loadScript(this, PDFJS + '/pdf.min.js')`,
   set `GlobalWorkerOptions.workerSrc` (§4), then imperatively call `getDocumentContent({contentDocumentId})`.
2. base64 → `Uint8Array` → `pdfjsLib.getDocument({ data: bytes }).promise` → `pdfDoc`.
3. For each page: `getViewport({ scale: S })`, size a `<canvas>` (backing store `S*DPR`, CSS
   `viewport.width×height`), `page.render(...)`, and lay a positioned `<div class="overlay">` over it.

**Palette + drag/drop:**

- Palette chips (Signature / Full Name / Date Signed) are `draggable="true"`; `dragstart` sets a
  `dataTransfer` payload `{type}` (or a component-scoped instance var, since LWS may restrict
  `dataTransfer` — prefer an instance var `this._dragType` for reliability).
- Each page overlay handles `dragover` (preventDefault) + `drop`: compute `dropX_css/dropY_css` from
  `event` and the overlay's `getBoundingClientRect()`, run the §6 formula → points, push a new
  `placedFields` entry, dispatch `fieldschange`.
- Existing placed fields render via `c-docu-sign-placed-field` (move/resize/remove) — on any change,
  recompute and dispatch `fieldschange`.

**Events dispatched to host:**

- `fieldschange` — `detail`: the full placed-field list mapped to the positional `TabDefinition` shape:
  `[{ mode:'position', type, documentSequence, pageNumber, x, y, width, height }]`.
- `previewerror` — optional, so host can disable the Send gate and show a message.

**Coordinate purity:** the CSS-px→points mapping is a PURE function (`toPoints(dropXcss, dropYcss, S,
fieldWpts, fieldHpts)`) exported for Jest unit testing (§10).

### `docuSignPlacedField` (new — presentational)

Renders one absolutely-positioned box at `left = xPts*S`, `top = yPts*S`, `width = wPts*S`,
`height = hPts*S` (convert points back to CSS px with the same `S`). Emits `fieldmove` / `fieldresize`
/ `fieldremove` with the field `key` and new CSS-px geometry; parent converts back to points. No Apex.

### Host wiring (`docuSignSendWizard`)

- Template swap in `.html` (§3).
- `handleFieldsChange(event)` stores `this.tabDefinitions = event.detail` (already positional shape).
- Compute master doc + `documentSequence` and pass to the tagger.
- In `handleSend`, replace the anchor `tabs` mapping with a straight pass-through of the positional
  definitions (they already match `TabDefinition`), keeping `JSON.stringify(request)` and the
  `send({ requestJson })` call EXACTLY as-is:
  ```js
  tabs: this.tabDefinitions.map(t => ({
      mode: 'position', type: t.type,
      documentSequence: t.documentSequence, pageNumber: t.pageNumber,
      x: t.x, y: t.y, width: t.width, height: t.height
  })),
  ```
- `nextDisabled` on Prepare: `true` until ≥1 Signature field is placed and no `previewerror`.

───────────────────────────────────────────────────────────────────────────────

## 10. Risks & calibration plan

───────────────────────────────────────────────────────────────────────────────

1. **DocuSign coordinate UNIT (highest risk).** `docs/docusign-apex-toolkit-api.md` shows
   `Tab.Position(Integer documentSequence, Integer pageNumber, Integer x, Integer y, Integer width,
Integer height)` (line 271) but **does not state whether x/y/width/height are POINTS or PIXELS**.
   DocuSign's REST tab model is pixels-at-72-DPI (numerically equal to points for our purposes), and
   the toolkit anchor path already uses `units='pixels'` (service line 54) — strong signal the
   positional values are 72-DPI pixels ≡ points. **Do NOT ship on assumption.** Calibration test:
   - Build a single-page US-Letter (612×792) test PDF with visible ruler marks at known points
     (e.g. a box whose top-left is exactly 72pt right, 144pt down).
   - Send ONE envelope with a Signature tab at `Position(1, 1, 72, 144, 108, 24)`.
   - Open the DocuSign envelope and measure where the tab lands. If it lands at 1"×2" from top-left,
     unit = points and the §6 formula is correct as written. If offset, record the scale factor and
     bake it into `buildPosition` (a single multiplier) — no formula redesign needed.
   - Repeat on a 2nd page to confirm `pageNumber` and per-page origin.

2. **Y-axis origin.** Confirm empirically that DocuSign Y grows DOWNWARD from page top (expected). The
   §6 formula measures Y from the rendered page TOP, so it matches a top-left origin. If calibration
   shows bottom-left origin, apply `y_points = pageHeightPts - y_points - height` in `buildPosition`.

3. **PDF.js-in-LWS pitfalls.** (a) Worker load may be blocked → §4 fallback to worker-disabled main-
   thread rendering. (b) `dataTransfer` in drag events may be sanitized by LWS → use an instance var
   for the drag type instead of `dataTransfer.setData`. (c) `eval`/dynamic import inside PDF.js: use the
   **legacy build** (`legacy/build/`) which avoids ESM dynamic import and top-level features LWS may
   reject. (d) Canvas `willReadFrequently`/tainting is not an issue (same-origin bytes, not a cross-
   origin image).

4. **Heap for large PDFs.** Base64 over Apex heap (§5). Guard with `MAX_PREVIEW_BYTES` (~3.5 MB raw)
   and `tooLarge` flag; pre-check `ContentSize` before selecting `VersionData`. For very large docs,
   the legacy anchor Prepare step MAY be retained behind a `tooLarge` fallback (product decision).

5. **Multi-page.** Each page is a separate canvas + overlay with its own `S` and `pageNumber`. Fields
   store their own `pageNumber`; `buildPosition` passes it straight through. Verify scroll position math
   uses per-page `getBoundingClientRect` (not a single global offset).

6. **Multi-document.** `documentSequence` ordering vs a leading template (§8 note). Recommend the
   product rule "positional master file only, no template mixed" to keep `documentSequence` trivial;
   otherwise host must compute it.

7. **Template + positional conflict.** A DocuSign template carries its own tabs; positional tabs on top
   may double up. Rule: when a template is chosen, the Prepare tagger is skipped or disabled (template
   owns tabs). Surface this to the user.

8. **Send-quota / bulk caveat (unchanged).** The fan-out already sends one envelope per recipient (one
   async transaction each). Positional tabs don't change envelope count, but large recipient lists still
   consume DocuSign send quota — same behavior as today; no new risk, just noted.

9. **Field-required semantics.** `toTab` applies `withRequired` only to signature tabs. FullName/Date
   tabs ignore `required`. Keep the Signature "required" default = true.

───────────────────────────────────────────────────────────────────────────────

## 11. Suggested implementation order

───────────────────────────────────────────────────────────────────────────────

1. **DTO** — extend `TabDefinition` with `mode` + positional fields; add `DocumentContent` DTO
   (`DocuSignWizardDTO.cls`). No behavior change to existing callers (default `mode='anchor'`).
2. **Selector** — add `selectVersionDataByDocumentId` (`WITH USER_MODE`) to `DocuSignDocumentSelector`.
3. **Controller** — add `getDocumentContent(contentDocumentId)` (cacheable) with the heap/`tooLarge`
   guard, wrapping errors as `AuraHandledException`.
4. **Service** — add the positional branch + `buildPosition` to `DocuSignBulkSendService.buildTabs`;
   leave the anchor path and `sendOne`/fan-out untouched.
5. **Unit tests (Apex)** — extend service tests for the positional `buildTabs` branch (assert a
   `dfsle.Tab` is produced with a position; assert the anchor path still works); test
   `getDocumentContent` incl. `tooLarge`. Follow `TestDataFactory`, `WITH USER_MODE`, and the 251+ bulk
   rule where DML/trigger paths are exercised (byte method is read-only, single record — bulk N/A, but
   cover null/oversized/no-access branches).
6. **Static resource** — add `pdfjs` (legacy build) + meta; verify `loadScript` + workerSrc locally.
7. **LWC `docuSignPlacedField`** — presentational box + move/resize/remove events + Jest.
8. **LWC `docuSignVisualTagger`** — PDF.js load, render pages, palette drag/drop, §6 mapping (pure fn),
   `fieldschange` emit, worker fallback, error state + Jest (mock `loadScript`, mock
   `getDocumentContent`, unit-test the pure mapping fn, `@sa11y/jest`).
9. **Host wiring** — swap the child in `docuSignSendWizard.html`, add `handleFieldsChange`, compute
   master doc + `documentSequence`, positional `tabs` mapping in `handleSend`, Prepare gate; update host
   Jest. **Retire `docuSignPrepareStep`.**
10. **Calibration** — run the §10.1 empirical unit test against the org; bake any scale/origin
    correction into `buildPosition`. Only then flip the Prepare step live.
11. **Code review → DevOps deploy (incl. destructive removal of `docuSignPrepareStep`) + Docs.**

═══════════════════════════════════════════════════════════════════════════════
COMPLEXITY ROUTING NOTE (for the orchestrator):

- Apex changes are standard service/selector/controller edits → salesforce-developer.
- The LWC visual tagger (PDF.js in LWS, drag/drop, coordinate math) + the DocuSign coordinate
  calibration are the genuinely complex parts → consider salesforce-technical-architect for the
  LWC/tagger + calibration, salesforce-developer for the DTO/selector/controller/service edits.
- Apex created → salesforce-unit-testing → salesforce-code-review → devops + docs.
  ═══════════════════════════════════════════════════════════════════════════════
