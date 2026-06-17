Id INV = 'a08FW003rCMBVNoYQP';
Map<Id,Integer> plan = new Map<Id,Integer>{
    'a0AFW0039enqGps2AE' => 4,
    'a0AFW0039enuSyu2AE' => 3,
    'a0AFW0039enyf7w2AA' => 3,
    'a0AFW0039eo2rGy2AI' => 2
};
List<Unison__Contribution__c> tc = new List<Unison__Contribution__c>();
Integer idx = 0;
for (Id offId : plan.keySet()) {
    for (Integer i = 1; i <= plan.get(offId); i++) {
        Unison__Contribution__c c = new Unison__Contribution__c();
        c.Unison__Investment__c = INV;
        c.put('Unison__Offering__c', offId);
        c.Unison__Amount__c = 250000 + (idx * 50000);
        c.Unison__Contribution_Date__c = Date.newInstance(2026,6,1).addDays(idx);
        tc.add(c);
        idx++;
    }
}
insert tc;
System.debug('CONTRIB_INSERTED=' + tc.size());
