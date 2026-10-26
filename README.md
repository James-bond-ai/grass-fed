# grassfed.food

A nationwide directory of US farms selling grass-fed meat and dairy, plus buying guides. Built with Astro, hosted on GitHub Pages, and maintained by scheduled Claude agents.

- Architecture: `docs/2026-10-26_architecture.md`
- Agent instructions: `ops/agents/`
- Farm listings: `data/farms/` (one JSON file per farm)
- Articles: `src/content/articles/`

## Commands

| Command | What it does |
|---|---|
| `npm run validate` | Checks farm data and articles against the site's rules. Must pass before any commit. |
| `npm run validate -- --drafts` | Also checks drafts awaiting review. |
| `npm run build` | Builds the static site into `dist/`. |
| `npm run dev` | Local preview. |

Every push to `main` runs validation and the build in GitHub Actions and deploys to grassfed.food only if both pass.
