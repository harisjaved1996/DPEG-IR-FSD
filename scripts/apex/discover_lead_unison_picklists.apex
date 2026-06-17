List<String> fs = new List<String>{'Unison__Investor_Channel__c','Unison__Onboarding_KYC_Status__c','Unison__Portal_Invite_Status__c'};
Map<String, Schema.SObjectField> m = Lead.SObjectType.getDescribe().fields.getMap();
for (String f : fs) {
    List<String> vals = new List<String>();
    for (Schema.PicklistEntry e : m.get(f).getDescribe().getPicklistValues()) { if (e.isActive()) vals.add(e.getValue()); }
    System.debug('PL ' + f + ' = ' + String.join(vals, ' || '));
}
