/* Image editor (step 3): opens when an image in the preview is clicked.
   Crop tab: Cropper.js; the result is saved as a ready-made picture (ref.cropSrc) plus the crop box (ref.crop).
   Frame tab: border width/style/colour, corner radius, shadow, mat, tilt and artistic frames (ref.frame).
   Every change goes into S, so the preview screenshot is re-made automatically. */
import { useEffect, useRef, useState } from 'react';
import 'cropperjs/dist/cropper.css';
import { Render } from '../lib/render.js';
import { S, commit, useStudio } from '../store.js';
import { target, imageDefault } from '../edit.js';
import { Num, Sel } from './Inspector.jsx';
import ColourPicker from './ColourPicker.jsx';
import Html from './Html.jsx';

const ASPECTS = [['slot', 'Fits this spot'], ['free', 'Free'], ['1', '1:1'], ['4/3', '4:3'], ['3/2', '3:2'], ['16/9', '16:9'], ['3/4', '3:4']];
const SHADOW_OPTS = [['', 'Frame default'], ['none', 'None'], ['soft', 'Soft'], ['medium', 'Medium'], ['strong', 'Strong'], ['offset', 'Offset block (accent)'], ['hard', 'Hard edge (dark)'], ['glow', 'Glow (accent)']];
const ratio = (a, slot) => (a == 'free' ? NaN : a == 'slot' ? slot : a.split('/').reduce((x, y) => x / y));
const unescape = s => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; };

/* Make any picture loadable by Cropper and exportable from a canvas: generated SVGs become large SVG data URLs,
   web images are downloaded first (if their site allows it). */
async function loadable(html) {
  if (/^<svg/.test(html)) {
    const vb = /viewBox="([^"]+)"/.exec(html), d = vb ? vb[1].trim().split(/[\s,]+/).map(Number) : [0, 0, 800, 600];
    const k = Math.max(1, 1600 / Math.max(d[2], d[3]));
    let svg = html.replace(/^<svg\b/, '<svg width="' + Math.round(d[2] * k) + '" height="' + Math.round(d[3] * k) + '"');
    if (!/^<svg[^>]*xmlns=/.test(svg)) svg = svg.replace(/^<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
    return { url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) };
  }
  const m = /src="([^"]+)"/.exec(html); if (!m) throw new Error('no picture');
  const src = unescape(m[1]);
  if (/^(data|blob):/.test(src)) return { url: src };
  const r = await fetch(src); if (!r.ok) throw new Error('blocked');
  return { url: URL.createObjectURL(await r.blob()), own: true };
}

/* A small piece of the generated-site look (site.css applies inside .pv) to preview frames in the studio. */
function FramePreview({ html, className = '', boxStyle }) {
  const p = S.brand.pal;
  return (
    <div className={'pv rounded-lg ' + className} style={{ '--bg': p.bg, '--ink': p.ink, '--acc': p.acc, '--soft': p.soft, '--r': '8px', minHeight: 0, background: p.bg }}>
      <Html as="div" className="fprev" style={boxStyle} html={html} />
    </div>
  );
}

