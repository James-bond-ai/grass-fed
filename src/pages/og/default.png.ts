import { defaultCard } from '../../lib/og.mjs';
import { loadPublishedFarms } from '../../data/farms.mjs';

export async function GET() {
  const png = await defaultCard({ farmCount: loadPublishedFarms().length });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
}
