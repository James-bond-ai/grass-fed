#!/usr/bin/env node
// Validation gate for grassfed.food. Runs in CI before every deploy and is
// run by every agent before committing. Any error blocks the deploy.
//
// Usage:
//   node scripts/validate.mjs            farms, candidates, published articles
//   node scripts/validate.mjs --drafts   also check src/content/drafts
//   node scripts/validate.mjs a.md b.json  check specific article or farm files only

import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { AFFILIATES_ENABLED } from '../src/data/site.mjs';
import { STATE_BY_ABBR, SPECIES, FEEDING, CHANNELS, CERTIFICATIONS, DAIRY_PRODUCTS } from '../src/data/states.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${path.relative(ROOT, file)}: ${msg}`);
const warn = (file, msg) => warnings.push(`${path.relative(ROOT, file)}: ${msg}`);

const EM_DASH = /\u2014/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isUrl = (u) => typeof u === 'string' && /^https?:\/\/[^\s]+\.[^\s]+/.test(u);
const today = new Date().toISOString().slice(0, 10);
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return null; } };

// ---------- Farms ----------
const STATUS = ['published', 'stale', 'unpublished'];
const METHODS = ['auto', 'manual', 'owner-claimed'];
const SOURCES = ['usda', 'certifier', 'state-program', 'self-submitted', 'web-search'];

