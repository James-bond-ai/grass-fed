// US states plus DC. `col` and `row` place each state on the tile map.
export const STATES = [
  { abbr: 'AK', name: 'Alaska', col: 0, row: 0 },
  { abbr: 'ME', name: 'Maine', col: 10, row: 0 },
  { abbr: 'WI', name: 'Wisconsin', col: 5, row: 1 },
  { abbr: 'VT', name: 'Vermont', col: 9, row: 1 },
  { abbr: 'NH', name: 'New Hampshire', col: 10, row: 1 },
  { abbr: 'WA', name: 'Washington', col: 0, row: 2 },
  { abbr: 'ID', name: 'Idaho', col: 1, row: 2 },
  { abbr: 'MT', name: 'Montana', col: 2, row: 2 },
  { abbr: 'ND', name: 'North Dakota', col: 3, row: 2 },
  { abbr: 'MN', name: 'Minnesota', col: 4, row: 2 },
  { abbr: 'IL', name: 'Illinois', col: 5, row: 2 },
  { abbr: 'MI', name: 'Michigan', col: 6, row: 2 },
  { abbr: 'NY', name: 'New York', col: 8, row: 2 },
  { abbr: 'MA', name: 'Massachusetts', col: 9, row: 2 },
  { abbr: 'OR', name: 'Oregon', col: 0, row: 3 },
  { abbr: 'NV', name: 'Nevada', col: 1, row: 3 },
  { abbr: 'WY', name: 'Wyoming', col: 2, row: 3 },
  { abbr: 'SD', name: 'South Dakota', col: 3, row: 3 },
  { abbr: 'IA', name: 'Iowa', col: 4, row: 3 },
  { abbr: 'IN', name: 'Indiana', col: 5, row: 3 },
  { abbr: 'OH', name: 'Ohio', col: 6, row: 3 },
  { abbr: 'PA', name: 'Pennsylvania', col: 7, row: 3 },
  { abbr: 'NJ', name: 'New Jersey', col: 8, row: 3 },
  { abbr: 'CT', name: 'Connecticut', col: 9, row: 3 },
  { abbr: 'RI', name: 'Rhode Island', col: 10, row: 3 },
  { abbr: 'CA', name: 'California', col: 0, row: 4 },
  { abbr: 'UT', name: 'Utah', col: 1, row: 4 },
  { abbr: 'CO', name: 'Colorado', col: 2, row: 4 },
  { abbr: 'NE', name: 'Nebraska', col: 3, row: 4 },
  { abbr: 'MO', name: 'Missouri', col: 4, row: 4 },
  { abbr: 'KY', name: 'Kentucky', col: 5, row: 4 },
  { abbr: 'WV', name: 'West Virginia', col: 6, row: 4 },
  { abbr: 'VA', name: 'Virginia', col: 7, row: 4 },
  { abbr: 'MD', name: 'Maryland', col: 8, row: 4 },
  { abbr: 'DE', name: 'Delaware', col: 9, row: 4 },
  { abbr: 'AZ', name: 'Arizona', col: 1, row: 5 },
  { abbr: 'NM', name: 'New Mexico', col: 2, row: 5 },
  { abbr: 'KS', name: 'Kansas', col: 3, row: 5 },
  { abbr: 'AR', name: 'Arkansas', col: 4, row: 5 },
  { abbr: 'TN', name: 'Tennessee', col: 5, row: 5 },
  { abbr: 'NC', name: 'North Carolina', col: 6, row: 5 },
  { abbr: 'SC', name: 'South Carolina', col: 7, row: 5 },
  { abbr: 'DC', name: 'District of Columbia', col: 8, row: 5 },
  { abbr: 'OK', name: 'Oklahoma', col: 3, row: 6 },
  { abbr: 'LA', name: 'Louisiana', col: 4, row: 6 },
  { abbr: 'MS', name: 'Mississippi', col: 5, row: 6 },
  { abbr: 'AL', name: 'Alabama', col: 6, row: 6 },
  { abbr: 'GA', name: 'Georgia', col: 7, row: 6 },
  { abbr: 'HI', name: 'Hawaii', col: 0, row: 7 },
  { abbr: 'TX', name: 'Texas', col: 3, row: 7 },
  { abbr: 'FL', name: 'Florida', col: 8, row: 7 },
].map((s) => ({ ...s, slug: s.name.toLowerCase().replace(/\s+/g, '-') }));

