import { createElement } from "lwc";
import DocuSignPlacedField from "c/docuSignPlacedField";

/** Builds a drag event carrying pointer coordinates (CustomEvent keeps the LWC lint rule happy). */
function dragEvent(name, clientX, clientY) {
  const evt = new CustomEvent(name);
  evt.clientX = clientX;
  evt.clientY = clientY;
  return evt;
}

function createComponent(props = {}) {
  const element = createElement("c-docu-sign-placed-field", { is: DocuSignPlacedField });
  element.fieldId = props.fieldId || "sig-1";
  element.label = props.label || "Signature";
  element.type = props.type || "SignHere";
  element.left = props.left ?? 100;
  element.top = props.top ?? 200;
  element.width = props.width ?? 108;
  element.height = props.height ?? 24;
  document.body.appendChild(element);
  return element;
}

describe("c-docu-sign-placed-field", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("renders the label and an absolutely-positioned box", () => {
    const element = createComponent({ label: "Full Name", type: "FullName" });
    return Promise.resolve().then(() => {
      const box = element.shadowRoot.querySelector(".placed-field");
      expect(box).not.toBeNull();
      expect(box.textContent).toContain("Full Name");
      expect(box.getAttribute("style")).toContain("left:100px");
      expect(box.getAttribute("style")).toContain("top:200px");
      expect(box.classList.contains("placed-field_fullname")).toBe(true);
    });
  });

  it("dispatches remove with the field id when × is clicked", () => {
    const element = createComponent({ fieldId: "sig-42" });
    const handler = jest.fn();
    element.addEventListener("remove", handler);
    return Promise.resolve().then(() => {
      element.shadowRoot.querySelector(".placed-field__remove").click();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail.id).toBe("sig-42");
    });
  });

  it("dispatches move with a delta after a drag", () => {
    const element = createComponent({ fieldId: "sig-7" });
    const handler = jest.fn();
    element.addEventListener("move", handler);
    return Promise.resolve().then(() => {
      const box = element.shadowRoot.querySelector(".placed-field");
      box.dispatchEvent(dragEvent("dragstart", 50, 60));
      box.dispatchEvent(dragEvent("dragend", 90, 110));
      expect(handler).toHaveBeenCalled();
      const detail = handler.mock.calls[handler.mock.calls.length - 1][0].detail;
      expect(detail.id).toBe("sig-7");
      expect(detail.deltaX).toBe(40);
      expect(detail.deltaY).toBe(50);
    });
  });

  it("ignores a drag that ends at 0,0 (dropped outside a target)", () => {
    const element = createComponent({ fieldId: "sig-9" });
    const handler = jest.fn();
    element.addEventListener("move", handler);
    return Promise.resolve().then(() => {
      const box = element.shadowRoot.querySelector(".placed-field");
      box.dispatchEvent(dragEvent("dragstart", 50, 60));
      box.dispatchEvent(dragEvent("dragend", 0, 0));
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
