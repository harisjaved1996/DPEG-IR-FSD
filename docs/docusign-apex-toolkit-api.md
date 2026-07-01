# DocuSign Apex Toolkit (dfsle) — REAL API signatures

Extracted from org **DPEG-IR-FSD** (Docusign Apps Launcher 8.4, namespace `dfsle`) via Tooling API SymbolTable, one class per query (reliable).
Authoritative — actual installed-package signatures. Prefix every type with `dfsle.` in code. `List` / `Set` show without their generic param in SymbolTable; infer the element type from context.

## dfsle.EnvelopeService
```apex
  // methods
static global Envelope createEnvelope(Envelope envelope, EnvelopeConfiguration envelopeConfiguration, Boolean addFromSource)
static global Id deleteEnvelope(Id envelopeId)
static global Envelope getEmptyEnvelope(Entity source)
static global Envelope getEnvelope(Id envelopeId)
static global Url getSenderViewUrl(UUID docuSignId, Url returnUrl)
static global Envelope retryEnvelope(UUID transactionId, Boolean sendNow)
static global List saveSentEnvelopes(List envelopes)
static global Envelope sendEnvelope(Envelope envelope, Boolean sendNow)
static global List sendEnvelopes(List envelopes)
static global Envelope updateEnvelope(Envelope envelope)
```

## dfsle.Envelope
```apex
  // constructors
global Envelope(Id id, String name, UUID docuSignId, Id envelopeConfigurationId, List documents, List recipients, List customFields, Notifications notifications, String emailSubject, String emailMessage, Entity source, Datetime sent)
  // properties / constants
    String STATUS_CREATED
    String STATUS_SENT
    String STATUS_DELIVERED
    String STATUS_DECLINED
    String STATUS_VOIDED
    String STATUS_COMPLETED
  // methods
static global Envelope newBulkCopy(Recipient recipient)
static global Envelope newBulkCopy(List recipients)
global Envelope withCustomFields(List customFields)
global Envelope withDocuments(List documents)
global Envelope withDocuSignId(UUID docuSignId)
global Envelope withEmail(String emailSubject, String emailMessage)
global Envelope withNotifications(Notifications notifications)
global Envelope withOptions(Options options)
global Envelope withRecipients(List recipients)
global Envelope withSent(Datetime sent)

  // --- inner: dfsle.Envelope.Options ---
    // constructors
  global Options(Boolean includeDefaultAutoPlaceTags, WriteBack documentWriteBack, Map envelopeEventUpdates, Map recipientEventUpdates)

  // --- inner: dfsle.Envelope.Status ---
    // constructors
  global Status(Id id, Entity source, UUID docuSignId, String status, String senderName, String senderEmail, List recipients, Datetime sent, Datetime expires, Datetime completed, String emailSubject, String reason, Datetime lastStatusUpdate)
```

## dfsle.DocumentService
```apex
  // methods
static global Folders getDocumentFolders(Schema.SObjectType type)
static global List getDocuments(Schema.SObjectType type, Set sObjectIds)
static global List getEnvelopeDocuments(Id envelopeId)
static global List getFolderDocuments(Schema.SObjectType type, Set folderIds)
static global List getLinkedDocuments(Schema.SObjectType type, Set linkedEntityIds, Boolean getLastUpdatedOnly)
```

## dfsle.RecipientService
```apex
  // methods
static global List getDefaultRoles()
static global List getRecipients(Schema.SObjectType type, Set ids)
static global List searchRecipients(Schema.SObjectType type, String firstName, String lastName)
```

## dfsle.BulkSendService
```apex
  // methods
static global List createLists(List bulkLists)
static global Boolean deleteLists(Set bulkListIds)
static global Envelope getDraftEnvelope(List documents, Entity source)
static global List getStatus(Set bulkStatusIds)
static global List searchLists(String name, Integer maximumRecords)
static global Result sendEnvelope(Id bulkListId, Envelope envelope)
static global List updateLists(List bulkLists)
```

## dfsle.SigningService
```apex
  // methods
static global Url getEmbeddedSigningUrl(UUID envelopeId, Url returnUrl)
static global Url getRecipientPreviewUrl(UUID envelopeId, Integer recipientSequence)
static global Url getSigningUrl(Envelope envelope, Url returnUrl, Boolean checkFirstRecipientOnly)
static global Boolean shouldSignNow(Envelope envelope)
```

## dfsle.StatusService
```apex
  // methods
static global List createStatus(List envelopes)
static global Url getCorrectUrl(UUID docuSignId, Url returnUrl)
static global List getStatus(Set sourceIds, Integer maximumRecords)
static global Url getViewUrl(UUID docuSignId, Url returnUrl)
static global Boolean resendEnvelope(UUID docuSignId)
static global List resendRecipients(UUID docuSignId, List recipients)
static global Boolean voidEnvelope(UUID docuSignId, String reason)
```

## dfsle.TemplateService
```apex
  // methods
static global Template getTemplate(UUID templateId)
static global List getTemplates()
```

