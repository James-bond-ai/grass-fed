// Share images (Open Graph and X cards), drawn as SVG and rendered to 1200x630 PNG
// with sharp at build time. Text uses fonts installed on the build machine (Liberation
// or DejaVu, both present on GitHub's Ubuntu runners), never the site's web fonts, and
// every line is measured with the same font engine that draws it, so long names wrap
// or shrink instead of running off the card.
import sharp from 'sharp';
import os from 'node:os';
import { fmtDate, daysSince, FRESH_DAYS } from '../data/format.mjs';
import { FEEDING, SPECIES, feedingLabel } from '../data/states.mjs';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Site palette, from src/styles/global.css.
const C = {
  paper: '#f6f8f2',
  paper2: '#edf1e5',
  ink: '#1c2a22',
  inkSoft: '#4a5a50',
  pasture: '#2f5d3a',
  deep: '#1f4029',
  clover: '#cfdeae',
  hay: '#a87a14',
  hayTint: '#f3e6c4',
  rule: '#d3dac8',
  alert: '#8a2f1d',
};

const SERIF = ['Liberation Serif', 'DejaVu Serif', 'serif'];
const SANS = ['Liberation Sans', 'DejaVu Sans', 'sans-serif'];
const MARGIN = 72;
const CONTENT_W = OG_WIDTH - MARGIN * 2;
// Content sits between the wordmark row and the pasture hills along the bottom.
const AREA_TOP = 150;
const AREA_BOTTOM = 512;

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const svgFamily = (fam) => fam.map((f) => (f.includes(' ') ? `'${f}'` : f)).join(', ');

// Width in pixels of a single line, measured by rendering it with Pango (the engine that
// also draws SVG text). Falls back to a generous estimate if no font can be loaded.
const widthCache = new Map();
async function textWidth(text, { serif = false, bold = false, size }) {
  const key = `${serif}|${bold}|${size}|${text}`;
  if (widthCache.has(key)) return widthCache.get(key);
  let w = Math.ceil(text.length * size * (serif ? 0.56 : 0.58));
  if (text.trim()) {
    try {
      const font = `${(serif ? SERIF : SANS).join(',')}${bold ? ' Bold' : ''} ${size}`;
      const markup = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const { info } = await sharp({ text: { text: markup, font, dpi: 72 } }).toBuffer({ resolveWithObject: true });
      if (info.width > 0) w = Math.ceil(info.width * 1.03);
    } catch {
      // keep the estimate
    }
  }
  widthCache.set(key, w);
  return w;
}

// Shortens one line with an ellipsis until it fits.
async function clip(line, max, style) {
  if ((await textWidth(line, style)) <= max) return line;
  let s = line;
  while (s.length > 1) {
    s = s.slice(0, -1).trimEnd();
    const cand = `${s.replace(/[\s,.:;-]+$/, '')}…`;
    if ((await textWidth(cand, style)) <= max) return cand;
  }
  return '…';
}

// Greedy word wrap. Returns the lines, or null if it needs more than maxLines.
async function wrap(text, max, style, maxLines) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const cand = cur ? `${cur} ${w}` : w;
    if (!cur || (await textWidth(cand, style)) <= max) cur = cand;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) return null;
  for (const l of lines) if ((await textWidth(l, style)) > max) return null;
  return lines;
}

// Finds the largest size whose wrapped lines fit the width, line count and height.
// At the smallest size, extra text is cut with an ellipsis rather than overflowing.
// `oneLine` lists sizes to try first on a single line, so a short title is not split
// just to keep it a little bigger.
async function fit(text, { sizes, oneLine = [], max = CONTENT_W, maxLines, maxHeight = Infinity, lh = 1.12, serif = true, bold = true }) {
  for (const size of oneLine) {
    const style = { serif, bold, size };
    const lines = await wrap(text, max, style, 1);
    if (lines) return { lines, size, lh: Math.round(size * lh), style };
  }
  for (const size of sizes) {
    const style = { serif, bold, size };
    const lines = await wrap(text, max, style, maxLines);
    if (lines && lines.length * size * lh <= maxHeight) return { lines, size, lh: Math.round(size * lh), style };
  }
  const size = sizes.at(-1);
  const style = { serif, bold, size };
  const lines = Math.max(1, Math.min(maxLines, Math.floor(maxHeight / (size * lh)) || 1));
  const words = String(text).trim().split(/\s+/);
  const out = [];
  let i = 0;
  for (let n = 0; n < lines && i < words.length; n++) {
    let cur = words[i++];
    while (i < words.length && (await textWidth(`${cur} ${words[i]}`, style)) <= max) cur += ` ${words[i++]}`;
    out.push(cur);
  }
  if (i < words.length) out[out.length - 1] += ` ${words.slice(i).join(' ')}`;
  for (let n = 0; n < out.length; n++) out[n] = await clip(out[n], max, style);
  return { lines: out, size, lh: Math.round(size * lh), style };
}

