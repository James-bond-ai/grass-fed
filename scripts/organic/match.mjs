#!/usr/bin/env node
// Matches grassfed.food farms against the USDA Organic Integrity snapshot.
//
// Input:  the organic-data branch file us-operations.json (path as first argument,
//         default data/organic/us-operations.json).
// Output: adds a `usda-organic` certification to farms with an exact match
//         (same normalized name or listed other name, same state, operation and LIVESTOCK scope certified),
//         and writes ops/organic-review.md listing possible matches for a person or agent to check.
//
// Usage:  node scripts/organic/match.mjs [path/to/us-operations.json] [--dry-run]

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const src = args.find((a) => a.endsWith('.json')) ?? path.join(ROOT, 'data/organic/us-operations.json');
const data = JSON.parse(fs.readFileSync(src, 'utf8'));

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

// Index operations by state.
const byState = {};
for (const op of data.operations) {
  const st = stateCode(op.state);
  if (!st) continue;
  const names = [op.name, ...String(op.other_names ?? '').split(/[;|,]/)].map(norm).filter(Boolean);
  (byState[st] ??= []).push({ ...op, st, names });
}

const farmsDir = path.join(ROOT, 'data/farms');
const today = new Date().toISOString().slice(0, 10);
const confirmed = [];
const possible = [];
for (const f of fs.readdirSync(farmsDir).filter((n) => n.endsWith('.json'))) {
  const file = path.join(farmsDir, f);
  const farm = JSON.parse(fs.readFileSync(file, 'utf8'));
  const key = norm(farm.farm_name);
  const ops = byState[farm.state] ?? [];
  const host = (u) => { try { return new URL(/^https?:/.test(u) ? u : `https://${u}`).hostname.replace(/^www\./, ''); } catch { return ''; } };
  const farmHost = host(farm.website);
  const distinct = key.split(' ').filter((w) => w.length >= 4);
  const sameCity = (o) => farm.city && o.city && o.city.trim().toLowerCase() === farm.city.trim().toLowerCase();
  // Exact: same normalized name, same website domain, or same city plus a shared distinctive name word.
  const exact = ops.filter((o) =>
    (key.length >= 3 && o.names.includes(key)) ||
    (farmHost && o.website && host(o.website) === farmHost) ||
    (sameCity(o) && distinct.length && o.names.some((n) => distinct.some((w) => n.split(' ').includes(w)))));
  // The badge means the farm's animals are certified organic, so the LIVESTOCK scope must be certified.
  const isCert = exact.filter((o) => certified(o.status) && certified(o.livestock));
  if (isCert.length) {
    const op = isCert[0];
    const has = (farm.certifications ?? []).some((c) => c.program === 'usda-organic');
    confirmed.push({ farm: farm.farm_name, state: farm.state, op: op.name, city: op.city, certifier: op.certifier, livestock: op.livestock, added: !has });
    if (!has && !dry) {
      farm.certifications = [...(farm.certifications ?? []), {
        body: op.certifier || 'USDA-accredited certifier',
        program: 'usda-organic',
        cert_id: op.id || '',
        evidence_url: data.source_url,
        evidence_note: `Found as "${op.name}" (${op.city || 'city not listed'}, ${farm.state}) with status ${op.status} in the USDA Organic Integrity snapshot of ${data.snapshot}.`,
        verified_on: today,
      }];
      fs.writeFileSync(file, JSON.stringify(farm, null, 2) + '\n');
    }
    continue;
  }
  // Possible matches: shared distinctive word in the same state, or same city.
  const words = distinct;
  const near = (exact.length ? exact : ops.filter((o) => certified(o.status) && o.names.some((n) => words.some((w) => n.split(' ').includes(w)))))
    .filter((o) => !farm.city || !o.city || o.city.toLowerCase() === farm.city.toLowerCase() || words.length)
    .slice(0, 5);
  if (near.length) possible.push({ farm: farm.farm_name, slug: farm.slug, state: farm.state, city: farm.city, near: near.map((o) => `${o.name} (${o.city || '?'}; operation ${o.status}; livestock ${o.livestock || 'not certified'}; ${o.certifier})`) });
}

const lines = [
  '# Organic review list',
  '',
  `Generated ${today} from the USDA Organic Integrity snapshot of ${data.snapshot}. These farms have a possible but not exact match. Check each against the farm's own site and the certifier, then add or reject \`usda-organic\` by hand.`,
  '',
  '| Farm | State | City | Possible USDA records |',
  '|---|---|---|---|',
  ...possible.map((p) => `| ${p.farm} (\`${p.slug}\`) | ${p.state} | ${p.city} | ${p.near.join('<br>')} |`),
  '',
];
if (!dry) fs.writeFileSync(path.join(ROOT, 'ops/organic-review.md'), lines.join('\n'));
console.log(`Exact certified matches: ${confirmed.length} (${confirmed.filter((c) => c.added).length} newly added)`);
for (const c of confirmed) console.log(`  ${c.farm} [${c.state}] -> ${c.op}, ${c.city}; ${c.certifier}; livestock: ${c.livestock || 'n/a'}`);
console.log(`Possible matches for review: ${possible.length}`);
