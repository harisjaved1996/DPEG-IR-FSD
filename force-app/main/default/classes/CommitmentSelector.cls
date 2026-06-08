/**
 * @description Selector for Commitment__c. All SOQL for Commitment__c lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class CommitmentSelector {
    /** Row field list for commitment displays. */
    private static final String COMMITMENT_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'Investing_Entity__c',
            'Investing_Entity__r.Name',
            'Offering__c',
            'Committed_Amount__c',
            'Status__c',
            'Commitment_Date__c',
            'Funded__c'
        },
        ', '
    );

    /**
     * @description Selects commitment rows for a single offering (workspace Commitments tab).
     * @param offeringId The Offering__c Id to filter by.
     * @return List of Commitment__c records; empty when Id is null.
     */
    public static List<Commitment__c> selectByOffering(Id offeringId) {
        if (offeringId == null) {
            return new List<Commitment__c>();
        }

        return Database.query(
            'SELECT ' +
                COMMITMENT_FIELDS +
                ' FROM Commitment__c' +
                ' WHERE Offering__c = :offeringId' +
                ' WITH USER_MODE' +
                ' ORDER BY Committed_Amount__c DESC NULLS LAST'
        );
    }

    /**
     * @description Selects commitments made by a set of investing-entity Accounts
     *              (investor-detail commitments table).
     * @param accountIds Set of Account (investing entity) Ids.
     * @return List of Commitment__c records; empty when input is empty.
     */
    public static List<Commitment__c> selectByEntityIds(Set<Id> accountIds) {
        if (accountIds == null || accountIds.isEmpty()) {
            return new List<Commitment__c>();
        }

        return Database.query(
            'SELECT ' +
                COMMITMENT_FIELDS +
                ' FROM Commitment__c' +
                ' WHERE Investing_Entity__c IN :accountIds' +
                ' WITH USER_MODE' +
                ' ORDER BY Commitment_Date__c DESC NULLS LAST'
        );
    }

    /**
     * @description Counts all commitments (funnel "Commitments" stage).
     * @return Total commitment count.
     */
    public static Integer countAll() {
        return [SELECT COUNT() FROM Commitment__c WITH USER_MODE];
    }

    /**
     * @description Sums Committed_Amount__c across all commitments (dashboard "Total Committed $").
     * @return Total committed amount; 0 when none.
     */
    public static Decimal sumCommittedAmount() {
        List<AggregateResult> results = [
            SELECT SUM(Committed_Amount__c) totalCommitted
            FROM Commitment__c
            WITH USER_MODE
        ];
        Decimal total = results.isEmpty() ? null : (Decimal) results[0].get('totalCommitted');
        return total == null ? 0 : total;
    }
}
