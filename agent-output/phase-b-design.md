# DPEG Investor Relations — Phase B Design Spec (LWC UI + Apex Read Layer)

> **Prepared by:** salesforce-design agent · **Date:** 2026-06-05
> **Scope:** Phase B only — **design, not code/metadata**. Builds the 10 IR screens on top of the deployed Phase A data model (16 objects, fields, seed, app shell, 5 placeholder App-Page FlexiPages).
> **Deploy target:** scratch org `DPEG-IR-FSD` · **API version:** 66.0
> **Authoritative inputs:** `agent-output/design-requirements.md` (Phase A field dictionary — exact API names), `ARCHITECTURE.md` §2 (Apex layering) + §5 (LWC), `.claude/rules/apex-layering-rule.md`, `.claude/rules/bulk-test-rule.md`.

---

## 0. Global Constraints & Conventions (apply to every component below)

| Constraint         | Decision                                                                                                                                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Namespace**      | Org is `Unison`-namespaced. **Author ALL Apex classes, LWC bundles, and `@salesforce/apex/...` imports with UNPREFIXED names** (e.g. `IRDashboardController`, not `Unison__IRDashboardController`). The platform resolves in-namespace at compile/runtime.                                                                  |
| **Data access**    | **Imperative Apex returning DTOs for ALL data.** Controllers are `@AuraEnabled(cacheable=true)` (Phase B is read-only display). Keep LDS / `@salesforce/schema` usage minimal — only `@api recordId` for record-page hosts. No `getRecord` wires, no `@salesforce/schema` field imports (avoids namespace import friction). |
| **Apex layering**  | Per `apex-layering-rule.md`: ALL SOQL lives in **Selectors** (`with sharing`, `WITH USER_MODE`); controllers are **thin** — call selectors only, map to DTOs, no inline SOQL/DML. Aggregates use SOQL `GROUP BY` / `COUNT()` / `SUM()` / `COUNT_DISTINCT()` — **never loops**.                                              |
| **DTOs**           | Every controller returns a DTO (or `List<DTO>`). DTO classes are top-level `public with sharing class`, all fields `@AuraEnabled`. DTOs are reused across screens where shapes match.                                                                                                                                       |
| **Error handling** | Controllers wrap failures in `AuraHandledException` (user-safe message). LWC catches the rejected promise and shows a toast (`lightning/platformShowToastEvent`).                                                                                                                                                           |
| **Charts**         | **Pure SVG/CSS only — no 3rd-party chart libraries.** Donut = `stroke-dasharray` on `<circle>`; funnel = stacked CSS trapezoids; stage tracker = `<ol>` + CSS connectors; progress bars = CSS width %.                                                                                                                      |
| **KPI numbers**    | Computed from **real seed data** via SOQL aggregates. **Do NOT hardcode the mockup's inflated demo totals** (e.g. "142 investors", "$8.6M"). Screens render real seed-scale values (5 offerings, 8 investors, ~15 investments, etc.).                                                                                       |
| **Period windows** | "this period" KPIs expose a design attribute `periodMonths` (default **18**) so they are non-zero against seed data (contributions seeded Apr 2025, distributions Apr 2026). Selector accepts a `Date sinceDate` param computed in the controller. See §1.4 note.                                                           |
| **Styling**        | SLDS 2 design tokens + DPEG brand custom properties (§4). SLDS linter must pass before deploy.                                                                                                                                                                                                                              |
| **Testing**        | Jest (render + data + events) and `@sa11y/jest` accessibility per LWC; Apex tests via `TestDataFactory`, bulk-safe (251+), 90%+ coverage per class.                                                                                                                                                                         |

---

## 1. APEX READ LAYER

### 1.1 Selectors (one per object · `with sharing` · every query `WITH USER_MODE`)

> Naming per Phase A API names. Aggregate methods return `List<AggregateResult>`; the controller maps to DTOs. Scalar convenience methods wrap a single-row aggregate. No selector contains business logic, DML, or callouts.

#### `OfferingSelector`

```apex
List<Offering__c> selectActive();                       // Status__c NOT IN ('Draft','Closed Funded')
List<Offering__c> selectActiveOrderByRaisedDesc();      // for progress-bar list
List<Offering__c> selectAllWithProperty();              // incl. Property__r fields
Offering__c       selectByIdWithProperty(Id offeringId);// workspace header + Property__r
Integer           countActive();                        // COUNT() Status not Draft/Closed Funded
Decimal           sumAmountRaised();                    // SUM(Amount_Raised__c) all offerings
List<AggregateResult> aggregatePortfolioByOffering();   // GROUP BY on Investment__c — see InvestmentSelector
```

Queried fields: `Name, Offering_ID__c, Status__c, Target_Raise__c, Amount_Raised__c, Raised_Pct__c, Total_Committed__c, Committed_Investor_Count__c, Overbook_Cap__c, Closing_Date__c, GP_Entity__c, Property__c, Property__r.Name, Property__r.Property_Type__c, Property__r.Occupancy_Pct__c, Property__r.Cap_Rate__c, Property__r.Cash_on_Cash__c, Property__r.IRR_To_Date__c, Property__r.Target_IRR__c, Property__r.LP_Capital__c`.

#### `PropertySelector`

```apex
Property__c selectByIdFull(Id propertyId);              // all detail/performance/financing fields
List<Property__c> selectActive();                       // Status__c = 'Active'
Decimal           avgIrrToDateActive();                 // AVG(IRR_To_Date__c) WHERE Status__c='Active'
List<Property__c> selectActiveOrderByExit();            // for "Nearest Exit" (see §1.4 caveat)
```

