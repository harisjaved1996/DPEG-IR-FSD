import { LightningElement } from "lwc";

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

export default class PaymentListCom extends LightningElement {
  columns = COLUMNS;

  accounts = [
    {
      id: 1,
      nickname: "Checking …9880",
      nicknameUrl: "/lightning/r/Unison__Bank_Account__c/a0NFW001MYm8JM42YM/view",
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
      nicknameUrl: "/lightning/r/Unison__Bank_Account__c/a0NFW001MYm8JM42YM/view",
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
      nicknameUrl: "/lightning/r/Unison__Bank_Account__c/a0NFW001MYm8JM42YM/view",
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
      nicknameUrl: "/lightning/r/Unison__Bank_Account__c/a0NFW001MYm8JM42YM/view",
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
      nicknameUrl: "/lightning/r/Unison__Bank_Account__c/a0NFW001MYm8JM42YM/view",
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
      nicknameUrl: "/lightning/r/Unison__Bank_Account__c/a0NFW001MYm8JM42YM/view",
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
      nicknameUrl: "/lightning/r/Unison__Bank_Account__c/a0NFW001MYm8JM42YM/view",
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
      nicknameUrl: "/lightning/r/Unison__Bank_Account__c/a0NFW001MYm8JM42YM/view",
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
      nicknameUrl: "/lightning/r/Unison__Bank_Account__c/a0NFW001MYm8JM42YM/view",
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
      nicknameUrl: "/lightning/r/Unison__Bank_Account__c/a0NFW001MYm8JM42YM/view",
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

  get rows() {
    return this.accounts;
  }
}
