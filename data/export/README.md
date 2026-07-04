# DPEG Data Export — Relationship-Preserving Tree Export

This directory contains a **`sf data import tree` plan** exporting **15 objects** of DATA RECORDS
(not metadata) from the scratch org **`DPEG-IR-FSD`**, ready to be re-imported into a fresh org
with all in-set relationships preserved via `@referenceId` placeholders.

Generated: 2026-07-04 · Source org: `DPEG-IR-FSD` (namespace: `Unison`)

> **Update 1:** Extended from 12 to **14 objects** by adding `Unison__Investment__c` (14 records)
> and `Unison__Distribution_Batch__c` (3 records). Because those objects are now in the export set,
> the lookups that previously had to be dropped (Contact / Contribution / Position / Bank_Account /
> Distribution / Share_Transfer → Investment, and Distribution → Distribution_Batch) now **resolve
> to `@referenceId` placeholders** and are fully migrated.
>
> **Update 2:** Added the standard **`Lead`** object (36 records). Lead is **standalone** for this
> data set — none of the other 14 objects reference Lead and Lead references none of them — so it
> needs no `@referenceId` wiring. It is exported to its own `Lead.json` and registered first in
> `plan.json`.

---

## How to import into a NEW org

1. Deploy **metadata first** (objects, fields, record types, picklists) into the target org.
2. Authenticate the target org, then run **one** command from the project root:

```powershell
sf data import tree --plan "data\export\plan.json" --target-org <NEW_ORG_ALIAS>
```

> Run via the **PowerShell** tool on Windows (the `sf` CLI is unreliable under Git-Bash here).
> Add `--json` to capture a machine-readable result if you want to verify programmatically.

The `--plan` flag imports every object file in the order listed in `plan.json` and resolves all
`@referenceId` placeholders **globally across the whole plan**, so parent records are inserted
before the children that reference them.

---

## Files in this directory

| File                                 | Records | In-set lookups                                                             |
| ------------------------------------ | ------: | -------------------------------------------------------------------------- |
| `plan.json`                          |       — | Import plan; **manually reordered** to parents-before-children (see below) |
| `Lead.json`                          |      36 | (standalone — no in-set lookups)                                           |
| `Account.json`                       |      26 | (root)                                                                     |
| `Unison__Property__c.json`           |      14 | (root)                                                                     |
| `Unison__Offering__c.json`           |      13 | → Property                                                                 |
| `Unison__Investment__c.json`         |      14 | → Account, Offering, Property                                              |
| `Contact.json`                       |      36 | → Account, Investment                                                      |
| `Unison__Investing_Entity__c.json`   |      21 | → Contact, Offering                                                        |
| `Unison__Distribution_Batch__c.json` |       3 | → Offering, Investment                                                     |
| `Unison__Bank_Account__c.json`       |       1 | → Investment                                                               |
| `Unison__Wire__c.json`               |       7 | → Account, Offering                                                        |
| `Unison__Contribution__c.json`       |      19 | → Wire, Contact, Offering, Investing_Entity, Investment                    |
| `Unison__Waitlist__c.json`           |      15 | → Account, Offering, Contact                                               |
| `Unison__Distribution__c.json`       |       4 | → Contact, Investment, Distribution_Batch                                  |
| `Unison__Position__c.json`           |       2 | → Contact, Investing_Entity, Investment                                    |
| `Unison__Share_Transfer__c.json`     |       1 | → Contact, Investing_Entity, Investment (×2)                               |

**All 15 exported record counts match the expected counts exactly.**

---

## Import order (parents before children)

The `plan.json` in this directory has been **manually corrected**. The `sf data export tree`
CLI generated the plan in a non-dependency order (children listed before parents), which would
fail on import. `Lead` is standalone (nothing depends on it, it depends on nothing in-set), so it
is placed first for convenience. The corrected, topologically-sorted order is:

