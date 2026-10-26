// Loads farm listings from data/farms at build time. Plain Node so the
// Astro config, the pages, and the validator all read the same data.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
