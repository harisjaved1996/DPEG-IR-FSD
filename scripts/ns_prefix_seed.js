/*
 * One-off transform: add the org's managed namespace prefix (Unison__) to custom
 * object types and custom field API names in the IR seed tree files + plan, so
 * `sf data import tree` works against the namespaced DPEG-IR-FSD scratch org.
 *
 *  - attributes.type ending in __c   -> NS + type
 *  - record keys ending in __c       -> NS + key (custom fields / relationships)
 *  - plan "sobject" ending in __c    -> NS + sobject
 *  - standard objects/fields, referenceId, and all values are left unchanged.
 * Idempotent: skips anything already prefixed with NS.
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "data", "ir");
const NS = "Unison__";

const fixType = (t) =>
  typeof t === "string" && t.endsWith("__c") && !t.startsWith(NS) ? NS + t : t;

function fixRecord(rec) {
  const out = {};
  for (const [k, v] of Object.entries(rec)) {
    if (k === "attributes") {
      const a = { ...v };
      if (a.type) a.type = fixType(a.type);
      out[k] = a;
    } else if (k.endsWith("__c") && !k.startsWith(NS)) {
      out[NS + k] = v;
    } else {
      out[k] = v;
    }
  }
  return out;
}

const changed = [];
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".json")).sort()) {
  const p = path.join(DIR, file);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  if (file === "ir-seed-plan.json") {
    for (const step of data) step.sobject = fixType(step.sobject);
  } else {
    data.records = data.records.map(fixRecord);
  }
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
  changed.push(file);
}
console.log(`Namespaced ${changed.length} files: ${changed.join(", ")}`);
