# Compliance: review and publish guides

Rules: `ops/agents/_common.md`, `ops/agents/writing-rules.md`. You did not write these drafts; review them as an independent editor.

Each run:

1. For every draft in `src/content/drafts/` whose queue status is `in-review` (and any queue item marked `in-review` with HELD notes):
   - Open the key sources with WebFetch and check every number, date and rule against them. Spot-check at least five claims; check all claims in tables.
   - Check the banned claims list, copied wording (more than one short quote per source), em dashes, the 1,200 to 2,000 word range, and that the writer's own estimates or reasoning are labeled as such.
   - Fix small problems yourself. For anything you can't verify, soften or remove it.
   - Decide: **publish** (move the file to `src/content/articles/`, set the queue status to `published`) or **return** (leave it in drafts, set status `returned`). Log the decision and every change or reason in `ops/compliance-log.md`, newest first.
2. Each run (you run once a week, on Mondays), audit one published article that hasn't been reviewed in 90 days: recheck its sources and update facts or the `updated` date as needed.
3. Legal-status content (raw milk) needs every disputed state confirmed against a dated primary source before publishing.
4. **Independent farm re-check (every run).** You did not create these listings; check them as an outsider.
   - Pick every farm whose `last_verified_at` changed since your last run (new or re-verified listings), plus 3 random published farms not checked in the last 60 days.
   - For each, open the farm's own website with WebFetch (the homepage, the shop or products page, and any page named in a `source_url`). Do not read the listing's notes first; write down what the site says, then compare.
   - Check: the feeding label (does the quoted sentence exist, and does the site sell a grain-finished line too, which makes it `both`?); every species and product (is it raised by this farm, or resold, which belongs in `resold_note`?); sold-out or paused status; shipping states, delivery areas and pickup points; bulk shares; phone and town.
   - Fix clear errors from the site's own words and set `last_verified_at` to today. If the feeding claim can't be found at all, set `listing_status` to `unpublished` and add a lead in `ops/leads.md` for the verifier.
   - Never add, remove or change `certifications`; note any doubt in the log for a human.
   - Log each farm checked in `ops/compliance-log.md` under a "Farm re-check" heading: accurate, or the fields changed. If more than 1 in 5 checked farms needs a label change, add a HIGH note to `ops/site-backlog.md` so the verifier rules get reviewed.
5. **Google rating matches (every run).** `data/ratings/google.json` is filled weekly by a GitHub Action. For every entry with `"status": "pending"`:
   - Compare the Google place (`place_name`, `place_address`) with the farm file (name, city, address, phone, website). Open the farm's own website if needed: a farm store or ranch address on the site should match.
   - Same business: set `"status": "confirmed"` and add `"confirmed_note"` (one line: what matched, for example "name and Gill, CO ranch address match the farm's contact page"). Different business, a store that resells the farm's meat, or not sure: set `"status": "rejected"` with a `"confirmed_note"` saying why. When in doubt, reject; a missing rating is better than another business's rating.
   - Never edit `rating`, `count`, `maps_uri` or `fetched_at`, and never add a place yourself.
   - Log the count confirmed and rejected in `ops/compliance-log.md`.
6. Follow the finishing steps.
