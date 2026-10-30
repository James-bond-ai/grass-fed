// Build-time farm sets for the "Put this guide to work" module on guide pages.
// Each guide id maps to the farms a reader of that guide is most likely to want,
// the hub page that lists them, and the page to open for a chosen state.
// Guides without an entry here fall back to DEFAULT_SET (every published farm).
import { STATES, CERTIFICATIONS, SPECIES, sellsDairy } from '../data/states.mjs';
import { loadPublishedFarms, stateCoverage } from '../data/farms.mjs';
import { sellsBulkBeef } from '../data/bulk.mjs';

const plural = (n, one, many) => (n === 1 ? one : many);
const farmsBased = (farms, abbr) => farms.filter((f) => f.state === abbr).length;
const sellsMeat = (f) => (f.species ?? []).some((s) => !s.startsWith('dairy-'));
const hasCert = (f) => (f.certifications ?? []).some((c) => CERTIFICATIONS[c.program]);
const rawMilk = (f) => (f.dairy_products ?? []).includes('raw-milk');
const FINISH_RANK = { 'grass-finished': 0, both: 1, 'grass-fed': 2 };

const farmsState = (s) => `/farms/${s.slug}/`;
// State page links can carry filter presets (read by Filters.astro), e.g. ?feed=gff.
const withParams = (url, params) => {
  const q = new URLSearchParams(params ?? {}).toString();
  return q ? `${url}?${q}` : url;
};

const DEFAULT_SET = {
  filter: () => true,
  hub: '/farms/',
  hubCta: 'Open the state map',
  stateUrl: farmsState,
  stateGroup: 'States with farms based there',
  title: 'Find a farm near you',
  count: (n) => `${n} verified ${plural(n, 'farm is', 'farms are')} listed, each checked against the farm's own website.`,
  compact: (n) => `${n} verified ${plural(n, 'farm is', 'farms are')} listed on grassfed.food, each checked against the farm's own website.`,
  note: 'Pick your state to see farms based there and farms elsewhere that ship to you.',
  // Offer a "What you want to buy" choice next to the state picker; it opens the state
  // page with that species filter set. Off for hubs whose pages have no species filter.
  speciesPick: true,
};

const SETS = {
  'how-to-buy-a-quarter-cow': {
    filter: sellsBulkBeef,
    hub: '/bulk-beef/',
    hubCta: 'Browse bulk beef farms',
    stateUrl: (s) => `/bulk-beef/${s.slug}/`,
    stateGroup: 'Bulk beef farms based there',
    speciesPick: false,
    title: 'Find a farm that sells quarter and half shares',
    count: (n) => `${n} verified ${plural(n, 'farm sells', 'farms sell')} beef by the quarter, half or whole animal.`,
    compact: (n) => `Ready to order? ${n} verified ${plural(n, 'farm sells', 'farms sell')} beef by the quarter, half or whole animal.`,
    note: 'Share sizes, prices and waitlists change often, so confirm with the farm before you send a deposit.',
  },
  'raw-milk-laws-by-state': {
    filter: sellsDairy,
    rank: (f) => (rawMilk(f) ? 0 : 1),
    hub: '/dairy/',
    hubCta: 'Browse dairy farms',
    stateUrl: (s) => `/dairy/${s.slug}/`,
    stateGroup: 'Dairy farms based there',
    speciesPick: false,
    title: 'Find a dairy farm near you',
    count: (n, farms) => {
      const raw = farms.filter(rawMilk).length;
      return `${n} verified ${plural(n, 'farm sells', 'farms sell')} milk, cheese, butter or other dairy from their own herds${raw ? `, and ${raw} ${plural(raw, 'lists', 'list')} raw milk among ${plural(raw, 'its', 'their')} products` : ''}.`;
    },
    compact: (n) => `${n} verified ${plural(n, 'farm sells', 'farms sell')} dairy from their own herds. See which are near you.`,
    note: 'Whether raw milk can be sold, and how, depends on your state law. Confirm with the farm before you buy.',
    detail: 'dairy',
  },
  'grass-fed-vs-grass-finished': {
    filter: (f) => f.feeding_claim?.category === 'grass-finished' && sellsMeat(f),
    hub: '/farms/',
    hubCta: 'Browse farms by state',
    stateUrl: farmsState,
    stateGroup: 'Grass-finished farms based there',
    params: { feed: 'gff' },
    title: 'Find farms that say they grass-finish',
    count: (n) => `${n} verified ${plural(n, 'farm says its', 'farms say their')} animals are grass-fed and grass-finished. Each farm page quotes the farm's own words.`,
    compact: (n) => `${n} verified ${plural(n, 'farm says its', 'farms say their')} animals are grass-fed and grass-finished.`,
    note: 'State pages open with Feeding set to "Grass-finished available". Clear it to see every farm.',
  },
  'grass-fed-certifications-compared': {
    filter: hasCert,
    hub: '/farms/',
    hubCta: 'Browse farms by state',
    stateUrl: farmsState,
    stateGroup: 'Certified farms based there',
    title: 'Find a certified farm',
    count: (n) => `${n} verified ${plural(n, 'farm holds', 'farms hold')} at least one of the certifications in this guide. We show a seal only when we found the farm in the certifier's own listing.`,
    compact: (n) => `${n} verified ${plural(n, 'farm holds', 'farms hold')} at least one of the certifications compared here.`,
    note: 'On any state page, use the certification filters to narrow the list.',
    detail: 'certs',
  },
  'how-to-vet-a-grass-fed-farm': {
    ...DEFAULT_SET,
    title: 'Put these questions to a farm near you',
  },
};

