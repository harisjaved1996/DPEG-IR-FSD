import { LightningElement, api } from "lwc";
import { CloseActionScreenEvent } from "lightning/actions";

export default class ShareTransferUnit extends LightningElement {
  // Provided automatically when launched as a record quick action.
  @api recordId;
  @api objectApiName;

  handleClose() {
    this.dispatchEvent(new CloseActionScreenEvent());
  }
}
