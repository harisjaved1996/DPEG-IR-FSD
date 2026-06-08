/**
 * @description Selector for IR_Document__c. All SOQL for IR_Document__c lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class IRDocumentSelector {
    /** Row field list for document displays. */
    private static final String DOCUMENT_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'File_Name__c',
            'Category__c',
            'Offering__r.Name',
            'Investing_Entity__r.Name',
            'Uploaded_Date__c',
            'Portal_Visible__c'
        },
        ', '
    );

    /**
     * @description Selects all IR documents.
     * @return List of IR_Document__c records ordered by uploaded date (newest first).
     */
    public static List<IR_Document__c> selectAll() {
        return Database.query(
            'SELECT ' +
                DOCUMENT_FIELDS +
                ' FROM IR_Document__c' +
                ' WITH USER_MODE' +
                ' ORDER BY Uploaded_Date__c DESC NULLS LAST'
        );
    }

    /**
     * @description Selects IR documents filtered by category. Blank category returns all documents.
     * @param category The Category__c value to filter by, or null/blank for all.
     * @return List of IR_Document__c records.
     */
    public static List<IR_Document__c> selectByCategory(String category) {
        if (String.isBlank(category)) {
            return selectAll();
        }

        return Database.query(
            'SELECT ' +
                DOCUMENT_FIELDS +
                ' FROM IR_Document__c' +
                ' WHERE Category__c = :category' +
                ' WITH USER_MODE' +
                ' ORDER BY Uploaded_Date__c DESC NULLS LAST'
        );
    }

    /**
     * @description Selects IR documents linked to a set of investing-entity Accounts
     *              (investor-detail documents table).
     * @param accountIds Set of Account (investing entity) Ids.
     * @return List of IR_Document__c records; empty when input is empty.
     */
    public static List<IR_Document__c> selectByEntityIds(Set<Id> accountIds) {
        if (accountIds == null || accountIds.isEmpty()) {
            return new List<IR_Document__c>();
        }

        return Database.query(
            'SELECT ' +
                DOCUMENT_FIELDS +
                ' FROM IR_Document__c' +
                ' WHERE Investing_Entity__c IN :accountIds' +
                ' WITH USER_MODE' +
                ' ORDER BY Uploaded_Date__c DESC NULLS LAST'
        );
    }

    /**
     * @description Counts IR documents grouped by category (documents KPI category counts).
     * @return List of AggregateResult grouped by Category__c (aliases: category, recordCount).
     */
    public static List<AggregateResult> countGroupedByCategory() {
        return [
            SELECT Category__c category, COUNT(Id) recordCount
            FROM IR_Document__c
            WITH USER_MODE
            GROUP BY Category__c
        ];
    }

    /**
     * @description Counts portal-visible IR documents.
     * @return Count of IR_Document__c where Portal_Visible__c = true.
     */
    public static Integer countPortalVisible() {
        return [
            SELECT COUNT()
            FROM IR_Document__c
            WHERE Portal_Visible__c = TRUE
            WITH USER_MODE
        ];
    }

    /**
     * @description Counts all IR documents.
     * @return Total IR_Document__c count.
     */
    public static Integer countAll() {
        return [SELECT COUNT() FROM IR_Document__c WITH USER_MODE];
    }
}
