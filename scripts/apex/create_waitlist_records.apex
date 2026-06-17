Map<Id,Integer> plan = new Map<Id,Integer>{
    'a0AFW0039enqGps2AE' => 4,
    'a0AFW0039enuSyu2AE' => 3,
    'a0AFW0039enyf7w2AA' => 3,
    'a0AFW0039eo2rGy2AI' => 2
};
List<String> statuses = new List<String>();
for (Schema.PicklistEntry e : Unison__Waitlist__c.Unison__Status__c.getDescribe().getPicklistValues()) {
    if (e.isActive()) statuses.add(e.getValue());
}
System.debug('WL_STATUSES=' + String.join(statuses, ' || '));
List<Unison__Waitlist__c> tc = new List<Unison__Waitlist__c>();
Integer idx = 0;
for (Id offId : plan.keySet()) {
    Integer cnt = plan.get(offId);
    for (Integer i = 1; i <= cnt; i++) {
        Unison__Waitlist__c w = new Unison__Waitlist__c();
        w.Unison__Offering__c = offId;
        w.Unison__Amount__c = 100000 + (idx * 25000);
        w.Unison__Position__c = i;
        w.Unison__Added_Date__c = Date.newInstance(2026,5,1).addDays(idx);
        w.Unison__Auto_Promote__c = false;
        if (!statuses.isEmpty()) w.Unison__Status__c = statuses[Math.mod(idx, statuses.size())];
        tc.add(w);
        idx++;
    }
}
insert tc;
System.debug('WL_INSERTED=' + tc.size());
Map<Id,Integer> per = new Map<Id,Integer>();
for (Unison__Waitlist__c w : tc) {
    Integer c = per.containsKey(w.Unison__Offering__c) ? per.get(w.Unison__Offering__c) : 0;
    per.put(w.Unison__Offering__c, c+1);
}
System.debug('WL_PER_OFFERING=' + JSON.serialize(per));
