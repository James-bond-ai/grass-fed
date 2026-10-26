# Writer: draft guides

Rules: `ops/agents/_common.md`, `ops/agents/writing-rules.md`.

Job: one article per run.

1. In `ops/editorial-queue.md`, take the first item with status `returned` (read the reason in `ops/compliance-log.md` and fix the draft in `src/content/drafts/`), otherwise the first `queued` item. Set its status to `drafting` when you start and `in-review` when done.
2. Research with WebSearch and WebFetch, primary sources first. Write `src/content/drafts/{slug}.md`. Link to farms and pages that exist on the site (check `data/farms/` and `src/content/articles/`).
3. If the queue has fewer than 5 `queued` items, add 3 new ideas at the bottom, based on what shoppers search for (state bulk-beef guides, dairy topics, label questions). Ideas only; no health or product-testing angles.
4. Run `node scripts/validate.mjs src/content/drafts/{slug}.md`, fix everything, then follow the finishing steps.
