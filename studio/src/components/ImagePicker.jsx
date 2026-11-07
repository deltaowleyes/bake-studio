/* The "Choose an image" dialog used by step 3 image fields. pick = { path, k } or null. */
import { useEffect, useRef, useState } from 'react';
import { Render } from '../lib/render.js';
import { S, commit } from '../store.js';
import { nid, shrink, target } from '../edit.js';
import Html from './Html.jsx';

export default function ImagePicker({ pick, onClose }) {
  const dlg = useRef(null), [q, setQ] = useState('');
  useEffect(() => { const d = dlg.current; if (pick && !d.open) { setQ(''); d.showModal(); } if (!pick && d.open) d.close(); }, [pick]);

  function choose(v) {
    commit(() => {
      const o = target(pick.path); if (!o) return;
      if (v == 'none') o[pick.k] = null;
      else if (v == 'hero') o[pick.k] = { kind: 'hero' };
      else if (v.indexOf('ill:') == 0) o[pick.k] = { kind: 'ill', i: +v.slice(4) };
      else o[pick.k] = { kind: 'img', src: v.slice(4) };
    });
    onClose();
  }
  function upload(e) {
    const f = e.target.files[0]; if (!f) return;
    shrink(f, 1600).then(src => { commit(() => S.brand.opts.ill.push({ id: nid('o'), kind: 'img', src, from: 'upload', label: f.name })); choose('src:' + src); });
  }

  const ups = [];
  if (pick) ['logo', 'hero', 'ill'].forEach(t => S.brand.opts[t].forEach(o => { if (o.from == 'upload' || (o.from == 'ai' && o.kind == 'img')) ups.push(o); }));
  const ql = q.toLowerCase(), lib = pick ? S.lib.filter(l => !ql || (l.label + ' ' + l.src).toLowerCase().indexOf(ql) >= 0).slice(0, 160) : [];

  return (
    <dialog id="picker" ref={dlg} aria-labelledby="pkh" onClose={onClose}>
      <div className="pkhead"><h3 id="pkh">Choose an image</h3><button aria-label="Close" onClick={onClose}>✕</button></div>
      {pick && (
        <div id="pkbody">
          <h4>Brand images</h4>
          <div className="pk-grid">
            <button className="pk" onClick={() => choose('none')}><span className="mu">No image</span></button>
            <button className="pk" onClick={() => choose('hero')}><Html html={Render.imageRef(S, { kind: 'hero' })} className="contents" /><small>Hero image</small></button>
            {[0, 1, 2].map(i => <button key={i} className="pk" onClick={() => choose('ill:' + i)}><Html html={Render.imageRef(S, { kind: 'ill', i })} className="contents" /><small>Illustration {i + 1}</small></button>)}
          </div>
          <h4>Your uploads</h4>
          <div className="row"><label className="filebtn">Upload an image<input type="file" accept="image/*" onChange={upload} /></label></div>
          {ups.length > 0 && <div className="pk-grid">{ups.map(o => <button key={o.id} className="pk" onClick={() => choose('src:' + o.src)}><img src={o.src} alt="" /><small>{o.label || ''}</small></button>)}</div>}
          {S.lib.length > 0 && <>
            <h4>From your website ({S.lib.length})</h4>
            <input placeholder="Search by name" aria-label="Search images" value={q} onChange={e => setQ(e.target.value)} />
            <div className="pk-grid">{lib.map(l => <button key={l.id} className="pk" onClick={() => choose('src:' + l.src)}><img loading="lazy" src={l.src} alt="" /><small>{l.label}</small></button>)}</div>
          </>}
        </div>
      )}
    </dialog>
  );
}
