import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { guideCard } from '../../../lib/og.mjs';

export async function getStaticPaths() {
  const articles = await getCollection('articles');
  return articles.map((a) => ({ params: { slug: a.id }, props: { article: a } }));
}

export const GET: APIRoute = async ({ props }) => {
  const d = props.article.data;
  const png = await guideCard({ title: d.title, kind: d.kind, updated: d.updated });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
