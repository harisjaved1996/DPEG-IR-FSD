import { LightningElement } from "lwc";

export default class DocParentCardCom extends LightningElement {
  metrics = [
    {
      key: "totalDocs",
      displayValue: "441",
      label: "Total Documents",
      iconName: "standard:document"
    },
    {
      key: "subDocs",
      displayValue: "142",
      label: "Total PPM",
      iconName: "standard:file"
    },
    {
      key: "k1Dispatched",
      displayValue: "7,724",
      label: "Total K1",
      iconName: "standard:metrics"
    },
    {
      key: "docsPerMonth",
      displayValue: "150",
      label: "Total General Docs",
      iconName: "standard:task"
    },
    {
      key: "notVisible",
      displayValue: "15",
      label: "Total Reports",
      iconName: "standard:document"
    }
  ];
}
