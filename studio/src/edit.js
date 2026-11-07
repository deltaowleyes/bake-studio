/* BAKE Studio: editing logic shared by the steps (ported from the old app.js; same behaviour).
   These functions change S directly; callers wrap them in commit() so the screen redraws. */
import { Art } from './lib/art.js';
import { Importer } from './lib/importer.js';
import { S, save } from './store.js';

export const nid = Importer.id;
export const VPW = { desktop: 1280, tablet: 820, phone: 390 };
export const VPN = { desktop: 'Desktop', tablet: 'Tablet', phone: 'Phone' };
export const STEPS = ['Your site', 'Brand', 'Sections', 'Menu', 'Templates'];

/* ---------- pages ---------- */
export function curPage() { const p = S.pages.filter(x => x.id == S.ui.page)[0] || S.pages[0]; if (p) S.ui.page = p.id; return p || { sections: [] }; }
export function SEC() { return curPage().sections; }
export function cur() { return SEC().filter(s => s.id == S.ui.sel)[0]; }
export function placeholderPage(name, url) {
  return { id: nid('p'), name, url: url || '', status: url ? 'waiting' : 'new', sections: [sec('pagehead', { title: name, text: url ? 'This page hasn’t been imported yet. Import it in step 1, or build it here.' : '' }), sec('text', { title: 'About this page', text: 'Add this page’s content.' })] };
}
export function addLib(list) {
  const seen = {}; S.lib.forEach(l => { seen[l.src.split('?')[0]] = 1; });
  (list || []).forEach(l => { const k = l.src.split('?')[0]; if (!seen[k]) { seen[k] = 1; S.lib.push(l); } });
  if (S.lib.length > 400) S.lib.length = 400;
}

/* ---------- brand options ---------- */
export function genSvg(type, n) {
  const b = S.brand, keep = b.opts[type].filter(o => o.from != 'svg' || b.star[o.id] || b.pick[type] == o.id);
  const add = Art.genOptions(type, ++b.seed[type], n || 6).map(o => { o.id = nid('o'); o.from = 'svg'; return o; });
  b.opts[type] = keep.concat(add);
  if (!b.pick[type] || !b.opts[type].some(o => o.id == b.pick[type])) b.pick[type] = b.opts[type][0].id;
}
export function ensureArt() { ['logo', 'hero', 'ill'].forEach(t => { if (!S.brand.opts[t].some(o => o.from == 'svg')) genSvg(t); }); }
export function ensurePages() { if (!S.pages.length) S.pages.push({ id: nid('p'), name: 'Home', url: '', status: 'new', sections: [] }); }
export function libOpt(oid) {
  if (String(oid).indexOf('lib:') != 0) return oid;
  const l = S.lib.filter(x => 'lib:' + x.id == oid)[0], t = S.ui.btab; if (!l) return oid;
  const o = { id: nid('o'), kind: 'img', src: l.src, from: 'site', label: l.label }; S.brand.opts[t].push(o); return o.id;
}
export function defPrompt(t) {
  const n = S.biz.name, d = S.biz.desc ? ': ' + S.biz.desc.replace(/\.$/, '') : '';
  return { logo: 'A simple, memorable logo for ' + n + d + '. Flat vector style that works at small sizes.', hero: 'A wide, calm hero image for ' + n + d + ', with space for text on the left.', ill: 'A friendly flat spot illustration for ' + n + d + ', limited colour palette.' }[t];
}
/* Shrink an uploaded image to a data URL (WebP), max side `max` px. SVGs are kept as they are. */
export function shrink(file, max) {
  return new Promise((ok, bad) => {
    const fr = new FileReader();
    fr.onload = () => {
      if (/svg/.test(file.type)) return ok(fr.result);
      const im = new Image();
      im.onload = () => { const s = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL('image/webp', .85)); };
      im.onerror = bad; im.src = fr.result;
    };
    fr.onerror = bad; fr.readAsDataURL(file);
  });
}

