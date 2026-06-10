import { LightningElement } from "lwc";

export default class IrActionQueue extends LightningElement {
  actions = [
    { id: 1, title: "Compose Email", iconName: "standard:email" },
    { id: 2, title: "Create Distribution", iconName: "standard:currency" },
    { id: 3, title: "4 Onboarding queue", iconName: "standard:user" },
    { id: 4, title: "2 Wire review queue", iconName: "standard:approval" },
    {
      id: 5,
      title: "3 unsigned PPM - Magnolia Crossing Offering",
      iconName: "standard:contract"
    }
  ];
}
