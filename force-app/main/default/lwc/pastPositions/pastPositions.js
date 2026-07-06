import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

// Prototype: every entity link resolves to one real Investing Entity record,
// looked up by Name at runtime (no hardcoded Id) so it works in any org.
const TARGET_INVESTING_ENTITY_NAME = "Greentree LLC";

const COLUMNS = [
  {
    label: "Transferred From",
    fieldName: "fromUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "transferredFrom" }, target: "_blank" },
    sortable: true
  },
  {
    label: "Transferred To",
    fieldName: "toUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "transferredTo" }, target: "_blank" },
    sortable: true
  },
  { label: "Ownership", fieldName: "ownership", type: "text", sortable: true },
  { label: "Reason for Change", fieldName: "reason", type: "text", sortable: true },
  { label: "Date", fieldName: "changeDate", type: "text", sortable: true }
];

const DATA = [
  {
    id: "1",
    transferredFrom: "Silver Birch Partners LLC",
    transferredTo: "Kalani Holdings, LLC",
    ownership: "1.2000%",
    reason: "Share transfer",
    changeDate: "4/28/2026"
  },
  {
    id: "2",
    transferredFrom: "Lifecare Primary Medical PLLC",
    transferredTo: "SS Premier Realty LLC",
    ownership: "2.0000%",
    reason: "Ownership restructure",
    changeDate: "4/26/2026"
  },
  {
    id: "3",
    transferredFrom: "Jasmin Nathani",
    transferredTo: "Nathani Family Investments LLC",
    ownership: "1.6000%",
    reason: "Family trust rollover",
    changeDate: "4/14/2026"
  },
  {
    id: "4",
    transferredFrom: "Pickford Square Capital LLC",
    transferredTo: "Nooruddin and Dilshad Rowzani",
    ownership: "2.4000%",
    reason: "Partial exit",
    changeDate: "3/30/2026"
  },
  {
    id: "5",
    transferredFrom: "Asif Noorani",
    transferredTo: "Noorani Investments LLC",
    ownership: "2.8000%",
    reason: "Entity consolidation",
    changeDate: "1/12/2026"
  },
  {
    id: "6",
    transferredFrom: "MacGregor Entrepreneurs, LLC",
    transferredTo: "MacGregor Retail, LLC",
    ownership: "1.4000%",
    reason: "Buyout",
    changeDate: "12/15/2025"
  }
];

export default class PastPositions extends NavigationMixin(LightningElement) {
  columns = COLUMNS;
  data = DATA.map((row) => ({ ...row }));
  sortedBy = "changeDate";
  sortedDirection = "desc";

  // Generated at runtime from the resolved Investing Entity Id; every row links here.
  entityUrl;

  get recordCount() {
    return this.data.length;
  }

  get entityVariables() {
    return { name: TARGET_INVESTING_ENTITY_NAME };
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
      this.data = this.data.map((row) => ({
        ...row,
        fromUrl: this.entityUrl,
        toUrl: this.entityUrl
      }));
    } catch (error) {
      // Leave rows without links if URL generation fails so the table still renders.
    }
  }

  handleSort(event) {
    const { fieldName, sortDirection } = event.detail;
    let key = fieldName;
    if (fieldName === "fromUrl") {
      key = "transferredFrom";
    } else if (fieldName === "toUrl") {
      key = "transferredTo";
    }
    const sorted = [...this.data];
    sorted.sort((a, b) => {
      const x = (a[key] || "").toString();
      const y = (b[key] || "").toString();
      const result = x.localeCompare(y, undefined, { numeric: true });
      return sortDirection === "asc" ? result : -result;
    });
    this.data = sorted;
    this.sortedBy = fieldName;
    this.sortedDirection = sortDirection;
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
