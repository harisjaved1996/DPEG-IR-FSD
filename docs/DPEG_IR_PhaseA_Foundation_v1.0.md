# DPEG — Investor Relations Phase A: Foundation

**Date:** 2026-06-05
**Author:** Documentation Agent
**Version:** 1.0
**Status:** Completed — deployed to `DPEG-IR-FSD` scratch org

---

## 1. What Was Built

Phase A delivered the navigable, populated foundation of the DPEG Investor Relations application. It contains no LWC components, Apex automation, Flows, or Approval Processes — those are Phases B, C, and D. What Phase A provides is the complete data model, security model, app shell, and seed data that all subsequent phases build on top of.

### Components Created

| Category | Count | Detail |
|---|---|---|
| Custom Objects | 16 | New IR domain objects |
| Stub Objects | 3 | `Transaction__c`, `Critical_Date__c`, `Disposition__c` — minimal schema for TestDataFactory compilation |
| Standard Object Extensions | 3 | IR fields added to `Account`, `Contact`, `Lead` |
| Custom Fields (total) | ~120 | Across all objects; includes formula, roll-up, and APEX-C fields |
| Native Roll-Up Summary Fields | 2 | `Investment__c.Total_Contributed__c`, `Investment__c.Total_Distributed__c` |
| Formula Fields | 10 | See §3 |
| Validation Rules | 9 | Factory-safe (no zero-amount blocks) |
| Permission Sets | 5 | Full IR security model |
| Page Layouts | 22 | Including IR-Manager raw-field variants |
| Compact Layouts | 19 | One per object |
| Record Types | 2 | `Account` — `Broker_Firm`, `Investing_Entity` |
| Custom Tabs | 21 | 16 object tabs + 5 App-Page tabs |
| FlexiPages (App Pages) | 5 | Placeholder pages for Phase B LWCs |
| List Views | 16 | Across 9 objects |
| Lightning App | 1 | "Investor Relations" with 10 nav items |
| Seed Data Records | ~139 | Via `sf data import tree` |

---

## 2. Why It Was Built

**Module:** Investor Relations (IR)

**Stakeholders served:** Faiz (IR Manager), Simon (IR Associate), Ali (Finance/CFO), Nikil + Nick Sr. (Principals), DPEG Avanza admins

**Business problem:** DPEG manages private equity investments in commercial real estate and needed a Salesforce-based Investor Relations system to track offerings, investor commitments, capital contributions (funded via Plaid through ASB), distributions, share transfers, and investor documents — all with proper role-based access control and an investor-facing portal (Phase D).

Phase A creates the data foundation — objects, fields, and security — so that the rest of the IR build (LWC screens in Phase B, Apex automation in Phase C, Experience Cloud portal in Phase D) has a correctly structured, seeded, and permissioned platform to build on.

---

## 3. How It Works — Data Model

### 3.1 Object Inventory

#### Primary IR Objects (16 custom)

| # | API Name | Label | OWD | Name Strategy | Purpose |
|---|---|---|---|---|---|
| 1 | `Investor__c` | Investor | Private | Auto `INVR-{0000}` | Portfolio summary record per named investor. Lookup to `Contact`. Holds aggregated summary fields (seeded in Phase A; automated in Phase C). |
| 2 | `Investing_Entity_Contact__c` | Investing Entity Contact | Private (parent-controlled) | Auto `IEC-{0000}` | Two-MD junction linking `Account` (investing entity) to `Contact` (signer). Carries signer role and signature-required flag. |
| 3 | `Offering__c` | Offering | Private | Text (name set by admin) | Fund offering record. Tracks raise target, status through an 8-stage lifecycle, closing/launch dates, and an overbook cap. Lookup to `Property__c`. |
| 4 | `Commitment__c` | Commitment | Private | Auto `CMT-{0000}` | Soft or hard capital commitment from an investing entity to an offering. Lookup to both `Account` and `Offering__c`. |
| 5 | `Investment__c` | Investment | Private | Auto `INV-{0000}` (start 1000) | Active LP position. Parent of `Contribution__c` and `Distribution__c` via Master-Detail. Lookup to `Account` and `Offering__c`. Hosts the two native roll-up summaries. |
| 6 | `Contribution__c` | Contribution | Private (parent-controlled) | Auto `CONT-{000}` (start 1) | Actual capital received. **Master-Detail to `Investment__c`**. Links to a `Wire__c` staging record. |
| 7 | `Distribution__c` | Distribution | Private (parent-controlled) | Auto `DIST-{0000}` (start 2400) | Cash distribution to an LP. **Master-Detail to `Investment__c`**. Nullable Lookup to `Distribution_Batch__c` (factory never sets this). |
| 8 | `Distribution_Batch__c` | Distribution Batch | Private | Auto `DB-{000}` (start 18) | Batch header grouping distributions for a single event (quarterly, monthly, or exit). Totals are APEX-C fields seeded in Phase A; automated in Phase C. |
| 9 | `Wire__c` | Wire | Private | Auto `WR-{0000}` (start 88) | Plaid-sourced inbound wire staging record. Holds match confidence score and a formula-computed `Confidence_Bucket__c` that classifies wires as Auto-Settle / Review / Unmatched. |
| 10 | `Share_Transfer__c` | Share Transfer | Private | Auto `ST-{000}` (start 10) | LP-to-LP unit transfer. Lookup to transferor `Investment__c` and transferee `Account`. Has dual status fields: workflow `Status__c` and approval `Approval_Status__c`. |
| 11 | `Property__c` | Property | Private | Text (property name) | Real-estate asset detail. Holds physical attributes, financial performance metrics (NOI, cap rate, IRR), and capital structure. |
| 12 | `Property_Asset__c` | Property Asset | Private | Text | AUM record; minimal IR use. Lookup to `Property__c`. Needed for TestDataFactory compilation. |
| 13 | `Subscription_Doc__c` | Subscription Document | Private | Auto `SD-{0000}` (start 1000) | Dual-signature subscription agreement tracking per investing entity per offering. `Finalized__c` is a formula that resolves true when primary + secondary (or single-signer) have signed. |
| 14 | `Transfer_Document__c` | Transfer Document | Private | Auto `TRDOC-{0000}` | Legal transfer agreement documents linked to a `Share_Transfer__c`. |
| 15 | `IR_Document__c` | IR Document | Private | Auto `D-{0000}` (start 435) | Document repository for PPMs, K-1s, quarterly reports, distribution notices, and transfer agreements. Nullable lookups to `Offering__c` and `Account` (null = applies to all). |
| 16 | `Waitlist__c` | Waitlist | Private | Auto `WL-{0000}` | Oversubscription queue for an offering. Tracks position, amount, and auto-promote flag. |

