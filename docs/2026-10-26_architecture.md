# grassfed.food: System Architecture

**Version:** 1.1, October 26, 2026
**Owner:** Harry
**Status:** Approved. Site built and deployed; informational only.

## 1. What the business is

grassfed.food is a nationwide US directory of grass-fed meat and dairy farms, paired with informational buying guides. It carries no affiliate links and no ads at launch. Revenue comes later from display advertising through a premium ad network (Journey by Mediavine or Raptive) once traffic qualifies; affiliate links may be added after that. Both switches live in `src/data/site.mjs` and only Harry changes them.

The positioning comes from the research: every existing directory is weak on at least one of filtering, freshness, or verification. grassfed.food wins on three things competitors do not do:

1. **Filters on the claims that matter:** grass-finished, certification, bulk shares (quarter or half cow), ships nationwide, on-farm pickup.
2. **A "last verified" date on every listing**, refreshed by an agent on a fixed schedule.
3. **Grass-fed-only comparisons** with price per pound and finishing method, which no current review site offers.

## 2. How it runs

| Layer | Choice | Why |
|---|---|---|
| Code and data | GitHub repo `james-bond-ai/grass-fed` | Single source of truth that every agent reads and writes |
| Site generator | Astro (static output) | Fast static HTML, content collections for farms and articles, built-in sitemap |
| Hosting | GitHub Pages via GitHub Actions | Free, deploys on every push to `main` |
| Domain | grassfed.food with enforced HTTPS | Custom domain is required for SEO credibility |
| Agents | Claude scheduled tasks, each a fresh session with the repo attached | No servers to run; each agent commits its work and the deploy follows automatically |
| Search on site | Prebuilt JSON index filtered in the browser | Works on static hosting; filtered views stay out of the search index |

**Constraint that shapes the agents:** agent sessions can reach the web only through search and page-fetch tools, not through scripts. Farm discovery and verification are therefore done by reading web pages, which suits a quality-over-volume directory.

## 3. The agents

Each agent has exactly one job, one schedule, and writes only to its own part of the repo. They coordinate through files, never by talking to each other.

| Agent | Job | Reads | Writes | Schedule (Pacific) |
|---|---|---|---|---|
| **Scout** | Finds new grass-fed farms from certifier listings, USDA local food data, state ag programs, and web search. Records facts and links only. | `data/farms/`, `ops/coverage.md` | `data/candidates/` | Daily, 1:40 am |
| **Verifier** | Checks each candidate and each listing older than 90 days against the farm's own website: site live, contact details, products, sales channels, verbatim feeding claim, certification cross-checked against the certifier. Promotes passing candidates to listings; marks failures. | `data/candidates/`, `data/farms/` | `data/farms/`, `data/rejected/` | Daily, 3:10 am |
| **Writer** | Writes the next article from the editorial queue, using only sourced facts. | `ops/editorial-queue.md`, `data/`, `docs/research/` | `src/content/drafts/` | Mon, Wed, Fri, 5:15 am |
| **Compliance** | Reviews every draft against the rules in section 5. Publishes drafts that pass; returns failures to the queue with reasons. Also audits live pages weekly. | `src/content/drafts/`, `src/content/articles/` | `src/content/articles/`, `ops/compliance-log.md` | Daily, 7:20 am |
| **Builder** | Works the site backlog: new state hubs once a state reaches 5 verified farms, template fixes, performance, schema markup. Never touches content or data. | `ops/site-backlog.md`, `data/farms/` | `src/` (code only) | Tue and Thu, 9:45 pm |
| **Monitor** | Runs link checks, build health, stale-listing counts, coverage gaps, and the traffic watch against ad network thresholds. Feeds problems to the other agents' queues and writes the weekly report. | Whole repo, live site | `ops/reports/`, queues | Mon, 6:35 am |

**Collision safety:** schedules are staggered so no two agents run at once. Every agent pulls before working, runs `npm run validate` before committing, and rebases before pushing. GitHub Actions runs the same validation on every push and refuses to deploy a failing build, so a bad commit cannot reach the live site.

## 4. Repository layout

```
data/
  farms/{slug}.json         Verified listings, one file per farm
  candidates/{slug}.json    Found by Scout, awaiting Verifier
  rejected/{slug}.json      Failed verification, with reason (prevents re-adding)
  affiliates.json           Approved programs and tracking links
  sources.json              Certifier and data sources with terms notes
src/
  content/articles/         Published guides, reviews, comparisons
  content/drafts/           Writer output awaiting Compliance
  pages/                    Astro templates
ops/
  agents/{agent}.md         Each agent's full instructions (its scheduled-task prompt points here)
  editorial-queue.md        Ordered article backlog
  site-backlog.md           Ordered code backlog
  coverage.md               Farm count by state, target states
  compliance-log.md         Every review decision with reasons
  reports/YYYY-MM-DD.md     Weekly Monitor reports
docs/
  research/                 The three research reports this design is based on
scripts/validate.mjs        Schema, compliance, and link rules enforced in CI
```

Keeping each agent's instructions in `ops/agents/` means the agents can be improved by editing a file, with full history in git.

## 5. Rules the system enforces

These are enforced twice: by the Compliance agent on every draft, and by `validate.mjs` in CI on every push.

