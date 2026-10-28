// Liquid glass for HTML elements.
//
// The refraction model (a shape distance field, with edge and rim refraction
// falling off exponentially along the shape's normal) is ported from
// liquid-glass-js by Armagan Amcalar, MIT License:
// https://github.com/dashersw/liquid-glass-js
//
// That library renders each glass element with its own WebGL context over an
// html2canvas snapshot of the page, which is too heavy for long directory
// pages and can't see live content such as our 3D hero. Here the same maths
// builds a displacement map per element, applied as an SVG filter through
// CSS backdrop-filter, so the glass bends whatever is really behind it.
// Browsers without SVG backdrop filters (Safari, Firefox) keep the frosted
// CSS glass from global.css.

const NS = 'http://www.w3.org/2000/svg';
const P = {
  edgeDistance: 0.15, // from liquid-glass-js defaults
  rimDistance: 0.8,
  edgeIntensity: 0.5,
  rimIntensity: 1.0,
  maxShift: 18, // px at full intensity
};

function supported() {
  const brands = navigator.userAgentData?.brands ?? [];
  const chromium = brands.some((b) => /Chromium/i.test(b.brand));
  return chromium && CSS.supports('backdrop-filter', 'blur(1px)');
}

// Signed distance to a rounded rectangle (negative inside), as in liquid-glass-js.
function roundedRectDistance(px, py, w, h, r) {
  const qx = Math.abs(px - w / 2) - (w / 2 - r);
  const qy = Math.abs(py - h / 2) - (h / 2 - r);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inside = Math.min(Math.max(qx, qy), 0);
  return outside + inside - r;
}

function displacementMap(w, h, r) {
  const scale = 0.5; // half-resolution map, stretched by the filter
  const cw = Math.max(2, Math.round(w * scale));
  const ch = Math.max(2, Math.round(h * scale));
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(cw, ch);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const px = (x + 0.5) / scale;
      const py = (y + 0.5) / scale;
      const d = Math.max(0, -roundedRectDistance(px, py, w, h, r)); // distance in from the edge
      // Normal: from the nearest point on the inner rectangle out to this pixel.
      const ix = Math.min(Math.max(px, r), w - r);
      const iy = Math.min(Math.max(py, r), h - r);
      let nx = px - ix;
      let ny = py - iy;
      if (nx === 0 && ny === 0) {
        nx = px - w / 2;
        ny = py - h / 2;
      }
      const len = Math.hypot(nx, ny) || 1;
      nx /= len;
      ny /= len;
      const edge = Math.exp(-d * P.edgeDistance) * P.edgeIntensity;
      const rim = Math.exp(-d * P.rimDistance) * P.rimIntensity;
      const k = Math.min(1, edge + rim);
      const i = (y * cw + x) * 4;
      // Pull samples from further inside near the edge, which magnifies the rim.
      img.data[i] = 128 - nx * k * 127;
      img.data[i + 1] = 128 - ny * k * 127;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

let svg;
let n = 0;
function defs() {
  if (!svg) {
    svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    svg.appendChild(document.createElementNS(NS, 'defs'));
    document.body.appendChild(svg);
  }
  return svg.firstChild;
}

function apply(el) {
  const rect = el.getBoundingClientRect();
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);
  if (w < 8 || h < 8 || w * h > 1600 * 900) return;
  const cs = getComputedStyle(el);
  const r = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, w / 2, h / 2);
  const blur = parseFloat(el.dataset.glassBlur ?? '10');
  const key = `${w}x${h}r${r}b${blur}`;
  if (el._lgKey === key) return;
  el._lgKey = key;

  const id = el._lgId ?? `lg-${++n}`;
  el._lgId = id;
  defs().querySelector(`#${id}`)?.remove();
  const f = document.createElementNS(NS, 'filter');
  f.id = id;
  f.setAttribute('x', '0');
  f.setAttribute('y', '0');
  f.setAttribute('width', '100%');
  f.setAttribute('height', '100%');
  f.setAttribute('color-interpolation-filters', 'sRGB');
  f.innerHTML = `
    <feImage href="${displacementMap(w, h, r)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/>
    <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="soft"/>
    <feDisplacementMap in="soft" in2="map" scale="${P.maxShift * 2}" xChannelSelector="R" yChannelSelector="G" result="bent"/>
    <feColorMatrix in="bent" type="saturate" values="1.6"/>`;
  defs().appendChild(f);
  el.style.backdropFilter = `url(#${id})`;
  el.classList.add('lg-on');
}

export function initLiquidGlass(root = document) {
  if (!supported()) return;
  if (matchMedia('(prefers-reduced-transparency: reduce)').matches) return;
  const els = [...root.querySelectorAll('[data-glass]')];
  if (!els.length) return;
  let queued = new Set();
  let raf = 0;
  const ro = new ResizeObserver((entries) => {
    entries.forEach((e) => queued.add(e.target));
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      queued.forEach(apply);
      queued = new Set();
    });
  });
  els.forEach((el) => ro.observe(el));
}
