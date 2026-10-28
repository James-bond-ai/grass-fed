// Paths that must stay out of the sitemap and carry a noindex tag:
// state pages below the farm threshold.
import { STATES, INDEX_THRESHOLD } from './states.mjs';
import { loadPublishedFarms, farmsByState } from './farms.mjs';
import { topRated } from './ratings.mjs';

export function noindexPaths() {
  const byState = farmsByState(loadPublishedFarms());
  const paths = STATES.filter((s) => (byState[s.abbr]?.length ?? 0) < INDEX_THRESHOLD).map(
    (s) => `/farms/${s.slug}/`
  );
  if (topRated(loadPublishedFarms(), 3).length < 3) paths.push('/top-rated/');
  return paths;
}