#### `InvestmentSelector`

```apex
List<Investment__c> selectByOffering(Id offeringId);            // roster rows (+ Investing_Entity__r.Name)
List<Investment__c> selectByEntityIds(Set<Id> accountIds);      // investor-detail positions
Integer             countActive();                              // Status__c='Active'
Decimal             sumAmountFundedActive();                    // LP capital deployed
Integer             countDistinctActiveEntities();              // COUNT_DISTINCT(Investing_Entity__c) WHERE Active
List<AggregateResult> aggregateByOfferingActive();              // GROUP BY Offering__c: SUM(Amount_Funded__c) lpCap, COUNT(Id) investorCnt
List<AggregateResult> countFundedInvestments();                 // funnel stage
```

Queried fields (rows): `Name, Investing_Entity__c, Investing_Entity__r.Name, Offering__c, Offering__r.Name, Units__c, Amount_Funded__c, Equity_Pct__c, Cost_Basis__c, Status__c, Funded_Date__c, Total_Distributed__c`.

#### `CommitmentSelector`

```apex
List<Commitment__c> selectByOffering(Id offeringId);    // workspace Commitments tab
List<Commitment__c> selectByEntityIds(Set<Id> accountIds);// investor-detail commitments
Integer             countAll();                         // funnel: total commitments
Decimal             sumCommittedAmount();               // dashboard "Total Committed $"
```

Fields: `Name, Investing_Entity__r.Name, Committed_Amount__c, Status__c, Commitment_Date__c, Funded__c`.

#### `ContributionSelector`

```apex
List<Contribution__c> selectByOffering(Id offeringId);  // via Investment__r.Offering__c
List<Contribution__c> selectRecent(Date sinceDate);     // Payments screen feed
```

Fields: `Name, Investment__r.Investing_Entity__r.Name, Amount__c, Payment_Method__c, Wire__c, Wire__r.Name, Contribution_Date__c, Match_Status__c`.

#### `DistributionSelector`

```apex
List<Distribution__c> selectByBatch(Id batchId);        // batch detail rows
List<Distribution__c> selectByEntityIds(Set<Id> accountIds); // investor-detail distributions
Decimal               sumAmount();                      // dashboard/portfolio "Distributed to Date"
Decimal               sumAmountSince(Date sinceDate);   // "Distributed this period"
```

Fields: `Name, Investment__r.Investing_Entity__r.Name, Equity_Pct__c, Amount__c, Payment_Method__c, ACH_Status__c, Distribution_Date__c`.

#### `DistributionBatchSelector`

```apex
List<Distribution_Batch__c> selectAllWithOffering();        // batch table
List<Distribution_Batch__c> selectByOffering(Id offeringId);// workspace Distributions tab
Integer  countPendingApproval();                            // Status__c='Pending Approval'
List<AggregateResult> sumSplitAllBatches();                 // SUM(ACH_Amount__c), SUM(Cheque_Amount__c), SUM(Total_Amount__c)
List<AggregateResult> sumPaidMetricsSince(Date sinceDate);  // SUM(Total_Amount__c), SUM(Investor_Count__c) WHERE Status='Completed' & date
```

Fields: `Name, Offering__c, Offering__r.Name, Batch_Type__c, Total_Amount__c, Investor_Count__c, ACH_Amount__c, Cheque_Amount__c, Status__c, Distribution_Date__c`.

#### `WireSelector`

```apex
List<Wire__c> selectByOffering(Id offeringId);          // workspace Wire Matching tab
List<Wire__c> selectAllForFeed();                       // Payments screen wire feed
Integer       countByMatchStatus(String status);        // Console KPIs ('Review','Unmatched')
```

Fields: `Name, Sender_Name__c, Amount__c, Memo__c, Received_DateTime__c, Match_Confidence__c, Confidence_Bucket__c, Match_Status__c, Matched_Account__c, Matched_Account__r.Name, Offering__c`.

#### `ShareTransferSelector`

```apex
List<Share_Transfer__c> selectAll();                    // board + table
Integer countByStatus(String status);                   // KPI helper (or aggregate GROUP BY Status__c)
List<AggregateResult> countGroupedByStatus();           // lifecycle board counts in one query
```

Fields: `Name, Transferor_Investment__r.Investing_Entity__r.Name, Transferee_Account__r.Name, Offering_Name__c, Units_Transferred__c, Transfer_Amount__c, Status__c, Approval_Status__c, Transfer_Date__c`.

#### `SubscriptionDocSelector`

```apex
List<Subscription_Doc__c> selectByOffering(Id offeringId); // workspace Signatures tab
List<Subscription_Doc__c> selectUnsigned();                // Finalized__c = false (action queue)
Integer countUnsigned();
```

Fields: `Name, Investing_Entity__r.Name, Primary_Signature_Status__c, Secondary_Signature_Status__c, Finalized__c, Funding_Instructions_Status__c, Single_Signer__c`.

#### `WaitlistSelector`

```apex
List<Waitlist__c> selectByOffering(Id offeringId);      // workspace Waitlist tab (ORDER BY Position__c)
List<Waitlist__c> selectActive();                       // Status__c='Waitlisted' (action queue)
```

Fields: `Name, Position__c, Investing_Entity__r.Name, Amount__c, Added_Date__c, Auto_Promote__c, Status__c`.

#### `IRDocumentSelector`

```apex
List<IR_Document__c> selectAll();
List<IR_Document__c> selectByCategory(String category); // null/blank = all
List<IR_Document__c> selectByEntityIds(Set<Id> accountIds); // investor-detail docs
List<AggregateResult> countGroupedByCategory();         // KPI category counts
Integer countPortalVisible();                           // Portal_Visible__c = true
Integer countAll();
```