function checkFarm(file, f, { candidate = false } = {}) {
  const slug = path.basename(file, '.json');
  const req = (k) => { if (f[k] === undefined || f[k] === null || f[k] === '') err(file, `missing required field "${k}"`); };
  ['id', 'slug', 'farm_name', 'city', 'state', 'website', 'species', 'feeding_claim', 'sales_channels', 'data_source', 'source_url'].forEach(req);
  if (f.slug && f.slug !== slug) err(file, `slug "${f.slug}" must match file name "${slug}"`);
  if (f.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.slug)) err(file, 'slug must be lowercase letters, numbers and hyphens');
  if (f.state && !STATE_BY_ABBR[f.state]) err(file, `unknown state "${f.state}"`);
  if (f.website && !isUrl(f.website)) err(file, 'website must be a full http(s) URL');
  if (f.source_url && !isUrl(f.source_url)) err(file, 'source_url must be a full http(s) URL');
  if (!Array.isArray(f.species) || f.species.length === 0) err(file, 'species must be a non-empty array');
  else f.species.forEach((s) => { if (!SPECIES[s]) err(file, `unknown species "${s}"`); });
  if (!Array.isArray(f.sales_channels)) err(file, 'sales_channels must be an array');
  else f.sales_channels.forEach((c) => { if (!CHANNELS[c]) err(file, `unknown sales channel "${c}"`); });
  if (f.data_source && !SOURCES.includes(f.data_source)) err(file, `data_source must be one of ${SOURCES.join(', ')}`);

  const fc = f.feeding_claim ?? {};
  if (!FEEDING[fc.category]) err(file, `feeding_claim.category must be one of ${Object.keys(FEEDING).join(', ')}`);
  if (fc.category && fc.category !== 'unknown') {
    if (!fc.verbatim) err(file, 'feeding_claim.verbatim is required unless category is "unknown"');
    if (!isUrl(fc.source_url)) err(file, 'feeding_claim.source_url must be the page the quote came from');
  }
  if (fc.verbatim && fc.verbatim.length > 300) err(file, 'feeding_claim.verbatim must be 300 characters or fewer (quote the key sentence only)');

  for (const c of f.certifications ?? []) {
    if (!CERTIFICATIONS[c.program]) err(file, `unknown certification program "${c.program}"`);
    if (!isUrl(c.evidence_url)) err(file, `certification ${c.program} needs evidence_url from the certifier's listing`);
    if (!DATE.test(c.verified_on ?? '')) err(file, `certification ${c.program} needs verified_on YYYY-MM-DD`);
  }
  if (f.bulk_shares !== undefined && typeof f.bulk_shares !== 'boolean') err(file, 'bulk_shares must be true or false');

  // Delivery
  const dv = f.delivery;
  if (dv !== undefined) {
    if (typeof dv !== 'object' || dv === null || Array.isArray(dv)) err(file, 'delivery must be an object');
    else {
      const st = dv.ships_to;
      if (st !== undefined && st !== 'nationwide' && !Array.isArray(st)) err(file, 'delivery.ships_to must be "nationwide" or a list of state abbreviations');
      if (Array.isArray(st)) st.forEach((s) => { if (!STATE_BY_ABBR[s]) err(file, `delivery.ships_to has unknown state "${s}"`); });
      const ch = f.sales_channels ?? [];
      if (st === 'nationwide' && !ch.includes('ships-nationwide')) err(file, 'delivery.ships_to is "nationwide" but sales_channels lacks ships-nationwide');
      if (ch.includes('ships-nationwide') && st !== undefined && st !== 'nationwide') err(file, 'sales_channels has ships-nationwide but delivery.ships_to is not "nationwide"');
      if (ch.includes('ships-regional') && !(Array.isArray(st) && st.length)) warn(file, 'ships-regional channel but no states in delivery.ships_to');
      for (const k of ['local_areas', 'pickup_locations']) if (dv[k] !== undefined && !Array.isArray(dv[k])) err(file, `delivery.${k} must be a list`);
      if (dv.local_radius_miles != null && !(typeof dv.local_radius_miles === 'number' && dv.local_radius_miles > 0 && dv.local_radius_miles < 1000)) err(file, 'delivery.local_radius_miles must be a number of miles or null');
      if (dv.source_url && !isUrl(dv.source_url)) err(file, 'delivery.source_url must be a full URL');
    }
  } else if (!candidate && f.listing_status === 'published') warn(file, 'no delivery details yet');

  // Photos: only the farm's own photos, stored in the repo, with a record of permission
  for (const [i, ph] of (f.photos ?? []).entries()) {
    const n = `photos[${i}]`;
    if (!ph?.src?.startsWith(`/farm-photos/${slug}/`)) err(file, `${n}.src must be a file under /farm-photos/${slug}/`);
    else if (!fs.existsSync(path.join(ROOT, 'public', ph.src))) err(file, `${n}.src file not found in public${ph.src}`);
    if (!ph?.alt || ph.alt.length < 10) err(file, `${n}.alt must describe the photo`);
    if (!ph?.credit) err(file, `${n}.credit is required`);
    const pm = ph?.permission ?? {};
    if (!pm.granted_by || !DATE.test(pm.date ?? '') || !pm.record_url) err(file, `${n}.permission needs granted_by, date (YYYY-MM-DD) and record_url (the submission or message granting permission)`);
  }

  // Availability and resold products
  if (f.availability !== undefined) {
    const av = f.availability;
    if (!['available', 'sold-out', 'paused', 'waitlist'].includes(av?.status)) err(file, 'availability.status must be available, sold-out, paused or waitlist');
    if (av?.status !== 'available' && !av?.note) err(file, 'availability.note is required, in plain words, for example "Sold out for 2026; reservations open for 2027"');
    if (av?.checked_on && !DATE.test(av.checked_on)) err(file, 'availability.checked_on must be YYYY-MM-DD');
  }
  if (f.resold_note !== undefined && (typeof f.resold_note !== 'string' || f.resold_note.length > 240)) err(file, 'resold_note must be a short sentence (240 characters or fewer)');

  // Dairy
  if (f.dairy_products !== undefined) {
    if (!Array.isArray(f.dairy_products)) err(file, 'dairy_products must be a list');
    else f.dairy_products.forEach((d) => { if (!DAIRY_PRODUCTS[d]) err(file, `unknown dairy product "${d}"`); });
  }
  if ((f.species ?? []).some((s) => String(s).startsWith('dairy-')) && !(f.dairy_products ?? []).length && f.listing_status === 'published') warn(file, 'sells dairy but dairy_products is empty');

  if (!candidate) {
    ['last_verified_at', 'verification_method', 'listing_status'].forEach(req);
    if (f.last_verified_at && !DATE.test(f.last_verified_at)) err(file, 'last_verified_at must be YYYY-MM-DD');
    if (f.last_verified_at > today) err(file, 'last_verified_at is in the future');
    if (f.listing_status && !STATUS.includes(f.listing_status)) err(file, `listing_status must be one of ${STATUS.join(', ')}`);
    if (f.verification_method && !METHODS.includes(f.verification_method)) err(file, `verification_method must be one of ${METHODS.join(', ')}`);
    if (f.listing_status === 'published' && Array.isArray(f.sales_channels) && f.sales_channels.length === 0) err(file, 'published listing needs at least one sales channel; if the site gives no way to buy, set listing_status to "unpublished"');
    if (f.listing_status === 'published' && f.last_verified_at) {
      const age = (Date.parse(today) - Date.parse(f.last_verified_at)) / 86400000;
      if (age > 365) err(file, 'published listing not verified in over 12 months; recheck or set listing_status to "unpublished"');
      else if (age > 90) warn(file, `last verified ${Math.floor(age)} days ago; due for recheck`);
    }
  }
  if (EM_DASH.test(JSON.stringify(f))) err(file, 'contains an em dash; use a comma, colon, or period instead');
}

