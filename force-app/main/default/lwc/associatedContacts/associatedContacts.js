import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

// Prototype: every row links to one real Contact record, looked up by
// Name at runtime (no hardcoded Id) so it works in any org.
const TARGET_CONTACT_LAST_NAME = "Greentree";

const COLUMNS = [
  {
    label: "Name",
    fieldName: "nameUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "name" },
      target: "_self"
    },
    cellAttributes: { alignment: "left" }
  },
  { label: "Email", fieldName: "email", type: "text", cellAttributes: { alignment: "left" } },
  { label: "Phone", fieldName: "phone", type: "text", cellAttributes: { alignment: "left" } },
  { label: "Primary", fieldName: "primary", type: "text", cellAttributes: { alignment: "left" } },
  {
    label: "Required Signer",
    fieldName: "requiredSigner",
    type: "text",
    cellAttributes: { alignment: "left" }
  }
];

// Dummy data modelled on the Associated Contacts screenshot.
const DATA = [
  {
    id: "1",
    name: "Taj Merchant",
    email: "merchanttaj@yahoo.com",
    phone: "(832) 875-1702",
    primary: "Yes",
    requiredSigner: "Yes"
  },
  {
    id: "2",
    name: "A. Greentree",
    email: "a.greentree@greentreellc.com",
    phone: "(713) 555-0148",
    primary: "No",
    requiredSigner: "No"
  },
  {
    id: "3",
    name: "Sarah Lin",
    email: "sarah.lin@greentreellc.com",
    phone: "(281) 555-0092",
    primary: "No",
    requiredSigner: "No"
  }
];

export default class AssociatedContacts extends NavigationMixin(LightningElement) {
  columns = COLUMNS;

  // Generated at runtime from the resolved Contact Id; every row links here.
  nameUrl;

  get data() {
    return DATA.map((row) => ({
      ...row,
      nameUrl: this.nameUrl
    }));
  }

  get recordCount() {
    return this.data.length;
  }

  handleNew() {
    // Placeholder for the Add Contact action.
  }

  handleViewAll(event) {
    event.preventDefault();
    // Navigate to the Contact object list page, showing the "All Contacts" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Contact",
        actionName: "list"
      },
      state: {
        filterName: "Unison__AllContacts"
      }
    });
  }

  get contactVariables() {
    return { lastName: TARGET_CONTACT_LAST_NAME };
  }

  @wire(graphql, {
    query: gql`
      query contactByLastName($lastName: String) {
        uiapi {
          query {
            Contact(where: { LastName: { eq: $lastName } }, first: 1) {
              edges {
                node {
                  Id
                }
              }
            }
          }
        }
      }
    `,
    variables: "$contactVariables"
  })
  wiredContact({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Contact?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachRecordUrl(edges[0].node.Id);
  }

  async attachRecordUrl(recordId) {
    try {
      this.nameUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Contact",
          actionName: "view"
        }
      });
    } catch (error) {
      // Leave rows without links if URL generation fails so the table still renders.
    }
  }
}
