import { LightningElement, api } from "lwc";

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;
const DOT_GREEN = "#3fae5e";
const DOT_AMBER = "#c98a33";
const DOT_RED = "#e0556b";

// ─── Demo data (no backend) ──────────────────────────────────────────────────
// The rent roll below is served straight from this file so the component
// renders without Apex. To switch to the real backend later, delete MOCK_DATA,
// import getRentRoll from '@salesforce/apex/RentRollController.getRentRoll',
// and restore the @wire handler that sets this.data / this.error.
const MOCK_DATA = {
  summary: {
    totalSqFt: 9016,
    occupiedSqFt: 5540,
    vacantSqFt: 3476,
    occupiedPct: 61.4,
    vacantPct: 38.6,
    occupiedCount: 4,
    vacantCount: 2,
    monthlyRent: 12549.17,
    blendedPsf: 27.18,
    nnnMonthlyTotal: 3812.08,
    lastSynced: "2026-07-10T14:14:00"
  },
  units: [
    {
      unitId: "U-100",
      suite: "100",
      tenant: "Premiumrx Pharmacy",
      status: "Occupied",
      squareFeet: 1200,
      currentRent: 2400.0,
      currentRentPsf: 24.0,
      leaseStart: "2023-03-06",
      leaseEnd: "2028-09-30",
      nnnTax: 300.0,
      nnnInsurance: 50.0,
      nnnCam: 350.0,
      nnnMonthlyTotal: 700.0,
      nnnPsf: 7.0,
      steps: [
        {
          periodStart: "2023-12-01",
          periodEnd: "2024-10-31",
          monthlyRent: 2200.0,
          rentPsf: 22.0,
          stepType: "Current Term"
        },
        {
          periodStart: "2024-11-01",
          periodEnd: "2025-10-31",
          monthlyRent: 2300.0,
          rentPsf: 23.0,
          stepType: "Current Term"
        },
        {
          periodStart: "2025-11-01",
          periodEnd: "2028-10-31",
          monthlyRent: 2400.0,
          rentPsf: 24.0,
          stepType: "Current Term"
        },
        {
          periodLabel: "Years 6–10",
          monthlyRent: 2700.0,
          rentPsf: 27.0,
          stepType: "Renewal Option"
        },
        {
          periodLabel: "Years 11–15",
          monthlyRent: 3000.0,
          rentPsf: 30.0,
          stepType: "Renewal Option"
        }
      ]
    },
    {
      unitId: "U-101",
      suite: "101",
      tenant: "Cell Phone Store",
      status: "Occupied",
      squareFeet: 750,
      currentRent: 1312.5,
      currentRentPsf: 21.0,
      leaseStart: "2026-01-01",
      leaseEnd: "2028-12-31",
      nnnTax: 220.0,
      nnnInsurance: 40.0,
      nnnCam: 240.0,
      nnnMonthlyTotal: 500.0,
      nnnPsf: 8.0,
      steps: [
        {
          periodStart: "2026-01-01",
          periodEnd: "2026-12-31",
          monthlyRent: 1312.5,
          rentPsf: 21.0,
          stepType: "Current Term"
        },
        {
          periodStart: "2027-01-01",
          periodEnd: "2027-12-31",
          monthlyRent: 1375.0,
          rentPsf: 22.0,
          stepType: "Current Term"
        },
        {
          periodStart: "2028-01-01",
          periodEnd: "2028-12-31",
          monthlyRent: 1437.5,
          rentPsf: 23.0,
          stepType: "Current Term"
        }
      ]
    },
    {
      unitId: "U-102",
      suite: "102",
      tenant: "Bright Smiles Dental",
      status: "Occupied",
      squareFeet: 1930,
      currentRent: 4825.0,
      currentRentPsf: 30.0,
      leaseStart: "2019-05-01",
      leaseEnd: "2027-04-30",
      nnnTax: 640.0,
      nnnInsurance: 130.0,
      nnnCam: 597.08,
      nnnMonthlyTotal: 1367.08,
      nnnPsf: 8.5,
      steps: [
        {
          periodStart: "2019-05-01",
          periodEnd: "2023-04-30",
          monthlyRent: 4342.5,
          rentPsf: 27.0,
          stepType: "Current Term"
        },
        {
          periodStart: "2023-05-01",
          periodEnd: "2027-04-30",
          monthlyRent: 4825.0,
          rentPsf: 30.0,
          stepType: "Current Term"
        }
      ]
    },
    {
      unitId: "U-103",
      suite: "103",
      tenant: null,
      status: "Vacant",
      squareFeet: 2126,
      currentRent: null,
      currentRentPsf: null,
      askingRentPsf: 27.0,
      leaseStart: null,
      leaseEnd: null,
      estimatedNnnPsf: 8.75,
      steps: []
    },
    {
      unitId: "U-104",
      suite: "104",
      tenant: "Golden Wok Kitchen",
      status: "Occupied",
      squareFeet: 1660,
      currentRent: 4011.67,
      currentRentPsf: 29.0,
      leaseStart: "2016-12-01",
      leaseEnd: "2026-11-30",
      nnnTax: 580.0,
      nnnInsurance: 115.0,
      nnnCam: 550.0,
      nnnMonthlyTotal: 1245.0,
      nnnPsf: 9.0,
      steps: [
        {
          periodStart: "2016-12-01",
          periodEnd: "2021-11-30",
          monthlyRent: 3735.0,
          rentPsf: 27.0,
          stepType: "Current Term"
        },
        {
          periodStart: "2021-12-01",
          periodEnd: "2026-11-30",
          monthlyRent: 4011.67,
          rentPsf: 29.0,
          stepType: "Current Term"
        },
        {
          periodLabel: "Years 11–15",
          monthlyRent: 4565.0,
          rentPsf: 33.0,
          stepType: "Renewal Option"
        }
      ]
    },
    {
      unitId: "U-105",
      suite: "105",
      tenant: null,
      status: "Vacant",
      squareFeet: 1350,
      currentRent: null,
      currentRentPsf: null,
      askingRentPsf: 25.0,
      leaseStart: null,
      leaseEnd: null,
      estimatedNnnPsf: 8.5,
      steps: []
    }
  ]
};

