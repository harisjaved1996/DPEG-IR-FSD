import { LightningElement } from "lwc";

// Same type value always maps to the same tag/badge style.
const TYPE_BADGE = {
  Retail: "badge badge-blue",
  Multifamily: "badge badge-purple",
  Land: "badge badge-green",
  Office: "badge badge-orange",
  Industrial: "badge badge-teal"
};

export default class IrInvestmentsList extends LightningElement {
  investments = [
    {
      id: 1,
      name: "Global Zante, LLC",
      type: "Retail",
      committed: "$1.3M",
      contributed: "$1.9M",
      distributed: "$450K",
      targetIrr: "12%",
      holdPeriod: "3 Years"
    },
    {
      id: 2,
      name: "FX Series Fund 1, LP",
      type: "Multifamily",
      committed: "$12.0M",
      contributed: "$12.0M",
      distributed: "$20.5M",
      targetIrr: "15%",
      holdPeriod: "5 Years"
    },
    {
      id: 3,
      name: "Fuqua Park Row, LLC",
      type: "Land",
      committed: "$5.0M",
      contributed: "$5.0M",
      distributed: "—",
      targetIrr: "13%",
      holdPeriod: "4 Years"
    },
    {
      id: 4,
      name: "Falvel Apartments, LLC",
      type: "Multifamily",
      committed: "$3.7M",
      contributed: "$4.0M",
      distributed: "$5.5M",
      targetIrr: "16%",
      holdPeriod: "5 Years"
    },
    {
      id: 5,
      name: "DPEG Zarzamora, LLC",
      type: "Retail",
      committed: "$7.4M",
      contributed: "$7.4M",
      distributed: "$1.5M",
      targetIrr: "11%",
      holdPeriod: "3 Years"
    }
  ];

  get rows() {
    return this.investments.map((row) => ({
      ...row,
      typeBadge: TYPE_BADGE[row.type] || "badge badge-gray"
    }));
  }
}
