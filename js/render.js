/* BAKE Studio: turn a project into a web page (used for previews; data-sec / data-ii / data-fk attributes let Shot map where things land) */
var Render = (function () {
  var esc = Art.esc;
  var SECTION_TYPES = {
    hero: 'Hero banner', tiles: 'Card grid', feature: 'Featured story', list: 'Link list', text: 'Text block',
    stats: 'Numbers', gallery: 'Gallery', testimonial: 'Quotes', cta: 'Call to action', contact: 'Contact details',
    videos: 'Video gallery', podcast: 'Podcasts / audio', pagehead: 'Page header'
  };
  var MENU_TYPES = {
    bar: { name: 'Links bar', desc: 'Links in a row. Groups open as dropdowns.', vps: ['desktop', 'tablet'] },
    mega: { name: 'Mega menu', desc: 'Main links plus one big panel showing every group.', vps: ['desktop'] },
    split: { name: 'Split with centred logo', desc: 'Logo in the middle, links on both sides.', vps: ['desktop', 'tablet'] },
    hamburger: { name: 'Menu button', desc: 'A single Menu button that opens the full list.', vps: ['desktop', 'tablet', 'phone'] },
    bottom: { name: 'Bottom tab bar', desc: 'App-style tabs at the bottom of the screen.', vps: ['tablet', 'phone'] }
  };

  var FAMILIES = [
    { k: 'news', videos: 'lead', name: 'Newsroom', desc: 'Newspaper rules, serif headlines and a big lead story.', hero: 'editorial', tiles: 'rule', feature: 'wide', menus: ['bar', 'mega', 'split', 'hamburger'] },
    { k: 'app', videos: 'grid', name: 'App grid', desc: 'Rounded tiles you can tap, like a phone home screen.', hero: 'split', tiles: 'app', feature: 'card', menus: ['bar', 'mega', 'split', 'hamburger'] },
    { k: 'mag', videos: 'row', name: 'Magazine', desc: 'Full-width photo opener and a mixed-size card mosaic.', hero: 'overlay', tiles: 'bento', feature: 'split', menus: ['bar', 'mega', 'hamburger'] },
    { k: 'min', videos: 'grid', name: 'Minimal', desc: 'Lots of white space, centred text and simple lists.', hero: 'center', tiles: 'list', feature: 'split', menus: ['bar', 'split', 'hamburger'], no: ['gallery'] },
    { k: 'bold', videos: 'row', name: 'Bold blocks', desc: 'Strong colour bands and icon cards.', hero: 'band', tiles: 'icons', feature: 'wide', menus: ['bar', 'mega', 'hamburger'], bands: true },
    { k: 'portal', videos: 'lead', name: 'Community portal', desc: 'A dark welcome panel with search-style shortcuts.', hero: 'portal', tiles: 'icons', feature: 'card', menus: ['mega', 'bar', 'hamburger'] },
    { k: 'story', videos: 'lead', name: 'Storyteller', desc: 'Photo-led, long-form pages for telling a story.', hero: 'overlay', tiles: 'cards', feature: 'split', menus: ['split', 'bar', 'hamburger'], maxTiles: 6 },
    { k: 'board', videos: 'grid', name: 'Notice board', desc: 'Compact, two-column lists for lots of links.', hero: 'none', tiles: 'cols', feature: 'card', menus: ['mega', 'bar'], need: ['list', 'tiles'] }
  ];
  var VARIANTS = [
    { k: 'a', name: 'Classic', r: 0, band: 'none', dens: 'm' },
    { k: 'b', name: 'Soft', r: 14, band: 'soft', dens: 'l' },
    { k: 'c', name: 'Crisp', r: 4, band: 'ink', dens: 's' }
  ];
  var TEMPLATES = [];
  FAMILIES.forEach(function (f) { VARIANTS.forEach(function (v) { TEMPLATES.push({ id: f.k + '-' + v.k, name: f.name + ' ' + v.name, fam: f, v: v }); }); });
  function tpl(id) { return TEMPLATES.filter(function (t) { return t.id == id; })[0] || TEMPLATES[0]; }

  function compat(t, P) {
    var why = [], f = t.fam, dm = P.menu.vp.desktop.type, all = allSections(P), types = all.map(function (s) { return s.type; });
    if (f.menus.indexOf(dm) < 0) why.push('doesn’t offer a ' + MENU_TYPES[dm].name.toLowerCase() + ' on desktop');
    (f.no || []).forEach(function (n) { if (types.indexOf(n) >= 0) why.push('has no ' + SECTION_TYPES[n].toLowerCase() + ' section'); });
    if (f.maxTiles) all.forEach(function (s) { if (s.type == 'tiles' && (s.items || []).length > f.maxTiles) why.push('fits up to ' + f.maxTiles + ' cards per grid (“' + s.title + '” has ' + s.items.length + ')'); });
    if (f.need && !f.need.some(function (n) { return types.indexOf(n) >= 0; })) why.push('needs a card grid or link list');
    return { ok: !why.length, why: why };
  }

  function allSections(P) { var o = []; (P.pages || []).forEach(function (p) { o = o.concat(p.sections); }); return o; }
  function pageOf(P, id) { var ps = P.pages || []; return ps.filter(function (p) { return p.id == id; })[0] || ps[0] || { sections: [] }; }

  /* ---------- art helpers ---------- */
  function pal(P) { return P.brand.pal; }
  function font(P) { return Art.FONTS[P.brand.font] || Art.FONTS[0]; }
  function asset(P, a, kind, h) {
    if (!a) return '';
    if (a.kind == 'img') return '<img src="' + esc(a.src) + '" alt="' + esc(a.label || '') + '"' + (h ? ' style="height:' + h + 'px;width:auto"' : '') + ' loading="lazy">';
    if (kind == 'logo') return Art.logo(a, P.biz.name, h || 40, pal(P), font(P));
    if (kind == 'hero') return Art.hero(a, pal(P));
    return Art.ill(a, pal(P));
  }
  function picked(P, kind) { var b = P.brand; return b.opts[kind].filter(function (o) { return o.id == b.pick[kind]; })[0] || b.opts[kind][0]; }
  function ills(P) { var b = P.brand, s = b.opts.ill.filter(function (o) { return b.star[o.id]; }), p = picked(P, 'ill'); if (p && s.indexOf(p) < 0) s.unshift(p); return s.length ? s : b.opts.ill.slice(0, 3); }
  function illAt(P, i) { var l = ills(P); return l.length ? asset(P, l[i % l.length], 'ill') : ''; }
  function imageRef(P, im, i) {
    if (!im) return '';
    if (im.kind == 'hero') return asset(P, picked(P, 'hero'), 'hero');
    if (im.kind == 'ill') return illAt(P, im.i || i || 0);
    return asset(P, im, 'img');
  }
  function sectionImage(P, s, i) {
    var im = s.image;
    if (!im) return '';
    if (im.kind == 'hero') return asset(P, picked(P, 'hero'), 'hero');
    if (im.kind == 'ill') return illAt(P, im.i || i || 0);
    return asset(P, im, 'img');
  }
  function href(u) { return esc(u || '#'); }
  /* data-fk marks an editable field so Shot can map where it landed (the key matches the editor's field name) */
  function fk(k) { return k ? ' data-fk="' + k + '"' : ''; }
  function tagImg(html, k) { return html ? html.replace(/^<(img|svg)\b/, '<$1' + fk(k || 'image')) : ''; }
  function btn(text, link, cls, k) { return text ? '<a class="' + (cls || 'bt') + '" href="' + href(link) + '"' + fk(k) + '>' + esc(text) + '</a>' : ''; }
  function paras(t, k) { return String(t || '').split(/\n{2,}/).filter(Boolean).map(function (p) { return '<p' + fk(k || 'text') + '>' + esc(p) + '</p>'; }).join(''); }
  function ii(i) { return ' data-ii="' + i + '"'; }

  /* ---------- menu ---------- */
  function linkHtml(m) { return '<a href="' + href(m.href) + '">' + esc(m.label) + '</a>'; }
  function dd(m, open) { return '<details class="dd"' + (open ? ' open' : '') + '><summary>' + esc(m.label) + '</summary><div class="pn">' + m.children.map(linkHtml).join('') + '</div></details>'; }
  function navItems(items, open) { var first = true; return items.map(function (m) { if (m.children && m.children.length) { var h = dd(m, open && first); first = false; return h; } return linkHtml(m); }).join(''); }
  function tree(items) {
    var flat = items.filter(function (m) { return !(m.children && m.children.length); }), groups = items.filter(function (m) { return m.children && m.children.length; });
    return (flat.length ? '<div class="dg"><strong>Main</strong>' + flat.map(linkHtml).join('') + '</div>' : '') + groups.map(function (g) { return '<div class="dg"><strong>' + esc(g.label) + '</strong>' + g.children.map(linkHtml).join('') + '</div>'; }).join('');
  }
  function header(P, vp, open) {
    var c = P.menu.vp[vp], items = P.menu.items, t = c.type, L = '<a class="lg" href="#">' + asset(P, picked(P, 'logo'), 'logo', vp == 'phone' ? 34 : 44) + '</a>';
    var extras = (c.search ? '<span class="sr" aria-label="Search">⌕</span>' : '') + (c.cta && P.menu.cta.label ? btn(P.menu.cta.label, P.menu.cta.href, 'bt hc') : '');
    var drawer = '<details class="dr"' + (open ? ' open' : '') + '><summary>☰ Menu</summary><div class="dw">' + tree(items) + '</div></details>';
    var cls = 'hd hd-' + t + ' lp-' + (t == 'split' ? 'center' : c.logo) + (c.sticky ? ' sk' : '');
    var inner;
    if (t == 'bar') inner = L + '<nav class="mn">' + navItems(items, open) + '</nav><div class="ha">' + extras + '</div>';
    else if (t == 'mega') {
      var flat = items.filter(function (m) { return !(m.children && m.children.length); }), groups = items.filter(function (m) { return m.children && m.children.length; });
      inner = L + '<nav class="mn">' + flat.map(linkHtml).join('') + (groups.length ? '<details class="dd mg"' + (open ? ' open' : '') + '><summary>Explore all</summary><div class="pn">' + groups.map(function (g) { return '<div class="dg"><strong>' + esc(g.label) + '</strong>' + g.children.map(linkHtml).join('') + '</div>'; }).join('') + '</div></details>' : '') + '</nav><div class="ha">' + extras + '</div>';
    } else if (t == 'split') {
      var half = Math.ceil(items.length / 2);
      inner = '<nav class="mn ml">' + navItems(items.slice(0, half), open) + '</nav>' + L + '<nav class="mn mr">' + navItems(items.slice(half), false) + extras + '</nav>';
    } else if (t == 'bottom') inner = L + '<div class="ha">' + extras + '</div>';
    else inner = L + '<div class="ha">' + extras + drawer + '</div>';
    return '<header class="' + cls + '">' + inner + '</header>';
  }
  function bottomBar(P, vp, open) {
    var items = P.menu.items, top = items.slice(0, 3);
    return '<nav class="bb bb-' + vp + '" aria-label="Tabs">' + top.map(function (m) { return '<a href="' + href(m.href || (m.children && m.children[0] && m.children[0].href)) + '"><i>●</i>' + esc(m.label) + '</a>'; }).join('') +
      '<details class="bm"' + (open ? ' open' : '') + '><summary><i>☰</i>More</summary><div class="dw">' + tree(items) + '</div></details></nav>';
  }

  /* ---------- sections ---------- */
  function head(s) { return (s.title ? '<div class="sh"><h2' + fk('title') + '>' + esc(s.title) + '</h2>' + (s.moreText ? btn(s.moreText, s.moreLink, 'mo', 'moreText') : '') + '</div>' : '') + (s.text && s.type != 'feature' && s.type != 'text' && s.type != 'cta' ? '<p class="in"' + fk('text') + '>' + esc(s.text) + '</p>' : ''); }
  var SEC = {
    hero: function (P, s, f) {
      var lay = s.layout && s.layout != 'auto' ? s.layout : f.hero; if (lay == 'none') lay = 'center';
      var img = s.image === null ? '' : (s.image ? sectionImage(P, s) : asset(P, picked(P, 'hero'), 'hero'));
      return '<section class="s s-hero hl-' + lay + '"><div class="hx"><div class="ht">' + (s.eyebrow ? '<p class="ey"' + fk('eyebrow') + '>' + esc(s.eyebrow) + '</p>' : '') + '<h1' + fk('title') + '>' + esc(s.title || P.biz.name) + '</h1>' + paras(s.text) +
        '<div class="bts">' + btn(s.linkText, s.link, 'bt', 'linkText') + btn(s.link2Text, s.link2, 'bt bt2', 'link2Text') + '</div></div>' + (img ? '<div class="hm">' + tagImg(img) + '</div>' : '') + '</div></section>';
    },
    tiles: function (P, s, f) {
      var st = s.style && s.style != 'auto' ? s.style : f.tiles, cols = s.cols || 3;
      return '<section class="s s-tiles"><div class="w">' + head(s) + '<div class="tl tl-' + st + ' c' + cols + '">' + (s.items || []).map(function (it, i) {
        var pic = s.showImg === false && st != 'icons' ? '' : it.image ? '<span class="tim">' + tagImg(imageRef(P, it.image, i)) + '</span>' : (s.showImg || st == 'icons') ? '<span class="tim">' + tagImg(illAt(P, i)) + '</span>' : '';
        return '<a class="ti" href="' + href(it.link) + '"' + ii(i) + '>' + pic + '<span class="tx">' + (it.eyebrow ? '<small class="meta"' + fk('eyebrow') + '>' + esc(it.eyebrow) + '</small>' : '') + '<h3' + fk('title') + '>' + esc(it.title) + '</h3>' + (it.text ? '<p' + fk('text') + '>' + esc(it.text) + '</p>' : '') + (it.linkText ? '<b' + fk('linkText') + '>' + esc(it.linkText) + ' →</b>' : '') + '</span></a>';
      }).join('') + '</div></div></section>';
    },
    feature: function (P, s, f) {
      var st = s.style && s.style != 'auto' ? s.style : f.feature, img = s.image === null ? '' : (s.image ? sectionImage(P, s) : illAt(P, 1));
      return '<section class="s s-feature"><div class="w">' + head(s) + '<div class="fe fe-' + st + '">' + (img ? '<div class="fm">' + tagImg(img) + '</div>' : '') + '<div class="fx">' + (s.eyebrow ? '<p class="ey"' + fk('eyebrow') + '>' + esc(s.eyebrow) + '</p>' : '') +
        '<h3' + fk('headline') + '>' + esc(s.headline || '') + '</h3>' + paras(s.text) + btn(s.linkText, s.link, 'bt', 'linkText') + '</div></div></div></section>';
    },
    list: function (P, s) {
      return '<section class="s s-list"><div class="w">' + head(s) + '<div class="ls">' + (s.items || []).map(function (it, i) { return '<div class="lr"' + ii(i) + '><strong' + fk('title') + '>' + esc(it.title) + '</strong>' + (it.text ? '<span' + fk('text') + '>' + esc(it.text) + '</span>' : '') + btn(it.linkText || 'Open', it.link, 'mo', 'linkText') + '</div>'; }).join('') + '</div>' + (s.linkText ? btn(s.linkText, s.link, 'mo', 'linkText') : '') + '</div></section>';
    },
    text: function (P, s) {
      var img = s.image ? sectionImage(P, s) : '';
      return '<section class="s s-text' + (img ? ' wi' : '') + '"><div class="w"><div class="tb">' + (s.title ? '<h2' + fk('title') + '>' + esc(s.title) + '</h2>' : '') + paras(s.text) + btn(s.linkText, s.link, 'mo', 'linkText') + '</div>' + (img ? '<div class="fm">' + tagImg(img) + '</div>' : '') + '</div></section>';
    },
    stats: function (P, s) { return '<section class="s s-stats"><div class="w">' + head(s) + '<div class="stt">' + (s.items || []).map(function (it, i) { return '<div' + ii(i) + '><b' + fk('title') + '>' + esc(it.title) + '</b><span' + fk('text') + '>' + esc(it.text) + '</span></div>'; }).join('') + '</div></div></section>'; },
    gallery: function (P, s) { return '<section class="s s-gallery"><div class="w">' + head(s) + '<div class="gl">' + (s.items || []).map(function (it, i) { return '<figure' + ii(i) + '>' + tagImg(it.image ? imageRef(P, it.image, i) : illAt(P, i)) + (it.title ? '<figcaption' + fk('title') + '>' + esc(it.title) + '</figcaption>' : '') + '</figure>'; }).join('') + '</div></div></section>'; },
    testimonial: function (P, s) { return '<section class="s s-quotes"><div class="w">' + head(s) + '<div class="qs">' + (s.items || []).map(function (it, i) { return '<blockquote' + ii(i) + '><p' + fk('text') + '>“' + esc(it.text) + '”</p><cite' + fk('title') + '>' + esc(it.title) + '</cite></blockquote>'; }).join('') + '</div></div></section>'; },
    cta: function (P, s) { return '<section class="s s-cta"><div class="w"><h2' + fk('title') + '>' + esc(s.title) + '</h2>' + paras(s.text) + btn(s.linkText, s.link, 'bt bt3', 'linkText') + '</div></section>'; },
    videos: function (P, s, f) {
      var st = s.style && s.style != 'auto' ? s.style : (f.videos || 'grid'), items = (s.items || []).slice(0, 12);
      function card(it, i, big) {
        var th = it.image ? imageRef(P, it.image, i) : illAt(P, i);
        return '<a class="vi' + (big ? ' big' : '') + '" href="' + href(it.link) + '"' + ii(i) + '><span class="vt">' + tagImg(th) + '<span class="play" aria-hidden="true"></span>' + (it.duration ? '<span class="du"' + fk('duration') + '>' + esc(it.duration) + '</span>' : '') + '</span><span class="vx">' + (it.eyebrow ? '<small class="meta"' + fk('eyebrow') + '>' + esc(it.eyebrow) + '</small>' : '') + '<h3' + fk('title') + '>' + esc(it.title) + '</h3>' + (big && it.text ? '<p' + fk('text') + '>' + esc(it.text) + '</p>' : '') + '</span></a>';
      }
      var body;
      if (st == 'lead' && items.length > 1) body = '<div class="vl-lead">' + card(items[0], 0, true) + '<div class="rail">' + items.slice(1, 5).map(function (it, i) { return card(it, i + 1); }).join('') + '</div></div>' + (items.length > 5 ? '<div class="vg">' + items.slice(5, 9).map(function (it, i) { return card(it, i + 5); }).join('') + '</div>' : '');
      else if (st == 'row') body = '<div class="vrow">' + items.slice(0, 8).map(function (it, i) { return card(it, i); }).join('') + '</div><div class="arr" aria-hidden="true"><span>‹</span><span>›</span></div>';
      else body = '<div class="vg">' + items.map(function (it, i) { return card(it, i); }).join('') + '</div>';
      return '<section class="s s-videos vs-' + st + '"><div class="w">' + head(s) + body + '</div></section>';
    },
    podcast: function (P, s) {
      return '<section class="s s-podcast"><div class="w">' + head(s) + '<div class="pods">' + (s.items || []).slice(0, 8).map(function (it, i) {
        return '<div class="pod"' + ii(i) + '><span class="pc">' + tagImg(it.image ? imageRef(P, it.image, i) : illAt(P, i + 2)) + '</span><div class="px"><h3' + fk('title') + '>' + esc(it.title) + '</h3>' + (it.text ? '<p' + fk('text') + '>' + esc(it.text) + '</p>' : '') + '<div class="bar"><span class="pb" aria-hidden="true">▶</span><span class="tr"><i style="width:' + (18 + (i * 23) % 60) + '%"></i></span><span class="tm">00:00</span></div></div></div>';
      }).join('') + '</div></div></section>';
    },
    pagehead: function (P, s) {
      var img = s.image ? imageRef(P, s.image) : '';
      return '<section class="s s-pagehead' + (img ? ' wi' : '') + '"><div class="w"><p class="crumb">Home <span>/</span> ' + esc(s.title) + '</p><h1' + fk('title') + '>' + esc(s.title) + '</h1>' + paras(s.text) + '</div>' + (img ? '<div class="phm">' + tagImg(img) + '</div>' : '') + '</section>';
    },
    contact: function (P, s) { return '<section class="s s-contact"><div class="w">' + head(s) + '<dl class="ct">' + (s.items || []).map(function (it, i) { return '<div' + ii(i) + '><dt' + fk('title') + '>' + esc(it.title) + '</dt><dd' + fk('text') + '>' + (it.link ? '<a href="' + href(it.link) + '">' + esc(it.text || it.link) + '</a>' : esc(it.text)) + '</dd></div>'; }).join('') + '</dl>' + btn(s.linkText, s.link, 'bt', 'linkText') + '</div></section>'; }
  };

  function footer(P) {
    var items = P.menu.items, links = [];
    items.forEach(function (m) { if (m.children && m.children.length) links = links.concat(m.children); else links.push(m); });
    return '<footer class="ft" data-sec="footer" data-type="footer" data-si="-1"><div class="w"><div class="fb">' + asset(P, picked(P, 'logo'), 'logo', 36) + (P.footer.motto ? '<p class="mt"' + fk('motto') + '>' + esc(P.footer.motto) + '</p>' : '') + '</div><nav>' + links.slice(0, 12).map(linkHtml).join('') + '</nav><p class="cp"' + fk('text') + '>' + esc(P.footer.text || ('© ' + P.biz.name)) + '</p></div></footer>';
  }

  function page(P, tplId, opt) {
    opt = opt || {}; var t = tpl(tplId), f = t.fam, v = t.v, p = pal(P), F = font(P);
    var dark = Art.lum(p.bg) < 110;
    var vars = '--bg:' + p.bg + ';--ink:' + p.ink + ';--acc:' + p.acc + ';--soft:' + p.soft + ';--oa:' + Art.onColor(p.acc) + ';--oi:' + Art.onColor(p.ink) + ';--line:' + Art.mix(p.bg, p.ink, dark ? .3 : .16) + ';--mute:' + Art.mix(p.ink, p.bg, .3) + ';--card:' + (dark ? Art.mix(p.bg, p.ink, .06) : '#ffffff') + ';--hf:' + F.h.replace(/"/g, "'") + ';--bf:' + F.b.replace(/"/g, "'") + ';--hw:' + F.w + ';--r:' + v.r + 'px';
    var secs = pageOf(P, opt.pageId).sections.map(function (s, i) {
      var h = (SEC[s.type] || SEC.text)(P, s, f), bg = s.bg && s.bg != 'auto' ? s.bg : (v.band != 'none' && i % 2 == 1 && s.type != 'hero' ? v.band : 'default');
      if (f.bands && s.type == 'cta') bg = 'acc';
      if (s.type == 'pagehead' && (!s.bg || s.bg == 'auto')) bg = f.k == 'bold' || f.k == 'portal' ? 'ink' : 'soft';
      return h.replace('<section class="s ', '<section data-sec="' + s.id + '" data-type="' + s.type + '" data-si="' + i + '" class="s bg-' + bg + ' al-' + (s.align || 'auto') + (opt.sel == s.id ? ' sel' : '') + ' ');
    }).join('');
    var mv = opt.openMenu;
    return '<div class="pv tf-' + f.k + ' tv-' + v.k + ' dn-' + v.dens + '" style="' + vars + '">' +
      '<div class="vh vh-d">' + header(P, 'desktop', mv == 'desktop') + '</div><div class="vh vh-t">' + header(P, 'tablet', mv == 'tablet') + '</div><div class="vh vh-p">' + header(P, 'phone', mv == 'phone') + '</div>' +
      '<main>' + secs + '</main>' + footer(P) +
      (P.menu.vp.tablet.type == 'bottom' ? '<div class="vh vh-t">' + bottomBar(P, 'tablet', mv == 'tablet') + '</div>' : '') +
      (P.menu.vp.phone.type == 'bottom' ? '<div class="vh vh-p">' + bottomBar(P, 'phone', mv == 'phone') + '</div>' : '') + '</div>';
  }

  return { page: page, pageOf: pageOf, allSections: allSections, imageRef: imageRef, TEMPLATES: TEMPLATES, FAMILIES: FAMILIES, tpl: tpl, compat: compat, SECTION_TYPES: SECTION_TYPES, MENU_TYPES: MENU_TYPES, asset: asset, picked: picked };
})();
