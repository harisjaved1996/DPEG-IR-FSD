import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

// Prototype: every row links to one real Contribution / Contact / Investing Entity
// record, looked up at runtime (no hardcoded Id) so it works in any org.
const TARGET_CONTACT_LAST_NAME = "Greentree";
const TARGET_INVESTING_ENTITY_NAME = "Greentree LLC";

const COLUMNS = [
  {
    label: "Contribution Number",
    fieldName: "contributionUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "contributionNumber" },
      target: "_self"
    }
  },
  {
    label: "Contact",
    fieldName: "contactUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "contact" }, target: "_self" }
  },
  {
    label: "Investing Entity",
    fieldName: "investingEntityUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "investingEntity" }, target: "_self" }
  },
  { label: "Contributed Date", fieldName: "contributedDate", type: "text" },
  { label: "Amount", fieldName: "amount", type: "text" },
  { label: "Type", fieldName: "type", type: "text" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    contributionNumber: "Con-0001",
    contributedDate: "08/11/2025",
    amount: "$25,000.00",
    contact: "Johnson",
    investingEntity: "3D Way, LLC",
    type: "Full"
  },
  {
    id: "2",
    contributionNumber: "Con-0002",
    contributedDate: "21/10/2025",
    amount: "$40,000.00",
    contact: "Albert Stein",
    investingEntity: "3DXB LLC",
    type: "Full"
  },
  {
    id: "3",
    contributionNumber: "Con-0003",
    contributedDate: "03/12/2025",
    amount: "$32,000.00",
    contact: "M. Patel",
    investingEntity: "5As Capital Group LLC",
    type: "Full"
  }
];

export default class ContributionsOfferingCom extends NavigationMixin(LightningElement) {
  columns = COLUMNS;

  // Generated at runtime from the resolved record Ids; every row links here.
  contributionUrl;
  contactUrl;
  investingEntityUrl;

  get data() {
    return DATA.map((row) => ({
      ...row,
      contributionUrl: this.contributionUrl,
      contactUrl: this.contactUrl,
      investingEntityUrl: this.investingEntityUrl
    }));
  }

  get recordCount() {
    return this.data.length;
  }

  handleNew() {
    // Placeholder for the New action.
  }

  handleViewAll(event) {
    event.preventDefault();
    // Navigate to the Contribution object list page, showing the "All" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Contribution__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All"
      }
    });
  }

  handleRowAction(event) {
    const { name } = event.detail.action;
    const { contributionNumber } = event.detail.row;
    // Placeholder: handle `name` (edit/delete) for `contributionNumber`.
    return { name, contributionNumber };
  }

  get contactVariables() {
    return { lastName: TARGET_CONTACT_LAST_NAME };
  }

  get investingEntityVariables() {
    return { name: TARGET_INVESTING_ENTITY_NAME };
  }

  @wire(graphql, {
    query: gql`
      query firstContribution {
        uiapi {
          query {
            Unison__Contribution__c(first: 1) {
              edges {
                node {
                  Id
                }
              }
            }
          }
        }
      }
    `
  })
  wiredContribution({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Unison__Contribution__c?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachContributionUrl(edges[0].node.Id);
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
    this.attachContactUrl(edges[0].node.Id);
  }

  @wire(graphql, {
    query: gql`
      query investingEntityByName($name: String) {
        uiapi {
          query {
            Unison__Investing_Entity__c(where: { Name: { eq: $name } }, first: 1) {
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
    variables: "$investingEntityVariables"
  })
  wiredInvestingEntity({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Unison__Investing_Entity__c?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachInvestingEntityUrl(edges[0].node.Id);
  }

  async attachContributionUrl(recordId) {
    try {
      this.contributionUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Unison__Contribution__c",
          actionName: "view"
        }
      });
    } catch (error) {
      // Leave rows without links if URL generation fails so the table still renders.
    }
  }

  async attachContactUrl(recordId) {
    try {
      this.contactUrl = await this[NavigationMixin.GenerateUrl]({
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

  async attachInvestingEntityUrl(recordId) {
    try {
      this.investingEntityUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Unison__Investing_Entity__c",
          actionName: "view"
        }
      });
    } catch (error) {
      // Leave rows without links if URL generation fails so the table still renders.
    }
  }
}
