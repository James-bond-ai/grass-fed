import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { noindexPaths } from './src/data/noindex.mjs';

export default defineConfig({
  site: 'https://grassfed.food',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !noindexPaths().some((p) => page.endsWith(p)),
    }),
  ],
});
