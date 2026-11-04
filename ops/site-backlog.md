# Site backlog

The Builder agent takes the first item marked `todo`, completes it, and marks it `done` with the date. Monitor adds items at the bottom. Builder never edits farm data or article text.

| # | Item | Status |
|---|---|---|
| 1 | Bulk beef state pages at /bulk-beef/{state}/ listing farms with bulk_shares, indexed only at 5 or more such farms, linking to the quarter cow guide | done 2026-10-28 |
| 2 | Certification pages at /certifications/{program}/ listing farms holding that certification, including USDA Organic | done 2026-10-30 |
| 3 | Show farm count per species on state pages and link species filters from guides | done 2026-10-30 |
| 4 | Add raw milk legal status to /dairy/{state}/ pages from a dated, cited data file, once the raw milk guide is published | done 2026-11-04 |
| 5 | ZIP or city search on the home page using farm lat/lng where available | todo |
| 6 | Open Graph image for sharing, generated at build time | done 2026-10-30 |
| 7 | Farm matcher in the home page hero: three questions (state, product, how to buy) rank farms in the browser from /match.json and show the best four with a link to order from each farm. Built from `src/components/Hero.astro` and `src/data/match.mjs`; GA4 events farm_match, farm_match_submit, farm_match_order_click, farm_match_details_click | done 2026-10-30 |
| 8 | Organic data refresh workflow (`.github/workflows/organic-data.yml`): both runs so far (2026-10-26, push-triggered setup runs) ended in failure, and run 2 force-pushed `node_modules/`, `out/` and a 74.9 MB `snapshot-click.xlsx` to the `organic-data` branch. First scheduled run is 2026-11-03 14:17 UTC. Check that run; if it fails, fix the workflow and keep `node_modules` and the raw xlsx out of the data branch. Agents may not edit `.github/`, so this needs Harry or a manual session. (Monitor 2026-11-02) | needs Harry |

- TABLED (2026-10-27, Harry): Google ratings and the top 10 highest-rated page. Code is built and dormant: `scripts/ratings/google.mjs`, `.github/workflows/ratings.yml` (schedule off), `src/data/ratings.mjs`, `src/pages/top-rated.astro`. Needs a Google Places API key with billing on file, which Harry chose not to set up for now. Agents: do not work on this.
