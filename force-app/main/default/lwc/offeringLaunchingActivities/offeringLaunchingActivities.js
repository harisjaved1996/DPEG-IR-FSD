import { LightningElement, api, track } from "lwc";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CRITICAL_RE = /\(\s*(anti-?fraud|critical[^)]*)\s*\)/i;
const WIRE_RE = /\(\s*anti-?fraud\s*\)/i;

// Hardcoded, seeded confirmer label. No @salesforce/user/Id, no getRecord — 100% server-free.
const COMPLETED_BY_LABEL = "Danish Dhanani";

// ---------------------------------------------------------------------------
// In-memory seed model. Deep-cloned per instance so each component gets its
// own mutable copy. Two-level hierarchy: timing groups -> tasks.
//   { key, letter, name, conditional, total, complete, pct,
//     tasks: [{ id, subject, responsibility, done, verifyComplete, verifiedBy,
//               phone, verifiedAt, notes, ownerLabel, completedDate }] }
// letter holds the group's display number ("1".."16").
// total / complete / pct are recomputed from tasks in recomputeGroup().
// ---------------------------------------------------------------------------
const SEED_GROUPS = [
  {
    key: "g1",
    letter: "1",
    name: "Due diligence material is received",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t1",
        subject: "Create potential projects folder in drive",
        responsibility: "Faiz / Principals",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g2",
    letter: "2",
    name: "Project is being discussed internally",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t2",
        subject: "Discuss with principals regarding launch timeline",
        responsibility: "Faiz / Principals",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g3",
    letter: "3",
    name: "One week prior to the launch",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t3",
        subject: "Create launch deck under misc folder",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g4",
    letter: "4",
    name: "6 days prior to the launch",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t4",
        subject: "Get deck reviewed by principals",
        responsibility: "Faiz",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g5",
    letter: "5",
    name: "5 days prior to the launch",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t5",
        subject: "Form entities for project (LP and GP)",
        responsibility: "Faiz / Legal",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g6",
    letter: "6",
    name: "3 days prior to the launch",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t6",
        subject: "Get EINs for both LP and GP",
        responsibility: "Legal",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t7",
        subject: "Get PPM drafted & LP Agreement signed on Nick’s behalf (to open bank account)",
        responsibility: "Faiz / Legal",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g7",
    letter: "7",
    name: "2 days prior to the launch",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t8",
        subject:
          "Confirm bank with Ali, open LP & GP accounts, obtain wiring instructions from accounting",
        responsibility: "Faiz / Accounting",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t9",
        subject: "Make Contribution & Distribution (C&D) sheet in respective folder",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t10",
        subject: "Make pre-commitment calls — log in C&D sheet",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g8",
    letter: "8",
    name: "1 day prior to the launch",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t11",
        subject: "Video creation w/ Nick",
        responsibility: "Marketing",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t12",
        subject: "Edit & upload video to YouTube (unlisted) for shareable link",
        responsibility: "Marketing",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t13",
        subject: "Make video file compatible for sending out",
        responsibility: "Marketing",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g9",
    letter: "9",
    name: "On the day of launch",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t14",
        subject: "Tease blast on social media",
        responsibility: "Marketing",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t15",
        subject: "Get email w/ deck and video ready in Appfolio & Textedly",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t16",
        subject: "Send test email on Appfolio & Textedly",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t17",
        subject: "Launch project via Textedly & Appfolio",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t18",
        subject: "Take firm commitments via email, text, phone (first-come, first-serve)",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t19",
        subject: "Let waitlist build up to cover 50% of raise amount",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t20",
        subject: "Send sold-out announcement (if applicable) via email, Textedly, socials",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t21",
        subject:
          "Create new fundraise in Appfolio & add asset valuation (based on total project cost)",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t22",
        subject: "Translate info from C&D sheet to Appfolio",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t23",
        subject: "Review PPM",
        responsibility: "Faiz",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t24",
        subject: "Mark signature fields in Appfolio & send PPM to all committed investors",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t25",
        subject: "Email committed investors with PPM signing & funding deadlines",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g10",
    letter: "10",
    name: "From launch up until fulfillment of raise",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t26",
        subject: "Send reminder emails / calls to ensure PPMs signed & funding done by deadlines",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t27",
        subject: "Daily recon of PPM signatures (verifying accreditation) & bank inflow/outflow",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t28",
        subject: "Daily logging of funding confirmations in C&D sheet & Appfolio",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g11",
    letter: "11",
    name: "Upon full completion of all PPMs",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t29",
        subject: "Save & upload countersignature for PPM on Nick’s behalf",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g12",
    letter: "12",
    name: "1 day prior to closing",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t30",
        subject: "Final recon prior to closing",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g13",
    letter: "13",
    name: "Closing date",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t31",
        subject: "Closing",
        responsibility: "Ali / Accounting",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t32",
        subject: "Email blasts re: closing & upload closing statement (Appfolio, Textedly)",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t33",
        subject: "Social media announcement of closing",
        responsibility: "Marketing",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t34",
        subject: "Activation of fundraise in Appfolio",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t35",
        subject: "Move folder from Potential Projects to AUM",
        responsibility: "Acquisitions",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g14",
    letter: "14",
    name: "One day after closing",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t36",
        subject: "Update company website to reflect new portfolio project",
        responsibility: "Marketing",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      },
      {
        id: "t37",
        subject: "Update company profile to reflect new portfolio project",
        responsibility: "Marketing",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g15",
    letter: "15",
    name: "1 day after closing",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t38",
        subject: "Email investors to request bank account info for future distributions",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  },
  {
    key: "g16",
    letter: "16",
    name: "From request up until ACH info is logged",
    conditional: false,
    total: 0,
    complete: 0,
    pct: 0,
    tasks: [
      {
        id: "t39",
        subject: "Send reminder emails / calls to ensure ACH info fully provided",
        responsibility: "Faiz / Team",
        done: false,
        verifyComplete: false,
        verifiedBy: "",
        phone: "",
        verifiedAt: "",
        notes: "",
        ownerLabel: "",
        completedDate: ""
      }
    ]
  }
];

