/**
 * @description Pure in-memory mapping helper that converts SObject records returned by the IR
 *              selectors into the `IRDTO` row DTOs consumed by the LWC read layer. Centralising
 *              the mapping here keeps the 11 IR controllers thin and avoids duplicating identical
 *              shaping logic across screens that reuse the same DTO shapes (e.g. the offering
 *              progress row on Dashboard + Console, the roster row on the Offering Workspace +
 *              Investor Detail).
 *
 *              Contains ZERO SOQL and ZERO DML — it only transforms records that callers have
 *              already queried. All methods are null-safe and return empty (never null) lists.
 *
 * @see     IRDTO
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class IRMapper {
    // ─── Offering progress (Dashboard + Console) ─────────────────────────

    /**
     * @description Maps offerings to progress-bar rows.
     * @param offerings Offering__c records (Property snapshot fields optional).
     * @return List of OfferingProgressDTO (never null).
     */
    public static List<IRDTO.OfferingProgressDTO> toOfferingProgress(List<Offering__c> offerings) {
        List<IRDTO.OfferingProgressDTO> rows = new List<IRDTO.OfferingProgressDTO>();
        if (offerings == null) {
            return rows;
        }
        for (Offering__c o : offerings) {
            IRDTO.OfferingProgressDTO row = new IRDTO.OfferingProgressDTO();
            row.offeringId = o.Id;
            row.name = o.Name;
            row.offeringDisplayId = o.Offering_ID__c;
            row.status = o.Status__c;
            row.amountRaised = o.Amount_Raised__c;
            row.targetRaise = o.Target_Raise__c;
            row.raisedPct = scalePct(o.Raised_Pct__c);
            row.committedInvestorCount = toInt(o.Committed_Investor_Count__c);
            row.closingDate = o.Closing_Date__c;
            rows.add(row);
        }
        return rows;
    }

    // ─── Roster / positions (Offering Workspace + Investor Detail) ───────

    /**
     * @description Maps investment records to roster/position rows. Equity percentage is derived
     *              on a 0-100 scale from Amount_Funded__c over the offering's Amount_Raised__c
     *              (falling back to the Equity_Pct__c fraction) because the stored formula is a
     *              fraction.
     * @param investments Investment__c records.
     * @return List of RosterRowDTO (never null).
     */
    public static List<IRDTO.RosterRowDTO> toRosterRows(List<Investment__c> investments) {
        List<IRDTO.RosterRowDTO> rows = new List<IRDTO.RosterRowDTO>();
        if (investments == null) {
            return rows;
        }
        for (Investment__c inv : investments) {
            IRDTO.RosterRowDTO row = new IRDTO.RosterRowDTO();
            row.investmentId = inv.Id;
            row.entityName = inv.Investing_Entity__r.Name;
            row.units = inv.Units__c;
            row.lpCapital = inv.Amount_Funded__c;
            row.equityPct = deriveEquityPct(inv);
            row.costBasis = inv.Cost_Basis__c;
            row.status = inv.Status__c;
            rows.add(row);
        }
        return rows;
    }

    private static Decimal deriveEquityPct(Investment__c inv) {
        Decimal raised = (inv.Offering__r != null) ? inv.Offering__r.Amount_Raised__c : null;
        if (raised != null && raised != 0 && inv.Amount_Funded__c != null) {
            return (inv.Amount_Funded__c / raised * 100).setScale(2);
        }
        if (inv.Equity_Pct__c != null) {
            return (inv.Equity_Pct__c * 100).setScale(2);
        }
        return 0;
    }

    // ─── Contributions (Offering Workspace + Payments) ───────────────────

    /**
     * @description Maps contribution records to feed rows.
     * @param contributions Contribution__c records.
     * @return List of ContributionRowDTO (never null).
     */
    public static List<IRDTO.ContributionRowDTO> toContributionRows(List<Contribution__c> contributions) {
        List<IRDTO.ContributionRowDTO> rows = new List<IRDTO.ContributionRowDTO>();
        if (contributions == null) {
            return rows;
        }
        for (Contribution__c c : contributions) {
            IRDTO.ContributionRowDTO row = new IRDTO.ContributionRowDTO();
            row.recordId = c.Id;
            row.entityName = (c.Investment__r != null &&
                c.Investment__r.Investing_Entity__r != null)
                ? c.Investment__r.Investing_Entity__r.Name
                : null;
            row.amount = c.Amount__c;
            row.method = c.Payment_Method__c;
            row.wireName = (c.Wire__r != null) ? c.Wire__r.Name : null;
            row.contributionDate = c.Contribution_Date__c;
            row.matchStatus = c.Match_Status__c;
            rows.add(row);
        }
        return rows;
    }

    // ─── Distribution batches (Distributions + Offering Workspace) ───────

    /**
     * @description Maps distribution-batch records to batch list rows.
     * @param batches Distribution_Batch__c records.
     * @return List of BatchRowDTO (never null).
     */
    public static List<IRDTO.BatchRowDTO> toBatchRows(List<Distribution_Batch__c> batches) {
        List<IRDTO.BatchRowDTO> rows = new List<IRDTO.BatchRowDTO>();
        if (batches == null) {
            return rows;
        }
        for (Distribution_Batch__c b : batches) {
            IRDTO.BatchRowDTO row = new IRDTO.BatchRowDTO();
            row.recordId = b.Id;
            row.name = b.Name;
            row.offeringName = (b.Offering__r != null) ? b.Offering__r.Name : null;
            row.batchType = b.Batch_Type__c;
            row.totalAmount = b.Total_Amount__c;
            row.investorCount = toInt(b.Investor_Count__c);
            row.achAmount = b.ACH_Amount__c;
            row.chequeAmount = b.Cheque_Amount__c;
            row.status = b.Status__c;
            row.distDate = b.Distribution_Date__c;
            rows.add(row);
        }
        return rows;
    }

    // ─── Distributions detail (Distributions batch detail + Investor Detail)

    /**
     * @description Maps distribution records to detail rows.
     * @param distributions Distribution__c records.
     * @return List of DistributionRowDTO (never null).
     */
    public static List<IRDTO.DistributionRowDTO> toDistributionRows(List<Distribution__c> distributions) {
        List<IRDTO.DistributionRowDTO> rows = new List<IRDTO.DistributionRowDTO>();
        if (distributions == null) {
            return rows;
        }
        for (Distribution__c d : distributions) {
            IRDTO.DistributionRowDTO row = new IRDTO.DistributionRowDTO();
            row.recordId = d.Id;
            row.entityName = (d.Investment__r != null &&
                d.Investment__r.Investing_Entity__r != null)
                ? d.Investment__r.Investing_Entity__r.Name
                : null;
            row.equityPct = scalePct(d.Equity_Pct__c);
            row.amount = d.Amount__c;
            row.method = d.Payment_Method__c;
            row.achStatus = d.ACH_Status__c;
            rows.add(row);
        }
        return rows;
    }

    // ─── Commitments (Offering Workspace + Investor Detail) ──────────────

    /**
     * @description Maps commitment records to rows.
     * @param commitments Commitment__c records.
     * @return List of CommitmentRowDTO (never null).
     */
    public static List<IRDTO.CommitmentRowDTO> toCommitmentRows(List<Commitment__c> commitments) {
        List<IRDTO.CommitmentRowDTO> rows = new List<IRDTO.CommitmentRowDTO>();
        if (commitments == null) {
            return rows;
        }
        for (Commitment__c c : commitments) {
            IRDTO.CommitmentRowDTO row = new IRDTO.CommitmentRowDTO();
            row.recordId = c.Id;
            row.entityName = (c.Investing_Entity__r != null) ? c.Investing_Entity__r.Name : null;
            row.committedAmount = c.Committed_Amount__c;
            row.status = c.Status__c;
            row.commitDate = c.Commitment_Date__c;
            row.funded = c.Funded__c;
            rows.add(row);
        }
        return rows;
    }

    // ─── Signatures (Offering Workspace) ─────────────────────────────────

    /**
     * @description Maps subscription-document records to signature rows.
     * @param docs Subscription_Doc__c records.
     * @return List of SignatureRowDTO (never null).
     */
    public static List<IRDTO.SignatureRowDTO> toSignatureRows(List<Subscription_Doc__c> docs) {
        List<IRDTO.SignatureRowDTO> rows = new List<IRDTO.SignatureRowDTO>();
        if (docs == null) {
            return rows;
        }
        for (Subscription_Doc__c d : docs) {
            IRDTO.SignatureRowDTO row = new IRDTO.SignatureRowDTO();
            row.recordId = d.Id;
            row.entityName = (d.Investing_Entity__r != null) ? d.Investing_Entity__r.Name : null;
            row.primaryStatus = d.Primary_Signature_Status__c;
            row.secondaryStatus = d.Secondary_Signature_Status__c;
            row.finalized = d.Finalized__c;
            row.fundingInstructions = d.Funding_Instructions_Status__c;
            row.singleSigner = d.Single_Signer__c;
            rows.add(row);
        }
        return rows;
    }

    // ─── Waitlist (Offering Workspace) ───────────────────────────────────

    /**
     * @description Maps waitlist records to rows.
     * @param entries Waitlist__c records.
     * @return List of WaitlistRowDTO (never null).
     */
    public static List<IRDTO.WaitlistRowDTO> toWaitlistRows(List<Waitlist__c> entries) {
        List<IRDTO.WaitlistRowDTO> rows = new List<IRDTO.WaitlistRowDTO>();
        if (entries == null) {
            return rows;
        }
        for (Waitlist__c w : entries) {
            IRDTO.WaitlistRowDTO row = new IRDTO.WaitlistRowDTO();
            row.recordId = w.Id;
            row.position = toInt(w.Position__c);
            row.entityName = (w.Investing_Entity__r != null) ? w.Investing_Entity__r.Name : null;
            row.amount = w.Amount__c;
            row.added = w.Added_Date__c;
            row.autoPromote = w.Auto_Promote__c;
            row.status = w.Status__c;
            rows.add(row);
        }
        return rows;
    }

    // ─── Wires (Offering Workspace + Payments) ───────────────────────────

    /**
     * @description Maps a single wire record to a row.
     * @param w Wire__c record.
     * @return A WireRowDTO, or null when input is null.
     */
    public static IRDTO.WireRowDTO toWireRow(Wire__c w) {
        if (w == null) {
            return null;
        }
        IRDTO.WireRowDTO row = new IRDTO.WireRowDTO();
        row.recordId = w.Id;
        row.sender = w.Sender_Name__c;
        row.amount = w.Amount__c;
        row.memo = w.Memo__c;
        row.received = w.Received_DateTime__c;
        row.confidence = toInt(w.Match_Confidence__c);
        row.bucket = w.Confidence_Bucket__c;
        row.matchStatus = w.Match_Status__c;
        row.matchedAccount = (w.Matched_Account__r != null) ? w.Matched_Account__r.Name : null;
        return row;
    }

    /**
     * @description Maps wire records to rows.
     * @param wires Wire__c records.
     * @return List of WireRowDTO (never null).
     */
    public static List<IRDTO.WireRowDTO> toWireRows(List<Wire__c> wires) {
        List<IRDTO.WireRowDTO> rows = new List<IRDTO.WireRowDTO>();
        if (wires == null) {
            return rows;
        }
        for (Wire__c w : wires) {
            rows.add(toWireRow(w));
        }
        return rows;
    }

    // ─── Documents (Documents + Investor Detail) ─────────────────────────

    /**
     * @description Maps IR document records to rows.
     * @param docs IR_Document__c records.
     * @return List of DocumentRowDTO (never null).
     */
    public static List<IRDTO.DocumentRowDTO> toDocumentRows(List<IR_Document__c> docs) {
        List<IRDTO.DocumentRowDTO> rows = new List<IRDTO.DocumentRowDTO>();
        if (docs == null) {
            return rows;
        }
        for (IR_Document__c d : docs) {
            IRDTO.DocumentRowDTO row = new IRDTO.DocumentRowDTO();
            row.recordId = d.Id;
            row.fileName = d.File_Name__c;
            row.category = d.Category__c;
            row.offeringName = (d.Offering__r != null) ? d.Offering__r.Name : null;
            row.entityName = (d.Investing_Entity__r != null) ? d.Investing_Entity__r.Name : null;
            row.uploaded = d.Uploaded_Date__c;
            row.portalVisible = d.Portal_Visible__c;
            rows.add(row);
        }
        return rows;
    }

    // ─── Share transfers (Share Transfers) ───────────────────────────────

    /**
     * @description Maps a single share-transfer record to a row.
     * @param t Share_Transfer__c record.
     * @return A TransferRowDTO, or null when input is null.
     */
    public static IRDTO.TransferRowDTO toTransferRow(Share_Transfer__c t) {
        if (t == null) {
            return null;
        }
        IRDTO.TransferRowDTO row = new IRDTO.TransferRowDTO();
        row.recordId = t.Id;
        row.name = t.Name;
        row.fromEntity = (t.Transferor_Investment__r != null &&
            t.Transferor_Investment__r.Investing_Entity__r != null)
            ? t.Transferor_Investment__r.Investing_Entity__r.Name
            : null;
        row.toEntity = (t.Transferee_Account__r != null) ? t.Transferee_Account__r.Name : null;
        row.offeringName = t.Offering_Name__c;
        row.units = t.Units_Transferred__c;
        row.amount = t.Transfer_Amount__c;
        row.status = t.Status__c;
        row.approvalStatus = t.Approval_Status__c;
        row.transferDate = t.Transfer_Date__c;
        return row;
    }

    /**
     * @description Maps share-transfer records to rows.
     * @param transfers Share_Transfer__c records.
     * @return List of TransferRowDTO (never null).
     */
    public static List<IRDTO.TransferRowDTO> toTransferRows(List<Share_Transfer__c> transfers) {
        List<IRDTO.TransferRowDTO> rows = new List<IRDTO.TransferRowDTO>();
        if (transfers == null) {
            return rows;
        }
        for (Share_Transfer__c t : transfers) {
            rows.add(toTransferRow(t));
        }
        return rows;
    }

    // ─── Leads (Onboarding) ──────────────────────────────────────────────

    /**
     * @description Maps lead records to onboarding queue rows.
     * @param leads Lead records.
     * @return List of LeadRowDTO (never null).
     */
    public static List<IRDTO.LeadRowDTO> toLeadRows(List<Lead> leads) {
        List<IRDTO.LeadRowDTO> rows = new List<IRDTO.LeadRowDTO>();
        if (leads == null) {
            return rows;
        }
        for (Lead l : leads) {
            IRDTO.LeadRowDTO row = new IRDTO.LeadRowDTO();
            row.recordId = l.Id;
            row.name = l.Name;
            row.channel = l.Investor_Channel__c;
            row.kycStatus = l.Onboarding_KYC_Status__c;
            row.portalStatus = l.Portal_Invite_Status__c;
            row.created = l.CreatedDate;
            rows.add(row);
        }
        return rows;
    }

    // ─── Investors (Investor List) ───────────────────────────────────────

    /**
     * @description Maps investor records to list rows.
     * @param investors Investor__c records.
     * @return List of InvestorRowDTO (never null).
     */
    public static List<IRDTO.InvestorRowDTO> toInvestorRows(List<Investor__c> investors) {
        List<IRDTO.InvestorRowDTO> rows = new List<IRDTO.InvestorRowDTO>();
        if (investors == null) {
            return rows;
        }
        for (Investor__c i : investors) {
            IRDTO.InvestorRowDTO row = new IRDTO.InvestorRowDTO();
            row.recordId = i.Id;
            row.investorName = i.Name;
            row.tier = i.Investor_Tier__c;
            row.lifetimeInvested = i.Lifetime_Invested__c;
            row.totalCommitments = toInt(i.Total_Commitments__c);
            row.entitiesCount = toInt(i.Investing_Entities_Count__c);
            row.kycStatus = i.KYC_Status__c;
            row.lastActivity = i.Last_Activity_Date__c;
            row.irRep = (i.IR_Rep__r != null) ? i.IR_Rep__r.Name : null;
            rows.add(row);
        }
        return rows;
    }

    // ─── Shared numeric helpers ──────────────────────────────────────────

    /**
     * @description Null-safe conversion of a Decimal (typically an SObject numeric field) to an
     *              Integer.
     */
    public static Integer toInt(Decimal value) {
        return value == null ? 0 : value.intValue();
    }

    /**
     * @description Null-safe scaling of a percentage value to one decimal place.
     */
    public static Decimal scalePct(Decimal value) {
        return value == null ? 0 : value.setScale(1);
    }

    /**
     * @description Robust Integer conversion for an AggregateResult value. COUNT()/COUNT(Id)
     *              results are boxed as Integer while SUM()/AVG() are boxed as Decimal — casting an
     *              Integer-boxed Object straight to Decimal throws, so this normalises both.
     * @param value The raw Object returned by AggregateResult.get(alias).
     * @return The value as an Integer; 0 when null.
     */
    public static Integer aggInt(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Integer) {
            return (Integer) value;
        }
        if (value instanceof Decimal) {
            return ((Decimal) value).intValue();
        }
        return Integer.valueOf(String.valueOf(value));
    }

    /**
     * @description Robust Decimal conversion for an AggregateResult value (SUM/AVG return Decimal,
     *              COUNT returns Integer). Normalises either boxed type to a Decimal.
     * @param value The raw Object returned by AggregateResult.get(alias).
     * @return The value as a Decimal; 0 when null.
     */
    public static Decimal aggDecimal(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Decimal) {
            return (Decimal) value;
        }
        return Decimal.valueOf(String.valueOf(value));
    }
}
