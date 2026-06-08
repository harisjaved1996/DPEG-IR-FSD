/**
 * @description Thin controller for the Offering Workspace (`offeringWorkspace` + tab children).
 *              Exposes one cacheable method per workspace area (header, property overview, roster,
 *              contributions, distribution batches, commitments, wire matching, signatures,
 *              waitlist). All SOQL lives in selectors; this class orchestrates selector calls,
 *              maps records to DTOs via IRMapper, and computes the header stage tracker in memory.
 *
 * @see     IRDTO
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class OfferingWorkspaceController {
    /** The Offering__c eight-stage lifecycle (matches the Status__c restricted picklist order). */
    private static final List<String> OFFERING_STAGES = new List<String>{
        'Draft',
        'Pre-Launch',
        'Active Fundraising',
        'Fully Subscribed',
        'Signatures Pending',
        'Ready to Activate',
        'Investment Active',
        'Closed Funded'
    };

    /**
     * @description Loads the workspace header (stage tracker + KPIs) for an offering.
     * @param offeringId The Offering__c Id.
     * @return A populated IRDTO.OfferingHeaderDTO, or null when the offering is not found.
     */
    @AuraEnabled(cacheable=true)
    public static IRDTO.OfferingHeaderDTO getHeader(Id offeringId) {
        try {
            Offering__c o = OfferingSelector.selectByIdWithProperty(offeringId);
            if (o == null) {
                return null;
            }

            IRDTO.OfferingHeaderDTO dto = new IRDTO.OfferingHeaderDTO();
            dto.offeringId = o.Id;
            dto.name = o.Name;
            dto.offeringDisplayId = o.Offering_ID__c;
            dto.status = o.Status__c;
            dto.stages = OFFERING_STAGES;
            dto.currentStageIndex = stageIndexOf(o.Status__c);
            dto.targetRaise = o.Target_Raise__c;
            dto.amountRaised = o.Amount_Raised__c;
            dto.raisedPct = IRMapper.scalePct(o.Raised_Pct__c);
            dto.overbookCap = o.Overbook_Cap__c;
            dto.committedCount = IRMapper.toInt(o.Committed_Investor_Count__c);
            dto.closingDate = o.Closing_Date__c;
            dto.gpEntity = o.GP_Entity__c;
            return dto;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load the offering header. ' + e.getMessage());
        }
    }

    /**
     * @description Loads the property overview tab for an offering's linked property.
     * @param offeringId The Offering__c Id.
     * @return A populated IRDTO.PropertyOverviewDTO, or null when there is no linked property.
     */
    @AuraEnabled(cacheable=true)
    public static IRDTO.PropertyOverviewDTO getPropertyOverview(Id offeringId) {
        try {
            Offering__c o = OfferingSelector.selectByIdWithProperty(offeringId);
            if (o == null || o.Property__c == null) {
                return null;
            }

            Property__c p = PropertySelector.selectByIdFull(o.Property__c);
            if (p == null) {
                return null;
            }

            IRDTO.PropertyOverviewDTO dto = new IRDTO.PropertyOverviewDTO();
            dto.propertyId = p.Id;
            dto.name = p.Name;
            dto.propertyType = p.Property_Type__c;
            dto.address = p.Address__c;
            dto.county = p.County__c;
            dto.submarket = p.Submarket__c;
            dto.rentableSqFt = p.Rentable_SqFt__c;
            dto.units = p.Units__c;
            dto.yearBuilt = IRMapper.toInt(p.Year_Built__c);
            dto.yearRenovated = IRMapper.toInt(p.Year_Renovated__c);
            dto.occupancyPct = IRMapper.scalePct(p.Occupancy_Pct__c);
            dto.annualNoi = p.Annual_NOI__c;
            dto.capRate = p.Cap_Rate__c;
            dto.cashOnCash = p.Cash_on_Cash__c;
            dto.irrToDate = p.IRR_To_Date__c;
            dto.targetIrr = p.Target_IRR__c;
            dto.projectedExit = p.Projected_Exit__c;
            dto.lpCapital = p.LP_Capital__c;
            dto.dpegStake = p.DPEG_Stake__c;
            dto.lender = p.Lender__c;
            dto.debtStructure = p.Debt_Structure__c;
            return dto;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load the property overview. ' + e.getMessage());
        }
    }

    /**
     * @description Loads the investment roster for an offering.
     * @param offeringId The Offering__c Id.
     * @return List of IRDTO.RosterRowDTO (never null).
     */
    @AuraEnabled(cacheable=true)
    public static List<IRDTO.RosterRowDTO> getRoster(Id offeringId) {
        try {
            return IRMapper.toRosterRows(InvestmentSelector.selectByOffering(offeringId));
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load the roster. ' + e.getMessage());
        }
    }

    /**
     * @description Loads the contribution feed for an offering.
     * @param offeringId The Offering__c Id.
     * @return List of IRDTO.ContributionRowDTO (never null).
     */
    @AuraEnabled(cacheable=true)
    public static List<IRDTO.ContributionRowDTO> getContributions(Id offeringId) {
        try {
            return IRMapper.toContributionRows(ContributionSelector.selectByOffering(offeringId));
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load contributions. ' + e.getMessage());
        }
    }

    /**
     * @description Loads the distribution batches for an offering.
     * @param offeringId The Offering__c Id.
     * @return List of IRDTO.BatchRowDTO (never null).
     */
    @AuraEnabled(cacheable=true)
    public static List<IRDTO.BatchRowDTO> getDistributionBatches(Id offeringId) {
        try {
            return IRMapper.toBatchRows(DistributionBatchSelector.selectByOffering(offeringId));
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load distribution batches. ' + e.getMessage());
        }
    }

    /**
     * @description Loads the commitments for an offering.
     * @param offeringId The Offering__c Id.
     * @return List of IRDTO.CommitmentRowDTO (never null).
     */
    @AuraEnabled(cacheable=true)
    public static List<IRDTO.CommitmentRowDTO> getCommitments(Id offeringId) {
        try {
            return IRMapper.toCommitmentRows(CommitmentSelector.selectByOffering(offeringId));
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load commitments. ' + e.getMessage());
        }
    }

    /**
     * @description Loads the wire-matching feed grouped into confidence buckets for an offering.
     * @param offeringId The Offering__c Id.
     * @return List of IRDTO.WireBucketDTO (never null), one per confidence bucket present.
     */
    @AuraEnabled(cacheable=true)
    public static List<IRDTO.WireBucketDTO> getWireMatching(Id offeringId) {
        try {
            return groupWiresIntoBuckets(WireSelector.selectByOffering(offeringId));
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load wire matching. ' + e.getMessage());
        }
    }

    /**
     * @description Loads the subscription-document signature rows for an offering.
     * @param offeringId The Offering__c Id.
     * @return List of IRDTO.SignatureRowDTO (never null).
     */
    @AuraEnabled(cacheable=true)
    public static List<IRDTO.SignatureRowDTO> getSignatures(Id offeringId) {
        try {
            return IRMapper.toSignatureRows(SubscriptionDocSelector.selectByOffering(offeringId));
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load signatures. ' + e.getMessage());
        }
    }

    /**
     * @description Loads the waitlist for an offering (ordered by position).
     * @param offeringId The Offering__c Id.
     * @return List of IRDTO.WaitlistRowDTO (never null).
     */
    @AuraEnabled(cacheable=true)
    public static List<IRDTO.WaitlistRowDTO> getWaitlist(Id offeringId) {
        try {
            return IRMapper.toWaitlistRows(WaitlistSelector.selectByOffering(offeringId));
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load the waitlist. ' + e.getMessage());
        }
    }

    /**
     * @description Resolves a status value to its index within the eight-stage lifecycle.
     * @return The zero-based stage index, or 0 when the status is blank / unmatched.
     */
    private static Integer stageIndexOf(String status) {
        if (String.isBlank(status)) {
            return 0;
        }
        Integer idx = OFFERING_STAGES.indexOf(status);
        return idx < 0 ? 0 : idx;
    }

    /**
     * @description Groups wire rows into confidence buckets, accumulating count and total amount.
     *              Pure in-memory grouping over already-queried records.
     */
    private static List<IRDTO.WireBucketDTO> groupWiresIntoBuckets(List<Wire__c> wires) {
        Map<String, IRDTO.WireBucketDTO> byBucket = new Map<String, IRDTO.WireBucketDTO>();
        if (wires == null) {
            return new List<IRDTO.WireBucketDTO>();
        }

        for (Wire__c w : wires) {
            String bucketKey = String.isBlank(w.Confidence_Bucket__c) ? 'Unclassified' : w.Confidence_Bucket__c;

            IRDTO.WireBucketDTO bucket = byBucket.get(bucketKey);
            if (bucket == null) {
                bucket = new IRDTO.WireBucketDTO();
                bucket.bucket = bucketKey;
                byBucket.put(bucketKey, bucket);
            }

            bucket.wires.add(IRMapper.toWireRow(w));
            bucket.count += 1;
            bucket.totalAmount += (w.Amount__c == null ? 0 : w.Amount__c);
        }

        return byBucket.values();
    }
}
