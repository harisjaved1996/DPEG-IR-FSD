import { LightningElement } from "lwc";

const SOURCE_OPTIONS = [
  { label: "Cash Flow", value: "Cash Flow" },
  { label: "Sale of Property", value: "Sale of Property" }
];

const TYPE_OPTIONS = [
  { label: "Preferred Return", value: "Preferred Return" },
  { label: "Return of Capital", value: "Return of Capital" }
];

function buildPeriodOptions() {
  const options = [];
  for (let year = 2022; year <= 2026; year++) {
    for (let quarter = 1; quarter <= 4; quarter++) {
      const value = `Q${quarter} ${year}`;
      options.push({ label: value, value });
    }
  }
  return options;
}

// Ownership values kept within the 0.41% – 6.74% range.
const ENTITIES = [
  { entity: "AAZ VENTURES LLC", ownership: 0.4166 },
  { entity: "Adjen Investments, LLC", ownership: 0.4166 },
  { entity: "Akbarali Himani", ownership: 0.4166 },
  { entity: "Alamo Fund Manager LLC", ownership: 0.8333 },
  { entity: "Ali Family, LP", ownership: 0.8333 },
  { entity: "Aminoor Investments, LLC", ownership: 0.4166 },
  { entity: "Amit Rai", ownership: 0.8333 },
  { entity: "Amyn Kurani", ownership: 0.4166 },
  { entity: "Anna, Inc", ownership: 0.4166 },
  { entity: "Anserra GP, LLC", ownership: 0.4166 },
  { entity: "Assa Investment Group LLC", ownership: 0.8333 },
  { entity: "Aziz Dharani", ownership: 0.4166 },
  { entity: "CMW Capital Fund, LLC", ownership: 1.6666 },
  { entity: "Cypress Premier Realty, LLC", ownership: 0.4166 },
  { entity: "DPEG 60th Diamond LLC", ownership: 3.3333 },
  { entity: "Espee Corporation", ownership: 0.8333 },
  { entity: "Sherry Green Investments Inc", ownership: 2.5 },
  { entity: "Wadhvani Investments, LLC", ownership: 3.3333 },
  { entity: "Zulfiqar Kunjee", ownership: 6.74 }
];

export default class CreateDistribution extends LightningElement {
  sourceOptions = SOURCE_OPTIONS;
  typeOptions = TYPE_OPTIONS;
  periodOptions = buildPeriodOptions();

  date = "";
  source = "Cash Flow";
  period = "Q1 2026";
  effectiveDate = "";
  description = "";

  type = "Preferred Return";
  totalAmount = null;

  rows = ENTITIES.map((item, index) => ({
    id: String(index + 1),
    entity: item.entity,
    positionId: "--",
    membership: "LP",
    ownership: item.ownership,
    ownershipLabel: `${item.ownership.toFixed(4)}%`,
    preferred: 0
  }));

  get grandPreferred() {
    return this.rows.reduce((sum, row) => sum + (row.preferred || 0), 0);
  }

  get grandTotal() {
    return this.grandPreferred;
  }

  handleDateChange(event) {
    this.date = event.detail.value;
  }

  handleSourceChange(event) {
    this.source = event.detail.value;
  }

  handlePeriodChange(event) {
    this.period = event.detail.value;
  }

  handleEffectiveDateChange(event) {
    this.effectiveDate = event.detail.value;
  }

  handleDescriptionChange(event) {
    this.description = event.detail.value;
  }

  handleTypeChange(event) {
    this.type = event.detail.value;
  }

  handleAmountChange(event) {
    this.totalAmount = event.detail.value;
  }

  handleApply() {
    const amount = parseFloat(this.totalAmount) || 0;
    this.rows = this.rows.map((row) => {
      const preferred = (row.ownership / 100) * amount;
      return { ...row, preferred };
    });
  }

  handleSave() {
    // Placeholder for the Save action.
  }
}
