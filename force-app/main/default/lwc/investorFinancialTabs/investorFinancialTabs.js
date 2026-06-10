import { LightningElement } from "lwc";

export default class InvestorFinancialTabs extends LightningElement {
  activeTab = "contributions";

  get isContributionsActive() {
    return this.activeTab === "contributions";
  }

  get isDistributionsActive() {
    return this.activeTab === "distributions";
  }

  get btnContributions() {
    return `fin-tab-btn${this.isContributionsActive ? " fin-tab-btn--active" : ""}`;
  }

  get btnDistributions() {
    return `fin-tab-btn${this.isDistributionsActive ? " fin-tab-btn--active" : ""}`;
  }

  get contentContributionsClass() {
    return this.isContributionsActive
      ? "fin-tab-content"
      : "fin-tab-content fin-tab-content--hidden";
  }

  get contentDistributionsClass() {
    return this.isDistributionsActive
      ? "fin-tab-content"
      : "fin-tab-content fin-tab-content--hidden";
  }

  handleContributionsTab() {
    this.activeTab = "contributions";
  }

  handleDistributionsTab() {
    this.activeTab = "distributions";
  }
}
