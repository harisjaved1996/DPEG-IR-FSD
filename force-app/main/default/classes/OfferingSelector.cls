/**
 * @description Selector for Offering__c. All SOQL for Offering__c lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE` to enforce CRUD + FLS
 *              + record-level sharing in the running user's context. No business logic,
 *              DML, or callouts — query construction only.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class OfferingSelector {
    /**
     * Offerings considered "not active" for KPI / progress purposes
     * (Draft has not launched; Closed Funded is fully wound down).
     */
    private static final Set<String> NON_ACTIVE_STATUSES = new Set<String>{ 'Draft', 'Closed Funded' };

    /** Field list shared across record-returning queries (header + Property snapshot). */
    private static final String OFFERING_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'Offering_ID__c',
            'Status__c',
            'Target_Raise__c',
            'Amount_Raised__c',
            'Raised_Pct__c',
            'Total_Committed__c',
            'Committed_Investor_Count__c',
            'Overbook_Cap__c',
            'Closing_Date__c',
            'GP_Entity__c',
            'Property__c',
            'Property__r.Name',
            'Property__r.Property_Type__c',
            'Property__r.Occupancy_Pct__c',
            'Property__r.Cap_Rate__c',
            'Property__r.Cash_on_Cash__c',
            'Property__r.IRR_To_Date__c',
            'Property__r.Target_IRR__c',
            'Property__r.LP_Capital__c'
        },
        ', '
    );

    /**
     * @description Selects offerings that are actively in flight (excludes Draft and Closed Funded).
     * @return List of active Offering__c records, ordered by Name.
     */
    public static List<Offering__c> selectActive() {
        return Database.query(
            'SELECT ' +
                OFFERING_FIELDS +
                ' FROM Offering__c' +
                ' WHERE Status__c NOT IN :NON_ACTIVE_STATUSES' +
                ' WITH USER_MODE' +
                ' ORDER BY Name ASC'
        );
    }

    /**
     * @description Selects active offerings ordered by amount raised (largest first) — feeds the
     *              progress-bar list on the dashboard / console.
     * @return List of active Offering__c records ordered by Amount_Raised__c descending.
     */
    public static List<Offering__c> selectActiveOrderByRaisedDesc() {
        return Database.query(
            'SELECT ' +
                OFFERING_FIELDS +
                ' FROM Offering__c' +
                ' WHERE Status__c NOT IN :NON_ACTIVE_STATUSES' +
                ' WITH USER_MODE' +
                ' ORDER BY Amount_Raised__c DESC NULLS LAST'
        );
    }

    /**
     * @description Selects all offerings with their related Property snapshot fields.
     * @return List of all Offering__c records ordered by Name.
     */
    public static List<Offering__c> selectAllWithProperty() {
        return Database.query(
            'SELECT ' + OFFERING_FIELDS + ' FROM Offering__c' + ' WITH USER_MODE' + ' ORDER BY Name ASC'
        );
    }

    /**
     * @description Selects a single offering (with its Property snapshot) by Id — workspace header.
     * @param offeringId The Offering__c Id to load.
     * @return The matching Offering__c, or null when not found / Id is null.
     */
    public static Offering__c selectByIdWithProperty(Id offeringId) {
        if (offeringId == null) {
            return null;
        }

        List<Offering__c> offerings = Database.query(
            'SELECT ' +
                OFFERING_FIELDS +
                ' FROM Offering__c' +
                ' WHERE Id = :offeringId' +
                ' WITH USER_MODE' +
                ' LIMIT 1'
        );
        return offerings.isEmpty() ? null : offerings[0];
    }

    /**
     * @description Counts offerings that are actively in flight (excludes Draft and Closed Funded).
     * @return Count of active offerings.
     */
    public static Integer countActive() {
        return [
            SELECT COUNT()
            FROM Offering__c
            WHERE Status__c NOT IN :NON_ACTIVE_STATUSES
            WITH USER_MODE
        ];
    }

    /**
     * @description Sums Amount_Raised__c across all offerings (dashboard "Total Raised $").
     * @return Total amount raised; 0 when there are no offerings.
     */
    public static Decimal sumAmountRaised() {
        List<AggregateResult> results = [
            SELECT SUM(Amount_Raised__c) totalRaised
            FROM Offering__c
            WITH USER_MODE
        ];
        Decimal total = results.isEmpty() ? null : (Decimal) results[0].get('totalRaised');
        return total == null ? 0 : total;
    }
}
