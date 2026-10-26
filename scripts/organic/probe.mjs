// One-off probe: how does the USDA Organic Integrity Database serve its data?
// Runs on a GitHub Actions runner (open internet), not in agent sessions.
import { chromium } from 'playwright';
import fs from 'node:fs';

const out = { requests: [], pages: {} };
const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36' });
const page = await ctx.newPage();
page.on('response', async (res) => {
  const req = res.request();
  if (!['xhr', 'fetch', 'document'].includes(req.resourceType())) return;
  let body = '';
  try { body = (await res.text()).slice(0, 1500); } catch {}
  out.requests.push({ type: req.resourceType(), method: req.method(), url: res.url(), status: res.status(), ctype: res.headers()['content-type'], post: req.postData()?.slice(0, 800), body });
});

async function visit(name, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    out.pages[name] = { url: page.url(), title: await page.title(), text: (await page.innerText('body')).slice(0, 3000), links: await page.$$eval('a', (as) => as.map((a) => [a.innerText.trim(), a.href]).filter(([, h]) => h).slice(0, 200)) };
  } catch (e) { out.pages[name] = { error: String(e) }; }
}

await visit('home', 'https://organic.ams.usda.gov/integrity/');
// Try a search through the UI: type an operation name into the first text input and press Enter.
try {
  const input = page.locator('input[type="text"], input[type="search"]').first();
  await input.fill('Maple Hill', { timeout: 15000 });
  await input.press('Enter');
  await page.waitForLoadState('networkidle', { timeout: 60000 });
  await page.waitForTimeout(5000);
  out.pages.search = { url: page.url(), text: (await page.innerText('body')).slice(0, 4000) };
} catch (e) { out.pages.search = { error: String(e) }; }
await visit('datahistory', 'https://organic.ams.usda.gov/integrity/Reports/DataHistory.aspx');
await visit('reports', 'https://organic.ams.usda.gov/integrity/Reports');
await browser.close();

fs.writeFileSync('probe.json', JSON.stringify(out, null, 2));
console.log('PAGES');
for (const [k, v] of Object.entries(out.pages)) console.log(k, JSON.stringify(v).slice(0, 2500));
console.log('\nREQUESTS');
for (const r of out.requests) console.log(r.status, r.method, r.ctype, r.url, r.post ? `POST:${r.post}` : '', '\n   ', (r.body || '').replace(/\s+/g, ' ').slice(0, 400));
