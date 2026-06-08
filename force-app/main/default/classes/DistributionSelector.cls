/**
 * @description Selector for Distribution__c. All SOQL for Distribution__c lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class DistributionSelector {
    /** Row field list for distribution displays. */
    private static final String DISTRIBUTION_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'Investment__r.Investing_Entity__r.Name',
            'Equity_Pct__c',
            'Amount__c',
            'Payment_Method__c',
            'ACH_Status__c',
            'Distribution_Date__c'
        },
        ', '
    );

    /**
     * @description Selects distribution rows belonging to a batch (batch-detail table).
     * @param batchId The Distribution_Batch__c Id to filter by.
     * @return List of Distribution__c records; empty when Id is null.
     */
    public static List<Distribution__c> selectByBatch(Id batchId) {
        if (batchId == null) {
            return new List<Distribution__c>();
        }

        return Database.query(
            'SELECT ' +
                DISTRIBUTION_FIELDS +
                ' FROM Distribution__c' +
                ' WHERE Distribution_Batch__c = :batchId' +
                ' WITH USER_MODE' +
                ' ORDER BY Amount__c DESC NULLS LAST'
        );
    }

    /**
     * @description Selects distributions paid to a set of investing-entity Accounts
     *              (investor-detail distributions table) via the Investment__r.Investing_Entity__c path.
     * @param accountIds Set of Account (investing entity) Ids.
     * @return List of Distribution__c records; empty when input is empty.
     */
    public static List<Distribution__c> selectByEntityIds(Set<Id> accountIds) {
        if (accountIds == null || accountIds.isEmpty()) {
            return new List<Distribution__c>();
        }

        return Database.query(
            'SELECT ' +
                DISTRIBUTION_FIELDS +
                ' FROM Distribution__c' +
                ' WHERE Investment__r.Investing_Entity__c IN :accountIds' +
                ' WITH USER_MODE' +
                ' ORDER BY Distribution_Date__c DESC NULLS LAST'
        );
    }

    /**
     * @description Sums Amount__c across all distributions ("Distributed to Date").
     * @return Total distributed amount; 0 when none.
     */
    public static Decimal sumAmount() {
        List<AggregateResult> results = [
            SELECT SUM(Amount__c) totalDistributed
            FROM Distribution__c
            WITH USER_MODE
        ];
        Decimal total = results.isEmpty() ? null : (Decimal) results[0].get('totalDistributed');
        return total == null ? 0 : total;
    }

    /**
     * @description Sums Amount__c for distributions dated on or after a date ("Distributed this period").
     * @param sinceDate Inclusive lower bound for Distribution_Date__c.
     * @return Total distributed amount in the window; 0 when none / sinceDate is null.
     */
    public static Decimal sumAmountSince(Date sinceDate) {
        if (sinceDate == null) {
            return 0;
        }

        List<AggregateResult> results = [
            SELECT SUM(Amount__c) totalDistributed
            FROM Distribution__c
            WHERE Distribution_Date__c >= :sinceDate
            WITH USER_MODE
        ];
        Decimal total = results.isEmpty() ? null : (Decimal) results[0].get('totalDistributed');
        return total == null ? 0 : total;
    }
}
