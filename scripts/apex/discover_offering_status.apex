Schema.DescribeFieldResult dfr = Unison__Offering__c.Unison__Status__c.getDescribe();
List<String> active = new List<String>();
for (Schema.PicklistEntry e : dfr.getPicklistValues()) {
    if (e.isActive()) active.add(e.getValue());
}
System.debug('STATUS_COUNT=' + active.size());
System.debug('STATUS_VALUES=' + String.join(active, ' || '));
