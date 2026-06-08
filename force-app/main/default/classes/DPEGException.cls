/**
 * @description Shared exception class for the DPEG project.
 *
 *              Usage in service classes:
 *                  throw new DPEGException('Commitment not found for id: ' + commitmentId);
 *
 *              Usage at @AuraEnabled boundaries (always wrap before re-throwing):
 *                  catch (DPEGException e) {
 *                      throw new AuraHandledException(e.getMessage());
 *                  }
 *
 *              Never expose raw system exception messages to the UI — they leak
 *              stack traces and internal field names.
 *
 * @author  DPEG Project Team
 * @since   API 66.0
 */
public class DPEGException extends Exception {
}
