import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

// Same stage value always maps to the same pill colour.
const STAGE_VARIANT = {
  "Active Fundraising": "blue",
  Draft: "gray",
  "Signatures Pending": "orange",
  Closed: "green",
  Cancelled: "red"
};

// Prototype: every row links to this one real Offering record, looked up by
// Name at runtime (no hardcoded Id) so it works in any org.
const TARGET_RECORD_NAME = "Magnolia Crossing — DPEG Fund LP";

const COLUMNS = [
  {
    label: "Offering",
    fieldName: "recordUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "name" }, target: "_self" }
  },
  {
    label: "Stage",
    fieldName: "stage",
    type: "pill",
    typeAttributes: { variant: { fieldName: "stageVariant" } }
  },
  { label: "Target", fieldName: "target", type: "text" },
  { label: "Committed", fieldName: "committed", type: "text" },
  { label: "Funded", fieldName: "funded", type: "text" },
  {
    label: "Progress",
    fieldName: "pctLabel",
    type: "progressBar",
    typeAttributes: {
      barStyle: { fieldName: "barStyle" },
      pctStyle: { fieldName: "pctStyle" },
      pctLabel: { fieldName: "pctLabel" }
    }
  }
];

export default class IrOfferingsList extends NavigationMixin(LightningElement) {
  columns = COLUMNS;
  rows = [];

  offerings = [
    {
      id: 1,
      name: "Williams Way Apartments, LLC",
      stage: "Active Fundraising",
      target: "$12.0M",
      committed: "$10.5M",
      funded: "$8.6M",
      barStyle: "width: 72%; height: 100%; background-color: #2e844a; border-radius: 999px;",
      pctStyle: "color: #2e844a; font-size: 0.75rem; font-weight: 600;",
      pctLabel: "72%"
    },
    {
      id: 2,
      name: "Westpark Entrepreneurs, LLC",
      stage: "Draft",
      target: "$21.0M",
      committed: "$16.8M",
      funded: "$13.9M",
      barStyle: "width: 66%; height: 100%; background-color: #2e844a; border-radius: 999px;",
      pctStyle: "color: #2e844a; font-size: 0.75rem; font-weight: 600;",
      pctLabel: "66%"
    },
    {
      id: 3,
      name: "Triangle Y-Shops, LP",
      stage: "Signatures Pending",
      target: "$7.5M",
      committed: "$7.0M",
      funded: "$6.5M",
      barStyle: "width: 87%; height: 100%; background-color: #2e844a; border-radius: 999px;",
      pctStyle: "color: #2e844a; font-size: 0.75rem; font-weight: 600;",
      pctLabel: "87%"
    },
    {
      id: 4,
      name: "Pearland Entrepreneurs, LLC",
      stage: "Active Fundraising",
      target: "$4.2M",
      committed: "$3.6M",
      funded: "$3.1M",
      barStyle: "width: 74%; height: 100%; background-color: #2e844a; border-radius: 999px;",
      pctStyle: "color: #2e844a; font-size: 0.75rem; font-weight: 600;",
      pctLabel: "74%"
    },
    {
      id: 5,
      name: "Parkwest Y Shops, LLC",
      stage: "Draft",
      target: "$8.8M",
      committed: "$8.0M",
      funded: "$7.2M",
      barStyle: "width: 82%; height: 100%; background-color: #2e844a; border-radius: 999px;",
      pctStyle: "color: #2e844a; font-size: 0.75rem; font-weight: 600;",
      pctLabel: "82%"
    }
  ];

  connectedCallback() {
    // Show the demo rows immediately; links attach once the Id resolves.
    this.rows = this.buildBaseRows();
  }

  buildBaseRows() {
    return this.offerings.map((row) => ({
      ...row,
      stageVariant: STAGE_VARIANT[row.stage] || "gray"
    }));
  }

  get recordCount() {
    return this.offerings.length;
  }

  get offeringVariables() {
    return { name: TARGET_RECORD_NAME };
  }

  @wire(graphql, {
    query: gql`
      query offeringByName($name: String) {
        uiapi {
          query {
            Unison__Offering__c(where: { Name: { eq: $name } }, first: 1) {
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
    variables: "$offeringVariables"
  })
  wiredOffering({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Unison__Offering__c?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachRecordUrl(edges[0].node.Id);
  }

  async attachRecordUrl(recordId) {
    try {
      const recordUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Unison__Offering__c",
          actionName: "view"
        }
      });
      this.rows = this.buildBaseRows().map((row) => ({ ...row, recordUrl }));
    } catch (error) {
      // Leave rows without links if URL generation fails so the table still renders.
    }
  }

  handleViewAll(event) {
    event.preventDefault();
    // Navigate to the Offering object list page, showing the "All" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Offering__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All_Offerings"
      }
    });
  }
}
