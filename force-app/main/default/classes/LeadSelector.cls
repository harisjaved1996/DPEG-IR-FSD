/**
 * @description Selector for Lead (IR onboarding intake). All SOQL for Lead lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class LeadSelector {
    /** Row field list for the onboarding lead queue. */
    private static final String LEAD_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'Company',
            'Investor_Channel__c',
            'Onboarding_KYC_Status__c',
            'Portal_Invite_Status__c',
            'CreatedDate'
        },
        ', '
    );

    /**
     * @description Selects the open onboarding queue (unconverted leads, newest first).
     * @return List of unconverted Lead records ordered by CreatedDate descending.
     */
    public static List<Lead> selectOnboardingQueue() {
        return Database.query(
            'SELECT ' +
                LEAD_FIELDS +
                ' FROM Lead' +
                ' WHERE IsConverted = false' +
                ' WITH USER_MODE' +
                ' ORDER BY CreatedDate DESC'
        );
    }

    /**
     * @description Counts open onboarding leads grouped by KYC status (onboarding KPI tiles).
     * @return List of AggregateResult grouped by Onboarding_KYC_Status__c
     *         (aliases: kycStatus, recordCount).
     */
    public static List<AggregateResult> countGroupedByKycStatus() {
        return [
            SELECT Onboarding_KYC_Status__c kycStatus, COUNT(Id) recordCount
            FROM Lead
            WHERE IsConverted = FALSE
            WITH USER_MODE
            GROUP BY Onboarding_KYC_Status__c
        ];
    }

    /**
     * @description Counts open leads that have been invited to the portal.
     * @return Count of unconverted Lead records where Portal_Invite_Status__c = 'Invited'.
     */
    public static Integer countInvited() {
        return [
            SELECT COUNT()
            FROM Lead
            WHERE IsConverted = FALSE AND Portal_Invite_Status__c = 'Invited'
            WITH USER_MODE
        ];
    }

    /**
     * @description Counts all open (unconverted) onboarding leads.
     * @return Count of unconverted Lead records.
     */
    public static Integer countOpen() {
        return [
            SELECT COUNT()
            FROM Lead
            WHERE IsConverted = FALSE
            WITH USER_MODE
        ];
    }
}
