/* BAKE Studio: read an existing web page and turn it into a starting project */
var Importer = (function () {
  var uid = 0; function id(p) { return (p || 'x') + Date.now().toString(36) + (uid++); }
  function txt(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function abs(href, base) { try { return new URL(href, base).href; } catch (e) { return href || ''; } }
  function linkText(a) { return txt(a).replace(/\s*[→›»]\s*$/, '').trim(); }

  async function fetchHtml(url) {
    var r = await fetch(url, { mode: 'cors', redirect: 'follow' });
    if (!r.ok) throw new Error('The site answered with error ' + r.status + '.');
    return { html: await r.text(), url: r.url || url };
  }

  function colours(cssText) {
    var counts = {}, m, re = /#([0-9a-f]{6}|[0-9a-f]{3})\b/gi;
    while ((m = re.exec(cssText))) { var h = Art.hex('#' + m[1]); if (h) counts[h] = (counts[h] || 0) + 1; }
    var list = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 24);
    if (!list.length) return null;
    var light = list.filter(function (h) { return Art.lum(h) > 225; }), dark = list.filter(function (h) { return Art.lum(h) < 90; });
    var acc = list.filter(function (h) { return Art.sat(h) > .35 && Art.lum(h) > 70 && Art.lum(h) < 210; });
    var soft = list.filter(function (h) { return Art.lum(h) > 200 && Art.lum(h) < 248 && Art.sat(h) > .03; });
    var ink = dark.slice(0, 4).sort(function (a, b) { return Art.lum(a) - Art.lum(b); })[0] || '#1d1c1a';
    var ac = acc.filter(function (h) { return h != ink && Math.abs(Art.lum(h) - Art.lum(ink)) > 25; })[0] || acc[0] || list[0];
    return {
      found: list.slice(0, 12),
      pal: { name: 'From your site', bg: light[0] || '#ffffff', ink: ink, acc: ac, soft: soft[0] || light[1] || '#eeeeee' }
    };
  }

  function menu(doc, base) {
    var hdr = doc.querySelector('header') || doc.body, items = [], seen = {};
    function add(list, a) { var h = abs(a.getAttribute('href'), base), l = linkText(a); if (!l || seen[h + l]) return; seen[h + l] = 1; list.push({ id: id('m'), label: l, href: h }); }
    var navs = Array.prototype.slice.call(hdr.querySelectorAll('nav')).filter(function (n) { return !/mobile/i.test((n.getAttribute('aria-label') || '') + ' ' + n.className + ' ' + ((n.closest('details') || {}).className || '')); });
    if (!navs.length) navs = [hdr];
    navs.forEach(function (nav) {
      Array.prototype.slice.call(nav.querySelectorAll('details, a')).forEach(function (el) {
        if (el.tagName == 'DETAILS') {
          if (/mobile/i.test(el.className)) return;
          var g = { id: id('g'), label: txt(el.querySelector('summary')), href: '', children: [] };
          Array.prototype.slice.call(el.querySelectorAll('a')).forEach(function (a) { add(g.children, a); });
          if (g.label && g.children.length) items.push(g);
        } else if (!el.closest('details') && txt(el)) add(items, el);
      });
    });
    if (!items.length) {
      var mob = hdr.querySelector('nav[aria-label*="obile"], .mobile-nav, nav');
      if (mob) Array.prototype.slice.call(mob.querySelectorAll('a')).slice(0, 12).forEach(function (a) { add(items, a); });
    }
    return items.slice(0, 14);
  }

  function images(doc, base, name, css) {
    var logos = [], heroes = [], seen = {};
    function push(list, src, label) { if (!src) return; src = abs(src, base); var key = src.split('?')[0]; if (seen[key]) return; seen[key] = 1; list.push({ kind: 'img', src: src, from: 'site', label: label || '' }); }
    var hdrImgs = Array.prototype.slice.call(doc.querySelectorAll('header img'));
    hdrImgs.sort(function (a, b) { var n = name.toLowerCase(); return ((b.alt || '').toLowerCase().indexOf(n) >= 0) - ((a.alt || '').toLowerCase().indexOf(n) >= 0); });
    hdrImgs.forEach(function (i) { push(logos, i.getAttribute('src'), i.alt || 'Header image'); });
    var ld = doc.querySelector('script[type="application/ld+json"]');
    if (ld) { var lm = /"logo"\s*:\s*"([^"]+)"/.exec(ld.textContent); if (lm) push(logos, lm[1], 'Logo'); }
    var ic = doc.querySelector('link[rel~="icon"]'); if (ic) push(logos, ic.getAttribute('href'), 'Site icon');
    var og = doc.querySelector('meta[property="og:image"]'); if (og) push(heroes, og.getAttribute('content'), 'Share image');
    var re = /url\(["']?([^"')]+\.(?:png|jpe?g|webp|avif))["']?\)/gi, m;
    while ((m = re.exec(css))) if (/hero|banner|cover|header-background/i.test(m[1])) push(heroes, m[1], 'Hero image');
    Array.prototype.slice.call(doc.querySelectorAll('main img, body > section img')).slice(0, 6).forEach(function (i) { push(heroes, i.getAttribute('src'), i.alt || 'Page image'); });
    return { logos: logos.slice(0, 6), heroes: heroes.slice(0, 6) };
  }

  function sections(doc, base) {
    var root = doc.querySelector('main') || doc.body, out = [];
    var blocks = Array.prototype.slice.call(root.querySelectorAll('section, article')).filter(function (el) { var p = el.parentElement.closest('section, article'); return !p || !root.contains(p); });
    if (!blocks.length) blocks = Array.prototype.slice.call(root.children).filter(function (el) { return el.querySelector('h1,h2,h3') && !/^(HEADER|FOOTER|NAV|SCRIPT)$/.test(el.tagName); });
    blocks.slice(0, 12).forEach(function (b) {
      var h2 = b.querySelector('h2, h1'), title = txt(h2) || b.getAttribute('aria-label') || '';
      var tiles = Array.prototype.slice.call(b.querySelectorAll('a')).filter(function (a) { return a.querySelector('h2,h3,h4'); });
      var rows = Array.prototype.slice.call(b.querySelectorAll(':scope > *, :scope > div > *')).filter(function (el) { return el.querySelector('a') && el.querySelector('strong, b, h3, h4') && el.children.length <= 4 && !el.querySelector('p p'); });
      var head = h2 && h2.parentElement !== b ? h2.parentElement : null, headLink = head ? head.querySelector('a') : null;
      var img = b.querySelector('img'), image = img ? { kind: 'img', src: abs(img.getAttribute('src'), base) } : null;
      if (tiles.length >= 3) {
        out.push({ id: id('s'), type: 'tiles', title: b.getAttribute('aria-label') || title || 'Explore', text: '', cols: tiles.length % 3 == 0 ? 3 : 4, showImg: false,
          items: tiles.map(function (a) { return { id: id('i'), title: txt(a.querySelector('h2,h3,h4')), text: txt(a.querySelector('p')), link: abs(a.getAttribute('href'), base), linkText: '' }; }) });
      } else if (rows.length >= 2) {
        out.push({ id: id('s'), type: 'list', title: title, text: '', link: headLink ? abs(headLink.getAttribute('href'), base) : '', linkText: headLink ? linkText(headLink) : '',
          items: rows.map(function (r) { var a = r.querySelector('a'); return { id: id('i'), title: txt(r.querySelector('strong, b, h3, h4')), text: '', link: abs(a.getAttribute('href'), base), linkText: linkText(a) }; }) });
      } else if (b.querySelector('h3') && b.querySelector('p')) {
        var ps = Array.prototype.slice.call(b.querySelectorAll('p')), ey = ps.filter(function (p) { return /eyebrow|kicker|meta|date/i.test(p.className) || (txt(p).length < 60 && txt(p) == txt(p).toUpperCase()); })[0];
        var body = ps.filter(function (p) { return p !== ey; })[0], acts = Array.prototype.slice.call(b.querySelectorAll('a')).filter(function (a) { return a !== headLink; }), act = acts[acts.length - 1];
        out.push({ id: id('s'), type: 'feature', title: title, eyebrow: txt(ey), headline: txt(b.querySelector('h3')), text: txt(body), link: act ? abs(act.getAttribute('href'), base) : '', linkText: act ? linkText(act) : 'Read more',
          moreLink: headLink ? abs(headLink.getAttribute('href'), base) : '', moreText: headLink ? linkText(headLink) : '', image: image });
      } else {
        var a2 = b.querySelector('a');
        out.push({ id: id('s'), type: 'text', title: title, text: Array.prototype.slice.call(b.querySelectorAll('p')).map(txt).filter(Boolean).join('\n\n'), link: a2 ? abs(a2.getAttribute('href'), base) : '', linkText: a2 ? linkText(a2) : '', image: image });
      }
    });
    return out;
  }

  async function analyse(html, url, log) {
    var doc = new DOMParser().parseFromString(html, 'text/html'), base = url || 'https://example.com/';
    var css = Array.prototype.slice.call(doc.querySelectorAll('style')).map(function (s) { return s.textContent; }).join('\n');
    var sheets = Array.prototype.slice.call(doc.querySelectorAll('link[rel~="stylesheet"]')).slice(0, 8);
    for (var i = 0; i < sheets.length; i++) { try { var ac = new AbortController(), tm = setTimeout(function () { ac.abort(); }, 4000); var r = await fetch(abs(sheets[i].getAttribute('href'), base), { signal: ac.signal }); if (r.ok) css += '\n' + await r.text(); clearTimeout(tm); } catch (e) { } }
    if (sheets.length && log) log('Read ' + sheets.length + ' style sheets for colours.');
    var siteName = (doc.querySelector('meta[property="og:site_name"]') || {}).content || txt(doc.querySelector('title')).split(/\s[|–—-]\s/)[0] || 'Your business';
    var desc = (doc.querySelector('meta[name="description"]') || {}).content || '';
    var h1 = txt(doc.querySelector('h1'));
    var fm = doc.querySelector('footer'), motto = fm ? txt(fm.querySelector('[class*="motto"], p, div')) : '';
    var col = colours(css), imgs = images(doc, base, siteName, css), mn = menu(doc, base), secs = sections(doc, base);
    var serif = /font-family:\s*[^;]*(georgia|serif)/i.test(css) && !/font-family:\s*[^;]*sans-serif/i.test(css.slice(0, 2000));
    return { url: base, name: siteName.trim(), tagline: h1, desc: desc, motto: motto, colours: col, logos: imgs.logos, heroes: imgs.heroes, menu: mn, sections: secs, serif: serif };
  }
  return { fetchHtml: fetchHtml, analyse: analyse, id: id };
})();