function textLines(block, x, firstBaseline, fill) {
  const { lines, size, lh, style } = block;
  return lines
    .map(
      (l, i) =>
        `<text x="${x}" y="${firstBaseline + i * lh}" font-family="${svgFamily(style.serif ? SERIF : SANS)}" font-weight="${style.bold ? 700 : 400}" font-size="${size}" fill="${fill}">${esc(l)}</text>`,
    )
    .join('');
}

const blockHeight = (b) => (b.lines.length - 1) * b.lh + Math.round(b.size * 0.98);

function background() {
  return `
  <defs>
    <symbol id="cow" viewBox="0 0 100 60"><path d="M14 21c0-6 5-9 11-9h44c5 0 9 3 11 6l7-4c4-2 9-1 10 3l-1 9c-1 4-5 5-9 4l-5-1-2 10c-1 3-3 4-5 4l-1 13h-4l-1-13H33l-1 13h-4l-1-13c-8-1-12-6-13-12z"/></symbol>
  </defs>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${C.paper}"/>
  <circle cx="-60" cy="300" r="330" fill="${C.clover}" fill-opacity="0.2"/>
  <circle cx="1130" cy="-40" r="300" fill="#8fb9d3" fill-opacity="0.1"/>
  <circle cx="930" cy="540" r="78" fill="${C.hayTint}"/>
  <path d="M0 548 C 180 518 330 528 470 538 S 760 510 920 520 S 1120 536 1200 528 V630 H0Z" fill="#e3ecd0"/>
  <path d="M0 574 C 160 552 300 562 460 567 S 740 547 900 557 S 1110 570 1200 563 V630 H0Z" fill="#b9d08d"/>
  <g fill="${C.inkSoft}" opacity="0.5"><use href="#cow" x="760" y="532" width="46" height="28"/><use href="#cow" x="836" y="538" width="40" height="24" transform="matrix(-1 0 0 1 1712 0)"/></g>
  <path d="M0 600 C 200 584 380 591 560 594 S 900 580 1200 590 V630 H0Z" fill="#6f9a52"/>
  <g fill="${C.deep}"><use href="#cow" x="1010" y="566" width="84" height="50"/></g>`;
}

function wordmark() {
  return `
  <g transform="translate(${MARGIN} 54)">
    <rect width="52" height="52" rx="11" fill="${C.pasture}"/>
    <path transform="scale(1.625)" d="M8 24c2-6 3-10 3-14M14 24c1-5 1.5-9 1-13M20 24c0-4 .5-8 2-12M25 24c-1-3-1-6 0-9" stroke="${C.clover}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  </g>
  <text x="${MARGIN + 68}" y="94" font-family="${svgFamily(SERIF)}" font-weight="700" font-size="44" fill="${C.deep}">grassfed<tspan fill="${C.hay}">.</tspan>food</text>`;
}

// The "Verified" stamp from src/components/Stamp.astro: a tilted hay-coloured ring.
async function stamp(top, bottom, color = C.hay) {
  const topStyle = { serif: true, bold: true, size: 40 };
  const botStyle = { serif: false, bold: true, size: 22 };
  const w = Math.max(await textWidth(top, topStyle), await textWidth(bottom, botStyle)) + 64;
  const h = 100;
  const cx = OG_WIDTH - MARGIN - w / 2 + 6;
  const cy = 82;
  return `
  <g transform="rotate(-3 ${cx} ${cy})">
    <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${C.paper}" fill-opacity="0.75" stroke="${color}" stroke-width="4"/>
    <rect x="${cx - w / 2 + 7}" y="${cy - h / 2 + 7}" width="${w - 14}" height="${h - 14}" rx="${(h - 14) / 2}" fill="none" stroke="${color}" stroke-width="1.5" stroke-opacity="0.55"/>
    <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-family="${svgFamily(SERIF)}" font-weight="700" font-size="40" fill="${color}">${esc(top)}</text>
    <text x="${cx}" y="${cy + 32}" text-anchor="middle" font-family="${svgFamily(SANS)}" font-weight="700" font-size="22" fill="${color}">${esc(bottom)}</text>
  </g>`;
}

