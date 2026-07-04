import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

const ROW_ACTIONS = [
  { label: "Edit", name: "edit" },
  { label: "Delete", name: "delete" }
];

// Prototype: every row links to one real Waitlist / Contact / Investing Entity
// record, looked up at runtime (no hardcoded Id) so it works in any org.
const TARGET_CONTACT_LAST_NAME = "Greentree";
const TARGET_INVESTING_ENTITY_NAME = "Greentree LLC";

const COLUMNS = [
  {
    label: "Waitlist Number",
    fieldName: "waitlistUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "waitlistNumber" }, target: "_self" }
  },
  {
    label: "Contact",
    fieldName: "contactUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "contact" }, target: "_self" }
  },
  {
    label: "Investing Entity",
    fieldName: "investingEntityUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "investingEntity" }, target: "_self" }
  },
  {
    label: "Share Count",
    fieldName: "shareCount",
    type: "number",
    cellAttributes: { alignment: "left" }
  },
  { label: "Amount", fieldName: "amount", type: "text" },
  { label: "Date", fieldName: "date", type: "text" },
  { type: "action", typeAttributes: { rowActions: ROW_ACTIONS } }
];

const DATA = [
  {
    id: "1",
    waitlistNumber: "WL-001",
    contact: "K. Mehta",
    investingEntity: "24 Seven REH, LLC",
    shareCount: 2,
    amount: "$250,000.00",
    date: "14/11/2025"
  },
  {
    id: "2",
    waitlistNumber: "WL-002",
    contact: "Albert Stein",
    investingEntity: "5As Capital Group LLC",
    shareCount: 3,
    amount: "$400,000.00",
    date: "02/12/2025"
  },
  {
    id: "3",
    waitlistNumber: "WL-003",
    contact: "L. Brooks",
    investingEntity: "18825 Sea, LLC",
    shareCount: 1,
    amount: "$320,000.00",
    date: "27/10/2025"
  }
];

export default class WaitlistOfferingCom extends NavigationMixin(LightningElement) {
  columns = COLUMNS;

  // Generated at runtime from the resolved record Ids; every row links here.
  waitlistUrl;
  contactUrl;
  investingEntityUrl;

  get data() {
    return DATA.map((row) => ({
      ...row,
      waitlistUrl: this.waitlistUrl,
      contactUrl: this.contactUrl,
      investingEntityUrl: this.investingEntityUrl
    }));
  }

  get recordCount() {
    return this.data.length;
  }

  handleNew() {
    // Placeholder for the New action.
  }

  handleViewAll(event) {
    event.preventDefault();
    // Navigate to the Waitlist object list page, showing the "All" list view.
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Unison__Waitlist__c",
        actionName: "list"
      },
      state: {
        filterName: "Unison__All"
      }
    });
  }

  handleRowAction(event) {
    const { name } = event.detail.action;
    const { contact } = event.detail.row;
    // Placeholder: handle `name` (edit/delete) for `contact`.
    return { name, contact };
  }

  get contactVariables() {
    return { lastName: TARGET_CONTACT_LAST_NAME };
  }

  get investingEntityVariables() {
    return { name: TARGET_INVESTING_ENTITY_NAME };
  }

  @wire(graphql, {
    query: gql`
      query firstWaitlist {
        uiapi {
          query {
            Unison__Waitlist__c(first: 1) {
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
  wiredWaitlist({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Unison__Waitlist__c?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachWaitlistUrl(edges[0].node.Id);
  }

  @wire(graphql, {
    query: gql`
      query contactByLastName($lastName: String) {
        uiapi {
          query {
            Contact(where: { LastName: { eq: $lastName } }, first: 1) {
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
    variables: "$contactVariables"
  })
  wiredContact({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Contact?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachContactUrl(edges[0].node.Id);
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

  async attachWaitlistUrl(recordId) {
    try {
      this.waitlistUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Unison__Waitlist__c",
          actionName: "view"
        }
      });
    } catch (error) {
      // Leave rows without links if URL generation fails so the table still renders.
    }
  }

  async attachContactUrl(recordId) {
    try {
      this.contactUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Contact",
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
}
