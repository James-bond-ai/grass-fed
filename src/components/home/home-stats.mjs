// Build-time figures for the home page proof band and "Freshly verified" strip.
// Plain functions so they can be tested with node against the farm data.
import { CERTIFICATIONS } from '../../data/states.mjs';

const DAY = 864e5;
const toTime = (d) => Date.parse(String(d).length === 10 ? `${d}T12:00:00Z` : d);

// Whole days between a YYYY-MM-DD date and `now`.
export function ageInDays(date, now = Date.now()) {
  return Math.floor((now - toTime(date)) / DAY);
}

// The farm holds at least one certification we track (confirmed with the certifier).
// Organic pasture certifies the land, not the animals, so it does not count here.
export const isCertified = (f) => (f.certifications ?? []).some((c) => CERTIFICATIONS[c.program] && c.program !== 'usda-organic-pasture');
// The farm says its animals are grass-fed and grass-finished.
export const saysGrassFinished = (f) => f.feeding_claim?.category === 'grass-finished';

// Figures for the proof band. The freshness window is the shortest of 30, 60
// or 90 days that covers at least half the listings, so the label always
// states the real window it counts.
export function proofStats(farms, now = Date.now()) {
  const total = farms.length;
  const states = new Set(farms.map((f) => f.state)).size;
  let windowDays = 30;
  let fresh = 0;
  for (const w of [30, 60, 90]) {
    windowDays = w;
    fresh = farms.filter((f) => f.last_verified_at && ageInDays(f.last_verified_at, now) <= w).length;
    if (fresh * 2 >= total) break;
  }
  const finishedOrCertified = farms.filter((f) => saysGrassFinished(f) || isCertified(f)).length;
  const latest = farms.map((f) => f.last_verified_at).filter(Boolean).sort().at(-1) ?? null;
  return { total, states, fresh, windowDays, finishedOrCertified, latest };
}

// Small stable hash (FNV-1a) so ties are broken the same way on every build.
function hash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

// The most recently verified farms, newest check first. Among farms checked on
// the same day, a state that already has a card waits until every other state
// with a farm checked that day has one, so the row spreads across the map.
// Remaining ties fall to a stable hash of the slug. No state gets more than
// `perStateCap` cards while farms from other states checked within
// `windowDays` of the latest check are still available.
export function freshlyVerified(farms, n = 10, { perStateCap = 3, windowDays = 45 } = {}) {
  const dated = farms
    .filter((f) => f.last_verified_at && f.slug && f.farm_name)
    .map((f) => ({ f, t: toTime(f.last_verified_at), h: hash(f.slug) }));
  const newest = Math.max(...dated.map((x) => x.t));
  const recent = dated.filter((x) => newest - x.t <= windowDays * DAY);
  const pool = recent.length >= Math.min(n, 4) ? recent : dated;
  const picks = [];
  const perState = new Map();
  const used = (x) => perState.get(x.f.state) ?? 0;
  const capped = (x) => (used(x) >= perStateCap ? 1 : 0);
  while (picks.length < n && pool.length) {
    let best = 0;
    for (let i = 1; i < pool.length; i++) {
      const a = pool[i];
      const b = pool[best];
      const better =
        capped(a) !== capped(b) ? capped(a) < capped(b)
        : a.t !== b.t ? a.t > b.t
        : used(a) !== used(b) ? used(a) < used(b)
        : a.h !== b.h ? a.h < b.h
        : a.f.slug < b.f.slug;
      if (better) best = i;
    }
    const [x] = pool.splice(best, 1);
    perState.set(x.f.state, (perState.get(x.f.state) ?? 0) + 1);
    picks.push(x.f);
  }
  return picks;
}
