// One-off: create 5 Contacts with demo values for the Top 5 Investors dashboard widget.
List<Contact> cons = new List<Contact>{
    new Contact(FirstName='Sarah', LastName='Chen', Investing_Entity__c='Riverstone Holdings LLC', Contribution__c=9000000, Distribution__c=3950000),
    new Contact(FirstName='James', LastName='Okafor', Investing_Entity__c='Summit Peak Partners', Contribution__c=8200000, Distribution__c=3400000),
    new Contact(FirstName='Priya', LastName='Nair', Investing_Entity__c='Blue Harbor Capital', Contribution__c=7400000, Distribution__c=2800000),
    new Contact(FirstName='Daniel', LastName='Vasquez', Investing_Entity__c='Oakline Ventures LLC', Contribution__c=6750000, Distribution__c=2100000),
    new Contact(FirstName='Mei', LastName='Tanaka', Investing_Entity__c='Crestwood Equity Group', Contribution__c=5300000, Distribution__c=1250000)
};
insert cons;
System.debug('Inserted ' + cons.size() + ' contacts for Top 5 Investors widget');