Fields: `Name, File_Name__c, Category__c, Offering__r.Name, Investing_Entity__r.Name, Uploaded_Date__c, Portal_Visible__c`.

#### `InvestorSelector`

```apex
List<Investor__c> selectAll();                          // list screen (+ Contact__r.Name, IR_Rep__r.Name)
List<Investor__c> selectByTier(String tier);            // null/blank = all
Investor__c       selectByIdWithContact(Id investorId); // detail summary cards
Integer           countActive();                        // Active_Investor__c = true
Decimal           sumLifetimeInvested();
Integer           countPendingAccreditation();          // Contact__r.Accreditation_Status__c='Pending'
```

Fields: `Name, Contact__c, Contact__r.Name, Contact__r.Accreditation_Status__c, Investor_Tier__c, KYC_Status__c, Lifetime_Invested__c, Total_Commitments__c, Active_Positions__c, Investing_Entities_Count__c, Last_Activity_Date__c, IR_Rep__c, IR_Rep__r.Name`.

#### `InvestingEntityContactSelector`

```apex
List<Investing_Entity_Contact__c> selectByContactId(Id contactId); // investor → entity Account ids
```

Fields: `Investing_Entity__c, Contact__c, Signer_Role__c`.

#### `LeadSelector`

```apex
List<Lead> selectOnboardingQueue();                     // IsConverted = false, ORDER BY CreatedDate DESC
List<AggregateResult> countGroupedByKycStatus();        // KPI tiles
Integer countInvited();                                 // Portal_Invite_Status__c='Invited'
Integer countOpen();
```

Fields: `Name, Company, Investor_Channel__c, Onboarding_KYC_Status__c, Portal_Invite_Status__c, CreatedDate`.

> **`AccountSelector` / `ContactSelector`:** not introduced by Phase B screens directly — all Account/Contact data is reached through parent-relationship fields (`Investing_Entity__r.Name`, `Contact__r.*`) on the IR selectors above. Do not add new Account/Contact selectors unless a reference one already exists in the codebase.

### 1.2 Controllers (one per screen · thin · `@AuraEnabled(cacheable=true)` · call selectors only)

| Controller                    | Method signature(s)                                                                                                                                                                                                                                                                                       | Returns                                                                                                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IRDashboardController`       | `getDashboard()`                                                                                                                                                                                                                                                                                          | `DashboardDTO`                                                                                                                                                                                                      |
| `IRConsoleController`         | `getConsole()`                                                                                                                                                                                                                                                                                            | `ConsoleDTO`                                                                                                                                                                                                        |
| `PortfolioController`         | `getPortfolio()`                                                                                                                                                                                                                                                                                          | `PortfolioDTO`                                                                                                                                                                                                      |
| `OfferingWorkspaceController` | `getHeader(Id offeringId)`; `getPropertyOverview(Id offeringId)`; `getRoster(Id offeringId)`; `getContributions(Id offeringId)`; `getDistributionBatches(Id offeringId)`; `getCommitments(Id offeringId)`; `getWireMatching(Id offeringId)`; `getSignatures(Id offeringId)`; `getWaitlist(Id offeringId)` | `OfferingHeaderDTO`; `PropertyOverviewDTO`; `List<RosterRowDTO>`; `List<ContributionRowDTO>`; `List<BatchRowDTO>`; `List<CommitmentRowDTO>`; `List<WireBucketDTO>`; `List<SignatureRowDTO>`; `List<WaitlistRowDTO>` |
| `OnboardingController`        | `getOnboarding()`                                                                                                                                                                                                                                                                                         | `OnboardingDTO`                                                                                                                                                                                                     |
| `DistributionsController`     | `getDistributions(Integer periodMonths)`; `getBatchDetail(Id batchId)`                                                                                                                                                                                                                                    | `DistributionsDTO`; `List<DistributionRowDTO>`                                                                                                                                                                      |
| `ShareTransferController`     | `getShareTransfers()`                                                                                                                                                                                                                                                                                     | `ShareTransferDTO`                                                                                                                                                                                                  |
| `DocumentController`          | `getDocuments(String category)`                                                                                                                                                                                                                                                                           | `DocumentsDTO`                                                                                                                                                                                                      |
| `PaymentsController`          | `getPayments(Integer periodMonths)`                                                                                                                                                                                                                                                                       | `PaymentsDTO`                                                                                                                                                                                                       |
| `InvestorListController`      | `getInvestors(String tier)`                                                                                                                                                                                                                                                                               | `List<InvestorRowDTO>`                                                                                                                                                                                              |
| `InvestorDetailController`    | `getInvestorDetail(Id investorId)`                                                                                                                                                                                                                                                                        | `InvestorDetailDTO`                                                                                                                                                                                                 |

**Controller responsibilities (all):** call the relevant selector method(s), compute derived values (percentages, splits) from the returned `AggregateResult`/records using in-memory arithmetic only, assemble DTOs, and wrap any exception in `AuraHandledException`. Each is `public with sharing`. No SOQL, no DML, no loops issuing queries.

**`InvestorDetailController.getInvestorDetail` cross-object chain** (no SOQL in controller — orchestrates selectors):

1. `InvestorSelector.selectByIdWithContact(investorId)` → summary fields + `Contact__c`.
2. `InvestingEntityContactSelector.selectByContactId(contactId)` → collect `Set<Id> accountIds`.
3. `InvestmentSelector.selectByEntityIds(accountIds)` → positions.
4. `CommitmentSelector.selectByEntityIds(accountIds)` → commitments.
5. `DistributionSelector.selectByEntityIds(accountIds)` → distributions.
6. `IRDocumentSelector.selectByEntityIds(accountIds)` → documents.
   Summary cards read the seeded `Investor__c` rollup fields directly (no recomputation needed in Phase B).

### 1.3 DTO catalog (top-level `public with sharing class`, all fields `@AuraEnabled`)

**Shared / reused**

```apex
class MetricDTO        { String key; String label; Decimal value; String displayValue; String unit; String trend; }
                       // unit ∈ {'currency','number','percent'}; displayValue pre-formatted for direct render
