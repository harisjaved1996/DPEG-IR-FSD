/**
 * @description Selector for Investor__c. All SOQL for Investor__c lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class InvestorSelector {
    /** Row field list for investor list / detail summary displays. */
    private static final String INVESTOR_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'Contact__c',
            'Contact__r.Name',
            'Contact__r.Accreditation_Status__c',
            'Investor_Tier__c',
            'KYC_Status__c',
            'Lifetime_Invested__c',
            'Total_Commitments__c',
            'Active_Positions__c',
            'Investing_Entities_Count__c',
            'Last_Activity_Date__c',
            'IR_Rep__c',
            'IR_Rep__r.Name'
        },
        ', '
    );

    /**
     * @description Selects all investors (list screen).
     * @return List of Investor__c records ordered by lifetime invested (largest first).
     */
    public static List<Investor__c> selectAll() {
        return Database.query(
            'SELECT ' +
                INVESTOR_FIELDS +
                ' FROM Investor__c' +
                ' WITH USER_MODE' +
                ' ORDER BY Lifetime_Invested__c DESC NULLS LAST'
        );
    }

    /**
     * @description Selects investors filtered by tier. Blank tier returns all investors.
     * @param tier The Investor_Tier__c value to filter by, or null/blank for all.
     * @return List of Investor__c records.
     */
    public static List<Investor__c> selectByTier(String tier) {
        if (String.isBlank(tier)) {
            return selectAll();
        }

        return Database.query(
            'SELECT ' +
                INVESTOR_FIELDS +
                ' FROM Investor__c' +
                ' WHERE Investor_Tier__c = :tier' +
                ' WITH USER_MODE' +
                ' ORDER BY Lifetime_Invested__c DESC NULLS LAST'
        );
    }

    /**
     * @description Selects a single investor with its related contact fields (detail summary cards).
     * @param investorId The Investor__c Id to load.
     * @return The matching Investor__c, or null when not found / Id is null.
     */
    public static Investor__c selectByIdWithContact(Id investorId) {
        if (investorId == null) {
            return null;
        }

        List<Investor__c> investors = Database.query(
            'SELECT ' +
                INVESTOR_FIELDS +
                ' FROM Investor__c' +
                ' WHERE Id = :investorId' +
                ' WITH USER_MODE' +
                ' LIMIT 1'
        );
        return investors.isEmpty() ? null : investors[0];
    }

    /**
     * @description Counts all investors (console "Investor count" KPI — total, not just active).
     * @return Total Investor__c count.
     */
    public static Integer countAll() {
        return [SELECT COUNT() FROM Investor__c WITH USER_MODE];
    }

    /**
     * @description Counts active investors (dashboard "Active Investors" KPI).
     * @return Count of Investor__c where Active_Investor__c = true.
     */
    public static Integer countActive() {
        return [
            SELECT COUNT()
            FROM Investor__c
            WHERE Active_Investor__c = TRUE
            WITH USER_MODE
        ];
    }

    /**
     * @description Sums Lifetime_Invested__c across all investors.
     * @return Total lifetime invested; 0 when none.
     */
    public static Decimal sumLifetimeInvested() {
        List<AggregateResult> results = [
            SELECT SUM(Lifetime_Invested__c) totalInvested
            FROM Investor__c
            WITH USER_MODE
        ];
        Decimal total = results.isEmpty() ? null : (Decimal) results[0].get('totalInvested');
        return total == null ? 0 : total;
    }

    /**
     * @description Counts investors whose related contact has Accreditation_Status__c = 'Pending'
     *              (dashboard "Pending Accreditation" KPI).
     * @return Count of investors awaiting accreditation.
     */
    public static Integer countPendingAccreditation() {
        return [
            SELECT COUNT()
            FROM Investor__c
            WHERE Contact__r.Accreditation_Status__c = 'Pending'
            WITH USER_MODE
        ];
    }
}
