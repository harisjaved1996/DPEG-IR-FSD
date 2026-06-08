/**
 * @description Selector for Investing_Entity_Contact__c (the Account-to-Contact junction).
 *              All SOQL for Investing_Entity_Contact__c lives in this class. `with sharing`;
 *              every query uses `WITH USER_MODE`. No business logic, DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class InvestingEntityContactSelector {
    /**
     * @description Selects junction rows for a contact — used to resolve the set of investing-entity
     *              Account Ids tied to an investor's contact.
     * @param contactId The Contact Id to filter by.
     * @return List of Investing_Entity_Contact__c records; empty when Id is null.
     */
    public static List<Investing_Entity_Contact__c> selectByContactId(Id contactId) {
        if (contactId == null) {
            return new List<Investing_Entity_Contact__c>();
        }

        return [
            SELECT Id, Investing_Entity__c, Contact__c, Signer_Role__c
            FROM Investing_Entity_Contact__c
            WHERE Contact__c = :contactId
            WITH USER_MODE
        ];
    }
}