#### Stub Objects (3 — minimal, for TestDataFactory compilation)

| API Name | Purpose |
|---|---|
| `Transaction__c` | Placeholder — full build in a later phase |
| `Critical_Date__c` | Placeholder — full build in a later phase |
| `Disposition__c` | Placeholder — full build in a later phase |

#### Standard Object Extensions

| Object | Fields Added |
|---|---|
| `Account` | `Account_Type__c` (Picklist), `Entity_Type__c` (Picklist), `Tax_ID_EIN__c` (Text, sensitive), `Tax_ID_Masked__c` (Formula), `Bank_Account_Last4__c` (Text, sensitive), `Plaid_Access_Token__c` (Text, system-only) |
| `Contact` | `Role__c` (Picklist), `KYC_Complete__c` (Checkbox), `Accreditation_Status__c` (Picklist), `SSN__c` (Text, sensitive), `SSN_Masked__c` (Formula) |
| `Lead` | `Investor_Channel__c` (Picklist), `Onboarding_KYC_Status__c` (Picklist), `Portal_Invite_Status__c` (Picklist) |

### 3.2 Key Relationships

```
Property__c
    └─ Lookup ── Offering__c
                     ├─ Lookup ── Commitment__c ──── Lookup ── Account (Investing Entity)
                     ├─ Lookup ── Investment__c ──── Lookup ── Account (Investing Entity)
                     │                │
                     │         Master-Detail (MD)
                     │                ├── Contribution__c
                     │                │       └─ Lookup ── Wire__c
                     │                └── Distribution__c
                     │                        └─ Lookup (nullable) ── Distribution_Batch__c
                     ├─ Lookup ── Wire__c ──────────── Lookup ── Account (Matched_Account__c)
                     ├─ Lookup ── IR_Document__c ───── Lookup ── Account
                     ├─ Lookup ── Subscription_Doc__c ─ Lookup ── Account, Commitment__c
                     └─ Lookup ── Distribution_Batch__c

Investment__c (Transferor)
    └─ Lookup ── Share_Transfer__c ── Lookup ── Account (Transferee)
                     └─ Lookup ── Transfer_Document__c

Account (Investing Entity)
    └─ MD (primary) ── Investing_Entity_Contact__c ── MD (secondary) ── Contact

Investor__c ── Lookup ── Contact
```

**Key relationship rules:**
- `Contribution__c` and `Distribution__c` are **Master-Detail children of `Investment__c`** — they inherit sharing from the parent and can be used for native roll-up summaries.
- `Distribution__c.Distribution_Batch__c` is a **nullable Lookup** — not all distributions belong to a batch, and the `TestDataFactory` never sets this field.
- `Commitment__c` and `Investment__c` use **Lookups** (not Master-Detail) to `Account` and `Offering__c` because each object already has a Master-Detail relationship reserved for a parent that grants sharing (a custom object may only have two MD relationships).
- `Investing_Entity_Contact__c` uses **two Master-Detail** relationships — `Account` as primary (controls sharing), `Contact` as secondary — making it a true junction object with parent-controlled OWD.

