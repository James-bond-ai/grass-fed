// Site search ranking. Plain JavaScript so the build (src/pages/search.json.ts),
// the browser (src/components/SiteSearch.astro) and a quick Node check share it.

// No accents, lower case, letters and digits only: "Café & Co." becomes "cafe and co".
export const norm = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// Fold simple plurals so "eggs" finds "egg" and "goats" finds "goat".
export const stem = (w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
export const words = (s) => {
  const n = norm(s);
  return n ? n.split(' ').map(stem) : [];
};

// A searchable field. `w` is its weight; `sub` also allows a match inside a word
// or across a space (so "bluebird" finds "Blue Bird Farm").
const field = (text, w, sub = false) => {
  const ws = words(text);
  return { ws, w, sub, compact: sub ? ws.join('') : '' };
};

// 3 for a whole-word match, 2 for a word that starts with the query, 1 for a match inside.
function tokenScore(t, f) {
  let best = 0;
  for (const w of f.ws) {
    if (w === t) return 3;
    if (best < 2 && w.startsWith(t)) best = 2;
  }
  if (!best && f.sub && t.length >= 3 && f.compact.includes(t)) best = 1;
  return best;
}

// Every query word must match some field. Extra credit when the name starts with
// or equals the whole query.
function scoreRecord(q, r) {
  let total = 0;
  for (const t of q.ws) {
    let best = 0;
    for (const f of r.fields) best = Math.max(best, tokenScore(t, f) * f.w);
    if (!best) return 0;
    total += best;
  }
  const name = r.fields[0].ws.join(' ');
  if (name === q.phrase) total += 30;
  else if (name.startsWith(q.phrase)) total += 15;
  else if ((' ' + name).includes(' ' + q.phrase)) total += 6;
  return total;
}

// Turn the compact /search.json index into searchable records.
export function prepare(index) {
  const stateName = Object.fromEntries((index.s ?? []).map(([, name, abbr]) => [abbr, name]));
  const farms = (index.f ?? []).map(([slug, name, city, st, label, extra]) => ({
    type: 'farm', slug, name, city, st, label,
    fields: [field(name, 4, true), field(city, 3, true), field(`${stateName[st] ?? ''} ${st}`, 2), field(extra, 1)],
  }));
  const states = (index.s ?? []).map(([slug, name, abbr, n]) => ({
    type: 'state', slug, name, abbr, n,
    fields: [field(name, 4, true), field(abbr, 4)],
  }));
  const guides = (index.g ?? []).map(([slug, title, description]) => ({
    type: 'guide', slug, title,
    fields: [field(title, 3), field(description, 1)],
  }));
  return { farms, states, guides };
}

const rank = (list, q) =>
  list
    .map((r, i) => ({ r, i, s: scoreRecord(q, r) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i);

export const LIMITS = { farm: 8, farmWithOthers: 6, state: 4, guide: 3 };

// Returns the groups to show, in order, each with its shown items and total matches.
export function search(data, query) {
  const ws = words(query);
  if (!ws.length) return { query: '', groups: [], total: 0 };
  const q = { ws, phrase: ws.join(' ') };
  const farms = rank(data.farms, q);
  const states = rank(data.states, q);
  const guides = rank(data.guides, q);
  const others = states.length + guides.length > 0;
  const pick = (list, n) => list.slice(0, n).map((x) => x.r);
  const groups = [
    { type: 'farm', label: 'Farms', items: pick(farms, others ? LIMITS.farmWithOthers : LIMITS.farm), total: farms.length },
    { type: 'state', label: 'States', items: pick(states, LIMITS.state), total: states.length },
    { type: 'guide', label: 'Guides', items: pick(guides, LIMITS.guide), total: guides.length },
  ].filter((g) => g.total > 0);
  // Farms come first, unless a state is the better match ("texas", "TX", "californ").
  if (states.length && (!farms.length || states[0].s > farms[0].s)) groups.sort((a, b) => (b.type === 'state') - (a.type === 'state'));
  return { query: norm(query), groups, total: farms.length + states.length + guides.length };
}
