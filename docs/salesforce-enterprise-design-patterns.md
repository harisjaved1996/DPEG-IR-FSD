# Salesforce Enterprise Design Patterns for DPEG

**Client:** Dhanani Private Equity Group (DPEG)
**Prepared by:** Avanza Solutions
**API Version:** 66.0
**Last Updated:** April 2026

This reference guide documents enterprise-grade design patterns for the DPEG Salesforce platform. It covers patterns from domain-driven design (DDD), event-driven architecture, integration, security, and LWC UI layers, with concrete mappings to DPEG's four modules (Acquisitions, Transaction Management, Disposition, Investor Relations) and integration systems (ASB, Plaid, Yardi, Procore, CoStar).

---

## Table of Contents

1. [Apex Enterprise Patterns (fflib / Apex Common)](#1-apex-enterprise-patterns-fflib--apex-common)
2. [Trigger Handler Pattern](#2-trigger-handler-pattern)
3. [Invocable Apex & Flow Integration Patterns](#3-invocable-apex--flow-integration-patterns)
4. [Event-Driven Architecture Patterns](#4-event-driven-architecture-patterns)
5. [Integration Architecture Patterns](#5-integration-architecture-patterns)
6. [Security Patterns](#6-security-patterns)
7. [Governor Limit & Performance Patterns](#7-governor-limit--performance-patterns)
8. [LWC Design Patterns](#8-lwc-design-patterns)
9. [Anti-Patterns to Avoid](#9-anti-patterns-to-avoid)
10. [Strategy, Facade, Decorator, Factory Patterns](#10-strategy-facade-decorator-factory-patterns)
11. [DPEG Implementation Roadmap](#11-dpeg-implementation-roadmap)

---

## 1. Apex Enterprise Patterns (fflib / Apex Common)

### 1.1 Domain-Driven Design: Domain, Service, Selector, Unit of Work

#### Pattern Overview

The fflib Apex Enterprise Patterns library implements a layered architecture inspired by Domain-Driven Design (DDD) and Object-Oriented Programming (OOP) principles. The pattern separates concerns across four layers:

- **Selector Layer** — All SOQL queries for a given object
- **Domain Layer** — Per-object business rules and state transitions (fine-grained services)
- **Service Layer** — Cross-object orchestration and transactional workflows (coarse-grained services)
- **Unit of Work** — Transaction boundary management, deferred DML, change tracking

#### When to Use

Use fflib patterns when:
- Building enterprise-scale solutions with multiple modules interacting across objects
- Complex business rules must be testable and maintainable
- CRUD/FLS enforcement and sharing are mandatory
- Batch processing or bulk operations are common
- Multiple Apex services share queries on the same objects

#### DPEG Implementation Guidance

**DPEG's Apex Layering (from ARCHITECTURE.md §2):**

| Layer | File Pattern | DPEG Responsibility |
|-------|-------------|---------------------|
| **Trigger** | `<Object>Trigger.trigger` | Thin delegate; no logic |
| **Trigger Handler** | `<Object>TriggerHandler.cls` | Routes before/after insert/update/delete/undelete to domain methods |
| **Domain** | `<Object>Domain.cls` | Per-object business rules; operates on collections (`List<SObject>`) |
| **Service** | `<Feature>Service.cls` | Cross-object orchestration; invoked from LWC/Flow/Trigger |
| **Selector** | `<Object>Selector.cls` | All SOQL; enforces `WITH USER_MODE` (API 66.0) |
| **DTO** | `<Feature>DTO.cls` | Input/output for REST/`@AuraEnabled` |

**DPEG-Specific Services:**

| Service Class | Modules | Purpose |
|---------------|---------|---------|
| `LeadConversionService` | Acquisitions + IR | Conversions 1 & 7 — broker/investor dedup, Account/Contact creation |
| `ContractHandoffService` | Acquisitions → Transaction + IR | Conversions 2 & 3 — create Transaction__c + Offering__c when Contract_Signed__c = TRUE |
| `ClosingService` | Transaction | Conversion 4 — promote Property__c to Property_Asset__c on close |
| `PlaidContributionService` | IR | Conversion 8 — reconcile Contribution__c, create Investment__c |
| `ShareTransferService` | IR | Conversion 9 — execute transfer: reduce transferor, create transferee, preserve cost basis |
| `DistributionBatchService` | IR | Build Plaid batch payload, call ASB endpoint, handle transfer IDs |
| `SellMeterService` | Disposition | Recalculate Sell_Meter__c on NOI/cap rate change; alert principals on GREEN |
| `PlaidCalloutService` | IR | All ASB/Plaid callouts; mocked via HttpCalloutMock in tests |

#### Code Structure Example

```apex
// Selector Layer — AccountSelector.cls
with sharing class AccountSelector {
    public List<Account> selectByIdWithInvestments(Set<Id> accountIds) {
        return [
            SELECT Id, Name, Account_Type__c, Entity_Type__c, Total_Invested__c,
                   (SELECT Id, Amount_Funded__c FROM Investments__r)
            FROM Account
            WHERE Id IN :accountIds
            WITH USER_MODE
        ];
    }
}

// Domain Layer — AccountDomain.cls
with sharing class AccountDomain extends fflib_SObjectDomain {
    public override void onAfterInsert() {
        markInvestingEntitiesAsActive(records);
    }

    private void markInvestingEntitiesAsActive(List<Account> entities) {
        // Business logic specific to Account
    }
}

// Service Layer — LeadConversionService.cls
with sharing class LeadConversionService {
    public static void convertBrokerLeads(List<Lead> leads) {
        // Orchestrate Account, Contact, Property__c creation
        // Use AccountSelector to check existing brokers (dedup)
        // Use AccountDomain to apply business rules
    }
}
```

#### References

- [GitHub - apex-enterprise-patterns/fflib-apex-common](https://github.com/apex-enterprise-patterns/fflib-apex-common)
- [Apex Enterprise Patterns: Domain & Selector Layers — Trailhead](https://trailhead.salesforce.com/content/learn/modules/apex_patterns_dsl)
- [fflib.dev Documentation](https://fflib.dev/docs)

---

### 1.2 Unit of Work Pattern

#### Pattern Overview

The Unit of Work pattern manages a transaction boundary and defers DML operations until a single `commitWork()` call. This ensures atomicity, prevents partial updates, and simplifies rollback scenarios.

#### DPEG Implementation Guidance

Use Unit of Work when:
- **Conversions 2–4** (Contract Handoff, Plaid Reconciliation, Closing) require multi-object atomicity
- **Distribution Batch** must insert `Distribution__c` records and call Plaid in one atomic operation
- **Share Transfer Execution (Conversion 9)** requires simultaneous creation of new `Investment__c` and update of transferor

#### Code Structure Example

```apex
// Service using Unit of Work
with sharing class ClosingService {
    public static void promotePropertyToAsset(List<Transaction__c> closedTransactions) {
        fflib_ISObjectUnitOfWork uow = Application.UnitOfWork.newInstance();

        for (Transaction__c txn : closedTransactions) {
            Property_Asset__c asset = new Property_Asset__c(
                Property__c = txn.Property__c,
                Status__c = 'Active',
                AUM_Value__c = txn.Closing_Amount__c
            );
            uow.registerNew(asset);
        }

        uow.commitWork();
    }
}
```

---

## 2. Trigger Handler Pattern

### 2.1 Pattern Overview

A trigger handler is a base class (`TriggerHandler`) that encapsulates trigger logic in a reusable, testable framework. The trigger itself becomes a thin delegate — one line of code — that calls `TriggerHandler.run()`. The handler routes to context-specific methods (`beforeInsert()`, `afterUpdate()`, etc.) and manages recursion prevention.

#### Why Use It

- **Testability:** No need to mock entire trigger context
- **Reusability:** Inherit the base class for all triggers
- **Recursion Prevention:** Built-in max loop count enforcement
- **Readability:** Clear separation of `before/after insert/update/delete/undelete` logic

### 2.2 DPEG Implementation Guidance

DPEG requires handlers for:

| Object | Trigger Handler | Responsibility |
|--------|-----------------|----------------|
| `Lead` | `LeadTriggerHandler` | Route to LeadConversionService for Conversions 1 & 7 |
| `Transaction__c` | `TransactionTriggerHandler` | Route stage changes to SellMeterService; validate Critical_Date__c |
| `Opportunity` | `OpportunityTriggerHandler` | Route Contract_Signed__c = TRUE to ContractHandoffService |
| `Disposition__c` | `DispositionTriggerHandler` | Route NOI/cap rate changes to SellMeterService; validate Sell_Meter__c |
| `Contribution__c` | `ContributionTriggerHandler` | Route match status changes to PlaidContributionService (Conversion 8) |
| `Investment__c` | `InvestmentTriggerHandler` | Trigger Investment__c creation workflow post-Plaid reconciliation |
| `Distribution__c` | `DistributionTriggerHandler` | Route status changes to portal notification flow |
| `Share_Transfer__c` | `ShareTransferTriggerHandler` | Route approval status changes to ShareTransferService (Conversion 9) |

### 2.3 Code Structure Example

```apex
// Trigger (ONE line)
trigger TransactionTrigger on Transaction__c (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    new TransactionTriggerHandler().run();
}

// Handler
with sharing class TransactionTriggerHandler extends TriggerHandler {

    public override void afterUpdate() {
        List<Transaction__c> stagedTransactions = filterByStageChange(
            (List<Transaction__c>) Trigger.new,
            (Map<Id, Transaction__c>) Trigger.oldMap
        );
        if (!stagedTransactions.isEmpty()) {
            SellMeterService.recalculateOnTransactionStageChange(stagedTransactions);
        }
    }

    public override void beforeInsert() {
        validateCriticalDates((List<Transaction__c>) Trigger.new);
    }
}
```

#### References

- [Kevin O'Hara's Trigger Framework](https://github.com/kevinohara80/sfdc-trigger-framework)
- [Trigger Framework in Salesforce — Apex Hours](https://www.apexhours.com/trigger-framework-in-salesforce/)

---

## 3. Invocable Apex & Flow Integration Patterns

### 3.1 Pattern Overview

Invocable Apex methods allow Flow Builder to call complex Apex logic without requiring a controller or REST endpoint. The `@InvocableMethod` annotation exposes an Apex method as a Flow action, with input/output parameters typed to collections for bulkification.

#### When to Use

- Flow cannot express the business logic (complex conditionals, calculations, lookups)
- Bulk processing is required (handle 251+ records in a single Flow execution)
- Reuse the same logic across multiple Flows
- Integrate external systems (Plaid, Yardi, CoStar) from declarative automation

### 3.2 DPEG-Specific Use Cases

| Flow | Invocable Service | Purpose |
|------|-------------------|---------|
| Contract Handoff (Conversions 2 & 3) | `ContractHandoffService.execute()` | Bulk Transaction__c + Offering__c creation |
| IR Lead Auto-Conversion (Conversion 7) | `LeadConversionService.convertInvestorLeads()` | Bulk Account + Contact + Investor__c creation |
| Plaid Contribution Reconcile | `PlaidContributionService.reconcileContributions()` | Match Plaid wires to Contribution__c; create Investment__c |
| Distribution Batch Execution | `DistributionBatchService.executeBatch()` | Build Plaid transfer payloads; call ASB endpoint |
| Share Transfer Approval → Execution | `ShareTransferService.executeApprovedTransfers()` | Bulk transfer: reduce transferor, create transferee |
| Sell Meter Recalculation | `SellMeterService.recalculateOnMetricsChange()` | Recalc NOI-driven Sell_Meter__c; alert principals on GREEN |

### 3.3 Code Structure Example

```apex
with sharing class PlaidContributionService {

    @InvocableMethod(label='Reconcile Plaid Contributions'
                     description='Matches Plaid wires to Contribution records; creates Investment__c on full funding')
    public static List<ContributionResultDTO> reconcileContributions(List<ContributionInputDTO> inputs) {
        Set<Id> contributionIds = new Set<Id>();
        for (ContributionInputDTO input : inputs) {
            contributionIds.add(input.contributionId);
        }

        ContributionSelector selector = new ContributionSelector();
        List<Contribution__c> contributions = selector.selectById(contributionIds);

        ContributionDomain domain = new ContributionDomain(contributions);
        domain.reconcileWithPlaidMatches();

        fflib_ISObjectUnitOfWork uow = Application.UnitOfWork.newInstance();
        uow.registerDirty(domain.getRecords());
        uow.commitWork();

        List<ContributionResultDTO> results = new List<ContributionResultDTO>();
        for (Contribution__c contrib : contributions) {
            results.add(new ContributionResultDTO(contrib));
        }
        return results;
    }
}

public class ContributionInputDTO {
    @InvocableVariable(label='Contribution Record ID' required=true)
    public String contributionId;
}

public class ContributionResultDTO {
    @InvocableVariable public String status;
    @InvocableVariable public String message;

    public ContributionResultDTO(Contribution__c contrib) {
        this.status  = contrib.Match_Status__c;
        this.message = 'Reconciled: ' + contrib.Amount__c;
    }
}
```

#### Key Rules for DPEG

1. **Always accept collections.** Even if processing one record, input must be `List<SomeType>`.
2. **Always return collections.** Output must be `List<ResultDTO>`.
3. **Bulkify all operations.** No SOQL/DML inside loops.
4. **Use Selectors for queries.** Never inline SOQL in an invocable method.
5. **Throw `AuraHandledException` for errors.** Flow catches it and displays user-safe messages.

#### References

- [Invocable Apex Methods — Salesforce Ben](https://www.salesforceben.com/salesforce-invocable-apex-methods-a-complete-breakdown/)
- [Integration Patterns and Practices v66.0 PDF](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/integration_patterns_and_practices.pdf)

---

## 4. Event-Driven Architecture Patterns

### 4.1 Platform Events vs. Change Data Capture

#### Pattern Overview

Salesforce supports two event-driven mechanisms:

1. **Platform Events** — Custom, business-event messages (e.g., "OfferingLaunched", "InvestmentFunded"). Published explicitly via Apex or Flow. Subscribers consume events in near-real-time.
2. **Change Data Capture (CDC)** — Automatic change notifications on standard/custom objects. Subscribers receive low-level data deltas.

#### When to Use

| Scenario | Use Platform Events | Use CDC |
|----------|---------------------|---------|
| Business event: "Investment funded" | ✓ | |
| Data changed: "Account.Name updated from X to Y" | | ✓ |
| Real-time sync to external system (Plaid, Yardi) | ✓ | |
| Audit trail of field changes | | ✓ |
| Multi-tenant integration | ✓ | |

### 4.2 DPEG-Specific Use Cases

**Platform Events (Business):**

| Event | Publisher | Subscribers | Purpose |
|-------|-----------|-------------|---------|
| `OfferingLaunched__e` | `OfferingService` | Marketing Cloud Flow, LMS broadcast | Trigger investor campaign email blast |
| `InvestmentFunded__e` | `PlaidContributionService` | Portal notification Flow, IR portal refresh | Notify investor of funded position |
| `DistributionBatched__e` | `DistributionBatchService` | ASB webhook listener, IR dashboard | Trigger Plaid ACH initiation |
| `SellMeterGreen__e` | `SellMeterService` | Apex trigger for principal alerts | Trigger "Property ready to sell" notification to Ali + Principals |
| `ShareTransferApproved__e` | `ShareTransferService` | Execution Flow, Investor portal notification | Execute share transfer; notify transferor + transferee |

**Change Data Capture (Data Changes):**

| Object | CDC Enabled | Purpose |
|--------|-------------|---------|
| `Distribution__c` | Yes | Track ACH_Status__c changes (Pending → Posted → Failed) for audit |
| `Investment__c` | Yes | Track Amount_Funded__c, Status__c changes; historical cost basis preservation |
| `Commitment__c` | Yes | Track Status__c transitions (Committed → Funded → Cancelled) |

### 4.3 Code Structure Example — Platform Events

```apex
// Publisher: Offering Service
with sharing class OfferingService {
    public static void launchOffering(List<Offering__c> offerings) {
        List<OfferingLaunched__e> events = new List<OfferingLaunched__e>();

        for (Offering__c off : offerings) {
            events.add(new OfferingLaunched__e(
                offering_id__c   = off.Id,
                target_raise__c  = off.Target_Raise__c,
                launch_date__c   = off.Launch_Date__c
            ));
        }

        EventBus.publish(events);
    }
}

// Subscriber Trigger Handler
with sharing class OfferingLaunchedHandler {
    public static void handleOfferingLaunched(List<OfferingLaunched__e> events) {
        Set<Id> offeringIds = new Set<Id>();
        for (OfferingLaunched__e evt : events) {
            offeringIds.add(evt.offering_id__c);
        }

        OfferingSelector selector = new OfferingSelector();
        List<Offering__c> offerings = selector.selectById(offeringIds);

        MarketingCloudService.triggerCampaign(offerings);
    }
}
```

#### References

- [Understanding Change Data Capture — Trailhead](https://trailhead.salesforce.com/content/learn/modules/change-data-capture/understand-change-data-capture)
- [Integration Using CDC and Platform Events — Salesforce Ben](https://www.salesforceben.com/integration-using-change-data-capture-and-platform-events/)
- [Design Considerations for CDC and Platform Events](https://developer.salesforce.com/blogs/2022/10/design-considerations-for-change-data-capture-and-platform-events)

---

## 5. Integration Architecture Patterns

### 5.1 Request-Reply Pattern

#### Pattern Overview

The calling system (Salesforce) sends a synchronous request to a remote system and blocks execution until receiving a response. Used for real-time lookups, validations, or data transformations.

#### DPEG Use Cases

| Integration | System | Scenario |
|-------------|--------|----------|
| CoStar Market Data Lookup | CoStar REST API (via ASB) | When creating Underwriting_Result__c, fetch live market cap rate for IRR calculation |
| Yardi Tenant Lookup | Yardi SOAP (via ASB adapter) | When creating Lease__c, validate tenant exists in Yardi |
| Plaid Account Verification | Plaid Auth API (via ASB) | When linking Investing_Entity__c bank account, verify routing + account numbers |

#### Implementation Pattern

```apex
with sharing class MarketDataService {
    public static void enrichUnderwritingWithCoStar(List<Underwriting_Result__c> results) {
        Set<Id> propertyIds = new Set<Id>();
        for (Underwriting_Result__c ur : results) {
            propertyIds.add(ur.Property__c);
        }

        PropertySelector selector = new PropertySelector();
        List<Property__c> properties = selector.selectById(propertyIds);

        // Synchronous callout to ASB → CoStar
        Map<String, Decimal> costarCapRates = PlaidCalloutService.fetchCoStarCapRates(properties);

        for (Underwriting_Result__c ur : results) {
            String subMarket = ur.Property__r.SubMarket__c;
            if (costarCapRates.containsKey(subMarket)) {
                ur.Market_Cap_Rate__c = costarCapRates.get(subMarket);
            }
        }
    }
}

// Mock for tests
global class CoStarCalloutMock implements HttpCalloutMock {
    global HttpResponse respond(HttpRequest req) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"cap_rate": 0.045}');
        res.setStatusCode(200);
        return res;
    }
}
```

**Characteristics:** Synchronous · Blocking · Real-time · Tightly coupled to responder availability

---

### 5.2 Fire-and-Forget Pattern

#### Pattern Overview

The calling system sends a request to a remote system and **does not wait for a response**. Ideal for notifications, logging, and asynchronous data delivery.

#### DPEG Use Cases

| Integration | System | Scenario |
|-------------|--------|----------|
| Plaid Distribution Initiation | Plaid Transfer API (via ASB) | When batch approved, send Distribution__c records to Plaid for ACH; don't wait for posting |
| Principal Alert on Sell Meter GREEN | Custom Email | Send "Property ready to sell" notification; don't block Property_Asset__c update |
| Portal Notification | Experience Cloud | When Distribution__c posted, notify investor; don't wait for portal refresh |

#### Implementation Pattern

```apex
// Enqueue Queueable for fire-and-forget
with sharing class DistributionBatchService {
    public static void executeBatch(List<Distribution__c> batch) {
        insert batch;
        System.enqueueJob(new PlaidTransferQueueable(batch));
    }
}

with sharing class PlaidTransferQueueable implements Queueable, Database.AllowsCallouts {
    private List<Distribution__c> distributions;

    public PlaidTransferQueueable(List<Distribution__c> dists) {
        this.distributions = dists;
    }

    public void execute(QueueableContext ctx) {
        PlaidCalloutService.initiateBatchTransfers(distributions);
    }
}
```

**Characteristics:** Asynchronous · Loosely coupled · ASB manages retries/DLQ · Eventual consistency

---

### 5.3 Batch Data Synchronization Pattern

#### Pattern Overview

Scheduled or event-triggered bulk synchronization of large datasets between Salesforce and external systems.

#### DPEG Use Cases

| Integration | Direction | Schedule | Failure Handling |
|-------------|-----------|----------|--------------------|
| Yardi → Salesforce | Inbound | Nightly 2 AM (ASB scheduled) | 3 retries, 5-min backoff; DLQ alert to Avanza |
| Procore → Salesforce | Inbound | Every 4 hours | 5 retries; manual CSV fallback |
| Argus File Drop → Salesforce | Inbound | Event-driven (on new export) | 3 retries; manual entry fallback |
| CoStar + Placer.ai → Salesforce | Inbound | Weekly Sunday midnight | Last known data retained; `Data_Stale__c = TRUE` |

**ASB manages all scheduling, retry logic, dead-letter queues, and error alerting. Salesforce receives only REST API calls with parsed payloads.**

#### Implementation Pattern

```apex
@RestResource(urlMapping='/asb/yardi/sync')
global with sharing class YardiSyncEndpoint {

    @HttpPost
    global static void handleYardiSync() {
        RestRequest req = RestContext.request;
        List<YardiPropertyDTO> updates = (List<YardiPropertyDTO>) JSON.deserialize(
            req.requestBody.toString(), List<YardiPropertyDTO>.class
        );

        List<Property_Asset__c> assets = new List<Property_Asset__c>();
        for (YardiPropertyDTO dto : updates) {
            assets.add(new Property_Asset__c(
                Yardi_Property_ID__c = dto.yardi_id,
                NOI__c               = dto.noi,
                Occupancy_Rate__c    = dto.occupancy
            ));
        }

        Database.upsert(assets, Property_Asset__c.Yardi_Property_ID__c, true);
    }
}

public class YardiPropertyDTO {
    public String  yardi_id;
    public Decimal noi;
    public Decimal occupancy;
}
```

---

### 5.4 Plaid ASB Integration (Bidirectional)

#### Inbound Flow: Contribution Reconciliation (Conversion 8)

```
Investor bank transfer →
  Plaid detects wire →
    Webhook to ASB (plaid-wire-matcher) →
      ASB fuzzy-matches entity name + amount →
        REST call to Salesforce (POST /asb/plaid/contributions) →
          ContributionReconciliationEndpoint.handleContributions() →
            Update Contribution__c.Match_Status__c = 'Matched' →
              PlaidContributionService creates Investment__c →
                Event: InvestmentFunded__e published →
                  Portal notification sent to investor
```

#### Outbound Flow: Distribution Batch (Plaid Transfer)

```
Distribution batch approved in Salesforce →
  DistributionBatchService.executeBatch() →
    Fire Queueable: PlaidTransferQueueable →
      Call ASB endpoint: POST /asb/plaid/batch →
        ASB (plaid-transfer-initiator) →
          For each Distribution__c: call Plaid Transfer API →
            Plaid returns transfer_id →
              ASB calls back: PUT /asb/salesforce/transfers →
                Update Distribution__c.Plaid_Transfer_ID__c →
                  Webhook (plaid-status-receiver): ACH_Status__c changes →
                    Portal notifies investor
```

#### Code Structure Example

```apex
// Inbound: Contribution Reconciliation Endpoint
@RestResource(urlMapping='/asb/plaid/contributions')
global with sharing class ContributionReconciliationEndpoint {

    @HttpPost
    global static void handleContributions() {
        RestRequest req = RestContext.request;
        List<PlaidContributionDTO> contributions = (List<PlaidContributionDTO>) JSON.deserialize(
            req.requestBody.toString(), List<PlaidContributionDTO>.class
        );
        PlaidContributionService.reconcileContributions(contributions);
    }
}

// Outbound: Plaid distribution callout
with sharing class PlaidDistributionQueueable implements Queueable, Database.AllowsCallouts {
    private List<Id> distributionIds;

    public void execute(QueueableContext ctx) {
        DistributionSelector selector = new DistributionSelector();
        List<Distribution__c> distributions = selector.selectById(new Set<Id>(distributionIds));

        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:ASB_Named_Credential/plaid/batch');
        req.setMethod('POST');
        req.setBody(JSON.serialize(distributions));
        req.setHeader('Content-Type', 'application/json');

        HttpResponse res = new Http().send(req);
        if (res.getStatusCode() != 200) {
            throw new CalloutException('ASB failed: ' + res.getStatus());
        }
    }
}
```

#### References

- [Plaid Transfer API Documentation](https://plaid.com/docs/transfer/overview/)
- [Plaid Webhooks Guide](https://plaid.com/docs/api/webhooks/)
- DPEG Integration Architecture: `ARCHITECTURE.md §4.6`

---

## 6. Security Patterns

### 6.1 CRUD/FLS Enforcement with WITH USER_MODE

#### Pattern Overview

As of API 66.0, Salesforce recommends `WITH USER_MODE` in SOQL queries and `as user` for DML operations. This enforces CRUD and FLS in a single clause.

#### Why DPEG Requires It

DPEG handles sensitive financial data requiring strict enforcement:
- `SSN__c`, `Tax_ID_EIN__c` — FLS-hidden from most profiles
- `Plaid_Access_Token__c` — FLS-hidden from all UI; Apex code only
- `Distribution__c`, `Investment__c` — OWD Private; investors see own records only

#### Implementation Pattern

```apex
// Selector — Always use WITH USER_MODE
with sharing class InvestmentSelector {
    public List<Investment__c> selectByInvestingEntity(Set<Id> entityIds) {
        return [
            SELECT Id, Investing_Entity__c, Offering__c, Amount_Funded__c,
                   Status__c, Equity_Percent__c
            FROM Investment__c
            WHERE Investing_Entity__c IN :entityIds
            WITH USER_MODE
        ];
    }
}

// Service — Use `as user` for DML
with sharing class InvestmentService {
    public static void createInvestments(List<Investment__c> investments) {
        insert as user investments;
    }

    public static void updateInvestments(List<Investment__c> investments) {
        update as user investments;
    }
}

// LWC Controller — return only masked fields
public class InvestorPortalController {
    @AuraEnabled(cacheable=true)
    public static AccountDTO getAccountDetails(Id accountId) {
        Account acc = new AccountSelector().selectById(new Set<Id>{ accountId })[0];

        AccountDTO dto = new AccountDTO();
        dto.id            = acc.Id;
        dto.name          = acc.Name;
        dto.tax_id_masked = acc.Tax_ID_Masked__c; // formula field — always safe
        // NEVER return: dto.tax_id_full = acc.Tax_ID_EIN__c
        return dto;
    }
}
```

#### References

- [Enforce Object and Field Permissions — Apex Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_perms_enforcing.htm)
- [WITH SECURITY_ENFORCED vs USER_MODE](https://medium.com/@sanjayece90/apex-security-in-salesforce-part-3-with-security-enforced-vs-user-mode-d0f2cbf9c3d1)

---

### 6.2 Record-Level Sharing & Sharing Rules

#### DPEG Sharing Model

| Object | OWD | Sharing Rule |
|--------|-----|-------------|
| `Contact` (Investor) | Private | Shared to IR team via Role Hierarchy; investors see own Contact via portal |
| `Account` (Investing Entity) | Private | IR team via role; investor portal user sees own Account only |
| `Investment__c` | Private | IR team via Role; investor sees own records via ownership |
| `Distribution__c` | Private | IR Manager + Finance via Role; investor sees own via portal owner rule |
| `Commitment__c` | Private | IR team via Role; investor sees own via portal owner rule |
| `Opportunity` (Deal) | Private | Role hierarchy — Acquisitions, Transaction, Principals |
| `Transaction__c` | Private | Transaction Lead role + Principals |
| `Disposition__c` | Private | Ali (CFO) + Principals |

```apex
// Conversion 7 example — Investor portal ownership model
with sharing class LeadConversionService {
    public static void convertInvestorLeads(List<Lead> investorLeads) {
        List<Account> entities = new List<Account>();
        for (Lead lead : investorLeads) {
            entities.add(new Account(
                Name             = lead.Company,
                Account_Type__c  = 'Investing Entity',
                Entity_Type__c   = lead.Entity_Type__c
            ));
        }
        insert as user entities;

        List<Contact> contacts = new List<Contact>();
        for (Integer i = 0; i < investorLeads.size(); i++) {
            contacts.add(new Contact(
                AccountId = entities[i].Id,
                FirstName = investorLeads[i].FirstName,
                LastName  = investorLeads[i].LastName,
                Email     = investorLeads[i].Email
            ));
        }
        insert as user contacts;
    }
}
```

---

### 6.3 Named Credentials for External Integration

#### DPEG Policy

**Single Named Credential for ASB endpoint only.** All external system credentials (Plaid, Yardi, CoStar, Procore) are stored in ASB's secrets vault, not in Salesforce.

```apex
// Correct: reference Named Credential
with sharing class PlaidCalloutService {
    public static HttpResponse callAsb(String endpoint, String method, String body) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:ASB_Named_Credential' + endpoint);
        req.setMethod(method);
        req.setBody(body);
        req.setHeader('Content-Type', 'application/json');
        req.setTimeout(30000);
        return new Http().send(req);
    }
}

// ❌ NEVER do this:
// String token = 'pk_live_abc123...';         // Hardcoded Plaid key
// String yadiUrl = 'https://user:pass@y...';  // Hardcoded creds
```

#### References

- [Create Named Credentials — Salesforce Help](https://help.salesforce.com/s/articleView?language=en_US&id=sf.nc_named_creds_and_ext_creds.htm)

---

## 7. Governor Limit & Performance Patterns

### 7.1 Bulkification & Batch Processing

#### Critical Rule: No SOQL/DML in Loops

```apex
// ❌ ANTI-PATTERN: SOQL in loop (N+1 queries)
for (Investment__c inv : investments) {
    List<Distribution__c> dists = [SELECT Id FROM Distribution__c WHERE Investment__c = :inv.Id];
}

// ✓ PATTERN: Bulk SOQL + Map for O(1) lookup
Map<Id, List<Distribution__c>> distsByInvestment = new Map<Id, List<Distribution__c>>();
for (Distribution__c dist : [
    SELECT Id, Investment__c FROM Distribution__c
    WHERE Investment__c IN :investmentIds
    WITH USER_MODE
]) {
    if (!distsByInvestment.containsKey(dist.Investment__c)) {
        distsByInvestment.put(dist.Investment__c, new List<Distribution__c>());
    }
    distsByInvestment.get(dist.Investment__c).add(dist);
}

for (Investment__c inv : investments) {
    List<Distribution__c> dists = distsByInvestment.get(inv.Id); // O(1) — no additional query
}
```

#### Bulk Test Data Best Practice

DPEG tests must use **251+ records** to catch hidden N+1 queries:

```apex
@isTest
private class InvestmentServiceTest {
    @isTest
    static void testCreateInvestmentsInBulk() {
        List<Account> entities = TestDataFactory.createInvestingEntityAccounts('Entity', 'LLC', 251, true);
        List<Offering__c> offerings = new List<Offering__c>();
        for (Integer i = 0; i < 251; i++) {
            offerings.add(TestDataFactory.buildOffering('Offering ' + i, 1000000));
        }
        insert offerings;

        Test.startTest();
        List<Investment__c> invests = TestDataFactory.createInvestments(
            new List<Id>(new Map<Id, Account>(entities).keySet()),
            offerings[0].Id, 50000, true
        );
        Test.stopTest();

        System.assertEquals(251, invests.size());
    }
}
```

#### References

- [Execution Governors and Limits — Apex Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_gov_limits.htm)

---

### 7.2 Queueable Chaining & Asynchronous Processing

#### DPEG Async Job Inventory

| Job | Type | Trigger | Purpose |
|-----|------|---------|---------|
| `PlaidTransferQueueable` | Queueable | Fire-and-Forget from `DistributionBatchService` | Initiate ACH transfers; call Plaid via ASB |
| `YardiSyncBatch` | Batch | Nightly 2 AM (ASB → REST endpoint) | Upsert Property_Asset__c, Tenant__c, Lease__c |
| `ProcoreSyncBatch` | Batch | Every 4 hours | Upsert DC_Project__c records |
| `DispositionAlertSchedulable` | Scheduled Flow | Daily | Check Sell_Meter__c = GREEN; alert principals |

#### Queueable with Finalizer

```apex
public class PlaidTransferQueueable implements Queueable, Database.AllowsCallouts {
    private List<Distribution__c> distributions;

    public PlaidTransferQueueable(List<Distribution__c> dists) {
        this.distributions = dists;
    }

    public void execute(QueueableContext ctx) {
        HttpResponse res = PlaidCalloutService.initiateBatchTransfers(distributions);
        System.attachFinalizer(new PlaidTransferFinalizer(res));
    }
}

public class PlaidTransferFinalizer implements Queueable.Finalizer {
    private HttpResponse response;

    public PlaidTransferFinalizer(HttpResponse res) { this.response = res; }

    public void execute(FinalizerContext ctx) {
        if (ctx.getResult() == ParentJobResult.SUCCESS) {
            AuditLogService.logBatchSuccess('plaid_transfer', response.getStatusCode());
        } else {
            AuditLogService.logBatchFailure('plaid_transfer', ctx.getException().getMessage());
        }
    }
}
```

**Queueable limits:**
- From synchronous context: up to 50 queueable jobs + 50 future methods
- From inside a queueable job: only 1 additional queueable job + 50 future methods

#### References

- [Apex Queueable Processing Framework](https://blog.beyondthecloud.dev/blog/apex-queueable-processing-framework)

---

## 8. LWC Design Patterns

### 8.1 Container / Presentational Component Architecture

#### Pattern Overview

Separate concerns into two component types:

1. **Container Component** — Stateful; wires to Apex/LDS; manages data flow; orchestrates child components
2. **Presentational Component** — Stateless; props in, events out; reusable; testable without mocks

#### DPEG LWC Structure

```
lwc/
├── investorPortalApp/              # FlexiPage assembles features
├── investmentListContainer/        # Container: state, wire, handlers
│   ├── investmentList/             # Presentational: renders table, fires events
│   ├── investmentDetail/           # Presentational: renders form, fires events
│   └── utils/
│       └── investmentUtils.js      # Shared utility module (no .html)
├── distributionNotifier/           # Container: listens to Platform Events
└── shareTransferForm/              # Container: form + validation
```

#### Container Component Example

```javascript
// lwc/investmentListContainer/investmentListContainer.js
import { LightningElement, wire } from 'lwc';
import getInvestments from '@salesforce/apex/InvestmentController.getInvestments';

export default class InvestmentListContainer extends LightningElement {
    accountId;
    investments = [];
    loading = true;
    error;

    @wire(getInvestments, { accountId: '$accountId' })
    wiredInvestments({ data, error }) {
        if (data) {
            this.investments = data;
            this.loading = false;
        } else if (error) {
            this.error = error;
            this.loading = false;
        }
    }

    handleInvestmentSelect(event) {
        this.dispatchEvent(new CustomEvent('investmentselected', { detail: event.detail }));
    }
}
```

#### Presentational Component Example

```javascript
// lwc/investmentList/investmentList.js
import { LightningElement, api } from 'lwc';

export default class InvestmentList extends LightningElement {
    @api investments = [];
    @api loading = false;

    handleRowClick(event) {
        const investmentId = event.currentTarget.dataset.investmentId;
        this.dispatchEvent(new CustomEvent('select', { detail: { investmentId } }));
    }
}
```

**Rules:**
- Container components wire to Apex; presentational components never call Apex directly
- Presentational components communicate via custom events only
- SLDS 2 design tokens (`--slds-g-*`) throughout; no hardcoded colours or spacing

---

### 8.2 Lightning Message Service (LMS) for Cross-Component Communication

#### When to Use LMS

Use LMS for investor portal cross-component messaging — it is sandboxed, secure, and the official Salesforce standard for Experience Cloud.

```javascript
// Subscriber
import { LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import DISTRIBUTION_CHANNEL from '@salesforce/messageChannel/DistributionChannel__c';

export default class DistributionSubscriber extends LightningElement {
    subscription;

    @wire(MessageContext) messageContext;

    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            DISTRIBUTION_CHANNEL,
            (message) => this.handleMessage(message)
        );
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
    }

    handleMessage(message) {
        // Display notification: "Distribution of $X posted"
    }
}

// Publisher
publish(this.messageContext, DISTRIBUTION_CHANNEL, {
    amount: 50000,
    distributionId: 'a03xx000001234'
});
```

#### References

- [Communicate Across the DOM — LWC Developer Guide](https://developer.salesforce.com/docs/platform/lwc/guide/events-pubsub.html)
- [Advanced Patterns in Salesforce LWC — DZone](https://dzone.com/articles/salesforce-lwc-reusable-components-performance-optimization)

---

## 9. Anti-Patterns to Avoid

### DPEG Critical Anti-Patterns

| Anti-Pattern | Risk | DPEG Example | Fix |
|-------------|------|-------------|-----|
| **SOQL in Loop** | N+1 query limit | Fetching distributions for each investment individually | Bulk fetch + Map for O(1) lookup |
| **DML in Loop** | 150 DML limit | Inserting Distribution__c one-by-one | Bulk insert collection |
| **Hardcoded IDs** | Breaks on metadata refresh | `if (recordTypeId == '012xx0000001ABC')` | Query RecordType dynamically via Schema API |
| **Missing Governor Limit Testing** | Runtime exceptions in production | Tests using only 1 record | Always bulk-test with 251+ records |
| **Empty Exception Handling** | Silent data corruption | `catch (Exception e) {}` with no logging | Throw AuraHandledException; log to audit table |
| **Logic in Triggers** | Technical debt, hard to change | All Opportunity logic directly in trigger | Trigger → Handler → Service pattern |
| **Missing FLS Enforcement** | Data exposure | Selecting all fields without `WITH USER_MODE` | Always use `WITH USER_MODE`; `as user` DML |
| **Hardcoded Endpoints** | Configuration inflexible | `String endpoint = 'https://asb.avanza.io/...'` | Named Credentials + parameterize in Custom Settings |
| **`without sharing` Without Justification** | OWD violation | Random `without sharing` on service classes | Always `with sharing`; justify `without sharing` in class header |

### Common Mistakes in DPEG Patterns

1. **Selector querying child records without narrowing the parent set**

```apex
// ❌ Expensive sub-select on all accounts
List<Account> accounts = [SELECT Id, (SELECT Id FROM Investments__r) FROM Account LIMIT 100];

// ✓ Two targeted selectors, narrowed by relevant IDs
List<Account> accounts = new AccountSelector().selectByIdSet(accountIds);
List<Investment__c> investments = new InvestmentSelector().selectByAccountIds(accountIds);
```

2. **Service instantiating Domain once per record**

```apex
// ❌
for (Investment__c inv : investments) {
    new InvestmentDomain(new List<Investment__c>{ inv }).markAsActive();
}

// ✓
new InvestmentDomain(investments).markAsActive();
```

3. **LWC imperative Apex without error handling**

```javascript
// ❌
getInvestments({ accountId: this.recordId })
    .then(result => this.investments = result);

// ✓
getInvestments({ accountId: this.recordId })
    .then(result => { this.investments = result; })
    .catch(error => { this.showErrorToast(error.body.message); });
```

#### References

- [Top 10 Salesforce Anti-Patterns — Apex Hours](https://www.apexhours.com/top-10-salesforce-anti-patterns/)
- [A Guide to Salesforce Anti-Patterns — Coforge](https://www.coforge.com/what-we-know/blog/a-guide-to-salesforce-anti-patterns)

---

## 10. Strategy, Facade, Decorator, Factory Patterns

### 10.1 Strategy Pattern

Encapsulate interchangeable algorithms in separate classes implementing a common interface. Select the implementation at runtime.

#### DPEG Use Case: Contribution Matching Strategies

```apex
// Strategy Interface
public interface IContributionMatcher {
    Boolean matches(Contribution__c contribution, PlaidTransaction transaction);
    Decimal matchConfidence();
}

// Concrete Strategies
public class ExactAmountMatcher implements IContributionMatcher {
    public Boolean matches(Contribution__c contrib, PlaidTransaction trans) {
        return contrib.Amount__c == trans.amount;
    }
    public Decimal matchConfidence() { return 0.95; }
}

public class FuzzyAmountMatcher implements IContributionMatcher {
    public Boolean matches(Contribution__c contrib, PlaidTransaction trans) {
        Decimal diff = Math.abs(contrib.Amount__c - trans.amount) / contrib.Amount__c;
        return diff <= 0.01;
    }
    public Decimal matchConfidence() { return 0.70; }
}

// Strategy Executor
with sharing class ContributionMatchingService {
    public static void matchContributions(
        List<Contribution__c> contribs,
        List<PlaidTransaction> plaidTrans
    ) {
        List<IContributionMatcher> matchers = new List<IContributionMatcher>{
            new ExactAmountMatcher(),
            new FuzzyAmountMatcher()
        };

        for (Contribution__c contrib : contribs) {
            for (PlaidTransaction trans : plaidTrans) {
                for (IContributionMatcher matcher : matchers) {
                    if (matcher.matches(contrib, trans)) {
                        contrib.Matched_Transaction_ID__c = trans.id;
                        contrib.Match_Confidence__c = matcher.matchConfidence();
                        break;
                    }
                }
            }
        }
    }
}
```

---

### 10.2 Factory Pattern

Encapsulate object creation logic in a factory class. Select the concrete class to instantiate based on input.

#### DPEG Use Case: Distribution Service Instantiation

```apex
public interface IDistributionService {
    void initiate(List<Distribution__c> distributions);
}

public class PlaidDistributionService implements IDistributionService {
    public void initiate(List<Distribution__c> distributions) {
        // Call Plaid API via ASB
    }
}

public class ManualACHDistributionService implements IDistributionService {
    public void initiate(List<Distribution__c> distributions) {
        // Create manual ACH instructions
    }
}

public class DistributionServiceFactory {
    public static IDistributionService getInstance(String distributionMethod) {
        switch on distributionMethod {
            when 'Plaid'      { return new PlaidDistributionService(); }
            when 'Manual ACH' { return new ManualACHDistributionService(); }
            when else { throw new InvalidParameterException('Unknown method: ' + distributionMethod); }
        }
    }
}

// Usage
with sharing class DistributionBatchService {
    public static void executeBatch(List<Distribution__c> batch) {
        IDistributionService svc = DistributionServiceFactory.getInstance(
            batch[0].Distribution_Method__c
        );
        svc.initiate(batch);
    }
}
```

---

### 10.3 Decorator Pattern

Wrap an object to add new behaviors dynamically without modifying the original class.

#### DPEG Use Case: Investment DTO Enhancement

```apex
// Base wrapper
public class InvestmentDecorator {
    protected Investment__c investment;
    public InvestmentDecorator(Investment__c inv) { this.investment = inv; }
    public Investment__c getInvestment() { return investment; }
}

// Decorator 1: Income distribution calculation
public class IncomeDistributionDecorator extends InvestmentDecorator {
    public Decimal calculateIncomeDistribution(Decimal offeringROI) {
        return investment.Amount_Funded__c * offeringROI * investment.Equity_Percent__c;
    }
}

// Decorator 2: Tax reporting fields
public class TaxReportingDecorator extends InvestmentDecorator {
    public Decimal getUnrealizedGain(Decimal currentValue) {
        return currentValue - investment.Cost_Basis__c;
    }
}
```

#### References

- [Apex Design Patterns — Apex Hours](https://www.apexhours.com/apex-design-patterns/)
- [Patterns in Apex: Strategy and Decorator — Nebula Consulting](https://nebulaconsulting.co.uk/insights/patterns-in-apex-dependency-injection-strategy-and-decorator/)

---

## 11. DPEG Implementation Roadmap

### Pattern Adoption by Phase

| Phase | Patterns | Modules | Timeline |
|-------|----------|---------|----------|
| **Phase 1** (Weeks 1–8) | Domain, Service, Selector; Trigger Handler; Lead Conversion (Conversions 1 & 7) | Acquisitions + IR | Weeks 1–8 |
| **Phase 2** (Weeks 9–16) | Contract Handoff (Conversions 2 & 3); Disposition Sell Meter; Yardi batch sync via ASB | Transaction + Disposition | Weeks 9–16 |
| **Phase 3** (Weeks 17–26) | Plaid Contribution Reconciliation (Conversion 8); Invocable Apex for Flows; LWC Container/Presentational | IR (core) + LWC UI | Weeks 17–26 |
| **Phase 4** (Weeks 27–34) | Platform Events (OfferingLaunched, InvestmentFunded); Share Transfer (Conversion 9); LMS for investor portal | IR (advanced) + Portal | Weeks 27–34 |
| **Phase 5** (Weeks 35–38) | UAT, performance tuning, bulkification validation, security review | All modules | Weeks 35–38 |

### Non-Negotiable Governance Rules

1. All Apex must use fflib patterns: Domain, Service, Selector, Unit of Work
2. All queries use Selectors with `WITH USER_MODE`
3. All bulk tests use TestDataFactory with 251+ records
4. All triggers delegate to handlers; handlers call services — no logic in triggers
5. All external callouts use Named Credentials; no hardcoded URLs or API keys
6. All security violations (CRUD/FLS/sharing) trigger code review rejection
7. LWC container components only wire Apex; presentational components never call Apex directly

---

## Sources

- [GitHub — apex-enterprise-patterns/fflib-apex-common](https://github.com/apex-enterprise-patterns/fflib-apex-common)
- [Apex Enterprise Patterns: Domain & Selector Layers — Trailhead](https://trailhead.salesforce.com/content/learn/modules/apex_patterns_dsl)
- [fflib.dev Documentation](https://fflib.dev/docs)
- [Kevin O'Hara's sfdc-trigger-framework](https://github.com/kevinohara80/sfdc-trigger-framework)
- [Trigger Framework in Salesforce — Apex Hours](https://www.apexhours.com/trigger-framework-in-salesforce/)
- [Integration Using CDC and Platform Events — Salesforce Ben](https://www.salesforceben.com/integration-using-change-data-capture-and-platform-events/)
- [Design Considerations for CDC and Platform Events](https://developer.salesforce.com/blogs/2022/10/design-considerations-for-change-data-capture-and-platform-events)
- [Salesforce LWC Design Patterns — DZone](https://dzone.com/articles/salesforce-lwc-reusable-components-performance-optimization)
- [Communicate Across the DOM — LWC Developer Guide](https://developer.salesforce.com/docs/platform/lwc/guide/events-pubsub.html)
- [Salesforce Invocable Apex Methods — Salesforce Ben](https://www.salesforceben.com/salesforce-invocable-apex-methods-a-complete-breakdown/)
- [Enforce Object and Field Permissions — Apex Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_perms_enforcing.htm)
- [Salesforce Integration Patterns and Practices v66.0 PDF](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/integration_patterns_and_practices.pdf)
- [Execution Governors and Limits — Apex Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_gov_limits.htm)
- [Apex Queueable Processing Framework](https://blog.beyondthecloud.dev/blog/apex-queueable-processing-framework)
- [Apex Design Patterns — Apex Hours](https://www.apexhours.com/apex-design-patterns/)
- [Patterns in Apex: Strategy and Decorator — Nebula Consulting](https://nebulaconsulting.co.uk/insights/patterns-in-apex-dependency-injection-strategy-and-decorator/)
- [Top 10 Salesforce Anti-Patterns — Apex Hours](https://www.apexhours.com/top-10-salesforce-anti-patterns/)
- [A Guide to Salesforce Anti-Patterns — Coforge](https://www.coforge.com/what-we-know/blog/a-guide-to-salesforce-anti-patterns)
- [Create Named Credentials — Salesforce Help](https://help.salesforce.com/s/articleView?language=en_US&id=sf.nc_named_creds_and_ext_creds.htm)
- [Plaid Transfer API Documentation](https://plaid.com/docs/transfer/overview/)
- [Understanding Change Data Capture — Trailhead](https://trailhead.salesforce.com/content/learn/modules/change-data-capture/understand-change-data-capture)
