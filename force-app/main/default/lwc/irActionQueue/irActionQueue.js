import { LightningElement } from "lwc";

export default class IrActionQueue extends LightningElement {
  actions = [
    { id: 3, title: "4 Onboarding queue", iconName: "standard:user" },
    { id: 4, title: "2 Wire review queue", iconName: "standard:approval" },
    {
      id: 5,
      title: "3 unsigned PPM ",
      iconName: "standard:contract"
    }
  ];
}
