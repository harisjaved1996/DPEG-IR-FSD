import { LightningElement } from "lwc";

// Prototype prospect list for the "Investigate" step. In-memory seed only — no
// server calls. One row is selectable at a time; the action buttons are stubs.
const PROSPECTS = [
  {
    id: "p1",
    name: "Uma Nair",
    entity: "Nair Holdings LLC",
    commitment: "$45,000.00",
    context: "Magnolia Crossing LP",
    score: 64
  },
  {
    id: "p2",
    name: "Umar N.",
    entity: "UN Capital",
    commitment: "$60,000.00",
    context: "last active 2024",
    score: 41
  },
  {
    id: "p3",
    name: "Rahul Patel",
    entity: "GreenTree LLC",
    commitment: "$300,000.00",
    context: "Aspen LP",
    score: 58
  },
  {
    id: "p4",
    name: "Sarah Whitman",
    entity: "Aspen Partners",
    commitment: "$125,000.00",
    context: "Project Aspen",
    score: 47
  },
  {
    id: "p5",
    name: "David Nguyen",
    entity: "Blue Oak Capital",
    commitment: "$75,000.00",
    context: "Fund III",
    score: 39
  }
];

// Match-confidence factor → colour band. high >=60 green, mid >=40 amber, low red.
function scoreClass(score) {
  if (score >= 60) {
    return "score score-high";
  }
  if (score >= 40) {
    return "score score-mid";
  }
  return "score score-low";
}

export default class WireInvestigateProspect extends LightningElement {
  searchTerm = "";
  selectedId;

  get rows() {
    const term = this.searchTerm.trim().toLowerCase();
    const filtered = term
      ? PROSPECTS.filter(
          (p) => p.name.toLowerCase().includes(term) || p.entity.toLowerCase().includes(term)
        )
      : PROSPECTS;

    return filtered.map((p) => {
      const isSelected = p.id === this.selectedId;
      return {
        id: p.id,
        name: p.name,
        entity: p.entity,
        commitment: p.commitment,
        scoreLabel: `${p.score}%`,
        scoreClass: scoreClass(p.score),
        rowClass: isSelected ? "prospect-row prospect-row_selected" : "prospect-row",
        buttonLabel: isSelected ? "Selected" : "Select",
        buttonVariant: isSelected ? "brand" : "neutral",
        buttonIcon: isSelected ? "utility:check" : ""
      };
    });
  }

  get hasNoRows() {
    return this.rows.length === 0;
  }

  handleSearchChange(event) {
    this.searchTerm = event.target.value;
  }

  handleSearch() {
    // Live filtering is already applied through the search input; the button is
    // an affordance that mirrors the mockup.
  }

  handleSelect(event) {
    this.selectedId = event.currentTarget.dataset.id;
  }

  handleVerify() {
    // Placeholder: Select & Verify.
  }

  handleNoMatch() {
    // Placeholder: No match → Return / refund.
  }
}