export const STATE_BY_ABBR = Object.fromEntries(STATES.map((s) => [s.abbr, s]));

// A state page is indexed by search engines only at or above this many published farms.
export const INDEX_THRESHOLD = 5;

export const SPECIES = {
  beef: 'Beef',
  bison: 'Bison',
  lamb: 'Lamb',
  goat: 'Goat',
  pork: 'Pork',
  poultry: 'Poultry',
  eggs: 'Eggs',
  'dairy-cow': 'Cow dairy',
  'dairy-goat': 'Goat dairy',
  'dairy-sheep': 'Sheep dairy',
};

export const FEEDING = {
  'grass-finished': 'Grass-fed and grass-finished',
  'grass-fed': 'Grass-fed (finishing not stated)',
  'grain-finished': 'Grass-fed, grain-finished',
  both: 'Sells both grass-finished and grain-finished',
  percentage: 'Partial grass diet',
  pastured: 'Pasture-raised',
  unknown: 'Not stated',
};

export const CHANNELS = {
  'on-farm-store': 'On-farm store',
  'farm-pickup': 'Farm pickup',
  csa: 'CSA or meat share',
  'farmers-market': 'Farmers market',
  'local-delivery': 'Local delivery',
  'ships-nationwide': 'Ships nationwide',
  'ships-regional': 'Ships to nearby states',
  'online-order': 'Online ordering',
  retail: 'Sold in stores',
  restaurants: 'Sold to restaurants',
};

export const CERTIFICATIONS = {
  aga: { name: 'American Grassfed Association', short: 'AGA Certified', url: 'https://www.americangrassfed.org/' },
  'agw-grassfed': { name: 'Certified Grassfed by AGW', short: 'AGW Certified Grassfed', url: 'https://agreenerworld.org/' },
  awa: { name: 'Animal Welfare Approved by AGW', short: 'Animal Welfare Approved', url: 'https://agreenerworld.org/' },
  opt: { name: 'OPT Certified Grass-Fed Organic', short: 'OPT Grass-Fed Organic', url: 'https://certification.oeffa.org/organic-grass-fed/' },
  'usda-organic': { name: 'USDA Organic livestock', short: 'USDA Organic', url: 'https://organic.ams.usda.gov/integrity/' },
  'usda-organic-dairy': { name: 'USDA Organic dairy products', short: 'Organic dairy products', url: 'https://organic.ams.usda.gov/integrity/' },
  'usda-organic-pasture': { name: 'Certified organic pasture', short: 'Organic pasture', url: 'https://organic.ams.usda.gov/integrity/' },
};

export const DAIRY_PRODUCTS = {
  milk: 'Milk',
  'raw-milk': 'Raw milk',
  cheese: 'Cheese',
  butter: 'Butter',
  yogurt: 'Yogurt',
  cream: 'Cream',
  kefir: 'Kefir',
  ghee: 'Ghee',
  'ice-cream': 'Ice cream',
};

// Food that can be sold as organic: certified livestock, certified dairy products, or OPT (which requires USDA Organic).
export const isOrganic = (f) => (f.certifications ?? []).some((c) => ['usda-organic', 'usda-organic-dairy', 'opt'].includes(c.program));
// Land certified organic, animals not: shown as a separate, weaker label.
export const hasOrganicPasture = (f) => !isOrganic(f) && (f.certifications ?? []).some((c) => c.program === 'usda-organic-pasture');
export const sellsDairy = (f) => (f.species ?? []).some((s) => s.startsWith('dairy-'));

