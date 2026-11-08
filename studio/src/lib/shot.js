import siteCss from './site.css?raw';
import { pageFonts } from './fonts.js';
/* BAKE Studio: turn a generated page into a full-page picture (PNG) plus a JSON map of where each section, text block and image sits, so previews show images, not page code */
var Shot = (function () {
  var cssP = null, imgCache = {}, shotCache = {}, order = [];
  function css() { if (!cssP) cssP = Promise.resolve(siteCss); return cssP; }
  function toData(src) {
    if (/^data:/.test(src)) return Promise.resolve(src);
    if (!imgCache[src]) imgCache[src] = fetch(src).then(function (r) { if (!r.ok) throw 0; return r.blob(); }).then(function (b) {
      return new Promise(function (ok) { var fr = new FileReader(); fr.onload = function () { ok(fr.result); }; fr.onerror = function () { ok(''); }; fr.readAsDataURL(b); });
    }).catch(function () { return ''; });
    return imgCache[src];
  }
  function remember(k, v) { shotCache[k] = v; order.push(k); if (order.length > 80) delete shotCache[order.shift()]; return v; }
  /* Box map of the rendered page, in CSS px of the render width (not scaled), clipped to the picture.
     Each box: { id, type: 'section' | 'item' | 'text' | 'image', sectionIndex, x, y, width, height,
                 sectionId, sectionType, itemIndex (or null), field (or null) }.
     sectionIndex is the section's place on the page; the footer is -1. Sections come first, then items,
     then text and images, so later boxes sit on top of earlier ones. */
  var ORDER = { section: 0, item: 1, text: 2, image: 2 };
  function measure(host, w, h) {
    var o = host.getBoundingClientRect(), boxes = [], seen = {};
    function rect(el) {
      var r = el.getBoundingClientRect(), x = Math.max(0, r.left - o.left), y = Math.max(0, r.top - o.top);
      var x2 = Math.min(w, r.right - o.left), y2 = Math.min(h, r.bottom - o.top);
      return x2 - x >= 2 && y2 - y >= 2 ? { x: Math.round(x), y: Math.round(y), width: Math.round(x2 - x), height: Math.round(y2 - y) } : null;
    }
    function add(el, type, sec, item, field) {
      var r = rect(el); if (!r) return;
      var id = sec.dataset.sec + (item ? ':' + item.dataset.ii : '') + (field ? ':' + field : '') + (type == 'item' ? ':item' : '');
      seen[id] = (seen[id] || 0) + 1; if (seen[id] > 1) id += ':' + seen[id];   // e.g. several paragraphs of one text field
      boxes.push({ id: id, type: type, sectionIndex: +sec.dataset.si, x: r.x, y: r.y, width: r.width, height: r.height,
        sectionId: sec.dataset.sec, sectionType: sec.dataset.type, itemIndex: item ? +item.dataset.ii : null, field: field || null });
    }
    Array.prototype.forEach.call(host.querySelectorAll('[data-sec]'), function (sec) {
      add(sec, 'section', sec);
      Array.prototype.forEach.call(sec.querySelectorAll('[data-ii]'), function (it) { add(it, 'item', sec, it); });
      Array.prototype.forEach.call(sec.querySelectorAll('[data-fk]'), function (el) {
        var it = el.closest('[data-ii]'); if (it && !sec.contains(it)) it = null;
        add(el, /^(img|svg)$/i.test(el.tagName) ? 'image' : 'text', sec, it, el.dataset.fk);
      });
    });
    boxes.sort(function (a, b) { return ORDER[a.type] - ORDER[b.type]; });
    /* every visible link (menus, buttons, cards), so a screenshot can be made clickable (lib/site.js shotSite) */
    var links = [];
    Array.prototype.forEach.call(host.querySelectorAll('a[href]'), function (a) {
      var r = rect(a), href = a.getAttribute('href'); if (!r || !href || href == '#') return;
      links.push({ x: r.x, y: r.y, width: r.width, height: r.height, href: href, label: (a.textContent || '').trim().slice(0, 80) });
    });
    return { width: w, height: h, boxes: boxes, links: links };
  }
  /* html: page markup; w: viewport width; opt.maxH: crop height; opt.scale: pixel density.
     Resolves to { url (picture), w, h, full, secs, map (see measure) } */
  async function take(html, w, opt) {
    opt = opt || {}; var key = w + '|' + (opt.maxH || 0) + '|' + (opt.scale || 1) + '|' + html;
    if (shotCache[key]) return shotCache[key];
    var style = await css();
    var gf = /data-gf="([^"]*)"/.exec(html);   // Google fonts the page uses: embed them so the screenshot can show them
    if (gf) style = (await pageFonts(gf[1].replace(/&amp;/g, '&'))) + style;
    var host = document.createElement('div'); host.className = 'cq';
    host.style.cssText = 'position:absolute;left:-100000px;top:0;width:' + w + 'px';
    host.innerHTML = html; document.body.appendChild(host);
    var imgs = Array.prototype.slice.call(host.querySelectorAll('img'));
    imgs.forEach(function (im) { im.removeAttribute('loading'); });
    await Promise.all(imgs.map(function (im) { return toData(im.getAttribute('src')).then(function (d) { if (d) im.setAttribute('src', d); else im.removeAttribute('src'); }); }));
    await Promise.all(imgs.map(function (im) { return Promise.race([im.decode ? im.decode().catch(function () { }) : null, new Promise(function (ok) { setTimeout(ok, 4000); })]); }));
    var full = host.scrollHeight, h = Math.min(full, opt.maxH || full, 30000);
    var map = measure(host, w, h);
    var secs = map.boxes.filter(function (b) { return b.type == 'section'; }).map(function (b) { return { id: b.sectionId, y: b.y, h: b.height }; });
    host.style.cssText = 'width:' + w + 'px';
    var markup = new XMLSerializer().serializeToString(host); host.remove();
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>' + style.replace(/</g, '&lt;') + '</style>' + markup + '</div></foreignObject></svg>';
    var img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode();
    var sc = opt.scale || 1, c = document.createElement('canvas'); c.width = Math.round(w * sc); c.height = Math.round(h * sc);
    var ctx = c.getContext('2d'); ctx.scale(sc, sc); ctx.drawImage(img, 0, 0);
    var url = await new Promise(function (ok) { c.toBlob(function (b) { ok(URL.createObjectURL(b)); }, opt.type || 'image/png', .9); });
    return remember(key, { url: url, w: w, h: h, full: full, secs: secs, map: map });
  }
  return { take: take };
})();

export { Shot };