/* ---------- starting content ---------- */
export function sec(type, o) { const s = { id: nid('s'), type, title: '', text: '' }; for (const k in o) s[k] = o[k]; if (s.items) s.items.forEach(i => { i.id = nid('i'); }); return s; }
function item(t, x, l, lt) { return { title: t, text: x || '', link: l || '', linkText: lt || '' }; }
export function defaultSection(type) {
  const d = {
    hero: { title: S.biz.name, text: S.biz.desc, linkText: 'Get started', link: '#' },
    tiles: { title: 'What we offer', cols: 3, items: [item('First thing', 'A short description.', '#'), item('Second thing', 'A short description.', '#'), item('Third thing', 'A short description.', '#')] },
    feature: { title: 'Featured', eyebrow: 'Highlight', headline: 'Your most important story', text: 'A few sentences about it.', linkText: 'Read more', link: '#' },
    list: { title: 'Useful links', items: [item('First link', '', '#', 'Open'), item('Second link', '', '#', 'Open')] },
    text: { title: 'About us', text: 'Tell visitors who you are and what you do.' },
    stats: { title: 'By the numbers', items: [item('10+', 'Years'), item('500', 'People helped'), item('24', 'Partners')] },
    gallery: { title: 'Gallery', items: [item('Photo one'), item('Photo two'), item('Photo three')] },
    testimonial: { title: 'What people say', items: [item('Customer name', 'A short quote from a customer goes here.')] },
    cta: { title: 'Get in touch', text: 'One line inviting people to contact you.', linkText: 'Contact us', link: '#contact' },
    contact: { title: 'Contact', items: [item('Email', 'hello@example.com', 'mailto:hello@example.com'), item('Phone', '000-000-0000'), item('Address', 'Street, Town')] },
    videos: { title: 'Videos', items: [item('First video', '', '#'), item('Second video', '', '#'), item('Third video', '', '#'), item('Fourth video', '', '#')] },
    podcast: { title: 'Podcasts', items: [item('Episode one', 'What this episode is about.', '#'), item('Episode two', 'What this episode is about.', '#')] },
    pagehead: { title: 'Page title', text: 'A short introduction to this page.' }
  }[type];
  return sec(type, JSON.parse(JSON.stringify(d)));
}
export function starter(kind) {
  const n = S.biz.name, L = (l, h) => ({ id: nid('m'), label: l, href: h || '#' });
  const G = (l, kids) => ({ id: nid('g'), label: l, href: '', children: kids });
  const map = {
    community: { secs: ['hero', 'tiles', 'feature', 'list', 'text', 'cta'], menu: [L('News'), L('Events'), G('Community', [L('Directory'), L('Resources'), L('Groups')]), L('About'), L('Contact')] },
    food: { secs: ['hero', 'tiles', 'gallery', 'testimonial', 'contact', 'cta'], menu: [L('Menu'), L('Order online'), L('Gallery'), L('Visit us')] },
    shop: { secs: ['hero', 'tiles', 'feature', 'testimonial', 'cta'], menu: [G('Shop', [L('New arrivals'), L('Best sellers'), L('Sale')]), L('About'), L('Contact')] },
    services: { secs: ['hero', 'tiles', 'stats', 'testimonial', 'contact', 'cta'], menu: [L('Services'), L('Our work'), L('Reviews'), L('Contact')] }
  }[kind];
  const home = { id: nid('p'), name: 'Home', url: '', status: 'new', sections: map.secs.map(defaultSection) }; home.sections[0].title = n;
  S.pages = [home].concat(map.menu.map(m => placeholderPage(m.label))); S.ui.page = home.id; S.lib = [];
  S.menu.items = map.menu; S.footer = { motto: '', text: '© ' + n };
}