### Listings
- Facts and links only. No descriptions or photos copied from Eatwild, LocalHarvest, or certifier sites. LocalHarvest's terms prohibit reuse outright.
- Feeding claims are stored and shown verbatim, labeled "farm-reported" unless a certifier listing confirms them.
- A certification badge appears only when the farm appears in that certifier's public listing, with the evidence URL and check date stored.
- Every listing shows its last verified date. Anything unverifiable for 12 months is unpublished.

### Content
- **No health outcome claims** ("lowers cholesterol," "heart-healthy," "anti-inflammatory," "weight loss"). Nutrition differences may be stated only with a citation and context; omega-3 comparisons must note that the absolute amounts in beef are small.
- **No "high in" or "rich in" omega-3** for beef or dairy.
- **No unqualified environmental claims** ("sustainable," "climate-friendly") unless attributed to a named certification.
- **No claims of hands-on testing.** Agents cannot buy and taste products, so comparisons are research-based and say so in a visible methodology note. This keeps the site within the FTC Consumer Reviews Rule, which prohibits fake or AI-generated reviews.
- **Raw milk pages** state legal status by state with a dated citation and a "not legal advice" note.

### Revenue switches
- Affiliates are off. While off, the validator rejects any paid link. When switched on, every page with affiliate links needs a disclosure above the first link and a "paid link" label beside each link; "affiliate link" alone does not meet FTC guidance.
- Ads are off. When switched on, ads stay visually separate from content and advertisers have no influence on listings or articles.
- Directory rankings are never influenced by money.

### SEO
- A state page is indexed only with at least 5 verified farms; a city page only with at least 5 farms in reach. Below that, the page is `noindex` or folded into the state page.
- Every state page carries unique data: farm count, bulk price per pound where known, raw milk status, last updated date.
- No star ratings in structured data for listed farms.

## 6. Launch scope

| Item | Launch target |
|---|---|
| Verified farm listings | Every state attempted; indexed state hubs only where 5 or more verified farms exist. Starting priority: TX, CA, CO, TN, VA, NC, OH, PA, WI, MO, MT, OR, WA, FL, GA |
| Articles | First 5 from the editorial queue: quarter cow buying guide, grass-fed vs grass-finished, certifications compared, how to vet a farm, raw milk laws by state |
| Core pages | Home with state/ZIP search, all-states map, farm profiles, certifications, methodology, affiliate disclosure, about, list your farm, corrections |

Full editorial queue (20 articles) and site structure are in `docs/research/`.

## 7. What Harry needs to do

| Action | When | Why |
|---|---|---|
| Set **Settings → Pages → Source** to GitHub Actions | Done | Enables the deploy workflow |
| Add DNS records for grassfed.food (4 A records to GitHub Pages, `www` CNAME to `james-bond-ai.github.io`) | Done | Points the domain at the site |
| Set the custom domain `grassfed.food` and enforce HTTPS in Pages settings | Now | Agents cannot change Pages settings |
| Create a Google Analytics 4 property and send Claude the measurement ID | Now | Premium ad networks verify traffic through GA4 |
| Apply to Journey by Mediavine or Raptive when Monitor flags the threshold in `ops/traffic.md` | When traffic qualifies | Agents cannot create accounts |
| Affiliate programs (researched in `docs/research/`) | Deferred | Informational-only for now |
| Register Google Search Console and Bing Webmaster Tools | After launch | Indexing and traffic data for the Monitor agent's reports |

**Deferred on purpose:** automated email outreach to farms. Unsolicited bulk email from an autonomous agent carries CAN-SPAM exposure and reputational risk. Farms will reach the site through a "List your farm" link instead; outreach can be added later with a sending domain and opt-out handling.

## 8. Risks and open items

| Item | Confidence | Note |
|---|---|---|
| Keyword volumes and winnability | Low | From one free source; verify with Search Console after 60 to 90 days |
| Ad network thresholds | Medium | Sources disagree on Journey's minimum (1,000 to 10,000 sessions); recheck before applying |
| Traffic data for Monitor | Medium | No first-party GA4 connector is available; traffic figures are entered in `ops/traffic.md` until one is |
| Farm coverage pace | Medium | Web-only verification limits throughput to an estimated 15 to 40 farms per day |
| AGA and AGW listing reuse | Medium | Facts are not copyrightable, but permission requests to both certifiers are recommended |
| Scheduled task usage | Medium | Six agents on these cadences run about 25 sessions a week against Harry's Claude plan limits |
| Revenue timeline | Low | No revenue until a premium ad network approves the site; new domains typically take 6 to 12 months to earn meaningful search traffic |

## Design system (October 2026 redesign)
- Home page hero: a still image of a pasture scene (`public/art/pasture-hero-*`, WebP with a JPEG fallback, preloaded). It was rendered from a React Three Fiber scene; the live 3D version was removed on 2026-10-27 because it slowed the site.
- Glass: `.glass` in `global.css` is frosted CSS (backdrop blur). The SVG refraction layer based on liquid-glass-js was removed for the same reason.
- Fonts are self-hosted (Fraunces for headings, Public Sans for text). Feeding-label colours are unchanged and must stay solid, not translucent.
