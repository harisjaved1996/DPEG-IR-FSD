/**
 * @description Centralized test data factory for all test classes in the DPEG project.
 *              Provides builder-style factory methods for standard and custom objects.
 *              Never uses @isTest(SeeAllData=true) — all data is created within the test context.
 *
 * USAGE PATTERN:
 *   Account acc = TestDataFactory.createAccount('Test Corp', true);
 *   Contact con = TestDataFactory.createContact(acc.Id, 'Jane', 'Doe', true);
 *   User usr    = TestDataFactory.createStandardUser('jdoe', 'Jane', 'Doe', true);
 *
 * BUILDER PATTERN (for custom field overrides before insert):
 *   Account acc = TestDataFactory.buildAccount('Test Corp');
 *   acc.Phone   = '555-1234';
 *   insert acc;
 *
 * @author      DPEG Project Team
 * @version     1.0
 * @since       API 63.0
 */
@isTest
public class TestDataFactory {

    // ─────────────────────────────────────────────────────────────────────────
    // CONSTANTS
    // ─────────────────────────────────────────────────────────────────────────

    private static final String DEFAULT_ACCOUNT_TYPE      = 'Customer - Direct';
    private static final String DEFAULT_USER_PROFILE      = 'Standard User';
    private static final String DEFAULT_USER_EMAIL_DOMAIN = '@dpeg.test.invalid';
    private static final String DEFAULT_COUNTRY           = 'United States';
    private static final String DEFAULT_STATE             = 'CA';
    private static final String DEFAULT_LANGUAGE          = 'en_US';
    private static final String DEFAULT_LOCALE            = 'en_US';
    private static final String DEFAULT_ENCODING          = 'UTF-8';
    private static final String DEFAULT_TIMEZONE          = 'America/Los_Angeles';

    // ─────────────────────────────────────────────────────────────────────────
    // ACCOUNT FACTORY
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds an Account SObject with required fields populated.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Account buildAccount(String name) {
        return new Account(
            Name           = name,
            Type           = DEFAULT_ACCOUNT_TYPE,
            BillingCity    = 'San Francisco',
            BillingState   = DEFAULT_STATE,
            BillingCountry = DEFAULT_COUNTRY
        );
    }

    /**
     * @description Creates and optionally inserts an Account.
     */
    public static Account createAccount(String name, Boolean doInsert) {
        Account acc = buildAccount(name);
        if (doInsert) {
            insert acc;
        }
        return acc;
    }

    /**
     * @description Creates a list of Accounts in bulk. Names are auto-suffixed: 'name 1', 'name 2', etc.
     */
    public static List<Account> createAccounts(String baseName, Integer count, Boolean doInsert) {
        List<Account> accounts = new List<Account>();
        for (Integer i = 1; i <= count; i++) {
            accounts.add(buildAccount(baseName + ' ' + i));
        }
        if (doInsert) {
            insert accounts;
        }
        return accounts;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CONTACT FACTORY
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a Contact SObject with required fields populated.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Contact buildContact(Id accountId, String firstName, String lastName) {
        return new Contact(
            AccountId = accountId,
            FirstName = firstName,
            LastName  = lastName,
            Email     = firstName.toLowerCase() + '.' + lastName.toLowerCase() + DEFAULT_USER_EMAIL_DOMAIN
        );
    }

    /**
     * @description Creates and optionally inserts a Contact.
     */
    public static Contact createContact(Id accountId, String firstName, String lastName, Boolean doInsert) {
        Contact con = buildContact(accountId, firstName, lastName);
        if (doInsert) {
            insert con;
        }
        return con;
    }

    /**
     * @description Creates a list of Contacts in bulk for a given Account.
     */
    public static List<Contact> createContacts(Id accountId, String firstName, String lastName, Integer count, Boolean doInsert) {
        List<Contact> contacts = new List<Contact>();
        for (Integer i = 1; i <= count; i++) {
            contacts.add(buildContact(accountId, firstName, lastName + ' ' + i));
        }
        if (doInsert) {
            insert contacts;
        }
        return contacts;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER FACTORY
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a User SObject with Standard User profile.
     *              Username is globally unique via timestamp suffix.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static User buildStandardUser(String alias, String firstName, String lastName) {
        Profile p = [SELECT Id FROM Profile WHERE Name = :DEFAULT_USER_PROFILE LIMIT 1];
        String uniqueSuffix = String.valueOf(System.currentTimeMillis());
        return new User(
            ProfileId         = p.Id,
            FirstName         = firstName,
            LastName          = lastName,
            Alias             = alias.left(8),
            Username          = alias + uniqueSuffix + DEFAULT_USER_EMAIL_DOMAIN,
            Email             = firstName.toLowerCase() + '.' + lastName.toLowerCase() + DEFAULT_USER_EMAIL_DOMAIN,
            EmailEncodingKey  = DEFAULT_ENCODING,
            LanguageLocaleKey = DEFAULT_LANGUAGE,
            LocaleSidKey      = DEFAULT_LOCALE,
            TimeZoneSidKey    = DEFAULT_TIMEZONE
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
     */
    public static User createUserWithProfile(String profileName, String alias, String firstName, String lastName, Boolean doInsert) {
        Profile p = [SELECT Id FROM Profile WHERE Name = :profileName LIMIT 1];
        String uniqueSuffix = String.valueOf(System.currentTimeMillis());
        User usr = new User(
            ProfileId         = p.Id,
            FirstName         = firstName,
            LastName          = lastName,
            Alias             = alias.left(8),
            Username          = alias + uniqueSuffix + DEFAULT_USER_EMAIL_DOMAIN,
            Email             = firstName.toLowerCase() + '.' + lastName.toLowerCase() + DEFAULT_USER_EMAIL_DOMAIN,
            EmailEncodingKey  = DEFAULT_ENCODING,
            LanguageLocaleKey = DEFAULT_LANGUAGE,
            LocaleSidKey      = DEFAULT_LOCALE,
            TimeZoneSidKey    = DEFAULT_TIMEZONE
        );
        if (doInsert) {
            insert usr;
        }
        return usr;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OPPORTUNITY FACTORY
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds an Opportunity SObject with required fields.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Opportunity buildOpportunity(Id accountId, String name, String stageName, Date closeDate) {
        return new Opportunity(
            AccountId = accountId,
            Name      = name,
            StageName = stageName,
            CloseDate = closeDate,
            Amount    = 10000
        );
    }

    /**
     * @description Creates and optionally inserts an Opportunity.
     */
    public static Opportunity createOpportunity(Id accountId, String name, String stageName, Date closeDate, Boolean doInsert) {
        Opportunity opp = buildOpportunity(accountId, name, stageName, closeDate);
        if (doInsert) {
            insert opp;
        }
        return opp;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CASE FACTORY
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @description Builds a Case SObject with required fields.
     *              Does NOT insert — caller is responsible for DML.
     */
    public static Case buildCase(Id accountId, Id contactId, String subject, String status, String origin) {
        return new Case(
            AccountId = accountId,
            ContactId = contactId,
            Subject   = subject,
            Status    = status,
            Origin    = origin
        );
    }

    /**
     * @description Creates and optionally inserts a Case.
     */
    public static Case createCase(Id accountId, Id contactId, String subject, String status, String origin, Boolean doInsert) {
        Case c = buildCase(accountId, contactId, subject, status, origin);
        if (doInsert) {
            insert c;
        }
        return c;
    }

}
