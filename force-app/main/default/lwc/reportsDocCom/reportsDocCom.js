import { LightningElement } from "lwc";

export default class ReportsDocCom extends LightningElement {
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
      name: "DPEG Killeen, LP - Q1 Report.pdf",
      investment: "DPEG Killeen, LP",
      type: "Report",
      date: "5/26/26"
    },
    {
      id: 3,
      name: "DPEG Market Square, LP - Annual Report.pdf",
      investment: "DPEG MARKET SQUARE, LP",
      type: "Report",
      date: "5/20/26"
    },
    {
      id: 4,
      name: "DPEG Meadowbrook, LP - Capital Account Statement.pdf",
      investment: "DPEG MEADOWBROOK, LP",
      type: "Report",
      date: "5/15/26"
    },
    {
      id: 5,
      name: "DPEG Parkwest Y Shops, LLC - Q1 Report.pdf",
      investment: "DPEG PARKWEST Y SHOPS, LLC",
      type: "Report",
      date: "5/10/26"
    }
  ];

  get rows() {
    return this.documents;
  }

  // Placeholder download handler — wiring only, no-op for now.
  handleDownload() {}
}
