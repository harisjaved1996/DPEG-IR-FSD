import { LightningElement } from "lwc";

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "1",
    type: "Report",
    subject: "Q4 2025 Performance Report Now Available",
    description:
      "The quarterly performance report for all active investments is now available in your Documents section. This report covers Q4 2025 performance, market commentary, and outlook for 2026.",
    date: "Jan 20, 2026"
  },
  {
    id: "2",
    type: "Opportunity",
    subject: "New Investment Opportunity: Sunrise Apartments",
    description:
      "A new multifamily opportunity in Austin, TX is now open with a target IRR of 18.5%. DPEG is co-investing 25% of total equity. Minimum investment is $100,000.",
    date: "Jan 18, 2026"
  },
  {
    id: "3",
    type: "Exit",
    subject: "Harbor View Apartments Exit Completed",
    description:
      "We are pleased to announce the successful exit of Harbor View Apartments with a 30% above-target return. Exit distributions of $150,000 have been processed to all investors. Thank you for your partnership on this investment.",
    date: "Jan 15, 2026"
  },
  {
    id: "4",
    type: "Event",
    subject: "Annual Investor Meeting — Save the Date",
    description:
      "Our annual investor meeting will be held on March 15, 2026. Virtual attendance options available. Topics will include 2025 year in review, active portfolio updates, and 2026 pipeline. RSVP link to follow.",
    date: "Jan 10, 2026"
  }
];

export default class InvestmentAnnouncements extends LightningElement {
  announcements = DEFAULT_ANNOUNCEMENTS;

  showModal = false;
  title = "";
  description = "";

  _nextId = 100;

  get recordCount() {
    return this.announcements.length;
  }

  handleNew() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.title = "";
    this.description = "";
  }

  handleTitleChange(event) {
    this.title = event.detail.value;
  }

  handleDescriptionChange(event) {
    this.description = event.detail.value;
  }

  handleSave() {
    if (!this.title) {
      return;
    }
    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    const newItem = {
      id: String(this._nextId++),
      subject: this.title,
      description: this.description,
      date: today
    };
    this.announcements = [newItem, ...this.announcements];
    this.closeModal();
  }

  handleShare(event) {
    const announcementId = event.currentTarget.dataset.id;
    // Placeholder: share the announcement identified by `announcementId`.
    return announcementId;
  }

  handleViewAll(event) {
    event.preventDefault();
    // Placeholder for the View All action.
  }
}