const kicker = (text, y) =>
  `<text x="${MARGIN}" y="${y}" font-family="${svgFamily(SANS)}" font-weight="700" font-size="22" letter-spacing="3" fill="${C.hay}">${esc(text.toUpperCase())}</text>`;

function svgDoc(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">${background()}${wordmark()}${body}</svg>`;
}

async function toPng(svg) {
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true, dither: 0, effort: 2 }).toBuffer();
}

// Stacks blocks top to bottom and centres the stack in the content area.
// Each item is { h, draw(top) } where draw returns SVG for a block starting at `top`.
function stack(items, gap = 24) {
  const total = items.reduce((s, it) => s + it.h, 0) + gap * (items.length - 1);
  let y = Math.round(AREA_TOP + Math.max(0, (AREA_BOTTOM - AREA_TOP - total) / 2));
  return items
    .map((it) => {
      const out = it.draw(y);
      y += it.h + gap;
      return out;
    })
    .join('');
}

const titleItem = (block, fill = C.deep) => ({
  h: blockHeight(block),
  draw: (top) => textLines(block, MARGIN, top + Math.round(block.size * 0.8), fill),
});
const kickerItem = (text) => ({ h: 22, draw: (top) => kicker(text, top + 18) });
const lineItem = (block, fill = C.inkSoft) => ({
  h: blockHeight(block),
  draw: (top) => textLines(block, MARGIN, top + Math.round(block.size * 0.8), fill),
});

function feedingText(farm) {
  const l = feedingLabel(farm);
  const cat = farm.feeding_claim?.category ?? 'unknown';
  const dairyOnly = (farm.species ?? []).length > 0 && (farm.species ?? []).every((s) => s.startsWith('dairy-'));
  if (dairyOnly || cat === 'unknown' || !FEEDING[cat]) return { text: l.parts[0].text, level: l.level };
  return { text: FEEDING[cat], level: l.level };
}