1. `Lead` _(standalone — independent of all other objects)_
2. `Account`
3. `Unison__Property__c`
4. `Unison__Offering__c` _(→ Property)_
5. `Unison__Investment__c` _(→ Account, Offering, Property)_
6. `Contact` _(→ Account, Investment)_
7. `Unison__Investing_Entity__c` _(→ Contact, Offering)_
8. `Unison__Distribution_Batch__c` _(→ Offering, Investment)_
9. `Unison__Bank_Account__c` _(→ Investment)_
10. `Unison__Wire__c` _(→ Account, Offering)_
11. `Unison__Contribution__c` _(→ Wire, Contact, Offering, Investing_Entity, Investment)_
12. `Unison__Waitlist__c` _(→ Account, Offering, Contact)_
13. `Unison__Distribution__c` _(→ Contact, Investment, Distribution_Batch)_
14. `Unison__Position__c` _(→ Contact, Investing_Entity, Investment)_
15. `Unison__Share_Transfer__c` _(→ Contact, Investing_Entity, Investment)_

> Key placements: **`Investment` comes before Contact / Contribution / Position / Bank_Account /
> Distribution / Share_Transfer** (all of which look up to it), and **after** Account / Offering /
> Property (which it looks up to). **`Distribution_Batch` comes before Distribution** and after
> Offering / Investment.
>
> If you re-run the export, you must re-apply this ordering to `plan.json` before importing.

---

## Cycle analysis

Investment's createable lookups point only to **Account, Offering, Property** (its
`Unison__Investing_Entity__c` field actually references **Account**, not the Investing_Entity
object). Distribution_Batch points only to **Offering, Investment**. None of those parents look
back to Investment or Distribution_Batch, and neither new object has a self-lookup. **Lead** is
standalone — its only createable lookups (OwnerId, DandbCompanyId, IndividualId) all point outside
the export set and are dropped, so it participates in no relationships here.

**No circular or self references exist among the 15 in-set objects.** Therefore no lookup had to be
split into a "first insert without the lookup, then re-populate" second pass, and a single-pass
import in the order above succeeds.

---

## Fields deliberately EXCLUDED from the export

Per the export rules, a field was kept only if it was `createable == true`,
`calculated == false`, `autoNumber == false`, and its type was not
`address / location / base64 / encryptedstring`. In addition:

### System / non-settable (all objects)

- `OwnerId` — excluded to avoid user-mapping failures (records will be owned by the running user).
- Compound `address`/`location` fields (e.g. BillingAddress on Account) — their component fields
  (BillingStreet, BillingCity, …) are exported individually instead.
- Formula, roll-up, and auto-number fields — not settable on insert.

### External lookups pointing to objects **NOT in this export set** (dropped)

These lookup fields were removed from the queries because their target object is not being
exported. Leaving them would export a raw Id that points to a record which does not exist in
the new org, causing import errors. **The relationship data in these fields is NOT migrated.**

| Object  | Dropped lookup field | Points to (out of set) |          Rows that had a value |
| ------- | -------------------- | ---------------------- | -----------------------------: |
| Account | `RecordTypeId`       | RecordType             | 13 (see RecordType note below) |
| Account | `PersonIndividualId` | Individual             |                              0 |
| Account | `DandbCompanyId`     | DandBCompany           |                              0 |
| Account | `OperatingHoursId`   | OperatingHours         |                              0 |
| Contact | `IndividualId`       | Individual             |                              0 |
| Lead    | `DandbCompanyId`     | DandBCompany           |                              0 |
| Lead    | `IndividualId`       | Individual             |                              0 |

> The `Unison__Investment__c` and `Unison__Distribution_Batch__c` lookups that were dropped in the
> original 12-object export are **no longer dropped** — those objects are now in the export set and
> their lookups resolve to `@referenceId` placeholders (see below). The only remaining external
> references are standard platform objects (RecordType, Individual, DandBCompany, OperatingHours),
> all of which were unpopulated except Account `RecordTypeId`.

