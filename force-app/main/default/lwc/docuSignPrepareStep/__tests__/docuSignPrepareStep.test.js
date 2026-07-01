import { createElement } from "lwc";
import DocuSignPrepareStep from "c/docuSignPrepareStep";

function createComponent() {
  const element = createElement("c-docu-sign-prepare-step", { is: DocuSignPrepareStep });
  element.tabDefinitions = [
    { key: "sign", type: "SignHere", anchorText: "\\s1\\", required: true, label: "Signature" }
  ];
  document.body.appendChild(element);
  return element;
}

describe("c-docu-sign-prepare-step", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders a row per tab definition", () => {
    const element = createComponent();
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.querySelector("lightning-combobox")).not.toBeNull();
    });
  });
});