// A stable number from text, so ties are broken the same way on every build
// but differently for each guide (rather than always favouring names starting with A).
function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

// Order examples: grass-finished first, then most recently verified, then a stable per-guide shuffle.
// Picks farms from different states where it can, so the examples feel national.
function examples(farms, id, extraRank, max = 3) {
  const sorted = farms.slice().sort((a, b) =>
    (extraRank ? extraRank(a) - extraRank(b) : 0) ||
    (FINISH_RANK[a.feeding_claim?.category] ?? 3) - (FINISH_RANK[b.feeding_claim?.category] ?? 3) ||
    String(b.last_verified_at ?? '').localeCompare(String(a.last_verified_at ?? '')) ||
    hash(`${id}:${a.slug}`) - hash(`${id}:${b.slug}`) ||
    a.farm_name.localeCompare(b.farm_name)
  );
  const picked = [];
  const seen = new Set();
  for (const f of sorted) {
    if (picked.length >= max) break;
    if (!seen.has(f.state)) { picked.push(f); seen.add(f.state); }
  }
  for (const f of sorted) {
    if (picked.length >= max) break;
    if (!picked.includes(f)) picked.push(f);
  }
  return picked;
}

const cache = new Map();

export function guideFarmSet(id) {
  if (cache.has(id)) return cache.get(id);
  const all = loadPublishedFarms();
  let cfg = { ...DEFAULT_SET, ...(SETS[id] ?? {}) };
  let farms = all.filter(cfg.filter);
  if (farms.length === 0) { cfg = DEFAULT_SET; farms = all; }
  const n = farms.length;
  const cov = stateCoverage().byState;
  const primary = [];
  const other = [];
  for (const s of STATES.slice().sort((a, b) => a.name.localeCompare(b.name))) {
    const k = farmsBased(farms, s.abbr);
    if (k > 0) primary.push({ name: s.name, label: `${s.name} (${k})`, url: withParams(cfg.stateUrl(s), cfg.params) });
    else if (cov[s.abbr].based + cov[s.abbr].shipIn > 0) other.push({ name: s.name, label: s.name, url: withParams(farmsState(s), cfg.params) });
  }
  // Species this guide's farms sell, most common first, for the "What you want to buy" choice.
  const speciesCount = {};
  for (const f of farms) for (const k of new Set(f.species ?? [])) if (SPECIES[k]) speciesCount[k] = (speciesCount[k] ?? 0) + 1;
  const order = Object.keys(SPECIES);
  const species = cfg.speciesPick === false ? [] : Object.entries(speciesCount)
    .sort((a, b) => b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([value, k]) => ({ value, label: `${SPECIES[value]} (${k})` }));
  const out = {
    n,
    species: species.length > 1 ? species : [],
    farms,
    title: cfg.title,
    count: cfg.count(n, farms),
    compact: cfg.compact(n, farms),
    note: cfg.note,
    hub: cfg.hub,
    hubCta: cfg.hubCta,
    detail: cfg.detail ?? null,
    stateGroup: cfg.stateGroup,
    primary,
    other,
    examples: examples(farms, id, cfg.rank),
  };
  cache.set(id, out);
  return out;
}