/* ---------- importing ---------- */
export function logLine(t, cls) { S.source.log.push([t, cls || '']); }
export function applyImport(r) {
  S.source.found = { url: r.url, colours: r.colours, name: r.name };
  S.biz.name = r.name; S.biz.desc = r.desc;
  const b = S.brand; S.lib = []; addLib(r.lib);
  b.opts = { logo: [], hero: [], ill: [] }; b.pick = {}; b.star = {};
  const nm = r.name.toLowerCase();
  r.lib.filter(l => l.logo || l.label.toLowerCase().indexOf(nm) >= 0).sort((a, c) => (c.label.toLowerCase().indexOf(nm) >= 0) - (a.label.toLowerCase().indexOf(nm) >= 0)).slice(0, 4).forEach(l => { b.opts.logo.push({ id: nid('o'), kind: 'img', src: l.src, from: 'site', label: l.label }); });
  r.lib.filter(l => !l.logo).slice(0, 3).forEach(l => { b.opts.hero.push({ id: nid('o'), kind: 'img', src: l.src, from: 'site', label: l.label }); });
  ['logo', 'hero', 'ill'].forEach(t => { genSvg(t); if (b.opts[t][0]) b.pick[t] = b.opts[t][0].id; });
  if (r.colours) { b.palFound = r.colours.pal; b.pal = Object.assign({}, r.colours.pal); }
  b.font = r.serif ? 0 : 4;
  const flat = r.menu.filter(m => !m.children || !m.children.length);
  const hero = sec('hero', { title: r.name, eyebrow: r.tagline && r.tagline != r.name && r.tagline.length < 80 ? r.tagline : '', text: r.desc, linkText: flat[0] ? flat[0].label : '', link: flat[0] ? flat[0].href : '', link2Text: flat[1] ? flat[1].label : '', link2: flat[1] ? flat[1].href : '' });
  const home = { id: nid('p'), name: 'Home', url: r.url, status: 'imported', sections: [hero].concat(r.sections) };
  S.pages = [home].concat(r.pages.map(p => placeholderPage(p.name, p.url)));
  S.ui.page = home.id; S.ui.tpage = home.id;
  S.menu.items = r.menu.length ? r.menu : [{ id: nid('m'), label: 'Home', href: r.url }];
  const contact = []; r.menu.forEach(m => { (m.children && m.children.length ? m.children : [m]).forEach(c => { if (/contact/i.test(c.label)) contact.push(c); }); });
  if (contact[0]) S.menu.cta = { label: contact[0].label, href: contact[0].href };
  S.footer = { motto: r.motto, text: '© ' + r.name };
  S.ui.sel = hero.id;
}
export async function importPage(pg, html) {
  try {
    if (!html) { const r0 = await Importer.fetchHtml(pg.url); html = r0.html; }
    const r = await Importer.analyse(html, pg.url, null, { inner: true });
    pg.sections = r.sections.length ? r.sections : pg.sections; pg.status = 'imported'; addLib(r.lib);
  } catch (e) { pg.status = 'blocked'; }
  save();
}