class OfferingProgressDTO { Id offeringId; String name; String offeringDisplayId; String status;
                            Decimal amountRaised; Decimal targetRaise; Decimal raisedPct;
                            Integer committedInvestorCount; Date closingDate; }
class FunnelStageDTO   { String label; Integer count; Decimal pct; }
class SplitSliceDTO    { String label; Decimal amount; Decimal pct; String colorToken; }
class ActionItemDTO    { Id recordId; String category; String label; String sublabel;
                         Decimal amount; String status; String objectApiName; }
class RosterRowDTO     { Id investmentId; String entityName; Decimal units; Decimal lpCapital;
                         Decimal equityPct; Decimal costBasis; String status; }
class ContributionRowDTO { Id recordId; String entityName; Decimal amount; String method;
                           String wireName; Date contributionDate; String matchStatus; }
class BatchRowDTO      { Id recordId; String name; String offeringName; String batchType; Decimal totalAmount;
                         Integer investorCount; Decimal achAmount; Decimal chequeAmount; String status; Date distDate; }
class DistributionRowDTO { Id recordId; String entityName; Decimal equityPct; Decimal amount;
                           String method; String achStatus; }
class CommitmentRowDTO { Id recordId; String entityName; Decimal committedAmount; String status; Date commitDate; Boolean funded; }
class WireRowDTO       { Id recordId; String sender; Decimal amount; String memo; Datetime received;
                         Integer confidence; String bucket; String matchStatus; String matchedAccount; }
class WireBucketDTO    { String bucket; Integer count; Decimal totalAmount; List<WireRowDTO> wires; }
class SignatureRowDTO  { Id recordId; String entityName; String primaryStatus; String secondaryStatus;
                         Boolean finalized; String fundingInstructions; Boolean singleSigner; }
class WaitlistRowDTO   { Id recordId; Integer position; String entityName; Decimal amount; Date added;
                         Boolean autoPromote; String status; }
class DocumentRowDTO   { Id recordId; String fileName; String category; String offeringName;
                         String entityName; Date uploaded; Boolean portalVisible; }
class CategoryCountDTO { String category; Integer count; }
```

**Screen wrappers**

```apex
class DashboardDTO     { List<MetricDTO> kpis; List<OfferingProgressDTO> activeOfferings; List<FunnelStageDTO> funnel; }
class ConsoleDTO       { List<MetricDTO> kpis; List<OfferingProgressDTO> activeOfferings;
                         List<SplitSliceDTO> distributionSplit; List<ActionItemDTO> actionQueue; }
class PortfolioDTO     { List<MetricDTO> kpis; List<PortfolioCardDTO> cards; }
class PortfolioCardDTO { Id offeringId; String offeringName; String propertyName; String propertyType;
                         Decimal occupancyPct; Decimal capRate; Decimal cashOnCash; Decimal irrToDate;
                         Decimal targetIrr; Decimal lpCapital; Integer investorCount; Decimal distributed;
                         Decimal targetIrrProgressPct; }
class OfferingHeaderDTO{ Id offeringId; String name; String offeringDisplayId; String status;
                         List<String> stages; Integer currentStageIndex; Decimal targetRaise; Decimal amountRaised;
                         Decimal raisedPct; Decimal overbookCap; Integer committedCount; Date closingDate; String gpEntity; }
class PropertyOverviewDTO { Id propertyId; String name; String propertyType; String address; String county;
                            String submarket; Decimal rentableSqFt; Decimal units; Integer yearBuilt; Integer yearRenovated;
                            Decimal occupancyPct; Decimal annualNoi; Decimal capRate; Decimal cashOnCash;
                            Decimal irrToDate; Decimal targetIrr; String projectedExit; Decimal lpCapital;
                            Decimal dpegStake; String lender; String debtStructure; }
class OnboardingDTO    { List<MetricDTO> kpis; List<LeadRowDTO> leads; }
class LeadRowDTO       { Id recordId; String name; String channel; String kycStatus; String portalStatus; Datetime created; }
class DistributionsDTO { List<MetricDTO> kpis; List<BatchRowDTO> batches; }
class ShareTransferDTO { List<MetricDTO> kpis; List<TransferLaneDTO> board; List<TransferRowDTO> transfers; }
class TransferLaneDTO  { String status; Integer count; List<TransferRowDTO> items; }
class TransferRowDTO   { Id recordId; String name; String fromEntity; String toEntity; String offeringName;
                         Decimal units; Decimal amount; String status; String approvalStatus; Date transferDate; }
class DocumentsDTO     { List<MetricDTO> kpis; List<CategoryCountDTO> categories; List<DocumentRowDTO> docs; }
class PaymentsDTO      { List<MetricDTO> kpis; List<WireRowDTO> wires; List<ContributionRowDTO> contributions; }
class InvestorRowDTO   { Id recordId; String investorName; String tier; Decimal lifetimeInvested;
                         Integer totalCommitments; Integer entitiesCount; String kycStatus;
                         Date lastActivity; String irRep; }
