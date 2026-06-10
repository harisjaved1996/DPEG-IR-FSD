import { LightningElement } from "lwc";

export default class IrInvestmentsList extends LightningElement {
  investments = [
    {
      id: 1,
      name: "Global Zante, LLC",
      gpEntity: "DPEG GP I LLC",
      committed: "$1.3M",
      contributed: "$1.9M",
      distributed: "$450K",
      targetIrr: "12%",
      holdPeriod: "3 Years"
    },
    {
      id: 2,
      name: "FX Series Fund 1, LP",
      gpEntity: "DPEG GP II LLC",
      committed: "$12.0M",
      contributed: "$12.0M",
      distributed: "$20.5M",
      targetIrr: "15%",
      holdPeriod: "5 Years"
    },
    {
      id: 3,
      name: "Fuqua Park Row, LLC",
      gpEntity: "DPEG GP I LLC",
      committed: "$5.0M",
      contributed: "$5.0M",
      distributed: "—",
      targetIrr: "13%",
      holdPeriod: "4 Years"
    },
    {
      id: 4,
      name: "Falvel Apartments, LLC",
      gpEntity: "DPEG GP III LLC",
      committed: "$3.7M",
      contributed: "$4.0M",
      distributed: "$5.5M",
      targetIrr: "16%",
      holdPeriod: "5 Years"
    },
    {
      id: 5,
      name: "DPEG Zarzamora, LLC",
      gpEntity: "DPEG GP II LLC",
      committed: "$7.4M",
      contributed: "$7.4M",
      distributed: "$1.5M",
      targetIrr: "11%",
      holdPeriod: "3 Years"
    }
  ];

  handleNameClick(event) {
    event.preventDefault();
  }
}
