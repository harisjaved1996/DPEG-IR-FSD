/**
 * @description Selector for Subscription_Doc__c. All SOQL for Subscription_Doc__c lives in this
 *              class. `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class SubscriptionDocSelector {
    /** Row field list for signature displays. */
    private static final String SUB_DOC_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'Investing_Entity__r.Name',
            'Primary_Signature_Status__c',
            'Secondary_Signature_Status__c',
            'Finalized__c',
            'Funding_Instructions_Status__c',
            'Single_Signer__c'
        },
        ', '
    );

    /**
     * @description Selects subscription documents for a single offering (workspace Signatures tab).
     * @param offeringId The Offering__c Id to filter by.
     * @return List of Subscription_Doc__c records; empty when Id is null.
     */
    public static List<Subscription_Doc__c> selectByOffering(Id offeringId) {
        if (offeringId == null) {
            return new List<Subscription_Doc__c>();
        }

        return Database.query(
            'SELECT ' +
                SUB_DOC_FIELDS +
                ' FROM Subscription_Doc__c' +
                ' WHERE Offering__c = :offeringId' +
                ' WITH USER_MODE' +
                ' ORDER BY Name ASC'
        );
    }

    /**
     * @description Selects subscription documents that are not yet finalized (action queue).
     * @return List of Subscription_Doc__c records where Finalized__c = false.
     */
    public static List<Subscription_Doc__c> selectUnsigned() {
        return Database.query(
            'SELECT ' +
                SUB_DOC_FIELDS +
                ' FROM Subscription_Doc__c' +
                ' WHERE Finalized__c = false' +
                ' WITH USER_MODE' +
                ' ORDER BY Name ASC'
        );
    }

    /**
     * @description Counts subscription documents that are not yet finalized.
     * @return Count of Subscription_Doc__c where Finalized__c = false.
     */
    public static Integer countUnsigned() {
        return [
            SELECT COUNT()
            FROM Subscription_Doc__c
            WHERE Finalized__c = FALSE
            WITH USER_MODE
        ];
    }
}
