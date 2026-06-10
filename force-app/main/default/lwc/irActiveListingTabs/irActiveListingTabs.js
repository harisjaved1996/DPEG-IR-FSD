import { LightningElement } from "lwc";

export default class IrActiveListingTabs extends LightningElement {
  activeTab = "offerings";

  get isOfferings() {
    return this.activeTab === "offerings";
  }

  get isInvestments() {
    return this.activeTab === "investments";
  }

  get offeringsTabCss() {
    return this.activeTab === "offerings" ? "tab-btn tab-active" : "tab-btn";
  }

  get investmentsTabCss() {
    return this.activeTab === "investments" ? "tab-btn tab-active" : "tab-btn";
  }

  handleTabClick(event) {
    this.activeTab = event.currentTarget.dataset.tab;
  }
}
