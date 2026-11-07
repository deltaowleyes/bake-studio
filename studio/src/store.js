/* BAKE Studio: the project state (S), saving to this browser, and a tiny store React subscribes to.
   S is one plain object (see ARCHITECTURE.md §3). Change it inside commit(fn); every subscribed
   component then redraws and the project is saved 250 ms later. */
import { useSyncExternalStore } from 'react';
import { Art } from './lib/art.js';

export const KEY = 'bake-studio-v2';

export function blank() {
  return {
    v: 3, step: 1,
    source: { has: true, url: 'https://deltaowleyes.ca/', log: [], found: null },
    biz: { name: 'Your business', desc: '' },
    brand: { pal: Object.assign({}, Art.PALETTES[0]), palFound: null, font: 0, seed: { logo: 0, hero: 0, ill: 0 }, opts: { logo: [], hero: [], ill: [] }, pick: {}, star: {} },
    pages: [], lib: [], footer: { motto: '', text: '' },
    menu: { items: [], cta: { label: 'Contact us', href: '#contact' }, vp: { desktop: { type: 'bar', logo: 'left', sticky: true, cta: false, search: false }, tablet: { type: 'hamburger', logo: 'left', sticky: true, cta: false, search: false }, phone: { type: 'hamburger', logo: 'left', sticky: true, cta: false, search: false } } },
    tpl: { pick: null, view: null, fav: {}, all: false, favOnly: false },
    notes: [], req: { name: '', email: '' }, ai: { endpoint: '' },
    ui: { vp: 'desktop', tvp: 'all', mvp: 'desktop', btab: 'logo', bsrc: 'svg', sel: null, open: false, prompt: {}, page: null, tpage: null, pasteFor: null, libq: '' }
  };
}

export function load() {
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (o && o.v == 2) {   // v2 had one page in S.sections
      o.v = 3; o.pages = [{ id: 'p-home', name: 'Home', url: (o.source && o.source.url) || '', status: 'imported', sections: o.sections || [] }]; delete o.sections; o.lib = [];
      ['logo', 'hero'].forEach(t => o.brand.opts[t].forEach(x => { if (x.from == 'site') o.lib.push({ id: x.id, src: x.src, label: x.label || '', logo: t == 'logo' }); }));
    }
    if (o && o.v == 3) { const b = blank(); for (const k in b) if (!(k in o)) o[k] = b[k]; for (const k in b.ui) if (!(k in o.ui)) o.ui[k] = b.ui[k]; return o; }
  } catch (e) { /* unreadable save: start fresh */ }
  return null;
}

/* ---------- store ---------- */
export let S = load() || blank();
const hm = /#step-(\d)/.exec(location.hash); if (hm) S.step = Math.min(5, Math.max(1, +hm[1]));

let rev = 0, saveT, storageFull = false;
const subs = new Set();
function emit() { rev++; subs.forEach(f => f()); }
export function save() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    let full = false;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { full = true; }
    if (full != storageFull) { storageFull = full; emit(); }
  }, 250);
}
/** Change the project: commit(S => { S.biz.name = 'x' }). Redraws and saves. */
export function commit(fn) { if (fn) fn(S); save(); emit(); }
export function useStudio() { useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => rev); return S; }
export function useRev() { return useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => rev); }
export function isStorageFull() { return storageFull; }
export function startOver() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } location.href = location.pathname; }
