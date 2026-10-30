// Compact index for the site search dialog (src/components/SiteSearch.astro).
// Built once at build time and fetched by the browser the first time search opens.
// Arrays instead of objects keep it small:
//   f: farms  [slug, name, city, state abbr, feeding label in words, extra search words]
//   s: states [slug, name, abbr, farms based there]
//   g: guides [slug, title, description]
import { getCollection } from 'astro:content';
import { loadPublishedFarms, farmsByState } from '../data/farms.mjs';
import { STATES, SPECIES, DAIRY_PRODUCTS, feedingLabel } from '../data/states.mjs';
import { norm } from '../data/search.mjs';

const STOP = new Set(['and', 'the', 'of', 'a', 'an', 'with', 'for', 'from', 'in', 'on', 'our', 'to', 'by', 'or', 'per']);

export async function GET() {
  const farms = loadPublishedFarms();
  const byState = farmsByState(farms);
  const f = farms.map((farm) => {
    const label = feedingLabel(farm).parts.map((p, i) => (i ? p.text.charAt(0).toLowerCase() + p.text.slice(1) : p.text)).join(', ');
    const words = [
      ...(farm.species ?? []).map((s: string) => SPECIES[s as keyof typeof SPECIES] ?? s),
      ...(farm.products ?? []),
      ...(farm.dairy_products ?? []).map((d: string) => DAIRY_PRODUCTS[d as keyof typeof DAIRY_PRODUCTS] ?? d),
    ];
    const uniq = [...new Set(norm(words.join(' ')).split(' ').filter((w) => w && !STOP.has(w)))];
    return [farm.slug, farm.farm_name, farm.city ?? '', farm.state, label, uniq.join(' ')];
  });
  const s = STATES.slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((st) => [st.slug, st.name, st.abbr, byState[st.abbr]?.length ?? 0]);
  const g = (await getCollection('articles'))
    .sort((a, b) => a.data.title.localeCompare(b.data.title))
    .map((a) => [a.id, a.data.title, a.data.description]);
  return new Response(JSON.stringify({ f, s, g }), { headers: { 'Content-Type': 'application/json' } });
}