> **Lead-specific note:** For `Lead`, `OwnerId` (→ Group/User) was excluded per the standard
> OwnerId rule, and `DandbCompanyId` (→ DandBCompany) and `IndividualId` (→ Individual) were dropped
> as standard-platform references outside the export set — both unpopulated, same treatment as the
> matching fields on Account/Contact. Lead's **compound `Name`** field is not selected; the
> individual `FirstName`, `LastName`, and `Salutation` fields are exported instead. The compound
> `Address` field is not createable and is excluded; its component fields (`Street`, `City`,
> `State`, `PostalCode`, `Country`) are exported individually. Required fields `Company` and
> `Status` are included.

### Previously-dropped lookups that now RESOLVE (migrated)

Confirmed as `@referenceId` placeholders in this export:

| Object                    | Lookup field                                                 | Resolves to        | @refs present |
| ------------------------- | ------------------------------------------------------------ | ------------------ | ------------: |
| Contact                   | `Unison__Investment__c`                                      | Investment         |             8 |
| Unison**Bank_Account**c   | `Unison__Investment__c`                                      | Investment         |             1 |
| Unison**Contribution**c   | `Unison__Investment__c`                                      | Investment         |            13 |
| Unison**Distribution**c   | `Unison__Investment__c`                                      | Investment         |             1 |
| Unison**Distribution**c   | `Unison__Distribution_Batch__c`                              | Distribution_Batch |             4 |
| Unison**Position**c       | `Unison__Investment__c`                                      | Investment         |             2 |
| Unison**Share_Transfer**c | `Unison__Investment__c` + `Unison__Transferor_Investment__c` | Investment         |             2 |

---

## Second-pass lookups needed

- **No circular / self references were detected among the 15 in-set objects**, so no lookup had to
  be split out for cycle reasons.
- With Investment and Distribution_Batch now in-set, **all custom-object relationships in scope are
  migrated in a single pass.** The only relationships not carried over are the standard-platform
  references listed in the "dropped" table above (RecordType — see caveat — Individual, DandBCompany,
  etc.), which were unpopulated except Account RecordType.
- `Lead` is standalone and carries no in-set relationships, so no second pass is needed for it.

---

## RecordType caveat (Account)

- Account has **13 records with a `RecordTypeId`** (record types `Broker_Firm`, `Investing_Entity`).
- `RecordTypeId` was **dropped** from the export because it is a reference to the `RecordType`
  object, which is not part of the data export set, and `sf data import tree` cannot resolve a raw
  RecordType Id against a fresh org.
- **`sf data import tree` cannot set RecordType by `RecordType.DeveloperName`** — the tree/SObject
  Collection format only accepts a literal `RecordTypeId`, which differs between orgs. So RecordType
  assignment cannot be reliably carried in this tree export.
- **Consequence:** imported Accounts will get the target org's _default_ Account record type.
- **Remediation (second pass):** after import, set the correct record type per Account. The target
  org's metadata deploy will have created the `Broker_Firm` and `Investing_Entity` record types, so
  you can map them by querying the new RecordType Ids and running a bulk update — for example, join
  on a business key (Account Name / `Unison__Account_Type__c`) to decide which record type each
  Account should get.

---

## Verification performed

- Every `<object>.json` record count was checked against the expected counts — **all 15 match**
  (including `Lead` = 36).
- All in-set lookup fields resolved to `@referenceId` placeholders (e.g. `@ContactRef27`,
  `@Unison__Offering__cRef1`, `@Unison__Investment__cRef13`) — confirmed **no raw Salesforce Ids
  leaked** into any lookup field.
- The previously-dropped Investment / Distribution_Batch lookups were confirmed to now resolve.
- `Lead` was verified standalone (no in-set lookups) and registered first in `plan.json`.
- `plan.json` import order was corrected and **topologically validated** (every parent precedes
  each child that references it).