### 3.3 Formula Fields

| Object | Field API Name | Formula Logic |
|---|---|---|
| `Account` | `Tax_ID_Masked__c` | `'**-***' & RIGHT(Tax_ID_EIN__c, 4)` |
| `Contact` | `SSN_Masked__c` | `'***-**-' & RIGHT(SSN__c, 4)` |
| `Offering__c` | `Overbook_Cap__c` | `Target_Raise__c * Overbook_Multiplier__c` |
| `Offering__c` | `Raised_Pct__c` | `IF(Target_Raise__c>0, Amount_Raised__c/Target_Raise__c, 0)` |
| `Investment__c` | `Equity_Pct__c` | `IF(Offering__r.Amount_Raised__c>0, Amount_Funded__c/Offering__r.Amount_Raised__c, 0)` |
| `Investor__c` | `KYC_Status__c` | `TEXT(Contact__r.Accreditation_Status__c)` |
| `Wire__c` | `Confidence_Bucket__c` | `IF(Match_Confidence__c>=99,'Auto-Settle',IF(Match_Confidence__c>=70,'Review','Unmatched'))` |
| `Subscription_Doc__c` | `Finalized__c` | `AND(Primary_Signed__c, OR(Single_Signer__c, Secondary_Signed__c))` |
| `Share_Transfer__c` | `Offering_Name__c` | `Transferor_Investment__r.Offering__r.Name` |

### 3.4 Native Roll-Up Summary Fields

| Object | Field | Type | Source |
|---|---|---|---|
| `Investment__c` | `Total_Contributed__c` | Currency SUM | `Contribution__c.Amount__c` (all child records) |
| `Investment__c` | `Total_Distributed__c` | Currency SUM | `Distribution__c.Amount__c` (all child records) |

These are true Salesforce Roll-Up Summary fields enabled by the Master-Detail relationships. They update automatically when child records are inserted, updated, or deleted.

### 3.5 APEX-C Fields (Created in Phase A; Automated in Phase C)

These fields exist in the schema now and are seeded with literal values so screens look correct. The Apex logic that maintains them is deferred to Phase C.

| Object | Field(s) | What Phase C will automate |
|---|---|---|
| `Offering__c` | `Amount_Raised__c`, `Total_Committed__c` | Rollup from `Contribution__c` and `Commitment__c` across MD-less relationships |
| `Distribution_Batch__c` | `Total_Amount__c`, `ACH_Amount__c`, `Cheque_Amount__c`, `Investor_Count__c` | Sum from child `Distribution__c` records |
| `Investor__c` | `Lifetime_Invested__c`, `Total_Commitments__c`, `Active_Positions__c`, `Investing_Entities_Count__c` | Cross-object aggregation from Investment and Commitment records |

### 3.6 Field History Tracking

Enabled on state-change and financial fields for these objects: `Investment__c`, `Distribution__c`, `Commitment__c`, `Share_Transfer__c`.

---

## 4. Security and Access

### 4.1 Org-Wide Defaults

**All IR custom objects and all extended standard objects are OWD = Private.** No exceptions. Record access is granted exclusively through permission sets (for internal users) and sharing rules (not yet configured for Experience Cloud — Phase D).

### 4.2 Permission Sets

| Permission Set API Name | Label | Persona | Summary |
|---|---|---|---|
| `DPEG_IR_Manager` | DPEG IR Manager | Faiz (IR lead) | Full CRUD on all IR objects. Edit access to all sensitive fields (SSN, EIN, all Amount fields). |
| `DPEG_IR_Associate` | DPEG IR Associate | Simon (IR support) | CRU (no Delete) on most IR objects. No access to SSN, EIN, or financial amount fields — masked display fields only. |
| `DPEG_Finance_CFO` | DPEG Finance CFO | Ali (CFO) | Read on all IR objects. Edit on `Distribution__c.Amount__c` and `Investment__c.Amount_Funded__c`. Read on EIN. |
| `DPEG_Principal` | DPEG Principal | Nikil, Nick Sr. (executives) | Read + ViewAll on `Offering__c`, `Investment__c`, `Distribution__c`, `Distribution_Batch__c`, `Share_Transfer__c`. Read on Amount fields. |
| `DPEG_System_Administrator` | DPEG System Administrator | Avanza admins | CRUD + ModifyAll on all IR objects. Edit all sensitive fields including SSN and EIN. |

Note: `DPEG_System_Administrator` was assigned to the running user in the scratch org to enable seed data import.

### 4.3 Sensitive-Field FLS Matrix

`E` = Read+Edit, `R` = Read only, `—` = No access (field hidden from user)

