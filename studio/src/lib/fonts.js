/* Google Fonts for generated pages.
   Screenshots are drawn from an SVG, which can't download fonts. So for each family a page uses
   (Render puts them in data-gf="Family:400,700|Other:400" on the page), this fetches Google's CSS,
   keeps the Latin subset, turns the font files into data URLs, and returns @font-face rules that
   Shot embeds in the screenshot. The same rules are added to this page so measuring matches. */
let LIST = null, BYNAME = null;
/** The full Google Fonts list: [family, category, weights[], hasItalic, hasLatin]. Loaded on demand. */
export function fontList() {
  if (LIST) return Promise.resolve(LIST);
  return import('./gfonts.json').then(m => { LIST = m.default; BYNAME = {}; LIST.forEach(f => { BYNAME[f[0]] = f; }); return LIST; });
}
export const CATEGORY = { s: 'Sans serif', r: 'Serif', d: 'Display', h: 'Handwriting', m: 'Monospace' };
export const FALLBACK = { s: 'sans-serif', r: 'serif', d: 'sans-serif', h: 'cursive', m: 'monospace' };
export function fontInfo(fam) { return BYNAME && BYNAME[fam]; }
export function nearest(weights, w) { return weights.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a), weights[0]); }

const fileCache = {}, famCache = {}, injected = {}, previewed = {};
function toData(url) {
  return fileCache[url] || (fileCache[url] = fetch(url).then(r => { if (!r.ok) throw new Error('font file'); return r.blob(); })
    .then(b => new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b); })));
}
function cssUrl(fam, weights, text) {
  return 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fam).replace(/%20/g, '+') + ':wght@' + weights.join(';') + '&display=block' + (text ? '&text=' + encodeURIComponent(text) : '');
}
function familyCss(fam, weights) {
  const key = fam + ':' + weights.join(',');
  if (famCache[key]) return famCache[key];
  famCache[key] = fetch(cssUrl(fam, weights)).then(r => { if (!r.ok) throw new Error('font css'); return r.text(); }).then(css => {
    const blocks = css.split(/(?=\/\* [\w-]+ \*\/)/).filter(b => /@font-face/.test(b));
    let keep = blocks.filter(b => /^\/\* latin \*\//.test(b));
    if (!keep.length) keep = blocks.slice(0, weights.length);   // a few fonts have no Latin subset
    return Promise.all(keep.map(b => { const m = /url\((https:[^)]+)\)/.exec(b); return m ? toData(m[1]).then(d => b.replace(m[1], d)).catch(() => '') : b; }));
  }).then(list => list.join('\n')).catch(() => '');
  return famCache[key];
}

/** spec: 'Inter:400,700|Lora:400'. Resolves to @font-face CSS with embedded fonts ('' if none or offline). */
export async function pageFonts(spec) {
  if (!spec) return '';
  await fontList();
  const parts = await Promise.all(spec.split('|').map(p => {
    const i = p.lastIndexOf(':'), fam = p.slice(0, i), f = BYNAME[fam]; if (!f) return null;
    const ws = [...new Set(p.slice(i + 1).split(',').map(x => nearest(f[2], +x)))].sort((a, b) => a - b);
    return familyCss(fam, ws).then(css => ({ fam, ws, css }));
  }));
  let out = '';
  for (const x of parts) {
    if (!x || !x.css) continue;
    out += x.css + '\n';
    if (!injected[x.css]) { const st = document.createElement('style'); st.dataset.gf = x.fam; st.textContent = x.css; document.head.appendChild(st); injected[x.css] = 1; }
  }
  await Promise.all(parts.filter(x => x && x.css).flatMap(x => x.ws.map(w => document.fonts.load(w + ' 16px "' + x.fam + '"').catch(() => null))));
  return out;
}

/** Loads just enough of a font to show its name in the font picker. The preview copy gets its own
    family name (previewName) so it can never stand in for the full font on the page. */
export const previewName = fam => 'bake-preview ' + fam;
export function previewFont(fam) {
  if (previewed[fam] || !BYNAME || !BYNAME[fam]) return;
  previewed[fam] = 1;
  const f = BYNAME[fam];
  fetch(cssUrl(fam, [nearest(f[2], 400)], fam + ' Aa0123')).then(r => (r.ok ? r.text() : '')).then(css => {
    if (!css) return;
    const st = document.createElement('style'); st.dataset.gfPreview = fam;
    st.textContent = css.replace(/font-family:\s*'[^']*'/g, "font-family:'" + previewName(fam).replace(/'/g, '') + "'");
    document.head.appendChild(st);
  }).catch(() => { previewed[fam] = 0; });
}
/** CSS font-family value for a Google font, with a sensible fallback. */
export function stack(fam) { const f = fontInfo(fam); return "'" + fam.replace(/'/g, '') + "'," + (f ? FALLBACK[f[1]] : 'sans-serif'); }
