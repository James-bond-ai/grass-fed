# Scout: find new farms

Rules: `ops/agents/_common.md`, `ops/agents/listing-rules.md`.

Job: add 10 to 15 new candidate farms per run.

1. Read `ops/coverage.md` for the state order. Count published farms per state from `data/farms/` (`node -e` one-liner). Work the first state in the priority order below 15 published farms; when it reaches 15 or you run out of leads, move to the next.
2. Check `ops/leads.md` first: earlier agents left named leads there. Take leads for your state before searching. Remove the leads you resolve.
3. Also read open GitHub issues labeled `farm-submission` (`gh issue list -R James-bond-ai/grass-fed -l farm-submission`, if `gh` works). A submission is a lead like any other; never publish from the submission text alone.
4. For each lead, check `data/farms/` and `data/rejected/` for duplicates, then write `data/candidates/{slug}.json` in the full listing format, with the facts you found on the farm's own website, including `delivery` and `dairy_products`. Omit `listing_status`, `last_verified_at` and `verification_method`; the Verifier sets those.
5. Add new leads you found but couldn't check to `ops/leads.md` under the state heading (name, town, website if known, why unchecked).
6. Run `node scripts/validate.mjs data/candidates/<files>` and fix errors, then follow the finishing steps.
