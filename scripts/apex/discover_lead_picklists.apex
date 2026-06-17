List<String> st = new List<String>();
for (Schema.PicklistEntry e : Lead.Status.getDescribe().getPicklistValues()) { if (e.isActive()) st.add(e.getValue()); }
List<String> src = new List<String>();
for (Schema.PicklistEntry e : Lead.LeadSource.getDescribe().getPicklistValues()) { if (e.isActive()) src.add(e.getValue()); }
System.debug('LEAD_STATUS=' + String.join(st, ' || '));
System.debug('LEAD_SOURCE=' + String.join(src, ' || '));
