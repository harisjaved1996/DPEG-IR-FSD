import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

const TARGET_INVESTMENT_NAME = "DPEG Vicksburg, LP";

const COLUMNS = [
  {
    label: "Distribution Number",
    fieldName: "distributionUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "distributionNumber" },
      target: "_self"
    }
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
  { label: "Paid Status", fieldName: "paidStatus", type: "text" },
  { label: "Amount", fieldName: "amountLabel", type: "text" },
  { label: "Distribution Date", fieldName: "distributionDate", type: "text" },
  { label: "Source", fieldName: "source", type: "text" },
  { label: "Type", fieldName: "type", type: "text" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    distributionNumber: "DIST-2400",
    investment: "DPEG 359, LLC",
    paidStatus: "Paid",
    amount: 40000,
    amountLabel: "$40,000.00",
    distributionDate: "15/04/2026",
    date: "15/04/2026",
    effectiveDate: "15/04/2026",
    period: "Q2 2026",
    description: "Quarterly Cash Distribution",
    source: "Cash Flow",
    type: "Preferred Return"
  },
  {
    id: "2",
    distributionNumber: "DIST-2401",
    investment: "DPEG 412, LLC",
    paidStatus: "Paid",
    amount: 25000,
    amountLabel: "$25,000.00",
    distributionDate: "20/05/2026",
    date: "20/05/2026",
    effectiveDate: "21/05/2026",
    period: "Q2 2026",
    description: "Return of Capital",
    source: "Sale of Property",
    type: "Return of Capital"
  },
  {
    id: "3",
    distributionNumber: "DIST-2402",
    investment: "DPEG 287, LLC",
    paidStatus: "Paid",
    amount: 60000,
    amountLabel: "$60,000.00",
    distributionDate: "10/06/2026",
    date: "10/06/2026",
    effectiveDate: "10/06/2026",
    period: "Q3 2026",
    description: "Quarterly Cash Distribution",
    source: "Cash Flow",
    type: "Other"
  }
];

export default class DistributonInvestingEntity extends NavigationMixin(LightningElement) {
  columns = COLUMNS;
  showModal = false;
  selectedRecords = [];

  // Generated at runtime from the resolved Distribution and Investment Ids; every row links here.
  distributionUrl;
  investmentUrl;

  get data() {
    return DATA.map((row) => ({
      ...row,
      distributionUrl: this.distributionUrl,
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
      query distributionFirst {
        uiapi {
          query {
            Unison__Distribution__c(first: 1) {
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
  wiredDistribution({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Unison__Distribution__c?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachDistributionUrl(edges[0].node.Id);
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

  async attachDistributionUrl(recordId) {
    try {
      this.distributionUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Unison__Distribution__c",
          actionName: "view"
        }
      });
    } catch (error) {
      // Leave rows without links if URL generation fails so the table still renders.
    }
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;
    if (actionName === "repeat") {
      this.selectedRecords = [row];
      this.showModal = true;
    }
    // edit / delete row actions are placeholders for now.
  }

  closeModal() {
    this.showModal = false;
    this.selectedRecords = [];
  }

  handleNew() {
    // Placeholder for the New action.
  }

  handleViewAll(event) {
    event.preventDefault();
    // Navigate to the Distribution object list page, showing the "All distributions" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Distribution__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All_distributions"
      }
    });
  }
}
