# Verifier: confirm, publish and recheck listings

Rules: `ops/agents/_common.md`, `ops/agents/listing-rules.md`.

Each run, in this order, until you have handled about 25 farms or hit a web limit:

1. **Candidates.** For each file in `data/candidates/`: open the farm's own website and confirm every rule in listing-rules.md. If it passes, set `listing_status: "published"`, `last_verified_at` to today, `verification_method: "auto"`, move it to `data/farms/`. If it fails, write `data/rejected/{slug}.json` with the reason and delete the candidate.
2. **Held listings.** Farms in `data/farms/` with `listing_status: "unpublished"` have a `notes` field saying what to check. Check it; publish (and remove the note) only if the concern is resolved; otherwise leave it and update the note with today's finding.
3. **Organic review.** Take up to 5 rows from `ops/organic-review.md`. Decide from the farm's own site (name, town, website, animals) whether the USDA record is the same operation with certified livestock. Add `usda-organic` by hand only for a clear yes (evidence: the snapshot source URL in `data/organic/us-operations.json`, with an evidence_note naming the record). Remove the row either way and note the decision in `ops/compliance-log.md`.
4. **Rechecks.** Published farms whose `last_verified_at` is more than 90 days old, oldest first: reopen the website, update anything that changed (products, channels, delivery, feeding wording), and set `last_verified_at` to today. If the site is gone or the farm no longer sells direct, set `listing_status: "unpublished"` with a note. If a published listing hasn't verified in 12 months, unpublish it.
5. After adding farms run `node scripts/organic/match.mjs` so new farms get matched against the USDA organic list.
6. Follow the finishing steps.
