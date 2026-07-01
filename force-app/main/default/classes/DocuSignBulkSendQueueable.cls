/**
 * @description Async fan-out for the DocuSign wizard. Sends ONE envelope per asynchronous
 *              transaction and chains itself for the next recipient, so each
 *              dfsle.EnvelopeService.sendEnvelope() callout runs with NO prior uncommitted DML.
 *
 *              WHY ONE-PER-TRANSACTION (root cause): sendEnvelope() does an HTTP callout and then
 *              writes its tracking DML (dfsle__Envelope__c). Two sends in the same transaction make
 *              the second callout fail with "You have uncommitted work pending. Please commit or
 *              rollback before calling out." sendEnvelopes(List) is a silent no-op for in-memory
 *              envelopes and createEnvelope() is not visible to subscriber code, so the only reliable
 *              primitive is sendEnvelope(env, true) — at most once per transaction. Chaining a
 *              Queueable gives every send its own fresh transaction.
 *
 *              Implements Queueable + Database.AllowsCallouts (DocuSign sends are callouts) and
 *              System.Finalizer for resilient logging — never @future.
 *
 *              Layer: Queueable (ARCHITECTURE.md §2). Holds no dfsle logic itself — it re-resolves the
 *              current recipient/files under the user-mode selectors and delegates the single send to
 *              DocuSignBulkSendService.sendOne.
 *
 *              BUG C3: the controller hands this job the SAME access-filtered, ordered Contact Id list
 *              whose size it reported. This job sends exactly those Ids, one per transaction.
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class DocuSignBulkSendQueueable implements Queueable, Database.AllowsCallouts, Finalizer {
    private final DocuSignWizardDTO.SendRequest request;
    /** Ordered, access-resolved recipient Contact Ids still to process (index 0 = next to send). */
    private final List<Id> remainingContactIds;
    private final Set<Id> contentDocumentIds;
    /** Running tallies carried across the chain for end-of-chain logging. */
    private final Integer sentSoFar;
    private final Integer failedSoFar;

    /**
     * @description Entry constructor — the controller enqueues this with the full ordered recipient
     *              Id list. Tallies start at zero.
     * @param request The send request (template, tabs, email subject/message, offering).
     * @param recipientContactIds Ordered, access-resolved Contact Ids to send to (bug C3).
     * @param contentDocumentIds The selected ContentDocument Ids to attach.
     */
    public DocuSignBulkSendQueueable(
        DocuSignWizardDTO.SendRequest request,
        List<Id> recipientContactIds,
        Set<Id> contentDocumentIds
    ) {
        this(request, recipientContactIds, contentDocumentIds, 0, 0);
    }

    /**
     * @description Chain constructor — carries the remaining Ids and running tallies to the next link.
     */
    private DocuSignBulkSendQueueable(
        DocuSignWizardDTO.SendRequest request,
        List<Id> remainingContactIds,
        Set<Id> contentDocumentIds,
        Integer sentSoFar,
        Integer failedSoFar
    ) {
        this.request = request;
        this.remainingContactIds = remainingContactIds == null ? new List<Id>() : remainingContactIds;
        this.contentDocumentIds = contentDocumentIds == null ? new Set<Id>() : contentDocumentIds;
        this.sentSoFar = sentSoFar == null ? 0 : sentSoFar;
        this.failedSoFar = failedSoFar == null ? 0 : failedSoFar;
    }

    /**
     * @description Sends the next recipient's envelope (one callout, this transaction), then chains
     *              for the remaining recipients. Each link sends exactly one envelope so no callout
     *              ever follows uncommitted DML.
     * @param context The Queueable context.
     */
    public void execute(QueueableContext context) {
        System.attachFinalizer(this);

        if (this.remainingContactIds.isEmpty()) {
            return;
        }

        Id currentId = this.remainingContactIds[0];
        List<Id> rest = new List<Id>();
        for (Integer i = 1; i < this.remainingContactIds.size(); i++) {
            rest.add(this.remainingContactIds[i]);
        }

        Integer sent = this.sentSoFar;
        Integer failed = this.failedSoFar;

        List<Contact> resolved = ContactSelector.selectByIds(new Set<Id>{ currentId });
        if (resolved.isEmpty()) {
            failed++;
            System.debug(LoggingLevel.WARN, 'DocuSign async: recipient ' + currentId + ' not accessible; skipped.');
        } else {
            List<ContentVersion> contentVersions = DocuSignDocumentSelector.selectLatestVersionsByDocumentIds(
                this.contentDocumentIds
            );
            DocuSignWizardDTO.RecipientResult outcome = DocuSignBulkSendService.sendOne(
                this.request,
                contentVersions,
                resolved[0]
            );
            if (outcome.success) {
                sent++;
            } else {
                failed++;
            }
        }

        // Chain the next recipient in a fresh transaction (callout-safe). Guard against test-context
        // limits where chaining is not allowed.
        if (!rest.isEmpty() && !Test.isRunningTest()) {
            System.enqueueJob(new DocuSignBulkSendQueueable(this.request, rest, this.contentDocumentIds, sent, failed));
        } else {
            System.debug(LoggingLevel.INFO, 'DocuSign async chain complete: sent=' + sent + ' failed=' + failed);
        }
    }

    /**
     * @description Finalizer — runs whether or not execute() succeeded, so a failed link is auditable
     *              without breaking the chain. No re-enqueue here (avoids infinite chains on failure).
     * @param context The finalizer context.
     */
    public void execute(FinalizerContext context) {
        if (context.getResult() == ParentJobResult.SUCCESS) {
            System.debug(LoggingLevel.INFO, 'DocuSignBulkSendQueueable link completed.');
        } else {
            System.debug(
                LoggingLevel.ERROR,
                'DocuSignBulkSendQueueable link failed: ' +
                (context.getException() == null ? 'unknown error' : context.getException().getMessage())
            );
        }
    }
}
