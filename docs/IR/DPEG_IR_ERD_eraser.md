# DPEG IR — Eraser.io ERD Code

Paste-ready diagram-as-code for [eraser.io](https://app.eraser.io). Same verified model as
`DPEG_IR_Logical_Business_ERD.md` (v1.0). Colors encode zones: **blue** = Party & Investor,
**green** = Capital Raise, **orange** = Post-Close Operations, **purple** = Asset, **gray** = Supporting.

How to use:
1. Sign in at app.eraser.io → **New file**.
2. Open the **code panel** (`</>` icon, or press `Ctrl+E`) → choose **Entity Relationship** as the diagram type.
3. Paste a code block below → the diagram renders; drag entities to arrange, and pick a style/theme (clean or sketch) from the canvas toolbar.
4. Export via **Share → Export** as PNG/SVG for the FSD, or copy an embed link.

Connection notation: `A < B` = one A to many B · `A > B` = many A to one B · `A - B` = one-to-one · `A <> B` = many-to-many.

---

## Diagram 1 — Core Business ERD (16 entities)

```
// ===== PARTY & INVESTOR ZONE =====
Lead [icon: user-plus, color: blue] {
  channel string // Web-to-Lead, Email-to-Lead, Referral
  kycStatus string // Awaiting Docs, Accreditation Pending, Verified
  portalInviteStatus string
  onboardingStatus string // New, Under Review
}

Contact [icon: user, color: blue] {
  accreditationStatus string
  kycStatus string
  investorTier string // Anchor, Active, Dormant
  portalActivated bool
  repeatInvestor bool
}

InvestingEntity [icon: briefcase, color: blue] {
  entityType string // Individual, Corp, Trust, LLC, IRA, Exempt Org
  country string
}

EntityContactRole [icon: link, color: blue] {
  signerRole string // Primary, Secondary
  isPrimary bool
  signatureRequired bool
}

// ===== CAPITAL RAISE ZONE =====
Offering [icon: flag, color: green] {
  stage string // 8 stages, Draft to Closed Funded
  targetRaise money
  pricePerShare money
  minimumInvestment money
  closingDate date
  gpEntity string
}

Commitment [icon: check-square, color: green] {
  committedAmount money
  commitmentDate date
  membership string // GP, LP, Member, Manager
  ppmSent bool
  ppmSigned bool
  funded bool
}

WaitlistEntry [icon: clock, color: green] {
  shareCount number
  amount money
  autoPromote bool
  status string // Waitlisted, Promoted, Withdrawn
}

Wire [icon: zap, color: green] {
  sender string
  amount money
  memo string
  matchConfidence number // auto 99+, review 70-98, unmatched below 70
  matchStatus string
}

SubscriptionDocument [icon: file-text, color: green] {
  primarySignature string // Pending, Sent, Signed
  secondarySignature string
  finalized bool
  fundingInstructions string // Locked, Sent
}

// ===== POST-CLOSE OPERATIONS ZONE =====
Investment [icon: trending-up, color: orange] {
  status string // Active, Closed
  startDate date
  lpCapital money
  dpegStake money
  irrToDate number
  targetIrr number
}

Position [icon: pie-chart, color: orange] {
  ownershipPct number
  committed money
  contributed money
  distributed money
  unreturnedCapital money
  state string // Current, Past with change reason
}

Contribution [icon: arrow-down-circle, color: orange] {
  amount money
  contributionDate date
  type string // Full, Partial
  paymentMethod string // ACH, Wire, Cheque
}

DistributionBatch [icon: layers, color: orange] {
  source string // Cash Flow, Redemption, Refinance, Sale
  type string // Preferred Return, RoC, Catch Up, Fee, Interest
  period string
  totalAmount money
  status string
}

Distribution [icon: arrow-up-circle, color: orange] {
  amount money
  method string // ACH, Cheque
  achStatus string
  paidStatus string
  distributionDate date
}

ShareTransfer [icon: repeat, color: orange] {
  sharesToTransfer number
  salePrice money
  purchasePrice money
  transferType string // Full, Partial
  status string // Pending e-sig, IR Approval, Completed
}

// ===== ASSET ZONE =====
Property [icon: building, color: purple] {
  propertyType string // Retail, Office, Industrial, Mixed-Use
  address string
  units number
  squareFeet number
  valuation money
  occupancy number
}

// ===== PARTY RELATIONSHIPS =====
Lead - Contact // converts to (process)
Lead - InvestingEntity // converts to (process)
Contact < EntityContactRole // acts through
InvestingEntity < EntityContactRole // has signers

// ===== CAPITAL RAISE RELATIONSHIPS =====
Property < Offering // backs
Offering < Commitment // receives
Contact < Commitment // pledged by
InvestingEntity < Commitment // pledged via
Offering < WaitlistEntry // overflow queue
Contact < WaitlistEntry // requested by
InvestingEntity < WaitlistEntry // requested via
WaitlistEntry - Commitment // auto-promotes to (inferred)
Offering < Wire // receives funds
Wire > Commitment // matched against
Wire - Contribution // creates on confirm (process)
Offering < SubscriptionDocument // collects
SubscriptionDocument > InvestingEntity // signed by
SubscriptionDocument - Commitment // executes (inferred)

// ===== POST-CLOSE RELATIONSHIPS =====
Offering < Investment // activates into (business flow, typically 1)
Investment > Property // holds
Investment < Position // divided into
InvestingEntity < Position // holds
Investment < Contribution // capital received
InvestingEntity < Contribution // contributes
Contribution > Commitment // fulfills (inferred, sets Funded)
Investment < DistributionBatch // pays out via
DistributionBatch < Distribution // allocates pro-rata
InvestingEntity < Distribution // receives
Investment < ShareTransfer // within
InvestingEntity < ShareTransfer // transferor
InvestingEntity < ShareTransfer // transferee
ShareTransfer <> Position // restates
```

---

## Diagram 2 — Supporting Entities ERD (8 entities + anchors)

Paste into a **second** Eraser file (the anchors Offering / Investment / InvestingEntity /
DistributionBatch / Contact repeat here without attributes as ghosts).

```
// Ghost anchors (full definitions in the core diagram)
Offering [icon: flag, color: green]
Investment [icon: trending-up, color: orange]
InvestingEntity [icon: briefcase, color: blue]
DistributionBatch [icon: layers, color: orange]
Contact [icon: user, color: blue]

// ===== SUPPORTING ENTITIES =====
LaunchTask [icon: clipboard, color: gray] {
  timingGroup string // 16 groups, due diligence thru post-closing
  subject string
  responsibility string // Principals, Legal, Marketing, Accounting
  completed bool
  verifiedBy string // wire-verification callback + phone
}

BankAccount [icon: landmark, color: gray] {
  bankName string
  accountType string
  accountLast4 string
  balance money
}

Document [icon: folder, color: gray] {
  category string // PPM, Sub Doc, K-1, Quarterly Rpt, Dist Notice, Transfer Agmt
  year string
  portalVisible bool
  uploadedDate date
}

Announcement [icon: bell, color: gray] {
  type string // Report, Opportunity, Exit, Event
  subject string
  publishedDate date
}

InvestorNote [icon: edit, color: gray] {
  noteType string // Restriction, Preference, Relationship, Behavior
  assetCategory string
}

Case [icon: life-buoy, color: gray] {
  subject string
  priority string
  status string
}

Lease [icon: key, color: gray] {
  suite string
  tenant string
  squareFeet number
  monthlyRent money
  leaseStart date
  leaseEnd date
}

RentStep [icon: bar-chart, color: gray] {
  period string
  monthlyRent money
  rentPsf money
  stepType string // Current Term, Renewal Option
}

// ===== SUPPORTING RELATIONSHIPS =====
Offering < LaunchTask // launch checklist
Investment < BankAccount // treasury accounts
DistributionBatch > BankAccount // funded from
Offering < Document // offering docs
Investment < Document // investment docs
InvestingEntity < Document // shared with
Investment < Announcement // publishes
Contact < InvestorNote // IR intelligence
Contact < Case // support requests
Investment < Lease // rent roll (externally synced)
Lease < RentStep // rent schedule
```
