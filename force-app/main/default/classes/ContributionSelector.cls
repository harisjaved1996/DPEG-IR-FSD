/**
 * @description Selector for Contribution__c. All SOQL for Contribution__c lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class ContributionSelector {
    /** Row field list for contribution displays. */
    private static final String CONTRIBUTION_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'Investment__r.Investing_Entity__r.Name',
            'Amount__c',
            'Payment_Method__c',
            'Wire__c',
            'Wire__r.Name',
            'Contribution_Date__c',
            'Match_Status__c'
        },
        ', '
    );

    /**
     * @description Selects contributions for an offering via the Investment__r.Offering__c path.
     * @param offeringId The Offering__c Id to filter by.
     * @return List of Contribution__c records; empty when Id is null.
     */
    public static List<Contribution__c> selectByOffering(Id offeringId) {
        if (offeringId == null) {
            return new List<Contribution__c>();
        }

        return Database.query(
            'SELECT ' +
                CONTRIBUTION_FIELDS +
                ' FROM Contribution__c' +
                ' WHERE Investment__r.Offering__c = :offeringId' +
                ' WITH USER_MODE' +
                ' ORDER BY Contribution_Date__c DESC NULLS LAST'
        );
    }

    /**
     * @description Selects contributions received on or after a date (Payments screen feed).
     * @param sinceDate Inclusive lower bound for Contribution_Date__c.
     * @return List of Contribution__c records; empty when sinceDate is null.
     */
    public static List<Contribution__c> selectRecent(Date sinceDate) {
        if (sinceDate == null) {
            return new List<Contribution__c>();
        }

        return Database.query(
            'SELECT ' +
                CONTRIBUTION_FIELDS +
                ' FROM Contribution__c' +
                ' WHERE Contribution_Date__c >= :sinceDate' +
                ' WITH USER_MODE' +
                ' ORDER BY Contribution_Date__c DESC NULLS LAST'
        );
    }

    /**
     * @description Sums Amount__c for contributions received on or after a date — the console
     *              "Raised this period" and payments "Contributions this period" KPIs. Kept here
     *              (a SOQL SUM aggregate) so controllers never sum record collections in a loop.
     * @param sinceDate Inclusive lower bound for Contribution_Date__c.
     * @return Total contributed amount in the window; 0 when none / sinceDate is null.
     */
    public static Decimal sumAmountSince(Date sinceDate) {
        if (sinceDate == null) {
            return 0;
        }

        List<AggregateResult> results = [
            SELECT SUM(Amount__c) totalRaised
            FROM Contribution__c
            WHERE Contribution_Date__c >= :sinceDate
            WITH USER_MODE
        ];
        Decimal total = results.isEmpty() ? null : (Decimal) results[0].get('totalRaised');
        return total == null ? 0 : total;
    }
}
