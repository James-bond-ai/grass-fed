// Certification pages at /certifications/{program}/, one per program in CERTIFICATIONS.
// Each page lists farms holding exactly that program. The three USDA organic programs
// stay on separate pages because they promise different things: only usda-organic and
// usda-organic-dairy mean the food itself can be sold as organic.
// Page copy below condenses statements already on /certifications/, the comparison guide,
// the farm pages and /methodology/. Do not add new claims about certifier standards here.
import { CERTIFICATIONS, INDEX_THRESHOLD } from './states.mjs';
import { loadPublishedFarms } from './farms.mjs';

export const CERT_GUIDE = '/guides/grass-fed-certifications-compared/';

// Display order: grass-only seals, the welfare seal, then the organic labels.
export const CERT_ORDER = ['aga', 'agw-grassfed', 'opt', 'awa', 'usda-organic', 'usda-organic-dairy', 'usda-organic-pasture'];

export const CERT_PAGES = {
  aga: {
    h1: 'AGA certified grass-fed farms',
    tagline: 'Grass-only diet, audited',
    one: 'AGA certified farm',
    many: 'AGA certified farms',
    section: 'aga',
    lede: 'Farms certified by the American Grassfed Association, which writes its own grass-fed standards and has farms inspected against them.',
    gives: [
      'Ruminants eat only forage from birth to harvest, with no grain. Hay and silage are allowed when pasture is short.',
      "Animals can't be confined except briefly for handling or emergencies.",
      'No added hormones, and animals must be born and raised in the US.',
      'An animal that needs antibiotics is treated and then removed from the program.',
      'Independent inspectors audit farms at least every 15 months.',
    ],
    lacks: [
      "AGA's pastured pork standard is separate from its ruminant rules, so an AGA seal on pork doesn't mean the same thing as one on beef.",
    ],
    related: ['agw-grassfed', 'opt'],
  },
  'agw-grassfed': {
    h1: 'Certified Grassfed by AGW farms',
    tagline: 'Grass-only diet, audited',
    one: 'Certified Grassfed by AGW farm',
    many: 'Certified Grassfed by AGW farms',
    section: 'agw-grassfed',
    lede: "Farms holding A Greener World's grassfed certification, an add-on to its Animal Welfare Approved label.",
    gives: [
      'Animals eat grass and forage for life, apart from milk before weaning. Grain is not allowed.',
      'Farms must also meet the Animal Welfare Approved standard.',
      'Records trace each animal from birth to slaughter, and A Greener World audits the farm.',
    ],
    lacks: [
      "Covers beef and dairy cattle, bison, sheep and goats. Poultry and pigs aren't eligible.",
      'In a declared drought or similar emergency, a farm can get approval to feed sprouted grain for up to 25% of daily dry matter.',
    ],
    related: ['awa', 'aga', 'opt'],
  },
  opt: {
    h1: 'OPT Certified Grass-Fed Organic farms',
    tagline: 'Grass-only and organic',
    one: 'OPT certified farm',
    many: 'OPT certified farms',
    section: 'opt',
    lede: 'Farms holding the OPT grass-fed organic certification, launched in 2019 by Organic Valley and Maple Hill and most common on grass-fed milk.',
    gives: [
      'The farm must be USDA Organic first, so every organic rule applies.',
      'A forage-based diet with no grain, and at least 150 days a year of grazing.',
      'Grazing makes up a larger share of the diet than the organic rule alone requires.',
      'The slaughter or processing plant must also be certified.',
    ],
    lacks: [
      'We could not find a public list of OPT certified farms, so this page can only show farms we were able to confirm.',
    ],
    related: ['usda-organic', 'aga', 'agw-grassfed'],
  },
  awa: {
    h1: 'Animal Welfare Approved farms',
    tagline: 'Welfare label, not grass-only',
    one: 'Animal Welfare Approved farm',
    many: 'Animal Welfare Approved farms',
    section: 'awa',
    lede: 'Farms certified by A Greener World for animal welfare. This is a welfare certification, not a grass-fed one.',
    gives: [
      'Continuous access to pasture or range, and a pasture management plan.',
      'Slaughter at an audited plant.',
      'Auditors visit every farm in the program at least once a year.',
    ],
    lacks: [
      "It doesn't by itself prohibit grain. Look for the separate Certified Grassfed by AGW mark if grass-only feeding matters to you.",
    ],
    related: ['agw-grassfed'],
  },
  'usda-organic': {
    h1: 'USDA Organic farms',
    tagline: 'Organic food, not grass-only',
    one: 'USDA Organic farm',
    many: 'USDA Organic farms',
    section: 'usda-organic',
    lede: 'Farms with certified organic livestock, each one confirmed in the USDA Organic Integrity Database.',
    gives: [
      "The farm's animals are certified organic, so its meat, eggs or milk can be sold as organic.",
      'Organic feed, and for ruminants at least 120 days a year on pasture with at least 30 percent of their diet from grazing, averaged over the grazing season.',
      "An animal treated with antibiotics can't be sold as organic, and hormones can't be used for growth or production.",
      'Every certified farm is inspected each year by a USDA-accredited certifying agent.',
    ],
    lacks: [
      "Organic rules don't ban grain, and the grazing minimum doesn't apply during the final finishing period. Organic alone does not mean grass-fed or grass-finished.",
      'If you want both organic and grass-only, look for the OPT seal.',
    ],
    related: ['usda-organic-dairy', 'usda-organic-pasture', 'opt'],
  },
  'usda-organic-dairy': {
    h1: 'Farms with certified organic dairy products',
    tagline: 'Organic dairy, animals not certified',
    one: 'farm with organic dairy products',
    many: 'farms with organic dairy products',
    section: 'organic-labels',
    lede: "Farms whose milk, butter or cheese is certified organic, even though their animals aren't certified as livestock.",
    gives: [
      "The farm's milk, butter or cheese itself is certified organic. Each farm page lists which products.",
    ],
    lacks: [
      "The farm's animals aren't certified as organic livestock, so the label covers the dairy products only.",
      'Organic does not mean grass-fed: organic milk can come from cows fed organic grain.',
    ],
    related: ['usda-organic', 'opt', 'usda-organic-pasture'],
  },
  'usda-organic-pasture': {
    h1: 'Farms with certified organic pasture',
    tagline: 'Organic land, food not organic',
    one: 'farm with organic pasture',
    many: 'farms with organic pasture',
    section: 'organic-labels',
    warning: "Organic pasture is not organic food. These farms' meat and milk can't be sold as organic.",
    lede: 'Farms whose pasture or hay is certified organic, each one confirmed in the USDA Organic Integrity Database.',
    gives: [
      'The land the animals graze, or the hay they eat, is certified organic.',
    ],
    lacks: [
      "The animals are not certified organic, so their meat and milk can't be sold as organic.",
      "Organic livestock rules also cover feed during finishing, health care and records from birth. Those rules don't apply to these animals.",
    ],
    related: ['usda-organic', 'usda-organic-dairy'],
  },
};

