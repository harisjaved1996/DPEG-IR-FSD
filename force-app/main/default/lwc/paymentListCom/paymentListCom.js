import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

const COLUMNS = [
  {
    label: "Account Nickname",
    fieldName: "nicknameUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "nickname" }, target: "_blank" }
  },
  { label: "Bank Name", fieldName: "institution", type: "text" },
  { label: "Routing #", fieldName: "routing", type: "text" },
  { label: "Account #", fieldName: "accountNumber", type: "text" },
  { label: "Linked Investments", fieldName: "linkedInvestment", type: "text" },
  { label: "Entity Name", fieldName: "entityName", type: "text" }
];

// Prototype: every row links to this one real Bank Account record, looked up by
// Name at runtime (no hardcoded Id) so it works in any org.
const TARGET_BANK_ACCOUNT_NAME = "Checking 9880";

export default class PaymentListCom extends NavigationMixin(LightningElement) {
  columns = COLUMNS;

  accounts = [
    {
      id: 1,
      nickname: "Checking …9880",
      bankDescription: "TRIANGLE Y SHOPS",
      institution: "Community Bank Of Texas NA",
      routing: "113111983",
      accountNumber: "…9880",
      accountType: "Business Checking",
      linkedInvestment: "Triangle Y-Shops, LP",
      entityName: "Triangle Y-Shops, LP",
      entityAddress: "11333 Fountain Lake Dr, Stafford, TX",
      balance: "$12.5M"
    },
    {
      id: 2,
      nickname: "Checking …9079",
      bankDescription: "ANSERA DEV",
      institution: "Simmons Bank",
      routing: "082900432",
      accountNumber: "…9079",
      accountType: "Business Checking",
      linkedInvestment: "Ansera Developers, LP",
      entityName: "Ansera Developers LP",
      entityAddress: "11333 Fountain Lake Dr, Stafford, TX",
      balance: "$20M"
    },
    {
      id: 3,
      nickname: "Checking …5177",
      bankDescription: "VICKSBURG",
      institution: "Community Bank Of Texas NA",
      routing: "113111983",
      accountNumber: "…5177",
      accountType: "Business Checking",
      linkedInvestment: "DPEG Vicksburg, LP",
      entityName: "DPEG Vicksburg, LP",
      entityAddress: "11333 Fountain Lake Dr, Stafford, TX",
      balance: "$8.4M"
    },
    {
      id: 4,
      nickname: "Checking …7503",
      bankDescription: "HWY 6 Y SHOPS",
      institution: "Wells Fargo",
      routing: "121000248",
      accountNumber: "…7503",
      accountType: "Business Checking",
      linkedInvestment: "Highway 6 Y-Shops LLC",
      entityName: "Hwy 6-Yshops LLC",
      entityAddress: "11333 Fountain Lake Dr, Stafford, TX",
      balance: "$15.2M"
    },
    {
      id: 5,
      nickname: "Checking …4839",
      bankDescription: "PEARLAND ENT",
      institution: "Community Bank Of Texas NA",
      routing: "113111983",
      accountNumber: "…4839",
      accountType: "Business Checking",
      linkedInvestment: "Pearland Entrepreneurs, LLC",
      entityName: "Pearland Entrepreneurs, LLC",
      entityAddress: "11333 Fountain Lake Dr, Stafford, TX",
      balance: "$1.5M"
    },
    {
      id: 6,
      nickname: "Checking …4169",
      bankDescription: "PARKWEST Y SHOPS",
      institution: "Community Bank Of Texas NA",
      routing: "113111983",
      accountNumber: "…4169",
      accountType: "Business Checking",
      linkedInvestment: "Parkwest Y Shops, LLC",
      entityName: "Parkwest Y Shops, LLC",
      entityAddress: "11333 Fountain Lake Dr, Stafford, TX",
      balance: "$9.8M"
    },
    {
      id: 7,
      nickname: "Checking …5979",
      bankDescription: "10 KATY DEV",
      institution: "Community Bank Of Texas NA",
      routing: "113111983",
      accountNumber: "…5979",
      accountType: "Business Checking",
      linkedInvestment: "10 Katy Developers LLC",
      entityName: "10 Katy Developers LLC",
      entityAddress: "11333 Fountain Lake Dr, Stafford, TX",
      balance: "$6.7M"
    },
    {
      id: 8,
      nickname: "Checking …0043",
      bankDescription: "249 JONES LLC",
      institution: "American Bank",
      routing: "114903284",
      accountNumber: "…0043",
      accountType: "Business Checking",
      linkedInvestment: "249 Jones Entrepreneurs, LLC",
      entityName: "249 Jones Entrepreneurs, LLC",
      entityAddress: "11333 Fountain Lake Dr, Stafford, TX",
      balance: "$3.2M"
    },
    {
      id: 9,
      nickname: "Checking …9476",
      bankDescription: "B CENTRE ENT",
      institution: "Allegiance Bank",
      routing: "113025723",
      accountNumber: "…9476",
      accountType: "Business Checking",
      linkedInvestment: "B Centre Entrepreneurs, LLC",
      entityName: "B Centre Entrepreneurs, LLC",
      entityAddress: "11333 Fountain Lake Dr, Stafford, TX",
      balance: "$4.6M"
    },
    {
      id: 10,
      nickname: "Checking …1749",
      bankDescription: "CAVALCADE 59 DEV",
      institution: "Origin Bank",
      routing: "111102758",
      accountNumber: "…1749",
      accountType: "Business Checking",
      linkedInvestment: "Cavalcade 59 Developers LLC",
      entityName: "Cavalcade 59 Developers, LLC",
      entityAddress: "11333 Fountain Lake Dr, Stafford, TX",
      balance: "$11.3M"
    }
  ];

  // Generated at runtime from the resolved Bank Account Id; every row links here.
  nicknameUrl;

  get rows() {
    return this.accounts.map((account) => ({
      ...account,
      nicknameUrl: this.nicknameUrl
    }));
  }

  get bankAccountVariables() {
    return { name: TARGET_BANK_ACCOUNT_NAME };
  }

  @wire(graphql, {
    query: gql`
      query bankAccountByName($name: String) {
        uiapi {
          query {
            Unison__Bank_Account__c(where: { Name: { eq: $name } }, first: 1) {
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
    variables: "$bankAccountVariables"
  })
  wiredBankAccount({ data, errors }) {
    if (errors || !data) {
      return;
    }
    const edges = data?.uiapi?.query?.Unison__Bank_Account__c?.edges;
    if (!edges || !edges.length) {
      return;
    }
    this.attachRecordUrl(edges[0].node.Id);
  }

  async attachRecordUrl(recordId) {
    try {
      this.nicknameUrl = await this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId,
          objectApiName: "Unison__Bank_Account__c",
          actionName: "view"
        }
      });
    } catch (error) {
      // Leave rows without links if URL generation fails so the table still renders.
    }
  }
}
