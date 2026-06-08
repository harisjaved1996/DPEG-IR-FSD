---
name: dpeg-ir-testdatafactory-contract
description: Non-obvious schema constraints the DPEG IR data model must obey, derived from TestDataFactory.cls (the binding contract). Reuse across IR Phase A–D.
metadata:
  type: project
---

`force-app/main/default/classes/TestDataFactory.cls` is the binding contract for the DPEG IR data model. Verify against the current file before relying on these (it can change).

**Why:** schema that violates the factory breaks the existing Apex test suite; the user locked "canonical model wins, factory is binding."

**How to apply** when designing/reviewing IR schema:

- **Name-field rule:** if a factory builder does NOT set `Name`, that object's Name MUST be **Auto-Number** (a required Text Name would fail inserts). Auto-Number required for: `Investor__c`, `Investing_Entity_Contact__c`, `Commitment__c`, `Investment__c`, `Contribution__c`, `Distribution__c`, `Share_Transfer__c`. Text Name (factory sets it): `Offering__c`, `Property_Asset__c`. Consequence: mockup IDs like `O-119` must be a SEPARATE auto-number field (`Offering_ID__c`), not the Name.
- **Picklist literals that MUST exist:** Account_Type__c {Broker Firm, Investing Entity}; Entity_Type__c {LLC,…}; Contact.Role__c {Primary, Secondary}; Accreditation_Status__c {Pending}; Offering.Status__c {Draft}; Commitment.Status__c {Committed}; Investment.Status__c {Active}; Distribution.ACH_Status__c {Pending, Posted, Failed, Returned}; Contribution.Match_Status__c {Pending}; Property_Asset.Status__c {Active, Disposed}; Share_Transfer {Status Pending / Approval_Status 'Pending Review' / Transfer_Type 'Partial'}; Investing_Entity_Contact.Signer_Role__c {Primary, Secondary}. Richer mockup lifecycle values are ADDED alongside, never replacing these.
- **Fixed relationships:** Contribution__c & Distribution__c are **Master-Detail → Investment__c**. Distribution__c→Distribution_Batch__c is a **nullable Lookup** (factory never sets it; `Wire__c` is the pre-match staging object). Commitment__c & Investment__c use **Lookups** (not MD) to both Account and Offering (only 2 MD allowed; both slots not used).
- **New fields on Account/Contact/Offering/etc. must be optional or defaulted** so factory inserts (which omit them) still pass.
- **Native RUS only where child is MD:** valid for Investment__c.Total_Contributed__c / Total_Distributed__c. Offering totals and Distribution_Batch totals are Lookup-based → **Apex rollups (Phase C)**; create the fields in Phase A and seed literal values.
- `createUserWithProfile` queries custom Profiles (IR Manager, etc.) that may not exist in the scratch org; current tests use `buildStandardUser` ('Standard User'). Security is delivered as **permission sets**, not profiles.

See also [[dpeg-ir-conflicts-resolved]].
