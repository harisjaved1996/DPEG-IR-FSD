import { LightningElement } from "lwc";

export default class IrActionQueue extends LightningElement {
  actions = [
    { id: 1, title: "Compose Email" },
    { id: 2, title: "Create Distribution" },
    { id: 3, title: "4 Onboarding queue" },
    { id: 4, title: "2 Wire review queue" },
    { id: 5, title: "3 unsigned PPM - Magnolia Crossing Offering" },
    { id: 6, title: "Share transfer — IR approval" }
  ];
}
