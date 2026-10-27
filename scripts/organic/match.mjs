#!/usr/bin/env node
// Labels grassfed.food farms from the USDA Organic Integrity snapshot.
//
// Three labels, each meaning something different to a shopper:
//   usda-organic          the farm's LIVESTOCK is certified organic (its meat, eggs or milk can be sold as organic)
//   usda-organic-dairy    the farm's dairy PRODUCTS are certified organic (handling scope: milk, butter, cheese...)
//   usda-organic-pasture  the farm's pasture or hay is certified organic, but its animals are not
//
// A farm is tied to a USDA operation by: the same normalized name, the same website domain,
// the same town plus a shared distinctive name word, or a hand-confirmed link in data/organic/reviewed.json.
// Every run recomputes all three labels, so a lapsed certification drops off automatically.
//
// Usage: node scripts/organic/match.mjs [path/to/us-operations.json] [--dry-run]

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const src = args.find((a) => a.endsWith('.json')) ?? path.join(ROOT, 'data/organic/us-operations.json');
const data = JSON.parse(fs.readFileSync(src, 'utf8'));
const reviewedPath = path.join(ROOT, 'data/organic/reviewed.json');
const reviewed = fs.existsSync(reviewedPath) ? JSON.parse(fs.readFileSync(reviewedPath, 'utf8')).reviewed ?? {} : {};
const LABELS = ['usda-organic', 'usda-organic-dairy', 'usda-organic-pasture'];

