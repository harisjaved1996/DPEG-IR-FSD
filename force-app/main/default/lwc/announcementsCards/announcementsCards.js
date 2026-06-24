import { LightningElement } from "lwc";

export default class AnnouncementsCards extends LightningElement {
  metrics = [
    {
      key: "totalAnnouncements",
      displayValue: "25",
      label: "Total Announcements",
      iconName: "utility:announcement",
      iconColor: "#5867e8"
    },
    {
      key: "performanceReport",
      displayValue: "12",
      label: "Performance Report",
      iconName: "utility:chart",
      iconColor: "#2e844a"
    },
    {
      key: "newOpportunityAnnouncements",
      displayValue: "8",
      label: "New Opportunity Announcements",
      iconName: "utility:opportunity",
      iconColor: "#e8a33d"
    },
    {
      key: "exitCompleted",
      displayValue: "3",
      label: "Exit Completed",
      iconName: "utility:check",
      iconColor: "#06a59a"
    },
    {
      key: "investorEvent",
      displayValue: "6",
      label: "Investor Event",
      iconName: "utility:event",
      iconColor: "#9050e9"
    }
  ];
}