function readJsonDir(dir, opts) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const name of fs.readdirSync(abs).filter((n) => n.endsWith('.json'))) {
    const file = path.join(abs, name);
    try {
      const f = JSON.parse(fs.readFileSync(file, 'utf8'));
      checkFarm(file, f, opts);
      out.push({ file, f });
    } catch (e) {
      err(file, `invalid JSON: ${e.message}`);
    }
  }
  return out;
}

// ---------- Articles ----------
// Each rule: pattern, and why it is not allowed.
const BANNED = [
  [/\b(lowers?|reduces?|cuts?)\s+(your\s+)?(cholesterol|blood pressure|inflammation)/i, 'health outcome claim'],
  [/heart[-\s]healthy/i, 'health outcome claim'],
  [/anti[-\s]?inflammatory/i, 'health outcome claim'],
  [/\b(weight[-\s]loss|lose weight|burns? fat)\b/i, 'health outcome claim'],
  [/\b(cures?|prevents?|fights?)\s+(cancer|disease|diabetes|heart disease)/i, 'disease claim'],
  [/\b(boosts?|strengthens?)\s+(your\s+)?immun/i, 'health outcome claim'],
  [/\b(high|rich)\s+in\s+omega/i, '"high in" or "rich in" omega-3 is not allowed for beef or dairy'],
  [/\b(packed|loaded)\s+with\s+(omega|nutrients|vitamins)/i, 'implied nutrient content claim'],
  [/\b(superfood|healthiest)\b/i, 'unsupported health superlative'],
  [/\b(we|our team)\s+(tested|tried|tasted|cooked|ordered|bought|sampled)\b/i, 'claims hands-on testing; comparisons are research-based'],
  [/\b(taste[-\s]test|hands[-\s]on|in our testing|our tests?)\b/i, 'claims hands-on testing; comparisons are research-based'],
  [/\b(climate[-\s]friendly|carbon[-\s]neutral|eco[-\s]friendly|better for the planet)\b/i, 'unqualified environmental claim'],
  [/\bsustainabl[ey]\b(?!\s+agricultur)/i, 'unqualified environmental claim; describe the specific practice and cite it instead'],
  [/\baffiliate link\b(?!.*paid link)/i, '"affiliate link" alone is not an adequate FTC disclosure; use "paid link"'],
];

const affiliates = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/affiliates.json'), 'utf8'));
const trackingHosts = affiliates.programs.flatMap((p) => p.tracking_domains ?? []);
const farmSlugs = new Set(
  fs.existsSync(path.join(ROOT, 'data/farms'))
    ? fs.readdirSync(path.join(ROOT, 'data/farms')).filter((n) => n.endsWith('.json')).map((n) => n.slice(0, -5))
    : []
);

