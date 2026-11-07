/* BAKE Studio: read an existing web page and turn it into a starting project */
var Importer = (function () {
  var uid = 0; function id(p) { return (p || 'x') + Date.now().toString(36) + (uid++); }
  var A = function (l) { return Array.prototype.slice.call(l || []); };
  function txt(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function abs(href, base) { try { return new URL(href, base).href; } catch (e) { return href || ''; } }
  function linkText(a) { return txt(a).replace(/\s*[→›»]\s*$/, '').trim(); }
  function pos(a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; }
  var JUNK = /play-button|play_button|overlay|spinner|loader|pixel|1x1|blank\.gif|spacer|doubleclick|googlesyndication|facebook\.com\/tr|gravatar|emoji|placeholder|lazy[-_]?load\.|transparent\.(gif|png)/i;
  var VIDEO_HREF = /\/videos?\/|[?&]v=|\/watch|youtu\.?be|vimeo\.com|\/tv\/|\/episodes?\//i;
  var AUDIO_SRC = /libsyn|spotify|podcasts\.apple|soundcloud|anchor\.fm|buzzsprout|podbean|megaphone|simplecast|transistor\.fm/i;

  async function fetchHtml(url) {
    var r = await fetch(url, { mode: 'cors', redirect: 'follow' });
    if (!r.ok) throw new Error('The site answered with error ' + r.status + '.');
    return { html: await r.text(), url: r.url || url };
  }

  /* ---------- images ---------- */
  function srcsetBest(ss) { var best = '', bw = -1; String(ss || '').split(',').forEach(function (p) { var m = p.trim().split(/\s+/); var w = parseFloat(m[1]) || 1; if (m[0] && w > bw) { bw = w; best = m[0]; } }); return best; }
  function imgSrc(img, base) {
    var c = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-original') || img.getAttribute('data-full-url') || '';
    if (!c) c = srcsetBest(img.getAttribute('data-srcset') || img.getAttribute('data-lazy-srcset'));
    if (!c) { var src = img.getAttribute('src') || ''; if (!/^data:/.test(src) || src.length > 3000) c = src; }
    if (!c && img.closest('picture')) { var so = img.closest('picture').querySelector('source[srcset], source[data-srcset]'); if (so) c = srcsetBest(so.getAttribute('srcset') || so.getAttribute('data-srcset')); }
    if (!c) c = srcsetBest(img.getAttribute('srcset'));
    if (!c || JUNK.test(c) || JUNK.test(img.className)) return '';
    return /^data:/.test(c) ? c : abs(c, base);
  }
  function bgUrl(el, base) {
    if (!el.getAttribute) return '';
    var lazy = el.getAttribute('data-bg') || el.getAttribute('data-background') || el.getAttribute('data-bg-src') || el.getAttribute('data-background-image') || '';
    var m = /url\(\s*["']?([^"')]+)["']?\s*\)/i.exec(lazy) || (/^(https?:|\/)[^\s]+\.(jpe?g|png|webp|avif)/i.test(lazy) ? [0, lazy] : null) || /background(?:-image)?\s*:[^;]*url\(\s*["']?([^"')]+)["']?\s*\)/i.exec(el.getAttribute('style') || '');
    return m && !JUNK.test(m[1]) ? abs(m[1], base) : '';
  }
  function bestImg(el, base) {
    var imgs = el.tagName == 'IMG' ? [el] : A(el.querySelectorAll('img'));
    for (var i = 0; i < imgs.length; i++) { var s = imgSrc(imgs[i], base); if (s) return { kind: 'img', src: s, label: imgs[i].getAttribute('alt') || '' }; }
    var bgs = [el].concat(A(el.querySelectorAll('[style*="url("], [data-bg], [data-background], [data-bg-src], [data-background-image]')));
    for (i = 0; i < bgs.length; i++) { var b = bgUrl(bgs[i], base); if (b) return { kind: 'img', src: b, label: '' }; }
    var yt = el.querySelector('iframe[src*="youtube"], iframe[data-src*="youtube"]'); if (yt) { var m = /embed\/([\w-]{6,})/.exec(yt.getAttribute('src') || yt.getAttribute('data-src')); if (m) return { kind: 'img', src: 'https://i.ytimg.com/vi/' + m[1] + '/hqdefault.jpg', label: 'Video thumbnail' }; }
    var v = el.querySelector('video[poster]'); if (v) return { kind: 'img', src: abs(v.getAttribute('poster'), base), label: 'Video poster' };
    return null;
  }
  function fileLabel(src) { try { var f = decodeURIComponent(new URL(src).pathname.split('/').pop() || ''); return f.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').replace(/\s+\d+x\d+$/, '').slice(0, 60); } catch (e) { return ''; } }
  function library(doc, base, css) {
    var out = [], seen = {};
    function add(src, label, logoish) {
      if (!src || JUNK.test(src)) return; var key = src.split('?')[0]; if (seen[key]) { if (logoish) seen[key].logo = true; return; }
      var it = { id: id('L'), src: src, label: (label || fileLabel(src) || 'Image').slice(0, 80), logo: !!logoish }; seen[key] = it; out.push(it);
    }
    A(doc.querySelectorAll('header svg, [class*="logo"] svg, [id*="logo"] svg')).slice(0, 3).forEach(function (s) { if (s.querySelector('path, text, image') && s.outerHTML.length < 60000) { var x = s.cloneNode(true); if (!x.getAttribute('xmlns')) x.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); add('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(x.outerHTML), 'Logo (SVG from your header)', true); } });
    A(doc.querySelectorAll('img')).forEach(function (img) {
      var s = imgSrc(img, base); if (!s) return;
      var hint = (s + ' ' + (img.getAttribute('alt') || '') + ' ' + img.className + ' ' + (img.id || '')).toLowerCase();
      var logoish = /logo|brand|wordmark/.test(hint) || !!img.closest('header, [class*="logo"], [class*="brand"], [id*="logo"], .site-title, .navbar-brand');
      add(s, img.getAttribute('alt'), logoish);
    });
    A(doc.querySelectorAll('[style*="url("], [data-bg], [data-background], [data-bg-src], [data-background-image]')).forEach(function (el) { add(bgUrl(el, base), 'Background image'); });
    var re = /url\(\s*["']?([^"')]+\.(?:png|jpe?g|webp|avif|svg))["']?\s*\)/gi, m; while ((m = re.exec(css))) add(abs(m[1], base), 'Image from your styles', /logo/i.test(m[1]));
    var og = doc.querySelector('meta[property="og:image"]'); if (og) add(abs(og.getAttribute('content'), base), 'Share image');
    var ld = doc.querySelector('script[type="application/ld+json"]'); if (ld) { var lm = /"logo"\s*:\s*(?:\{[^}]*"url"\s*:\s*)?"([^"]+)"/.exec(ld.textContent); if (lm) add(abs(lm[1], base), 'Logo', true); }
    A(doc.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')).forEach(function (l) { add(abs(l.getAttribute('href'), base), 'Site icon', true); });
    out.sort(function (a, b) { return b.logo - a.logo; });
    return out.slice(0, 160);
  }

  /* ---------- colours ---------- */
  function colours(cssText) {
    var counts = {}, m, re = /#([0-9a-f]{6}|[0-9a-f]{3})\b/gi;
    while ((m = re.exec(cssText))) { var h = Art.hex('#' + m[1]); if (h) counts[h] = (counts[h] || 0) + 1; }
    var list = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 24);
    if (!list.length) return null;
    var light = list.filter(function (h) { return Art.lum(h) > 225; }), dark = list.filter(function (h) { return Art.lum(h) < 90; });
    var acc = list.filter(function (h) { return Art.sat(h) > .35 && Art.lum(h) > 60 && Art.lum(h) < 210; });
    var soft = list.filter(function (h) { return Art.lum(h) > 200 && Art.lum(h) < 248 && Art.sat(h) > .03; });
    var ink = dark.slice(0, 4).sort(function (a, b) { return Art.lum(a) - Art.lum(b); })[0] || '#1d1c1a';
    var ac = acc.filter(function (h) { return h != ink && Math.abs(Art.lum(h) - Art.lum(ink)) > 25; })[0] || acc[0] || list[0];
    return { found: list.slice(0, 12), pal: { name: 'From your site', bg: light[0] || '#ffffff', ink: ink, acc: ac, soft: soft[0] || light[1] || '#eeeeee' } };
  }

  /* ---------- menu ---------- */
  function menu(doc, base) {
    var hdr = doc.querySelector('header') || doc.body, items = [], seen = {};
    function add(list, a) { var h = abs(a.getAttribute('href'), base), l = linkText(a); if (!l || l.length > 40 || seen[h + l]) return; seen[h + l] = 1; list.push({ id: id('m'), label: l, href: h }); }
    var navs = A(hdr.querySelectorAll('nav')).filter(function (n) { return !/mobile|offcanvas|drawer/i.test((n.getAttribute('aria-label') || '') + ' ' + n.className + ' ' + ((n.closest('details, [class*="mobile"], [class*="offcanvas"]') || {}).className || '')); });
    if (!navs.length) navs = A(doc.querySelectorAll('nav')).slice(0, 2);
    if (!navs.length) navs = [hdr];
    navs.forEach(function (nav) {
      // details/summary groups
      A(nav.querySelectorAll('details')).forEach(function (d) { if (/mobile/i.test(d.className)) return; var g = { id: id('g'), label: txt(d.querySelector('summary')), href: '', children: [] }; A(d.querySelectorAll('a')).forEach(function (a) { add(g.children, a); }); if (g.label && g.children.length) items.push(g); });
      // nested list menus (ul > li > ul)
      A(nav.querySelectorAll('li')).filter(function (li) { return !li.parentElement.closest('li'); }).forEach(function (li) {
        if (li.closest('details')) return;
        var sub = li.querySelector('ul'), a = A(li.querySelectorAll('a')).filter(function (x) { return !sub || !sub.contains(x); })[0];
        if (sub && a) { var g = { id: id('g'), label: linkText(a), href: abs(a.getAttribute('href'), base), children: [] }; A(sub.querySelectorAll('a')).slice(0, 20).forEach(function (x) { add(g.children, x); }); if (g.children.length) items.push(g); else add(items, a); }
        else if (a) add(items, a);
      });
      if (!nav.querySelector('li')) A(nav.querySelectorAll('a')).forEach(function (a) { if (!a.closest('details') && txt(a)) add(items, a); });
    });
    return items.slice(0, 14);
  }
  function internalPages(items, base) {
    var host = ''; try { host = new URL(base).host.replace(/^www\./, ''); } catch (e) { }
    var out = [], seen = {}; function push(m) { try { var u = new URL(m.href); if (u.host.replace(/^www\./, '') != host || /^mailto|tel/.test(u.protocol)) return; var p = u.pathname.replace(/\/$/, '') || '/'; if (p == '/' || seen[p] || /\.(pdf|jpg|png|zip)$/i.test(p)) return; seen[p] = 1; out.push({ name: m.label, url: u.origin + u.pathname }); } catch (e) { } }
    items.forEach(function (m) { if (m.href) push(m); (m.children || []).forEach(push); });
    return out.slice(0, 24);
  }

  /* ---------- repeated cards (stories, videos, links) ---------- */
  function sig(el) { var c = typeof el.className == 'string' ? el.className.trim().split(/\s+/)[0] : ''; return el.tagName + '.' + (c || ''); }
  function isCard(el) { if (!(el.tagName == 'A' ? el : el.querySelector('a[href]'))) return false; return txt(el).length > 3 || !!el.querySelector('img'); }
  function cardItem(el, base) {
    var a = el.tagName == 'A' ? el : (el.querySelector('h1 a, h2 a, h3 a, h4 a, h5 a') || el.querySelector('a[href]'));
    var h = el.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"]:not(img)');
    var title = txt(h) || txt(el.querySelector('strong, b')) || (a && (a.getAttribute('title') || txt(a))) || '';
    var paras = A(el.querySelectorAll('p')).map(txt).filter(function (t) { return t && t != title && t.length > 15; });
    if (!title && paras.length) title = paras.shift();
    if (!title) title = ((el.querySelector('img') || {}).alt || '');
    var meta = txt(el.querySelector('time, .date, [class*="date"], [class*="categor"], .meta, [class*="meta"], [class*="kicker"], [class*="eyebrow"]'));
    var dur = A(el.querySelectorAll('span, small, div, time, b')).map(function (e) { return e.children.length ? '' : txt(e); }).filter(function (t) { return /^\d{1,2}:\d{2}(:\d{2})?$/.test(t); })[0] || '';
    var href = a ? abs(a.getAttribute('href'), base) : '';
    var cls = A([el].concat(A(el.querySelectorAll('*')))).map(function (e) { return typeof e.className == 'string' ? e.className : ''; }).join(' ');
    var video = VIDEO_HREF.test(href) || /(^|[\s_-])(video|vimeo|youtube|play-?(button|icon|overlay)|btn-play)([\s_-]|$)/i.test(cls) || !!el.querySelector('iframe[src*="youtube"], iframe[src*="vimeo"], video, img[data-src*="play-button"], img[src*="play-button"], img[data-src*="play-overlay"]') || !!dur;
    return { id: id('i'), title: title.slice(0, 160), text: (paras[0] || '').slice(0, 240), link: href, linkText: a && el.tagName != 'A' && txt(a) != title && txt(a).length < 30 ? linkText(a) : '', image: bestImg(el, base), eyebrow: meta.slice(0, 60), duration: dur, video: video };
  }
  function groupTitle(c, items) {
    var own = A(c.querySelectorAll('h1, h2, h3, h4')).filter(function (h) { return !items.some(function (i) { return i.contains(h); }); })[0];
    if (own && txt(own).length < 70) return txt(own);
    for (var el = c, d = 0; el && d < 6; el = el.parentElement, d++) {
      if (el.getAttribute && el.getAttribute('aria-label') && !/carousel|slider/i.test(el.getAttribute('aria-label'))) return el.getAttribute('aria-label');
      for (var p = el.previousElementSibling, i = 0; p && i < 3; p = p.previousElementSibling, i++) {
        if (/^H[1-5]$/.test(p.tagName) || /title|heading|header/i.test(typeof p.className == 'string' ? p.className : '')) { var t = txt(p); if (t && t.length < 70) return t; }
        var h = p.querySelector && p.querySelector('h1, h2, h3, h4'); if (h && txt(h).length < 70 && !p.querySelector('a[href] img')) return txt(h);
      }
    }
    return '';
  }
  function cardGroups(root, base) {
    var raw = [];
    A(root.querySelectorAll('*')).forEach(function (c) {
      if (c.closest('header, nav, footer, [role="navigation"], form, select, [class*="menu"], [class*="breadcrumb"], [class*="share"], [class*="social"], [class*="tags"]')) return;
      var kids = A(c.children).filter(function (k) { return !/^(SCRIPT|STYLE|BR|TEMPLATE)$/.test(k.tagName); });
      if (kids.length < 3) return;
      var by = {}; kids.forEach(function (k) { var s = sig(k); (by[s] = by[s] || []).push(k); });
      Object.keys(by).forEach(function (s) { var list = by[s].filter(isCard); if (list.length >= 3 && list.length >= kids.length * .6) raw.push({ c: c, items: list, sig: s }); });
    });
    // a group whose items each wrap smaller groups (like carousel slides) is replaced by those groups, merged
    var keep = [];
    raw.forEach(function (g) {
      var inner = raw.filter(function (o) { return o !== g && g.items.some(function (it) { return it.contains(o.c) || it === o.c; }); });
      if (inner.length && inner.length >= g.items.length * .5) {
        var bySig = {}; inner.forEach(function (o) { (bySig[o.sig] = bySig[o.sig] || []).push(o); });
        var top = Object.keys(bySig).sort(function (a, b) { return bySig[b].length - bySig[a].length; })[0], same = bySig[top];
        if (same.length >= 2 && same.length >= g.items.length * .5) {
          var items = []; same.forEach(function (o) { items = items.concat(o.items); o.merged = true; });
          keep.push({ c: g.c, items: items, sig: top });
        } else g.wrapper = true;
      }
    });
    raw.forEach(function (g) { if (!g.merged && !g.wrapper && !keep.some(function (k) { return k.c === g.c; })) keep.push(g); });
    keep = keep.filter(function (g) { return !keep.some(function (o) { return o !== g && o.items.some(function (it) { return it.contains(g.c); }); }); });
    return keep.map(function (g) {
      var seen = {}, items = g.items.map(function (el) { return cardItem(el, base); }).filter(function (it) { var k = it.link || it.title; if (!it.title || seen[k]) return false; seen[k] = 1; return true; });
      return { el: g.c, title: groupTitle(g.c, g.items), items: items.slice(0, 12), count: items.length };
    }).filter(function (g) { return g.items.length >= 3; });
  }

  /* ---------- sections ---------- */
  function blockSection(b, base) {
    var h2 = b.querySelector('h2, h1'), title = txt(h2) || b.getAttribute('aria-label') || '';
    var head = h2 && h2.parentElement !== b ? h2.parentElement : null, headLink = head ? head.querySelector('a') : null;
    var image = bestImg(b, base);
    if (b.querySelector('h3') && b.querySelector('p')) {
      var ps = A(b.querySelectorAll('p')), ey = ps.filter(function (p) { return /eyebrow|kicker|meta|date/i.test(p.className) || (txt(p).length < 60 && txt(p) == txt(p).toUpperCase()); })[0];
      var body = ps.filter(function (p) { return p !== ey; })[0], acts = A(b.querySelectorAll('a')).filter(function (a) { return a !== headLink; }), act = acts[acts.length - 1];
      return { id: id('s'), type: 'feature', title: title, eyebrow: txt(ey), headline: txt(b.querySelector('h3')), text: txt(body), link: act ? abs(act.getAttribute('href'), base) : '', linkText: act ? linkText(act) : 'Read more', moreLink: headLink ? abs(headLink.getAttribute('href'), base) : '', moreText: headLink ? linkText(headLink) : '', image: image };
    }
    var a2 = b.querySelector('a'), text = A(b.querySelectorAll('p')).map(txt).filter(Boolean).join('\n\n');
    if (!title && !text) return null;
    return { id: id('s'), type: 'text', title: title, text: text.slice(0, 2000), link: a2 ? abs(a2.getAttribute('href'), base) : '', linkText: a2 ? linkText(a2) : '', image: image };
  }
  function groupSection(g) {
    var vids = g.items.filter(function (i) { return i.video; }).length, imgs = g.items.filter(function (i) { return i.image; }).length, rows = !imgs && g.items.every(function (i) { return i.title.length < 60 && !i.text; });
    var items = g.items.map(function (i) { var o = { id: i.id, title: i.title, text: i.text, link: i.link, linkText: i.linkText, eyebrow: i.eyebrow }; if (i.image) o.image = i.image; if (i.duration) o.duration = i.duration; return o; });
    if (vids >= g.items.length * .5) return { id: id('s'), type: 'videos', title: g.title || 'Videos', items: items, moreText: '', moreLink: '' };
    if (rows && g.el.querySelector('strong, b')) return { id: id('s'), type: 'list', title: g.title, text: '', items: items.map(function (i) { i.linkText = i.linkText || 'Open'; return i; }) };
    return { id: id('s'), type: 'tiles', title: g.title || 'Latest', text: '', cols: g.items.length % 3 == 0 || g.items.length > 8 ? 3 : 4, showImg: imgs >= g.items.length * .5, items: items };
  }
  function sections(doc, base, inner) {
    var root = doc.querySelector('main, [role="main"], #main, #content, .site-content') || doc.body, found = [];
    var groups = cardGroups(root, base);
    var gseen = {};
    var kept = []; groups = groups.filter(function (g) { var ls = g.items.map(function (i) { return (i.link || '') + '|' + i.title; }); var dup = kept.some(function (k) { return ls.filter(function (l) { return k.indexOf(l) >= 0; }).length >= ls.length * .5; }); if (!dup) kept.push(ls); return !dup; });
    groups.forEach(function (g) { found.push({ el: g.el, s: groupSection(g) }); });
    // embedded videos and podcasts
    var vframes = A(root.querySelectorAll('iframe[src*="youtube"], iframe[data-src*="youtube"], iframe[src*="vimeo"], video')).filter(function (f) { return !groups.some(function (g) { return g.el.contains(f); }); });
    if (vframes.length) found.push({ el: vframes[0], s: { id: id('s'), type: 'videos', title: 'Videos', items: vframes.slice(0, 8).map(function (f, i) { var src = f.getAttribute('src') || f.getAttribute('data-src') || ''; return { id: id('i'), title: f.getAttribute('title') || 'Video ' + (i + 1), text: '', link: abs(src, base), image: bestImg(f.parentElement, base) }; }) } });
    var audio = A(doc.querySelectorAll('iframe')).filter(function (f) { return AUDIO_SRC.test(f.getAttribute('src') || f.getAttribute('data-src') || ''); });
    if (audio.length) found.push({ el: audio[0], s: { id: id('s'), type: 'podcast', title: 'Podcasts', items: audio.slice(0, 8).map(function (f, i) { var near = f.closest('div, section'); return { id: id('i'), title: f.getAttribute('title') || groupTitle(f.parentElement, []) || 'Episode ' + (i + 1), text: '', link: abs(f.getAttribute('src') || f.getAttribute('data-src'), base) }; }) } });
    // blocks that are not card groups (features, text)
    var blocks = A(root.querySelectorAll('section, article')).filter(function (el) { var p = el.parentElement.closest('section, article'); return (!p || !root.contains(p)) && !el.closest('header, footer, nav, aside'); });
    if (!blocks.length) blocks = A(root.children).filter(function (el) { return el.querySelector('h1, h2, h3') && !/^(HEADER|FOOTER|NAV|SCRIPT)$/.test(el.tagName); });
    blocks.forEach(function (b) {
      if (groups.some(function (g) { return b.contains(g.el) || g.el.contains(b); })) return;
      if (vframes.some(function (f) { return b.contains(f); }) || audio.some(function (f) { return b.contains(f); })) return;
      var s = blockSection(b, base); if (s) found.push({ el: b, s: s });
    });
    found.sort(function (a, b) { return pos(a.el, b.el); });
    var out = found.map(function (f) { return f.s; }).slice(0, 14);
    if (inner) {
      var h1 = doc.querySelector('main h1, h1'), d = (doc.querySelector('meta[name="description"]') || {}).content || '';
      out.unshift({ id: id('s'), type: 'pagehead', title: txt(h1) || txt(doc.querySelector('title')).split(/\s[|–—-]\s/)[0], text: d, image: null });
    }
    return out;
  }

  async function analyse(html, url, log, opt) {
    opt = opt || {};
    var doc = new DOMParser().parseFromString(html, 'text/html'), base = url || 'https://example.com/';
    var css = A(doc.querySelectorAll('style')).map(function (s) { return s.textContent; }).join('\n');
    if (!opt.inner) {
      var sheets = A(doc.querySelectorAll('link[rel~="stylesheet"]')).slice(0, 8), read = 0;
      for (var i = 0; i < sheets.length; i++) { try { var ac = new AbortController(), tm = setTimeout(function () { ac.abort(); }, 4000); var r = await fetch(abs(sheets[i].getAttribute('href'), base), { signal: ac.signal }); if (r.ok) { css += '\n' + await r.text(); read++; } clearTimeout(tm); } catch (e) { } }
      if (read && log) log('Read ' + read + ' style sheet' + (read > 1 ? 's' : '') + ' for colours.');
    }
    var siteName = (doc.querySelector('meta[property="og:site_name"]') || {}).content || txt(doc.querySelector('title')).split(/\s[|–—-]\s/)[0] || 'Your business';
    var desc = (doc.querySelector('meta[name="description"]') || doc.querySelector('meta[property="og:description"]') || {}).content || '';
    var fm = doc.querySelector('footer'), motto = fm ? txt(fm.querySelector('[class*="motto"], [class*="tagline"]')) : '';
    var mn = opt.inner ? [] : menu(doc, base);
    return {
      url: base, name: siteName.trim(), tagline: txt(doc.querySelector('h1')), desc: desc, motto: motto,
      colours: opt.inner ? null : colours(css), lib: library(doc, base, css), menu: mn, pages: opt.inner ? [] : internalPages(mn, base),
      sections: sections(doc, base, opt.inner), serif: /font-family:\s*[^;]*(georgia|serif)/i.test(css) && !/font-family:\s*[^;]*sans-serif/i.test(css.slice(0, 2000))
    };
  }
  return { fetchHtml: fetchHtml, analyse: analyse, id: id };
})();
