/**
 * @description Thin controller for the IR Distributions screen (`irDistributions` LWC). Provides
 *              the distributions overview (KPIs + batch list) and the per-batch detail rows. KPIs
 *              for "this period" use a caller-supplied look-back window (default 18 months) so they
 *              are non-zero against seed data. All SOQL lives in selectors; this class orchestrates
 *              selectors, computes the since-date and ACH percentage in memory, and maps to DTOs.
 *
 * @see     IRDTO
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class DistributionsController {
    /** Default look-back window (months) for "this period" KPIs against seed data. */
    private static final Integer DEFAULT_PERIOD_MONTHS = 18;

    /**
     * @description Builds the distributions overview: KPI tiles + the full batch list.
     * @param periodMonths Look-back window in months for "this period" KPIs; null / non-positive
     *                     falls back to the 18-month default.
     * @return A populated IRDTO.DistributionsDTO.
     */
    @AuraEnabled(cacheable=true)
    public static IRDTO.DistributionsDTO getDistributions(Integer periodMonths) {
        try {
            Date sinceDate = sinceDateFor(periodMonths);

            IRDTO.DistributionsDTO dto = new IRDTO.DistributionsDTO();
            dto.kpis = buildKpis(
                DistributionBatchSelector.sumPaidMetricsSince(sinceDate),
                DistributionBatchSelector.sumSplitAllBatches(),
                DistributionBatchSelector.countPendingApproval()
            );
            dto.batches = IRMapper.toBatchRows(DistributionBatchSelector.selectAllWithOffering());
            return dto;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load distributions. ' + e.getMessage());
        }
    }

    /**
     * @description Loads the distribution detail rows for a single batch.
     * @param batchId The Distribution_Batch__c Id.
     * @return List of IRDTO.DistributionRowDTO (never null).
     */
    @AuraEnabled(cacheable=true)
    public static List<IRDTO.DistributionRowDTO> getBatchDetail(Id batchId) {
        try {
            return IRMapper.toDistributionRows(DistributionSelector.selectByBatch(batchId));
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load the batch detail. ' + e.getMessage());
        }
    }

    /**
     * @description Builds the distributions KPI tiles (paid this period, investors paid, ACH share,
     *              pending approval). Pure in-memory arithmetic over the aggregate rows.
     */
    private static List<IRDTO.MetricDTO> buildKpis(
        List<AggregateResult> paidMetrics,
        List<AggregateResult> splitMetrics,
        Integer pendingApproval
    ) {
        Decimal totalPaid = 0;
        Integer investorsPaid = 0;
        if (paidMetrics != null && !paidMetrics.isEmpty()) {
            totalPaid = IRMapper.aggDecimal(paidMetrics[0].get('totalPaid'));
            investorsPaid = IRMapper.aggInt(paidMetrics[0].get('investorsPaid'));
        }

        Decimal achPct = 0;
        if (splitMetrics != null && !splitMetrics.isEmpty()) {
            Decimal ach = IRMapper.aggDecimal(splitMetrics[0].get('achAmount'));
            Decimal total = IRMapper.aggDecimal(splitMetrics[0].get('totalAmount'));
            achPct = (total == 0) ? 0 : (ach / total * 100).setScale(1);
        }

        return new List<IRDTO.MetricDTO>{
            IRDTO.metricCurrency('distributedThisPeriod', 'Distributed This Period', totalPaid),
            IRDTO.metricNumber('investorsPaid', 'Investors Paid', investorsPaid),
            IRDTO.metricPercent('achShare', 'ACH Share', achPct),
            IRDTO.metricNumber('pendingApproval', 'Pending Approval', pendingApproval)
        };
    }

    /**
     * @description Resolves the look-back window to an inclusive since-date, defaulting to 18
     *              months when the supplied period is null or non-positive.
     */
    private static Date sinceDateFor(Integer periodMonths) {
        Integer months = (periodMonths == null || periodMonths <= 0) ? DEFAULT_PERIOD_MONTHS : periodMonths;
        return Date.today().addMonths(-months);
    }
}
