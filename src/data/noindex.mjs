// Paths that must stay out of the sitemap and carry a noindex tag:
// state, dairy, bulk beef and certification pages below the farm threshold.
import { STATES, INDEX_THRESHOLD, sellsDairy } from './states.mjs';
import { loadPublishedFarms, farmsByState } from './farms.mjs';
import { topRated } from './ratings.mjs';
import { loadBulkBeefFarms, bulkBeefStates } from './bulk.mjs';
import { certPrograms, certIndexable } from './certs.mjs';

export function noindexPaths() {
  const byState = farmsByState(loadPublishedFarms());
  const paths = STATES.filter((s) => (byState[s.abbr]?.length ?? 0) < INDEX_THRESHOLD).map(
    (s) => `/farms/${s.slug}/`
  );
  paths.push('/shortlist/'); // a visitor's own saved farms, never indexed
  const dairy = farmsByState(loadPublishedFarms().filter(sellsDairy));
  for (const s of STATES) {
    const k = dairy[s.abbr]?.length ?? 0;
    if (k > 0 && k < INDEX_THRESHOLD) paths.push(`/dairy/${s.slug}/`);
  }
  if (loadPublishedFarms().filter(sellsDairy).length < INDEX_THRESHOLD) paths.push('/dairy/');
  const bulk = loadBulkBeefFarms();
  for (const { st, farms } of bulkBeefStates(bulk)) if (farms.length < INDEX_THRESHOLD) paths.push(`/bulk-beef/${st.slug}/`);
  if (bulk.length < INDEX_THRESHOLD) paths.push('/bulk-beef/');
  for (const { program, farms } of certPrograms()) if (!certIndexable(farms.length)) paths.push(`/certifications/${program}/`);
  if (topRated(loadPublishedFarms(), 3).length < 3) paths.push('/top-rated/');
  return paths;
}
