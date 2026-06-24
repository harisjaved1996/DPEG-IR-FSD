import { LightningElement } from "lwc";

// Format as USD with no decimals, e.g. $8,200,000. Rendered as text so both
// the column headers and the values stay left-aligned (currency/number type
// right-aligns both, which can't be overridden cleanly for headers).
const CURRENCY_FMT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0
});

const COLUMNS = [
  { label: "Name", fieldName: "name", type: "text" },
  { label: "Investing Entity", fieldName: "investingEntity", type: "text" },
  { label: "Contribution", fieldName: "contribution", type: "text" },
  { label: "Distribution", fieldName: "distribution", type: "text" }
];

// Demo data — contribution $5M-$9M, distribution $1M-$4M.
const DATA = [
  {
    id: "1",
    name: "Sarah Chen",
    investingEntity: "Riverstone Holdings LLC",
    contribution: 8200000,
    distribution: 3400000
  },
  {
    id: "2",
    name: "James Okafor",
    investingEntity: "Summit Peak Partners",
    contribution: 6750000,
    distribution: 2100000
  },
  {
    id: "3",
    name: "Priya Nair",
    investingEntity: "Blue Harbor Capital",
    contribution: 9000000,
    distribution: 3950000
  },
  {
    id: "4",
    name: "Daniel Vasquez",
    investingEntity: "Oakline Ventures LLC",
    contribution: 5300000,
    distribution: 1250000
  },
  {
    id: "5",
    name: "Mei Tanaka",
    investingEntity: "Crestwood Equity Group",
    contribution: 7400000,
    distribution: 2800000
  }
];

export default class ValuableInvestors extends LightningElement {
  columns = COLUMNS;
  headerIconStyle =
    "--slds-c-icon-color-foreground-default: #5867e8; --sds-c-icon-color-foreground-default: #5867e8;";

  get data() {
    return DATA.map((row) => ({
      ...row,
      contribution: CURRENCY_FMT.format(row.contribution),
      distribution: CURRENCY_FMT.format(row.distribution)
    }));
  }
}
