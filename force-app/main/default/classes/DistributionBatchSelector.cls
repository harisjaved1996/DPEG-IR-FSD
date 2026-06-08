/**
 * @description Selector for Distribution_Batch__c. All SOQL for Distribution_Batch__c lives in
 *              this class. `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class DistributionBatchSelector {
    /** Row field list for batch displays. */
    private static final String BATCH_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'Offering__c',
            'Offering__r.Name',
            'Batch_Type__c',
            'Total_Amount__c',
            'Investor_Count__c',
            'ACH_Amount__c',
            'Cheque_Amount__c',
            'Status__c',
            'Distribution_Date__c'
        },
        ', '
    );

    /**
     * @description Selects all distribution batches with their related offering name (batch table).
     * @return List of Distribution_Batch__c records ordered by distribution date (newest first).
     */
    public static List<Distribution_Batch__c> selectAllWithOffering() {
        return Database.query(
            'SELECT ' +
                BATCH_FIELDS +
                ' FROM Distribution_Batch__c' +
                ' WITH USER_MODE' +
                ' ORDER BY Distribution_Date__c DESC NULLS LAST'
        );
    }

    /**
     * @description Selects distribution batches for a single offering (workspace Distributions tab).
     * @param offeringId The Offering__c Id to filter by.
     * @return List of Distribution_Batch__c records; empty when Id is null.
     */
    public static List<Distribution_Batch__c> selectByOffering(Id offeringId) {
        if (offeringId == null) {
            return new List<Distribution_Batch__c>();
        }

        return Database.query(
            'SELECT ' +
                BATCH_FIELDS +
                ' FROM Distribution_Batch__c' +
                ' WHERE Offering__c = :offeringId' +
                ' WITH USER_MODE' +
                ' ORDER BY Distribution_Date__c DESC NULLS LAST'
        );
    }

    /**
     * @description Counts batches awaiting approval (distributions "Pending approval" KPI).
     * @return Count of Distribution_Batch__c where Status__c = 'Pending Approval'.
     */
    public static Integer countPendingApproval() {
        return [
            SELECT COUNT()
            FROM Distribution_Batch__c
            WHERE Status__c = 'Pending Approval'
            WITH USER_MODE
        ];
    }

    /**
     * @description Sums ACH / cheque / total amounts across all batches — feeds the
     *              ACH-vs-Cheque distribution split donut.
     * @return Single-row AggregateResult list with aliases achAmount, chequeAmount, totalAmount.
     */
    public static List<AggregateResult> sumSplitAllBatches() {
        return [
            SELECT SUM(ACH_Amount__c) achAmount, SUM(Cheque_Amount__c) chequeAmount, SUM(Total_Amount__c) totalAmount
            FROM Distribution_Batch__c
            WITH USER_MODE
        ];
    }

    /**
     * @description Sums total paid amount and investors paid for completed batches in a window
     *              ("Distributed this period" / "Investors paid").
     * @param sinceDate Inclusive lower bound for Distribution_Date__c.
     * @return Single-row AggregateResult list with aliases totalPaid, investorsPaid; empty when
     *         sinceDate is null.
     */
    public static List<AggregateResult> sumPaidMetricsSince(Date sinceDate) {
        if (sinceDate == null) {
            return new List<AggregateResult>();
        }

        return [
            SELECT SUM(Total_Amount__c) totalPaid, SUM(Investor_Count__c) investorsPaid
            FROM Distribution_Batch__c
            WHERE Status__c = 'Completed' AND Distribution_Date__c >= :sinceDate
            WITH USER_MODE
        ];
    }
}
