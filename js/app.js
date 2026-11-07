/* BAKE Studio: the five-step app */
(function () {
  var $ = function (i) { return document.getElementById(i); }, esc = Art.esc, nid = Importer.id;
  var KEY = 'bake-studio-v2', VPW = { desktop: 1280, tablet: 820, phone: 390 }, VPN = { desktop: 'Desktop', tablet: 'Tablet', phone: 'Phone' };
  var STEPS = ['Your site', 'Brand', 'Sections', 'Menu', 'Templates'];
  var S;

  function blank() {
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

  /* ---------- saving ---------- */
  var saveT;
  function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(S)); $('warn').hidden = true; } catch (e) { $('warn').hidden = false; $('warn').textContent = 'Your browser’s storage is full, so the latest changes aren’t saved. Try removing some uploaded images.'; } }, 250); }
  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && o.v == 2) { o.v = 3; o.pages = [{ id: 'p-home', name: 'Home', url: o.source && o.source.url || '', status: 'imported', sections: o.sections || [] }]; delete o.sections; o.lib = []; ['logo', 'hero'].forEach(function (t) { o.brand.opts[t].forEach(function (x) { if (x.from == 'site') o.lib.push({ id: x.id, src: x.src, label: x.label || '', logo: t == 'logo' }); }); }); }
      if (o && o.v == 3) { var b = blank(); for (var k in b) if (!(k in o)) o[k] = b[k]; for (k in b.ui) if (!(k in o.ui)) o.ui[k] = b.ui[k]; return o; } } catch (e) { } return null; }

  /* ---------- pages ---------- */
  function curPage() { var p = S.pages.filter(function (x) { return x.id == S.ui.page; })[0] || S.pages[0]; if (p) S.ui.page = p.id; return p || { sections: [] }; }
  function SEC() { return curPage().sections; }
  function placeholderPage(name, url) {
    return { id: nid('p'), name: name, url: url || '', status: url ? 'waiting' : 'new', sections: [sec('pagehead', { title: name, text: url ? 'This page hasn’t been imported yet. Import it in step 1, or build it here.' : '' }), sec('text', { title: 'About this page', text: 'Add this page’s content.' })] };
  }
  function addLib(list) { var seen = {}; S.lib.forEach(function (l) { seen[l.src.split('?')[0]] = 1; }); (list || []).forEach(function (l) { var k = l.src.split('?')[0]; if (!seen[k]) { seen[k] = 1; S.lib.push(l); } }); if (S.lib.length > 400) S.lib.length = 400; }

  /* ---------- brand options ---------- */
  function genSvg(type, n) {
    var b = S.brand, keep = b.opts[type].filter(function (o) { return o.from != 'svg' || b.star[o.id] || b.pick[type] == o.id; });
    var add = Art.genOptions(type, ++b.seed[type], n || 6).map(function (o) { o.id = nid('o'); o.from = 'svg'; return o; });
    b.opts[type] = keep.concat(add);
    if (!b.pick[type] || !b.opts[type].some(function (o) { return o.id == b.pick[type]; })) b.pick[type] = b.opts[type][0].id;
  }
  function ensureArt() { ['logo', 'hero', 'ill'].forEach(function (t) { if (!S.brand.opts[t].some(function (o) { return o.from == 'svg'; })) genSvg(t); }); }

  /* ---------- starting content ---------- */
  function sec(type, o) { var s = { id: nid('s'), type: type, title: '', text: '' }; for (var k in o) s[k] = o[k]; if (s.items) s.items.forEach(function (i) { i.id = nid('i'); }); return s; }
  function item(t, x, l, lt) { return { title: t, text: x || '', link: l || '', linkText: lt || '' }; }
  function defaultSection(type) {
    var d = {
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
  function starter(kind) {
    var n = S.biz.name, L = function (l, h) { return { id: nid('m'), label: l, href: h || '#' }; };
    var G = function (l, kids) { return { id: nid('g'), label: l, href: '', children: kids }; };
    var map = {
      community: { secs: ['hero', 'tiles', 'feature', 'list', 'text', 'cta'], menu: [L('News'), L('Events'), G('Community', [L('Directory'), L('Resources'), L('Groups')]), L('About'), L('Contact')] },
      food: { secs: ['hero', 'tiles', 'gallery', 'testimonial', 'contact', 'cta'], menu: [L('Menu'), L('Order online'), L('Gallery'), L('Visit us')] },
      shop: { secs: ['hero', 'tiles', 'feature', 'testimonial', 'cta'], menu: [G('Shop', [L('New arrivals'), L('Best sellers'), L('Sale')]), L('About'), L('Contact')] },
      services: { secs: ['hero', 'tiles', 'stats', 'testimonial', 'contact', 'cta'], menu: [L('Services'), L('Our work'), L('Reviews'), L('Contact')] }
    }[kind];
    var home = { id: nid('p'), name: 'Home', url: '', status: 'new', sections: map.secs.map(defaultSection) }; home.sections[0].title = n;
    S.pages = [home].concat(map.menu.map(function (m) { return placeholderPage(m.label); })); S.ui.page = home.id; S.lib = [];
    S.menu.items = map.menu; S.footer = { motto: '', text: '© ' + n };
  }
  function applyImport(r) {
    S.source.found = { url: r.url, colours: r.colours, name: r.name };
    S.biz.name = r.name; S.biz.desc = r.desc;
    var b = S.brand; S.lib = []; addLib(r.lib);
    b.opts = { logo: [], hero: [], ill: [] }; b.pick = {}; b.star = {};
    var nm = r.name.toLowerCase(); r.lib.filter(function (l) { return l.logo || l.label.toLowerCase().indexOf(nm) >= 0; }).sort(function (a, b) { return (b.label.toLowerCase().indexOf(nm) >= 0) - (a.label.toLowerCase().indexOf(nm) >= 0); }).slice(0, 4).forEach(function (l) { b.opts.logo.push({ id: nid('o'), kind: 'img', src: l.src, from: 'site', label: l.label }); });
    r.lib.filter(function (l) { return !l.logo; }).slice(0, 3).forEach(function (l) { b.opts.hero.push({ id: nid('o'), kind: 'img', src: l.src, from: 'site', label: l.label }); });
    ['logo', 'hero', 'ill'].forEach(function (t) { genSvg(t); if (b.opts[t][0]) b.pick[t] = b.opts[t][0].id; });
    if (r.colours) { b.palFound = r.colours.pal; b.pal = Object.assign({}, r.colours.pal); }
    b.font = r.serif ? 0 : 4;
    var flat = r.menu.filter(function (m) { return !m.children || !m.children.length; });
    var hero = sec('hero', { title: r.name, eyebrow: r.tagline && r.tagline != r.name && r.tagline.length < 80 ? r.tagline : '', text: r.desc, linkText: flat[0] ? flat[0].label : '', link: flat[0] ? flat[0].href : '', link2Text: flat[1] ? flat[1].label : '', link2: flat[1] ? flat[1].href : '' });
    var home = { id: nid('p'), name: 'Home', url: r.url, status: 'imported', sections: [hero].concat(r.sections) };
    S.pages = [home].concat(r.pages.map(function (p) { return placeholderPage(p.name, p.url); }));
    S.ui.page = home.id; S.ui.tpage = home.id;
    S.menu.items = r.menu.length ? r.menu : [{ id: nid('m'), label: 'Home', href: r.url }];
    var contact = []; r.menu.forEach(function (m) { (m.children && m.children.length ? m.children : [m]).forEach(function (c) { if (/contact/i.test(c.label)) contact.push(c); }); });
    if (contact[0]) S.menu.cta = { label: contact[0].label, href: contact[0].href };
    S.footer = { motto: r.motto, text: '© ' + r.name };
    S.ui.sel = hero.id;
  }
  async function importPage(pg, html) {
    try {
      if (!html) { var r0 = await Importer.fetchHtml(pg.url); html = r0.html; }
      var r = await Importer.analyse(html, pg.url, null, { inner: true });
      pg.sections = r.sections.length ? r.sections : pg.sections; pg.status = 'imported'; addLib(r.lib);
    } catch (e) { pg.status = 'blocked'; }
    save();
  }

  /* ---------- preview frames ---------- */
  var tok = {};
  function frame(stageId, vp, opt) {
    var st = $(stageId); if (!st || st.offsetParent === null) return;
    opt = opt || {}; if (!opt.pageId) opt.pageId = S.ui.page; var html = Render.page(S, opt.tpl || S.tpl.pick || 'news-a', opt), my = tok[stageId] = {};
    if (!st.querySelector('.shots')) st.innerHTML = '<div class="shots"></div><p class="vlab">Making preview…</p>';
    st.classList.add('busy');
    var vps = vp == 'all' ? ['desktop', 'tablet', 'phone'] : [vp];
    Promise.all(vps.map(function (v) { return Shot.take(html, VPW[v], { scale: v == 'desktop' ? 1 : 2 }); })).then(function (res) {
      if (tok[stageId] !== my) return;
      var box = st.querySelector('.shots'); box.className = 'shots' + (vp == 'all' ? ' all' : '');
      box.innerHTML = res.map(function (r, i) { return '<figure class="shot">' + (vp == 'all' ? '<figcaption>' + VPN[vps[i]] + '</figcaption>' : '') + '<img src="' + r.url + '" alt="' + VPN[vps[i]] + ' screenshot of the whole page" data-i="' + i + '" style="max-width:' + r.w + 'px"></figure>'; }).join('');
      st._shots = res;
      st.querySelector('.vlab').textContent = vp == 'all' ? 'Full-page screenshots at 1280, 820 and 390 px wide.' : VPN[vp] + ' screenshot, ' + VPW[vp] + ' px wide, full page.' + (S.step == 3 ? ' Tap a section to edit it.' : '');
      st.classList.remove('busy');
    }).catch(function (e) { if (tok[stageId] !== my) return; st.classList.remove('busy'); st.querySelector('.vlab').textContent = 'The preview couldn’t be made (' + (e && e.message || 'unknown problem') + ').'; });
  }
  function vpButtons() {
    Array.prototype.forEach.call(document.querySelectorAll('.vps'), function (el) {
      var k = el.dataset.vpk; el.innerHTML = (k == 'tvp' ? ['all'] : []).concat(Object.keys(VPW)).map(function (v) { return '<button data-vp="' + v + '" aria-pressed="' + (S.ui[k] == v) + '">' + (v == 'all' ? 'All sizes' : VPN[v]) + '</button>'; }).join('');
    });
  }

  /* ---------- step 1 ---------- */
  function logLine(t, cls) { S.source.log.push([t, cls || '']); $('log').innerHTML = S.source.log.map(function (l) { return '<li class="' + l[1] + '">' + esc(l[0]) + '</li>'; }).join(''); }
  async function runImport(html, url) {
    try {
      var r = await Importer.analyse(html, url, logLine);
      logLine('Found ' + r.menu.length + ' menu items, ' + r.sections.length + ' sections, ' + r.lib.length + ' images, ' + r.pages.length + ' other pages' + (r.colours ? ' and your colours' : '') + '.', 'ok');
      applyImport(r); save(); renderAll();
    } catch (e) { logLine('Couldn’t read that page: ' + e.message, 'bad'); }
  }
  function r1() {
    var src = S.source;
    Array.prototype.forEach.call(document.querySelectorAll('[data-has]'), function (b) { b.setAttribute('aria-pressed', String(src.has == (b.dataset.has == '1'))); });
    $('imp').hidden = !src.has; $('fresh').hidden = src.has;
    if (document.activeElement !== $('url')) $('url').value = src.url;
    $('log').innerHTML = src.log.map(function (l) { return '<li class="' + l[1] + '">' + esc(l[0]) + '</li>'; }).join('');
    var f = src.found, fd = $('found'), home = S.pages[0];
    if (!home || !home.sections.length) { fd.hidden = true; return; }
    fd.hidden = false;
    var logos = S.lib.filter(function (l) { return l.logo; }).slice(0, 6);
    var sw = f && f.colours ? f.colours.found.map(function (h) { return '<span class="sw" style="background:' + h + '" title="' + h + '"></span>'; }).join('') : '';
    var others = S.pages.slice(1), waiting = others.filter(function (p) { return p.url && p.status != 'imported'; }).length;
    var stl = { imported: '✓ Imported', waiting: 'Not imported yet', blocked: 'Blocked: paste its code', importing: 'Importing…', 'new': 'Built here' };
    fd.innerHTML = '<h3>' + (f ? 'What we found on ' + esc(f.url.replace(/^https?:\/\//, '').replace(/\/$/, '')) : 'Your starter site') + '</h3><div class="found-grid">' +
      '<div><h4>' + esc(S.biz.name) + '</h4><p class="mu">' + esc(S.biz.desc || '') + '</p>' + (S.footer.motto ? '<p class="mu">Motto: ' + esc(S.footer.motto) + '</p>' : '') + '</div>' +
      (logos.length ? '<div><h4>Likely logos</h4><div class="thumbs">' + logos.map(function (o) { return '<img src="' + esc(o.src) + '" alt="' + esc(o.label) + '">'; }).join('') + '</div><p class="mu">' + S.lib.length + ' images found in total. You can use any of them in steps 2 and 3.</p></div>' : '') +
      (sw ? '<div><h4>Colours</h4>' + sw + '</div>' : '') +
      '<div><h4>Menu (' + S.menu.items.length + ')</h4><ul class="tags">' + S.menu.items.map(function (m) { return '<li>' + esc(m.label) + (m.children && m.children.length ? ' <span class="mu">(' + m.children.length + ' links)</span>' : '') + '</li>'; }).join('') + '</ul></div>' +
      '<div><h4>Home page sections (' + home.sections.length + ')</h4><ol class="tags">' + home.sections.map(function (s, i) { return '<li>' + esc(s.title || Render.SECTION_TYPES[s.type]) + ' <span class="mu">' + Render.SECTION_TYPES[s.type] + (f && i == 0 ? ', suggested' : '') + '</span></li>'; }).join('') + '</ol></div></div>' +
      (others.length ? '<h4 style="margin-top:20px">Other pages (' + others.length + ')</h4><p class="mu">Import each page so the templates can show your whole site. Pages that block importing can be pasted in.</p>' +
        (waiting ? '<div class="row"><button id="impall">Import all pages</button></div>' : '') +
        '<ul class="pages">' + others.map(function (p) { return '<li><b>' + esc(p.name) + '</b><span class="mu">' + esc((p.url || '').replace(/^https?:\/\/[^/]+/, '') || 'new page') + '</span><span class="st st-' + p.status + '">' + (stl[p.status] || p.status) + '</span>' + (p.url && p.status != 'imported' ? '<button class="sm" data-pimp="' + p.id + '">Import</button><button class="sm" data-ppaste="' + p.id + '">Paste code</button>' : '') + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="row"><button class="pri" data-step="2">Next: brand</button></div>';
  }

  /* ---------- step 2 ---------- */
  var BT = [['logo', 'Logo'], ['hero', 'Hero image'], ['ill', 'Illustrations']], SRC = [['svg', 'Generated'], ['upload', 'Upload'], ['ai', 'AI images'], ['site', 'From your site']];
  function defPrompt(t) { var n = S.biz.name, d = S.biz.desc ? ': ' + S.biz.desc.replace(/\.$/, '') : ''; return { logo: 'A simple, memorable logo for ' + n + d + '. Flat vector style that works at small sizes.', hero: 'A wide, calm hero image for ' + n + d + ', with space for text on the left.', ill: 'A friendly flat spot illustration for ' + n + d + ', limited colour palette.' }[t]; }
  function r2() {
    var b = S.brand, t = S.ui.btab, src = S.ui.bsrc;
    if (document.activeElement !== $('bname')) $('bname').value = S.biz.name;
    if (document.activeElement !== $('bdesc')) $('bdesc').value = S.biz.desc;
    $('btabs').innerHTML = BT.map(function (x) { var n = b.opts[x[0]].filter(function (o) { return b.star[o.id]; }).length; return '<button data-bt="' + x[0] + '" aria-pressed="' + (t == x[0]) + '">' + x[1] + (n ? ' (' + n + ' ★)' : '') + '</button>'; }).join('');
    $('bsrc').innerHTML = SRC.filter(function (x) { return x[0] != 'site' || S.lib.length; }).map(function (x) { return '<button class="sm" data-bs="' + x[0] + '" aria-pressed="' + (src == x[0]) + '">' + x[1] + '</button>'; }).join('');
    var p = '';
    if (src == 'svg') p = '<p class="mu">Simple artwork drawn in your colours. Star the ones you like; starred ones stay when you generate more.</p><div class="row"><button id="gen">Generate more</button></div>';
    if (src == 'upload') p = '<p class="mu">Upload ' + (t == 'ill' ? 'one or more images' : 'an image') + ' (PNG, JPG, SVG or WebP). Large photos are shrunk to save space.</p><div class="row"><label class="filebtn pri">Choose file' + (t == 'ill' ? 's' : '') + '<input type="file" id="upl" accept="image/*"' + (t == 'ill' ? ' multiple' : '') + '></label></div>';
    if (src == 'ai') p = '<label for="aip">Describe what you want</label><textarea id="aip" rows="3">' + esc(S.ui.prompt[t] || defPrompt(t)) + '</textarea><div class="row"><button class="pri" id="aigo">Generate 4 images</button></div><p class="mu" id="aist">' + (S.ai.endpoint ? 'Uses your connected OpenAI image service.' : 'Real AI images switch on when we connect Supabase (it keeps your OpenAI key safe). Until then this makes sample artwork so you can try the flow.') + '</p>';
    if (src == 'site') p = '<p class="mu">Every image found on your website (' + S.lib.length + '). Tap Use to make one your ' + { logo: 'logo', hero: 'hero image', ill: 'main illustration' }[t] + ', or Star to keep it handy.' + (t == 'logo' ? ' Likely logos are listed first.' : '') + '</p><div class="row nowrap"><input id="libq" placeholder="Search images by name" value="' + esc(S.ui.libq) + '" aria-label="Search images"><input id="liburl" placeholder="Or paste an image link (https://…)" aria-label="Image link"><button id="libadd">Add</button></div>';
    $('bpanel').innerHTML = p;
    var list = b.opts[t].filter(function (o) { return src == 'upload' ? o.from == 'upload' : o.from == src; });
    if (src == 'site') {
      var have = {}; b.opts[t].forEach(function (o) { if (o.kind == 'img') have[o.src] = o; });
      var q = S.ui.libq.toLowerCase();
      list = S.lib.filter(function (l) { return !q || (l.label + ' ' + l.src).toLowerCase().indexOf(q) >= 0; }).sort(function (x, y) { return t == 'logo' ? y.logo - x.logo : x.logo - y.logo; }).slice(0, 120).map(function (l) { return have[l.src] || { id: 'lib:' + l.id, kind: 'img', src: l.src, from: 'site', label: l.label }; });
    }
    $('bopts').innerHTML = list.length ? list.map(function (o) {
      var on = b.pick[t] == o.id, bg = t == 'logo' ? b.pal.bg : '#fff';
      return '<div class="opt' + (on ? ' sel' : '') + '"><div class="thumb' + (t != 'logo' ? ' full' : '') + '" style="background:' + bg + '">' + Render.asset(S, o, t, 56) + '</div>' + (o.label ? '<p class="src">' + esc(o.label) + '</p>' : '') +
        '<div class="row"><button data-star="' + o.id + '" aria-pressed="' + !!b.star[o.id] + '">' + (b.star[o.id] ? '★ Starred' : '☆ Star') + '</button><button data-use="' + o.id + '" aria-pressed="' + on + '">' + (on ? 'In use' : 'Use') + '</button>' + (o.from == 'upload' || o.from == 'ai' ? '<button class="ib" data-del="' + o.id + '" aria-label="Remove">✕</button>' : '') + '</div></div>';
    }).join('') : '<p class="mu">Nothing here yet.</p>';
    var pals = (b.palFound ? [b.palFound] : []).concat(Art.PALETTES);
    $('pals').innerHTML = pals.map(function (p, i) { var on = ['bg', 'ink', 'acc', 'soft'].every(function (k) { return p[k] == b.pal[k]; }); return '<button class="pal" data-pal="' + i + '" aria-pressed="' + on + '"><span class="sws"><span style="background:' + p.bg + '"></span><span style="background:' + p.ink + '"></span><span style="background:' + p.acc + '"></span><span style="background:' + p.soft + '"></span></span>' + esc(p.name) + '</button>'; }).join('');
    $('palin').innerHTML = [['bg', 'Background'], ['ink', 'Text'], ['acc', 'Accent'], ['soft', 'Soft panels']].map(function (c) { return '<div class="c"><input type="color" id="pc-' + c[0] + '" data-pc="' + c[0] + '" value="' + b.pal[c[0]] + '"><label for="pc-' + c[0] + '">' + c[1] + '</label></div>'; }).join('');
    $('fonts').innerHTML = Art.FONTS.map(function (f, i) { return '<button data-font="' + i + '" aria-pressed="' + (b.font == i) + '"><b style="font-family:' + f.h.replace(/"/g, "'") + '">Aa Headline</b><span>' + f.name + '</span></button>'; }).join('');
  }
  function libOpt(oid) {
    if (String(oid).indexOf('lib:') != 0) return oid;
    var l = S.lib.filter(function (x) { return 'lib:' + x.id == oid; })[0], t = S.ui.btab; if (!l) return oid;
    var o = { id: nid('o'), kind: 'img', src: l.src, from: 'site', label: l.label }; S.brand.opts[t].push(o); return o.id;
  }
  function shrink(file, max) {
    return new Promise(function (ok, bad) {
      var fr = new FileReader();
      fr.onload = function () {
        if (/svg/.test(file.type)) return ok(fr.result);
        var im = new Image(); im.onload = function () { var s = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL('image/webp', .85)); };
        im.onerror = bad; im.src = fr.result;
      };
      fr.onerror = bad; fr.readAsDataURL(file);
    });
  }
  async function aiGenerate(t, prompt) {
    var b = S.brand; $('aist').textContent = 'Generating…';
    try {
      if (S.ai.endpoint) {
        var r = await fetch(S.ai.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: prompt, type: t, n: 4 }) });
        var j = await r.json(); (j.images || []).forEach(function (src) { b.opts[t].push({ id: nid('o'), kind: 'img', src: src, from: 'ai', label: prompt.slice(0, 60) }); });
      } else {
        Art.genOptions(t, 900 + (++b.seed[t]), 4).forEach(function (o) { o.id = nid('o'); o.from = 'ai'; o.label = 'Sample for: ' + prompt.slice(0, 50); b.opts[t].push(o); });
      }
      save(); r2(); preview();
    } catch (e) { $('aist').textContent = 'The image service didn’t answer: ' + e.message; }
  }

  /* ---------- step 3 ---------- */
  var F_COMMON = [['bg', 'Background', 'sel', [['auto', 'Template default'], ['default', 'Page colour'], ['soft', 'Soft panel'], ['ink', 'Dark'], ['acc', 'Accent colour']]], ['align', 'Alignment', 'sel', [['auto', 'Template default'], ['center', 'Centred']]]];
  var IMG = ['image', 'Image', 'pick'];
  var FIELDS = {
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
  var ITEMF = { videos: [['image', 'Thumbnail', 'pick'], ['title', 'Title'], ['eyebrow', 'Small line (show, date or byline)'], ['duration', 'Length (like 3:45)'], ['link', 'Link']], podcast: [['image', 'Cover image', 'pick'], ['title', 'Episode title'], ['text', 'Description'], ['link', 'Link']],
    tiles: [['image', 'Image', 'pick'], ['eyebrow', 'Small line (category or date)'], ['title', 'Title'], ['text', 'Text'], ['link', 'Link'], ['linkText', 'Link label (optional)']], list: [['title', 'Title'], ['text', 'Detail (optional)'], ['linkText', 'Link label'], ['link', 'Link']], stats: [['title', 'Number'], ['text', 'Label']], gallery: [['image', 'Image', 'pick'], ['title', 'Caption']], testimonial: [['text', 'Quote'], ['title', 'Name']], contact: [['title', 'Label'], ['text', 'Value'], ['link', 'Link (optional)']] };
  function cur() { return SEC().filter(function (s) { return s.id == S.ui.sel; })[0]; }
  function imgVal(s) { return s.image === undefined ? 'auto' : s.image === null ? 'none' : s.image.kind == 'hero' ? 'hero' : s.image.kind == 'ill' ? 'ill:' + (s.image.i || 0) : 'img'; }
  function field(f, obj, path) {
    var k = f[0], lab = f[1], kind = f[2] || 'text', idp = 'f-' + path.replace(/\W/g, '_') + '-' + k, v;
    if (kind == 'pick') {
      var im = obj[k], prevw = im === null ? '<span class="mu">No image</span>' : im === undefined ? '<span class="mu">Template default</span>' : Render.imageRef(S, im, 0);
      return '<label>' + lab + '</label><div class="pickf"><span class="pv-th">' + prevw + '</span><button class="sm" data-pick="' + path + '" data-pk="' + k + '">Choose image</button>' + (im ? '<button class="sm" data-unpick="' + path + '" data-pk="' + k + '">Remove</button>' : '') + '</div>';
    }
    if (kind == 'img') {
      v = imgVal(obj); var ops = [['auto', 'Template default'], ['none', 'No image'], ['hero', 'Hero image'], ['ill:0', 'Illustration 1'], ['ill:1', 'Illustration 2'], ['ill:2', 'Illustration 3']]; if (v == 'img') ops.push(['img', 'Image from your site']);
      return '<label for="' + idp + '">' + lab + '</label><select id="' + idp + '" data-f="' + path + '" data-k="image" data-kind="img">' + ops.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] == v ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>';
    }
    v = obj[k] == null ? '' : obj[k];
    if (kind == 'chk') return '<label class="ck"><input type="checkbox" data-f="' + path + '" data-k="' + k + '" data-kind="chk"' + (v ? ' checked' : '') + '> ' + lab + '</label>';
    if (kind == 'sel') { if (v === '') v = f[3][0][0]; return '<label for="' + idp + '">' + lab + '</label><select id="' + idp + '" data-f="' + path + '" data-k="' + k + '" data-kind="sel">' + f[3].map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) == String(v) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; }
    if (kind == 'area') return '<label for="' + idp + '">' + lab + '</label><textarea id="' + idp + '" rows="3" data-f="' + path + '" data-k="' + k + '">' + esc(v) + '</textarea>';
    return '<label for="' + idp + '">' + lab + '</label><input id="' + idp + '" data-f="' + path + '" data-k="' + k + '" value="' + esc(v) + '">';
  }
  function r3list() {
    $('slist').innerHTML = SEC().map(function (s, i) {
      return '<li class="' + (S.ui.sel == s.id ? 'on' : '') + '"><button class="nm" data-sel="' + s.id + '">' + esc(s.title || s.headline || '(untitled)') + '<small>' + Render.SECTION_TYPES[s.type] + '</small></button>' +
        '<button class="ib" data-mv="' + i + ':-1" aria-label="Move up"' + (i == 0 ? ' disabled' : '') + '>↑</button><button class="ib" data-mv="' + i + ':1" aria-label="Move down"' + (i == SEC().length - 1 ? ' disabled' : '') + '>↓</button><button class="ib" data-rm="' + i + '" aria-label="Delete section">✕</button></li>';
    }).join('') + '<li class="' + (S.ui.sel == 'footer' ? 'on' : '') + '"><button class="nm" data-sel="footer">Footer<small>Always at the bottom</small></button></li>';
  }
  function r3pages() {
    var p = curPage();
    $('pbar').innerHTML = '<label for="psel">Page</label><div class="row nowrap"><select id="psel">' + S.pages.map(function (x) { return '<option value="' + x.id + '"' + (x.id == p.id ? ' selected' : '') + '>' + esc(x.name) + (x.status == 'waiting' ? ' (not imported)' : '') + '</option>'; }).join('') + '</select><button class="sm" id="paddpg">Add page</button></div>' +
      '<div class="row"><label class="ck" style="margin:0">Name <input id="pname" value="' + esc(p.name) + '" style="width:auto;min-height:36px"></label>' + (S.pages.length > 1 && S.pages[0].id != p.id ? '<button class="sm" id="pdel">Delete this page</button>' : '') + '</div>';
  }
  function r3() {
    r3pages();
    $('addtype').innerHTML = Object.keys(Render.SECTION_TYPES).map(function (k) { return '<option value="' + k + '">' + Render.SECTION_TYPES[k] + '</option>'; }).join('');
    r3list(); r3edit();
  }
  function r3edit() {
    if (S.ui.sel != 'footer' && !cur() && SEC()[0]) S.ui.sel = SEC()[0].id;
    var e = $('sedit');
    if (S.ui.sel == 'footer') { e.innerHTML = '<h3>Footer</h3>' + field(['motto', 'Motto or tagline'], S.footer, 'footer') + field(['text', 'Bottom line (for example © name)'], S.footer, 'footer'); return; }
    var s = cur(); if (!s) { e.innerHTML = '<p class="mu">Add a section to start.</p>'; return; }
    var html = '<h3>Edit: ' + esc(Render.SECTION_TYPES[s.type]) + '</h3>' + (FIELDS[s.type] || []).concat(F_COMMON).map(function (f) { return field(f, s, 'sec'); }).join('');
    if (ITEMF[s.type]) {
      html += '<h4>Items (' + (s.items || []).length + ')</h4><div class="items">' + (s.items || []).map(function (it, i) {
        return '<div class="item"><div class="ih"><b>' + (i + 1) + '. ' + esc(it.title || it.text || 'Item') + '</b><button class="ib" data-imv="' + i + ':-1" aria-label="Move item up"' + (i == 0 ? ' disabled' : '') + '>↑</button><button class="ib" data-imv="' + i + ':1" aria-label="Move item down"' + (i == s.items.length - 1 ? ' disabled' : '') + '>↓</button><button class="ib" data-irm="' + i + '" aria-label="Delete item">✕</button></div>' +
          ITEMF[s.type].map(function (f) { return field(f, it, 'item:' + i); }).join('') + '</div>';
      }).join('') + '</div><div class="row"><button id="additem">Add item</button></div>';
    }
    e.innerHTML = html;
  }
  function target(path) { var s = cur(); if (path == 'footer') return S.footer; if (path == 'sec') return s; return s && s.items[+path.split(':')[1]]; }
  /* image picker */
  var PICK = null;
  function openPicker(path, k) {
    PICK = { path: path, k: k }; var b = S.brand, P = S;
    var groups = '<h4>Brand images</h4><div class="pk-grid"><button class="pk" data-pv="none"><span class="mu">No image</span></button><button class="pk" data-pv="hero">' + Render.imageRef(P, { kind: 'hero' }) + '<small>Hero image</small></button>' +
      [0, 1, 2].map(function (i) { return '<button class="pk" data-pv="ill:' + i + '">' + Render.imageRef(P, { kind: 'ill', i: i }) + '<small>Illustration ' + (i + 1) + '</small></button>'; }).join('') + '</div>';
    var ups = []; ['logo', 'hero', 'ill'].forEach(function (t) { b.opts[t].forEach(function (o) { if (o.from == 'upload' || o.from == 'ai' && o.kind == 'img') ups.push(o); }); });
    groups += '<h4>Your uploads</h4><div class="row"><label class="filebtn">Upload an image<input type="file" id="pkup" accept="image/*"></label></div>' + (ups.length ? '<div class="pk-grid">' + ups.map(function (o) { return '<button class="pk" data-pv="src:' + esc(o.src) + '"><img src="' + esc(o.src) + '" alt=""><small>' + esc(o.label || '') + '</small></button>'; }).join('') + '</div>' : '');
    if (S.lib.length) groups += '<h4>From your website (' + S.lib.length + ')</h4><input id="pkq" placeholder="Search by name" aria-label="Search images"><div class="pk-grid" id="pklib">' + libHtml('') + '</div>';
    $('pkbody').innerHTML = groups; $('picker').showModal();
  }
  function libHtml(q) { q = (q || '').toLowerCase(); return S.lib.filter(function (l) { return !q || (l.label + ' ' + l.src).toLowerCase().indexOf(q) >= 0; }).slice(0, 160).map(function (l) { return '<button class="pk" data-pv="src:' + esc(l.src) + '"><img loading="lazy" src="' + esc(l.src) + '" alt=""><small>' + esc(l.label) + '</small></button>'; }).join(''); }
  function choosePick(v) {
    var o = target(PICK.path); if (!o) return;
    if (v == 'none') o[PICK.k] = null; else if (v == 'hero') o[PICK.k] = { kind: 'hero' }; else if (v.indexOf('ill:') == 0) o[PICK.k] = { kind: 'ill', i: +v.slice(4) }; else o[PICK.k] = { kind: 'img', src: v.slice(4) };
    $('picker').close(); save(); r3edit(); preview();
  }
  function setField(el) {
    var path = el.dataset.f, k = el.dataset.k, kind = el.dataset.kind, obj, s = cur();
    if (path == 'footer') obj = S.footer; else if (path == 'sec') obj = s; else obj = s.items[+path.split(':')[1]];
    if (!obj) return;
    if (kind == 'chk') obj[k] = el.checked;
    else if (kind == 'img') { var v = el.value; if (v == 'auto') delete obj.image; else if (v == 'none') obj.image = null; else if (v == 'hero') obj.image = { kind: 'hero' }; else if (v.indexOf('ill:') == 0) obj.image = { kind: 'ill', i: +v.slice(4) }; }
    else if (k == 'cols') obj[k] = +el.value;
    else obj[k] = el.value;
    save();
  }

  /* ---------- step 4 ---------- */
  function r4() {
    var vp = S.ui.mvp, c = S.menu.vp[vp];
    $('mvps').innerHTML = Object.keys(VPW).map(function (v) { return '<button data-mvp="' + v + '" aria-pressed="' + (vp == v) + '">' + VPN[v] + ' <small>(' + Render.MENU_TYPES[S.menu.vp[v].type].name + ')</small></button>'; }).join('');
    $('mtypes').innerHTML = Object.keys(Render.MENU_TYPES).filter(function (k) { return Render.MENU_TYPES[k].vps.indexOf(vp) >= 0; }).map(function (k) { var m = Render.MENU_TYPES[k]; return '<button data-mtype="' + k + '" aria-pressed="' + (c.type == k) + '"><b>' + m.name + '</b><small>' + m.desc + '</small></button>'; }).join('');
    $('mopts').innerHTML = (c.type == 'split' ? '' : '<label for="mlogo">Logo position</label><select id="mlogo" data-mo="logo"><option value="left"' + (c.logo == 'left' ? ' selected' : '') + '>Left</option><option value="center"' + (c.logo == 'center' ? ' selected' : '') + '>Centre</option></select>') +
      '<div class="row"><label class="ck"><input type="checkbox" data-mo="sticky"' + (c.sticky ? ' checked' : '') + '> Keep header visible when scrolling</label><label class="ck"><input type="checkbox" data-mo="search"' + (c.search ? ' checked' : '') + '> Show search</label><label class="ck"><input type="checkbox" data-mo="cta"' + (c.cta ? ' checked' : '') + '> Show button</label></div>' +
      '<div class="row"><button class="sm" id="mcopy">Use this style on the other screen sizes where it fits</button></div>';
    var it = S.menu.items;
    $('mtree').innerHTML = it.map(function (m, i) {
      var g = !!m.children;
      return '<div class="mi"><div class="mr"><input aria-label="Label" data-mi="' + i + '" data-mk="label" value="' + esc(m.label) + '">' + (g ? '' : '<input aria-label="Link" data-mi="' + i + '" data-mk="href" value="' + esc(m.href) + '">') +
        '<button class="ib" data-mm="' + i + ':-1" aria-label="Move up"' + (i == 0 ? ' disabled' : '') + '>↑</button><button class="ib" data-mm="' + i + ':1" aria-label="Move down"' + (i == it.length - 1 ? ' disabled' : '') + '>↓</button><button class="ib" data-mrm="' + i + '" aria-label="Delete">✕</button></div>' +
        (g ? '<div class="kids">' + m.children.map(function (k, j) { return '<div class="mr"><input aria-label="Sub-link label" data-mi="' + i + '.' + j + '" data-mk="label" value="' + esc(k.label) + '"><input aria-label="Sub-link" data-mi="' + i + '.' + j + '" data-mk="href" value="' + esc(k.href) + '"><button class="ib" data-mm="' + i + '.' + j + ':-1" aria-label="Move up"' + (j == 0 ? ' disabled' : '') + '>↑</button><button class="ib" data-mm="' + i + '.' + j + ':1" aria-label="Move down"' + (j == m.children.length - 1 ? ' disabled' : '') + '>↓</button><button class="ib" data-mout="' + i + '.' + j + '" aria-label="Move out of group">⇤</button><button class="ib" data-mrm="' + i + '.' + j + '" aria-label="Delete">✕</button></div>'; }).join('') + '<div class="row"><button class="sm" data-madd="' + i + '">Add sub-link</button></div></div>' :
          (i > 0 ? '<div class="row"><button class="sm" data-min="' + i + '">Move into group above</button></div>' : '')) + '</div>';
    }).join('');
    if (document.activeElement !== $('ctal')) $('ctal').value = S.menu.cta.label; if (document.activeElement !== $('ctah')) $('ctah').value = S.menu.cta.href;
    $('mopen').checked = S.ui.open;
  }
  function mget(path) { var p = String(path).split('.'), a = S.menu.items; return p.length == 1 ? { list: a, i: +p[0] } : { list: a[+p[0]].children, i: +p[1] }; }

  /* ---------- step 5 ---------- */
  var CUR = [];
  function r5() {
    var all = Render.TEMPLATES.map(function (t) { return { t: t, c: Render.compat(t, S) }; }), ok = all.filter(function (x) { return x.c.ok; });
    CUR = all.filter(function (x) { return (S.tpl.all || x.c.ok) && (!S.tpl.favOnly || S.tpl.fav[x.t.id]); });
    $('tcount').textContent = ok.length + ' of ' + all.length + ' templates fit your site';
    if (!S.pages.some(function (p) { return p.id == S.ui.tpage; })) S.ui.tpage = S.pages[0] && S.pages[0].id;
    $('tpage').innerHTML = S.pages.map(function (p) { return '<option value="' + p.id + '"' + (p.id == S.ui.tpage ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('');
    $('tall').checked = S.tpl.all; $('tfav').checked = S.tpl.favOnly;
    $('tgrid').innerHTML = CUR.length ? CUR.map(function (x) {
      var t = x.t, on = S.tpl.pick == t.id;
      return '<article class="tc' + (on ? ' sel' : '') + (x.c.ok ? '' : ' no') + '"><div class="tw" data-tp="' + t.id + '" role="button" tabindex="0" aria-label="Preview ' + esc(t.name) + '"><img alt="Screenshot of ' + esc(t.name) + '" data-th="' + t.id + '"></div><div class="tb"><h4>' + esc(t.name) + (on ? ' <span class="chip on">Picked</span>' : '') + '</h4><p class="mu">' + esc(t.fam.desc) + '</p>' +
        (x.c.ok ? '' : '<p class="why">Doesn’t fit: ' + esc(x.c.why.join('; ')) + '.</p>') + '<div class="row"><button data-tp="' + t.id + '">Preview</button><button data-tfav="' + t.id + '" aria-pressed="' + !!S.tpl.fav[t.id] + '">' + (S.tpl.fav[t.id] ? '♥ Favourite' : '♡ Favourite') + '</button></div></div></article>';
    }).join('') : '<p class="mu">No templates to show. Try turning off “Favourites only”, or tick “Show templates that don’t fit”.</p>';
    thumbs();
    if (!S.tpl.view) S.tpl.view = S.tpl.pick || (ok[0] || all[0]).t.id;
    r5prev();
    if (document.activeElement !== $('rname')) $('rname').value = S.req.name; if (document.activeElement !== $('remail')) $('remail').value = S.req.email;
    $('rtpl').textContent = S.tpl.pick ? 'Template: ' + Render.tpl(S.tpl.pick).name + '.' : 'Pick a template above (Use this template) before requesting development.';
    $('rhead').hidden = !S.notes.length;
    $('notes').innerHTML = S.notes.map(function (n, i) { return '<li><div><b>' + esc(n.status || 'Requested') + '</b> · ' + new Date(n.at).toLocaleString() + ' · ' + esc(Render.tpl(n.tpl).name) + (n.name ? ' · ' + esc(n.name) : '') + (n.text ? '\n' + esc(n.text) : '') + '</div><button class="ib" data-nrm="' + i + '" aria-label="Cancel request">✕</button></li>'; }).join('');
  }
  function r5prev() {
    var t = Render.tpl(S.tpl.view), c = Render.compat(t, S), on = S.tpl.pick == t.id;
    $('tpn').textContent = t.name; $('tpm').textContent = on ? 'This is your picked template.' : t.fam.desc + (c.ok ? '' : ' Doesn’t fit: ' + c.why.join('; ') + '.');
    $('tuse').textContent = on ? 'Picked' : 'Use this template'; $('tuse').setAttribute('aria-pressed', on); $('tuse').className = on ? '' : 'pri';
    frame('pv5', S.ui.tvp, { tpl: t.id, pageId: S.ui.tpage });
  }
  var thTok;
  function thumbs() {
    var my = thTok = {}, list = Array.prototype.slice.call(document.querySelectorAll('img[data-th]'));
    (function next() {
      if (thTok !== my || !list.length) return;
      var im = list.shift();
      Shot.take(Render.page(S, im.dataset.th, { pageId: S.pages[0] && S.pages[0].id }), 1280, { maxH: 960, scale: .5, type: 'image/jpeg' }).then(function (r) { if (thTok === my) im.src = r.url; }).catch(function () { }).then(next);
    })();
  }
  /* ---------- shell ---------- */
  function preview() {
    if (S.step == 2) frame('pv2', S.ui.vp);
    if (S.step == 3) frame('pv3', S.ui.vp, { sel: S.ui.sel });
    if (S.step == 4) frame('pv4', S.ui.mvp, { openMenu: S.ui.open ? S.ui.mvp : null, pageId: S.pages[0] && S.pages[0].id });
  }
  function renderAll() {
    ensureArt();
    if (!S.pages.length) S.pages.push({ id: nid('p'), name: 'Home', url: '', status: 'new', sections: [] });
    $('steps').innerHTML = STEPS.map(function (n, i) { return '<button data-step="' + (i + 1) + '"' + (S.step == i + 1 ? ' aria-current="step"' : '') + '>' + (i + 1) + '. ' + n + '</button>'; }).join('');
    for (var i = 1; i <= 5; i++) $('s' + i).hidden = S.step != i;
    vpButtons();
    [r1, r2, r3, r4, r5][S.step - 1]();
    preview();
    var p = S.step > 1 ? '<button data-step="' + (S.step - 1) + '">← Back: ' + STEPS[S.step - 2] + '</button>' : '<span></span>';
    $('pager').innerHTML = p + (S.step < 5 ? '<button class="pri" data-step="' + (S.step + 1) + '">Next: ' + STEPS[S.step] + ' →</button>' : '');
    save();
  }
  function go(n) { S.step = n; try { history.replaceState(null, '', '#step-' + n); } catch (e) { } renderAll(); window.scrollTo(0, 0); }
  var pt; function softPreview() { clearTimeout(pt); pt = setTimeout(function () { preview(); if (S.step == 3) r3list(); }, 120); }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var im = e.target.closest('.shot img');
    if (im && S.step == 3) { var sts = im.closest('.stage'), rr = sts._shots && sts._shots[+im.dataset.i]; if (rr) { var y = e.offsetY / im.clientHeight * rr.h, hit = rr.secs.filter(function (x) { return y >= x.y && y < x.y + x.h; })[0]; if (hit) { S.ui.sel = hit.id; r3list(); r3edit(); preview(); save(); $('sedit').scrollIntoView({ behavior: 'smooth', block: 'start' }); } } return; }
    var t = e.target.closest('button, [data-tp], [data-sec]'); if (!t) return;
    var d = t.dataset, b = S.brand, s;
    if (d.step) return go(+d.step);
    if (d.vp) { var k = t.parentElement.dataset.vpk; S.ui[k] = d.vp; vpButtons(); if (k == 'tvp') r5prev(); else preview(); return save(); }
    if (d.has) { S.source.has = d.has == '1'; return renderAll(); }
    if (t.id == 'go') { var u = $('url').value.trim(); if (!/^https?:\/\//.test(u)) u = 'https://' + u; S.source.url = u; S.source.log = []; logLine('Reading ' + u + ' …'); Importer.fetchHtml(u).then(function (r) { logLine('Got the page.', 'ok'); return runImport(r.html, r.url); }).catch(function (er) { logLine('That site didn’t let us read it directly (' + er.message + '). Use “Paste the page’s code instead” below.', 'bad'); $('pastebox').open = true; }); return; }
    if (t.id == 'readpaste') {
      var h = $('paste').value; if (h.length < 50) return logLine('Paste the whole page code first.', 'bad');
      var tp = S.pages.filter(function (p) { return p.id == S.ui.pasteFor; })[0];
      if (tp) { logLine('Reading the pasted code for ' + tp.name + '…'); S.ui.pasteFor = null; $('paste').value = ''; return importPage(tp, h).then(function () { logLine(tp.status == 'imported' ? tp.name + ' imported.' : 'Couldn’t read that code.', tp.status == 'imported' ? 'ok' : 'bad'); renderAll(); }); }
      S.source.log = []; logLine('Reading the pasted code…'); return runImport(h, $('url').value || 'https://example.com/');
    }
    if (d.pimp) { var pg = S.pages.filter(function (p) { return p.id == d.pimp; })[0]; pg.status = 'importing'; r1(); return importPage(pg).then(renderAll); }
    if (t.id == 'impall') { var todo = S.pages.filter(function (p) { return p.url && p.status != 'imported'; }); todo.forEach(function (p) { p.status = 'importing'; }); r1(); (async function () { for (var i = 0; i < todo.length; i++) { await importPage(todo[i]); r1(); } var bl = todo.filter(function (p) { return p.status == 'blocked'; }).length; logLine(bl ? bl + ' page' + (bl > 1 ? 's' : '') + ' blocked importing. Use Paste code for those.' : 'All pages imported.', bl ? 'bad' : 'ok'); renderAll(); })(); return; }
    if (d.ppaste) { var pp = S.pages.filter(function (p) { return p.id == d.ppaste; })[0]; S.ui.pasteFor = pp.id; $('pastebox').open = true; logLine('Paste the code for “' + pp.name + '” (' + pp.url + ') below, then click Read code.'); $('paste').focus(); $('pastebox').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (t.id == 'paddpg') { var np = placeholderPage('New page'); S.pages.push(np); S.ui.page = np.id; S.ui.sel = np.sections[0].id; return renderAll(); }
    if (t.id == 'pdel') { var cp = curPage(); if (confirm('Delete the page “' + cp.name + '”?')) { S.pages = S.pages.filter(function (p) { return p !== cp; }); S.ui.page = S.pages[0].id; S.ui.sel = null; } return renderAll(); }
    if (d.pick) return openPicker(d.pick, d.pk);
    if (d.unpick) { var uo = target(d.unpick); if (uo) { uo[d.pk] = null; save(); r3edit(); preview(); } return; }
    if (d.pv && PICK) return choosePick(d.pv);
    if (t.id == 'pkclose') return $('picker').close();
    if (t.id == 'mk') { S.biz.name = $('fname').value.trim() || 'Your business'; S.biz.desc = $('fdesc').value.trim(); S.source.found = null; S.brand.opts = { logo: [], hero: [], ill: [] }; S.brand.pick = {}; ensureArt(); starter($('ftype').value); S.ui.sel = SEC()[0].id; return renderAll(); }
    if (d.bt) { S.ui.btab = d.bt; if (S.ui.bsrc == 'site' && !b.opts[d.bt].some(function (o) { return o.from == 'site'; })) S.ui.bsrc = 'svg'; return renderAll(); }
    if (d.bs) { S.ui.bsrc = d.bs; return renderAll(); }
    if (t.id == 'gen') { genSvg(S.ui.btab); return renderAll(); }
    if (t.id == 'aigo') { S.ui.prompt[S.ui.btab] = $('aip').value; return aiGenerate(S.ui.btab, $('aip').value); }
    if (d.star) { b.star[libOpt(d.star)] = !b.star[libOpt(d.star)]; return renderAll(); }
    if (d.use) { b.pick[S.ui.btab] = libOpt(d.use); return renderAll(); }
    if (t.id == 'libadd') { var lu = $('liburl').value.trim(); if (!/^https?:\/\//.test(lu)) { $('liburl').focus(); return; } addLib([{ id: nid('L'), src: lu, label: 'Added by link', logo: S.ui.btab == 'logo' }]); S.ui.libq = ''; return renderAll(); }
    if (d.del) { var tt = S.ui.btab; b.opts[tt] = b.opts[tt].filter(function (o) { return o.id != d.del; }); if (b.pick[tt] == d.del) b.pick[tt] = b.opts[tt][0] && b.opts[tt][0].id; return renderAll(); }
    if (d.pal) { var pl = (b.palFound ? [b.palFound] : []).concat(Art.PALETTES)[+d.pal]; b.pal = Object.assign({}, pl); return renderAll(); }
    if (d.font) { b.font = +d.font; return renderAll(); }
    if (d.sel) { S.ui.sel = d.sel; r3list(); r3edit(); preview(); return save(); }
    if (d.sec && S.step == 3) { S.ui.sel = d.sec; r3list(); r3edit(); preview(); $('sedit').scrollIntoView({ behavior: 'smooth', block: 'start' }); return save(); }
    if (d.mv) { var m = d.mv.split(':'), i = +m[0], j = i + +m[1]; s = SEC(); s.splice(j, 0, s.splice(i, 1)[0]); return renderAll(); }
    if (d.rm) { var x = SEC()[+d.rm]; if (confirm('Delete the section “' + (x.title || Render.SECTION_TYPES[x.type]) + '”?')) { SEC().splice(+d.rm, 1); if (S.ui.sel == x.id) S.ui.sel = SEC()[0] && SEC()[0].id; } return renderAll(); }
    if (t.id == 'addsec') { var ns = defaultSection($('addtype').value), at = SEC().indexOf(cur()); SEC().splice(at < 0 ? SEC().length : at + 1, 0, ns); S.ui.sel = ns.id; return renderAll(); }
    if (t.id == 'additem') { s = cur(); s.items = s.items || []; s.items.push({ id: nid('i'), title: 'New item', text: '', link: '', linkText: '' }); return renderAll(); }
    if (d.imv) { s = cur(); var q = d.imv.split(':'), a1 = +q[0], b1 = a1 + +q[1]; s.items.splice(b1, 0, s.items.splice(a1, 1)[0]); return renderAll(); }
    if (d.irm) { cur().items.splice(+d.irm, 1); return renderAll(); }
    if (d.mvp) { S.ui.mvp = d.mvp; return renderAll(); }
    if (d.mtype) { S.menu.vp[S.ui.mvp].type = d.mtype; return renderAll(); }
    if (t.id == 'mcopy') { var c0 = S.menu.vp[S.ui.mvp]; Object.keys(VPW).forEach(function (v) { if (v != S.ui.mvp && Render.MENU_TYPES[c0.type].vps.indexOf(v) >= 0) S.menu.vp[v] = Object.assign({}, c0); }); return renderAll(); }
    if (d.mm) { var mp = d.mm.split(':'), g = mget(mp[0]), n2 = g.i + +mp[1]; g.list.splice(n2, 0, g.list.splice(g.i, 1)[0]); return renderAll(); }
    if (d.mrm) { var g2 = mget(d.mrm); g2.list.splice(g2.i, 1); return renderAll(); }
    if (d.mout) { var g3 = mget(d.mout), it = g3.list.splice(g3.i, 1)[0], gi = +d.mout.split('.')[0]; S.menu.items.splice(gi + 1, 0, it); return renderAll(); }
    if (d.madd) { S.menu.items[+d.madd].children.push({ id: nid('m'), label: 'New link', href: '#' }); return renderAll(); }
    if (d.min) { var ii = +d.min, prev = S.menu.items[ii - 1], mv = S.menu.items[ii]; if (!prev.children) { prev = { id: nid('g'), label: prev.label, href: '', children: [prev] }; S.menu.items[ii - 1] = prev; } prev.children.push({ id: mv.id, label: mv.label, href: mv.href }); (mv.children || []).forEach(function (c) { prev.children.push(c); }); S.menu.items.splice(ii, 1); return renderAll(); }
    if (t.id == 'addlink') { S.menu.items.push({ id: nid('m'), label: 'New link', href: '#' }); return renderAll(); }
    if (t.id == 'addgroup') { S.menu.items.push({ id: nid('g'), label: 'New group', href: '', children: [{ id: nid('m'), label: 'New link', href: '#' }] }); return renderAll(); }
    if (d.tp) { S.tpl.view = d.tp; r5prev(); save(); $('tpc').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (d.tfav) { S.tpl.fav[d.tfav] = !S.tpl.fav[d.tfav]; return renderAll(); }
    if (t.id == 'tuse') { S.tpl.pick = S.tpl.view; return renderAll(); }
    if (t.id == 'tprev' || t.id == 'tnext') { var L = CUR.length ? CUR : Render.TEMPLATES.map(function (t2) { return { t: t2 }; }), ix = L.map(function (x2) { return x2.t.id; }).indexOf(S.tpl.view); ix = (ix + (t.id == 'tnext' ? 1 : -1) + L.length) % L.length; S.tpl.view = L[ix].t.id; r5prev(); return save(); }
    if (t.id == 'savenote') {
      var er = $('rerr'); er.className = 'errmsg'; var nm = $('rname').value.trim(), em = $('remail').value.trim(), nt = $('note').value.trim();
      er.hidden = true;
      if (!S.tpl.pick) { er.hidden = false; er.textContent = 'Pick a template first: preview one above and click “Use this template”.'; return; }
      if (!nm) { er.hidden = false; er.textContent = 'Enter your name.'; $('rname').focus(); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { er.hidden = false; er.textContent = 'Enter a valid email address so we can reach you.'; $('remail').focus(); return; }
      S.req = { name: nm, email: em };
      S.notes.unshift({ id: nid('n'), at: Date.now(), name: nm, email: em, text: nt, tpl: S.tpl.pick, status: 'Requested', summary: { sections: SEC().map(function (x) { return x.title || x.type; }), menu: S.menu.items.map(function (m) { return m.label; }) } });
      $('note').value = ''; renderAll(); er.hidden = false; er.className = 'okmsg'; er.textContent = 'Request saved. We’ll be in touch at ' + em + '.'; return;
    }
    if (d.nrm) { S.notes.splice(+d.nrm, 1); return renderAll(); }
    if (t.id == 'reset') { if (confirm('Start over? This clears everything saved in this browser.')) { try { localStorage.removeItem(KEY); } catch (er) { } location.href = location.pathname; } }
  });
  document.addEventListener('keydown', function (e) { var w = e.target.closest && e.target.closest('.tw'); if (w && (e.key == 'Enter' || e.key == ' ')) { e.preventDefault(); w.click(); } });
  document.addEventListener('input', function (e) {
    var el = e.target, d = el.dataset;
    if (el.id == 'url') { S.source.url = el.value; return save(); }
    if (d.biz) { S.biz[d.biz] = el.value; save(); return softPreview(); }
    if (d.pc) { S.brand.pal[d.pc] = el.value; save(); return softPreview(); }
    if (d.f && el.tagName != 'SELECT' && d.kind != 'chk') { setField(el); return softPreview(); }
    if (d.mi) { var g = mget(d.mi); g.list[g.i][d.mk] = el.value; save(); return softPreview(); }
    if (d.cta) { S.menu.cta[d.cta] = el.value; save(); return softPreview(); }
    if (el.id == 'aip') { S.ui.prompt[S.ui.btab] = el.value; save(); }
    if (el.id == 'pname') { curPage().name = el.value; save(); var o = $('psel').selectedOptions[0]; if (o) o.textContent = el.value; }
    if (el.id == 'pkq') { $('pklib').innerHTML = libHtml(el.value); }
    if (el.id == 'libq') { S.ui.libq = el.value; clearTimeout(window.__lq); window.__lq = setTimeout(function () { r2(); var q = $('libq'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }, 250); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target, d = el.dataset;
    if (d.pc) return renderAll();
    if (d.f && (el.tagName == 'SELECT' || d.kind == 'chk')) { setField(el); r3list(); return preview(); }
    if (d.mo) { var c = S.menu.vp[S.ui.mvp]; c[d.mo] = el.type == 'checkbox' ? el.checked : el.value; return renderAll(); }
    if (el.id == 'mopen') { S.ui.open = el.checked; save(); return preview(); }
    if (el.id == 'psel') { S.ui.page = el.value; S.ui.sel = curPage().sections[0] && curPage().sections[0].id; return renderAll(); }
    if (el.id == 'tpage') { S.ui.tpage = el.value; save(); return r5prev(); }
    if (el.id == 'pkup') { var f0 = el.files[0]; if (!f0) return; shrink(f0, 1600).then(function (src) { S.brand.opts.ill.push({ id: nid('o'), kind: 'img', src: src, from: 'upload', label: f0.name }); choosePick('src:' + src); }); return; }
    if (el.id == 'tall') { S.tpl.all = el.checked; return renderAll(); }
    if (el.id == 'tfav') { S.tpl.favOnly = el.checked; return renderAll(); }
    if (el.id == 'upl') {
      var t = S.ui.btab, files = Array.prototype.slice.call(el.files);
      Promise.all(files.map(function (f) { return shrink(f, t == 'hero' ? 1600 : 700).then(function (src) { return { id: nid('o'), kind: 'img', src: src, from: 'upload', label: f.name }; }); })).then(function (list) {
        S.brand.opts[t] = S.brand.opts[t].concat(list); if (list[0]) S.brand.pick[t] = list[0].id; renderAll();
      }).catch(function () { alert('That file couldn’t be read as an image.'); });
    }
    if (el.id == 'rname' || el.id == 'remail') { S.req[el.id == 'rname' ? 'name' : 'email'] = el.value; save(); }
  });
  

  /* ---------- start ---------- */
  S = load() || blank();
  var hm = /#step-(\d)/.exec(location.hash); if (hm) S.step = Math.min(5, Math.max(1, +hm[1]));
  renderAll();
  window.BAKE = { state: function () { return S; }, useImport: function (r) { applyImport(r); renderAll(); } };
})();
