// Downloads the latest monthly USDA Organic Integrity snapshot (all USDA-NOP certified
// operations). Runs on GitHub Actions only. Writes download.json and diag.json.
import { chromium } from 'playwright';
import fs from 'node:fs';

const now = new Date();
const dates = [0, 1, 2].map((b) => {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - b, 1));
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}01`;
});
const diag = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ acceptDownloads: true });
const page = await ctx.newPage();
const responses = [];
page.on('response', (r) => {
  const h = r.headers();
  responses.push({ url: r.url().slice(0, 300), status: r.status(), ctype: h['content-type'], disp: h['content-disposition'] });
});
let saved = null;
const ext = (n) => (n.includes('.') ? n.slice(n.lastIndexOf('.')) : '.xlsx');

async function tryUrl(url, id, date) {
  responses.length = 0;
  let dlPromise = page.waitForEvent('download', { timeout: 90000 }).catch(() => null);
  await page.goto(url, { timeout: 90000, waitUntil: 'networkidle' }).catch((e) => diag.push({ url, gotoError: String(e).slice(0, 200) }));
  let d = await Promise.race([dlPromise, new Promise((r) => setTimeout(() => r(null), 20000))]);
  if (!d) {
    // Page may show a button or link to start the download.
    const text = (await page.innerText('body').catch(() => '')).slice(0, 2000);
    const clickables = await page.$$eval('a,button', (els) => els.map((e) => [e.tagName, e.innerText.trim(), e.getAttribute('href')]).filter(([, t]) => t).slice(0, 80)).catch(() => []);
    diag.push({ url, text, clickables, responses: responses.slice(0, 40) });
    for (const label of ['Download', 'Export', 'Excel', 'XLSX', 'here']) {
      const el = page.getByText(label, { exact: false }).first();
      if (await el.count().catch(() => 0)) {
        dlPromise = page.waitForEvent('download', { timeout: 120000 }).catch(() => null);
        await el.click({ timeout: 10000 }).catch(() => {});
        d = await dlPromise;
        if (d) break;
      }
    }
  }
  if (!d) return null;
  const file = `snapshot-${id}${ext(d.suggestedFilename())}`;
  await d.saveAs(file);
  return { url, id, date, file, suggested: d.suggestedFilename() };
}

outer: for (const date of dates) {
  for (const id of [4, 5]) {
    saved = await tryUrl(`https://organic.ams.usda.gov/integrity/Reports/DataHistoryReport?id=${id}&reportDate=${date}&ret=Reports/DataHistory&retName=Data+History`, id, date);
    if (saved) break outer;
  }
}
if (!saved) {
  // Fall back to the Data History page itself and click the first month link.
  await page.goto('https://organic.ams.usda.gov/integrity/Reports/DataHistory', { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  const link = page.getByRole('link', { name: new Date(now.getUTCFullYear(), now.getUTCMonth(), 1).toLocaleString('en-US', { month: 'long' }) }).first();
  const dlPromise = page.waitForEvent('download', { timeout: 180000 }).catch(() => null);
  await link.click({ timeout: 15000 }).catch((e) => diag.push({ clickError: String(e).slice(0, 200) }));
  const d = await dlPromise;
  if (d) { const file = `snapshot-click${ext(d.suggestedFilename())}`; await d.saveAs(file); saved = { via: 'click', file, suggested: d.suggestedFilename(), date: dates[0] }; }
  else diag.push({ afterClick: { url: page.url(), text: (await page.innerText('body').catch(() => '')).slice(0, 2000), responses: responses.slice(-40) } });
}
await browser.close();
fs.writeFileSync('download.json', JSON.stringify(saved));
fs.writeFileSync('diag.json', JSON.stringify(diag, null, 2));
console.log(saved ? `saved ${saved.file}` : 'no download');
if (!saved) process.exit(1);
