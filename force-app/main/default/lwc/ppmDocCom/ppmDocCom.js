import { LightningElement } from "lwc";

export default class PpmDocCom extends LightningElement {
  documents = [
    {
      id: 1,
      name: "DPEG Royal Vista, LP - PPM.pdf",
      investment: "DPEG ROYAL VISTA, LP",
      type: "PPM",
      date: "5/28/26"
    },
    {
      id: 2,
      name: "DPEG Killeen, LP - PPM.pdf",
      investment: "DPEG Killeen, LP",
      type: "PPM",
      date: "5/26/26"
    },
    {
      id: 3,
      name: "DPEG Market Square, LP - PPM.pdf",
      investment: "DPEG MARKET SQUARE, LP",
      type: "PPM",
      date: "5/22/26"
    },
    {
      id: 4,
      name: "DPEG Meadowbrook, LP - PPM.pdf",
      investment: "DPEG MEADOWBROOK, LP",
      type: "PPM",
      date: "5/18/26"
    },
    {
      id: 5,
      name: "DPEG Parkwest Y Shops, LLC - PPM.pdf",
      investment: "DPEG PARKWEST Y SHOPS, LLC",
      type: "PPM",
      date: "5/14/26"
    }
  ];

  get rows() {
    return this.documents;
  }

  // Placeholder download handler — wiring only, no-op for now.
  handleDownload() {}
}
