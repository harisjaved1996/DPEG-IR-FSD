import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

// Prototype: every row links to one real Investment / Contribution record,
// looked up at runtime (no hardcoded Id) so it works in any org.
const TARGET_INVESTMENT_NAME = "DPEG Vicksburg, LP";

const COLUMNS = [
  {
    label: "Contribution Number",
    fieldName: "contributionUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "contributionNumber" },
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
  { label: "Date", fieldName: "date", type: "text", cellAttributes: { alignment: "left" } },
  { label: "Amount", fieldName: "amount", type: "text", cellAttributes: { alignment: "left" } }
];

// Dummy data modelled on the Contributions / payments screenshot.
const DATA = [
  {
    id: "1",
    contributionNumber: "Con - 0001",
    investment: "DPEG 359, LLC",
    date: "12/18/2025",
    amount: "$90,000.00"
  },
  {
    id: "2",
    contributionNumber: "Con - 0002",
    investment: "DPEG 359, LLC",
    date: "02/13/2024",
    amount: "$25,000.00"
  },
  {
    id: "3",
    contributionNumber: "Con - 0003",
    investment: "DPEG 359, LLC",
    date: "02/10/2023",
    amount: "$25,000.00"
  },
  {
    id: "4",
    contributionNumber: "Con - 0004",
    investment: "DPEG 359, LLC",
    date: "09/02/2022",
    amount: "$87,500.00"
  }
];

export default class ContributionInvestingEntity extends NavigationMixin(LightningElement) {
  columns = COLUMNS;

  // Generated at runtime from the resolved record Ids; every row links here.
  contributionUrl;
  investmentUrl;

  get data() {
    return DATA.map((row) => ({
      ...row,
      contributionUrl: this.contributionUrl,
      investmentUrl: this.investmentUrl
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
}
