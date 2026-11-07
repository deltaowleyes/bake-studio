/* BAKE Studio: generated SVG artwork, palettes and fonts */
var Art = (function () {
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hex(h) { h = String(h || '').trim(); if (/^#[0-9a-f]{3}$/i.test(h)) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; return /^#[0-9a-f]{6}$/i.test(h) ? h.toLowerCase() : null; }
  function rgb(h) { var n = parseInt(hex(h).slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function lum(h) { var c = rgb(h); return (c[0] * 299 + c[1] * 587 + c[2] * 114) / 1000; }
  function sat(h) { var c = rgb(h), mx = Math.max.apply(0, c), mn = Math.min.apply(0, c); return mx ? (mx - mn) / mx : 0; }
  function onColor(h) { return lum(h) > 150 ? '#111111' : '#ffffff'; }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return '#' + x.map(function (v, i) { return ('0' + Math.round(v + (y[i] - v) * t).toString(16)).slice(-2); }).join(''); }

  var PALETTES = [
    { name: 'Wetland', bg: '#fbfaf6', ink: '#193a3a', acc: '#b07b37', soft: '#e9f2ee' },
    { name: 'Harbour', bg: '#f6f4ee', ink: '#0f2f4a', acc: '#a8481f', soft: '#d9e4ec' },
    { name: 'Forest', bg: '#f3f1e7', ink: '#1f3d2b', acc: '#c98a1b', soft: '#dde6d0' },
    { name: 'Night', bg: '#101820', ink: '#f2eee3', acc: '#f2b544', soft: '#1e2c38' },
    { name: 'Clear', bg: '#ffffff', ink: '#0f2a43', acc: '#c93e22', soft: '#dce8f2' },
    { name: 'Stone', bg: '#f7f5f0', ink: '#222222', acc: '#2f6f6b', soft: '#dce9e6' },
    { name: 'Clay', bg: '#f5eee4', ink: '#2b1b12', acc: '#8a3b12', soft: '#ebd7be' },
    { name: 'Lake', bg: '#f2f7f8', ink: '#0b2e3a', acc: '#0a7d8c', soft: '#cfe6ea' }
  ];
  var FONTS = [
    { name: 'Classic serif', h: 'Georgia,"Times New Roman",serif', b: 'system-ui,-apple-system,"Segoe UI",sans-serif', w: 700 },
    { name: 'Modern sans', h: '"Helvetica Neue",Arial,sans-serif', b: '"Helvetica Neue",Arial,sans-serif', w: 800 },
    { name: 'Friendly', h: '"Trebuchet MS",Verdana,sans-serif', b: 'Verdana,Geneva,sans-serif', w: 700 },
    { name: 'Book', h: '"Palatino Linotype",Palatino,serif', b: 'Georgia,serif', w: 700 },
    { name: 'System', h: 'system-ui,-apple-system,"Segoe UI",sans-serif', b: 'system-ui,-apple-system,"Segoe UI",sans-serif', w: 750 },
    { name: 'Newspaper', h: '"Times New Roman",Times,serif', b: 'Georgia,serif', w: 800 }
  ];
  var MK = ['<circle cx="15" cy="25" r="12" fill="none" stroke="@i" stroke-width="4"/><circle cx="35" cy="25" r="12" fill="none" stroke="@i" stroke-width="4"/><circle cx="15" cy="25" r="5" fill="@a"/><circle cx="35" cy="25" r="5" fill="@a"/>', '<path d="M25 8V26M25 26L10 43M25 26L40 43" fill="none" stroke="@i" stroke-width="5" stroke-linecap="round"/><circle cx="25" cy="8" r="5" fill="@a"/>', '<rect x="10" y="14" width="6" height="30" rx="3" fill="@i"/><rect x="22" y="6" width="6" height="38" rx="3" fill="@i"/><rect x="34" y="18" width="6" height="26" rx="3" fill="@i"/><circle cx="25" cy="6" r="5" fill="@a"/>', '<path d="M6 32A19 19 0 0 1 44 32Z" fill="@a"/><rect x="4" y="37" width="42" height="5" rx="2" fill="@i"/>', '<polygon points="25,6 40,26 10,26" fill="@a"/><polygon points="25,20 44,44 6,44" fill="@i"/>', '<path d="M5 18Q15 8 25 18T45 18" fill="none" stroke="@i" stroke-width="4" stroke-linecap="round"/><path d="M5 31Q15 21 25 31T45 31" fill="none" stroke="@a" stroke-width="4" stroke-linecap="round"/><circle cx="25" cy="42" r="3" fill="@i"/>', '<circle cx="25" cy="25" r="19" fill="none" stroke="@i" stroke-width="4"/><path d="M25 6V44M6 25H44" stroke="@a" stroke-width="4"/>', '<ellipse cx="17" cy="22" rx="9" ry="11" fill="none" stroke="@i" stroke-width="4"/><ellipse cx="33" cy="22" rx="9" ry="11" fill="none" stroke="@i" stroke-width="4"/><circle cx="17" cy="23" r="4" fill="@a"/><circle cx="33" cy="23" r="4" fill="@a"/><path d="M21 38L25 44L29 38" fill="@a"/>'];

  function logo(p, name, h, P, F) {
    var t = p.up ? name.toUpperCase() : name, fs = p.up ? 22 : 28, w = Math.max(t.length, 3) * fs * 0.6 + 16;
    var m = MK[p.mark % MK.length].replace(/@i/g, P.ink).replace(/@a/g, P.acc);
    var tx = ' font-family=\'' + F.h + '\' font-weight="' + F.w + '" font-size="' + fs + '" fill="' + P.ink + '"', lab = ' role="img" aria-label="' + esc(name) + ' logo"';
    if (p.lay == 0) return '<svg viewBox="0 0 ' + (84 + w) + ' 80" height="' + h + '"' + lab + '><g transform="translate(8,8) scale(1.28)">' + m + '</g><text x="84" y="49"' + tx + '>' + esc(t) + '</text></svg>';
    if (p.lay == 2) return '<svg viewBox="0 0 80 80" height="' + h + '"' + lab + '><g transform="translate(8,8) scale(1.28)">' + m + '</g></svg>';
    var W = Math.max(120, w); return '<svg viewBox="0 0 ' + W + ' 120" height="' + h + '"' + lab + '><g transform="translate(' + (W / 2 - 32) + ',2) scale(1.28)">' + m + '</g><text x="' + W / 2 + '" y="108" text-anchor="middle"' + tx + '>' + esc(t) + '</text></svg>';
  }
  function hero(p, P) {
    var r = rng(p.s), s = '<rect width="1600" height="900" fill="' + P.soft + '"/>', i, y;
    if (p.k == 0) { s += '<circle cx="' + (300 + r() * 1000) + '" cy="' + (200 + r() * 150) + '" r="' + (80 + r() * 60) + '" fill="' + P.acc + '"/>'; for (i = 0; i < 3; i++) { y = 430 + i * 150; s += '<path d="M0 ' + y + 'C400 ' + (y - 120 + r() * 160) + ' 900 ' + (y + 100 - r() * 160) + ' 1600 ' + (y - 40 + r() * 80) + 'L1600 900L0 900Z" fill="' + P.ink + '" fill-opacity="' + [.3, .6, 1][i] + '"/>'; } }
    else if (p.k == 1) { s += '<circle cx="' + (250 + r() * 1100) + '" cy="230" r="110" fill="' + P.acc + '"/>'; for (i = 0; i < 3; i++) { var x = r() * 1000; s += '<polygon points="' + x + ',900 ' + (x + 350 + r() * 150) + ',' + (280 + i * 110 + r() * 80) + ' ' + (x + 800) + ',900" fill="' + P.ink + '" fill-opacity="' + [.3, .6, 1][i] + '"/>'; } }
    else if (p.k == 2) { for (i = 0; i < 6; i++) { y = 250 + i * 110; s += '<path d="M0 ' + y + 'Q200 ' + (y - 70) + ' 400 ' + y + 'T800 ' + y + 'T1200 ' + y + 'T1600 ' + y + 'V900H0Z" fill="' + (i % 2 ? P.acc : P.ink) + '" fill-opacity="' + (.25 + i * .15) + '"/>'; } }
    else if (p.k == 3) { s += '<circle cx="800" cy="470" r="270" fill="' + P.acc + '"/>'; for (i = 0; i < 6; i++) s += '<rect x="500" y="' + (430 + i * 42) + '" width="600" height="' + (6 + i * 5) + '" fill="' + P.soft + '"/>'; s += '<rect y="690" width="1600" height="210" fill="' + P.ink + '"/>'; }
    else { for (i = 0; i < 40; i++) { var cx = r() * 1600, cy = r() * 900; s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (20 + r() * 90) + '" fill="' + (r() < .3 ? P.acc : P.ink) + '" fill-opacity="' + (.15 + r() * .5) + '"/>'; } }
    return '<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Hero image">' + s + '</svg>';
  }
  function ill(p, P) {
    var r = rng(p.s), s = '<rect width="200" height="200" fill="' + P.soft + '"/>', i, j;
    if (p.k == 0) { for (i = 0; i < 3; i++) { var h = 60 + r() * 60; s += '<path d="M' + (24 + i * 52) + ' 180V' + (180 - h) + 'a24 24 0 0 1 48 0V180Z" fill="' + (i == 1 ? P.acc : P.ink) + '"/>'; } }
    else if (p.k == 1) { s += '<circle cx="100" cy="' + (70 + r() * 20) + '" r="34" fill="' + P.acc + '"/><path d="M0 150Q60 ' + (110 + r() * 20) + ' 120 150T200 140V200H0Z" fill="' + P.ink + '" fill-opacity=".55"/><path d="M0 175Q70 ' + (140 + r() * 20) + ' 140 172T200 165V200H0Z" fill="' + P.ink + '"/>'; }
    else if (p.k == 2) { for (i = 0; i < 5; i++) for (j = 0; j < 5; j++) s += '<circle cx="' + (30 + j * 35) + '" cy="' + (30 + i * 35) + '" r="' + (4 + r() * 11) + '" fill="' + (r() < .3 ? P.acc : P.ink) + '"/>'; }
    else if (p.k == 3) { s += '<path d="M100 185V60" stroke="' + P.ink + '" stroke-width="4"/>'; for (i = 0; i < 4; i++) { var yy = 75 + i * 28, c = i % 2 ? P.acc : P.ink; s += '<ellipse cx="74" cy="' + yy + '" rx="26" ry="11" fill="' + c + '" transform="rotate(-25 74 ' + yy + ')"/><ellipse cx="126" cy="' + yy + '" rx="26" ry="11" fill="' + c + '" transform="rotate(25 126 ' + yy + ')"/>'; } }
    else if (p.k == 4) { for (i = 0; i < 4; i++) { var w = 60 + r() * 100; s += '<rect x="' + (100 - w / 2) + '" y="' + (30 + i * 38) + '" width="' + w + '" height="28" rx="14" fill="' + (i % 2 ? P.acc : P.ink) + '"/>'; } }
    else { s += '<path d="M30 160L100 40L170 160Z" fill="' + P.ink + '"/><circle cx="100" cy="115" r="22" fill="' + P.acc + '"/>'; }
    return '<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration">' + s + '</svg>';
  }
  function genOptions(type, seed, n) {
    var r = rng(seed * 7919 + type.length * 31), out = [];
    for (var i = 0; i < n; i++) {
      var p = { kind: 'svg' };
      if (type == 'logo') { p.mark = r() * MK.length | 0; p.lay = r() < .45 ? 0 : r() < .7 ? 1 : 2; p.up = r() < .3; }
      else { p.k = r() * (type == 'hero' ? 5 : 6) | 0; p.s = r() * 1e6 | 0; }
      out.push(p);
    }
    return out;
  }
  return { esc: esc, rng: rng, hex: hex, lum: lum, sat: sat, onColor: onColor, mix: mix, PALETTES: PALETTES, FONTS: FONTS, logo: logo, hero: hero, ill: ill, genOptions: genOptions };
})();
