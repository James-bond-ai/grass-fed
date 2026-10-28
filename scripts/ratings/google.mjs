// Weekly Google rating refresh, run by .github/workflows/ratings.yml.
//
// 1. Match: farms with no Google place yet get one Text Search
//    (fields: id, name, address; billed as Text Search Pro).
//    A result is kept only if its name and state match the farm, and it is
//    stored as "pending" until the Compliance agent confirms it.
// 2. Refresh: pending and confirmed places get a Place Details call for
//    rating, review count and Maps link (billed as Place Details Enterprise).
//
// Free-tier guard: Google gives 1,000 Enterprise and 5,000 Pro calls a month.
// We stop at 900 and 4,000, tracked in data/ratings/usage.json, so the
// account is never billed. Google's terms allow keeping ratings up to 30 days;
// the site hides any rating older than that.
import fs from 'node:fs';
import path from 'node:path';
import { loadPublishedFarms } from '../../src/data/farms.mjs';
import { STATE_BY_ABBR } from '../../src/data/states.mjs';

const KEY = process.env.GOOGLE_PLACES_API_KEY;
const DIR = path.resolve('data/ratings');
const DATA = path.join(DIR, 'google.json');
const USAGE = path.join(DIR, 'usage.json');
const CAP = { details: 900, search: 4000 };
const PER_RUN_DETAILS = 210; // about 4.3 runs a month, stays under 900
const REFRESH_AFTER_DAYS = 6;
const RETRY_UNMATCHED_DAYS = 90;

if (!KEY) {
  console.log('GOOGLE_PLACES_API_KEY is not set; skipping the rating refresh.');
  process.exit(0);
}

const today = new Date().toISOString().slice(0, 10);
const month = today.slice(0, 7);
const days = (d) => (d ? (Date.parse(today) - Date.parse(d)) / 864e5 : Infinity);
const read = (f, fallback) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : fallback);

fs.mkdirSync(DIR, { recursive: true });
const ratings = read(DATA, {});
let usage = read(USAGE, { month, details: 0, search: 0 });
if (usage.month !== month) usage = { month, details: 0, search: 0 };

const STOP = new Set(['the', 'farm', 'farms', 'ranch', 'ranches', 'llc', 'inc', 'co', 'company', 'and', 'of', 'meats', 'meat', 'beef', 'cattle', 'family', 'grassfed', 'grass', 'fed']);
const words = (s) => (s ?? '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w));
function nameMatches(a, b) {
  const A = new Set(words(a));
  const B = new Set(words(b));
  if (!A.size || !B.size) return a.trim().toLowerCase() === b.trim().toLowerCase();
  const shared = [...A].filter((w) => B.has(w)).length;
  return shared / Math.min(A.size, B.size) >= 0.99 || shared / Math.max(A.size, B.size) >= 0.6;
}
function inState(address, abbr) {
  const name = STATE_BY_ABBR[abbr]?.name ?? '';
  return new RegExp(`\\b${abbr}\\b`).test(address ?? '') || (name && (address ?? '').includes(name));
}

async function api(url, opts, fields) {
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': fields },
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

const farms = loadPublishedFarms();
let searched = 0;
let refreshed = 0;

// 1. Match
for (const f of farms) {
  const r = ratings[f.slug];
  if (r && (r.status !== 'none' || days(r.checked_at) < RETRY_UNMATCHED_DAYS)) continue;
  if (usage.search >= CAP.search) break;
  const q = `${f.farm_name} ${f.city ?? ''} ${STATE_BY_ABBR[f.state]?.name ?? f.state}`.trim();
  let data;
  try {
    data = await api('https://places.googleapis.com/v1/places:searchText', { method: 'POST', body: JSON.stringify({ textQuery: q, pageSize: 3, regionCode: 'US' }) }, 'places.id,places.displayName,places.formattedAddress');
  } catch (e) {
    console.log(`search failed for ${f.slug}: ${e.message}`);
    break;
  }
  usage.search++;
  searched++;
  const hit = (data.places ?? []).find((p) => nameMatches(f.farm_name, p.displayName?.text ?? '') && inState(p.formattedAddress, f.state));
  ratings[f.slug] = hit
    ? { status: 'pending', place_id: hit.id, place_name: hit.displayName.text, place_address: hit.formattedAddress, query: q, checked_at: today }
    : { status: 'none', query: q, checked_at: today };
}

// 2. Refresh ratings, oldest first
const due = Object.entries(ratings)
  .filter(([slug, r]) => ['pending', 'confirmed'].includes(r.status) && r.place_id && farms.some((f) => f.slug === slug) && days(r.fetched_at) >= REFRESH_AFTER_DAYS)
  .sort((a, b) => (a[1].fetched_at ?? '').localeCompare(b[1].fetched_at ?? ''));
for (const [slug, r] of due) {
  if (refreshed >= PER_RUN_DETAILS || usage.details >= CAP.details) break;
  try {
    const d = await api(`https://places.googleapis.com/v1/places/${encodeURIComponent(r.place_id)}`, { method: 'GET' }, 'rating,userRatingCount,googleMapsUri');
    usage.details++;
    refreshed++;
    r.rating = d.rating ?? null;
    r.count = d.userRatingCount ?? 0;
    r.maps_uri = d.googleMapsUri ?? null;
    r.fetched_at = today;
  } catch (e) {
    console.log(`details failed for ${slug}: ${e.message}`);
    if (/40[34]/.test(e.message)) break;
  }
}

const sorted = Object.fromEntries(Object.entries(ratings).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(DATA, JSON.stringify(sorted, null, 2) + '\n');
fs.writeFileSync(USAGE, JSON.stringify(usage, null, 2) + '\n');
console.log(`searched ${searched}, refreshed ${refreshed}; this month: ${usage.search} searches, ${usage.details} detail calls`);
