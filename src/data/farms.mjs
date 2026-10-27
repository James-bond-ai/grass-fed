// Loads farm listings from data/farms at build time. Plain Node so the
// Astro config, the pages, and the validator all read the same data.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STATES, servesState } from './states.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const FARMS_DIR = path.join(ROOT, 'data', 'farms');

export function loadAllFarms() {
  if (!fs.existsSync(FARMS_DIR)) return [];
  return fs
    .readdirSync(FARMS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(FARMS_DIR, f), 'utf8')))
    .sort((a, b) => a.farm_name.localeCompare(b.farm_name));
}

export function loadPublishedFarms() {
  return loadAllFarms().filter((f) => f.listing_status === 'published');
}

export function farmsByState(farms) {
  const out = {};
  for (const f of farms) (out[f.state] ??= []).push(f);
  return out;
}

// For every state: how many published farms are based there, and how many farms
// in other states say they ship there. Used by the map, state lists and drop-downs.
export function stateCoverage() {
  const all = loadPublishedFarms();
  const nationwide = all.filter((f) => f.delivery?.ships_to === 'nationwide' || (f.sales_channels ?? []).includes('ships-nationwide')).length;
  const out = {};
  for (const s of STATES) {
    out[s.abbr] = {
      based: all.filter((f) => f.state === s.abbr).length,
      shipIn: all.filter((f) => f.state !== s.abbr && servesState(f, s.abbr)).length,
    };
  }
  return { byState: out, nationwide, total: all.length };
}
