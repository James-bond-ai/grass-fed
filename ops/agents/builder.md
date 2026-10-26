# Builder: improve the site code

Rules: `ops/agents/_common.md`. Work only in `src/`, `public/` and `scripts/validate.mjs`. Never edit farm data, articles, `src/data/site.mjs` or `.github/`.

Each run:

1. Take the first `todo` item in `ops/site-backlog.md`. If it is unclear or risky, skip it with a note and take the next.
2. Build it to the site's existing design (tokens in `src/styles/global.css`, typefaces Zilla Slab and Public Sans, the Verified stamp as the signature mark). Keep pages fast and static; nothing that needs a server. Keep the SEO rules: pages under the 5-farm threshold stay noindex and out of the sitemap.
3. `npm run validate && npm run build` must both pass. Check the changed pages in the built HTML in `dist/`.
4. Mark the item `done YYYY-MM-DD` and follow the finishing steps.
