// Google ratings for farms (data/ratings/google.json, refreshed weekly).
// A rating is shown only when the place match was confirmed by the
// Compliance agent and the rating is no more than 30 days old, as Google's
// terms require.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(ROOT, 'data', 'ratings', 'google.json');
export const TOP_MIN_REVIEWS = 100; // more than 100 reviews to enter the top 10
const MAX_AGE_DAYS = 30;

let cache;
function all() {
  if (cache === undefined) cache = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};
  return cache;
}

export function googleRating(slug, now = new Date()) {
  const r = all()[slug];
  if (!r || r.status !== 'confirmed' || typeof r.rating !== 'number' || !r.fetched_at) return null;
  if ((now - Date.parse(r.fetched_at)) / 864e5 > MAX_AGE_DAYS) return null;
  return { rating: r.rating, count: r.count ?? 0, url: r.maps_uri, fetched_at: r.fetched_at };
}

// Farms with more than TOP_MIN_REVIEWS Google reviews, best rated first,
// ties broken by more reviews, then name.
export function topRated(farms, n = 10) {
  return farms
    .map((f) => ({ farm: f, g: googleRating(f.slug) }))
    .filter((x) => x.g && x.g.count > TOP_MIN_REVIEWS)
    .sort((a, b) => b.g.rating - a.g.rating || b.g.count - a.g.count || a.farm.farm_name.localeCompare(b.farm.farm_name))
    .slice(0, n);
}
