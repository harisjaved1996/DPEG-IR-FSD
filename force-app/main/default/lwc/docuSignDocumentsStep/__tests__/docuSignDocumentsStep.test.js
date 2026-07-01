import { createElement } from "lwc";
import DocuSignDocumentsStep from "c/docuSignDocumentsStep";

jest.mock("@salesforce/apex/DocuSignWizardController.uploadFiles", () => ({ default: jest.fn() }), {
  virtual: true
});

function createComponent() {
  const element = createElement("c-docu-sign-documents-step", { is: DocuSignDocumentsStep });
  element.documentOptions = [
    { uid: "069000000000001AAA", contentDocumentId: "069000000000001AAA", title: "PPM.pdf" }
  ];
  element.selectedDocumentUids = [];
  document.body.appendChild(element);
  return element;
}

describe("c-docu-sign-documents-step", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("renders linked documents", () => {
    const element = createComponent();
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.querySelector("li")).not.toBeNull();
    });
  });
});
