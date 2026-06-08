// Anonymous Apex — delete test data created by TestDataFactory (scratch/sandbox only).
// The TestDataFactory email domain suffix is '@dpeg.test.invalid' — we use that as a safe marker.
// Run with: sf apex run --file scripts/apex/cleanup-test-data.apex

if (!UserInfo.getUserName().containsIgnoreCase('scratch')
        && !UserInfo.getUserName().containsIgnoreCase('sandbox')
        && !UserInfo.getOrganizationId().startsWith('00D')) {
    throw new IllegalArgumentException('Refusing to run: this does not look like a scratch/sandbox org.');
}

List<Contact> testContacts = [SELECT Id FROM Contact WHERE Email LIKE '%@dpeg.test.invalid' LIMIT 10000];
System.debug('Deleting ' + testContacts.size() + ' test Contacts…');
delete testContacts;

List<Account> testAccounts = [SELECT Id FROM Account WHERE Name LIKE 'Test Corp%' OR Name LIKE 'Corp %' LIMIT 10000];
System.debug('Deleting ' + testAccounts.size() + ' test Accounts…');
delete testAccounts;

System.debug('Cleanup complete.');
