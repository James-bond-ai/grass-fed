import { loadPublishedFarms } from '../data/farms.mjs';
import { CERTIFICATIONS, CHANNELS, reach, feedingLabel, isOrganic, hasOrganicPasture } from '../data/states.mjs';

// Certification labels exactly as a farm row shows them.
function certLabels(f) {
  const all = f.certifications ?? [];
  const out = [];
  if (isOrganic(f)) {
    const dairyOnly = !all.some((c) => c.program === 'usda-organic') && all.some((c) => c.program === 'usda-organic-dairy');
    out.push(dairyOnly ? 'Organic dairy products' : 'USDA Organic');
  }
  if (hasOrganicPasture(f)) out.push('Organic pasture');
  for (const c of all) if (CERTIFICATIONS[c.program] && !c.program.startsWith('usda-organic')) out.push(CERTIFICATIONS[c.program].short);
  return [...new Set(out)];
}

// Local delivery in a few words, from the farm's own delivery details.
function localDelivery(f, r) {
  if (r.radius) return `Within ${r.radius} miles of the farm`;
  if (r.localAreas.length) {
    const shown = r.localAreas.slice(0, 2).join('; ');
    const more = r.localAreas.length - 2;
    return more > 0 ? `${shown}; and ${more} more` : shown;
  }
  return (f.sales_channels ?? []).includes('local-delivery') ? 'Yes, area not listed' : '';
}

export function GET() {
  const farms = loadPublishedFarms().map((f) => {
    const r = reach(f);
    const ch = f.sales_channels ?? [];
    const l = feedingLabel(f);
    const ways = ch.filter((c) => !c.startsWith('ships-') && c !== 'local-delivery' && CHANNELS[c]).map((c) => CHANNELS[c]);
    const delivery = localDelivery(f, r);
    if (delivery) ways.push(CHANNELS['local-delivery']);
    return {
      slug: f.slug, name: f.farm_name, city: f.city, state: f.state,
      species: f.species, finish: f.feeding_claim?.category ?? 'unknown',
      certified: (f.certifications ?? []).map((c) => c.program),
      bulk: !!f.bulk_shares, channels: ch, verified: f.last_verified_at,
      // Added for the shortlist comparison page.
      website: f.website,
      ordering_url: f.ordering_url || '',
      feed: { level: l.level, parts: l.parts.map((p) => ({ text: p.text, ok: p.ok })) },
      cert_labels: certLabels(f),
      ways,
      ships: { nationwide: r.nationwide, states: [...r.shipsTo], regional: !r.nationwide && r.shipsTo.size === 0 && ch.includes('ships-regional') },
      local_delivery: delivery,
      availability: f.availability && f.availability.status !== 'available' ? f.availability.note ?? '' : '',
    };
  });
  return new Response(JSON.stringify(farms), { headers: { 'Content-Type': 'application/json' } });
}
