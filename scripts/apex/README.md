# Anonymous Apex scripts

Throwaway, non-deployable Apex snippets for manual/admin tasks. Excluded from deploy via `.forceignore`.

## Running

```bash
sf apex run --file scripts/apex/<script>.apex
```

## Conventions

- **Scratch / sandbox only** — add a guard at the top of any destructive script (see `cleanup-test-data.apex`).
- **No secrets** — these scripts are checked in. Use Named Credentials or Custom Metadata for anything sensitive.
- **Idempotent where possible** — safe to re-run.
- **One concern per script** — name the file after what it does (`backfill-<field>.apex`, `repro-<bug-id>.apex`, etc.).

## Current scripts

| Script | Purpose |
|---|---|
| `hello.apex` | Prints the current org id + running user. Sanity check for CLI auth. |
| `cleanup-test-data.apex` | Deletes records created by `TestDataFactory` (matches `@dpeg.test.invalid` email domain). Refuses to run outside scratch/sandbox. |
