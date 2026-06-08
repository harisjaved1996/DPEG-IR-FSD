/**
 * @description Thin controller for the Portfolio / Active Investments screen (`irPortfolio` LWC).
 *              Assembles portfolio KPIs and per-offering property cards into an IRDTO.PortfolioDTO.
 *              Per-offering LP capital / investor count / distributed totals come from a single
 *              GROUP BY aggregate; property metrics come from the active offerings list. All SOQL
 *              lives in selectors; this class orchestrates selectors and computes derived values
 *              (target-IRR progress, nearest exit) in memory.
 *
 * @see     IRDTO
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class PortfolioController {
    /**
     * @description Builds the portfolio payload: 6 KPI tiles + one card per active offering.
     * @return A populated IRDTO.PortfolioDTO.
     */
    @AuraEnabled(cacheable=true)
    public static IRDTO.PortfolioDTO getPortfolio() {
        try {
            IRDTO.PortfolioDTO dto = new IRDTO.PortfolioDTO();

            dto.kpis = new List<IRDTO.MetricDTO>{
                IRDTO.metricNumber('activeInvestments', 'Active Investments', InvestmentSelector.countActive()),
                IRDTO.metricCurrency(
                    'lpCapitalDeployed',
                    'LP Capital Deployed',
                    InvestmentSelector.sumAmountFundedActive()
                ),
                IRDTO.metricNumber(
                    'totalLpInvestors',
                    'Total LP Investors',
                    InvestmentSelector.countDistinctActiveEntities()
                ),
                IRDTO.metricCurrency('distributedToDate', 'Distributed To Date', DistributionSelector.sumAmount()),
                IRDTO.metricPercent('avgIrr', 'Avg IRR', PropertySelector.avgIrrToDateActive()),
                buildNearestExitMetric(PropertySelector.selectActiveOrderByExit())
            };

            dto.cards = buildCards(
                OfferingSelector.selectActiveOrderByRaisedDesc(),
                InvestmentSelector.aggregateByOfferingActive()
            );

            return dto;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to load the portfolio. ' + e.getMessage());
        }
    }

    /**
     * @description Builds the portfolio cards by joining active offerings (property metrics) with
     *              the per-offering investment aggregate (LP capital, investor count, distributed).
     *              Pure in-memory join over already-queried records.
     */
    private static List<IRDTO.PortfolioCardDTO> buildCards(
        List<Offering__c> offerings,
        List<AggregateResult> offeringAggregates
    ) {
        Map<Id, AggregateResult> aggByOffering = new Map<Id, AggregateResult>();
        if (offeringAggregates != null) {
            for (AggregateResult ar : offeringAggregates) {
                aggByOffering.put((Id) ar.get('offeringId'), ar);
            }
        }

        List<IRDTO.PortfolioCardDTO> cards = new List<IRDTO.PortfolioCardDTO>();
        if (offerings == null) {
            return cards;
        }

        for (Offering__c o : offerings) {
            IRDTO.PortfolioCardDTO card = new IRDTO.PortfolioCardDTO();
            card.offeringId = o.Id;
            card.offeringName = o.Name;

            if (o.Property__r != null) {
                card.propertyName = o.Property__r.Name;
                card.propertyType = o.Property__r.Property_Type__c;
                card.occupancyPct = IRMapper.scalePct(o.Property__r.Occupancy_Pct__c);
                card.capRate = o.Property__r.Cap_Rate__c;
                card.cashOnCash = o.Property__r.Cash_on_Cash__c;
                card.irrToDate = o.Property__r.IRR_To_Date__c;
                card.targetIrr = o.Property__r.Target_IRR__c;
                card.targetIrrProgressPct = progressPct(o.Property__r.IRR_To_Date__c, o.Property__r.Target_IRR__c);
            }

            AggregateResult agg = aggByOffering.get(o.Id);
            if (agg != null) {
                card.lpCapital = IRMapper.aggDecimal(agg.get('lpCapital'));
                card.investorCount = IRMapper.aggInt(agg.get('investorCount'));
                card.distributed = IRMapper.aggDecimal(agg.get('distributed'));
            } else {
                card.lpCapital = 0;
                card.investorCount = 0;
                card.distributed = 0;
            }

            cards.add(card);
        }

        return cards;
    }

    /**
     * @description Computes IRR-to-date as a percentage of the target IRR (progress toward goal),
     *              capped at 100. Pure in-memory arithmetic.
     */
    private static Decimal progressPct(Decimal irrToDate, Decimal targetIrr) {
        if (irrToDate == null || targetIrr == null || targetIrr == 0) {
            return 0;
        }
        Decimal pct = (irrToDate / targetIrr * 100).setScale(1);
        return pct > 100 ? 100 : pct;
    }

    /**
     * @description Builds the "Nearest Exit" KPI from the active properties ordered by projected
     *              exit text. Best-effort: surfaces the first property's projected-exit string as a
     *              text metric (Projected_Exit__c is free text, e.g. "Q3 2028").
     */
    private static IRDTO.MetricDTO buildNearestExitMetric(List<Property__c> propertiesByExit) {
        IRDTO.MetricDTO metric = new IRDTO.MetricDTO();
        metric.key = 'nearestExit';
        metric.label = 'Nearest Exit';
        metric.unit = 'text';
        metric.value = 0;
        metric.displayValue = (propertiesByExit != null &&
            !propertiesByExit.isEmpty() &&
            String.isNotBlank(propertiesByExit[0].Projected_Exit__c))
            ? propertiesByExit[0].Projected_Exit__c
            : '—';
        return metric;
    }
}
