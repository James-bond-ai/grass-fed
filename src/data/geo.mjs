// Approximate farm locations for distance sorting, worked out at build time.
// Order of preference: the farm's own lat/lng if the record has them, then the
// centre of its ZIP code, then the centre of its town. Never shown as an
// address; the matcher only uses it to say roughly how many miles away a farm is.
//
// Lookup tables live in public/geo/ so the browser can use the same data:
//   zip/{first digit}.json  {"78701": [lat, lng, "TX"], ...}
//   city/{ST}.json          [["Austin", lat, lng], ...]  (town centre = mean of its ZIPs)
// Source: ZIP centroids from the `zipcodes` npm package (BSD licence, data from
// federalgovernmentzipcodes.us), rounded to 2 decimals. Regenerate only if a
// farm town is missing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const GEO_DIR = path.join(ROOT, 'public', 'geo');

const cache = { zip: {}, city: {} };
const readJson = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null);

export const cityKey = (s) =>
  String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\bsaint\b/g, 'st').replace(/\bst\.?\s/g, 'st ').replace(/\bmount\b/g, 'mt').replace(/\bmt\.?\s/g, 'mt ')
    .replace(/\bfort\b/g, 'ft').replace(/\bft\.?\s/g, 'ft ')
    .replace(/[^a-z0-9]+/g, ' ').trim();

export function zipTable(digit) {
  return (cache.zip[digit] ??= readJson(path.join(GEO_DIR, 'zip', `${digit}.json`)) ?? {});
}
export function cityTable(abbr) {
  if (!cache.city[abbr]) {
    const rows = readJson(path.join(GEO_DIR, 'city', `${abbr}.json`)) ?? [];
    cache.city[abbr] = new Map(rows.map(([n, la, lo]) => [cityKey(n), [la, lo]]));
  }
  return cache.city[abbr];
}

// Returns { lat, lng, by: 'farm' | 'zip' | 'city' } or null.
export function farmCoords(f) {
  if (typeof f.lat === 'number' && typeof f.lng === 'number') return { lat: f.lat, lng: f.lng, by: 'farm' };
  const zip = String(f.zip ?? '').slice(0, 5);
  if (/^\d{5}$/.test(zip)) {
    const z = zipTable(zip[0])[zip];
    if (z && z[2] === f.state) return { lat: z[0], lng: z[1], by: 'zip' };
  }
  const c = cityTable(f.state).get(cityKey(f.city));
  if (c) return { lat: c[0], lng: c[1], by: 'city' };
  return null;
}
