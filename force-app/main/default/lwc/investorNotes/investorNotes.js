import { LightningElement, track, wire } from "lwc";
import USER_ID from "@salesforce/user/Id";
import NAME_FIELD from "@salesforce/schema/User.Name";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";

const TYPE_OPTIONS = ["Restriction", "Preference", "Relationship", "Behavior"].map((value) => ({
  label: value,
  value
}));

const CATEGORY_OPTIONS = [
  "Retail",
  "Commercial",
  "Land",
  "Industrial",
  "Office",
  "Mixed-Use",
  "Multi-Family"
].map((value) => ({ label: value, value }));

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Single default row modelled on the All Notes screenshot. Additional notes are
// added by the user through the Add Note modal (kept in JS memory only).
const SEED_NOTES = [
  {
    id: "seed-1",
    type: "Restriction",
    category: "Retail",
    note: "Will not invest in multi-family under any deal.",
    author: "Faiz",
    dateIso: "2026-06-12"
  }
];

export default class InvestorNotes extends LightningElement {
  typeOptions = TYPE_OPTIONS;
  categoryOptions = CATEGORY_OPTIONS;

  @track notes = SEED_NOTES.map((note) => ({ ...note }));

  showModal = false;

  // Draft form state for the Add Note modal.
  draftType = "";
  draftCategory = "";
  draftNote = "";
  draftDate = "";

  seq = SEED_NOTES.length;

  @wire(getRecord, { recordId: USER_ID, fields: [NAME_FIELD] })
  userRecord;

  get currentUserName() {
    return getFieldValue(this.userRecord && this.userRecord.data, NAME_FIELD) || "You";
  }

  get displayNotes() {
    return this.notes.map((note) => {
      const isRestriction = note.type === "Restriction";
      return {
        ...note,
        categoryDisplay: note.category ? note.category : "—",
        byDate: `${note.author} · ${this.formatDate(note.dateIso)}`,
        typeClass: isRestriction ? "type-badge type-badge_restriction" : "type-plain"
      };
    });
  }

  get recordCount() {
    return this.notes.length;
  }

  get saveDisabled() {
    return !this.draftType || !this.draftNote;
  }

  formatDate(iso) {
    if (!iso) {
      return "";
    }
    const parts = iso.split("-");
    if (parts.length !== 3) {
      return iso;
    }
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return `${day} ${MONTHS[monthIndex]} ${year}`;
  }

  todayIso() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }

  openModal() {
    this.resetDraft();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  resetDraft() {
    this.draftType = "";
    this.draftCategory = "";
    this.draftNote = "";
    this.draftDate = "";
  }

  handleType(event) {
    this.draftType = event.detail.value;
  }

  handleCategory(event) {
    this.draftCategory = event.detail.value;
  }

  handleNote(event) {
    this.draftNote = event.detail.value;
  }

  handleDate(event) {
    this.draftDate = event.detail.value;
  }

  handleSave() {
    if (this.saveDisabled) {
      return;
    }
    this.seq += 1;
    const newNote = {
      id: `note-${this.seq}`,
      type: this.draftType,
      category: this.draftCategory,
      note: this.draftNote,
      author: this.currentUserName,
      dateIso: this.draftDate || this.todayIso()
    };
    this.notes = [newNote, ...this.notes];
    this.showModal = false;
  }
}