## dfsle.Document
```apex
  // constructors
global Document(Id id, String type, Integer sequence, String name, String extension, Integer size, Datetime lastModified, String sourceId)
  // properties / constants
    String TYPE_TEMPLATE
    String TYPE_FILE
    String TYPE_DOCUMENT
    String WRITE_BACK_NAME
    String WRITE_BACK_NAME_ENVELOPE_STATUS
    String WRITE_BACK_NAME_PDF
    String WRITE_BACK_NAME_PDF_REPLACE_EXTENSION
    String WRITE_BACK_NAME_ENVELOPE_STATUS_PDF
    String WRITE_BACK_NAME_ENVELOPE_STATUS_PDF_REPLACE_EXTENSION
    String WRITE_BACK_ENVELOPE_PDF
    String WRITE_BACK_ENVELOPE_STATUS_PDF
    String SIGNER_ACKNOWLEDGEMENT_NONE
    String SIGNER_ACKNOWLEDGEMENT_VIEW
    String SIGNER_ACKNOWLEDGEMENT_ACCEPT
    String SIGNER_ACKNOWLEDGEMENT_VIEW_ACCEPT
    String SIGNER_ACKNOWLEDGEMENT_READ_ACCEPT
  // methods
static global Document fromFile(ContentVersion file)
static global Document fromTemplate(UUID docuSignId, String name)
virtual global Document withPdfOptions(PdfOptions pdfOptions)
virtual global Document withReplacement(Document replacement)
virtual global Document withSupplementalOptions(SupplementalOptions supplementalOptions)

  // --- inner: dfsle.Document.Folder ---
    // constructors
  global Folder(Id id, String name)

  // --- inner: dfsle.Document.Folders ---
    // constructors
  global Folders(List folders, List documents)

  // --- inner: dfsle.Document.PdfOptions ---
    // constructors
  global PdfOptions(Boolean transformFields, Integer recipientSequence)

  // --- inner: dfsle.Document.WriteBack ---
    // constructors
  global WriteBack(Id linkedEntityId, String nameFormat, Boolean combineDocuments, Boolean includeCertificateOfCompletion)

  // --- inner: dfsle.Document.SupplementalOptions ---
    // constructors
  global SupplementalOptions(String signerAcknowledgement, Boolean includeInDownload)
```

## dfsle.Recipient
```apex
  // constructors
global Recipient(Id id, String type, Integer sequence, Integer routingOrder, Role role, String name, String email, SigningGroup signingGroup, String phone, Authentication authentication, String note, EmailSettings emailSettings, String hostName, String hostEmail, Boolean signNow, Entity source, Boolean readOnly, Boolean required)
global SigningGroup(Integer id, String name)
  // properties / constants
    String TYPE_SIGNER
    String TYPE_IN_PERSON_SIGNER
    String TYPE_EMBEDDED_SIGNER
    String TYPE_CARBON_COPY
    String TYPE_CERTIFIED_DELIVERY
    String TYPE_AGENT
    String TYPE_EDITOR
    String TYPE_INTERMEDIARY
    String STATUS_CREATED
    String STATUS_SENT
    String STATUS_DELIVERED
    String STATUS_DECLINED
    String STATUS_COMPLETED
    String STATUS_SIGNED
    String STATUS_CANCELED
  // methods
static global Recipient fromSource(String name, String email, String phone, String role, Entity source)
static global Recipient newBulkRecipient(String name, String email, Entity source)
static global Recipient newEmbeddedSigner(String name, String email, Id sourceId)
static global Recipient newEmbeddedSigner()
global Recipient withAuthentication(Authentication authentication)
global Recipient withEmailSettings(EmailSettings emailSettings)
virtual global Recipient withEmbeddedRecipientStartURL(String embeddedRecipientStartURL)
global Recipient withNote(String note)
virtual global Recipient withRole(Role role)
virtual global Recipient withRole(String role)
global Recipient withRoutingOrder(Integer routingOrder)
virtual global Recipient withSignatureProviders(List signatureProviders)
virtual global Recipient withSmsDelivery(String phone)
virtual global Recipient withTabs(List tabs)
virtual global Recipient withType(String type)

  // --- inner: dfsle.Recipient.Role ---
    // constructors
  global Role(String name, Integer value)

  // --- inner: dfsle.Recipient.Authentication ---
    // constructors
  global Authentication(String accessCode, Boolean idCheckRequired, List smsPhoneNumbers)

  // --- inner: dfsle.Recipient.EmailSettings ---
    // constructors
  global EmailSettings(String language, String languageLabel, String subject, String message)

  // --- inner: dfsle.Recipient.Status ---
    // constructors
  global Status(Id id, Entity source, String type, Integer sequence, String status, String name, String email, Integer routingOrder, Datetime sent, Datetime completed, String reason, Datetime lastStatusUpdate)

  // --- inner: dfsle.Recipient.ResendResult ---

```

