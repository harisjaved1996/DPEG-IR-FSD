/**
 * @description Selector for Share_Transfer__c. All SOQL for Share_Transfer__c lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 *              NOTE: The Share Transfer custom fields were removed from the object, so this
 *              selector now exposes only the record identity (Id, Name). Status/amount/date
 *              based queries were retired with those fields.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class ShareTransferSelector {
    /**
     * @description Selects all share transfers (identity only).
     * @return List of Share_Transfer__c records ordered by name.
     */
    public static List<Share_Transfer__c> selectAll() {
        return [
            SELECT Id, Name
            FROM Share_Transfer__c
            WITH USER_MODE
            ORDER BY Name
        ];
    }

    /**
     * @description Counts all share transfers.
     * @return Total count of Share_Transfer__c records.
     */
    public static Integer countAll() {
        return [
            SELECT COUNT()
            FROM Share_Transfer__c
            WITH USER_MODE
        ];
    }
}
