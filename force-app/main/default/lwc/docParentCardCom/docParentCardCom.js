import { LightningElement } from "lwc";

export default class DocParentCardCom extends LightningElement {
  metrics = [
    {
      key: "totalDocs",
      displayValue: "441",
      label: "Total Documents",
      iconName: "utility:file",
      iconColor: "#5867e8"
    },
    {
      key: "subDocs",
      displayValue: "142",
      label: "Total PPM",
      iconName: "utility:knowledge",
      iconColor: "#e8a33d"
    },
    {
      key: "k1Dispatched",
      displayValue: "7,724",
      label: "Total K1",
      iconName: "utility:summary",
      iconColor: "#2e844a"
    },
    {
      key: "docsPerMonth",
      displayValue: "150",
      label: "Total General Docs",
      iconName: "utility:task",
      iconColor: "#dd7a01"
    },
    {
      key: "notVisible",
      displayValue: "15",
      label: "Total Reports",
      iconName: "utility:note",
      iconColor: "#06a59a"
    }
  ];
}
