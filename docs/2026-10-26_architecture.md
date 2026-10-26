# grassfed.food: System Architecture

**Version:** 1.0, October 26, 2026
**Owner:** Harry
**Status:** Draft for approval. Nothing is built yet.

## 1. What the business is

grassfed.food is a nationwide US directory of grass-fed meat and dairy farms, paired with buying guides and brand comparisons that earn affiliate commissions. The content attracts search traffic; the directory and the guides convert it into farm visits and affiliate sales.

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
| **Monitor** | Runs link checks, build health, stale-listing counts, and coverage gaps. Feeds problems to the other agents' queues and writes the weekly report. | Whole repo, live site | `ops/reports/`, queues | Mon, 6:35 am |

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

### Affiliate disclosure
- A clear disclosure above the first link on every page containing affiliate links, with "paid link" labels next to links. "Affiliate link" alone does not meet FTC guidance.
- Directory rankings are never influenced by affiliate status.

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
| Set **Settings → Pages → Source** to GitHub Actions | Before first deploy | Enables the deploy workflow |
| Add DNS records for grassfed.food (4 A records to GitHub Pages, `www` CNAME to `james-bond-ai.github.io`) | Before first deploy | Points the domain at the site |
| Set the custom domain and enforce HTTPS in Pages settings | After first deploy | Secures the domain |
| Apply to affiliate programs, starting with: Grass Roots Farmers Cooperative (15%, verified), US Wellness Meats, White Oak Pastures, ButcherBox (100% grass-fed line only), Thrive Market | After launch, once 5 or more articles are live | Programs review the site before approving; agents cannot create accounts. Add each tracking link to `data/affiliates.json` or send it to Claude |
| Register Google Search Console and Bing Webmaster Tools | After launch | Indexing and traffic data for the Monitor agent's reports |

Until affiliate programs approve the site, product links go to brand sites without tracking and carry no "paid link" label.

**Deferred on purpose:** automated email outreach to farms. Unsolicited bulk email from an autonomous agent carries CAN-SPAM exposure and reputational risk. Farms will reach the site through a "List your farm" link instead; outreach can be added later with a sending domain and opt-out handling.

## 8. Risks and open items

| Item | Confidence | Note |
|---|---|---|
| Keyword volumes and winnability | Low | From one free source; verify with Search Console after 60 to 90 days |
| Affiliate commission rates | Medium | Only Grass Roots (15%), Porter Road (8%), Snake River Farms (10%), and Kettle & Fire (20%) are published by the brands. Porter Road and Snake River Farms are not grass-fed brands and are excluded |
| Farm coverage pace | Medium | Web-only verification limits throughput to an estimated 15 to 40 farms per day |
| AGA and AGW listing reuse | Medium | Facts are not copyrightable, but permission requests to both certifiers are recommended |
| Scheduled task usage | Medium | Six agents on these cadences run about 25 sessions a week against Harry's Claude plan limits |
| Revenue timeline | Low | New domains typically take 6 to 12 months to earn meaningful search traffic |