export default class OfferingLaunchingActivities extends LightningElement {
  @api recordId;
  // Reserved inert property. Retained so the design property in the
  // js-meta.xml maps to an @api property. The phase-based layout was
  // removed; this is intentionally unused.
  @api phase;
  @track _data = [];
  _selectedKey;
  _wireModal = {};
  _wireSaving = false;
  _confirm = {};
  _view = {};

  connectedCallback() {
    // Deep-clone the seed so each instance gets its own mutable copy,
    // then roll up total/complete/pct for every group from its tasks.
    const cloned = JSON.parse(JSON.stringify(SEED_GROUPS));
    cloned.forEach((g) => this.recomputeGroup(g));
    this._data = cloned;
  }

  recomputeGroup(g) {
    const tasks = g.tasks || [];
    const total = tasks.length;
    const complete = tasks.filter((t) => t.done).length;
    g.total = total;
    g.complete = complete;
    g.pct = total ? Math.round((complete / total) * 100) : 0;
    return g;
  }

  get isEmpty() {
    return this._data.length === 0;
  }

  get selectedKey() {
    const groups = this._data;
    if (this._selectedKey && groups.some((g) => g.key === this._selectedKey)) {
      return this._selectedKey;
    }
    const firstOpen = groups.find((g) => !(g.total > 0 && g.complete >= g.total));
    return (firstOpen || groups[0] || {}).key;
  }

  get railItems() {
    const sel = this.selectedKey;
    return this._data.map((g) => {
      const complete100 = g.total > 0 && g.complete >= g.total;
      const accent = complete100 ? "#2e7d32" : g.conditional ? "#bf5d0a" : "#1565c0";
      return {
        key: g.key,
        letter: g.letter,
        name: g.name,
        complete100,
        countLabel: `${g.complete} / ${g.total}`,
        ringStyle: `--ring:${accent};--pct:${g.pct}%`,
        itemClass: g.key === sel ? "tg-gchip tg-gchip--active" : "tg-gchip"
      };
    });
  }

  get current() {
    const g = this._data.find((x) => x.key === this.selectedKey) || this._data[0];
    if (!g) return {};
    const complete100 = g.total > 0 && g.complete >= g.total;
    return {
      letter: g.letter,
      name: g.name,
      conditional: g.conditional,
      countLabel: `${g.complete} / ${g.total}`,
      badgeStyle: `background:${g.conditional ? "#bf5d0a" : "#1565c0"}`,
      barStyle: `width:${g.pct}%;background:${complete100 ? "#2e7d32" : "#2BAFAC"}`,
      rows: g.tasks.map((t) => {
        const critical = CRITICAL_RE.test(t.subject);
        const wire = WIRE_RE.test(t.subject);
        const verified = wire && t.done && t.verifyComplete;
        const notes = (t.notes || "").trim();
        const hasNotes = t.done && notes.length > 0;
        return {
          id: t.id,
          subject: t.subject.replace(CRITICAL_RE, "").trim(),
          responsibility: t.responsibility,
          critical,
          wire,
          showCritical: critical && !verified,
          verified,
          verifiedLabel: t.verifiedBy ? `Verified · ${t.verifiedBy}` : "Verified",
          meta: t.done
            ? [t.ownerLabel, this.dateLabelYear(t.completedDate)].filter(Boolean).join(" · ")
            : "",
          done: t.done,
          notes,
          hasNotes,
          hasDetails: t.done && (hasNotes || verified),
          rowClass:
            (t.done ? "tg-task tg-task--done" : "tg-task") + (critical ? " tg-task--critical" : "")
        };
      })
    };
  }

  dateLabel(d) {
    if (!d) return "";
    const p = String(d).split("-");
    if (p.length !== 3) return "";
    return MONTHS[parseInt(p[1], 10) - 1] + " " + parseInt(p[2], 10);
  }

