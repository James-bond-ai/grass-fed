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
  'usda-organic': { name: 'USDA Organic', short: 'USDA Organic', url: 'https://organic.ams.usda.gov/integrity/' },
};
