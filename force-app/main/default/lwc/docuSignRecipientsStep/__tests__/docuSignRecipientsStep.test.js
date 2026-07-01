import { createElement } from "lwc";
import DocuSignRecipientsStep from "c/docuSignRecipientsStep";

function createComponent() {
  const element = createElement("c-docu-sign-recipients-step", { is: DocuSignRecipientsStep });
  element.recipientOptions = [
    {
      contactId: "003000000000001AAA",
      name: "Haris J",
      email: "haris@example.com",
      preChecked: true
    }
  ];
  element.selectedRecipientIds = ["003000000000001AAA"];
  document.body.appendChild(element);
  return element;
}

describe("c-docu-sign-recipients-step", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders recipient rows", () => {
    const element = createComponent();
    return Promise.resolve().then(() => {
      expect(element.shadowRoot.querySelector("lightning-input")).not.toBeNull();
    });
  });
});
