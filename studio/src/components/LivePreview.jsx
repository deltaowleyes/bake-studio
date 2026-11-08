/* LivePreview: the real generated page in a frame, for EXPRESS, IndigiHub and BAKER (PRO uses screenshots).
   Each screen size is a same-origin iframe drawn at its real width and scaled to fit. The page is written
   into the frame once and then updated in place, so typing doesn't flash. With onPart, clicking a
   section, item, text or picture inside the frame opens the same editor as the screenshot overlays.
   Links in the preview don't navigate. "View code" shows the complete page file (lib/site.js). */
import { useEffect, useRef, useState } from 'react';
import { Render } from '../lib/render.js';
import { Site, fontLink } from '../lib/site.js';
import siteCss from '../lib/site.css?raw';
import { S, useStudio } from '../store.js';
import { VPW, VPN } from '../edit.js';
import { partName } from './Preview.jsx';

const SHELL = '<!DOCTYPE html><html><head><meta charset="utf-8"><link id="gf" rel="stylesheet"><style>body{margin:0}' + siteCss +
  '</style><style id="ed"></style></head><body><div class="cq" id="cq"></div></body></html>';
const EDIT_CSS = '[data-sec],[data-ii],[data-fk]{cursor:pointer}[data-sec]:hover{outline:2px dashed rgba(37,99,235,.55);outline-offset:-2px}' +
  '[data-ii]:hover,[data-fk]:hover{outline:2px solid rgba(37,99,235,.8);outline-offset:1px}';

/* What was clicked, in the same shape as a box-map box (ARCHITECTURE.md §5.1). */
function partAt(el) {
  const sec = el.closest('[data-sec]'); if (!sec) return null;
  const fkEl = el.closest('[data-fk]'), it = el.closest('[data-ii]');
  const item = it && sec.contains(it) ? it : null, fk = fkEl && sec.contains(fkEl) ? fkEl : null;
  const base = { sectionId: sec.dataset.sec, sectionType: sec.dataset.type, sectionIndex: +sec.dataset.si, itemIndex: item ? +item.dataset.ii : null, field: null };
  if (fk) return Object.assign(base, { type: /^(img|svg)$/i.test(fk.tagName) ? 'image' : 'text', field: fk.dataset.fk, itemIndex: item && item.contains(fk) ? +item.dataset.ii : null });
  if (item) return Object.assign(base, { type: 'item' });
  return Object.assign(base, { type: 'section' });
}

function Frame({ v, html, onPart, showName }) {
  const wrap = useRef(null), frame = useRef(null), cb = useRef(onPart);
  const [scale, setScale] = useState(1), [h, setH] = useState(600), [ready, setReady] = useState(false);
  const w = VPW[v];
  cb.current = onPart;

  useEffect(() => {   // fit the frame to the space available
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / w)));
    ro.observe(el); return () => ro.disconnect();
  }, [w]);

  function onLoad() {
    const doc = frame.current && frame.current.contentDocument; if (!doc) return;
    const RO = frame.current.contentWindow.ResizeObserver;
    new RO(() => setH(doc.documentElement.scrollHeight)).observe(doc.body);
    doc.addEventListener('click', e => {
      const a = e.target.closest('a,summary');
      if (a && a.tagName == 'A') e.preventDefault();   // preview only: links don't leave the studio
      if (!cb.current) return;
      if (a && a.tagName == 'SUMMARY' && !e.target.closest('[data-fk]')) return;   // let menus open and close
      const b = partAt(e.target); if (b) { e.preventDefault(); cb.current(b); }
    });
    doc.addEventListener('mouseover', e => { const b = cb.current && partAt(e.target); frame.current.title = b ? 'Edit ' + partName(b) : ''; });
    setReady(true);
  }

  useEffect(() => {   // write the latest page into the frame
    const doc = ready && frame.current && frame.current.contentDocument; if (!doc) return;
    const fl = fontLink(html), link = doc.getElementById('gf');
    if (fl && link.getAttribute('href') != fl) link.setAttribute('href', fl);
    doc.getElementById('ed').textContent = onPart ? EDIT_CSS : '';
    doc.getElementById('cq').innerHTML = html;
    setH(doc.documentElement.scrollHeight);
  }, [html, ready, !!onPart]);

  return (
    <figure className="shot" style={{ margin: 0 }}>
      {showName && <figcaption>{VPN[v]}</figcaption>}
      <div ref={wrap} className="livew" style={{ maxWidth: w, height: Math.ceil(h * scale) }}>
        <iframe ref={frame} srcDoc={SHELL} onLoad={onLoad} title={VPN[v] + ' preview of the page'}
          style={{ width: w, height: h, transform: 'scale(' + scale + ')' }} />
      </div>
    </figure>
  );
}

function CodeView({ opt }) {
  const [open, setOpen] = useState(false), [copied, setCopied] = useState(false);
  const code = open ? Site.html(S, opt.tpl || S.tpl.pick || 'news-a', { pageId: opt.pageId || S.ui.page }) : '';
  function copy() {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, done); else done();
  }
  return (
    <details className="code" onToggle={e => setOpen(e.currentTarget.open)}>
      <summary>View code</summary>
      {open && <>
        <p className="mu small">This is the complete page file, the same one that gets published. {Math.round(code.length / 1024)} KB.</p>
        <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy code'}</button>
        <pre tabIndex={0}><code>{code}</code></pre>
      </>}
    </details>
  );
}

/** Same props as Preview: vp ('desktop' | 'tablet' | 'phone' | 'all'), opt, onPart, hint. */
export default function LivePreview({ vp, opt = {}, onPart, hint = '' }) {
  useStudio();
  const html = Render.page(S, opt.tpl || S.tpl.pick || 'news-a', { pageId: opt.pageId || S.ui.page, sel: opt.sel, openMenu: opt.openMenu });
  const vps = vp == 'all' ? ['desktop', 'tablet', 'phone'] : [vp];
  const label = vp == 'all' ? 'The live page at 1280, 820 and 390 px wide.' : VPN[vp] + ' view, ' + VPW[vp] + ' px wide, live.' + (onPart ? ' Click any text or section to style it in the inspector, or a picture to crop and frame it.' : hint);
  return (
    <div className="stage live">
      <div className={'shots' + (vp == 'all' ? ' all' : '')}>
        {vps.map(v => <Frame key={v} v={v} html={html} onPart={onPart} showName={vp == 'all'} />)}
      </div>
      <p className="vlab">{label}</p>
      <CodeView opt={opt} />
    </div>
  );
}
