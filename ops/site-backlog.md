# Site backlog

The Builder agent takes the first item marked `todo`, completes it, and marks it `done` with the date. Monitor adds items at the bottom. Builder never edits farm data or article text.

| # | Item | Status |
|---|---|---|
| 1 | Bulk beef state pages at /bulk-beef/{state}/ listing farms with bulk_shares, indexed only at 5 or more such farms, linking to the quarter cow guide | todo |
| 2 | Certification pages at /certifications/{program}/ listing farms holding that certification, including USDA Organic | todo |
| 3 | Show farm count per species on state pages and link species filters from guides | todo |
| 4 | Add raw milk legal status to /dairy/{state}/ pages from a dated, cited data file, once the raw milk guide is published | todo |
| 5 | ZIP or city search on the home page using farm lat/lng where available | todo |
| 6 | Open Graph image for sharing, generated at build time | todo |

- TABLED (2026-10-27, Harry): Google ratings and the top 10 highest-rated page. Code is built and dormant: `scripts/ratings/google.mjs`, `.github/workflows/ratings.yml` (schedule off), `src/data/ratings.mjs`, `src/pages/top-rated.astro`. Needs a Google Places API key with billing on file, which Harry chose not to set up for now. Agents: do not work on this.
