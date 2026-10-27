// Saves the full visible text of each published farm's website (homepage plus the pages most
// likely to describe feeding, products, ordering and delivery) for an independent accuracy audit.
// Runs on GitHub Actions, which has open internet. Respects robots.txt.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (compatible; grassfed.food-verifier/1.0; +https://grassfed.food/methodology/)';
const KEY = /about|story|our-?farm|practice|how-we|grass|feed|raise|shop|store|order|product|beef|lamb|bison|pork|dairy|milk|cheese|faq|question|ship|deliver|pickup|pick-up|location|market|where|buy|bulk|share|quarter|half|whole|cut|price|csa|subscription/i;
const MAX_PAGES = 9, MAX_CHARS = 40000;
const farms = fs.readdirSync('data/farms').filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join('data/farms', f), 'utf8')))
  .filter((f) => f.listing_status === 'published');
fs.mkdirSync('crawl', { recursive: true });

const robotsCache = {};
async function allowed(ctx, url) {
  const u = new URL(url);
  if (!(u.origin in robotsCache)) {
    let rules = [];
    try {
      const r = await ctx.request.get(`${u.origin}/robots.txt`, { timeout: 15000 });
      if (r.ok()) {
        let applies = false;
        for (const line of (await r.text()).split('\n')) {
          const [k, ...v] = line.split(':'); const val = v.join(':').trim(); const key = k.trim().toLowerCase();
          if (key === 'user-agent') applies = val === '*' || /grassfed/i.test(val);
          else if (key === 'disallow' && applies && val) rules.push(val);
        }
      }
    } catch {}
    robotsCache[u.origin] = rules;
  }
  return !robotsCache[u.origin].some((d) => u.pathname.startsWith(d.replace(/\*.*$/, '')));
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA });
const page = await ctx.newPage();
const summary = [];
for (const farm of farms) {
  const out = { slug: farm.slug, website: farm.website, pages: {}, skipped: [], errors: [] };
  const queue = [farm.website, farm.feeding_claim?.source_url, farm.delivery?.source_url, farm.ordering_url].filter(Boolean);
  const seen = new Set();
  let host;
  try { host = new URL(farm.website).hostname.replace(/^www\./, ''); } catch { out.errors.push('bad website url'); }
  while (queue.length && Object.keys(out.pages).length < MAX_PAGES) {
    const url = queue.shift().split('#')[0];
    if (seen.has(url)) continue; seen.add(url);
    try {
      if (!(await allowed(ctx, url))) { out.skipped.push(`${url} (robots.txt)`); continue; }
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2500);
      const text = (await page.innerText('body').catch(() => '')).replace(/\n{3,}/g, '\n\n').slice(0, MAX_CHARS);
      out.pages[page.url()] = { status: resp?.status() ?? 0, title: await page.title().catch(() => ''), text };
      if (Object.keys(out.pages).length === 1 || url === farm.website) {
        const links = await page.$$eval('a[href]', (as) => as.map((a) => [a.href, (a.innerText || '').trim()])).catch(() => []);
        for (const [href, label] of links) {
          try {
            const h = new URL(href); const hh = h.hostname.replace(/^www\./, '');
            if ((hh === host || hh.endsWith('.' + host) || /barn2door|square\.site|shopify|farmmatch|localline|grazecart/.test(hh)) && (KEY.test(h.pathname) || KEY.test(label)) && !/\.(jpg|png|pdf|zip)$/i.test(h.pathname)) queue.push(h.href);
          } catch {}
        }
      }
    } catch (e) { out.errors.push(`${url}: ${String(e).slice(0, 150)}`); }
  }
  fs.writeFileSync(path.join('crawl', `${farm.slug}.json`), JSON.stringify(out, null, 1));
  summary.push({ slug: farm.slug, pages: Object.keys(out.pages).length, skipped: out.skipped.length, errors: out.errors.length });
  console.log(farm.slug, Object.keys(out.pages).length, 'pages', out.skipped.length ? `${out.skipped.length} robots-skipped` : '', out.errors.length ? `${out.errors.length} errors` : '');
}
fs.writeFileSync(path.join('crawl', '_summary.json'), JSON.stringify(summary, null, 1));
await browser.close();
