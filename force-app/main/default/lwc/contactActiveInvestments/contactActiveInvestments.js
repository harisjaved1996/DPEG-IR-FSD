import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

// Prototype: Investment links resolve to one real Investment record and the
// Investing Entity links resolve to one real Investing Entity record, both
// looked up by Name at runtime (no hardcoded Id) so it works in any org.
const TARGET_INVESTMENT_NAME = "DPEG Vicksburg, LP";
const TARGET_INVESTING_ENTITY_NAME = "Greentree LLC";

const COLUMNS = [
  {
    label: "Investment",
    fieldName: "investmentUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "investment" }, target: "_self" },
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Investing Entity",
    fieldName: "entityUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "entity" }, target: "_self" },
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Ownership",
    fieldName: "ownership",
    type: "text",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Committed",
    fieldName: "committed",
    type: "text",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Contributed",
    fieldName: "contributed",
    type: "text",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Distributed",
    fieldName: "distributed",
    type: "text",
    cellAttributes: { alignment: "left" }
  }
];

// Dummy data for the Active Investments tab (two rows).
const DATA = [
  {
    id: "1",
    investment: "Global Zante, LLC",
    entity: TARGET_INVESTING_ENTITY_NAME,
    ownership: "1.00%",
    committed: "$500,000.00",
    contributed: "$450,000.00",
    distributed: "$120,000.00"
  },
  {
    id: "2",
    investment: "Fuqua Park Row, LLC",
    entity: TARGET_INVESTING_ENTITY_NAME,
    ownership: "2.00%",
    committed: "$750,000.00",
    contributed: "$700,000.00",
    distributed: "$250,000.00"
  }
];

export default class ContactActiveInvestments extends NavigationMixin(LightningElement) {
  columns = COLUMNS;

  // Generated at runtime from the resolved record Ids; every row links here.
  investmentUrl;
  entityUrl;

  get data() {
    return DATA.map((row) => ({
      ...row,
      investmentUrl: this.investmentUrl,
      entityUrl: this.entityUrl
    }));
  }

  get recordCount() {
    return this.data.length;
  }

  get investmentVariables() {
    return { name: TARGET_INVESTMENT_NAME };
  }

  get entityVariables() {
    return { name: TARGET_INVESTING_ENTITY_NAME };
  }

  @wire(graphql, {
    query: gql`
      query investmentByName($name: String) {
        uiapi {
          query {
            Unison__Investment__c(where: { Name: { eq: $name } }, first: 1) {
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
    variables: "$investmentVariables"
  })
  wiredInvestment({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Unison__Investment__c?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachInvestmentUrl(edges[0].node.Id);
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
    variables: "$entityVariables"
  })
  wiredEntity({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Unison__Investing_Entity__c?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachEntityUrl(edges[0].node.Id);
  }

  async attachInvestmentUrl(recordId) {
    try {
      this.investmentUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Unison__Investment__c",
          actionName: "view"
        }
      });
    } catch (error) {
      // Leave rows without links if URL generation fails so the table still renders.
    }
  }

  async attachEntityUrl(recordId) {
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
    // Navigate to the Investment object list page, showing the "All Investments" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Investment__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All_Investments"
      }
    });
  }
}
