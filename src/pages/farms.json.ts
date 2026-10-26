import { loadPublishedFarms } from '../data/farms.mjs';
export function GET() {
  const farms = loadPublishedFarms().map((f) => ({
    slug: f.slug, name: f.farm_name, city: f.city, state: f.state,
    species: f.species, finish: f.feeding_claim?.category ?? 'unknown',
    certified: (f.certifications ?? []).map((c) => c.program),
    bulk: !!f.bulk_shares, channels: f.sales_channels ?? [], verified: f.last_verified_at,
  }));
  return new Response(JSON.stringify(farms), { headers: { 'Content-Type': 'application/json' } });
}
