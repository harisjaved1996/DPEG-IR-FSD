/**
 * @description Selector for Contact. All SOQL for Contact lives in this class.
 *              `with sharing`; every query uses `WITH USER_MODE` to enforce CRUD + FLS +
 *              record-level sharing in the running user's context. No business logic,
 *              DML, or callouts — query construction only.
 *
 *              Used by the DocuSign wizard to resolve recipient candidates by email filter
 *              and to re-resolve the selected recipient set under the user's access (so the
 *              count reported and the Ids enqueued are identical — bug C3).
 *
 * @author  DPEG Project Team
 * @since    API 66.0
 */
public with sharing class ContactSelector {
    /** Field list shared across recipient-returning queries. */
    private static final String CONTACT_FIELDS = String.join(
        new List<String>{ 'Id', 'Name', 'FirstName', 'LastName', 'Email' },
        ', '
    );

    /**
     * @description Selects Contacts whose Email contains the given fragment (case-insensitive),
     *              used to auto-pre-check recipients on the wizard's Recipients step.
     *              Only Contacts with a non-blank Email are returned (an envelope needs an address).
     * @param emailFragment The substring to match within Contact.Email (e.g. 'haris').
     * @return List of matching Contact records ordered by Name; empty when the fragment is blank.
     */
    public static List<Contact> selectByEmailContains(String emailFragment) {
        if (String.isBlank(emailFragment)) {
            return new List<Contact>();
        }

        String likeValue = '%' + emailFragment + '%';
        return Database.query(
            'SELECT ' +
                CONTACT_FIELDS +
                ' FROM Contact' +
                ' WHERE Email != NULL AND Email LIKE :likeValue' +
                ' WITH USER_MODE' +
                ' ORDER BY Name ASC'
        );
    }

    /**
     * @description Selects Contacts by Id — used to re-resolve the recipient set chosen in the
     *              wizard under the running user's sharing/FLS before sending, guaranteeing the
     *              dispatched/enqueued Id set matches what is reported back.
     * @param contactIds Set of Contact Ids to load.
     * @return List of matching Contact records; empty when the input is null/empty.
     */
    public static List<Contact> selectByIds(Set<Id> contactIds) {
        if (contactIds == null || contactIds.isEmpty()) {
            return new List<Contact>();
        }

        return Database.query(
            'SELECT ' +
                CONTACT_FIELDS +
                ' FROM Contact' +
                ' WHERE Id IN :contactIds AND Email != NULL' +
                ' WITH USER_MODE' +
                ' ORDER BY Name ASC'
        );
    }
}
