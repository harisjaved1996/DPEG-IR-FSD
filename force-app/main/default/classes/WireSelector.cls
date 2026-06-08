/**
 * @description Selector for Wire__c. All SOQL for Wire__c lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class WireSelector {
    /** Row field list for wire displays. */
    private static final String WIRE_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'Sender_Name__c',
            'Amount__c',
            'Memo__c',
            'Received_DateTime__c',
            'Match_Confidence__c',
            'Confidence_Bucket__c',
            'Match_Status__c',
            'Matched_Account__c',
            'Matched_Account__r.Name',
            'Offering__c'
        },
        ', '
    );

    /**
     * @description Selects wires for a single offering (workspace Wire Matching tab).
     * @param offeringId The Offering__c Id to filter by.
     * @return List of Wire__c records; empty when Id is null.
     */
    public static List<Wire__c> selectByOffering(Id offeringId) {
        if (offeringId == null) {
            return new List<Wire__c>();
        }

        return Database.query(
            'SELECT ' +
                WIRE_FIELDS +
                ' FROM Wire__c' +
                ' WHERE Offering__c = :offeringId' +
                ' WITH USER_MODE' +
                ' ORDER BY Received_DateTime__c DESC NULLS LAST'
        );
    }

    /**
     * @description Selects all wires for the Payments screen feed.
     * @return List of Wire__c records ordered by received date/time (newest first).
     */
    public static List<Wire__c> selectAllForFeed() {
        return Database.query(
            'SELECT ' +
                WIRE_FIELDS +
                ' FROM Wire__c' +
                ' WITH USER_MODE' +
                ' ORDER BY Received_DateTime__c DESC NULLS LAST'
        );
    }

    /**
     * @description Counts wires in a given match status (console "Wires in review / unmatched" KPIs).
     * @param status The Match_Status__c value to count.
     * @return Count of matching wires; 0 when status is blank.
     */
    public static Integer countByMatchStatus(String status) {
        if (String.isBlank(status)) {
            return 0;
        }

        return [
            SELECT COUNT()
            FROM Wire__c
            WHERE Match_Status__c = :status
            WITH USER_MODE
        ];
    }
}
