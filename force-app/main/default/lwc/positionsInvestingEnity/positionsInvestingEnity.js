import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

// Prototype: every row links to one real Investment / Position record, looked up
// by Name at runtime (no hardcoded Id) so it works in any org.
const TARGET_INVESTMENT_NAME = "DPEG Vicksburg, LP";

const COLUMNS = [
  {
    label: "Position Number",
    fieldName: "positionUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "positionNumber" },
      target: "_self"
    },
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Investment",
    fieldName: "investmentUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "investment" },
      target: "_self"
    },
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

// Dummy data modelled on the Positions screenshot.
const DATA = [
  {
    id: "1",
    positionNumber: "POS - 001",
    investment: "DPEG 359, LLC",
    ownership: "2.5000%",
    committed: "$222,500.00",
    contributed: "$227,500.00",
    distributed: "$0.00"
  },
  {
    id: "2",
    positionNumber: "POS - 002",
    investment: "DPEG 412, LLC",
    ownership: "1.2500%",
    committed: "$100,000.00",
    contributed: "$100,000.00",
    distributed: "$15,000.00"
  },
  {
    id: "3",
    positionNumber: "POS - 003",
    investment: "DPEG 287, LLC",
    ownership: "3.0000%",
    committed: "$300,000.00",
    contributed: "$280,000.00",
    distributed: "$45,000.00"
  }
];

export default class PositionsInvestingEnity extends NavigationMixin(LightningElement) {
  columns = COLUMNS;

  // Generated at runtime from the resolved record Ids; every row links here.
  investmentUrl;
  positionUrl;

  get data() {
    return DATA.map((row) => ({
      ...row,
      investmentUrl: this.investmentUrl,
      positionUrl: this.positionUrl
    }));
  }

  get recordCount() {
    return this.data.length;
  }

  get investmentVariables() {
    return { name: TARGET_INVESTMENT_NAME };
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
      query position {
        uiapi {
          query {
            Unison__Position__c(first: 1) {
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
  wiredPosition({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Unison__Position__c?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachPositionUrl(edges[0].node.Id);
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

  async attachPositionUrl(recordId) {
    try {
      this.positionUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Unison__Position__c",
          actionName: "view"
        }
      });
    } catch (error) {
      // Leave rows without links if URL generation fails so the table still renders.
    }
  }

  handleViewAll(event) {
    event.preventDefault();
    // Navigate to the Position object list page, showing the "All" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Position__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All"
      }
    });
  }
}