function checkArticle(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return err(file, 'missing YAML frontmatter');
  let fm;
  try { fm = parseYaml(m[1]); } catch (e) { return err(file, `frontmatter YAML error: ${e.message}`); }
  const body = m[2];

  for (const k of ['title', 'description', 'kind', 'published', 'updated', 'sources']) if (!fm[k]) err(file, `frontmatter missing "${k}"`);
  if (fm.kind && !['guide', 'review', 'compare', 'best'].includes(fm.kind)) err(file, 'kind must be guide, review, compare, or best');
  if (fm.title && fm.title.length > 90) err(file, 'title over 90 characters');
  if (fm.description && (fm.description.length < 50 || fm.description.length > 170)) err(file, 'description must be 50 to 170 characters');
  const pub = String(fm.published ?? ''), upd = String(fm.updated ?? '');
  if (pub && !DATE.test(pub.slice(0, 10))) err(file, 'published must be YYYY-MM-DD');
  if (upd && pub && upd < pub) err(file, 'updated is earlier than published');
  if (!Array.isArray(fm.sources) || fm.sources.length === 0) err(file, 'at least one source is required');
  else fm.sources.forEach((s, i) => { if (!s?.title || !isUrl(s?.url)) err(file, `source ${i + 1} needs a title and full URL`); });

  if (fm.image) {
    const h = hostOf(fm.image.src);
    if (!['images.unsplash.com', 'images.pexels.com'].includes(h)) err(file, 'image.src must be from images.unsplash.com or images.pexels.com (free licensed stock); never use photos from farm or news sites');
    if (!fm.image.credit || !isUrl(fm.image.credit_url)) err(file, 'image needs credit (photographer name) and credit_url (the photo page)');
    if (!fm.image.alt || fm.image.alt.length < 10) err(file, 'image needs descriptive alt text');
  }
  const text = `${m[1]}\n${body}`;
  if (EM_DASH.test(text)) err(file, 'contains an em dash; use a comma, colon, or period instead');
  const lines = body.split('\n');
  const offset = m[1].split('\n').length + 2;
  lines.forEach((line, i) => {
    for (const [re, why] of BANNED) if (re.test(line)) err(file, `line ${i + offset}: ${why}: "${line.trim().slice(0, 80)}"`);
  });

  // Paid links
  const sponsored = [...body.matchAll(/<a\s[^>]*rel="[^"]*sponsored[^"]*"[^>]*>[\s\S]*?<\/a>(.{0,40})/g)];
  sponsored.forEach((s) => { if (!/\(paid link\)/.test(s[1])) err(file, 'every sponsored link must be followed by "(paid link)"'); });
  const allLinks = [...body.matchAll(/\]\((https?:\/\/[^)\s]+)\)|href="(https?:\/\/[^"]+)"/g)].map((x) => x[1] ?? x[2]);
  const tracked = allLinks.filter((u) => trackingHosts.includes(hostOf(u)));
  if (tracked.length && sponsored.length < tracked.length) err(file, 'links to affiliate tracking domains must use <a rel="sponsored nofollow"> followed by (paid link)');
  if (!AFFILIATES_ENABLED && (sponsored.length || tracked.length || fm.affiliate === true)) err(file, 'affiliate links are switched off (src/data/site.mjs); remove paid links and the affiliate flag');
  if ((sponsored.length || tracked.length) && fm.affiliate !== true) err(file, 'has paid links, so frontmatter must set affiliate: true');

  // Internal links
  for (const x of body.matchAll(/\]\(\/farm\/([a-z0-9-]+)\/?\)/g)) if (!farmSlugs.has(x[1])) err(file, `links to unknown farm "${x[1]}"`);

  const words = body.split(/\s+/).length;
  if (words < 600) warn(file, `only ${words} words; guides should be substantial`);
  if (words > 2300) warn(file, `${words} words; the target is 1,200 to 2,000 (tables count)`);
}

function mdFiles(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { recursive: true }).filter((n) => n.endsWith('.md')).map((n) => path.join(abs, n));
}

// ---------- Run ----------
const explicit = args.filter((a) => a.endsWith('.md'));
const explicitJson = args.filter((a) => a.endsWith('.json'));
if (explicit.length || explicitJson.length) {
  explicit.forEach((f) => checkArticle(path.resolve(f)));
  explicitJson.forEach((f) => {
    const file = path.resolve(f);
    try { checkFarm(file, JSON.parse(fs.readFileSync(file, 'utf8')), { candidate: file.includes('/candidates/') }); }
    catch (e) { err(file, `invalid JSON: ${e.message}`); }
  });
} else {
  const farms = readJsonDir('data/farms');
  readJsonDir('data/candidates', { candidate: true });
  const seen = new Map();
  for (const { file, f } of farms) {
    const h = hostOf(f.website);
    if (h && seen.has(h)) err(file, `same website as ${path.relative(ROOT, seen.get(h))}; possible duplicate farm`);
    else if (h) seen.set(h, file);
  }
  mdFiles('src/content/articles').forEach(checkArticle);
  if (args.includes('--drafts')) mdFiles('src/content/drafts').forEach(checkArticle);
}

for (const w of warnings) console.log(`warning  ${w}`);
for (const e of errors) console.log(`ERROR    ${e}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