export default function ImageEditor({ edit, onClose, onReplace }) {
  useStudio();
  const dlg = useRef(null), imgEl = useRef(null), cropper = useRef(null);
  const [tab, setTab] = useState('crop'), [src, setSrc] = useState(null), [err, setErr] = useState(''), [aspect, setAspect] = useState('slot'), [note, setNote] = useState('');
  const obj = edit ? target(edit.path) : null;
  const ref = obj ? (obj[edit.k] === undefined ? imageDefault(edit.type, edit.item) : obj[edit.k]) : null;
  const slot = edit && edit.box && edit.box.height ? edit.box.width / edit.box.height : 16 / 9;
  const raw = edit && ref ? Render.imageRaw(S, ref, edit.item || 0) : '';

  useEffect(() => {
    const d = dlg.current;
    if (edit && !d.open) { d.showModal(); setTab('crop'); setNote(''); setAspect((ref && ref.crop && ref.crop.aspect) || 'slot'); }
    if (!edit && d.open) d.close();
  }, [edit]); // eslint-disable-line react-hooks/exhaustive-deps

  /* load the original picture whenever a different image is opened */
  useEffect(() => {
    if (!edit || !raw) { setSrc(null); return; }
    let live = true, own = null; setErr(''); setSrc(null);
    loadable(raw).then(r => { if (live) { if (r.own) own = r.url; setSrc(r.url); } else if (r.own) URL.revokeObjectURL(r.url); })
      .catch(() => { if (live) setErr('This picture’s website doesn’t allow it to be edited here. You can still add a frame, or use Replace image to upload your own copy.'); });
    return () => { live = false; if (own) URL.revokeObjectURL(own); };
  }, [edit && edit.path, edit && edit.k, raw]); // eslint-disable-line react-hooks/exhaustive-deps

  /* start Cropper.js on the picture (loaded on demand) */
  useEffect(() => {
    if (!src || tab != 'crop' || !imgEl.current) return;
    let c = null, live = true;
    import('cropperjs').then(({ default: Cropper }) => {
      if (!live || !imgEl.current) return;
      c = cropper.current = new Cropper(imgEl.current, {
        viewMode: 1, dragMode: 'move', autoCropArea: 1, background: false, responsive: true, aspectRatio: ratio(aspect, slot),
        ready() {
          const cr = ref && ref.crop; if (!cr) return;
          const d = c.getImageData();
          if (cr.rotate) c.rotateTo(cr.rotate);
          c.setData({ x: cr.x * d.naturalWidth, y: cr.y * d.naturalHeight, width: cr.w * d.naturalWidth, height: cr.h * d.naturalHeight });
        }
      });
    });
    return () => { live = false; if (c) c.destroy(); cropper.current = null; };
  }, [src, tab]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (cropper.current) cropper.current.setAspectRatio(ratio(aspect, slot)); }, [aspect, slot]);

  const save = r => commit(() => { obj[edit.k] = r; });
  function applyCrop() {
    const c = cropper.current; if (!c) return;
    try {
      const d = c.getData(true), id = c.getImageData();
      const cv = c.getCroppedCanvas({ maxWidth: 1600, maxHeight: 1600, minWidth: Math.min(900, d.width * 3), imageSmoothingQuality: 'high' });
      const url = cv.toDataURL('image/webp', .86);
      save(Object.assign({}, ref, { crop: { x: d.x / id.naturalWidth, y: d.y / id.naturalHeight, w: d.width / id.naturalWidth, h: d.height / id.naturalHeight, rotate: d.rotate || 0, aspect }, cropSrc: url }));
      setNote('Crop applied. The preview is updating.');
    } catch (e) { setErr('This picture couldn’t be cropped because its website blocks it. Use Replace image to upload your own copy.'); }
  }
  function removeCrop() { const r = Object.assign({}, ref); delete r.crop; delete r.cropSrc; save(r); setNote('Crop removed.'); }

  const fr = (ref && ref.frame) || {};
  function setF(p, v) {
    const r = Object.assign({}, ref), f = Object.assign({}, r.frame);
    if (v === '' || v == null) delete f[p]; else f[p] = v;
    if (Object.keys(f).length) r.frame = f; else delete r.frame;
    save(r);
  }
  function frameAll() {
    const s = S.pages.flatMap(p => p.sections).filter(x => x.items && x.items.indexOf(obj) >= 0)[0]; if (!s) return;
    commit(() => s.items.forEach((it, i) => {
      const r = it.image === undefined ? imageDefault(s.type, i) : it.image; if (!r) return;
      const n = Object.assign({}, r); if (ref.frame) n.frame = Object.assign({}, ref.frame); else delete n.frame; it.image = n;
    }));
    setNote('Frame copied to every image in this section.');
  }
  const isItem = edit && /^item:/.test(edit.path);
  const shown = ref ? Render.imageRef(S, ref, (edit && edit.item) || 0) : '';

  return (
    <dialog ref={dlg} onClose={onClose} aria-labelledby="ieh" className="m-auto w-[min(1100px,96vw)] max-h-[94vh] overflow-hidden rounded-2xl border border-line bg-panel p-0 text-ink backdrop:bg-black/50">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <h2 id="ieh" className="m-0 text-lg">Edit image</h2>
        <div className="flex flex-wrap gap-2" role="tablist">
          {[['crop', 'Crop'], ['frame', 'Border and frame']].map(([k, n]) => <button key={k} type="button" role="tab" className="sm" aria-selected={tab == k} aria-pressed={tab == k} onClick={() => setTab(k)}>{n}</button>)}
          <button type="button" className="sm" onClick={() => onReplace(edit.path, edit.k)}>Replace image</button>
          <button type="button" className="ib" aria-label="Close" onClick={onClose}>✕</button>
        </div>
      </div>
      {edit && !ref && <div className="p-5"><p>This spot has no image.</p><button className="pri" onClick={() => onReplace(edit.path, edit.k)}>Choose an image</button></div>}
      {edit && ref && (
        <div className="grid max-h-[calc(94vh-64px)] gap-5 overflow-auto p-5 md:grid-cols-[minmax(0,1fr)_320px]">
          {tab == 'crop' ? <>
            <div className="min-w-0">
              <div className="h-[min(60vh,540px)] overflow-hidden rounded-xl bg-black/80">
                {src ? <img ref={imgEl} src={src} alt="Picture to crop" className="block max-w-full" /> : <p className="p-4 text-white/80">{err || 'Loading the picture…'}</p>}
              </div>
              {err && src && <p className="errmsg mt-2" role="alert">{err}</p>}
            </div>
            <div>
              <h3 className="mt-0 text-base">Shape</h3>
              <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Crop shape">
                {ASPECTS.map(([k, n]) => <button key={k} type="button" className="sm" aria-pressed={aspect == k} onClick={() => setAspect(k)}>{n}{k == 'slot' && edit.box ? ' (' + Math.round(edit.box.width) + '×' + Math.round(edit.box.height) + ')' : ''}</button>)}
              </div>
              <p className="text-sm text-muted">“Fits this spot” matches the space the template gives this picture, so nothing else gets cut off. Drag the picture or the box; scroll or pinch to zoom.</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <button type="button" className="sm" onClick={() => cropper.current && cropper.current.zoom(0.1)}>Zoom in</button>
                <button type="button" className="sm" onClick={() => cropper.current && cropper.current.zoom(-0.1)}>Zoom out</button>
                <button type="button" className="sm" onClick={() => cropper.current && cropper.current.rotate(-90)}>Rotate ⟲</button>
                <button type="button" className="sm" onClick={() => cropper.current && cropper.current.rotate(90)}>Rotate ⟳</button>
                <button type="button" className="sm" onClick={() => cropper.current && cropper.current.reset()}>Reset</button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="pri" disabled={!src} onClick={applyCrop}>Apply crop</button>
                {ref.cropSrc && <button type="button" onClick={removeCrop}>Remove crop</button>}
              </div>
              {ref.kind != 'img' && <p className="mt-3 text-xs text-muted">This is generated artwork. If you change your colours later, crop it again to pick up the new colours.</p>}
              {note && <p className="okmsg mt-3" role="status">{note}</p>}
            </div>
          </> : <>
            <div className="min-w-0">
              <FramePreview html={shown} boxStyle={{ width: '100%', aspectRatio: String(slot), padding: 36, boxSizing: 'border-box' }} />
              <h3 className="mt-5 mb-2 text-base">Frames</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(118px,1fr))] gap-2.5">
                {[['', 'Plain']].concat(Object.entries(Render.FRAMES)).map(([k, n]) => (
                  <button key={k || 'none'} type="button" aria-pressed={(fr.art || '') == k} onClick={() => setF('art', k)} className="flex h-auto flex-col items-stretch gap-1.5 p-2">
                    <FramePreview html={Render.decorate(raw, { frame: k ? { art: k } : null })} boxStyle={{ height: 78, padding: 10, boxSizing: 'border-box' }} />
                    <span className="text-sm">{n}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mt-0 text-base">Border</h3>
              <Num id="ie-bw" label="Width" unit="px" min={0} max={40} value={fr.bw ?? ''} dflt={0} onChange={v => setF('bw', v)} />
              <Sel id="ie-bs" label="Style" value={fr.bs || ''} onChange={v => setF('bs', v)} options={[['', 'Frame default']].concat(Render.BSTYLES.map(s => [s, s[0].toUpperCase() + s.slice(1)]))} />
              <ColourPicker label="Border colour" value={fr.bc || ''} onChange={v => setF('bc', v)} />
              <Num id="ie-br" label="Corner radius" unit="px" min={0} max={200} value={fr.br ?? ''} dflt={8} onChange={v => setF('br', v)} />
              <Sel id="ie-sh" label="Shadow" value={fr.sh || ''} onChange={v => setF('sh', v)} options={SHADOW_OPTS} />
              <h3 className="mt-4 text-base">Mat and tilt</h3>
              <Num id="ie-pad" label="Mat (space inside the border)" unit="px" min={0} max={60} value={fr.pad ?? ''} dflt={0} onChange={v => setF('pad', v)} />
              <ColourPicker label="Mat colour" value={fr.bg || ''} onChange={v => setF('bg', v)} />
              <Num id="ie-tilt" label="Tilt" unit="°" min={-10} max={10} step={0.5} value={fr.tilt ?? ''} dflt={0} onChange={v => setF('tilt', v)} />
              <div className="mt-2 flex flex-wrap gap-2">
                {ref.frame && <button type="button" onClick={() => { const r = Object.assign({}, ref); delete r.frame; save(r); }}>Remove frame</button>}
                {isItem && <button type="button" onClick={frameAll}>Use on all images in this section</button>}
              </div>
              {note && <p className="okmsg mt-3" role="status">{note}</p>}
            </div>
          </>}
        </div>
      )}
    </dialog>
  );
}
