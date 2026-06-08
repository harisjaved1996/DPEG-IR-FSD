/**
 * @description Thin controller for the IR Payments screen (`irPayments` LWC). Assembles payment
 *              KPIs, the inbound wire feed, and the recent contribution feed into an
 *              IRDTO.PaymentsDTO. "This period" contributions use a caller-supplied look-back
 *              window (default 18 months) so the feed is non-zero against seed data. All SOQL lives
 *              in selectors; this class orchestrates selectors and maps results to DTOs.
 *
 * @see     IRDTO
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class PaymentsController {
    /** Default look-back window (months) for the "this period" contribution feed / KPI. */
    private static final Integer DEFAULT_PERIOD_MONTHS = 18;

    /**
     * @description Builds the payments payload: KPI tiles, the wire feed, and the recent
     *              contribution feed.
     * @param periodMonths Look-back window in months for the contribution feed / KPI; null /
     *                     non-positive falls back to the 18-month default.
     * @return A populated IRDTO.PaymentsDTO.
     */
    @AuraEnabled(cacheable=true)
    public static IRDTO.PaymentsDTO getPayments(Integer periodMonths) {
        try {
            Date sinceDate = sinceDateFor(periodMonths);

            List<Wire__c> wireRecords = WireSelector.selectAllForFeed();

            Integer wiresInReview = 0;
            Integer wiresUnmatched = 0;
            if (wireRecords != null) {
                for (Wire__c w : wireRecords) {
                    if (w.Match_Status__c == 'Review')
                        wiresInReview++;
                    if (w.Match_Status__c == 'Unmatched')
                        wiresUnmatched++;
                }
            }

            IRDTO.PaymentsDTO dto = new IRDTO.PaymentsDTO();
            dto.kpis = new List<IRDTO.MetricDTO>{
                IRDTO.metricCurrency(
                    'contributionsThisPeriod',
                    'Contributions This Period',
                    ContributionSelector.sumAmountSince(sinceDate)
                ),
                IRDTO.metricNumber('wiresReceived', 'Wires Received', wireRecords == null ? 0 : wireRecords.size()),
                IRDTO.metricNumber('wiresInReview', 'Wires In Review', wiresInReview),
                IRDTO.metricNumber('wiresUnmatched', 'Wires Unmatched', wiresUnmatched)
            };
            dto.wires = IRMapper.toWireRows(wireRecords);
            dto.contributions = IRMapper.toContributionRows(ContributionSelector.selectRecent(sinceDate));
            return dto;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load payments. ' + e.getMessage());
        }
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
