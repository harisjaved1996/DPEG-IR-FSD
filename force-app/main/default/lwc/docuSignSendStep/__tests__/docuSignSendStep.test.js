import { createElement } from "lwc";
import DocuSignSendStep from "c/docuSignSendStep";

function createComponent() {
  const element = createElement("c-docu-sign-send-step", { is: DocuSignSendStep });
  element.documentCount = 2;
  element.recipientCount = 3;
  document.body.appendChild(element);
  return element;
}

describe("c-docu-sign-send-step", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders the pre-send summary when there is no result", () => {
    const element = createComponent();
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.querySelector("dl")).not.toBeNull();
    });
  });
});
