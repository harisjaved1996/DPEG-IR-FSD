import { LightningElement, api } from "lwc";
import getDocumentContent from "@salesforce/apex/DocuSignWizardController.getDocumentContent";
import getTaggerPageUrl from "@salesforce/apex/DocuSignWizardController.getTaggerPageUrl";

/**
 * docuSignVisualTagger
 *
 * The visual Prepare UI for the DocuSign send wizard. It is a THIN HOST: the actual PDF rendering and
 * drag-drop field placement run inside the `docuSignPdfTagger` Visualforce page, embedded here in an
 * <iframe>. This is deliberate — PDF.js cannot run inside a Lightning Web Component while Lightning
 * Web Security / Locker is active (every Web Worker path is blocked and the main-thread parser stalls,
 * confirmed exhaustively). Visualforce pages are EXEMPT from LWS/Locker for their own JavaScript, so
 * PDF.js runs there normally.
 *
 * Contract preserved for the host wizard (docuSignSendWizard) — unchanged:
 *   props : contentDocumentId, documentSequence, placedFields
 *   events: `fieldschange` (positional TabDefinition[] in DocuSign points) and `loaderror`
 *
 * Bridge protocol (window.postMessage) with the Visualforce page:
 *   VF → host : { source:'dsTagger', type:'ready' | 'rendered' | 'fieldschange' | 'error', ... }
 *   host → VF : { source:'dsHost',   type:'render', base64, documentSequence }
 */
export default class DocuSignVisualTagger extends LightningElement {
  /** ContentDocument Id of the master file to render + tag. */
  @api contentDocumentId;
  /** 1-based document ordinal the master file will get in the envelope (host computes it). */
  @api documentSequence = 1;
  /** Existing placed fields (positional TabDefinition shape) — reserved for future round-trip. */
  @api
  get placedFields() {
    return this._placedFieldsInput;
  }
  set placedFields(value) {
    this._placedFieldsInput = value || [];
  }

  taggerUrl; // Visualforce page URL for the iframe (resolved in Apex → correct incl. namespace)
  loading = true;
  loadError = null; // inline error → host disables Send via the loaderror event
  infoMessage = null; // non-error message (tooLarge / non-PDF)

  _placedFieldsInput = [];
  _base64 = null; // fetched PDF bytes, posted to the iframe once it signals "ready"
  _started = false; // guards one-time load per document id
  _startedDocId = null;
  _messageHandler = null;
  _readyTimer = null;

  get hasFatalError() {
    return !!this.loadError;
  }
  get showInfo() {
    return !!this.infoMessage;
  }
  get showFrame() {
    return !this.loadError && !this.infoMessage && !!this.taggerUrl;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  connectedCallback() {
    // Listen for messages from the Visualforce tagger iframe.
    this._messageHandler = (event) => this.handleMessage(event);
    window.addEventListener("message", this._messageHandler);
  }

  disconnectedCallback() {
    if (this._messageHandler) {
      window.removeEventListener("message", this._messageHandler);
    }
    this.clearReadyTimer();
  }

  renderedCallback() {
    if (!this.contentDocumentId) {
      return;
    }
    if (this._started && this._startedDocId === this.contentDocumentId) {
      return;
    }
    this._started = true;
    this._startedDocId = this.contentDocumentId;
    this.start();
  }

  async start() {
    this.loading = true;
    this.loadError = null;
    this.infoMessage = null;
    this._base64 = null;
    try {
      // Resolve the VF page URL (namespace-safe) and the PDF bytes in parallel.
      const [url, content] = await Promise.all([
        getTaggerPageUrl(),
        getDocumentContent({ contentDocumentId: this.contentDocumentId })
      ]);

      if (!content) {
        this.setInfo("Could not load the selected document for preview.");
        return;
      }
      if (content.tooLarge) {
        this.setInfo(
          "This document is too large to preview for visual tagging. Choose a smaller file or a DocuSign template."
        );
        return;
      }
      const ext = (content.fileExtension || "").toLowerCase();
      if (ext !== "pdf") {
        this.setInfo(
          "Visual tagging supports PDF master files only. Selected file is ." + ext + "."
        );
        return;
      }
      if (!content.base64) {
        this.setInfo("The selected document has no previewable content.");
        return;
      }

      this._base64 = content.base64;
      this.taggerUrl = url; // renders the iframe; the VF page will post "ready" when its listener is up
      this.loading = false;
      this.startReadyTimer();
    } catch (error) {
      this.fail(this.reduceError(error));
    }
  }

  // ─── Bridge with the Visualforce tagger ──────────────────────────────────────

  handleMessage(event) {
    const data = event && event.data;
    if (!data || data.source !== "dsTagger") {
      return;
    }
    if (data.type === "ready") {
      this.clearReadyTimer();
      // Reply to the exact window that signalled ready; fall back to the iframe's contentWindow.
      if (!this.postRenderTo(event.source)) {
        const frame = this.template.querySelector("iframe.tagger__frame");
        this.postRenderTo(frame && frame.contentWindow);
      }
    } else if (data.type === "rendered") {
      this.loading = false;
    } else if (data.type === "fieldschange") {
      // Fields arrive already in the positional TabDefinition shape; forward straight to the host.
      this.dispatchEvent(new CustomEvent("fieldschange", { detail: data.fields || [] }));
    } else if (data.type === "error") {
      this.fail(data.message || "The document preview failed to render.");
    }
  }

  postRenderTo(win) {
    if (win && this._base64) {
      try {
        win.postMessage(
          {
            source: "dsHost",
            type: "render",
            base64: this._base64,
            documentSequence: this.documentSequence
          },
          "*"
        );
        return true;
      } catch (ignore) {
        return false;
      }
    }
    return false;
  }

  // ─── Guards / helpers ────────────────────────────────────────────────────────

  startReadyTimer() {
    this.clearReadyTimer();
    // If the VF page never signals ready (page blocked, wrong URL), surface an error rather than hang.
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this._readyTimer = setTimeout(() => {
      if (!this.loadError && !this.infoMessage) {
        this.fail("The document preview did not load. Please reload the preview or try again.");
      }
    }, 15000);
  }

  clearReadyTimer() {
    if (this._readyTimer) {
      clearTimeout(this._readyTimer);
      this._readyTimer = null;
    }
  }

  fail(message) {
    this.loading = false;
    this.loadError = message;
    this.clearReadyTimer();
    this.dispatchEvent(new CustomEvent("loaderror", { detail: { message } }));
  }

  setInfo(message) {
    this.loading = false;
    this.infoMessage = message;
    // No fields can be placed → make sure the host has an empty set so the Send gate stays closed.
    this.dispatchEvent(new CustomEvent("fieldschange", { detail: [] }));
  }

  handleReload() {
    this._started = false;
    this._startedDocId = null;
    this.taggerUrl = null;
    this.loadError = null;
    this.infoMessage = null;
    this._base64 = null;
    this.loading = true;
    // renderedCallback re-runs start() on the next tick because the guards were reset.
    this.renderedCallback();
  }

  reduceError(error) {
    if (error && error.body && error.body.message) {
      return error.body.message;
    }
    if (error && typeof error.message === "string") {
      return error.message;
    }
    return "Could not load the document preview.";
  }
}
