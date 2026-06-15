import { LightningElement } from "lwc";

export default class AllDocCom extends LightningElement {
  documents = [
    {
      id: 1,
      name: "DPEG Royal Vista, LP - Closing Statement.pdf",
      investment: "DPEG ROYAL VISTA, LP",
      type: "Report",
      date: "5/28/26"
    },
    {
      id: 2,
      name: "DPEG Killeen, LP # 6076.pdf",
      investment: "DPEG Killeen, LP",
      type: "Report",
      date: "5/26/26"
    },
    {
      id: 3,
      name: "DPEG Market Square GP, LLC SB#5582.xlsx",
      investment: "DPEG MARKET SQUARE, LP",
      type: "General Document",
      date: "5/26/26"
    },
    {
      id: 4,
      name: "DPEG Meadowbrook, LP - PPM.pdf",
      investment: "DPEG MEADOWBROOK, LP",
      type: "PPM",
      date: "5/26/26"
    },
    {
      id: 5,
      name: "DPEG Meadowbrook GP, LLC # 6252.pdf",
      investment: "DPEG MEADOWBROOK, LP",
      type: "K-1",
      date: "5/26/26"
    },
    {
      id: 6,
      name: "DPEG Royal Vista, LP - 2025 K-1.pdf",
      investment: "DPEG ROYAL VISTA, LP",
      type: "K-1",
      date: "4/15/26"
    }
  ];

  get rows() {
    return this.documents;
  }

  // Placeholder download handler — wiring only, no-op for now.
  handleDownload() {}
}
