import { LightningElement } from "lwc";

// Same status value always maps to the same pill style.
const STATUS_BADGE = {
  "Pending e-sig": "badge badge-blue",
  "IR Approval": "badge badge-orange",
  Completed: "badge badge-green"
};

const TRANSFERS = [
  {
    id: "ST-012",
    from: "18825 Sea, LLC",
    to: "1988 Venture LLC",
    units: "2",
    amount: "$125K",
    status: "Pending e-sig",
    date: "Apr 18 2025"
  },
  {
    id: "ST-011",
    from: "24 Seven Entrepreneurs LLC",
    to: "24 Seven REH, LLC",
    units: "1",
    amount: "$250K",
    status: "IR Approval",
    date: "Apr 14 2025"
  },
  {
    id: "ST-010",
    from: "3Bet Holdings LLC",
    to: "3D Way, LLC",
    units: "3",
    amount: "$50K",
    status: "Completed",
    date: "Mar 02"
  }
];

export default class ShareTransferComponent extends LightningElement {
  get rows() {
    return TRANSFERS.map((row) => ({
      ...row,
      statusBadge: STATUS_BADGE[row.status] || "badge badge-gray"
    }));
  }
}
