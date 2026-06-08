/**
 * @description Selector for Investment__c. All SOQL for Investment__c lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class InvestmentSelector {
    /**
     * Row field list for roster / position displays. Offering__r.Amount_Raised__c is included
     * so the controller can derive a 0-100 equity percentage (the Equity_Pct__c formula stores
     * a fraction).
     */
    private static final String INVESTMENT_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'Investing_Entity__c',
            'Investing_Entity__r.Name',
            'Offering__c',
            'Offering__r.Name',
            'Offering__r.Amount_Raised__c',
            'Units__c',
            'Amount_Funded__c',
            'Equity_Pct__c',
            'Cost_Basis__c',
            'Status__c',
            'Funded_Date__c',
            'Total_Distributed__c'
        },
        ', '
    );

    /**
     * @description Selects investment rows for a single offering (roster).
     * @param offeringId The Offering__c Id to filter by.
     * @return List of Investment__c records for the offering; empty when Id is null.
     */
    public static List<Investment__c> selectByOffering(Id offeringId) {
        if (offeringId == null) {
            return new List<Investment__c>();
        }

        return Database.query(
            'SELECT ' +
                INVESTMENT_FIELDS +
                ' FROM Investment__c' +
                ' WHERE Offering__c = :offeringId' +
                ' WITH USER_MODE' +
                ' ORDER BY Amount_Funded__c DESC NULLS LAST'
        );
    }

    /**
     * @description Selects investment positions held by a set of investing-entity Accounts —
     *              the investor-detail positions table.
     * @param accountIds Set of Account (investing entity) Ids.
     * @return List of Investment__c records for those entities; empty when input is empty.
     */
    public static List<Investment__c> selectByEntityIds(Set<Id> accountIds) {
        if (accountIds == null || accountIds.isEmpty()) {
            return new List<Investment__c>();
        }

        return Database.query(
            'SELECT ' +
                INVESTMENT_FIELDS +
                ' FROM Investment__c' +
                ' WHERE Investing_Entity__c IN :accountIds' +
                ' WITH USER_MODE' +
                ' ORDER BY Funded_Date__c DESC NULLS LAST'
        );
    }

    /**
     * @description Counts investments in the Active state (portfolio "Active Investments" KPI).
     * @return Count of Investment__c where Status__c = 'Active'.
     */
    public static Integer countActive() {
        return [
            SELECT COUNT()
            FROM Investment__c
            WHERE Status__c = 'Active'
            WITH USER_MODE
        ];
    }

    /**
     * @description Counts funded investments (Amount_Funded__c > 0) — the middle funnel stage.
     * @return Count of funded investments.
     */
    public static Integer countFundedInvestments() {
        return [
            SELECT COUNT()
            FROM Investment__c
            WHERE Amount_Funded__c > 0
            WITH USER_MODE
        ];
    }

    /**
     * @description Sums Amount_Funded__c across active investments (portfolio "LP Capital Deployed").
     * @return Total active LP capital; 0 when none.
     */
    public static Decimal sumAmountFundedActive() {
        List<AggregateResult> results = [
            SELECT SUM(Amount_Funded__c) totalFunded
            FROM Investment__c
            WHERE Status__c = 'Active'
            WITH USER_MODE
        ];
        Decimal total = results.isEmpty() ? null : (Decimal) results[0].get('totalFunded');
        return total == null ? 0 : total;
    }

    /**
     * @description Counts distinct investing entities holding an active position
     *              (portfolio "Total LP Investors" KPI).
     * @return Distinct active investing-entity count.
     */
    public static Integer countDistinctActiveEntities() {
        List<AggregateResult> results = [
            SELECT COUNT_DISTINCT(Investing_Entity__c) entityCount
            FROM Investment__c
            WHERE Status__c = 'Active'
            WITH USER_MODE
        ];
        Integer entityCount = results.isEmpty() ? null : (Integer) results[0].get('entityCount');
        return entityCount == null ? 0 : entityCount;
    }

    /**
     * @description Aggregates active investments by offering: total LP capital, investor count, and
     *              total distributed per offering. Feeds the portfolio cards.
     * @return List of AggregateResult grouped by Offering__c (aliases: offeringId, offeringName,
     *         lpCapital, investorCount, distributed).
     */
    public static List<AggregateResult> aggregateByOfferingActive() {
        return [
            SELECT
                Offering__c offeringId,
                Offering__r.Name offeringName,
                SUM(Amount_Funded__c) lpCapital,
                COUNT(Id) investorCount,
                SUM(Total_Distributed__c) distributed
            FROM Investment__c
            WHERE Status__c = 'Active' AND Offering__c != NULL
            WITH USER_MODE
            GROUP BY Offering__c, Offering__r.Name
        ];
    }
}
