// Raw milk legal status by state, shown on /dairy/{state}/ pages.
// Every category and note is copied word for word from the published guide
// src/content/articles/raw-milk-laws-by-state.md (table "Raw milk laws in all 50 states").
// scripts/validate.mjs warns when the two disagree. When the guide's table changes,
// update this file and RAW_MILK_CHECKED to match; never add claims the guide does not make.

export const RAW_MILK_CHECKED = '2026-10-27';
export const RAW_MILK_GUIDE = '/guides/raw-milk-laws-by-state/';
export const RAW_MILK_DISCLAIMER = 'This is a summary, not legal advice. Laws change; check with your state agriculture department.';
export const RAW_MILK_INTERSTATE = 'Federal rules ban selling raw milk for drinking across state lines, so a farm in another state cannot legally ship it to you.';

export const RAW_MILK_SOURCES = {
  ftcldf: { title: 'Farm-to-Consumer Legal Defense Fund: Raw Milk Nation interactive map (last updated July 30, 2026)', url: 'https://www.farmtoconsumer.org/raw-milk-nation-interactive-map/' },
  ncsl: { title: 'National Conference of State Legislatures: Got raw milk? It depends on your state (updated June 8, 2026)', url: 'https://www.ncsl.org/resources/map-monday-got-raw-milk-it-depends-on-your-state' },
  'fsn-2025': { title: 'Raw milk sales by state chart as of May 1, 2025 (hosted by Food Safety News)', url: 'https://www.foodsafetynews.com/files/2025/05/Updated-Raw-Milk-Sales-by-State-Chart-as-of-May-1-2025.pdf' },
  'ecfr-1240-61': { title: 'eCFR: 21 CFR 1240.61, Mandatory pasteurization for milk in final package form', url: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-L/part-1240/subpart-D/section-1240.61' },
  'nc-extension': { title: 'NC State Extension: Legal issues related to cow share agreements', url: 'https://cals.ncsu.edu/are-extension/wp-content/uploads/sites/27/2019/09/Legal-Issues-Related-to-Cow-Share-Agreements.pdf' },
  'nc-s401': { title: 'North Carolina General Assembly: Senate Bill 401, Session Law 2026-11', url: 'https://www.ncleg.gov/Sessions/2025/Bills/Senate/PDF/S401v5.pdf' },
  'wi-datcp': { title: 'Wisconsin DATCP: Raw milk', url: 'https://datcp.wi.gov/Pages/Programs_Services/RawMilk.aspx' },
  'mt-dol': { title: 'Montana Department of Livestock: Raw milk and the Montana Local Food Choice Act (rev. 2026)', url: 'https://liv.mt.gov/_docs/ME/Milk/Raw-Milk-and-Montana-Local-Food-Choice-Act-rev-2026.pdf' },
  'wpm-wy': { title: 'Wyoming Public Media: Lawmakers get cooking on exploring changes to WY Food Freedom Act (June 23, 2026)', url: 'https://www.wyomingpublicmedia.org/politics-government/2026-06-23/lawmakers-get-cooking-on-exploring-changes-to-wy-food-freedom-act' },
  'wy-draft': { title: 'Wyoming Legislature: 2027 Food Freedom Act amendments, working draft (not introduced)', url: 'https://wyoleg.gov/InterimCommittee/2026/05-2026061127LSO-0046v0.4.pdf' },
  'ok-senate': { title: 'Oklahoma State Senate: New Oklahoma law expands raw milk sales (May 14, 2026)', url: 'https://oksenate.gov/press-releases/new-oklahoma-law-expands-raw-milk-sales' },
  kgou: { title: 'KGOU: Oklahoma ups raw milk sales (May 27, 2026)', url: 'https://www.kgou.org/politics-and-government/2026-05-27/oklahoma-ups-raw-milk-sales-nixes-federal-milk-compliance-bill' },
  'la-act699': { title: 'Louisiana State Legislature: HB467 (2024), Act 699', url: 'https://www.legis.la.gov/legis/ViewDocument.aspx?d=1382720' },
  'ut-hb179': { title: 'Utah Legislature: HB 179 (2026), enrolled text', url: 'https://le.utah.gov/Session/2026/bills/enrolled/HB0179.pdf' },
  'ky-chfs': { title: 'Kentucky Cabinet for Health and Family Services: Sale of raw milk', url: 'https://chfs.ky.gov/agencies/dph/dphps/msb/Documents/SaleofRawMilk.pdf' },
  'ri-21-2-2': { title: 'Rhode Island General Laws: Section 21-2-2', url: 'https://webserver.rilegislature.gov/statutes/TITLE21/21-2/21-2-2.htm' },
  'ri-h7924': { title: 'Rhode Island General Assembly: 2026 H 7924, as introduced', url: 'https://webserver.rilegislature.gov/BillText26/HouseText26/H7924.htm' },
  'nj-a4997': { title: 'New Jersey Legislature: Assembly No. 4997 (2026), as introduced', url: 'https://pub.njleg.gov/Bills/2026/A5000/4997_I1.HTM' },
  'va-2vac5': { title: 'Virginia Administrative Code: 2VAC5-490-75, Sale of unpasteurized milk', url: 'https://law.lis.virginia.gov/admincode/title2/agency5/chapter490/section75/' },
};

// Keyed by state abbreviation. DC is not a row in the guide's table; the guide says
// "Washington, D.C. bans sales", citing NCSL.
export const RAW_MILK = {
  AL: { category: 'Pet food only', note: '', sources: ['ftcldf'] },
  AK: { category: 'Retail sales allowed', note: 'Annual registration required', sources: ['ftcldf'] },
  AZ: { category: 'Retail sales allowed', note: 'Permit required', sources: ['ftcldf'] },
  AR: { category: 'On-farm sales', note: 'Some off-farm sales also allowed', sources: ['ftcldf'] },
  CA: { category: 'Retail sales allowed', note: 'Permit required', sources: ['ftcldf'] },
  CO: { category: 'Herdshare', note: '', sources: ['ftcldf'] },
  CT: { category: 'Retail sales allowed', note: 'License required', sources: ['ftcldf'] },
  DE: { category: 'On-farm sales', note: 'Permit required. Herdshares also allowed with a permit', sources: ['ftcldf'] },
  FL: { category: 'Pet food only', note: '', sources: ['ftcldf'] },
  GA: { category: 'On-farm sales', note: 'Herdshares barred by rule', sources: ['ftcldf'] },
  HI: { category: 'Prohibited', note: 'No herdshare law', sources: ['ftcldf'] },
  ID: { category: 'Retail sales allowed', note: 'Permit required', sources: ['ftcldf'] },
  IL: { category: 'On-farm sales', note: 'Herdshares also listed as legal', sources: ['ftcldf'] },
  IN: { category: 'Pet food only', note: '', sources: ['ftcldf'] },
  IA: { category: 'On-farm sales', note: 'Herdshares also listed as legal', sources: ['ftcldf'] },
  KS: { category: 'On-farm sales', note: '', sources: ['ftcldf'] },
  KY: { category: 'On-farm sales (goat milk only)', note: 'Needs a state permit and a doctor\'s written recommendation, per the state health cabinet. No cow milk sales', sources: ['ftcldf', 'ky-chfs'] },
  LA: { category: 'Pet food only', note: '2024 law requires registration, testing and a "not for human consumption" label', sources: ['ftcldf', 'la-act699'] },
  ME: { category: 'Retail sales allowed', note: 'Must be labeled unpasteurized', sources: ['ftcldf'] },
  MD: { category: 'Pet food only', note: 'Herdshares barred by regulation', sources: ['ftcldf'] },
  MA: { category: 'On-farm sales', note: 'Herdshares only with state registration', sources: ['ftcldf'] },
  MI: { category: 'Herdshare', note: 'Milk and cream only', sources: ['ftcldf'] },
  MN: { category: 'On-farm sales', note: '', sources: ['ftcldf'] },
  MS: { category: 'On-farm sales (goat milk only)', note: 'Small, occasional sales only', sources: ['ftcldf'] },
  MO: { category: 'On-farm sales', note: 'Farm-to-consumer sales only', sources: ['ftcldf'] },
  MT: { category: 'On-farm sales', note: 'Small dairies only (up to 5 cows, 10 goats or 10 sheep), sold direct to the end consumer, including delivery and farmers markets, per the state livestock department. No store or restaurant sales', sources: ['ftcldf', 'mt-dol'] },
  NE: { category: 'On-farm sales', note: '', sources: ['ftcldf'] },
  NV: { category: 'Retail sales allowed', note: 'FTCLDF says no dairy currently holds the needed county license', sources: ['ftcldf'] },
  NH: { category: 'Retail sales allowed', note: '', sources: ['ftcldf'] },
  NJ: { category: 'Pet food only', note: 'Pet milk needs a state permit. A 2026 bill (A4997) would allow on-farm sales; it had only been introduced when we checked', sources: ['ftcldf', 'nj-a4997'] },
  NM: { category: 'Retail sales allowed', note: 'Permit required', sources: ['ftcldf'] },
  NY: { category: 'On-farm sales', note: 'Permit required. Herdshares also listed as legal with a permit', sources: ['ftcldf'] },
  NC: { category: 'Herdshare', note: 'Pet milk sales also legal. The 2026 Farm Act (Session Law 2026-11, signed June 22, 2026) made no change to raw milk, herdshare or pet milk rules', sources: ['ftcldf', 'nc-extension', 'nc-s401'] },
  ND: { category: 'On-farm sales', note: 'Herdshares also listed as legal', sources: ['ftcldf'] },
  OH: { category: 'Herdshare', note: '', sources: ['ftcldf'] },
  OK: { category: 'On-farm sales', note: 'A 2026 law (SB 2028) raised the cap to 1,500 gallons a month. Sales must be on the farm where the milk is produced, per KGOU', sources: ['ftcldf', 'ok-senate', 'kgou'] },
  OR: { category: 'Retail sales (goat and sheep milk only)', note: 'Cow milk on-farm only, from small herds', sources: ['ftcldf'] },
  PA: { category: 'Retail sales allowed', note: 'Permit required', sources: ['ftcldf'] },
  RI: { category: 'On-farm sales (goat milk only)', note: 'Each sale needs a doctor\'s signed prescription under state law. A 2026 bill (H 7924) to legalize raw milk sales was introduced; we found no record that it passed', sources: ['ftcldf', 'ri-21-2-2', 'ri-h7924'] },
  SC: { category: 'Retail sales allowed', note: 'Permit required', sources: ['ftcldf'] },
  SD: { category: 'On-farm sales', note: '', sources: ['ftcldf'] },
  TN: { category: 'Herdshare', note: '', sources: ['ftcldf'] },
  TX: { category: 'On-farm sales', note: 'Herdshares also listed as legal', sources: ['ftcldf'] },
  UT: { category: 'Retail sales allowed', note: 'A 2026 law (HB 179) lets permitted dairies sell through inspected stores and lets some small dairies sell on the farm without a permit', sources: ['ftcldf', 'ut-hb179'] },
  VT: { category: 'On-farm sales', note: '', sources: ['ftcldf'] },
  VA: { category: 'Pet food only (herdshares disputed)', note: 'A state rule in force since 2007 (2VAC5-490-75) bars selling or trading raw milk for people to drink and does not mention herdshares. FTCLDF lists no herdshare law; an older 2025 chart says state policy allows them. Treat herdshares as legally unsettled', sources: ['ftcldf', 'va-2vac5', 'fsn-2025'] },
  WA: { category: 'Retail sales allowed', note: 'License required', sources: ['ftcldf'] },
  WV: { category: 'Retail sales allowed', note: '', sources: ['ftcldf'] },
  WI: { category: 'On-farm sales (occasional only)', note: 'Only incidental sales at the farm, with no advertising. The state agriculture department says a herdshare is not real ownership; an older 2025 chart listed herdshares as legal', sources: ['ftcldf', 'wi-datcp', 'fsn-2025'] },
  WY: { category: 'Disputed: retail or direct only', note: 'FTCLDF lists store sales as legal. The state agriculture director said in June 2026 that raw milk may be sold directly from producer to consumer but not used in a commercial food business. A 2027 draft bill (not yet introduced) would let such businesses use raw milk with written notice. Ask the state before buying from a store', sources: ['ftcldf', 'wpm-wy', 'wy-draft'] },
  DC: { category: 'Sales banned', note: 'NCSL counts Washington, D.C. among the places that ban raw milk sales for people to drink', sources: ['ncsl'] },
};

export function rawMilkFor(abbr) {
  const r = RAW_MILK[abbr];
  if (!r) return null;
  return { ...r, sources: r.sources.map((k) => RAW_MILK_SOURCES[k]) };
}