export const isOrganicProgram = (p) => p.startsWith('usda-organic');

// Tag class that matches how FarmRow shows the same label.
export const certTagClass = (p) => (p === 'usda-organic-pasture' ? 'pasture' : p === 'usda-organic' || p === 'usda-organic-dairy' ? 'organic' : 'cert');

// Where each farm's certification was confirmed, worded the way the farm pages word it.
export const certSourceName = (p) => (isOrganicProgram(p) ? 'the USDA Organic Integrity Database' : "the certifier's own listing");

export const certPath = (p) => `/certifications/${p}/`;

export const holdsCert = (f, p) => (f.certifications ?? []).some((c) => c.program === p);

export function certFarms(p, farms = loadPublishedFarms()) {
  return farms.filter((f) => holdsCert(f, p));
}

// Every program in display order with its farms. Only programs defined in CERTIFICATIONS.
export function certPrograms(farms = loadPublishedFarms()) {
  return CERT_ORDER.filter((p) => CERTIFICATIONS[p] && CERT_PAGES[p]).map((p) => ({ program: p, cert: CERTIFICATIONS[p], page: CERT_PAGES[p], farms: certFarms(p, farms) }));
}

// "See the 11 USDA Organic farms" or "See the AGA certified farm".
export const certButtonText = (p, n) => (n === 1 ? `See the ${CERT_PAGES[p].one}` : `See the ${n} ${CERT_PAGES[p].many}`);

export const certIndexable = (n) => n >= INDEX_THRESHOLD;