const money = (n) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const psf = (n) => "$" + Number(n).toFixed(2);
// Dates arrive as 'YYYY-MM-DD'
const mdy = (iso) => {
  if (!iso) return "";
  const p = String(iso).split("-");
  return `${parseInt(p[1], 10)}/${parseInt(p[2], 10)}/${p[0]}`;
};
const dateVal = (iso) => (iso ? new Date(iso + "T00:00:00") : null);

export default class RentRoll extends LightningElement {
  @api recordId;
  // App Builder toggle: true renders only the summary KPI cards (Rent Roll Stats tab).
  @api statsOnly = false;
  data = MOCK_DATA;
  error;
  expanded = {};
  sortKey = null;
  sortDir = 1;
  tip = null;

  get isLoading() {
    return !this.data && !this.error;
  }
  get showDetails() {
    return !this.statsOnly;
  }
  get kpiRowClass() {
    // Stats-only lives in the narrow sidebar tab: 2×2 grid instead of one row of 4.
    return this.statsOnly ? "kpi-row kpi-row_2col" : "kpi-row";
  }
  get errorMessage() {
    const e = this.error;
    return (e && e.body && e.body.message) || "Unknown error";
  }
  get hasUnits() {
    return !!this.data && this.data.units.length > 0;
  }
  get isEmpty() {
    return !!this.data && this.data.units.length === 0;
  }
  get unitCount() {
    return this.data ? this.data.units.length : 0;
  }

