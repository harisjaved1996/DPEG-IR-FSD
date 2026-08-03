# DPEG-IR-FSD-V3 Full Data Snapshot — 2026-08-03

Complete record snapshot of scratch org **DPEG-IR-FSD-V3** (`test-6einl9s6a4mv@example.com`, org `00DFW001EkwVvZA`), taken on its expiration day. This is the authoritative data backup for recreating the org — it supersedes `data\export` (V1-vintage tree export, kept for its `plan.json` import pipeline).

## Contents

- `<Object>.json` — one file per object, raw `sf data query` JSON (`SELECT FIELDS(ALL) … LIMIT 200`), UTF-8 **without BOM**. All fields included: Ids, RecordTypeId, OwnerId, audit fields, formulas.
- `ContentVersion.json` — metadata for all 9 files (title, extension, ContentDocumentId).
- `ContentDocumentLink.json` — which records each file is attached to.
- `files\<ContentVersionId>_<title>.<ext>` — the 9 file binaries (logos, 1 share-transfer PDF).

## Record counts (284 total)

| Object                        | Count |     | Object                 | Count |
| ----------------------------- | ----- | --- | ---------------------- | ----- |
| Account                       | 30    |     | Investor\_\_c          | 8     |
| Contact                       | 36    |     | IR_Document\_\_c       | 7     |
| Lead                          | 37    |     | Offering\_\_c          | 13    |
| Bank_Account\_\_c             | 1     |     | Position\_\_c          | 2     |
| Commitment\_\_c               | 22    |     | Property\_\_c          | 14    |
| Contribution\_\_c             | 19    |     | Property_Asset\_\_c    | 2     |
| Distribution\_\_c             | 4     |     | Share_Transfer\_\_c    | 4     |
| Distribution_Batch\_\_c       | 3     |     | Subscription_Doc\_\_c  | 7     |
| Investing_Entity\_\_c         | 27    |     | Transfer_Document\_\_c | 3     |
| Investing_Entity_Contact\_\_c | 11    |     | Waitlist\_\_c          | 15    |
| Investment\_\_c               | 14    |     | Wire\_\_c              | 7     |

Empty (nothing to migrate): Critical_Date**c, Disposition**c, Transaction\_\_c, Task, Event, Case, Opportunity.

## Import caveats (from the 2026-07-04 V1→V3 migration experience)

1. **Lookups contain raw V3 Ids** — remap via Id-keyed maps at import (insert parents first: Account → Contact → Property → Offering → Investing_Entity → Investment → the rest; Subscription_Doc chains to Commitment).
2. **Auto-number `Name`** must be stripped on: Distribution_Batch, Wire, Contribution, Waitlist, Distribution, Position, Share_Transfer.
3. **RecordTypeId** — map by RecordType DeveloperName against the target org's Ids (tree import drops it; Apex/bulk update needed).
4. `Investing_Entity__c` FIELD points to **Account** on Investing_Entity_Contact/Subscription_Doc/IR_Document but to the **Unison**Investing_Entity**c object** on Commitment.
5. Wipe target-org sample data first or duplicate rules block inserts; restore duplicate-rule active states after (only the 3 Standard Account/Contact/Lead rules active — now captured in `force-app/main/default/duplicateRules/`).
6. Non-ASCII (em-dash names: "Cypress Grove — DPEG MF Fund VII", "Magnolia Crossing — DPEG Fund LP") — pass to Apex by codepoint; keep files UTF-8 no-BOM.
7. Files: recreate via ContentVersion insert (`VersionData` = base64 of binary, `PathOnClient` from ContentVersion.json), then ContentDocumentLink per ContentDocumentLink.json (remap LinkedEntityId).
