/**
 * @description Selector for Salesforce Files (ContentDocumentLink / ContentVersion) used by the
 *              DocuSign wizard's Documents step. All SOQL for these objects lives here.
 *              `with sharing`; every query uses `WITH USER_MODE`. No business logic, DML, or
 *              callouts — query construction only.
 *
 *              - selectLinkedToRecord: files linked to the Offering (the "Add from Salesforce" list).
 *              - selectLatestVersionsByDocumentIds: latest ContentVersion per selected ContentDocument,
 *                which `dfsle.Document.fromFile(ContentVersion)` requires to attach a file to an envelope.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class DocuSignDocumentSelector {
    /**
     * @description Selects the ContentDocumentLink rows for a record (files shared to / linked to
     *              the Offering), including the title/extension/size of each linked file.
     * @param linkedEntityId The record Id (Offering) whose linked files to list.
     * @return List of ContentDocumentLink records; empty when the Id is null.
     */
    public static List<ContentDocumentLink> selectLinkedToRecord(Id linkedEntityId) {
        if (linkedEntityId == null) {
            return new List<ContentDocumentLink>();
        }

        return [
            SELECT
                ContentDocumentId,
                ContentDocument.Title,
                ContentDocument.FileExtension,
                ContentDocument.ContentSize,
                LinkedEntityId
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :linkedEntityId
            WITH USER_MODE
            ORDER BY ContentDocument.Title ASC
        ];
    }

    /**
     * @description Selects the latest ContentVersion for each supplied ContentDocument Id.
     *              The latest version is the one with IsLatest = true.
     * @param contentDocumentIds Set of ContentDocument Ids to resolve to their current version.
     * @return List of ContentVersion records (latest per document); empty when input is empty.
     */
    public static List<ContentVersion> selectLatestVersionsByDocumentIds(Set<Id> contentDocumentIds) {
        if (contentDocumentIds == null || contentDocumentIds.isEmpty()) {
            return new List<ContentVersion>();
        }

        return [
            SELECT Id, ContentDocumentId, Title, FileExtension, ContentSize, VersionData
            FROM ContentVersion
            WHERE ContentDocumentId IN :contentDocumentIds AND IsLatest = TRUE
            WITH USER_MODE
            ORDER BY Title ASC
        ];
    }

    /**
     * @description Selects ContentVersion rows by their own Ids — used to resolve the
     *              ContentDocumentId of files the current transaction just inserted (the wizard's
     *              upload step) so they can be linked to the Offering.
     * @param versionIds Set of ContentVersion Ids to load.
     * @return List of ContentVersion records (Id, ContentDocumentId, Title); empty when input empty.
     */
    public static List<ContentVersion> selectByVersionIds(Set<Id> versionIds) {
        if (versionIds == null || versionIds.isEmpty()) {
            return new List<ContentVersion>();
        }

        return [
            SELECT Id, ContentDocumentId, Title
            FROM ContentVersion
            WHERE Id IN :versionIds
            WITH USER_MODE
        ];
    }
}