/* ---------- step 3 editor fields ---------- */
export const F_COMMON = [['bg', 'Background', 'sel', [['auto', 'Template default'], ['default', 'Page colour'], ['soft', 'Soft panel'], ['ink', 'Dark'], ['acc', 'Accent colour']]], ['align', 'Alignment', 'sel', [['auto', 'Template default'], ['left', 'Left'], ['center', 'Centred'], ['right', 'Right']]]];
const IMG = ['image', 'Image', 'pick'];
export const FIELDS = {
  pagehead: [['title', 'Page title'], ['text', 'Introduction', 'area'], ['image', 'Banner image', 'pick']],
  videos: [['title', 'Title'], ['text', 'Intro text', 'area'], ['moreText', 'Header link label'], ['moreLink', 'Header link'], ['style', 'Layout', 'sel', [['auto', 'Template default'], ['lead', 'Big lead video plus list'], ['grid', 'Grid'], ['row', 'Scrolling row']]]],
  podcast: [['title', 'Title'], ['text', 'Intro text', 'area'], ['moreText', 'Header link label'], ['moreLink', 'Header link']],
  hero: [['eyebrow', 'Small line above the title'], ['title', 'Title'], ['text', 'Text', 'area'], ['linkText', 'Button label'], ['link', 'Button link'], ['link2Text', 'Second button label'], ['link2', 'Second button link'], ['layout', 'Layout', 'sel', [['auto', 'Template default'], ['split', 'Text beside image'], ['overlay', 'Text over image'], ['center', 'Centred'], ['editorial', 'Headline first'], ['band', 'Image strip on top'], ['portal', 'Dark welcome panel']]], IMG],
  tiles: [['title', 'Title'], ['text', 'Intro text', 'area'], ['moreText', 'Header link label'], ['moreLink', 'Header link'], ['cols', 'Columns', 'sel', [['2', '2'], ['3', '3'], ['4', '4']]], ['style', 'Card style', 'sel', [['auto', 'Template default'], ['cards', 'Cards'], ['app', 'App tiles'], ['rule', 'Newspaper'], ['list', 'List'], ['icons', 'With icons'], ['bento', 'Mosaic'], ['cols', 'Two-column list']]], ['showImg', 'Show illustrations on cards', 'chk']],
  feature: [['title', 'Section title'], ['moreText', 'Header link label'], ['moreLink', 'Header link'], ['eyebrow', 'Small line (date or topic)'], ['headline', 'Headline'], ['text', 'Text', 'area'], ['linkText', 'Button label'], ['link', 'Button link'], ['style', 'Layout', 'sel', [['auto', 'Template default'], ['wide', 'Wide image on top'], ['split', 'Image beside text'], ['card', 'Card']]], IMG],
  list: [['title', 'Title'], ['text', 'Intro text', 'area'], ['linkText', 'Bottom link label'], ['link', 'Bottom link']],
  text: [['title', 'Title'], ['text', 'Text (blank line = new paragraph)', 'area'], ['linkText', 'Link label'], ['link', 'Link'], IMG],
  stats: [['title', 'Title'], ['text', 'Intro text', 'area']], gallery: [['title', 'Title'], ['text', 'Intro text', 'area']], testimonial: [['title', 'Title']],
  cta: [['title', 'Title'], ['text', 'Text', 'area'], ['linkText', 'Button label'], ['link', 'Button link']],
  contact: [['title', 'Title'], ['text', 'Intro text', 'area'], ['linkText', 'Button label'], ['link', 'Button link']]
};
export const ITEMF = {
  videos: [['image', 'Thumbnail', 'pick'], ['title', 'Title'], ['eyebrow', 'Small line (show, date or byline)'], ['duration', 'Length (like 3:45)'], ['link', 'Link']],
  podcast: [['image', 'Cover image', 'pick'], ['title', 'Episode title'], ['text', 'Description'], ['link', 'Link']],
  tiles: [['image', 'Image', 'pick'], ['eyebrow', 'Small line (category or date)'], ['title', 'Title'], ['text', 'Text'], ['link', 'Link'], ['linkText', 'Link label (optional)']],
  list: [['title', 'Title'], ['text', 'Detail (optional)'], ['linkText', 'Link label'], ['link', 'Link']],
  stats: [['title', 'Number'], ['text', 'Label']], gallery: [['image', 'Image', 'pick'], ['title', 'Caption']], testimonial: [['text', 'Quote'], ['title', 'Name']],
  contact: [['title', 'Label'], ['text', 'Value'], ['link', 'Link (optional)']]
};
export const FOOTER_F = [['motto', 'Motto or tagline'], ['text', 'Bottom line (for example © name)']];
/** The object a field path points at: 'footer', 'sec' (selected section) or 'item:N'. */
export function target(path) { const s = cur(); if (path == 'footer') return S.footer; if (path == 'sec') return s; return s && s.items && s.items[+path.split(':')[1]]; }
/** Element id of an editor field, so the preview overlays can jump to it. */
export function fieldId(path, k) { return 'f-' + path.replace(/\W/g, '_') + '-' + k; }

/* ---------- step 4 ---------- */
export function mget(path) { const p = String(path).split('.'), a = S.menu.items; return p.length == 1 ? { list: a, i: +p[0] } : { list: a[+p[0]].children, i: +p[1] }; }
