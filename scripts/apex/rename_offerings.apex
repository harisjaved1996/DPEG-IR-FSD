List<Unison__Offering__c> ups = new List<Unison__Offering__c>{
    new Unison__Offering__c(Id = 'a0AFW0039enZUFk2AO', Name = 'King of Prussia Offering'),
    new Unison__Offering__c(Id = 'a0AFW0039endgOm2AI', Name = 'Dream Plaza Offering'),
    new Unison__Offering__c(Id = 'a0AFW0039enhsXo2AI', Name = 'Millenia Offering'),
    new Unison__Offering__c(Id = 'a0AFW0039enm4gq2AA', Name = 'Galleria Heights Offering'),
    new Unison__Offering__c(Id = 'a0AFW0039enqGps2AE', Name = 'Riverside Commons Offering'),
    new Unison__Offering__c(Id = 'a0AFW0039enuSyu2AE', Name = 'Beacon Hill Offering'),
    new Unison__Offering__c(Id = 'a0AFW0039enyf7w2AA', Name = 'Summit Pointe Offering'),
    new Unison__Offering__c(Id = 'a0AFW0039eo2rGy2AI', Name = 'Harbor View Offering')
};
update ups;
System.debug('UPDATED_COUNT=' + ups.size());
for (Unison__Offering__c o : ups) { System.debug('UPD id=' + o.Id + ' | Name=' + o.Name); }
