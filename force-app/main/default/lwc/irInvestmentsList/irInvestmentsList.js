import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

// Prototype: every row links to this one real Investment record, looked up by
// Name at runtime (no hardcoded Id) so it works in any org.
const TARGET_RECORD_NAME = "DPEG Vicksburg, LP";

const COLUMNS = [
  {
    label: "Name",
    fieldName: "recordUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "name" }, target: "_self" }
  },
  { label: "Committed", fieldName: "committed", type: "text" },
  { label: "Contributed", fieldName: "contributed", type: "text" },
  { label: "Distributed", fieldName: "distributed", type: "text" },
  { label: "Target IRR", fieldName: "targetIrr", type: "text" },
  { label: "Investment Period", fieldName: "holdPeriod", type: "text" }
];

export default class IrInvestmentsList extends NavigationMixin(LightningElement) {
  columns = COLUMNS;
  rows = [];

  investments = [
    {
      id: 1,
      name: "Global Zante, LLC",
      committed: "$1.3M",
      contributed: "$1.9M",
      distributed: "$450K",
      targetIrr: "12%",
      holdPeriod: "3 Years"
    },
    {
      id: 2,
      name: "FX Series Fund 1, LP",
      committed: "$12.0M",
      contributed: "$12.0M",
      distributed: "$20.5M",
      targetIrr: "15%",
      holdPeriod: "5 Years"
    },
    {
      id: 3,
      name: "Fuqua Park Row, LLC",
      committed: "$5.0M",
      contributed: "$5.0M",
      distributed: "—",
      targetIrr: "13%",
      holdPeriod: "4 Years"
    },
    {
      id: 4,
      name: "Falvel Apartments, LLC",
      committed: "$3.7M",
      contributed: "$4.0M",
      distributed: "$5.5M",
      targetIrr: "16%",
      holdPeriod: "5 Years"
    },
    {
      id: 5,
      name: "DPEG Zarzamora, LLC",
      committed: "$7.4M",
      contributed: "$7.4M",
      distributed: "$1.5M",
      targetIrr: "11%",
      holdPeriod: "3 Years"
    }
  ];

  connectedCallback() {
    // Show the demo rows immediately; links attach once the Id resolves.
    this.rows = this.buildBaseRows();
  }

  buildBaseRows() {
    return this.investments.map((row) => ({ ...row }));
  }

  get recordCount() {
    return this.investments.length;
  }

  get investmentVariables() {
    return { name: TARGET_RECORD_NAME };
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
    this.attachRecordUrl(edges[0].node.Id);
  }

  async attachRecordUrl(recordId) {
    try {
      const recordUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Unison__Investment__c",
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