class InvestorDetailDTO{ Id investorId; String investorName; String tier; String kycStatus;
                         List<MetricDTO> summary; List<RosterRowDTO> positions; List<CommitmentRowDTO> commitments;
                         List<DistributionRowDTO> distributions; List<DocumentRowDTO> documents; }
```

### 1.4 KPI → SOQL aggregate map (computed from REAL seed; no hardcoded demo totals)

| Screen / KPI                                                                | Aggregate source                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard** Active Offerings                                              | `OfferingSelector.countActive()` (Status not Draft/Closed Funded)                                                                                                                                                                              |
| Total Committed $                                                           | `CommitmentSelector.sumCommittedAmount()` — `SUM(Committed_Amount__c)`                                                                                                                                                                         |
| Total Raised $                                                              | `OfferingSelector.sumAmountRaised()` — `SUM(Amount_Raised__c)`                                                                                                                                                                                 |
| Total Distributed $                                                         | `DistributionSelector.sumAmount()` — `SUM(Amount__c)`                                                                                                                                                                                          |
| Active Investors                                                            | `InvestorSelector.countActive()` — `Active_Investor__c = true`                                                                                                                                                                                 |
| Pending Accreditation                                                       | `InvestorSelector.countPendingAccreditation()` — `Contact__r.Accreditation_Status__c='Pending'`                                                                                                                                                |
| Funnel: Commitments → Funded Investments → Active                           | `CommitmentSelector.countAll()` → `InvestmentSelector.countFundedInvestments()` → `InvestmentSelector.countActive()`                                                                                                                           |
| **Console** Raised this period                                              | `ContributionSelector.selectRecent(sinceDate)` summed, OR add `sumAmountSince` — uses `periodMonths` window                                                                                                                                    |
| Wires in review / unmatched                                                 | `WireSelector.countByMatchStatus('Review' / 'Unmatched')`                                                                                                                                                                                      |
| Investor count                                                              | `InvestorSelector` count (all)                                                                                                                                                                                                                 |
| Onboarding queue                                                            | `LeadSelector.countOpen()`                                                                                                                                                                                                                     |
| Distribution Split donut                                                    | `DistributionBatchSelector.sumSplitAllBatches()` → ACH vs Cheque slices                                                                                                                                                                        |
| **Portfolio** Active Investments / LP Capital Deployed / Total LP Investors | `InvestmentSelector.countActive()` / `sumAmountFundedActive()` / `countDistinctActiveEntities()`                                                                                                                                               |
| Distributed to Date                                                         | `DistributionSelector.sumAmount()`                                                                                                                                                                                                             |
| Avg IRR                                                                     | `PropertySelector.avgIrrToDateActive()`                                                                                                                                                                                                        |
| Nearest Exit                                                                | `PropertySelector.selectActiveOrderByExit()` first row — **caveat:** `Projected_Exit__c` is Text ("Q3 2028"), so "nearest" is approximate; controller parses quarter/year for ordering. Surface as best-effort.                                |
| Portfolio cards                                                             | `InvestmentSelector.aggregateByOfferingActive()` (GROUP BY Offering**c: SUM LP capital, COUNT investors) + `OfferingSelector.selectActiveOrderByRaisedDesc()` for property fields + per-offering distributed via `Total_Distributed**c` rollup |
| **Onboarding** all tiles                                                    | `LeadSelector.countGroupedByKycStatus()` + `countInvited()`                                                                                                                                                                                    |
| **Distributions** Distributed this period / Investors paid / ACH%           | `DistributionBatchSelector.sumPaidMetricsSince(sinceDate)` + `sumSplitAllBatches()`                                                                                                                                                            |
| Pending approval                                                            | `DistributionBatchSelector.countPendingApproval()`                                                                                                                                                                                             |
| **Share Transfers** board + KPIs                                            | `ShareTransferSelector.countGroupedByStatus()` (one GROUP BY query)                                                                                                                                                                            |
| **Documents** total / by-category / portal-visible                          | `IRDocumentSelector.countAll()` + `countGroupedByCategory()` + `countPortalVisible()`                                                                                                                                                          |
| **Investors** list metrics                                                  | per-row from `Investor__c` seeded rollup fields                                                                                                                                                                                                |

> **Seed-date caveat (flag to developer):** contributions are seeded ~Apr 2025 and distributions ~Apr 2026 (today = 2026-06-05). A literal `THIS_QUARTER` window would zero-out several "this period" KPIs. The `periodMonths` design attribute (default **18**) keeps them non-zero against seed; the controller converts it to `Date sinceDate = Date.today().addMonths(-periodMonths)`.

---

## 2. LWC INVENTORY

### 2.1 Presentational components (stateless · props in / events out · NO Apex)

| Component         | `@api` props                                                                                             | Events                        | Notes                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| `kpiCard`         | `label`, `value` (string, pre-formatted), `unit`, `trend`, `iconName`, `accent` ('navy'\|'blue'\|'teal') | `select` (optional, on click) | SLDS card; accent stripe via brand token                               |
| `progressBar`     | `value`, `max`, `percent`, `label`, `variant` ('navy'\|'teal')                                           | —                             | CSS width %; aria `role="progressbar"` + `aria-valuenow/min/max`       |
| `donutChart`      | `slices` (`[{label,value,colorToken}]`), `size`, `centerLabel`, `centerValue`                            | `slicehover`                  | SVG `<circle>` `stroke-dasharray`; legend list                         |
| `funnelChart`     | `stages` (`[{label,count,pct}]`)                                                                         | —                             | Stacked CSS trapezoids; ordered list for SR                            |
| `statusBadge`     | `status`, `variantMap` (status→theme)                                                                    | —                             | SLDS badge; default map covers all lifecycle picklists                 |
| `stageTracker`    | `stages` (`[String]`), `currentIndex`                                                                    | `stageclick` (optional)       | `<ol>` with CSS connector line; 8-stage Offering path                  |
| `confidenceBadge` | `bucket` ('Auto-Settle'\|'Review'\|'Unmatched'), `confidence` (0–100)                                    | —                             | Color: ≥99 teal / 70–98 amber / <70 red                                |
| `tierPill`        | `tier` ('Anchor'\|'Active'\|'Dormant')                                                                   | —                             | Pill styling per tier                                                  |
| `sectionCard`     | `title`, `iconName`, `compact`                                                                           | — (slot `default`, `actions`) | Reusable card shell wrapping all content blocks                        |
| `dataTableCard`   | `title`, `columns` (datatable col defs), `rows`, `keyField`, `iconName`                                  | `rowaction`, `rowselect`      | Wraps `lightning-datatable` inside `sectionCard`; emits actions upward |

### 2.2 Feature components (one per screen area · imperative Apex · own state)

| Component                  | Controller method(s)                                          | Composes (presentational)                                                                                                                                                                  | Host                                       |
| -------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `irDashboard`              | `IRDashboardController.getDashboard`                          | 6× `kpiCard`, list of `progressBar` (active offerings), `funnelChart`, `sectionCard` (quick links — static markup)                                                                         | App Page `IR_Dashboard`                    |
| `irConsole`                | `IRConsoleController.getConsole`                              | `kpiCard`×6, `dataTableCard` (offerings + inline `progressBar` cell), `donutChart` (ACH/Cheque), `sectionCard`+`statusBadge` (action queue), `sectionCard` (automation baselines — static) | App Page `IR_Console`                      |
| `irPortfolio`              | `PortfolioController.getPortfolio`                            | `kpiCard`×6, per-offering `sectionCard` cards each with property metrics + `progressBar` (target-IRR progress)                                                                             | App Page `Active_Investments`              |
| `offeringWorkspace`        | (host only — owns `lightning-tabset`, reads `@api recordId`)  | `offeringHeader` + 8 tab feature children below                                                                                                                                            | `Offering__c` record page                  |
| `offeringHeader`           | `OfferingWorkspaceController.getHeader(offeringId)`           | `stageTracker`, `kpiCard`×6                                                                                                                                                                | child of `offeringWorkspace`               |
| `offeringPropertyOverview` | `getPropertyOverview(offeringId)`                             | `sectionCard` (detail + financial snapshot grid)                                                                                                                                           | tab                                        |
| `offeringRoster`           | `getRoster(offeringId)`                                       | `dataTableCard` (+ `statusBadge` cell)                                                                                                                                                     | tab                                        |
| `offeringContributions`    | `getContributions(offeringId)`                                | `dataTableCard` (+ `statusBadge` for Match Status)                                                                                                                                         | tab                                        |
| `offeringDistributions`    | `getDistributionBatches(offeringId)`                          | `dataTableCard` (+ `statusBadge`)                                                                                                                                                          | tab                                        |
| `offeringCommitments`      | `getCommitments(offeringId)`                                  | `dataTableCard` (+ `statusBadge`)                                                                                                                                                          | tab                                        |
| `offeringWireMatching`     | `getWireMatching(offeringId)`                                 | 3× `sectionCard` (buckets) each listing rows with `confidenceBadge`                                                                                                                        | tab                                        |
| `offeringSignatures`       | `getSignatures(offeringId)`                                   | `dataTableCard` (+ `statusBadge` per signer)                                                                                                                                               | tab                                        |
| `offeringWaitlist`         | `getWaitlist(offeringId)`                                     | `dataTableCard` ordered by position                                                                                                                                                        | tab                                        |
| `irOnboarding`             | `OnboardingController.getOnboarding`                          | `kpiCard`×5, `dataTableCard` (lead queue + `statusBadge`)                                                                                                                                  | App Page `IR_Onboarding`                   |
| `irDistributions`          | `DistributionsController.getDistributions`, `.getBatchDetail` | `kpiCard`×4, `dataTableCard` (batch list), on row-select loads `dataTableCard` (batch detail) — master/detail in one component                                                             | App Page `IR_Distributions` (NEW — see §3) |
| `irShareTransfers`         | `ShareTransferController.getShareTransfers`                   | `kpiCard`×4, `sectionCard` lifecycle board (lanes w/ `statusBadge`), `dataTableCard` (table)                                                                                               | App Page `IR_Share_Transfers` (NEW)        |
| `irDocuments`              | `DocumentController.getDocuments(category)`                   | `kpiCard` (total + per-category counts), `lightning-button-group` category filter, `dataTableCard` (+ portal-visible icon)                                                                 | App Page `IR_Documents` (NEW)              |
| `irPayments`               | `PaymentsController.getPayments`                              | `dataTableCard` (wires + `confidenceBadge`/`statusBadge`), `dataTableCard` (contributions + `statusBadge`)                                                                                 | App Page `IR_Payments`                     |
| `irInvestorList`           | `InvestorListController.getInvestors(tier)`                   | tier filter (`lightning-button-group`), `dataTableCard` (+ `tierPill`, `statusBadge`); row click → `NavigationMixin` to Investor record                                                    | App Page `IR_Investors` (NEW)              |
| `irInvestorDetail`         | `InvestorDetailController.getInvestorDetail(recordId)`        | 5× `kpiCard` (summary), 4× `dataTableCard` (positions / commitments / distributions / documents)                                                                                           | `Investor__c` record page                  |

**Imperative pattern (all feature components):** call the controller in `connectedCallback()` (or on filter-change for `irDocuments`/`irInvestorList`); store result in tracked state; render loading spinner / error toast / empty state. Use `NavigationMixin` only for record navigation (no LDS reads).

### 2.3 Page-level exposure

Feature components placed directly on a page set `isExposed=true` with the right `targets` in their `*.js-meta.xml`:

- App-Page hosts (`irDashboard`, `irConsole`, `irPortfolio`, `irOnboarding`, `irPayments`, `irDistributions`, `irShareTransfers`, `irDocuments`, `irInvestorList`): target `lightning__AppPage`.
- Record-page hosts (`offeringWorkspace`, `irInvestorDetail`): target `lightning__RecordPage` (and expose `recordId` automatically). `irDistributions` may set `periodMonths` as an App-Builder property (`<targetConfig>`).
- Tab children of `offeringWorkspace` and all presentational components are internal — `isExposed=false`.

### 2.4 Shared utilities (`lwc/utils*` — lowerCamelCase JS, no `.html`)

| Module        | Purpose                                                                                                                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `utilsFormat` | `formatCurrency()`, `formatPercent()`, `formatNumber()`, `formatDate()` — used to render DTO values (controllers also send pre-formatted `displayValue` for KPIs; tables format client-side).                                                  |
| `utilsBrand`  | Exports DPEG brand hex/token constants for SVG fills (donut/funnel) — `{ navy:'#032D60', blue:'#0070D2', teal:'#2BAFAC', amber, red, grey }`. SVG cannot consume CSS vars reliably across all renderers, so chart fills read from this module. |
| `utilsToast`  | `showError(cmp, error)` — normalizes `AuraHandledException` body + fires `ShowToastEvent`.                                                                                                                                                     |

---

## 3. FLEXIPAGE WIRING

### 3.1 Existing App-Page placeholders → component replacement

| FlexiPage (Phase A placeholder) | Phase B: remove RichText placeholder, add region with |
| ------------------------------- | ----------------------------------------------------- |
| `IR_Dashboard`                  | `irDashboard`                                         |
| `IR_Console`                    | `irConsole`                                           |
| `Active_Investments`            | `irPortfolio`                                         |
| `IR_Onboarding`                 | `irOnboarding`                                        |
| `IR_Payments`                   | `irPayments`                                          |

### 3.2 NEW App Pages required (Phase A only built 5 placeholders; screens 6/7/8/10-list are object tabs with no rich host)

Create 4 new App-Page FlexiPages and **re-point the `Investor_Relations` app nav items** (Distributions, Share Transfers, Documents, Investors) from their object tabs to these pages (object tabs remain reachable via App Launcher / related lists):

| New FlexiPage        | Hosts              | Nav item re-pointed |
| -------------------- | ------------------ | ------------------- |
| `IR_Distributions`   | `irDistributions`  | Distributions       |
| `IR_Share_Transfers` | `irShareTransfers` | Share Transfers     |
| `IR_Documents`       | `irDocuments`      | Documents           |
| `IR_Investors`       | `irInvestorList`   | Investors           |

> **Decision to confirm:** this adds 4 App Pages + nav re-point beyond Phase A's 5 placeholders. Alternative = leave those as standard list-view tabs and only ship the record-page detail. Recommendation: create the 4 App Pages (the screens are list/dashboard style, not record style). Flag to user at Gate 1.

### 3.3 Record-page composition

- **`Offering__c` record page** (Lightning Record Page): single full-width region hosting `offeringWorkspace`. `offeringWorkspace` renders `offeringHeader` (full width) above a `lightning-tabset` whose 8 tabs lazy-load `offeringPropertyOverview`, `offeringRoster`, `offeringContributions`, `offeringDistributions`, `offeringCommitments`, `offeringWireMatching`, `offeringSignatures`, `offeringWaitlist` (each receives `offeringId = recordId`). Tab order mirrors the mockup.
- **`Investor__c` record page**: single region hosting `irInvestorDetail` (`recordId` auto-bound). Standard activity/related panels optional in a second column.

---

## 4. SLDS 2 TOKENS & RESPONSIVE GRID

### 4.1 Brand tokens

Define DPEG brand as CSS custom properties on each **page-level feature component's** `:host` (children inherit). Map to SLDS 2 global hooks where a hook exists; otherwise use the custom property directly.

```css
:host {
  --dpeg-navy: #032d60; /* headers, KPI accent stripe, stage-tracker active */
  --dpeg-blue: #0070d2; /* links, progress fill, primary accents */
  --dpeg-teal: #2bafac; /* positive/status accents, ACH slice */
  /* map onto SLDS 2 global styling hooks used by SLDS components: */
  --slds-g-color-brand-base-50: var(--dpeg-blue);
  --slds-g-color-accent-container-1: var(--dpeg-teal);
}
```

- **Charts (SVG):** fills come from `utilsBrand` JS constants (navy/blue/teal + amber/red/grey for confidence + status), not CSS vars.
- **Layout/spacing/radius:** use SLDS 2 tokens only — `--slds-g-spacing-*`, `--slds-g-radius-border-*`, `--slds-g-sizing-*`. No hardcoded px for spacing/colors (SLDS linter enforced).

### 4.2 Responsive grid

- KPI rows: `lightning-layout multiple-rows` + `lightning-layout-item size="12" small-device-size="6" medium-device-size="4" large-device-size="2"` (6 KPIs → 2-up mobile, 6-up desktop).
- Portfolio/offering cards: `size="12" medium="6" large="4"`.
- Workspace header KPIs + tabset: full width, single column.
- Tables: `dataTableCard` width 100%, horizontal scroll on small devices.

---

## 5. TESTING

### 5.1 Jest (`__tests__/<component>.test.js` per LWC) + `@sa11y/jest`

| Test type  | Coverage                                                                                                                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Render** | Component mounts; with mocked data, asserts expected DOM (KPI count, table rows, chart `<circle>`/`<li>` count, stage-tracker active index).                                                                                                                                        |
| **Data**   | `jest.mock('@salesforce/apex/<Controller>.<method>')` resolving a fixture DTO; assert values bound correctly; assert loading→loaded transition; assert empty-state render when DTO lists are empty; assert error path (rejected promise → toast).                                   |
| **Events** | Presentational: fire `select`/`rowaction`/`stageclick` and assert `CustomEvent` detail. Feature: simulate filter change (`irDocuments` category, `irInvestorList` tier) → assert controller re-invoked with new arg; simulate row click → assert `NavigationMixin` navigate called. |
| **a11y**   | `await expect(element).toBeAccessible()` for every component (presentational + feature). Charts must expose SR-readable lists/labels; progress bars expose aria attrs.                                                                                                              |

Fixtures: one JSON DTO fixture per controller method under each bundle's `__tests__/data/`.

### 5.2 Apex tests (one test class per controller + per selector · 90%+ each)

- **Data:** build via `TestDataFactory` only. **New builder methods required** — Phase B introduces objects the factory does not yet cover: `Property__c`, `Wire__c`, `Distribution_Batch__c`, `Subscription_Doc__c`, `IR_Document__c`, `Waitlist__c`, `Transfer_Document__c`, plus `Lead` IR fields and linking helpers (Investor→Contact→IEC→Account chain). Add these builders following existing factory patterns (do not use `SeeAllData`). **Flag to developer.**
- **Bulk-safe:** selector and aggregate tests insert **251+** records (per `bulk-test-rule.md`) and assert aggregate totals/counts equal the inserted volume — verifies no SOQL-in-loop and correct GROUP BY math.
- **DTO assertions:** assert each DTO field is populated and derived values (percent, split, funnel counts) are correct against known seed math.
- **FLS / sharing:** because selectors use `WITH USER_MODE`, add a `System.runAs` test with a user granted an IR permission set to confirm queries return rows; optionally a negative test (no perm set) confirming access is restricted.
- **Cacheable methods** are invoked directly in tests (cacheable does not block test invocation).
- After any test-factory change, **re-run the full suite** (`sf apex run test --test-level RunLocalTests`) to confirm no Phase A regression.

---

## 6. BUILD SPLIT (4 focused developer runs · each independently deployable after Run 1)

> Run 1 ships the shared foundation; Runs 2–4 each add controllers + feature LWCs + page wiring and deploy on their own. Within each run the developer follows the per-type skill→API-context→generate loop (`salesforce-global-rule.md`) and the Apex layering rules.

| Run                                                           | Deliverables                                                                                                                                                                                                                                                                                                                             | Independently deployable?       |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **Run 1 — Foundation + Dashboard/Console**                    | ALL **selectors** (§1.1) · ALL **DTO classes** (§1.3) · ALL **presentational** LWCs (§2.1) · **utils** (`utilsFormat`, `utilsBrand`, `utilsToast`) · `IRDashboardController`, `IRConsoleController` + tests · `irDashboard`, `irConsole` + Jest · wire `IR_Dashboard`, `IR_Console` FlexiPages · `TestDataFactory` new builders (§5.2)   | Yes — self-contained foundation |
| **Run 2 — Offering Workspace**                                | `OfferingWorkspaceController` (9 methods) + tests · `offeringWorkspace` + 9 child feature LWCs (`offeringHeader` … `offeringWaitlist`) + Jest · `Offering__c` record-page composition                                                                                                                                                    | Yes (depends on Run 1)          |
| **Run 3 — Portfolio + Distributions + Payments + Onboarding** | `PortfolioController`, `DistributionsController`, `PaymentsController`, `OnboardingController` + tests · `irPortfolio`, `irDistributions`, `irPayments`, `irOnboarding` + Jest · wire `Active_Investments`, `IR_Payments`, `IR_Onboarding` + create/wire `IR_Distributions` (new App Page)                                               | Yes (depends on Run 1)          |
| **Run 4 — Share Transfers + Documents + Investors**           | `ShareTransferController`, `DocumentController`, `InvestorListController`, `InvestorDetailController` + tests · `irShareTransfers`, `irDocuments`, `irInvestorList`, `irInvestorDetail` + Jest · create/wire `IR_Share_Transfers`, `IR_Documents`, `IR_Investors` (new App Pages) + `Investor__c` record-page composition + nav re-point | Yes (depends on Run 1)          |

---

## 7. OPEN DECISIONS TO CONFIRM (Gate 1)

1. **4 new App Pages + nav re-point** for Distributions / Share Transfers / Documents / Investors (§3.2). Recommended — confirm vs. leaving them as standard list tabs.
2. **`periodMonths` default = 18** for "this period" KPIs so they're non-zero against seed dates (§1.4). Confirm window.
3. **"Nearest Exit"** derived from Text `Projected_Exit__c` is best-effort ordering (§1.4). Confirm acceptable for Phase B (vs. adding a real Date field — that would be a Phase A schema change).
4. **`TestDataFactory` extension** with builders for the 7 uncovered objects is in-scope for Phase B Apex tests (§5.2). Confirm the developer should add them.
