import { LightningElement } from "lwc";

const COLUMNS = [
  { label: "Name", fieldName: "name", type: "text" },
  { label: "Investment", fieldName: "investment", type: "text" },
  { label: "Type", fieldName: "type", type: "text" },
  { label: "Uploaded Date", fieldName: "date", type: "text" },
  {
    label: "Download",
    type: "button-icon",
    initialWidth: 110,
    typeAttributes: {
      iconName: "utility:download",
      name: "download",
      title: "Download",
      alternativeText: "Download",
      variant: "bare"
    }
  }
];

export default class GeneralDocCom extends LightningElement {
  columns = COLUMNS;

  documents = [
    {
      id: 1,
      name: "DPEG Market Square GP, LLC SB#5582.xlsx",
      investment: "DPEG MARKET SQUARE, LP",
      type: "General Document",
      date: "5/26/26"
    },
    {
      id: 2,
      name: "DPEG Meadowbrook, LP SB#2230.xlsx",
      investment: "DPEG MEADOWBROOK, LP",
      type: "General Document",
      date: "5/24/26"
    },
    {
      id: 3,
      name: "DPEG Killeen, LP SB#6076.xlsx",
      investment: "DPEG Killeen, LP",
      type: "General Document",
      date: "5/20/26"
    },
    {
      id: 4,
      name: "DPEG Royal Vista, LP SB#1184.xlsx",
      investment: "DPEG ROYAL VISTA, LP",
      type: "General Document",
      date: "5/16/26"
    },
    {
      id: 5,
      name: "DPEG Parkwest Y Shops, LLC SB#4419.xlsx",
      investment: "DPEG PARKWEST Y SHOPS, LLC",
      type: "General Document",
      date: "5/12/26"
    }
  ];

  get rows() {
    return this.documents;
  }

  // Placeholder download/row-action handler — wiring only, no-op for now.
  handleRowAction() {}
}
