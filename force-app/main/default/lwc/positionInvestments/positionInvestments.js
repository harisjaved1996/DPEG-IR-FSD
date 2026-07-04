import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

// Prototype: every row links to one real Investing Entity record, looked up by
// Name at runtime (no hardcoded Id) so it works in any org.
const TARGET_INVESTING_ENTITY_NAME = "Greentree LLC";

const COLUMNS = [
  {
    label: "Position Number",
    fieldName: "positionUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "positionNumber" }, target: "_blank" },
    sortable: true
  },
  {
    label: "Investing Entity",
    fieldName: "entityUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "entity" }, target: "_blank" },
    sortable: true
  },
  { label: "Ownership", fieldName: "ownership", type: "text", sortable: true },
  { label: "Contributed", fieldName: "contributed", type: "text", sortable: true },
  { label: "Distributed", fieldName: "distributed", type: "text", sortable: true }
];

const DATA = [
  {
    id: "1",
    positionNumber: "POS-1001",
    entity: "1988 Venture LLC",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "2",
    positionNumber: "POS-1002",
    entity: "3D Way, LLC",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "3",
    positionNumber: "POS-1003",
    entity: "5As Capital Group LLC",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "4",
    positionNumber: "POS-1004",
    entity: "A&S Meghjiani Investments, LLC",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "5",
    positionNumber: "POS-1005",
    entity: "Aamir Pirani and Nisha Pirani",
    ownership: "0.2000%",
    contributed: "$100,000.00",
    distributed: "$4,999.98"
  },
  {
    id: "6",
    positionNumber: "POS-1006",
    entity: "AANA LLC",
    ownership: "0.1000%",
    contributed: "$50,000.00",
    distributed: "$2,500.02"
  }
];

export default class PositionInvestments extends NavigationMixin(LightningElement) {
  columns = COLUMNS;
  data = DATA.map((row) => ({ ...row }));
  sortedBy = "entityUrl";
  sortedDirection = "asc";

  // Generated at runtime from the resolved record Ids; every row links here.
  positionUrl;
  entityUrl;

  get recordCount() {
    return this.data.length;
  }

  get entityVariables() {
    return { name: TARGET_INVESTING_ENTITY_NAME };
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
      this.data = this.data.map((row) => ({ ...row, positionUrl: this.positionUrl }));
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
      this.data = this.data.map((row) => ({ ...row, entityUrl: this.entityUrl }));
    } catch (error) {
      // Leave rows without links if URL generation fails so the table still renders.
    }
  }

  handleSort(event) {
    const { fieldName, sortDirection } = event.detail;
    let key = fieldName;
    if (fieldName === "entityUrl") {
      key = "entity";
    } else if (fieldName === "positionUrl") {
      key = "positionNumber";
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

  handleNew() {
    // Placeholder for the New action.
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