| Field | IR Manager | IR Associate | Finance CFO | Principal | SysAdmin |
|---|---|---|---|---|---|
| `Contact.SSN__c` | E | — | — | — | E |
| `Contact.SSN_Masked__c` (formula) | R | R | R | R | R |
| `Account.Tax_ID_EIN__c` | E | — | R | — | E |
| `Account.Tax_ID_Masked__c` (formula) | R | R | R | R | R |
| `Account.Bank_Account_Last4__c` | R | — | — | — | E |
| `Account.Plaid_Access_Token__c` | — | — | — | — | — |
| `Distribution__c.Amount__c` | E | — | E | R | E |
| `Investment__c.Amount_Funded__c` | E | — | E | R | E |
| `Share_Transfer__c.Transfer_Amount__c` | E | — | R | R | E |

**Important:** `Plaid_Access_Token__c` is granted to no permission set. It is accessible only to Apex running in system context (Phase C). It is excluded from all page layouts.

Raw sensitive fields (`SSN__c`, `Tax_ID_EIN__c`) appear only on IR-Manager layout variants. All other layouts display only the masked formula fields.

---

## 5. App Shell and Navigation

### 5.1 Lightning App

| Setting | Value |
|---|---|
| App Label | Investor Relations |
| Developer Name | `Investor_Relations` |
| Default Landing Tab | IR Dashboard |
| Navigation Style | Standard |
| Header Color (branding) | `#032D60` (navy) |
| UI Type | Lightning |
| Form Factors | Large (desktop) |

### 5.2 Navigation Items (in mockup order)

| Nav Label | Backing Component | Type | Phase B Role |
|---|---|---|---|
| IR Dashboard | `IR_Dashboard` FlexiPage | App Page | KPI tiles, funnel, queue LWCs |
| IR Console | `IR_Console` FlexiPage | App Page | Operations console LWCs |
| Active Investments | `Active_Investments` FlexiPage | App Page | Investment roster/drill-down |
| Offering | `Offering__c` | Object Tab | Enhanced record page |
| Onboarding | `IR_Onboarding` FlexiPage | App Page | Lead queue + onboarding pipeline |
| Distributions | `Distribution_Batch__c` | Object Tab | Batch list/detail |
| Share Transfers | `Share_Transfer__c` | Object Tab | Transfer pipeline |
| Documents | `IR_Document__c` | Object Tab | Document repository |
| Investors | `Investor__c` | Object Tab | Investor roster/detail |
| Payments | `IR_Payments` FlexiPage | App Page | Wire matching + contribution ledger |

### 5.3 Placeholder FlexiPages (Phase B will populate with LWCs)

Each of the 5 App-Page FlexiPages (`IR_Dashboard`, `IR_Console`, `Active_Investments`, `IR_Onboarding`, `IR_Payments`) was created with a temporary RichText placeholder ("Phase B component") so every nav item is navigable in Phase A.

### 5.4 Custom Tabs

**21 tabs total** — 16 object tabs + 5 App-Page tabs:

Object tabs: `Offering__c`, `Investment__c`, `Distribution_Batch__c`, `Share_Transfer__c`, `IR_Document__c`, `Investor__c`, `Commitment__c`, `Contribution__c`, `Distribution__c`, `Wire__c`, `Property__c`, `Property_Asset__c`, `Waitlist__c`, `Subscription_Doc__c`, `Transfer_Document__c`, `Investing_Entity_Contact__c`

App-Page tabs: `IR_Dashboard`, `IR_Console`, `Active_Investments`, `IR_Onboarding`, `IR_Payments`

Only the 10 items in §5.2 appear in the app nav bar. All other objects are reachable via App Launcher and related lists.

---

## 6. Page Layouts

### 6.1 Standard Layouts (19)

One layout per object (including `Account`, `Contact`, `Lead`). Each layout includes a compact layout with highlight fields. Auto-Number, formula, roll-up, and APEX-C fields are read-only on all layouts.

| Object | Layout Name |
|---|---|
| `Investor__c` | Investor Layout |
| `Contribution__c` | Contribution Layout |
| `Distribution__c` | Distribution Layout |
| `Property_Asset__c` | Property Asset Layout |
| `Subscription_Doc__c` | Subscription Document Layout |
| `IR_Document__c` | IR Document Layout |
| `Transfer_Document__c` | Transfer Document Layout |
| `Waitlist__c` | Waitlist Layout |
| `Investing_Entity_Contact__c` | Investing Entity Contact Layout |
| `Commitment__c` | Commitment Layout |
| `Distribution_Batch__c` | Distribution Batch Layout |
| `Property__c` | Property Layout |
| `Share_Transfer__c` | Share Transfer Layout |
| `Wire__c` | Wire Layout |
| `Investment__c` | Investment Layout |
| `Offering__c` | Offering Layout |
| `Account` | Broker Firm Layout (Broker_Firm RT) |
| `Account` | Investing Entity Layout (Investing_Entity RT) |
| `Contact` | Contact Layout |
| `Lead` | Lead Layout |

### 6.2 IR-Manager Layout Variants (3)

Three additional layouts expose raw sensitive fields (SSN, EIN) for the IR Manager role only:

