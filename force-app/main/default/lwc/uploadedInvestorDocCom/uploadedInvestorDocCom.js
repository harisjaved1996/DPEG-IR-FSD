import { LightningElement } from "lwc";

export default class UploadedInvestorDocCom extends LightningElement {
  documents = [
    {
      id: 1,
      name: "Wire Confirmation.pdf",
      investment: "DPEG ROYAL VISTA, LP",
      type: "Investor Upload",
      date: "5/28/26"
    },
    {
      id: 2,
      name: "Driver License.pdf",
      investment: "DPEG Killeen, LP",
      type: "Investor Upload",
      date: "5/24/26"
    },
    {
      id: 3,
      name: "Signed Subscription Agreement.pdf",
      investment: "DPEG MARKET SQUARE, LP",
      type: "Investor Upload",
      date: "5/20/26"
    },
    {
      id: 4,
      name: "Accreditation Letter.pdf",
      investment: "DPEG MEADOWBROOK, LP",
      type: "Investor Upload",
      date: "5/16/26"
    },
    {
      id: 5,
      name: "Voided Check.pdf",
      investment: "DPEG PARKWEST Y SHOPS, LLC",
      type: "Investor Upload",
      date: "5/12/26"
    }
  ];

  get rows() {
    return this.documents;
  }

  // Placeholder download handler — wiring only, no-op for now.
  handleDownload() {}
}