  dateLabelYear(dt) {
    if (!dt) return "";
    const d = new Date(dt);
    if (isNaN(d.getTime())) return "";
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  select(event) {
    this._selectedKey = event.currentTarget.dataset.key;
  }

  handleCheck(event) {
    const taskId = event.target.dataset.id;
    const done = event.target.checked;
    const wire = event.target.dataset.wire === "true";
    if (!done) {
      return;
    }
    if (wire) {
      event.target.checked = false;
      this._wireModal = {
        open: true,
        taskId,
        subject: event.target.dataset.subject,
        verifiedBy: "",
        phone: "",
        comments: "",
        error: ""
      };
      return;
    }
    event.target.checked = false;
    this._confirm = { open: true, taskId, subject: event.target.dataset.subject, notes: "" };
  }

  get showConfirmModal() {
    return !!this._confirm.open;
  }
  get confirmSubject() {
    return this._confirm.subject;
  }
  get confirmNotes() {
    return this._confirm.notes;
  }
  handleConfirmNotes(event) {
    this._confirm = { ...this._confirm, notes: event.target.value };
  }
  cancelConfirm() {
    this._confirm = {};
  }

  confirmComplete() {
    const { taskId, notes } = this._confirm;
    this._confirm = {};
    const today = this.todayString();
    // Mutate the in-memory task locally — no server call, no refreshApex.
    const next = JSON.parse(JSON.stringify(this._data));
    next.forEach((g) => {
      let touched = false;
      (g.tasks || []).forEach((t) => {
        if (t.id === taskId) {
          t.done = true;
          t.notes = notes || "";
          t.ownerLabel = COMPLETED_BY_LABEL;
          t.completedDate = today;
          touched = true;
        }
      });
      if (touched) {
        this.recomputeGroup(g);
      }
    });
    // Reassign to a new array reference so reactivity fires.
    this._data = next;
  }

  get showViewModal() {
    return !!this._view.open;
  }
  get viewData() {
    return this._view;
  }
  viewTask(event) {
    const id = event.currentTarget.dataset.id;
    let found;
    this._data.forEach((g) =>
      (g.tasks || []).forEach((t) => {
        if (t.id === id) {
          found = t;
        }
      })
    );
    if (!found) {
      return;
    }
    const isWire = WIRE_RE.test(found.subject);
    const notes = (found.notes || "").trim();
    const hasWire = isWire && !!found.verifiedBy;
    this._view = {
      open: true,
      subject: found.subject.replace(CRITICAL_RE, "").trim(),
      isWire,
      hasWire,
      verifiedBy: found.verifiedBy,
      phone: found.phone,
      verifiedAt: this.dateTimeLabel(found.verifiedAt),
      notes,
      hasNotes: notes.length > 0,
      hasAny: notes.length > 0 || hasWire
    };
  }
  closeView() {
    this._view = {};
  }

  dateTimeLabel(dt) {
    if (!dt) {
      return "";
    }
    const d = new Date(dt);
    if (isNaN(d.getTime())) {
      return "";
    }
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${h}:${m} ${ap}`;
  }

  get showWireModal() {
    return !!this._wireModal.open;
  }
  get wireSubject() {
    return this._wireModal.subject;
  }
  get wireVerifiedBy() {
    return this._wireModal.verifiedBy;
  }
  get wirePhone() {
    return this._wireModal.phone;
  }
  get wireComments() {
    return this._wireModal.comments;
  }
  get wireError() {
    return this._wireModal.error;
  }
  get wireSaveDisabled() {
    return this._wireSaving;
  }

  handleVerifiedBy(event) {
    this._wireModal = { ...this._wireModal, verifiedBy: event.target.value };
  }
  handlePhone(event) {
    this._wireModal = { ...this._wireModal, phone: event.target.value };
  }
  handleWireComments(event) {
    this._wireModal = { ...this._wireModal, comments: event.target.value };
  }
  cancelWire() {
    this._wireModal = {};
  }

  submitWire() {
    const { taskId, verifiedBy, phone, comments } = this._wireModal;
    if (!verifiedBy || !verifiedBy.trim() || !phone || !phone.trim()) {
      this._wireModal = {
        ...this._wireModal,
        error: "Both the confirmer's name and the phone number used are required."
      };
      return;
    }
    this._wireSaving = true;
    try {
      const now = new Date().toISOString();
      const today = this.todayString();
      // Mutate locally — no server call, no refreshApex.
      const next = JSON.parse(JSON.stringify(this._data));
      next.forEach((g) => {
        let touched = false;
        (g.tasks || []).forEach((t) => {
          if (t.id === taskId) {
            t.done = true;
            t.verifyComplete = true;
            t.verifiedBy = verifiedBy.trim();
            t.phone = phone.trim();
            t.verifiedAt = now;
            t.notes = (comments || "").trim();
            t.ownerLabel = COMPLETED_BY_LABEL;
            t.completedDate = today;
            touched = true;
          }
        });
        if (touched) {
          this.recomputeGroup(g);
        }
      });
      this._data = next;
      this._wireModal = {};
    } catch (e) {
      const msg =
        (e && e.body && e.body.message) || "Could not save the verification. Please try again.";
      this._wireModal = { ...this._wireModal, error: msg };
    } finally {
      this._wireSaving = false;
    }
  }

  todayString() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
}
