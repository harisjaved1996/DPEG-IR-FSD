// Standardize Property Types: use 'Multi-Family' (not the duplicate 'Multifamily') and
// ensure every real asset class is represented across the 14 Property records.
List<Unison__Property__c> toUpdate = new List<Unison__Property__c>{
    new Unison__Property__c(Id = 'a0CFW00C6qTWzrQ2ET', Unison__Property_Type__c = 'Multi-Family'),  // Lakeside Residences (was Multifamily)
    new Unison__Property__c(Id = 'a0CFW00CMwNsMRI2M3', Unison__Property_Type__c = 'Multi-Family'),  // Lakeview Apartments (was Multifamily)
    new Unison__Property__c(Id = 'a0CFW00C6qTSniO2ET', Unison__Property_Type__c = 'Multi-Family'),  // Parkview Apartments (was Multifamily)
    new Unison__Property__c(Id = 'a0CFW00C6qTbC0S2EV', Unison__Property_Type__c = 'Single-Family'), // Maple Court Apartments (was Multifamily)
    new Unison__Property__c(Id = 'a0CFW00BsmHTPZk2EP', Unison__Property_Type__c = 'Other')          // Magnolia Crossing - DPEG Fund LP (was Retail)
};
update toUpdate;
System.debug('Updated ' + toUpdate.size() + ' Property records.');
