/**
 * @description Thin controller for the IR Investors list screen (`irInvestorList` LWC). Returns the
 *              investor rows, optionally filtered by tier (blank tier returns all). Row metrics read
 *              the seeded Investor__c rollup fields directly — no recomputation. All SOQL lives in
 *              the selector; this class orchestrates the selector call and maps results to DTOs.
 *
 * @see     IRDTO
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class InvestorListController {
    /**
     * @description Returns investor list rows, optionally filtered by tier.
     * @param tier The Investor_Tier__c value to filter by, or null/blank for all investors.
     * @return List of IRDTO.InvestorRowDTO (never null).
     */
    @AuraEnabled(cacheable=true)
    public static List<IRDTO.InvestorRowDTO> getInvestors(String tier) {
        try {
            return IRMapper.toInvestorRows(InvestorSelector.selectByTier(tier));
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load investors. ' + e.getMessage());
        }
    }
}
