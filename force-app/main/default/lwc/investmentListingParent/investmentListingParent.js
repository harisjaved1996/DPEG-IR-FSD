import { LightningElement, track } from "lwc";

export default class InvestmentListingParent extends LightningElement {
  @track activeTab = "active";

  get isActiveTab() {
    return this.activeTab === "active";
  }

  get isClosedTab() {
    return this.activeTab === "closed";
  }

  get activeTabClass() {
    return this.activeTab === "active" ? "tab-btn tab-active" : "tab-btn";
  }

  get closedTabClass() {
    return this.activeTab === "closed" ? "tab-btn tab-active" : "tab-btn";
  }

  showActive() {
    this.activeTab = "active";
  }

  showClosed() {
    this.activeTab = "closed";
  }
}
