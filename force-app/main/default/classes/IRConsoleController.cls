/**
 * @description Thin controller for the IR Console screen (`irConsole` LWC). Assembles console KPIs,
 *              active-offering progress rows, the ACH-vs-Cheque distribution split, and an action
 *              queue (unsigned subscription docs + active waitlist entries) into an
 *              `IRDTO.ConsoleDTO`. All SOQL lives in selectors; this class orchestrates selectors,
 *              performs in-memory arithmetic, and maps to DTOs.
 *
 * @see     IRDTO
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class IRConsoleController {
    /** Default look-back window (months) for "this period" console KPIs against seed data. */
    private static final Integer DEFAULT_PERIOD_MONTHS = 18;

    /**
     * @description Builds the full console payload: KPI tiles, active offerings, the ACH/Cheque
     *              distribution split, and the operational action queue.
     * @return A populated IRDTO.ConsoleDTO.
     */
    @AuraEnabled(cacheable=true)
    public static IRDTO.ConsoleDTO getConsole() {
        try {
            Date sinceDate = Date.today().addMonths(-DEFAULT_PERIOD_MONTHS);

            IRDTO.ConsoleDTO dto = new IRDTO.ConsoleDTO();

            dto.kpis = new List<IRDTO.MetricDTO>{
                IRDTO.metricCurrency(
                    'raisedThisPeriod',
                    'Raised This Period',
                    ContributionSelector.sumAmountSince(sinceDate)
                ),
                IRDTO.metricNumber('wiresInReview', 'Wires In Review', WireSelector.countByMatchStatus('Review')),
                IRDTO.metricNumber('wiresUnmatched', 'Wires Unmatched', WireSelector.countByMatchStatus('Unmatched')),
                IRDTO.metricNumber('totalInvestors', 'Investors', InvestorSelector.countAll()),
                IRDTO.metricNumber('onboardingQueue', 'Onboarding Queue', LeadSelector.countOpen()),
                IRDTO.metricNumber('pendingSignatures', 'Pending Signatures', SubscriptionDocSelector.countUnsigned())
            };

            dto.activeOfferings = IRMapper.toOfferingProgress(OfferingSelector.selectActiveOrderByRaisedDesc());

            dto.distributionSplit = buildSplit(DistributionBatchSelector.sumSplitAllBatches());

            dto.actionQueue = buildActionQueue(
                SubscriptionDocSelector.selectUnsigned(),
                WaitlistSelector.selectActive()
            );

            return dto;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load the IR console. ' + e.getMessage());
        }
    }

    /**
     * @description Builds the ACH-vs-Cheque distribution split slices with percentages of total.
     *              Pure in-memory arithmetic over a single aggregate row.
     */
    private static List<IRDTO.SplitSliceDTO> buildSplit(List<AggregateResult> splitResults) {
        List<IRDTO.SplitSliceDTO> slices = new List<IRDTO.SplitSliceDTO>();
        if (splitResults == null || splitResults.isEmpty()) {
            return slices;
        }

        AggregateResult row = splitResults[0];
        Decimal ach = IRMapper.aggDecimal(row.get('achAmount'));
        Decimal cheque = IRMapper.aggDecimal(row.get('chequeAmount'));
        Decimal total = IRMapper.aggDecimal(row.get('totalAmount'));
        Decimal denominator = (total != null && total != 0) ? total : (ach + cheque);

        slices.add(buildSlice('ACH', ach, denominator, 'teal'));
        slices.add(buildSlice('Cheque', cheque, denominator, 'navy'));
        return slices;
    }

    private static IRDTO.SplitSliceDTO buildSlice(
        String label,
        Decimal amount,
        Decimal denominator,
        String colorToken
    ) {
        IRDTO.SplitSliceDTO slice = new IRDTO.SplitSliceDTO();
        slice.label = label;
        slice.amount = amount == null ? 0 : amount;
        slice.pct = (denominator == null || denominator == 0) ? 0 : (slice.amount / denominator * 100).setScale(1);
        slice.colorToken = colorToken;
        return slice;
    }

    /**
     * @description Builds the action queue from unsigned subscription documents and active waitlist
     *              entries. Pure in-memory mapping over already-queried records.
     */
    private static List<IRDTO.ActionItemDTO> buildActionQueue(
        List<Subscription_Doc__c> unsignedDocs,
        List<Waitlist__c> activeWaitlist
    ) {
        List<IRDTO.ActionItemDTO> items = new List<IRDTO.ActionItemDTO>();

        if (unsignedDocs != null) {
            for (Subscription_Doc__c d : unsignedDocs) {
                IRDTO.ActionItemDTO item = new IRDTO.ActionItemDTO();
                item.recordId = d.Id;
                item.category = 'Signature';
                item.label = (d.Investing_Entity__r != null) ? d.Investing_Entity__r.Name : d.Name;
                item.sublabel = 'Subscription document awaiting signature';
                item.status = d.Primary_Signature_Status__c;
                item.objectApiName = 'Subscription_Doc__c';
                items.add(item);
            }
        }

        if (activeWaitlist != null) {
            for (Waitlist__c w : activeWaitlist) {
                IRDTO.ActionItemDTO item = new IRDTO.ActionItemDTO();
                item.recordId = w.Id;
                item.category = 'Waitlist';
                item.label = (w.Investing_Entity__r != null) ? w.Investing_Entity__r.Name : w.Name;
                item.sublabel = 'Waitlisted at position ' + IRMapper.toInt(w.Position__c);
                item.amount = w.Amount__c;
                item.status = w.Status__c;
                item.objectApiName = 'Waitlist__c';
                items.add(item);
            }
        }

        return items;
    }
}
