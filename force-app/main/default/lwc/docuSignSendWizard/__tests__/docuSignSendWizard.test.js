import { createElement } from "lwc";
import { registerSa11yMatcher } from "@sa11y/jest";
import DocuSignSendWizard from "c/docuSignSendWizard";
import getRecipientOptions from "@salesforce/apex/DocuSignWizardController.getRecipientOptions";
import getDocumentOptions from "@salesforce/apex/DocuSignWizardController.getDocumentOptions";
import getTemplateOptions from "@salesforce/apex/DocuSignWizardController.getTemplateOptions";

jest.mock(
  "@salesforce/apex/DocuSignWizardController.getRecipientOptions",
  () => ({ default: jest.fn() }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/DocuSignWizardController.getDocumentOptions",
  () => ({ default: jest.fn() }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/DocuSignWizardController.getTemplateOptions",
  () => ({ default: jest.fn() }),
  { virtual: true }
);
jest.mock("@salesforce/apex/DocuSignWizardController.send", () => ({ default: jest.fn() }), {
  virtual: true
});

beforeAll(() => {
  registerSa11yMatcher();
});

const RECORD_ID = "a0X000000000001AAA";

function createComponent() {
  const element = createElement("c-docu-sign-send-wizard", { is: DocuSignSendWizard });
  element.recordId = RECORD_ID;
  document.body.appendChild(element);
  return element;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("c-docu-sign-send-wizard", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("loads recipient, document and template options on connect", async () => {
    getRecipientOptions.mockResolvedValue([]);
    getDocumentOptions.mockResolvedValue([]);
    getTemplateOptions.mockResolvedValue([]);
    createComponent();
    await flush();
    expect(getRecipientOptions).toHaveBeenCalledTimes(1);
    expect(getDocumentOptions).toHaveBeenCalledTimes(1);
    expect(getTemplateOptions).toHaveBeenCalledTimes(1);
  });

  it("renders the documents step first", async () => {
    getRecipientOptions.mockResolvedValue([]);
    getDocumentOptions.mockResolvedValue([]);
    getTemplateOptions.mockResolvedValue([]);
    const element = createComponent();
    await flush();
    expect(element.shadowRoot.querySelector("c-docu-sign-documents-step")).not.toBeNull();
  });
});
