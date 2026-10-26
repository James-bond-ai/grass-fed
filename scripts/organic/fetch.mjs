// Downloads the latest monthly USDA Organic Integrity snapshot (all USDA-NOP certified
// operations) and writes a slim US lookup file. Runs on GitHub Actions only.
import { chromium } from 'playwright';
import fs from 'node:fs';

const now = new Date();
const candidates = [];
for (let back = 0; back < 3; back++) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
  candidates.push(`${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}01`);
}
const browser = await chromium.launch();
const ctx = await browser.newContext({ acceptDownloads: true });
const page = await ctx.newPage();
let saved = null;
for (const date of candidates) {
  for (const id of [4, 5]) {
    const url = `https://organic.ams.usda.gov/integrity/Reports/DataHistoryReport?id=${id}&reportDate=${date}`;
    try {
      const dl = page.waitForEvent('download', { timeout: 120000 });
      await page.goto(url, { timeout: 120000 }).catch(() => {});
      const d = await dl;
      const name = d.suggestedFilename();
      await d.saveAs(`snapshot-${id}${name.slice(name.lastIndexOf('.'))}`);
      saved = { url, id, date, file: `snapshot-${id}${name.slice(name.lastIndexOf('.'))}`, suggested: name };
      console.log('downloaded', saved);
      break;
    } catch (e) { console.log('no download from', url, String(e).slice(0, 200)); }
  }
  if (saved) break;
}
await browser.close();
fs.writeFileSync('download.json', JSON.stringify(saved));
if (!saved) process.exit(1);