## dfsle.Tab
```apex
  // methods
global Tab withAnchor(Anchor anchor)
global Tab withCondition(Condition condition)
global Tab withCustomTabId(UUID customTabId)
global Tab withDataLabel(String dataLabel)
global Tab withGroupDataLabels(List groupDataLabels)
global Tab withGuidedForm(GuidedForm guidedForm)
global Tab withId(UUID id)
global Tab withName(String name)
global Tab withOrder(Integer order)
global Tab withPosition(Position position)
global Tab withSmartContract(SmartContract smartContract)
global Tab withTooltip(String tooltip)

  // --- inner: dfsle.Tab.Type ---
    // properties / constants
      Type Approve
      Type Checkbox
      Type CommentThread
      Type Company
      Type DateSigned
      Type DateTab
      Type Decline
      Type Draw
      Type Email
      Type EmailAddress
      Type EnvelopeId
      Type FirstName
      Type Formula
      Type FullName
      Type InitialHere
      Type LastName
      Type ListTab
      Type Notarize
      Type Note
      Type NumberTab
      Type Payment
      Type PolyLineOverlay
      Type RadioGroup
      Type SignerAttachment
      Type SignHere
      Type SmartSection
      Type Ssn
      Type TabGroup
      Type Text
      Type Title
      Type View
      Type Zip

  // --- inner: dfsle.Tab.Position ---
    // constructors
  global Position(Integer documentSequence, Integer pageNumber, Integer x, Integer y, Integer width, Integer height)

  // --- inner: dfsle.Tab.Anchor ---
    // constructors
  global Anchor(String text)
  global Anchor(String text, Boolean allowWhiteSpace, Boolean caseSensitive, String horizontalAlignment, Boolean ignoreIfNotPresent, Boolean matchWholeWord, String units, Integer xOffset, Integer yOffset)

  // --- inner: dfsle.Tab.GuidedForm ---
    // constructors
  global GuidedForm(Integer order, String pageLabel, Integer pageNumber)

  // --- inner: dfsle.Tab.Condition ---
    // constructors
  global Condition(String parentDataLabel, String parentValue)

  // --- inner: dfsle.Tab.Formatting ---
    // constructors
  global Formatting(String font, String color, Integer size, Boolean bold, Boolean italic, Boolean underline, Boolean concealValue, Boolean fixedWidth)

  // --- inner: dfsle.Tab.Validation ---
    // constructors
  global Validation(Integer maximumLength, String pattern, String errorMessage)

  // --- inner: dfsle.Tab.ComponentType ---
    // properties / constants
      ComponentType SObj
      ComponentType Lookup
      ComponentType Child
      ComponentType Field

  // --- inner: dfsle.Tab.PathComponent ---
    // constructors
  global PathComponent(String name, ComponentType type, String salesforceType)

  // --- inner: dfsle.Tab.MergeField ---
    // constructors
  global MergeField(String path, List pathExtended, Integer row, Boolean writeBack, Boolean senderReadOnly)

  // --- inner: dfsle.Tab.Collaboration ---
    // constructors
  global Collaboration(Boolean canCollaborate, Boolean required, Boolean requireInitialOnChange)

  // --- inner: dfsle.Tab.SmartContract ---
    // constructors
  global SmartContract(String code, String uri)
```

## dfsle.SignHereTab
```apex
  // constructors
global SignHereTab()
  // methods
global SignHereTab withIsSeal(Boolean isSeal)
global SignHereTab withStamp(Stamp stamp)

  // --- inner: dfsle.SignHereTab.DateStamp ---
    // constructors
  global DateStamp(Integer x, Integer y, Integer width, Integer height)

  // --- inner: dfsle.SignHereTab.StampImage ---
    // constructors
  global StampImage(String type, String uri, String base64, Integer size, Boolean isResizable)

  // --- inner: dfsle.SignHereTab.Stamp ---
    // constructors
  global Stamp(String type, String externalId, String format, String signatureName, String phoneticName, StampImage image, DateStamp dateStamp, String customField)
```

## dfsle.FullNameTab
```apex
  // constructors
global FullNameTab()
```

## dfsle.DateSignedTab
```apex
  // constructors
global DateSignedTab()
```

## dfsle.TextTab
```apex
  // constructors
global TextTab()
```

## dfsle.SignatureTab
```apex
  // methods
global SignatureTab withRequired(Boolean required)
global SignatureTab withScale(Decimal scale)
```

## dfsle.Entity
```apex
  // constructors
global Entity(Id id)
global Entity(Id id, String name, Entity parent)
  // methods
static global Entity resolve(Id id)
```

## dfsle.UUID
```apex
  // methods
static global UUID parse(String s)
static global UUID randomUUID()
static global UUID tryParse(String s)
```

## dfsle.BulkList
```apex
  // properties / constants
    String STATUS_QUEUED
    String STATUS_PROCESSING
    String STATUS_SENT
    String STATUS_FAILED
  // methods
static global BulkList newList(String name, List copies, Entity source)

  // --- inner: dfsle.BulkList.Result ---


  // --- inner: dfsle.BulkList.Status ---

```

## dfsle.CustomField
```apex
  // constructors
global CustomField(String type, String name, String value, List items, Boolean required, Boolean show)
```

