/**
 * @description Thin controller for the Investor Detail record page (`irInvestorDetail` LWC).
 *              Orchestrates the investor → contact → investing-entity chain across selectors to
 *              assemble summary KPIs (from seeded Investor__c rollups) plus the investor's
 *              positions, commitments, distributions, and documents into an IRDTO.InvestorDetailDTO.
 *
 *              No SOQL lives here — every database read is delegated to a selector:
 *                1. InvestorSelector.selectByIdWithContact      → summary + Contact__c
 *                2. InvestingEntityContactSelector.selectByContactId → investing-entity Account Ids
 *                3. InvestmentSelector.selectByEntityIds         → positions
 *                4. CommitmentSelector.selectByEntityIds         → commitments
 *                5. DistributionSelector.selectByEntityIds       → distributions
 *                6. IRDocumentSelector.selectByEntityIds         → documents
 *
 * @see     IRDTO
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class InvestorDetailController {
    /**
     * @description Builds the full investor-detail payload for a single investor.
     * @param investorId The Investor__c Id.
     * @return A populated IRDTO.InvestorDetailDTO, or null when the investor is not found.
     */
    @AuraEnabled(cacheable=true)
    public static IRDTO.InvestorDetailDTO getInvestorDetail(Id investorId) {
        try {
            Investor__c investor = InvestorSelector.selectByIdWithContact(investorId);
            if (investor == null) {
                return null;
            }

            Set<Id> accountIds = resolveEntityAccountIds(investor.Contact__c);

            IRDTO.InvestorDetailDTO dto = new IRDTO.InvestorDetailDTO();
            dto.investorId = investor.Id;
            dto.investorName = investor.Name;
            dto.tier = investor.Investor_Tier__c;
            dto.kycStatus = investor.KYC_Status__c;
            dto.summary = buildSummary(investor);
            dto.positions = IRMapper.toRosterRows(InvestmentSelector.selectByEntityIds(accountIds));
            dto.commitments = IRMapper.toCommitmentRows(CommitmentSelector.selectByEntityIds(accountIds));
            dto.distributions = IRMapper.toDistributionRows(DistributionSelector.selectByEntityIds(accountIds));
            dto.documents = IRMapper.toDocumentRows(IRDocumentSelector.selectByEntityIds(accountIds));
            return dto;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load the investor detail. ' + e.getMessage());
        }
    }

    /**
     * @description Resolves the set of investing-entity Account Ids linked to the investor's
     *              contact via the junction selector. Pure in-memory collection over selector rows.
     */
    private static Set<Id> resolveEntityAccountIds(Id contactId) {
        Set<Id> accountIds = new Set<Id>();
        if (contactId == null) {
            return accountIds;
        }
        for (Investing_Entity_Contact__c junction : InvestingEntityContactSelector.selectByContactId(contactId)) {
            if (junction.Investing_Entity__c != null) {
                accountIds.add(junction.Investing_Entity__c);
            }
        }
        return accountIds;
    }

    /**
     * @description Builds the summary KPI tiles directly from the seeded Investor__c rollup fields
     *              (no recomputation in Phase B). Pure in-memory mapping.
     */
    private static List<IRDTO.MetricDTO> buildSummary(Investor__c investor) {
        return new List<IRDTO.MetricDTO>{
            IRDTO.metricCurrency('lifetimeInvested', 'Lifetime Invested', investor.Lifetime_Invested__c),
            IRDTO.metricNumber('totalCommitments', 'Total Commitments', investor.Total_Commitments__c),
            IRDTO.metricNumber('activePositions', 'Active Positions', investor.Active_Positions__c),
            IRDTO.metricNumber('investingEntities', 'Investing Entities', investor.Investing_Entities_Count__c)
        };
    }
}
