// Downloads the latest monthly USDA Organic Integrity snapshot (all USDA-NOP certified
// operations). Runs on GitHub Actions only. Writes download.json and diag.json.
//
// The Data History page lists this calendar year's snapshots as month links. The first link
// for each month is the "Data Submission Template Format" workbook (Operation Level and Item
// Level on separate sheets), which slim.py reads. The DataHistoryReport pages only show counts
// and never start a download, so they are not tried.
import { chromium } from 'playwright';
import fs from 'node:fs';

const DATA_HISTORY = 'https://organic.ams.usda.gov/integrity/Reports/DataHistory';
const now = new Date();
// This month first, then last month in case USDA hasn't posted this month's snapshot yet.
// The page only lists the current calendar year, so in January there is no fallback.
const months = [0, 1]
  .map((b) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - b, 1)))
  .filter((d) => d.getUTCFullYear() === now.getUTCFullYear());
const monthName = (d) => d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
const monthStamp = (d) => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}01`;
// USDA names the file INTEGRITY_Data_YYYYMMDD.xlsx; that date is the snapshot's own date.
const fileStamp = (name) => name.match(/(20\d{2})(\d{2})(\d{2})/)?.slice(1).join('') ?? null;
const ext = (n) => (n.includes('.') ? n.slice(n.lastIndexOf('.')) : '.xlsx');

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

for (const month of months) {
  responses.length = 0;
  await page.goto(DATA_HISTORY, { waitUntil: 'networkidle', timeout: 90000 }).catch((e) => diag.push({ gotoError: String(e).slice(0, 200) }));
  const link = page.getByRole('link', { name: monthName(month) }).first();
  if (!(await link.count().catch(() => 0))) {
    diag.push({ month: monthName(month), missing: 'no link on the Data History page yet' });
    continue;
  }
  const dlPromise = page.waitForEvent('download', { timeout: 180000 }).catch(() => null);
  await link.click({ timeout: 15000 }).catch((e) => diag.push({ month: monthName(month), clickError: String(e).slice(0, 200) }));
  const d = await dlPromise;
  if (!d) {
    diag.push({ month: monthName(month), afterClick: { url: page.url(), text: (await page.innerText('body').catch(() => '')).slice(0, 2000), responses: responses.slice(-40) } });
    continue;
  }
  const suggested = d.suggestedFilename();
  const file = `snapshot-click${ext(suggested)}`;
  await d.saveAs(file);
  const stamp = fileStamp(suggested);
  saved = { via: 'click', month: monthName(month), file, suggested, date: stamp ?? monthStamp(month), dateFrom: stamp ? 'file name' : 'month link' };
  break;
}
await browser.close();
fs.writeFileSync('download.json', JSON.stringify(saved));
fs.writeFileSync('diag.json', JSON.stringify(diag, null, 2));
console.log(saved ? `saved ${saved.file} (${saved.suggested}), snapshot ${saved.date} from ${saved.dateFrom}` : 'no download');
if (!saved) process.exit(1);
