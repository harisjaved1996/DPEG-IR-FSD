"""
One-off transform: add the org's managed namespace prefix to custom object types
and custom field API names in the IR seed tree files + plan, so `sf data import tree`
works against the namespaced DPEG-IR-FSD scratch org.

- attributes.type ending in __c        -> NS + type
- record keys ending in __c             -> NS + key   (custom fields / relationships)
- plan "sobject" ending in __c          -> NS + sobject
- standard objects/fields, referenceId, and all values are left unchanged.

Idempotent: skips anything already prefixed with NS.
"""
import json, glob, os

DIR = os.path.join(os.path.dirname(__file__), "data", "ir")
NS = "Unison__"


def fix_type(t):
    return NS + t if isinstance(t, str) and t.endswith("__c") and not t.startswith(NS) else t


def fix_record(rec):
    out = {}
    for k, v in rec.items():
        if k == "attributes":
            a = dict(v)
            if "type" in a:
                a["type"] = fix_type(a["type"])
            out[k] = a
        elif k.endswith("__c") and not k.startswith(NS):
            out[NS + k] = v
        else:
            out[k] = v
    return out


changed = []
for path in sorted(glob.glob(os.path.join(DIR, "*.json"))):
    base = os.path.basename(path)
    with open(path, encoding="utf-8") as fh:
        data = json.load(fh)
    if base == "ir-seed-plan.json":
        for step in data:
            step["sobject"] = fix_type(step["sobject"])
    else:
        data["records"] = [fix_record(r) for r in data["records"]]
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
    changed.append(base)

print("Namespaced %d files: %s" % (len(changed), ", ".join(changed)))
