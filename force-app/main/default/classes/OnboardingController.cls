/**
 * @description Thin controller for the IR Onboarding screen (`irOnboarding` LWC). Assembles
 *              onboarding KPIs (open queue, invited, and one tile per KYC status) and the lead
 *              queue into an IRDTO.OnboardingDTO. All SOQL lives in selectors; this class
 *              orchestrates selector calls and maps results to DTOs.
 *
 * @see     IRDTO
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class OnboardingController {
    /**
     * @description Builds the onboarding payload: KPI tiles + the open lead queue.
     * @return A populated IRDTO.OnboardingDTO.
     */
    @AuraEnabled(cacheable=true)
    public static IRDTO.OnboardingDTO getOnboarding() {
        try {
            IRDTO.OnboardingDTO dto = new IRDTO.OnboardingDTO();

            dto.kpis = buildKpis(
                LeadSelector.countOpen(),
                LeadSelector.countInvited(),
                LeadSelector.countGroupedByKycStatus()
            );

            dto.leads = IRMapper.toLeadRows(LeadSelector.selectOnboardingQueue());

            return dto;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load onboarding. ' + e.getMessage());
        }
    }

    /**
     * @description Builds onboarding KPI tiles: a fixed Open Queue + Invited pair, followed by one
     *              tile per KYC status returned by the grouped aggregate. Pure in-memory mapping.
     */
    private static List<IRDTO.MetricDTO> buildKpis(
        Integer openCount,
        Integer invitedCount,
        List<AggregateResult> kycGroups
    ) {
        List<IRDTO.MetricDTO> kpis = new List<IRDTO.MetricDTO>{
            IRDTO.metricNumber('openQueue', 'Open Queue', openCount),
            IRDTO.metricNumber('invited', 'Invited', invitedCount)
        };

        if (kycGroups != null) {
            for (AggregateResult ar : kycGroups) {
                String status = (String) ar.get('kycStatus');
                String label = String.isBlank(status) ? 'KYC: Unspecified' : 'KYC: ' + status;
                String key = 'kyc_' + (String.isBlank(status) ? 'unspecified' : status);
                Integer count = IRMapper.aggInt(ar.get('recordCount'));
                kpis.add(IRDTO.metricNumber(key, label, count));
            }
        }

        return kpis;
    }
}
