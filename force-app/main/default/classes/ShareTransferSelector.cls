/**
 * @description Selector for Share_Transfer__c. All SOQL for Share_Transfer__c lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class ShareTransferSelector {
    /** Row field list for share-transfer displays. */
    private static final String TRANSFER_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'Transferor_Investment__r.Investing_Entity__r.Name',
            'Transferee_Account__r.Name',
            'Offering_Name__c',
            'Units_Transferred__c',
            'Transfer_Amount__c',
            'Status__c',
            'Approval_Status__c',
            'Transfer_Date__c'
        },
        ', '
    );

    /**
     * @description Selects all share transfers (lifecycle board + table).
     * @return List of Share_Transfer__c records ordered by transfer date (newest first).
     */
    public static List<Share_Transfer__c> selectAll() {
        return Database.query(
            'SELECT ' +
                TRANSFER_FIELDS +
                ' FROM Share_Transfer__c' +
                ' WITH USER_MODE' +
                ' ORDER BY Transfer_Date__c DESC NULLS LAST'
        );
    }

    /**
     * @description Counts share transfers in a given lifecycle status.
     * @param status The Status__c value to count.
     * @return Count of matching transfers; 0 when status is blank.
     */
    public static Integer countByStatus(String status) {
        if (String.isBlank(status)) {
            return 0;
        }

        return [
            SELECT COUNT()
            FROM Share_Transfer__c
            WHERE Status__c = :status
            WITH USER_MODE
        ];
    }

    /**
     * @description Counts share transfers grouped by lifecycle status — one query feeds all
     *              lifecycle-board lane counts.
     * @return List of AggregateResult grouped by Status__c (aliases: status, recordCount).
     */
    public static List<AggregateResult> countGroupedByStatus() {
        return [
            SELECT Status__c status, COUNT(Id) recordCount
            FROM Share_Transfer__c
            WITH USER_MODE
            GROUP BY Status__c
        ];
    }
}
