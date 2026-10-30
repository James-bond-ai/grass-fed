import type { APIRoute } from 'astro';
import { farmCard, cardBatch } from '../../../lib/og.mjs';
import { loadPublishedFarms } from '../../../data/farms.mjs';
import { STATE_BY_ABBR } from '../../../data/states.mjs';

const cardArgs = (farm) => ({ farm, stateName: STATE_BY_ABBR[farm.state]?.name ?? farm.state });
const cards = cardBatch(farmCard);

export function getStaticPaths() {
  const farms = loadPublishedFarms();
  cards.start(farms.map((farm) => [farm.slug, cardArgs(farm)]));
  return farms.map((farm) => ({ params: { slug: farm.slug }, props: { farm } }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await cards.get(props.farm.slug, cardArgs(props.farm));
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
