/* BAKE Studio: turn a generated page into a full-page picture (PNG), so previews show images, not page code */
var Shot = (function () {
  var cssP = null, imgCache = {}, shotCache = {}, order = [];
  function css() { if (!cssP) cssP = fetch('css/site.css').then(function (r) { return r.text(); }).catch(function () { return ''; }); return cssP; }
  function toData(src) {
    if (/^data:/.test(src)) return Promise.resolve(src);
    if (!imgCache[src]) imgCache[src] = fetch(src).then(function (r) { if (!r.ok) throw 0; return r.blob(); }).then(function (b) {
      return new Promise(function (ok) { var fr = new FileReader(); fr.onload = function () { ok(fr.result); }; fr.onerror = function () { ok(''); }; fr.readAsDataURL(b); });
    }).catch(function () { return ''; });
    return imgCache[src];
  }
  function remember(k, v) { shotCache[k] = v; order.push(k); if (order.length > 80) delete shotCache[order.shift()]; return v; }
  /* html: page markup; w: viewport width; opt.maxH: crop height; opt.scale: pixel density */
  async function take(html, w, opt) {
    opt = opt || {}; var key = w + '|' + (opt.maxH || 0) + '|' + (opt.scale || 1) + '|' + html;
    if (shotCache[key]) return shotCache[key];
    var style = await css();
    var host = document.createElement('div'); host.className = 'cq';
    host.style.cssText = 'position:absolute;left:-100000px;top:0;width:' + w + 'px';
    host.innerHTML = html; document.body.appendChild(host);
    var imgs = Array.prototype.slice.call(host.querySelectorAll('img'));
    await Promise.all(imgs.map(function (im) { return toData(im.getAttribute('src')).then(function (d) { if (d) im.setAttribute('src', d); else im.removeAttribute('src'); }); }));
    await Promise.all(imgs.map(function (im) { return im.decode ? im.decode().catch(function () { }) : null; }));
    var full = host.scrollHeight, h = Math.min(full, opt.maxH || full, 30000), top = host.getBoundingClientRect().top;
    var secs = Array.prototype.slice.call(host.querySelectorAll('[data-sec]')).map(function (s) { var r = s.getBoundingClientRect(); return { id: s.dataset.sec, y: r.top - top, h: r.height }; });
    host.style.cssText = 'width:' + w + 'px';
    var markup = new XMLSerializer().serializeToString(host); host.remove();
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>' + style.replace(/</g, '&lt;') + '</style>' + markup + '</div></foreignObject></svg>';
    var img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode();
    var sc = opt.scale || 1, c = document.createElement('canvas'); c.width = Math.round(w * sc); c.height = Math.round(h * sc);
    var ctx = c.getContext('2d'); ctx.scale(sc, sc); ctx.drawImage(img, 0, 0);
    var url = await new Promise(function (ok) { c.toBlob(function (b) { ok(URL.createObjectURL(b)); }, opt.type || 'image/png', .9); });
    return remember(key, { url: url, w: w, h: h, full: full, secs: secs });
  }
  return { take: take };
})();
