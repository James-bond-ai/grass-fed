# Listing rules

Shared by every agent that finds, verifies or edits farm listings. The validator (`node scripts/validate.mjs`) enforces the mechanical parts; the judgment parts are yours.

## Who qualifies

A US farm or ranch that raises the animals itself and sells grass-fed or pasture-raised meat, eggs or dairy directly to the public (from the farm, at farmers markets, through a CSA or meat share, by local delivery, or by shipping). Exclude: brokers and marketplaces that don't raise animals, restaurants, grocery stores, national brands sold only through retailers, and farms whose own website doesn't mention grass, grass-fed or pasture at all.

## Where to find farms

Use: A Greener World listings (https://agreenerworld.org/get-involved/meet-certified-producers/), the American Grassfed Association producer directory (https://www.americangrassfed.org/aga-membership/producer-members/), state agriculture department programs, university extension directories, USDA Local Food Directories, and web searches such as "grass-fed beef farm [town or region] [state]".

Do NOT use Eatwild or LocalHarvest as sources at all, not even for names. Their terms protect their listings.

Record facts and links only. Never copy descriptions, photos or marketing copy from any site.

## How to verify

Open the farm's own website with WebFetch. Every listing must be confirmed against it:
1. The site loads and names the farm.
2. It says what the farm sells (species, products) and how to buy (channels).
3. Feeding claim: copy the single most specific sentence (or shorter phrase) where the farm describes feeding, exactly as written, 300 characters or fewer, and record the URL of the page it came from. Then set `category`:
   - `grass-finished`: the farm explicitly says grass-finished, grass-fed and finished, 100% grass-fed for life, or no grain ever.
   - `grass-fed`: says grass-fed but not how animals are finished.
   - `both`: sells grass-finished meat and also grain-finished (separate lines, or the buyer chooses).
   - `grain-finished`: says grain is fed before harvest.
   - `percentage`: describes a mixed or percentage diet.
   - `pastured`: describes pasture access without a grass-only diet (typical for pork, poultry, eggs).
   - `unknown`: nothing specific. When ambiguous, choose the more cautious category.
4. Certifications: add one only if you find the farm in that certifier's own public listing. Put that listing page's URL in `evidence_url`. A logo or claim on the farm's site alone is not enough. Programs: `aga`, `agw-grassfed`, `awa`, `opt`, `usda-organic`.
5. `bulk_shares: true` only if the site offers quarter, half or whole animals (or "freezer beef" shares).
6. Delivery and shipping: record exactly where the farm says it delivers and ships, in a `delivery` object (see format). Use the farm's own wording for local areas (towns, counties, metro areas, "within 50 miles of the farm"). For shipping, use "nationwide" only if the site says it ships anywhere in the continental US or nationwide; otherwise list the state abbreviations it names. If the site doesn't say, leave the field empty rather than guessing. Pickup points away from the farm (drop sites, processors, markets) go in `pickup_locations`.
7. Dairy: if the farm sells dairy from its own herd, list what it sells in `dairy_products` and add the dairy species. Leave out dairy the farm resells from other farms. Use `raw-milk` only when the site clearly says the milk is raw (unpasteurized), and note that raw milk is legal only in some states; never add anything about health.
8. Organic: never add organic labels by hand from a farm's own claims. A monthly GitHub workflow downloads USDA's Organic Integrity snapshot to `data/organic/us-operations.json`, and `node scripts/organic/match.mjs` sets three labels from it: `usda-organic` (livestock certified), `usda-organic-dairy` (dairy products certified, livestock not) and `usda-organic-pasture` (pasture or hay certified, livestock not). Run the script after adding farms. If it lists a possible match in `ops/organic-review.md`, confirm from the farm's own site whether the USDA record is the same operation, record the decision in `data/organic/reviewed.json` (with `usda_record` set to the record id when it is the same operation), and rerun the script.

If a farm fails (site down, no direct sales, no grass or pasture language, not in the US), do not list it. Write `data/rejected/{slug}.json` containing `{ "slug", "farm_name", "state", "website", "reason", "checked_on" }` so nobody re-adds it.

## File format

One file per farm: `data/farms/{slug}.json`. The slug is the farm name in lowercase with hyphens (add the state abbreviation at the end only if needed to make it unique). Check `data/farms/` and `data/rejected/` first to avoid duplicates.

```json
{
  "id": "example-ridge-ranch",
  "slug": "example-ridge-ranch",
  "farm_name": "Example Ridge Ranch",
  "city": "Town name",
  "state": "TX",
  "zip": "",
  "address_public": false,
  "website": "https://example.com",
  "phone": "",
  "social_urls": [],
  "species": ["beef"],
  "products": ["steaks", "ground beef"],
  "feeding_claim": {
    "category": "grass-finished",
    "verbatim": "Exact words from the farm's website.",
    "source_url": "https://example.com/our-practices"
  },
  "certifications": [],
  "sales_channels": ["farm-pickup", "ships-regional"],
  "farmers_markets": [],
  "bulk_shares": true,
  "delivery": {
    "local_areas": ["Austin metro", "Travis County"],
    "local_radius_miles": null,
    "ships_to": ["TX", "OK"],
    "pickup_locations": ["Saturday farmers market, San Marcos"],
    "source_url": "https://example.com/delivery"
  },
  "dairy_products": [],
  "ordering_url": "",
  "data_source": "web-search",
  "source_url": "https://where-you-found-it.example",
  "last_verified_at": "YYYY-MM-DD",
  "verification_method": "auto",
  "listing_status": "published"
}
```

Allowed values:
- `delivery.ships_to`: the string "nationwide", a list of state abbreviations, or an empty list. Must agree with `sales_channels` (ships-nationwide means "nationwide"; ships-regional means a list of states).
- `dairy_products`: milk, raw-milk, cheese, butter, yogurt, cream, kefir, ghee, ice-cream (required when `species` includes a dairy type)
- `species`: beef, bison, lamb, goat, pork, poultry, eggs, dairy-cow, dairy-goat, dairy-sheep
- `sales_channels`: on-farm-store, farm-pickup, csa, farmers-market, local-delivery, ships-nationwide, ships-regional, online-order, retail, restaurants (a published listing needs at least one)
- `data_source`: usda, certifier, state-program, self-submitted, web-search
- `listing_status`: published, stale, unpublished

Only include `phone`, `address` (with `address_public: true`) and `zip` if the farm publishes them on its own website. Leave optional fields empty rather than guessing. Never use em dashes in any field.

## Photos

Never copy photos from a farm's website or anywhere else. A listing may show photos only when the farm itself sent them and granted permission, usually through the "List your farm" form. Save them in `public/farm-photos/{slug}/` and add to the listing:

```json
"photos": [{ "src": "/farm-photos/{slug}/1.jpg", "alt": "Cattle grazing on the north pasture", "credit": "Farm name", "permission": { "granted_by": "Owner name", "date": "YYYY-MM-DD", "record_url": "link to the submission" } }]
```

## Before finishing

Run `node scripts/validate.mjs data/farms/{each file you wrote}.json` from the repo root and fix every error in your own files.
