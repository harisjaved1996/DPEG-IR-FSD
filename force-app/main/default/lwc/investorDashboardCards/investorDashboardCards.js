import { LightningElement } from "lwc";

export default class InvestorDashboardCards extends LightningElement {
  metrics = [
    {
      key: "activeOfferings",
      displayValue: "5",
      label: "Active Offerings",
      iconName: "standard:opportunity"
    },
    {
      key: "wiresToday",
      displayValue: "14",
      label: "Wires Today",
      iconName: "standard:currency"
    },
    {
      key: "investorContacts",
      displayValue: "7,724",
      label: "Investor Contacts",
      iconName: "standard:contact"
    },
    {
      key: "activeInvestments",
      displayValue: "99",
      label: "Active Investments",
      iconName: "standard:investment_account"
    },
    {
      key: "committed",
      displayValue: "$901.6M",
      label: "Committed",
      iconName: "standard:contract"
    },
    {
      key: "contributed",
      displayValue: "$963.3M",
      label: "Contributed",
      iconName: "standard:metrics"
    },
    {
      key: "distributed",
      displayValue: "$248.6M",
      label: "Distributed",
      iconName: "standard:partner_fund_allocation"
    }
  ];
}
