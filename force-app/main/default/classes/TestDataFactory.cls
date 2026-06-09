/**
 * @description Centralized test data factory for all test classes in the DPEG project.
 *              Provides builder-style factory methods for standard and custom objects.
 *              Never uses @isTest(SeeAllData=true) — all data is created within the test context.
 *
 * USAGE PATTERN:
 *   Account brokerFirm = TestDataFactory.createBrokerFirmAccount('CBRE', true);
 *   Account entity     = TestDataFactory.createInvestingEntityAccount('Ronak LLC', 'LLC', true);
 *   Contact investor   = TestDataFactory.createInvestorContact(entity.Id, 'Bawan', 'Patel', 'Primary', true);
 *   Offering__c off    = TestDataFactory.createOffering('Gallery Up Arts', 1000000, true);
 *
 * BUILDER PATTERN (for custom field overrides before insert):
 *   Account entity = TestDataFactory.buildInvestingEntityAccount('Ronak LLC', 'LLC');
 *   entity.BillingCity = 'Houston';
 *   insert entity;
 *
 * @author      DPEG Project Team
 * @version     2.0
 * @since       API 66.0
 */
@isTest
public class TestDataFactory {
    // ─────────────────────────────────────────────────────────────────────────
    // CONSTANTS
    // ─────────────────────────────────────────────────────────────────────────

    private static final String DEFAULT_USER_PROFILE = 'Standard User';
    private static final String DEFAULT_USER_EMAIL_DOMAIN = '@dpeg.test.invalid';
    private static final String DEFAULT_COUNTRY = 'United States';
    private static final String DEFAULT_STATE = 'TX';
    private static final String DEFAULT_LANGUAGE = 'en_US';
    private static final String DEFAULT_LOCALE = 'en_US';
    private static final String DEFAULT_ENCODING = 'UTF-8';
    private static final String DEFAULT_TIMEZONE = 'America/Chicago';

    // Account_Type__c picklist values
    public static final String ACCOUNT_TYPE_BROKER_FIRM = 'Broker Firm';
    public static final String ACCOUNT_TYPE_INVESTING_ENTITY = 'Investing Entity';

    // Signer role picklist values
    public static final String SIGNER_ROLE_PRIMARY = 'Primary';
    public static final String SIGNER_ROLE_SECONDARY = 'Secondary';

    // ACH status picklist values
    public static final String ACH_STATUS_PENDING = 'Pending';
    public static final String ACH_STATUS_POSTED = 'Posted';
    public static final String ACH_STATUS_FAILED = 'Failed';
    public static final String ACH_STATUS_RETURNED = 'Returned';

    // ─────────────────────────────────────────────────────────────────────────
    // ACCOUNT — BROKER FIRM
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a Broker Firm Account (Account_Type__c = 'Broker Firm').
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Account buildBrokerFirmAccount(String name) {
        return new Account(
            Name = name,
            Account_Type__c = ACCOUNT_TYPE_BROKER_FIRM,
            BillingCity = 'Houston',
            BillingState = DEFAULT_STATE,
            BillingCountry = DEFAULT_COUNTRY
        );
    }

