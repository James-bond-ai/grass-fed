// Bulk beef: farms that raise beef and sell quarter, half or whole animals.
// Used by /bulk-beef/ pages, the noindex list and state page links.
import { STATES, INDEX_THRESHOLD, servesState } from './states.mjs';
import { loadPublishedFarms } from './farms.mjs';

export const BULK_GUIDE = '/guides/how-to-buy-a-quarter-cow/';

export const sellsBulkBeef = (f) => f.bulk_shares === true && (f.species ?? []).includes('beef');

export function loadBulkBeefFarms() {
  return loadPublishedFarms().filter(sellsBulkBeef);
}

// States with at least one bulk beef farm based there, with their farms.
export function bulkBeefStates(farms = loadBulkBeefFarms()) {
  return STATES.map((s) => ({ st: s, farms: farms.filter((f) => f.state === s.abbr) })).filter((x) => x.farms.length > 0);
}

// Bulk beef farms in other states that ship to this one.
export const bulkShipIn = (farms, abbr) => farms.filter((f) => f.state !== abbr && servesState(f, abbr));

export const bulkIndexable = (n) => n >= INDEX_THRESHOLD;