const STATE_NAMES = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE', 'district of columbia': 'DC', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
};
const stateCode = (s) => {
  const t = (s ?? '').trim();
  if (/^[A-Za-z]{2}$/.test(t)) return t.toUpperCase();
  return STATE_NAMES[t.toLowerCase()] ?? '';
};
const STOP = /\b(llc|l\.l\.c|inc|co|company|corp|corporation|ltd|lp|the|and|of|farms?|ranch(es)?|dairy|creamery|cattle|beef|family|homestead|meats?|organics?)\b/g;
const norm = (s) => (s ?? '').toLowerCase().replace(/&/g, ' and ').replace(/['’.]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(STOP, ' ').replace(/\s+/g, ' ').trim();
const certified = (s) => /certified/i.test(s ?? '') && !/surrender|revok|suspend/i.test(s ?? '');
const host = (u) => { try { return new URL(/^https?:/.test(u) ? u : `https://${u}`).hostname.replace(/^www\./, ''); } catch { return ''; } };

const byState = {};
const byId = {};
for (const op of data.operations) {
  const st = stateCode(op.state);
  const names = [op.name, ...String(op.other_names ?? '').split(/[;|,]/)].map(norm).filter(Boolean);
  const rec = { ...op, st, names };
  byId[op.id] = rec;
  if (st) (byState[st] ??= []).push(rec);
}

const farmsDir = path.join(ROOT, 'data/farms');
const today = new Date().toISOString().slice(0, 10);
const results = [];
const possible = [];
for (const f of fs.readdirSync(farmsDir).filter((n) => n.endsWith('.json'))) {
  const file = path.join(farmsDir, f);
  const farm = JSON.parse(fs.readFileSync(file, 'utf8'));
  const key = norm(farm.farm_name);
  const ops = byState[farm.state] ?? [];
  const farmHost = host(farm.website);
  const distinct = key.split(' ').filter((w) => w.length >= 4);
  const sameCity = (o) => farm.city && o.city && o.city.trim().toLowerCase() === farm.city.trim().toLowerCase();
  const linked = reviewed[farm.slug]?.usda_record ? [byId[reviewed[farm.slug].usda_record]].filter(Boolean) : [];
  const matched = [...new Set([...linked, ...ops.filter((o) =>
    (key.length >= 3 && o.names.includes(key)) ||
    (farmHost && o.website && host(o.website) === farmHost) ||
    (sameCity(o) && distinct.length && o.names.some((n) => distinct.some((w) => n.split(' ').includes(w)))))])]
    .filter((o) => certified(o.status));

  const sellsDairy = (farm.species ?? []).some((s) => s.startsWith('dairy-')) || (farm.dairy_products ?? []).length > 0;
  const want = {};
  for (const o of matched) {
    if (certified(o.livestock)) want['usda-organic'] ??= o;
    else if (sellsDairy && (o.organic_dairy_products ?? []).length) want['usda-organic-dairy'] ??= o;
    else if (o.organic_pasture) want['usda-organic-pasture'] ??= o;
  }
  if (want['usda-organic']) { delete want['usda-organic-dairy']; delete want['usda-organic-pasture']; }

  const others = (farm.certifications ?? []).filter((c) => !LABELS.includes(c.program));
  const prior = Object.fromEntries((farm.certifications ?? []).filter((c) => LABELS.includes(c.program)).map((c) => [c.program, c]));
  const added = Object.entries(want).map(([program, o]) => {
    const covers = program === 'usda-organic' ? 'livestock certified'
      : program === 'usda-organic-dairy' ? `dairy products certified (${o.organic_dairy_products.join(', ')}); livestock not certified`
      : 'pasture or hay certified; livestock not certified';
    return {
      body: o.certifier || 'USDA-accredited certifier',
      program,
      cert_id: o.id || '',
      evidence_url: data.source_url,
      evidence_note: `Matched to USDA record "${o.name}" (${o.city || 'city not listed'}, ${farm.state}), ${covers}, in the Organic Integrity snapshot of ${data.snapshot}.`,
      ...(program === 'usda-organic-dairy' ? { products: o.organic_dairy_products } : {}),
      verified_on: prior[program]?.cert_id === o.id ? prior[program].verified_on : today,
    };
  });
  const before = JSON.stringify(farm.certifications ?? []);
  farm.certifications = [...others, ...added];
  if (!farm.certifications.length) delete farm.certifications;
  const changed = before !== JSON.stringify(farm.certifications ?? []);
  if (added.length || changed) results.push({ farm: farm.farm_name, state: farm.state, labels: added.map((a) => a.program), changed });
  if (changed && !dry) fs.writeFileSync(file, JSON.stringify(farm, null, 2) + '\n');

  if (!added.length && !reviewed[farm.slug]) {
    const near = ops.filter((o) => sameCity(o) && o.names.some((n) => distinct.some((w) => n.split(' ').includes(w)))).slice(0, 5);
    if (near.length) possible.push({ farm: farm.farm_name, slug: farm.slug, state: farm.state, city: farm.city, near: near.map((o) => `${o.name} (${o.city || '?'}; ${o.status}; livestock ${o.livestock || 'not certified'}; ${o.certifier})`) });
  }
}

const lines = [
  '# Organic review list',
  '',
  `Generated ${today} from the USDA Organic Integrity snapshot of ${data.snapshot}. Possible matches the script could not settle. Confirm from the farm's own site whether the USDA record is the same operation, then add it to data/organic/reviewed.json (with "usda_record" if it is the same operation) and rerun the script.`,
  '',
  '| Farm | State | City | Possible USDA records |',
  '|---|---|---|---|',
  ...possible.map((p) => `| ${p.farm} (\`${p.slug}\`) | ${p.state} | ${p.city} | ${p.near.join('<br>')} |`),
  '',
];
if (!dry) fs.writeFileSync(path.join(ROOT, 'ops/organic-review.md'), lines.join('\n'));
const count = (p) => results.filter((r) => r.labels.includes(p)).length;
console.log(`Livestock certified: ${count('usda-organic')}, dairy products certified: ${count('usda-organic-dairy')}, pasture certified: ${count('usda-organic-pasture')}`);
for (const r of results) console.log(`  ${r.changed ? '*' : ' '} ${r.farm} [${r.state}]: ${r.labels.join(', ') || 'labels removed'}`);
console.log(`Possible matches for review: ${possible.length}`);
