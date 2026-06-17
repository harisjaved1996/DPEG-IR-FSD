Map<String, Schema.SObjectField> m = Unison__Contribution__c.SObjectType.getDescribe().fields.getMap();
System.debug('HAS_FIELD=' + m.containsKey('unison__offering__c'));
if (m.containsKey('unison__offering__c')) {
    Schema.DescribeFieldResult d = m.get('unison__offering__c').getDescribe();
    System.debug('ACCESSIBLE=' + d.isAccessible() + ' CREATEABLE=' + d.isCreateable());
}
