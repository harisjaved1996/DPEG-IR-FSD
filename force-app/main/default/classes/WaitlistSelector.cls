/**
 * @description Selector for Waitlist__c. All SOQL for Waitlist__c lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class WaitlistSelector {
    /** Row field list for waitlist displays. */
    private static final String WAITLIST_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'Position__c',
            'Investing_Entity__r.Name',
            'Amount__c',
            'Added_Date__c',
            'Auto_Promote__c',
            'Status__c'
        },
        ', '
    );

    /**
     * @description Selects waitlist entries for a single offering ordered by position
     *              (workspace Waitlist tab).
     * @param offeringId The Offering__c Id to filter by.
     * @return List of Waitlist__c records ordered by Position__c; empty when Id is null.
     */
    public static List<Waitlist__c> selectByOffering(Id offeringId) {
        if (offeringId == null) {
            return new List<Waitlist__c>();
        }

        return Database.query(
            'SELECT ' +
                WAITLIST_FIELDS +
                ' FROM Waitlist__c' +
                ' WHERE Offering__c = :offeringId' +
                ' WITH USER_MODE' +
                ' ORDER BY Position__c ASC NULLS LAST'
        );
    }

    /**
     * @description Selects active waitlist entries (action queue).
     * @return List of Waitlist__c records where Status__c = 'Waitlisted', ordered by position.
     */
    public static List<Waitlist__c> selectActive() {
        return Database.query(
            'SELECT ' +
                WAITLIST_FIELDS +
                ' FROM Waitlist__c' +
                ' WHERE Status__c = \'Waitlisted\'' +
                ' WITH USER_MODE' +
                ' ORDER BY Position__c ASC NULLS LAST'
        );
    }
}
