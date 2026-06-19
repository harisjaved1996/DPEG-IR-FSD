import { LightningElement } from "lwc";

const iconStyle = (color) =>
  `--slds-c-icon-color-foreground-default: ${color}; --sds-c-icon-color-foreground-default: ${color};`;

const ACTIONS = [
  { id: 3, title: "4 Onboarding queue", iconName: "utility:user", iconColor: "#5867e8" },
  { id: 4, title: "2 Wire review queue", iconName: "utility:approval", iconColor: "#dd7a01" },
  { id: 5, title: "3 unsigned PPM ", iconName: "utility:contract", iconColor: "#c23934" }
];

export default class IrActionQueue extends LightningElement {
  headerIconStyle = iconStyle("#5867e8");
  actions = ACTIONS.map((action) => ({
    ...action,
    iconStyle: iconStyle(action.iconColor)
  }));
}