async function pillItem(text, level) {
  const good = ['gff', 'gf', 'both'].includes(level);
  const fill = good ? C.clover : level === 'unknown' ? C.paper2 : C.hayTint;
  const style = { serif: false, bold: true, size: 28 };
  const iconW = good ? 40 : 0;
  const label = await clip(text, CONTENT_W - 56 - iconW, style);
  const w = (await textWidth(label, style)) + 52 + iconW;
  const h = 58;
  return {
    h,
    draw: (top) => `
  <g transform="translate(${MARGIN} ${top})">
    <rect width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="${good ? '#b5c98a' : C.rule}" stroke-width="2"/>
    ${good ? `<circle cx="38" cy="${h / 2}" r="14" fill="${C.pasture}"/><path d="M31 ${h / 2} l5 5 9-10" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    <text x="${26 + iconW}" y="${h / 2 + 10}" font-family="${svgFamily(SANS)}" font-weight="700" font-size="28" fill="${C.deep}">${esc(label)}</text>
  </g>`,
  };
}

const plural = (n, one, many) => (n === 1 ? one : many);

// (a) Home page and default for any page without its own image.
export async function defaultCard({ farmCount }) {
  const title = await fit('Grass-fed meat and dairy, from farms we’ve actually checked.', { sizes: [70, 64, 58], maxLines: 2 });
  const sub = await fit(`${farmCount} US farms selling grass-fed meat and dairy, each listing checked against the farm’s own website and dated.`, {
    sizes: [30, 28, 26], maxLines: 2, serif: false, bold: false, lh: 1.3,
  });
  const body = stack([titleItem(title), lineItem(sub)], 28);
  return toPng(svgDoc(`${await stamp('Verified', 'farm by farm')}${body}`));
}

// (b) One farm: name, place, what it sells, feeding claim and the date we last checked it.
export async function farmCard({ farm, stateName }) {
  const stale = daysSince(farm.last_verified_at) > FRESH_DAYS;
  const stampSvg = await stamp(stale ? 'Due for recheck' : 'Verified', fmtDate(farm.last_verified_at), stale ? C.alert : C.hay);
  const name = await fit(farm.farm_name, { sizes: [80, 72, 64, 58, 52, 46], maxLines: 3, maxHeight: 190 });
  const placeStyle = { serif: false, bold: false, size: 32 };
  const place = `${farm.city}, ${stateName}`;
  const species = (farm.species ?? []).map((s, i) => (i ? (SPECIES[s] ?? s).toLowerCase() : (SPECIES[s] ?? s)));
  let where = place;
  if (species.length) {
    const withSpecies = `${place}  ·  ${species.slice(0, 3).join(', ')}${species.length > 3 ? ' and more' : ''}`;
    if ((await textWidth(withSpecies, placeStyle)) <= CONTENT_W) where = withSpecies;
  }
  where = await clip(where, CONTENT_W, placeStyle);
  const placeBlock = { lines: [where], size: 32, lh: 40, style: placeStyle };
  const feed = feedingText(farm);
  const body = stack([titleItem(name), lineItem(placeBlock), await pillItem(feed.text, feed.level)], 22);
  return toPng(svgDoc(`${stampSvg}${body}`));
}

// (c) A state page: how many farms are based there and how many ship in from elsewhere.
export async function stateCard({ stateName, based, shipIn }) {
  const titleText = based ? `Grass-fed farms in ${stateName}` : `Grass-fed farms that ship to ${stateName}`;
  const title = await fit(titleText, { oneLine: [72, 64, 58], sizes: [64, 58, 52], maxLines: 2, maxHeight: 150 });
  const stats = based
    ? [
        { n: based, label: `${plural(based, 'farm', 'farms')} based in ${stateName}` },
        { n: shipIn, label: `${plural(shipIn, 'farm in another state ships', 'farms in other states ship')} here` },
      ]
    : [{ n: shipIn, label: `${plural(shipIn, 'farm in another state ships', 'farms in other states ship')} to ${stateName}` }];
  const colW = stats.length > 1 ? CONTENT_W / 2 : CONTENT_W;
  const labels = [];
  for (const s of stats) labels.push(await fit(s.label, { sizes: [28, 26, 24], max: colW - 48, maxLines: 2, serif: false, bold: false, lh: 1.25 }));
  const labelH = Math.max(...labels.map(blockHeight));
  const statsItem = {
    h: 16 + 84 + 14 + labelH,
    draw: (y) => {
      const top = y + 16;
      return stats
        .map((s, i) => {
          const x = MARGIN + i * colW;
          const rule = i > 0 ? `<line x1="${x - 28}" y1="${top + 8}" x2="${x - 28}" y2="${top + 84 + 14 + labelH}" stroke="${C.rule}" stroke-width="2"/>` : '';
          return `${rule}<text x="${x}" y="${top + 76}" font-family="${svgFamily(SERIF)}" font-weight="700" font-size="96" fill="${C.pasture}">${s.n}</text>${textLines(labels[i], x, top + 84 + 14 + 22, C.inkSoft)}`;
        })
        .join('');
    },
  };
  const body = stack([kickerItem('Farm directory'), titleItem(title), statsItem], 26);
  return toPng(svgDoc(`${await stamp('Verified', 'farm by farm')}${body}`));
}

const KIND = { guide: 'Buying guide', compare: 'Comparison', review: 'Review', best: 'Buyer’s list' };

// (d) A guide: its title and when it was last updated.
export async function guideCard({ title, kind, updated }) {
  const t = await fit(title, { sizes: [76, 68, 60, 54, 48], maxLines: 3, maxHeight: 230 });
  const upd = { lines: [`Updated ${fmtDate(updated)}`], size: 28, lh: 36, style: { serif: false, bold: false, size: 28 } };
  const body = stack([kickerItem(KIND[kind] ?? 'Guide'), titleItem(t), lineItem(upd)], 24);
  return toPng(svgDoc(body));
}

// Astro builds endpoints one at a time, which leaves most CPU cores idle while sharp
// quantises each PNG. A route can call start() from getStaticPaths with every card it
// will serve; they render a few at a time in the background and each GET collects its own.
const LIMIT = Math.max(2, os.availableParallelism?.() ?? os.cpus().length);
let active = 0;
const waiting = [];
async function limited(fn) {
  while (active >= LIMIT) await new Promise((r) => waiting.push(r));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiting.shift()?.();
  }
}

export function cardBatch(render) {
  let pending = null;
  return {
    start(entries) {
      if (pending) return;
      pending = new Map();
      for (const [key, args] of entries) {
        const p = limited(() => render(args));
        p.catch(() => {}); // a failure is reported by get(), when the page asks for it
        pending.set(key, p);
      }
    },
    get(key, args) {
      const p = pending?.get(key);
      pending?.delete(key);
      return p ?? render(args);
    },
  };
}
