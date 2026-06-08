Organization org = [SELECT Id, PathAssistantEnabled FROM Organization LIMIT 1];
System.debug('Before - PathAssistantEnabled: ' + org.PathAssistantEnabled);
org.PathAssistantEnabled = true;
update org;
Organization updated = [SELECT Id, PathAssistantEnabled FROM Organization LIMIT 1];
System.debug('After - PathAssistantEnabled: ' + updated.PathAssistantEnabled);
