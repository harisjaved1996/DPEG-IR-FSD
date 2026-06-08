/**
 * @description Selector for Property__c. All SOQL for Property__c lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE`. No business logic,
 *              DML, or callouts.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class PropertySelector {
    /** Full detail / performance / financing field list for the property overview tab. */
    private static final String PROPERTY_FIELDS = String.join(
        new List<String>{
            'Id',
            'Name',
            'Property_Type__c',
            'Address__c',
            'County__c',
            'Submarket__c',
            'Rentable_SqFt__c',
            'Units__c',
            'Year_Built__c',
            'Year_Renovated__c',
            'Occupancy_Pct__c',
            'Annual_NOI__c',
            'Cap_Rate__c',
            'Cash_on_Cash__c',
            'IRR_To_Date__c',
            'Target_IRR__c',
            'Zoning__c',
            'Lender__c',
            'Debt_Structure__c',
            'Last_Appraisal_Date__c',
            'Appraiser__c',
            'Projected_Exit__c',
            'LP_Capital__c',
            'DPEG_Stake__c',
            'Status__c'
        },
        ', '
    );

    /**
     * @description Selects a single property with its full detail/performance/financing fields.
     * @param propertyId The Property__c Id to load.
     * @return The matching Property__c, or null when not found / Id is null.
     */
    public static Property__c selectByIdFull(Id propertyId) {
        if (propertyId == null) {
            return null;
        }

        List<Property__c> properties = Database.query(
            'SELECT ' +
                PROPERTY_FIELDS +
                ' FROM Property__c' +
                ' WHERE Id = :propertyId' +
                ' WITH USER_MODE' +
                ' LIMIT 1'
        );
        return properties.isEmpty() ? null : properties[0];
    }

    /**
     * @description Selects all active properties.
     * @return List of Property__c records where Status__c = 'Active', ordered by Name.
     */
    public static List<Property__c> selectActive() {
        return Database.query(
            'SELECT ' +
                PROPERTY_FIELDS +
                ' FROM Property__c' +
                ' WHERE Status__c = \'Active\'' +
                ' WITH USER_MODE' +
                ' ORDER BY Name ASC'
        );
    }

    /**
     * @description Selects active properties ordered (best-effort) by projected exit text — feeds
     *              the portfolio "Nearest Exit" KPI. Projected_Exit__c is free text ("Q3 2028"),
     *              so the controller refines ordering; the SOQL provides a stable first pass.
     * @return List of active Property__c records ordered by Projected_Exit__c ascending.
     */
    public static List<Property__c> selectActiveOrderByExit() {
        return Database.query(
            'SELECT ' +
                PROPERTY_FIELDS +
                ' FROM Property__c' +
                ' WHERE Status__c = \'Active\'' +
                ' AND Projected_Exit__c != NULL' +
                ' WITH USER_MODE' +
                ' ORDER BY Projected_Exit__c ASC NULLS LAST'
        );
    }

    /**
     * @description Average IRR-to-date across active properties (portfolio "Avg IRR" KPI).
     * @return Average IRR_To_Date__c for active properties; 0 when none.
     */
    public static Decimal avgIrrToDateActive() {
        List<AggregateResult> results = [
            SELECT AVG(IRR_To_Date__c) avgIrr
            FROM Property__c
            WHERE Status__c = 'Active'
            WITH USER_MODE
        ];
        Decimal avgIrr = results.isEmpty() ? null : (Decimal) results[0].get('avgIrr');
        return avgIrr == null ? 0 : avgIrr;
    }
}
