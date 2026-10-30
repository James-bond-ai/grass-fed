// Compact farm records for the home page farm matcher. Built once at build
// time and served as /match.json, so the matcher runs in the browser with no server.
import { loadPublishedFarms } from './farms.mjs';
import { reach, feedingLabel, CERTIFICATIONS } from './states.mjs';

const PICKUP = ['on-farm-store', 'farm-pickup', 'farmers-market', 'csa'];

export function matchRecords(farms = loadPublishedFarms()) {
  return farms.map((f) => {
    const r = reach(f);
    const ch = f.sales_channels ?? [];
    const l = feedingLabel(f);
    // Organic pasture is a weaker label (the animals are not certified), so it doesn't count here.
    const cert = (f.certifications ?? []).find((c) => CERTIFICATIONS[c.program] && c.program !== 'usda-organic-pasture');
    const dairyOnly = (f.species ?? []).length > 0 && (f.species ?? []).every((s) => s.startsWith('dairy-'));
    return {
      s: f.slug,
      n: f.farm_name,
      c: f.city,
      st: f.state,
      sp: f.species ?? [],
      // Feeding level and the label parts, so the browser draws the same pill as the rest of the site.
      fl: l.level,
      fp: l.parts.map((p) => [p.text, p.ok]),
      dy: dairyOnly ? 1 : 0,
      ce: cert ? CERTIFICATIONS[cert.program].short : '',
      bk: f.bulk_shares ? 1 : 0,
      pk: ch.some((c) => PICKUP.includes(c)) || r.pickup.length > 0 ? 1 : 0,
      dl: ch.includes('local-delivery') || r.localAreas.length > 0 || !!r.radius ? 1 : 0,
      nw: r.nationwide ? 1 : 0,
      to: [...r.shipsTo],
      rg: !r.nationwide && r.shipsTo.size === 0 && ch.includes('ships-regional') ? 1 : 0,
      o: f.ordering_url || '',
      w: f.website,
      av: f.availability && f.availability.status !== 'available' ? f.availability.note ?? '' : '',
    };
  });
}
