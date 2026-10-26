export function fmtDate(d) {
  const date = typeof d === 'string' ? new Date(d + (d.length === 10 ? 'T12:00:00Z' : '')) : d;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
export function daysSince(d) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}
// Listings re-verified within this many days show a normal stamp.
export const FRESH_DAYS = 180;
