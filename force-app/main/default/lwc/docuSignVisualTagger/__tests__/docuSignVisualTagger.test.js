import { createElement } from "lwc";
import DocuSignVisualTagger from "c/docuSignVisualTagger";
import getDocumentContent from "@salesforce/apex/DocuSignWizardController.getDocumentContent";
import getTaggerPageUrl from "@salesforce/apex/DocuSignWizardController.getTaggerPageUrl";

jest.mock(
  "@salesforce/apex/DocuSignWizardController.getDocumentContent",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/DocuSignWizardController.getTaggerPageUrl",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

const DOC_ID = "069000000000001AAA";

async function flush() {
  for (let i = 0; i < 20; i++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
}

function createComponent() {
  const element = createElement("c-docu-sign-visual-tagger", { is: DocuSignVisualTagger });
  element.contentDocumentId = DOC_ID;
  element.documentSequence = 1;
  document.body.appendChild(element);
  return element;
}

describe("c-docu-sign-visual-tagger (Visualforce iframe host)", () => {
  beforeEach(() => {
    getTaggerPageUrl.mockResolvedValue("/apex/docuSignPdfTagger");
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("renders the Visualforce tagger iframe for a PDF master", async () => {
    getDocumentContent.mockResolvedValue({
      base64: window.btoa("%PDF-1.4 fake"),
      fileExtension: "pdf",
      contentSize: 1234,
      title: "Deck.pdf",
      tooLarge: false
    });
    const element = createComponent();
    await flush();

    expect(getDocumentContent).toHaveBeenCalledWith({ contentDocumentId: DOC_ID });
    const frame = element.shadowRoot.querySelector("iframe.tagger__frame");
    expect(frame).not.toBeNull();
    expect(frame.getAttribute("src")).toBe("/apex/docuSignPdfTagger");
  });

  it("shows a message and no iframe when the file is too large", async () => {
    getDocumentContent.mockResolvedValue({
      base64: null,
      fileExtension: "pdf",
      contentSize: 9999999,
      title: "Huge.pdf",
      tooLarge: true
    });
    const element = createComponent();
    await flush();

    expect(element.shadowRoot.querySelector("iframe.tagger__frame")).toBeNull();
    const info = element.shadowRoot.querySelector(".slds-theme_warning");
    expect(info).not.toBeNull();
    expect(info.textContent).toContain("too large");
  });

  it("shows a PDF-only message for a non-PDF master", async () => {
    getDocumentContent.mockResolvedValue({
      base64: window.btoa("docx bytes"),
      fileExtension: "docx",
      contentSize: 500,
      title: "Contract.docx",
      tooLarge: false
    });
    const element = createComponent();
    await flush();

    const info = element.shadowRoot.querySelector(".slds-theme_warning");
    expect(info).not.toBeNull();
    expect(info.textContent).toContain("PDF");
    expect(element.shadowRoot.querySelector("iframe.tagger__frame")).toBeNull();
  });

  it("forwards a fieldschange message from the iframe to the host", async () => {
    getDocumentContent.mockResolvedValue({
      base64: window.btoa("%PDF"),
      fileExtension: "pdf",
      contentSize: 100,
      title: "x.pdf",
      tooLarge: false
    });
    const element = createComponent();
    const handler = jest.fn();
    element.addEventListener("fieldschange", handler);
    await flush();

    const fields = [
      {
        type: "SignHere",
        mode: "position",
        documentSequence: 1,
        pageNumber: 1,
        x: 108,
        y: 204,
        width: 108,
        height: 24
      }
    ];
    window.dispatchEvent(
      new MessageEvent("message", { data: { source: "dsTagger", type: "fieldschange", fields } })
    );
    await flush();

    const detail = handler.mock.calls[handler.mock.calls.length - 1][0].detail;
    expect(Array.isArray(detail)).toBe(true);
    expect(detail[0].type).toBe("SignHere");
    expect(detail[0].mode).toBe("position");
    expect(detail[0].x).toBe(108);
  });

  it("emits loaderror when the iframe reports an error", async () => {
    getDocumentContent.mockResolvedValue({
      base64: window.btoa("%PDF"),
      fileExtension: "pdf",
      contentSize: 100,
      title: "x.pdf",
      tooLarge: false
    });
    const element = createComponent();
    const errHandler = jest.fn();
    element.addEventListener("loaderror", errHandler);
    await flush();

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { source: "dsTagger", type: "error", message: "render failed" }
      })
    );
    await flush();

    expect(errHandler).toHaveBeenCalled();
    const err = element.shadowRoot.querySelector(".slds-theme_error");
    expect(err).not.toBeNull();
  });
});
