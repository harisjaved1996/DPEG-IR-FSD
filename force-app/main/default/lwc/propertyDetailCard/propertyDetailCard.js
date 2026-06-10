import { LightningElement } from "lwc";

export default class PropertyDetailCard extends LightningElement {
  details = [
    { key: "assetClass", label: "Asset class", value: "Multifamily" },
    { key: "unitsLocations", label: "Units / locations", value: "248" },
    { key: "rentableSqFt", label: "Rentable sq ft", value: "192,400" },
    { key: "yearBuilt", label: "Year built", value: "1987" },
    { key: "lastRenovation", label: "Last renovation", value: "2019" }
  ];
}
