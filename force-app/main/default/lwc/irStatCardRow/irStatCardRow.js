import { LightningElement } from "lwc";

/**
 * irStatCardRow
 *
 * Container that renders a horizontal row of four KPI tiles (`c-kpi-card`)
 * summarizing an investor's headline stats: total commitments, lifetime
 * invested, active positions, and investing entities.
 *
 * The four values are static (no Apex, wire, or LDS) — this component is a
 * presentation container that holds its own display data and delegates each
 * tile's rendering to the purely presentational `c-kpi-card` child.
 */
export default class IrStatCardRow extends LightningElement {
  stats = [
    { key: "1", value: "6", label: "TOTAL COMMITMENTS", valueColor: "" },
    { key: "2", value: "$980K", label: "LIFETIME INVESTED", valueColor: "green" },
    { key: "3", value: "2", label: "ACTIVE POSITIONS", valueColor: "" },
    { key: "4", value: "1", label: "INVESTING ENTITIES", valueColor: "" }
  ];
}
