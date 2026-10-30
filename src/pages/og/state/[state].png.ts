import type { APIRoute } from 'astro';
import { stateCard, cardBatch } from '../../../lib/og.mjs';
import { stateCoverage } from '../../../data/farms.mjs';
import { STATES } from '../../../data/states.mjs';

const cards = cardBatch(stateCard);

export function getStaticPaths() {
  const { byState } = stateCoverage();
  const paths = STATES.map((st) => ({ params: { state: st.slug }, props: { card: { stateName: st.name, ...byState[st.abbr] } } }));
  cards.start(paths.map((p) => [p.params.state, p.props.card]));
  return paths;
}

export const GET: APIRoute = async ({ params, props }) => {
  const png = await cards.get(params.state, props.card);
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
