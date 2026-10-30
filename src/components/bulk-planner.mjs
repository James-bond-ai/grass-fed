// Bulk beef planner math. Every constant comes from our guide,
// src/content/articles/how-to-buy-a-quarter-cow.md (published at BULK_GUIDE).
// Used by BulkPlanner.astro on the server (no-JS table, first paint) and in
// the browser (live results), so both always agree.

// Per share, straight from the guide's table "Quarter, half and whole shares"
// (our own estimate there, built from the extension figures below):
// hanging weight in lb, take-home bone-in meat in lb, freezer space in cu ft.
export const SHARES = {
  quarter: { label: 'Quarter', fraction: 0.25, hanging: [150, 200], takeHome: [100, 140], freezer: [2.5, 4] },
  half: { label: 'Half', fraction: 0.5, hanging: [300, 400], takeHome: [200, 280], freezer: [5, 8] },
  whole: { label: 'Whole', fraction: 1, hanging: [600, 800], takeHome: [400, 560], freezer: [10, 16] },
};
export const SHARE_KEYS = ['quarter', 'half', 'whole'];

// Bone-in cutting yield: 65 to 70 percent of hanging weight (Ohio State
// Extension, Wayne County, as cited in the guide). Boneless is 55 to 60.
export const YIELD = [0.65, 0.7];
export const YIELD_BONELESS = [0.55, 0.6];

// Freezer packing: 35 to 40 lb of cut and wrapped beef per cubic foot
// (Oklahoma State Extension, as cited in the guide).
export const LB_PER_CU_FT = [35, 40];

// Frozen storage: beef 9 to 12 months, ground beef 3 to 4 months
// (Oklahoma State Extension, as cited in the guide).
export const STORAGE_MONTHS = [9, 12];
export const GROUND_MONTHS = [3, 4];

// Minnesota Extension's recommendation for a quarter of about 142 lb.
export const MN_QUARTER_CU_FT = { chest: 4.5, upright: 5.5 };

export const HOUSEHOLD = { min: 1, max: 8, start: 4 };

// Calendar arithmetic, not a beef figure.
const WEEKS_PER_MONTH = 52 / 12;

const lo = (r) => Math.min(...r);
const hi = (r) => Math.max(...r);

// Hanging weight, take-home weight and freezer space for one share size,
// as the guide's table gives them. Unknown keys fall back to a quarter.
export function estimate(shareKey) {
  const key = Object.prototype.hasOwnProperty.call(SHARES, shareKey) ? shareKey : 'quarter';
  const s = SHARES[key];
  return { share: key, label: s.label, fraction: s.fraction, hanging: [...s.hanging], takeHome: [...s.takeHome], freezer: [...s.freezer] };
}

// Pounds per person per week a household would eat to finish the share
// inside the guide's 9 to 12 month storage window.
export function paceToFinish(est, household) {
  const people = clampHousehold(household);
  const weeksShort = lo(STORAGE_MONTHS) * WEEKS_PER_MONTH;
  const weeksLong = hi(STORAGE_MONTHS) * WEEKS_PER_MONTH;
  return [est.takeHome[0] / people / weeksLong, est.takeHome[1] / people / weeksShort];
}

// How many months the share lasts at the user's own stated weekly amount.
// Returns null when the amount is missing or not a positive number.
export function monthsToEat(est, household, lbPerPersonWeek) {
  const w = toPositive(lbPerPersonWeek);
  if (w === null) return null;
  const perWeek = w * clampHousehold(household);
  return [est.takeHome[0] / perWeek / WEEKS_PER_MONTH, est.takeHome[1] / perWeek / WEEKS_PER_MONTH];
}

// Cost for one carcass weight and one take-home weight, from the user's own
// prices. price and processing are per lb of hanging weight; slaughterFee is
// per animal and split by the share fraction.
export function costFor(hangingLb, takeHomeLb, { price, processing = 0, slaughterFee = 0, fraction = 1 }) {
  const beef = hangingLb * price;
  const cut = hangingLb * processing;
  const fee = slaughterFee * fraction;
  const total = beef + cut + fee;
  return { beef, cut, fee, total, perTakeHomeLb: total / takeHomeLb };
}

// Cost range for a share, from the user's own prices. Returns null unless a
// positive hanging-weight price was entered. The per-pound range uses the
// unrounded 65 to 70 percent yield at both ends of the hanging range.
export function estimateCost(est, { price, processing, slaughterFee } = {}) {
  const p = toPositive(price);
  if (p === null) return null;
  const opts = { price: p, processing: toPositive(processing) ?? 0, slaughterFee: toPositive(slaughterFee) ?? 0, fraction: est.fraction };
  const corners = [];
  for (const h of est.hanging) for (const y of YIELD) corners.push(costFor(h, h * y, opts));
  const totals = corners.map((c) => c.total);
  const perLb = corners.map((c) => c.perTakeHomeLb);
  return {
    total: [Math.min(...totals), Math.max(...totals)],
    perTakeHomeLb: [Math.min(...perLb), Math.max(...perLb)],
    includesProcessing: opts.processing > 0,
    includesSlaughter: opts.slaughterFee > 0,
  };
}

export function clampHousehold(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return HOUSEHOLD.start;
  return Math.min(HOUSEHOLD.max, Math.max(HOUSEHOLD.min, v));
}

export function toPositive(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/[$,\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Formatting helpers shared by server and browser.
const num = (n, digits = 0) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: digits });
export const fmtRange = (r, digits = 0) => {
  const a = num(r[0], digits);
  const b = num(r[1], digits);
  return a === b ? a : `${a} to ${b}`;
};
export const fmtMoney = (n) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
export const fmtMoneyRange = (r) => {
  const a = fmtMoney(r[0]);
  const b = fmtMoney(r[1]);
  return a === b ? a : `${a} to ${b}`;
};
export const fmtCents = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fmtCentsRange = (r) => {
  const a = fmtCents(r[0]);
  const b = fmtCents(r[1]);
  return a === b ? a : `${a} to ${b}`;
};

// One block per cubic foot for the freezer picture. solid is the share of the
// block filled at the low end of the range, upTo the share filled at the high end.
export function freezerBlocks(freezer) {
  const count = Math.ceil(hi(freezer));
  return Array.from({ length: count }, (_, i) => ({
    solid: Math.min(1, Math.max(0, freezer[0] - i)),
    upTo: Math.min(1, Math.max(0, freezer[1] - i)),
  }));
}