    /**
     * @description Creates and optionally inserts a Broker Firm Account.
     */
    public static Account createBrokerFirmAccount(String name, Boolean doInsert) {
        Account acc = buildBrokerFirmAccount(name);
        if (doInsert) {
            insert acc;
        }
        return acc;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ACCOUNT — INVESTING ENTITY
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds an Investing Entity Account (Account_Type__c = 'Investing Entity').
     *              Does NOT insert — caller is responsible for DML.
     * @param entityType LLC | Trust | Corp | Individual
     */
    public static Account buildInvestingEntityAccount(String name, String entityType) {
        return new Account(
            Name = name,
            Account_Type__c = ACCOUNT_TYPE_INVESTING_ENTITY,
            Entity_Type__c = entityType,
            BillingCity = 'Houston',
            BillingState = DEFAULT_STATE,
            BillingCountry = DEFAULT_COUNTRY
        );
    }

    /**
     * @description Creates and optionally inserts an Investing Entity Account.
     */
    public static Account createInvestingEntityAccount(String name, String entityType, Boolean doInsert) {
        Account acc = buildInvestingEntityAccount(name, entityType);
        if (doInsert) {
            insert acc;
        }
        return acc;
    }

    /**
     * @description Creates a list of Investing Entity Accounts in bulk.
     */
    public static List<Account> createInvestingEntityAccounts(
        String baseName,
        String entityType,
        Integer count,
        Boolean doInsert
    ) {
        List<Account> accounts = new List<Account>();
        for (Integer i = 1; i <= count; i++) {
            accounts.add(buildInvestingEntityAccount(baseName + ' ' + i, entityType));
        }
        if (doInsert) {
            insert accounts;
        }
        return accounts;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CONTACT — BROKER PERSON
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a broker Contact linked to a Broker Firm Account.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Contact buildBrokerContact(Id brokerFirmAccountId, String firstName, String lastName) {
        return new Contact(
            AccountId = brokerFirmAccountId,
            FirstName = firstName,
            LastName = lastName,
            Email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + DEFAULT_USER_EMAIL_DOMAIN
        );
    }

    /**
     * @description Creates and optionally inserts a broker Contact.
     */
    public static Contact createBrokerContact(
        Id brokerFirmAccountId,
        String firstName,
        String lastName,
        Boolean doInsert
    ) {
        Contact con = buildBrokerContact(brokerFirmAccountId, firstName, lastName);
        if (doInsert) {
            insert con;
        }
        return con;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CONTACT — INVESTOR PERSON
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds an investor Contact linked to an Investing Entity Account.
     *              Does NOT insert — caller is responsible for DML.
     * @param role Primary | Secondary
     */
    public static Contact buildInvestorContact(Id investingEntityId, String firstName, String lastName, String role) {
        return new Contact(
            AccountId = investingEntityId,
            FirstName = firstName,
            LastName = lastName,
            Email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + DEFAULT_USER_EMAIL_DOMAIN,
            Role__c = role,
            KYC_Complete__c = false,
            Accreditation_Status__c = 'Pending'
        );
    }

    /**
     * @description Creates and optionally inserts an investor Contact.
     */
    public static Contact createInvestorContact(
        Id investingEntityId,
        String firstName,
        String lastName,
        String role,
        Boolean doInsert
    ) {
        Contact con = buildInvestorContact(investingEntityId, firstName, lastName, role);
        if (doInsert) {
            insert con;
        }
        return con;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INVESTOR__C
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds an Investor__c profile record linked to a Contact.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Investor__c buildInvestor(Id contactId) {
        return new Investor__c(Contact__c = contactId, Active_Investor__c = false, Onboarding_Date__c = Date.today());
    }

    /**
     * @description Creates and optionally inserts an Investor__c record.
     */
    public static Investor__c createInvestor(Id contactId, Boolean doInsert) {
        Investor__c inv = buildInvestor(contactId);
        if (doInsert) {
            insert inv;
        }
        return inv;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INVESTING_ENTITY_CONTACT__C (JUNCTION)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds an Investing_Entity_Contact__c junction linking a Contact to an Account.
     *              Does NOT insert — caller is responsible for DML.
     * @param signerRole Primary | Secondary
     */
    public static Investing_Entity_Contact__c buildInvestingEntityContact(
        Id investingEntityId,
        Id contactId,
        String signerRole
    ) {
        return new Investing_Entity_Contact__c(
            Investing_Entity__c = investingEntityId,
            Contact__c = contactId,
            Signer_Role__c = signerRole,
            Signature_Required__c = true
        );
    }

    /**
     * @description Creates and optionally inserts an Investing_Entity_Contact__c record.
     */
    public static Investing_Entity_Contact__c createInvestingEntityContact(
        Id investingEntityId,
        Id contactId,
        String signerRole,
        Boolean doInsert
    ) {
        Investing_Entity_Contact__c iec = buildInvestingEntityContact(investingEntityId, contactId, signerRole);
        if (doInsert) {
            insert iec;
        }
        return iec;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OFFERING__C
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds an Offering__c record in Draft status.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Offering__c buildOffering(String name, Decimal targetRaise) {
        return new Offering__c(
            Name = name,
            Target_Raise__c = targetRaise,
            Status__c = 'Draft',
            Transfers_Permitted__c = false,
            Launch_Date__c = Date.today().addDays(30)
        );
    }

    /**
     * @description Creates and optionally inserts an Offering__c record.
     */
    public static Offering__c createOffering(String name, Decimal targetRaise, Boolean doInsert) {
        Offering__c off = buildOffering(name, targetRaise);
        if (doInsert) {
            insert off;
        }
        return off;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COMMITMENT__C
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a Commitment__c record in Committed status.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Commitment__c buildCommitment(Id investingEntityId, Id offeringId, Decimal amount) {
        return new Commitment__c(
            // Investing_Entity__c = investingEntityId,
            Offering__c = offeringId,
            Committed_Amount__c = amount,
            Status__c = 'Committed'
        );
    }

    /**
     * @description Creates and optionally inserts a Commitment__c record.
     */
    public static Commitment__c createCommitment(
        Id investingEntityId,
        Id offeringId,
        Decimal amount,
        Boolean doInsert
    ) {
        Commitment__c c = buildCommitment(investingEntityId, offeringId, amount);
        if (doInsert) {
            insert c;
        }
        return c;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INVESTMENT__C
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds an Investment__c record (confirmed funded position).
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Investment__c buildInvestment(Id investingEntityId, Id offeringId, Decimal amountFunded) {
        return new Investment__c(
            Investing_Entity__c = investingEntityId,
            Offering__c = offeringId,
            Amount_Funded__c = amountFunded,
            Status__c = 'Active'
        );
    }

    /**
     * @description Creates and optionally inserts an Investment__c record.
     */
    public static Investment__c createInvestment(
        Id investingEntityId,
        Id offeringId,
        Decimal amountFunded,
        Boolean doInsert
    ) {
        Investment__c inv = buildInvestment(investingEntityId, offeringId, amountFunded);
        if (doInsert) {
            insert inv;
        }
        return inv;
    }

    /**
     * @description Creates a list of Investment__c records in bulk.
     */
    public static List<Investment__c> createInvestments(
        List<Id> entityIds,
        Id offeringId,
        Decimal amountEach,
        Boolean doInsert
    ) {
        List<Investment__c> investments = new List<Investment__c>();
        for (Id entityId : entityIds) {
            investments.add(buildInvestment(entityId, offeringId, amountEach));
        }
        if (doInsert) {
            insert investments;
        }
        return investments;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DISTRIBUTION__C
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a Distribution__c record in Pending status.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Distribution__c buildDistribution(Id investmentId, Decimal amount) {
        return new Distribution__c(
            Investment__c = investmentId,
            Amount__c = amount,
            ACH_Status__c = ACH_STATUS_PENDING,
            Distribution_Date__c = Date.today()
        );
    }

    /**
     * @description Creates and optionally inserts a Distribution__c record.
     */
    public static Distribution__c createDistribution(Id investmentId, Decimal amount, Boolean doInsert) {
        Distribution__c d = buildDistribution(investmentId, amount);
        if (doInsert) {
            insert d;
        }
        return d;
    }

    /**
     * @description Creates a list of Distribution__c records in bulk (one per investment).
     */
    public static List<Distribution__c> createDistributions(
        List<Id> investmentIds,
        Decimal amountEach,
        Boolean doInsert
    ) {
        List<Distribution__c> distributions = new List<Distribution__c>();
        for (Id invId : investmentIds) {
            distributions.add(buildDistribution(invId, amountEach));
        }
        if (doInsert) {
            insert distributions;
        }
        return distributions;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CONTRIBUTION__C
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a Contribution__c record (incoming wire — Plaid matched).
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Contribution__c buildContribution(Id investmentId, Decimal amount) {
        return new Contribution__c(
            Investment__c = investmentId,
            Amount__c = amount,
            Match_Status__c = 'Pending',
            Entity_Name_Verified__c = false
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSACTION__C
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a Transaction__c record at a given stage.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Transaction__c buildTransaction(Id opportunityId, String stage) {
        return new Transaction__c(Opportunity__c = opportunityId, Stage__c = stage, Contract_Signed__c = false);
    }

    /**
     * @description Creates and optionally inserts a Transaction__c record.
     */
    public static Transaction__c createTransaction(Id opportunityId, String stage, Boolean doInsert) {
        Transaction__c t = buildTransaction(opportunityId, stage);
        if (doInsert) {
            insert t;
        }
        return t;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CRITICAL_DATE__C
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a Critical_Date__c record for a Transaction.
     *              Does NOT insert — caller is responsible for DML.
     * @param dateType Contract Date | Feasibility End | Hard Money | Closing Date | Loan Application
     */
    public static Critical_Date__c buildCriticalDate(Id transactionId, String dateType, Date dateValue) {
        return new Critical_Date__c(Transaction__c = transactionId, Date_Type__c = dateType, Date__c = dateValue);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PROPERTY_ASSET__C
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a Property_Asset__c AUM record.
     *              Does NOT insert — caller is responsible for DML.
     * @param status Active | Disposed
     */
    public static Property_Asset__c buildPropertyAsset(String name, String status) {
        return new Property_Asset__c(Name = name, Status__c = status);
    }

    /**
     * @description Creates and optionally inserts a Property_Asset__c record.
     */
    public static Property_Asset__c createPropertyAsset(String name, String status, Boolean doInsert) {
        Property_Asset__c pa = buildPropertyAsset(name, status);
        if (doInsert) {
            insert pa;
        }
        return pa;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DISPOSITION__C
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a Disposition__c record.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Disposition__c buildDisposition(Id propertyAssetId, Decimal targetSalePrice) {
        return new Disposition__c(
            Property_Asset__c = propertyAssetId,
            Target_Sale_Price__c = targetSalePrice,
            Stage__c = 'Disposition Readiness'
        );
    }

    /**
     * @description Creates and optionally inserts a Disposition__c record.
     */
    public static Disposition__c createDisposition(Id propertyAssetId, Decimal targetSalePrice, Boolean doInsert) {
        Disposition__c d = buildDisposition(propertyAssetId, targetSalePrice);
        if (doInsert) {
            insert d;
        }
        return d;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SHARE_TRANSFER__C
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a Share_Transfer__c record (Partial transfer, Pending status).
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Share_Transfer__c buildShareTransfer(
        Id transferorInvestmentId,
        Id transfereeAccountId,
        Decimal units,
        Decimal amount
    ) {
        return new Share_Transfer__c(
            Transferor_Investment__c = transferorInvestmentId,
            Transferee_Account__c = transfereeAccountId,
            Units_Transferred__c = units,
            Transfer_Amount__c = amount,
            Transfer_Date__c = Date.today(),
            Status__c = 'Pending',
            Approval_Status__c = 'Pending Review',
            Transfer_Type__c = 'Partial'
        );
    }

    /**
     * @description Creates and optionally inserts a Share_Transfer__c record.
     */
    public static Share_Transfer__c createShareTransfer(
        Id transferorInvestmentId,
        Id transfereeAccountId,
        Decimal units,
        Decimal amount,
        Boolean doInsert
    ) {
        Share_Transfer__c st = buildShareTransfer(transferorInvestmentId, transfereeAccountId, units, amount);
        if (doInsert) {
            insert st;
        }
        return st;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OPPORTUNITY (DEAL)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a deal Opportunity with required fields.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Opportunity buildOpportunity(Id brokerFirmAccountId, String name, String stageName, Date closeDate) {
        return new Opportunity(
            AccountId = brokerFirmAccountId,
            Name = name,
            StageName = stageName,
            CloseDate = closeDate,
            Amount = 1000000
        );
    }

    /**
     * @description Creates and optionally inserts a deal Opportunity.
     */
    public static Opportunity createOpportunity(
        Id brokerFirmAccountId,
        String name,
        String stageName,
        Date closeDate,
        Boolean doInsert
    ) {
        Opportunity opp = buildOpportunity(brokerFirmAccountId, name, stageName, closeDate);
        if (doInsert) {
            insert opp;
        }
        return opp;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER FACTORY
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a User with Standard User profile.
     *              Username is globally unique via timestamp suffix.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static User buildStandardUser(String alias, String firstName, String lastName) {
        Profile p = [SELECT Id FROM Profile WHERE Name = :DEFAULT_USER_PROFILE LIMIT 1];
        String uniqueSuffix = String.valueOf(System.currentTimeMillis());
        return new User(
            ProfileId = p.Id,
            FirstName = firstName,
            LastName = lastName,
            Alias = alias.left(8),
            Username = alias + uniqueSuffix + DEFAULT_USER_EMAIL_DOMAIN,
            Email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + DEFAULT_USER_EMAIL_DOMAIN,
            EmailEncodingKey = DEFAULT_ENCODING,
            LanguageLocaleKey = DEFAULT_LANGUAGE,
            LocaleSidKey = DEFAULT_LOCALE,
            TimeZoneSidKey = DEFAULT_TIMEZONE
        );
    }

    /**
     * @description Creates and optionally inserts a Standard User.
     */
    public static User createStandardUser(String alias, String firstName, String lastName, Boolean doInsert) {
        User usr = buildStandardUser(alias, firstName, lastName);
        if (doInsert) {
            insert usr;
        }
        return usr;
    }

    /**
     * @description Creates and optionally inserts a User with a specific named Profile.
     *              Use DPEG profile names from ARCHITECTURE.md §1.4:
     *              'IR Manager', 'IR Associate', 'Acquisitions Rep', 'Transactions Lead',
     *              'Finance / CFO', 'Principal', 'Investor (Portal)'
     */
    public static User createUserWithProfile(
        String profileName,
        String alias,
        String firstName,
        String lastName,
        Boolean doInsert
    ) {
        Profile p = [SELECT Id FROM Profile WHERE Name = :profileName LIMIT 1];
        String uniqueSuffix = String.valueOf(System.currentTimeMillis());
        User usr = new User(
            ProfileId = p.Id,
            FirstName = firstName,
            LastName = lastName,
            Alias = alias.left(8),
            Username = alias + uniqueSuffix + DEFAULT_USER_EMAIL_DOMAIN,
            Email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + DEFAULT_USER_EMAIL_DOMAIN,
            EmailEncodingKey = DEFAULT_ENCODING,
            LanguageLocaleKey = DEFAULT_LANGUAGE,
            LocaleSidKey = DEFAULT_LOCALE,
            TimeZoneSidKey = DEFAULT_TIMEZONE
        );
        if (doInsert) {
            insert usr;
        }
        return usr;
    }
}
