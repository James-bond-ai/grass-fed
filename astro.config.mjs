import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { noindexPaths } from './src/data/noindex.mjs';

export default defineConfig({
  site: 'https://grassfed.food',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // The corrections and list-your-farm pages were removed (no contact routes on the site).
  // Old links land on the closest page instead of a 404.
  redirects: {
    '/corrections/': '/methodology/',
    '/list-your-farm/': '/about/',
  },
  integrations: [
    sitemap({
      filter: (page) => !noindexPaths().some((p) => page.endsWith(p)),
    }),
  ],
});
