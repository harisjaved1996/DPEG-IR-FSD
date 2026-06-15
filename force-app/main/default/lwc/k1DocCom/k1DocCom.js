import { LightningElement } from "lwc";

export default class K1DocCom extends LightningElement {
  documents = [
    {
      id: 1,
      name: "DPEG Royal Vista, LP - 2025 K-1.pdf",
      investment: "DPEG ROYAL VISTA, LP",
      type: "K-1",
      date: "4/15/26"
    },
    {
      id: 2,
      name: "DPEG Killeen, LP - 2025 K-1.pdf",
      investment: "DPEG Killeen, LP",
      type: "K-1",
      date: "4/10/26"
    },
    {
      id: 3,
      name: "DPEG Market Square, LP - 2025 K-1.pdf",
      investment: "DPEG MARKET SQUARE, LP",
      type: "K-1",
      date: "4/2/26"
    },
    {
      id: 4,
      name: "DPEG Meadowbrook, LP - 2025 K-1.pdf",
      investment: "DPEG MEADOWBROOK, LP",
      type: "K-1",
      date: "3/24/26"
    },
    {
      id: 5,
      name: "DPEG Parkwest Y Shops, LLC - 2025 K-1.pdf",
      investment: "DPEG PARKWEST Y SHOPS, LLC",
      type: "K-1",
      date: "3/15/26"
    }
  ];

  get rows() {
    return this.documents;
  }

  // Placeholder download handler — wiring only, no-op for now.
  handleDownload() {}
}
