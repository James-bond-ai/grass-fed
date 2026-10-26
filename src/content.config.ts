import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string().max(90),
    description: z.string().min(50).max(170),
    kind: z.enum(['guide', 'review', 'compare', 'best']),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    affiliate: z.boolean().default(false),
    image: z
      .object({ src: z.string().url(), alt: z.string().min(10), credit: z.string(), credit_url: z.string().url() })
      .optional(),
    sources: z
      .array(z.object({ title: z.string(), url: z.string().url() }))
      .min(1),
  }),
});

export const collections = { articles };
