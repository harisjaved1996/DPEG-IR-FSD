import { LightningElement, track } from "lwc";

// Preference groups shown on the Contact record page. Each group renders a
// subtitle followed by a row of selectable chips ("tabs"). Selections are
// interactive prototype state — no persistence yet.
const SECTIONS = [
  {
    key: "assetType",
    label: "Asset Types",
    options: ["Retail", "Commercial", "Land", "Industrial", "Office", "Mixed-Use", "Multi-Family"],
    defaultSelected: ["Retail", "Commercial"]
  },
  {
    key: "returnCriteria",
    label: "Return Criteria",
    options: ["Minimum Target IRR - 15%", "Preferred Hold Period (3 - 7 Years)"],
    defaultSelected: ["Minimum Target IRR - 15%", "Preferred Hold Period (3 - 7 Years)"]
  },
  {
    key: "geography",
    label: "Geography",
    options: ["Texas", "Austin", "Dallas", "Houston", "San Antonio"],
    defaultSelected: ["Texas", "Austin"]
  }
];

export default class InvestorPreferences extends LightningElement {
  // Map of section key -> array of currently selected option values.
  @track selection = SECTIONS.reduce((acc, section) => {
    acc[section.key] = [...section.defaultSelected];
    return acc;
  }, {});

  get sections() {
    return SECTIONS.map((section) => {
      const selected = this.selection[section.key] || [];
      return {
        key: section.key,
        label: section.label,
        options: section.options.map((option) => {
          const isSelected = selected.includes(option);
          return {
            key: `${section.key}-${option}`,
            value: option,
            label: option,
            selected: isSelected,
            cssClass: isSelected ? "chip chip_selected" : "chip"
          };
        })
      };
    });
  }

  handleToggle(event) {
    const { section, value } = event.currentTarget.dataset;
    const current = this.selection[section] || [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    this.selection = { ...this.selection, [section]: next };
  }
}
