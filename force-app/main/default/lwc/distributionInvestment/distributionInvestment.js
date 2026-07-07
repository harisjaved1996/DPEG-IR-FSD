import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

const COLUMNS = [
  {
    label: "Distribution Batch Number",
    fieldName: "distributionUrl",
    type: "url",
    typeAttributes: {
      label: { fieldName: "distributionNumber" },
      target: "_self"
    }
  },
  { label: "Status", fieldName: "paidStatus", type: "text" },
  { label: "Amount", fieldName: "amountLabel", type: "text" },
  { label: "Distribution Date", fieldName: "distributionDate", type: "text" },
  { label: "Source", fieldName: "source", type: "text" },
  { label: "Type", fieldName: "type", type: "text" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    distributionNumber: "DB-020",
    paidStatus: "Completed",
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
    distributionNumber: "DB-021",
    paidStatus: "Completed",
    amount: 25000,
    amountLabel: "$25,000.00",
    distributionDate: "20/05/2026",
    date: "20/05/2026",
    effectiveDate: "21/05/2026",
    period: "Q2 2026",
    description: "Return of Capital",
    source: "Cash Flow",
    type: "Preferred Return"
  },
  {
    id: "3",
    distributionNumber: "DB-023",
    paidStatus: "Completed",
    amount: 60000,
    amountLabel: "$60,000.00",
    distributionDate: "10/06/2026",
    date: "10/06/2026",
    effectiveDate: "10/06/2026",
    period: "Q3 2026",
    description: "Quarterly Cash Distribution",
    source: "Cash Flow",
    type: "Preferred Return"
  }
];

export default class DistributionInvestment extends NavigationMixin(LightningElement) {
  columns = COLUMNS;
  showModal = false;
  selectedRecords = [];

  // Generated at runtime from the resolved Distribution Batch Id; every row links here.
  distributionUrl;

  get data() {
    return DATA.map((row) => ({
      ...row,
      distributionUrl: this.distributionUrl
    }));
  }

  get recordCount() {
    return this.data.length;
  }

  @wire(graphql, {
    query: gql`
      query distributionBatch {
        uiapi {
          query {
            Unison__Distribution_Batch__c(first: 1) {
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
  wiredDistributionBatch({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Unison__Distribution_Batch__c?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachRecordUrl(edges[0].node.Id);
  }

  async attachRecordUrl(recordId) {
    try {
      this.distributionUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Unison__Distribution_Batch__c",
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
    // Navigate to the Distribution Batch object list page, showing the "All" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Distribution_Batch__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All"
      }
    });
  }
}