| Layout Name | Object | Additional Fields vs Standard |
|---|---|---|
| Contact Layout (IR Manager) | `Contact` | Adds `SSN__c` (raw) |
| Investing Entity Layout (IR Manager) | `Account` | Adds `Tax_ID_EIN__c` (raw) |

**Total: 22 page layouts.**

### 6.3 Record Types

| Object | Record Type | Purpose |
|---|---|---|
| `Account` | `Investing_Entity` | Investing entity accounts (trusts, LLCs, LPs, IRAs, individuals) — uses Investing Entity layouts |
| `Account` | `Broker_Firm` | Broker/referral partner accounts — uses Broker Firm layout |

---

## 7. Validation Rules

All 9 rules are designed to pass `TestDataFactory` inserts (no rule blocks zero-amount records or omitted optional fields).

| # | Object | Rule API Name | Error Condition | Error Message |
|---|---|---|---|---|
| 1 | `Account` | `Investing_Entity_Requires_Entity_Type` | Investing Entity account with blank Entity Type | "Entity Type is required for Investing Entity accounts." |
| 2 | `Offering__c` | `Closing_Not_Before_Launch` | Closing Date set before Launch Date | "Closing Date cannot be before Launch Date." |
| 3 | `Offering__c` | `Target_Raise_Not_Negative` | Target Raise < 0 | "Target Raise cannot be negative." |
| 4 | `Commitment__c` | `Committed_Amount_Not_Negative` | Committed Amount < 0 | "Committed Amount cannot be negative." |
| 5 | `Investment__c` | `Amount_Funded_Not_Negative` | Amount Funded < 0 | "Amount Funded cannot be negative." |
| 6 | `Distribution__c` | `Amount_Not_Negative` | Distribution Amount < 0 | "Distribution Amount cannot be negative." |
| 7 | `Contribution__c` | `Amount_Not_Negative` | Contribution Amount < 0 | "Contribution Amount cannot be negative." |
| 8 | `Share_Transfer__c` | `Units_Not_Negative` | Units Transferred < 0 | "Units Transferred cannot be negative." |
| 9 | `Waitlist__c` | `Position_Min_One` | Position set and < 1 | "Waitlist position must be 1 or greater." |

**Deliberately excluded from Phase A** (belong to Phase C automation): batch 2-of-3 approval enforcement, "Posted requires batch" rule, offering stage-gating.

---

## 8. List Views

**16 list views** across 9 objects, all shared with IR permission sets:

| Object | List View API Name | Filter | Key Columns |
|---|---|---|---|
| `Offering__c` | `Active_Fundraising` | Status = Active Fundraising | Name, Offering_ID__c, Target_Raise__c, Amount_Raised__c, Raised_Pct__c, Closing_Date__c |
| `Offering__c` | `By_Status` | All (grouped by Status) | Name, Status__c, Target_Raise__c, Amount_Raised__c |
| `Offering__c` | `Fully_Subscribed` | Status = Fully Subscribed | Name, Amount_Raised__c, Committed_Investor_Count__c |
| `Investor__c` | `By_Tier_Anchor` | Investor_Tier__c = Anchor | Name, Investor_Tier__c, Lifetime_Invested__c, KYC_Status__c |
| `Investor__c` | `Pending_Accreditation` | KYC_Status__c = Pending | Name, KYC_Status__c, IR_Rep__c |
| `Investment__c` | `Active_Positions` | Status = Active | Name, Investing_Entity__c, Offering__c, Amount_Funded__c, Equity_Pct__c |
| `Distribution_Batch__c` | `Pending_Approval` | Status = Pending Approval | Name, Offering__c, Batch_Type__c, Total_Amount__c, Distribution_Date__c |
| `Distribution_Batch__c` | `Processing` | Status = Processing | Name, Total_Amount__c, Investor_Count__c |
| `Distribution__c` | `Pending` | ACH_Status__c = Pending | Name, Investment__c, Amount__c, Payment_Method__c |
| `Wire__c` | `Review_Queue` | Match_Status__c = Review | Name, Sender_Name__c, Amount__c, Match_Confidence__c |
| `Wire__c` | `Unmatched` | Match_Status__c = Unmatched | Name, Sender_Name__c, Amount__c, Confidence_Bucket__c |
| `Share_Transfer__c` | `Pending_IR_Approval` | Status = IR Approval | Name, Transferor_Investment__c, Transferee_Account__c, Units_Transferred__c |
| `Subscription_Doc__c` | `Unsigned` | Finalized__c = false | Name, Investing_Entity__c, Primary_Signature_Status__c, Secondary_Signature_Status__c |
| `IR_Document__c` | `By_Category` | All (grouped by Category) | Name, File_Name__c, Category__c, Offering__c, Portal_Visible__c |
| `Commitment__c` | `Soft_Commits` | Status = Soft Commit | Name, Investing_Entity__c, Offering__c, Committed_Amount__c |
| `Waitlist__c` | `Active_Waitlist` | Status = Waitlisted | Name, Offering__c, Position__c, Amount__c, Auto_Promote__c |

