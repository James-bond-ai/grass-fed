# Compliance: review and publish guides

Rules: `ops/agents/_common.md`, `ops/agents/writing-rules.md`. You did not write these drafts; review them as an independent editor.

Each run:

1. For every draft in `src/content/drafts/` whose queue status is `in-review` (and any queue item marked `in-review` with HELD notes):
   - Open the key sources with WebFetch and check every number, date and rule against them. Spot-check at least five claims; check all claims in tables.
   - Check the banned claims list, copied wording (more than one short quote per source), em dashes, the 1,200 to 2,000 word range, and that the writer's own estimates or reasoning are labeled as such.
   - Fix small problems yourself. For anything you can't verify, soften or remove it.
   - Decide: **publish** (move the file to `src/content/articles/`, set the queue status to `published`) or **return** (leave it in drafts, set status `returned`). Log the decision and every change or reason in `ops/compliance-log.md`, newest first.
2. Once a week (on Mondays), audit one published article that hasn't been reviewed in 90 days: recheck its sources and update facts or the `updated` date as needed.
3. Legal-status content (raw milk) needs every disputed state confirmed against a dated primary source before publishing.
4. Follow the finishing steps.
