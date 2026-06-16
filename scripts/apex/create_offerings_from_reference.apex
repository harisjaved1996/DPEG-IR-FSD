// Create 8 Unison__Offering__c records cloned from a reference record.
// Rules:
//   - Reference record is READ ONLY (only SELECTed, never updated).
//   - All lookup (reference) fields left EMPTY in the new records.
//   - Each new record gets a DISTINCT Status (no repeats).
//   - Unique fields are made distinct so inserts don't collide.

final Id REF_ID = 'a0AFW002mMT3KWu2QN';
final Integer N = 8;
final List<String> STATUSES = new List<String>{
    'Draft', 'Pre-Launch', 'Active Fundraising', 'Fully Subscribed',
    'Signatures Pending', 'Ready to Activate', 'Investment Active', 'Closed Funded'
};

Map<String, Schema.SObjectField> fmap = Unison__Offering__c.SObjectType.getDescribe().fields.getMap();

// createable, non-reference fields => copy. (excludes lookups, formulas, rollups, autonumber, system fields)
List<String> copyFields = new List<String>();
Set<String> uniqueFields = new Set<String>();
for (String fn : fmap.keySet()) {
    Schema.DescribeFieldResult d = fmap.get(fn).getDescribe();
    if (d.isCreateable() && d.getType() != Schema.DisplayType.REFERENCE) {
        copyFields.add(d.getName());
        if (d.isUnique()) {
            uniqueFields.add(d.getName());
        }
    }
}
System.debug('COPY_FIELDS=' + String.join(copyFields, ', '));
System.debug('UNIQUE_FIELDS=' + JSON.serialize(uniqueFields));

SObject ref = Database.query(
    'SELECT ' + String.join(copyFields, ',') + ' FROM Unison__Offering__c WHERE Id = :REF_ID LIMIT 1'
);

List<Unison__Offering__c> news = new List<Unison__Offering__c>();
for (Integer i = 0; i < N; i++) {
    Unison__Offering__c o = new Unison__Offering__c();
    for (String fn : copyFields) {
        Object val = ref.get(fn);
        if (uniqueFields.contains(fn) && val != null) {
            val = String.valueOf(val) + '-' + (i + 1); // keep unique values distinct
        }
        o.put(fn, val);
    }
    o.put('Unison__Status__c', STATUSES[i]); // distinct status per record
    news.add(o);
}

insert news;

System.debug('INSERTED_COUNT=' + news.size());
for (Unison__Offering__c o : news) {
    System.debug('NEW_REC id=' + o.Id
        + ' | Status=' + o.Unison__Status__c
        + ' | Name=' + o.Name
        + ' | OfferingId=' + o.Unison__Offering_ID__c
        + ' | Property(lookup)=' + o.Unison__Property__c);
}