---

## 9. Seed Data

### 9.1 Overview

139 records loaded via `sf data import tree` using JSON files in `scripts/data/ir/` and the plan file `scripts/data/ir/ir-seed-plan.json`.

**Load order (dependency-ordered):** `Property__c` → `Account` → `Contact` → `Investor__c` → `Investing_Entity_Contact__c` → `Offering__c` → `Property_Asset__c` → `Commitment__c` → `Investment__c` → `Wire__c` → `Contribution__c` → `Subscription_Doc__c` → `Waitlist__c` → `Distribution_Batch__c` → `Distribution__c` → `Share_Transfer__c` → `Transfer_Document__c` → `IR_Document__c` → `Lead`

**Fields NOT seeded:** Auto-Number Names, formula fields (`Raised_Pct__c`, `Equity_Pct__c`, `Confidence_Bucket__c`, `Finalized__c`, `*_Masked__c`, `Offering_Name__c`, `KYC_Status__c`, `Overbook_Cap__c`), and native RUS fields (`Total_Contributed__c`, `Total_Distributed__c`). These resolve automatically.

### 9.2 Record Counts

| Object | Records | Notes |
|---|---|---|
| `Property__c` | 5 | Magnolia Crossing, Heights Apartments, Westheimer C-Stores, Cypress Grove, Beltway Plaza |
| `Account` (Investing Entity) | ~13 | 8 named investor entities + secondary entity (KFT IRA #1) + 4 waitlist/transfer entities |
| `Contact` | ~11 | 8 primary signers + Khan spouse (secondary) + 2 others |
| `Investor__c` | 8 | One per named investor |
| `Investing_Entity_Contact__c` | ~11 | One per entity; Khan entity has 2 (primary + secondary signer) |
| `Offering__c` | 5 | O-115 through O-119 (illustrative; system-assigned auto-numbers) |
| `Property_Asset__c` | 2 | Heights Apartments (Active), Westheimer C-Stores (Active) |
| `Commitment__c` | ~20 | 7 named commitments for O-119 + commitments across other offerings |
| `Investment__c` | ~15 | 7 named positions for Heights Apartments (O-115) |
| `Wire__c` | 7 | WR-0088 through WR-0094 |
| `Contribution__c` | 7 | CONT-001 through CONT-007 |
| `Subscription_Doc__c` | 7 | SD-1000 through SD-1006 (all for O-119) |
| `Waitlist__c` | 3 | O-117 Beltway Plaza waitlist positions 1–3 |
| `Distribution_Batch__c` | 3 | DB-022, DB-023, DB-024 |
| `Distribution__c` | ~5 | DIST-2400 through DIST-2404 (children of DB-024) |
| `Share_Transfer__c` | 3 | ST-010, ST-011, ST-012 |
| `Transfer_Document__c` | 3 | One per share transfer |
| `IR_Document__c` | 7 | D-0435 through D-0441 |
| `Lead` | 5 | Onboarding intake queue |

### 9.3 Key Verified Values

**Offering Raised Percentages (formula-computed, verified post-seed):**
- Magnolia Crossing (O-119): Target $12M, Raised $8.6M → **Raised_Pct__c = 71.67%**
- Beltway Plaza (O-117): Target $7.5M, Raised $9.4M → **Raised_Pct__c = 125.33%** (oversubscribed)

**Investor Tiers:**
- Anchor: Khan ($2.4M lifetime), DefiCapital ($1.8M lifetime)
- Active: R. Patel ($980K), S. Kothari ($720K), M. Ahmed ($250K), Greentree ($300K), M. Hassan ($150K)
- Dormant: P. Sharma ($50K, Re-verify)

**Distribution Batch DB-024 (Heights Apts Q1 2025):** $486K total; 312 investors; status Processing; 5 child Distribution records (DIST-2400 through DIST-2404).

**Investment native roll-up verification (post-seed):** `Investment__c.Total_Contributed__c` and `Total_Distributed__c` resolve correctly from Contribution and Distribution children.

### 9.4 Seed Data Files

| File | Object |
|---|---|
| `scripts/data/ir/properties.json` | `Property__c` |
| `scripts/data/ir/accounts.json` | `Account` |
| `scripts/data/ir/contacts.json` | `Contact` |
| `scripts/data/ir/investors.json` | `Investor__c` |
| `scripts/data/ir/iecontacts.json` | `Investing_Entity_Contact__c` |
| `scripts/data/ir/offerings.json` | `Offering__c` |
| `scripts/data/ir/propertyAssets.json` | `Property_Asset__c` |
| `scripts/data/ir/commitments.json` | `Commitment__c` |
| `scripts/data/ir/investments.json` | `Investment__c` |
| `scripts/data/ir/wires.json` | `Wire__c` |
| `scripts/data/ir/contributions.json` | `Contribution__c` |
| `scripts/data/ir/subscriptionDocs.json` | `Subscription_Doc__c` |
| `scripts/data/ir/waitlist.json` | `Waitlist__c` |
| `scripts/data/ir/distributionBatches.json` | `Distribution_Batch__c` |
| `scripts/data/ir/distributions.json` | `Distribution__c` |
| `scripts/data/ir/shareTransfers.json` | `Share_Transfer__c` |
| `scripts/data/ir/transferDocuments.json` | `Transfer_Document__c` |
| `scripts/data/ir/irDocuments.json` | `IR_Document__c` |
| `scripts/data/ir/leads.json` | `Lead` |
| `scripts/data/ir/ir-seed-plan.json` | Plan file (load order + namespace-prefixed sobject names) |

---

## 10. Namespace Finding — CRITICAL

**The `DPEG-IR-FSD` scratch org is registered to the `Unison` managed namespace.**

All deployed custom objects and custom fields carry the `Unison__` prefix in the org at runtime. Examples:

| Source API Name | In-Org API Name |
|---|---|
| `Offering__c` | `Unison__Offering__c` |
| `Investment__c` | `Unison__Investment__c` |
| `Offering__c.Amount_Raised__c` | `Unison__Amount_Raised__c` |

**Impact by context:**

| Context | Behavior |
|---|---|
| In-org Apex / LWC / Flows | Resolve unprefixed names automatically — no code changes needed |
| Labels and page display | Clean (no prefix shown to users) |
| SOQL via CLI (`sf data query`) | Requires `Unison__` prefix on object and field names |
| REST API / Tooling API | Requires `Unison__` prefix |
| `sf data import tree` seed files | Seed JSON files and plan use `Unison__` prefixed sobject names (handled by `scripts/ns_prefix_seed.js`) |

**The namespace prefix tool:** `scripts/ns_prefix_seed.js` (and its Python equivalent `scripts/ns_prefix_seed.py`) were used to add `Unison__` prefixes to all custom object sobject names in the seed plan file. The field names within each JSON record also use `Unison__` prefixed keys.

**This does not affect the source metadata** in `force-app/main/default/` — source files remain unprefixed. The prefix is applied by the platform at deploy time when the target org has a namespace.

---

## 11. Deployment

### 11.1 Deployment Target

- **Scratch org alias:** `DPEG-IR-FSD`
- **API version:** 66.0
- **Namespace:** `Unison` (managed package namespace of the Dev Hub)

### 11.2 Deployment Order

Phase A was deployed in two ordered passes to respect metadata dependencies:

**Pass 1 — Schema and app shell:**
Objects, fields, relationships, formulas, roll-up summaries, Apex stub classes, tabs, FlexiPages

**Pass 2 — Config and security:**
Page layouts, record types, validation rules, custom app, permission sets

### 11.3 Post-Deploy Steps (Manual — Metadata API Limitations)

The following configuration cannot be deployed via Salesforce Metadata API and requires manual post-deploy steps in Setup:

| # | Step | Where | Notes |
|---|---|---|---|
| 1 | Record-type visibility per profile | Setup > Profiles > [Profile] > Record Type Settings | Set `Broker_Firm` and `Investing_Entity` visibility for each profile that accesses Accounts |
| 2 | Page-layout assignment per profile and record type | Setup > Profiles > [Profile] > Page Layout Assignments | Map `Investing Entity Layout (IR Manager)` to IR Manager profile for Account Investing_Entity RT; map `Contact Layout (IR Manager)` similarly |
| 3 | Account compact-layout record-type mapping | Setup > Object Manager > Account > Compact Layouts > Compact Layout Assignment | Assign distinct compact layouts to `Broker_Firm` and `Investing_Entity` record types |
| 4 | FlexiPage activation and app assignment | Setup > App Builder > [FlexiPage] > Activate | Activate each of the 5 placeholder FlexiPages and assign them to the Investor Relations app |

### 11.4 Permission Set Assignment

After deployment, the running user's permission set was assigned:

```bash
sf org assign permset --name DPEG_System_Administrator --target-org DPEG-IR-FSD
```

This grants the deployment user full access to all IR objects for seed data import and verification.

### 11.5 Seed Data Import

```bash
sf data import tree --plan scripts/data/ir/ir-seed-plan.json --target-org DPEG-IR-FSD
```

The plan file uses `Unison__`-prefixed sobject names. All 139 records were imported successfully and verified against the mockup screens.

---

## 12. Testing

### 12.1 TestDataFactory Compatibility

`force-app/main/default/classes/TestDataFactory.cls` was the **binding contract** for Phase A. All schema decisions were validated against the factory's builder methods before implementation:

- Objects where the factory omits `Name` use **Auto-Number** Name fields
- Objects where the factory sets `Name` use **Text** Name fields
- All picklist literals required by the factory are present in each field's value set
- All relationship fields expected by the factory match the implemented relationship type (MD vs Lookup)
- All new fields added to standard objects are optional (no required constraint) so existing factory inserts are unaffected

### 12.2 Apex Test Suite

After Phase A deployment, the full Apex test suite was re-run to confirm no factory regression:

```bash
sf apex run test --test-level RunLocalTests --target-org DPEG-IR-FSD
```

Exit criterion: all tests pass with no factory insert failures.

### 12.3 Phase A Exit Criteria (Verified)

| Criterion | Status |
|---|---|
| "Investor Relations" app launches from App Launcher | Verified |
| All 10 nav items present and navigable | Verified |
| Seed data visible on standard and record pages | Verified |
| OWD Private enforced on all IR objects | Verified |
| IR Associate cannot see SSN / EIN / Amount fields | Verified |
| Masked formula fields visible to all roles | Verified |
| 5 App-Page FlexiPages exist as placeholders | Verified |
| Full deploy passes (no errors) | Verified |
| `sf apex run test --test-level RunLocalTests` passes | Verified |
| Offering Raised% formulas compute correctly (71.67%, 125.33%) | Verified |
| Investment native roll-ups (Total_Contributed__c, Total_Distributed__c) resolve | Verified |

---

## 13. File Locations

| Component Type | Path |
|---|---|
| Custom Objects (all) | `force-app/main/default/objects/` |
| Permission Sets | `force-app/main/default/permissionsets/` |
| Page Layouts | `force-app/main/default/layouts/` |
| Custom Tabs | `force-app/main/default/tabs/` |
| FlexiPages | `force-app/main/default/flexipages/` |
| Lightning App | `force-app/main/default/applications/Investor_Relations.app-meta.xml` |
| Seed Data JSON | `scripts/data/ir/` |
| Seed Plan | `scripts/data/ir/ir-seed-plan.json` |
| Namespace Prefix Tool | `scripts/ns_prefix_seed.js` |
| Design Requirements | `agent-output/design-requirements.md` |
| Architecture Reference | `ARCHITECTURE.md` |
| Technical Solution Design | `docs/DPEG_Technical_Solution_Design_v1.3.docx` |

---

## 14. What Comes Next

| Phase | Scope |
|---|---|
| **Phase B** | LWC components that populate the 5 placeholder FlexiPages (IR Dashboard KPIs, IR Console, Active Investments roster, Onboarding pipeline, Payments/wire-matching screen) |
| **Phase C** | Apex automation — rollup triggers for `Offering.Amount_Raised__c`, `Offering.Total_Committed__c`, Distribution Batch totals, Investor summary fields; Plaid/ASB callout integration for wire matching; Approval Process for Distribution Batches |
| **Phase D** | Experience Cloud investor portal — authenticated portal, My Investments, My Distributions, My Documents, Plaid Link bank account linking, commitment form |

---

## 15. Notes and Decisions

### Design Decisions Made During Phase A

1. **CONT- prefix**: `Contribution__c` uses `CONT-{000}` (matches mockup IR5.6). `Commitment__c` uses `CMT-{0000}` (distinct).
2. **Distribution ACH_Status values**: The 4 TestDataFactory-binding literals (`Pending`, `Posted`, `Failed`, `Returned`) are present plus `Processed` and `Cheque Mailed` were added to match the mockup display.
3. **Investor summary fields**: Created as plain writable Currency/Number fields and seeded directly in Phase A. Phase C will automate their maintenance (confirmed acceptable).
4. **Investing_Entity_Contact__c**: Implemented as a two-Master-Detail junction — `Account` as primary (controls sharing), `Contact` as secondary. This gives correct parent-controlled OWD behavior.
5. **Investor__c.IR_Rep__c**: Implemented as `Lookup(User)`. Seed leaves this null (named users Faiz/Nikil do not exist in the scratch org).
6. **Offering__c record types**: None created. Asset class is captured as `Property_Type__c` picklist on `Property__c`; the 8-stage lifecycle is a single `Status__c` picklist.

### Known Limitations

- **Auto-Number IDs**: The mockup IDs (`O-119`, `INV-1000`, `DIST-2400`, etc.) are illustrative. System-assigned auto-numbers depend on prior inserts and test runs in the scratch org. Exact IDs cannot be guaranteed.
- **Apex-maintained rollups are static in Phase A**: `Offering.Amount_Raised__c`, batch totals, and investor summary fields are seeded with literal values and will not update automatically until Phase C Apex is deployed.
- **FlexiPage activation**: The 5 placeholder FlexiPages must be manually activated in App Builder and assigned to the Investor Relations app (see §11.3).
- **Namespace in external queries**: Any CLI, REST API, or data import tool accessing the `DPEG-IR-FSD` org must use `Unison__`-prefixed names for all custom IR objects and fields.

---

## 16. Change History

| Date | Author | Change |
|---|---|---|
| 2026-06-05 | Documentation Agent | Initial creation — Phase A foundation |