// Where a farm's products can reach. Returns { nationwide, shipsTo:Set, localAreas[], radius, pickup[] }.
export function reach(f) {
  const d = f.delivery ?? {};
  const ch = f.sales_channels ?? [];
  const nationwide = d.ships_to === 'nationwide' || ch.includes('ships-nationwide');
  const shipsTo = new Set(Array.isArray(d.ships_to) ? d.ships_to : []);
  return { nationwide, shipsTo, localAreas: d.local_areas ?? [], radius: d.local_radius_miles ?? null, pickup: d.pickup_locations ?? [] };
}
// True if a shopper in `abbr` can get this farm's products by shipping or because the farm is in that state.
export function servesState(f, abbr) {
  const r = reach(f);
  return f.state === abbr || r.nationwide || r.shipsTo.has(abbr);
}

// Plain-language feeding label for a farm, split into what it says about grass feeding and
// about finishing (the last months before harvest). Dairy-only farms have no finishing stage.
export function feedingLabel(f) {
  const cat = f.feeding_claim?.category ?? 'unknown';
  const dairyOnly = (f.species ?? []).length > 0 && (f.species ?? []).every((s) => s.startsWith('dairy-'));
  if (dairyOnly) {
    if (cat === 'grass-finished' || cat === 'grass-fed') return { level: 'gf', parts: [{ text: 'Grass-fed herd', ok: true }], note: 'The farm says its milking animals are fed on grass. Finishing applies to meat animals, not dairy herds.' };
    if (cat === 'percentage' || cat === 'grain-finished') return { level: 'partial', parts: [{ text: 'Partial grass diet', ok: 'n' }], note: 'The farm says its herd eats grass along with some grain or other feed.' };
    if (cat === 'pastured') return { level: 'pastured', parts: [{ text: 'Pasture-based herd', ok: 'n' }], note: 'The farm says its herd grazes on pasture but does not say the diet is grass only.' };
    return { level: 'unknown', parts: [{ text: 'Feeding not stated', ok: null }], note: "The farm's website doesn't describe how its animals are fed." };
  }
  switch (cat) {
    case 'grass-finished': return { level: 'gff', parts: [{ text: 'Grass-fed', ok: true }, { text: 'Grass-finished', ok: true }], note: 'The farm says its animals eat grass and forage their whole lives, including the final months before harvest.' };
    case 'grass-fed': return { level: 'gf', parts: [{ text: 'Grass-fed', ok: true }, { text: 'Finishing not stated', ok: null }], note: "The farm says grass-fed but doesn't say how animals are fed in the final months. Ask whether they are grass-finished." };
    case 'both': return { level: 'both', parts: [{ text: 'Grass-fed', ok: true }, { text: 'Grass-finished available', ok: true }], note: 'The farm sells grass-finished beef and also sells grain-finished beef. Ask for grass-finished when you order.' };
    case 'grain-finished': return { level: 'grain', parts: [{ text: 'Grass-fed', ok: true }, { text: 'Grain-finished', ok: false }], note: 'The farm says its animals graze but are fed grain before harvest.' };
    case 'percentage': return { level: 'partial', parts: [{ text: 'Partial grass diet', ok: 'n' }], note: 'The farm describes a mixed diet of grass plus grain or other feed.' };
    case 'pastured': return { level: 'pastured', parts: [{ text: 'Pasture-raised', ok: 'n' }, { text: 'Not labeled grass-fed', ok: false }], note: 'The animals live on pasture, but the farm does not say their diet is grass only. Typical for pork and poultry, which also eat grain.' };
    default: return { level: 'unknown', parts: [{ text: 'Feeding not stated', ok: null }], note: "The farm's website doesn't describe how its animals are fed. Ask before you buy." };
  }
}
