// Saved farms ("shortlist"), kept in this browser only. Every storage call is
// wrapped so the site keeps working when storage is blocked or full.
const KEY = 'gf-shortlist';
export const MAX = 40;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const cleanSlugs = (list: unknown): string[] => {
  if (!Array.isArray(list)) return [];
  const out: string[] = [];
  for (const s of list) if (typeof s === 'string' && SLUG.test(s) && !out.includes(s)) out.push(s);
  return out.slice(0, MAX);
};

let usable: boolean | null = null;
export const storageWorks = () => {
  if (usable !== null) return usable;
  try {
    const t = `${KEY}-test`;
    localStorage.setItem(t, '1');
    localStorage.removeItem(t);
    usable = true;
  } catch {
    usable = false;
  }
  return usable;
};

export const readSaved = (): string[] => {
  try { return cleanSlugs(JSON.parse(localStorage.getItem(KEY) ?? '[]')); } catch { return []; }
};

// Returns false if the list could not be written.
export const writeSaved = (slugs: string[]) => {
  try {
    const clean = cleanSlugs(slugs);
    if (clean.length) localStorage.setItem(KEY, JSON.stringify(clean));
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent('shortlist-change'));
    return true;
  } catch {
    return false;
  }
};

// Calls fn whenever the list changes in this tab, another tab, or after a back navigation.
export const onChange = (fn: () => void) => {
  window.addEventListener('shortlist-change', fn);
  window.addEventListener('storage', (e) => { if (e.key === KEY || e.key === null) fn(); });
  window.addEventListener('pageshow', (e) => { if (e.persisted) fn(); });
};

export const track = (name: string, params: Record<string, unknown> = {}) => {
  const g = (window as any).gtag;
  if (typeof g === 'function') g('event', name, params);
};

export const HEART = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

export const plural =(n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
