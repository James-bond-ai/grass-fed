# Editorial queue

The Writer agent takes the first item with status `queued`, sets it to `drafting`, and writes it to `src/content/drafts/{slug}.md`. Compliance sets `published` or `returned` (with the reason in `ops/compliance-log.md`). Returned items go back to the Writer before any new item.

Statuses: queued, drafting, in-review, returned, published.

| # | Slug | Title | Kind | Status | Notes |
|---|---|---|---|---|---|
| 1 | how-to-buy-a-quarter-cow | How to buy a quarter cow: cost, cut sheet and freezer space | guide | published | Hub for every future /bulk-beef/ state page. Explain hanging vs packaged weight, processing fees, cut sheet choices, freezer space. Cite extension services. |
| 2 | grass-fed-vs-grass-finished | Grass-fed vs grass-finished: what the label really means | guide | published | Use FSIS 2019 and 2024 guidance and the certifications page. |
| 3 | grass-fed-certifications-compared | Grass-fed certifications compared: AGA, AGW, OPT and USDA Organic | guide | published | Comparison table. Primary sources only. |
| 4 | how-to-vet-a-grass-fed-farm | How to vet a local grass-fed farm: 12 questions to ask | guide | published | Practical. Link to /farms/. |
| 5 | raw-milk-laws-by-state | Raw milk laws by state, and how herdshares work | guide | published | Cite Farm-to-Consumer Legal Defense Fund map and NCSL with dates. Include a "not legal advice" line. No health claims either way. Published 2026-10-27 after NC Farm Act check. |
| 6 | best-grass-fed-beef-delivery | Best grass-fed beef delivery services, compared by price per pound | best | in-review | Research-based. Table: price per lb (date checked), grass-finished yes/no as stated, certification. |
| 7 | quarter-vs-half-vs-whole-cow | Quarter vs half vs whole cow: which share size fits your household | guide | in-review | |
| 8 | is-grass-fed-beef-worth-it | Is grass-fed beef worth the price? | guide | queued | Include omega-3 numbers WITH absolute amounts and context. |
| 9 | butcherbox-grass-fed-review | ButcherBox grass-fed beef: what you get and what it costs | review | queued | Only the 100% grass-fed line is in scope. |
| 10 | crowd-cow-grass-fed | Crowd Cow's grass-fed range: sourcing and prices | review | queued | |
| 11 | butcherbox-vs-crowd-cow | ButcherBox vs Crowd Cow for grass-fed beef | compare | queued | |
| 12 | us-wellness-meats-profile | US Wellness Meats: grass-finished beef and dairy by mail | review | queued | |
| 13 | white-oak-pastures-profile | White Oak Pastures: what they sell and how they raise it | review | queued | |
| 14 | best-grass-fed-milk-and-butter | Grass-fed milk and butter brands, and what their labels certify | best | queued | |
| 15 | best-grass-fed-ground-beef-delivery | Grass-fed ground beef by mail, compared | best | queued | |
| 16 | freezer-space-for-beef | How much freezer space a quarter or half cow needs | guide | queued | |
| 17 | grass-fed-beef-on-a-budget | Grass-fed beef on a budget | guide | queued | |
| 18 | grass-fed-vs-grain-fed | Grass-fed vs grain-fed beef: what actually differs | guide | queued | Hub page. Careful with nutrition framing. |
| 19 | grass-fed-beef-sticks | Grass-fed beef sticks and jerky: what to check on the label | best | queued | |
| 20 | force-of-nature-profile | Force of Nature Meats: sourcing and claims | review | queued | |