  get summary() {
    const s = this.data.summary;
    return {
      totalSqFt: Number(s.totalSqFt || 0).toLocaleString("en-US"),
      occupiedSqFt: Number(s.occupiedSqFt || 0).toLocaleString("en-US"),
      vacantSqFt: Number(s.vacantSqFt || 0).toLocaleString("en-US"),
      occupiedPct: s.occupiedPct == null ? "" : s.occupiedPct + "%",
      vacantPct: s.vacantPct == null ? "" : s.vacantPct + "%",
      monthlyRent: money(s.monthlyRent || 0),
      occBarStyle: "width:" + (s.occupiedPct || 0) + "%",
      vacBarStyle: "width:" + (s.vacantPct || 0) + "%",
      lastSynced: s.lastSynced
        ? "Last synced: " +
          new Date(s.lastSynced).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
          })
        : "Not yet synced"
    };
  }

  // Summary KPI cards, same shape the dashboard KPI components feed c-stat-card.
  get statMetrics() {
    const s = this.data.summary;
    const num = (n) => Number(n || 0).toLocaleString("en-US");
    const pct = (p) => (p == null ? "" : " · " + p + "%");
    return [
      {
        key: "total",
        label: "Total Sq Ft",
        iconName: "utility:metrics",
        iconColor: "#1B3A6B",
        displayValue: num(s.totalSqFt)
      },
      {
        key: "occ",
        label: "Occupied Sq Ft",
        iconName: "utility:home",
        iconColor: "#1A7A6B",
        displayValue: num(s.occupiedSqFt) + pct(s.occupiedPct)
      },
      {
        key: "vac",
        label: "Vacant Sq Ft",
        iconName: "utility:warning",
        iconColor: "#D4940A",
        displayValue: num(s.vacantSqFt) + pct(s.vacantPct)
      },
      {
        key: "rent",
        label: "Current Monthly Rent",
        iconName: "utility:moneybag",
        iconColor: "#1B3A6B",
        displayValue: money(s.monthlyRent || 0)
      }
    ];
  }

  get headers() {
    const arrow = (k) => (this.sortKey === k ? (this.sortDir === 1 ? " ▲" : " ▼") : "");
    return {
      suite: "Suite #" + arrow("suite"),
      sqft: "Sq Ft" + arrow("sqft"),
      rent: "Monthly Rent" + arrow("rent"),
      end: "Lease Start → End" + arrow("end")
    };
  }

  get totals() {
    const s = this.data.summary;
    return {
      occLabel: s.occupiedCount + " occupied · " + s.vacantCount + " vacant",
      sqftSplit:
        Number(s.occupiedSqFt || 0).toLocaleString("en-US") +
        " occ · " +
        Number(s.vacantSqFt || 0).toLocaleString("en-US") +
        " vac",
      blendedPsf: s.blendedPsf == null ? "—" : psf(s.blendedPsf),
      nnnTotal: money(s.nnnMonthlyTotal || 0)
    };
  }

  sortValue(u) {
    const k = this.sortKey;
    if (k === "suite") {
      const n = parseInt(u.suite, 10);
      return Number.isNaN(n) ? Infinity : n;
    }
    if (k === "sqft") return u.squareFeet == null ? Infinity : u.squareFeet;
    if (k === "rent") return u.currentRent == null ? Infinity : u.currentRent;
    if (k === "end") {
      const d = dateVal(u.leaseEnd);
      return d ? d.getTime() : Infinity;
    }
    return 0;
  }

  get rows() {
    let units = [...this.data.units];
    if (this.sortKey) {
      units.sort((a, b) => {
        const av = this.sortValue(a);
        const bv = this.sortValue(b);
        if (av === bv) return 0;
        if (av === Infinity) return 1; // nulls/vacant always last
        if (bv === Infinity) return -1;
        return (av - bv) * this.sortDir;
      });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // date-pure compare: steps stay Active through their final day
    return units.map((u) => {
      const occupied = u.status === "Occupied";
      const isExpanded = occupied && !!this.expanded[u.unitId];

      let dot = null;
      const end = dateVal(u.leaseEnd);
      if (occupied && end) {
        const months = (end.getTime() - today.getTime()) / MS_PER_MONTH;
        const color = months > 12 ? DOT_GREEN : months >= 6 ? DOT_AMBER : DOT_RED;
        dot = {
          style: "background:" + color,
          title:
            "Lease ends " +
            mdy(u.leaseEnd) +
            " — about " +
            Math.max(0, Math.round(months)) +
            " months out"
        };
      }

      let psfDisp = "—";
      let psfClass = "";
      if (u.currentRentPsf != null) {
        psfDisp = psf(u.currentRentPsf);
      } else if (u.askingRentPsf != null) {
        psfDisp = psf(u.askingRentPsf) + " asking";
        psfClass = "asking";
      }

      const hasNnn = u.nnnMonthlyTotal != null;
      let nnnDisp = "—";
      let nnnClass = "";
      if (hasNnn) {
        nnnDisp = money(u.nnnMonthlyTotal);
        nnnClass = "nnn-val";
      } else if (u.estimatedNnnPsf != null) {
        nnnDisp = psf(u.estimatedNnnPsf) + "/SF est.";
        nnnClass = "nnn-est";
      }

      return {
        id: u.unitId,
        panelKey: u.unitId + "-panel",
        occupied,
        isExpanded,
        rowClass: occupied ? "occ" : "vac",
        chevStyle: isExpanded ? "transform:rotate(180deg)" : "",
        suiteDisp: u.suite || "—",
        tenantDisp: u.tenant || "— Vacant —",
        tenantClass: u.tenant ? "tenant" : "tenant vacant",
        sqftDisp: u.squareFeet == null ? "—" : Number(u.squareFeet).toLocaleString("en-US"),
        rentDisp: u.currentRent == null ? "—" : money(u.currentRent),
        psfDisp,
        psfClass,
        termDisp: occupied && u.leaseStart ? mdy(u.leaseStart) + " → " + mdy(u.leaseEnd) : "—",
        dot,
        nnnDisp,
        nnnClass,
        panelTitle: "Suite " + (u.suite || "—") + (u.tenant ? " · " + u.tenant : ""),
        nnnTaxDisp: u.nnnTax == null ? "—" : money(u.nnnTax),
        nnnInsDisp: u.nnnInsurance == null ? "—" : money(u.nnnInsurance),
        nnnCamDisp: u.nnnCam == null ? "—" : money(u.nnnCam),
        nnnTotDisp: hasNnn ? money(u.nnnMonthlyTotal) : "—",
        nnnPsfDisp: u.nnnPsf == null ? "—" : psf(u.nnnPsf),
        steps: (u.steps || []).map((s, i) => {
          const start = dateVal(s.periodStart);
          const stepEnd = dateVal(s.periodEnd);
          const active = !!(start && stepEnd && today >= start && today <= stepEnd);
          const noRent = s.monthlyRent == null;
          return {
            key: u.unitId + "-s" + i,
            period: s.periodLabel || mdy(s.periodStart) + " – " + mdy(s.periodEnd),
            active,
            rowClass: active ? "srow active" : "srow",
            rentDisp: noRent ? s.note || "—" : money(s.monthlyRent),
            rentClass: noRent ? "snote" : active ? "srent srent-bold" : "srent",
            psfDisp: s.rentPsf == null ? "—" : psf(s.rentPsf),
            typeLabel: s.stepType || "",
            tagClass: s.stepType === "Renewal Option" ? "tag gold" : "tag navy"
          };
        })
      };
    });
  }

  toggleRow(event) {
    const id = event.currentTarget.dataset.id;
    const u = this.data.units.find((x) => x.unitId === id);
    if (!u || u.status !== "Occupied") return;
    this.expanded = { ...this.expanded, [id]: !this.expanded[id] };
  }

  sortBy(event) {
    const key = event.currentTarget.dataset.key;
    if (this.sortKey !== key) {
      this.sortKey = key;
      this.sortDir = 1;
    } else if (this.sortDir === 1) {
      this.sortDir = -1;
    } else {
      this.sortKey = null;
      this.sortDir = 1;
    }
  }

  tipEnter(event) {
    const id = event.currentTarget.dataset.id;
    const u = this.data.units.find((x) => x.unitId === id);
    if (!u || u.nnnMonthlyTotal == null) return;
    const r = event.currentTarget.getBoundingClientRect();
    this.tip = {
      style: "left:" + Math.round(r.right) + "px; top:" + Math.round(r.top - 8) + "px",
      suite: "Suite " + (u.suite || "—"),
      tax: u.nnnTax == null ? "—" : money(u.nnnTax),
      ins: u.nnnInsurance == null ? "—" : money(u.nnnInsurance),
      cam: u.nnnCam == null ? "—" : money(u.nnnCam),
      total: money(u.nnnMonthlyTotal),
      psf: u.nnnPsf == null ? "—" : psf(u.nnnPsf)
    };
  }

  tipLeave() {
    this.tip = null;
  }
}
