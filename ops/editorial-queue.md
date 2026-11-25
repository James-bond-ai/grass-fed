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
| 6 | best-grass-fed-beef-delivery | Best grass-fed beef delivery services, compared by price per pound | best | published | Research-based. Table: price per lb (date checked), grass-finished yes/no as stated, certification. |
| 7 | quarter-vs-half-vs-whole-cow | Quarter vs half vs whole cow: which share size fits your household | guide | published | |
| 8 | is-grass-fed-beef-worth-it | Is grass-fed beef worth the price? | guide | published | Include omega-3 numbers WITH absolute amounts and context. |
| 9 | butcherbox-grass-fed-review | ButcherBox grass-fed beef: what you get and what it costs | review | in-review | Only the 100% grass-fed line is in scope. |
| 10 | crowd-cow-grass-fed | Crowd Cow's grass-fed range: sourcing and prices | review | in-review | |
| 11 | butcherbox-vs-crowd-cow | ButcherBox vs Crowd Cow for grass-fed beef | compare | in-review | |
| 12 | us-wellness-meats-profile | US Wellness Meats: grass-finished beef and dairy by mail | review | in-review | |
| 13 | white-oak-pastures-profile | White Oak Pastures: what they sell and how they raise it | review | in-review | |
| 14 | best-grass-fed-milk-and-butter | Grass-fed milk and butter brands, and what their labels certify | best | in-review | |
| 15 | best-grass-fed-ground-beef-delivery | Grass-fed ground beef by mail, compared | best | in-review | Make it distinct from best-grass-fed-beef-delivery: focus on lean/fat ratios, ground beef vs hamburger (9 CFR 319.15), %lean/%fat label rules (FSIS nutrition labeling Q&A 2012), bulk bundle price per lb, farms in the directory that ship ground beef. |
| 16 | freezer-space-for-beef | How much freezer space a quarter or half cow needs | guide | in-review | |
| 17 | grass-fed-beef-on-a-budget | Grass-fed beef on a budget | guide | in-review | Drafted 2026-11-25. AMS price report could not be fetched this run, so price figures are linked to is-grass-fed-beef-worth-it rather than restated. |
| 18 | grass-fed-vs-grain-fed | Grass-fed vs grain-fed beef: what actually differs | guide | queued | Hub page. Careful with nutrition framing. |
| 19 | grass-fed-beef-sticks | Grass-fed beef sticks and jerky: what to check on the label | best | queued | |
| 20 | force-of-nature-profile | Force of Nature Meats: sourcing and claims | review | queued | |
| 21 | bulk-grass-fed-beef-texas | Buying grass-fed beef in bulk in Texas: farms, processors and what to expect | guide | queued | State bulk-beef guide. Link /bulk-beef/tx/ and Texas farms in the directory. Cite Texas A&M AgriLife Extension and Texas DSHS meat safety rules for custom-exempt processing. |
| 22 | pasture-raised-vs-grass-fed | Pasture-raised, pastured and grass-fed: what these meat and dairy labels mean | guide | queued | Label question. Use FSIS labeling guideline on animal-raising claims and certifier standards. No health angles. |
| 23 | grass-fed-cheese-labels | Grass-fed cheese: what the label means and which certifications cover it | guide | queued | Dairy topic. Explain that most cheese labels are unregulated for grass-fed claims; cover AGA dairy, PCO 100% grassfed and Organic. Link dairy farms in the directory. |
