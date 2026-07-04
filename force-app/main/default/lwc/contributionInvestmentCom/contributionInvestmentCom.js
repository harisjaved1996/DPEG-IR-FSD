import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

// Prototype: every row links to one real Contribution / Investing Entity record,
// looked up at runtime (no hardcoded Id) so it works in any org.
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
    label: "Investing Entity",
    fieldName: "entityUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "name" }, target: "_self" }
  },
  { label: "Amount", fieldName: "amount", type: "text" },
  { label: "Contribution Date", fieldName: "contributionDate", type: "text" },
  { label: "Payment Details", fieldName: "paymentDetails", type: "text" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    contributionNumber: "Cont - 008",
    name: "12830 Oak Village Dr, LLC",
    amount: "$5000",
    contributionDate: "03/14/2026",
    paymentDetails: "Full"
  },
  {
    id: "2",
    contributionNumber: "Cont - 009",
    name: "18825 Sea, LLC",
    amount: "$9500",
    contributionDate: "02/08/2026",
    paymentDetails: "Partial"
  },
  {
    id: "3",
    contributionNumber: "Cont - 010",
    name: "1988 Venture LLC",
    amount: "$12000",
    contributionDate: "01/22/2026",
    paymentDetails: "Full"
  }
];

export default class ContributionInvestmentCom extends NavigationMixin(LightningElement) {
  columns = COLUMNS;

  // Generated at runtime from the resolved record Ids; every row links here.
  contributionUrl;
  entityUrl;

  get data() {
    return DATA.map((row) => ({
      ...row,
      contributionUrl: this.contributionUrl,
      entityUrl: this.entityUrl
    }));
  }

  get recordCount() {
    return this.data.length;
  }

  get investingEntityVariables() {
    return { name: TARGET_INVESTING_ENTITY_NAME };
  }

  @wire(graphql, {
    query: gql`
      query contributionFirst {
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

  async attachInvestingEntityUrl(recordId) {
    try {
      this.entityUrl = await this[NavigationMixin.GenerateUrl]({
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
    const { name: entityName } = event.detail.row;
    // Placeholder: handle `name` (edit/delete) for `entityName`.
    return { name, entityName };
  }
}
