import { LightningElement } from "lwc";

export default class PropertyDetailCard extends LightningElement {
  details = [
    { key: "name", label: "Name", value: "DPEG Vicksburg, LP" },
    { key: "acquisitionDate", label: "Acquisition Date", value: "9/15/25" },
    { key: "assetType", label: "Asset Type", value: "Retail" },
    {
      key: "address",
      label: "Address",
      value: "1420 Heights Blvd, Houston, TX 77008, USA"
    },
    { key: "totalUnits", label: "Total Units", value: "116" },
    { key: "squareFeet", label: "Square Feet", value: "635,325" },
    { key: "rentableSf", label: "Rentable SF", value: "635,325" },
    { key: "landAcres", label: "Land Acres", value: "45.75" }
  ];
}
