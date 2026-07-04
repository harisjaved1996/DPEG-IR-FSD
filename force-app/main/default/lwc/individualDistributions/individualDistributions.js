import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

// Prototype: every row links to one real Distribution / Investing Entity record,
// looked up at runtime (no hardcoded Id) so it works in any org.
const TARGET_INVESTING_ENTITY_NAME = "Greentree LLC";

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
    label: "Investing Entity",
    fieldName: "investingEntityUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "investingEntity" },
      target: "_self"
    }
  },
  { label: "Amount", fieldName: "amountLabel", type: "text" },
  { label: "Distribution Date", fieldName: "distributionDate", type: "text" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    distributionNumber: "DIST-2400",
    investingEntity: "Gabri Investments LLC",
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
    investingEntity: "KBMM MSO LLC",
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
    investingEntity: "Kilam Ventures LTD",
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

export default class IndividualDistributions extends NavigationMixin(LightningElement) {
  columns = COLUMNS;
  showModal = false;
  selectedRecords = [];

  // Generated at runtime from the resolved record Ids; every row links here.
  distributionUrl;
  investingEntityUrl;

  get data() {
    return DATA.map((row) => ({
      ...row,
      distributionUrl: this.distributionUrl,
      investingEntityUrl: this.investingEntityUrl
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
    // Placeholder for the View All action.
  }
}
