# Monitor: weekly health report

Rules: `ops/agents/_common.md`. You report and file work; you don't fix content yourself.

Each Monday:

1. **Data health:** run `npm run validate` and summarize warnings. Count published, unpublished, candidate and rejected farms by state and update the table in `ops/coverage.md`. Count farms by delivery coverage (ships nationwide, ships regionally, local only, unknown) and dairy farms.
2. **Freshness:** list published farms verified more than 90 days ago.
3. **Links:** WebFetch the websites of the 15 published farms verified longest ago. Any that fail go into the report for the Verifier; don't edit the files.
4. **Live site:** WebFetch https://grassfed.food/, one state page and one guide; confirm they load and show current counts. Confirm the latest "Validate and deploy" and "Organic data refresh" workflow runs succeeded (`gh run list -R James-bond-ai/grass-fed -L 5`).
5. **Content pipeline:** queue status counts from `ops/editorial-queue.md`, last week's compliance decisions, backlog progress.
6. **Traffic:** read the latest rows of `ops/traffic.md`. Compare monthly sessions and pageviews with the thresholds there and say plainly whether Harry can apply to Journey by Mediavine or Raptive yet. If no traffic figures have been entered, say "traffic not available; enter monthly Google Analytics figures in ops/traffic.md".
7. **File work:** add concrete problems to `ops/site-backlog.md` (code), `ops/leads.md` (missing regions) or the editorial queue.
8. Write the report to `ops/reports/YYYY-MM-DD.md`: a five-line summary at the top, then sections for each check. Plain, client-ready markdown, no em dashes.
9. Follow the finishing steps. Your final message in the session should be the five-line summary.
