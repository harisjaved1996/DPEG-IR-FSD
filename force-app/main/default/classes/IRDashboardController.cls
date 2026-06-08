/**
 * @description Thin controller for the IR Dashboard screen (`irDashboard` LWC). Assembles the
 *              dashboard KPIs, active-offering progress rows, and the commitment→funded→active
 *              funnel into a single `IRDTO.DashboardDTO`. All SOQL lives in selectors; this class
 *              only orchestrates selector calls, performs in-memory arithmetic (percentages), and
 *              maps results to DTOs.
 *
 * @see     IRDTO
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class IRDashboardController {
    /**
     * @description Builds the full dashboard payload: 6 KPI tiles, active offerings (progress
     *              bars), and the 3-stage funnel.
     * @return A populated IRDTO.DashboardDTO.
     */
    @AuraEnabled(cacheable=true)
    public static IRDTO.DashboardDTO getDashboard() {
        try {
            IRDTO.DashboardDTO dto = new IRDTO.DashboardDTO();

            dto.kpis = new List<IRDTO.MetricDTO>{
                IRDTO.metricNumber('activeOfferings', 'Active Offerings', OfferingSelector.countActive()),
                IRDTO.metricCurrency('totalCommitted', 'Total Committed', CommitmentSelector.sumCommittedAmount()),
                IRDTO.metricCurrency('totalRaised', 'Total Raised', OfferingSelector.sumAmountRaised()),
                IRDTO.metricCurrency('totalDistributed', 'Total Distributed', DistributionSelector.sumAmount()),
                IRDTO.metricNumber('activeInvestors', 'Active Investors', InvestorSelector.countActive()),
                IRDTO.metricNumber(
                    'pendingAccreditation',
                    'Pending Accreditation',
                    InvestorSelector.countPendingAccreditation()
                )
            };

            dto.activeOfferings = IRMapper.toOfferingProgress(OfferingSelector.selectActiveOrderByRaisedDesc());

            dto.funnel = buildFunnel(
                CommitmentSelector.countAll(),
                InvestmentSelector.countFundedInvestments(),
                InvestmentSelector.countActive()
            );

            return dto;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load the IR dashboard. ' + e.getMessage());
        }
    }

    /**
     * @description Builds the commitment→funded→active funnel, computing each stage's percentage
     *              of the first stage. Pure in-memory arithmetic.
     */
    private static List<IRDTO.FunnelStageDTO> buildFunnel(
        Integer commitments,
        Integer fundedInvestments,
        Integer activeInvestments
    ) {
        Integer base = (commitments == null || commitments == 0) ? 0 : commitments;
        return new List<IRDTO.FunnelStageDTO>{
            buildStage('Commitments', commitments, base),
            buildStage('Funded Investments', fundedInvestments, base),
            buildStage('Active Investments', activeInvestments, base)
        };
    }

    private static IRDTO.FunnelStageDTO buildStage(String label, Integer count, Integer base) {
        IRDTO.FunnelStageDTO stage = new IRDTO.FunnelStageDTO();
        stage.label = label;
        stage.count = count == null ? 0 : count;
        stage.pct = base == 0 ? 0 : (Decimal.valueOf(stage.count) / base * 100).setScale(1);
        return stage;
    }
}
