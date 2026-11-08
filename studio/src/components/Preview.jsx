/* Preview: PRO shows full-page screenshots of the generated site, plus optional see-through click
   targets placed from Shot's box map (ARCHITECTURE.md §5.1). EXPRESS, IndigiHub and BAKER show the
   real page live in a frame (LivePreview.jsx), with the same click-to-edit and a View code panel. */
import { useEffect, useState } from 'react';
import { livePreview } from '../editions.js';
import LivePreview from './LivePreview.jsx';
import { Render } from '../lib/render.js';
import { Shot } from '../lib/shot.js';
import { S, useStudio } from '../store.js';
import { VPW, VPN, FIELDS, ITEMF, FOOTER_F } from '../edit.js';

export function fieldDef(b) {
  const list = b.sectionType == 'footer' ? FOOTER_F : b.itemIndex != null ? ITEMF[b.sectionType] || [] : FIELDS[b.sectionType] || [];
  return list.filter(f => f[0] == b.field)[0];
}
export function partName(b) {
  if (b.type == 'section') return b.sectionType == 'footer' ? 'Footer' : Render.SECTION_TYPES[b.sectionType] || 'Section';
  if (b.type == 'item') return 'Item ' + (b.itemIndex + 1);
  const f = fieldDef(b);
  return f ? f[1] : b.type == 'image' ? 'Image' : 'Text';
}
/* box maps of the editable preview's current screenshots (test hook: BAKE.maps()) */
let editMaps = [];
export const getEditMaps = () => editMaps;
const pc = (v, t) => (v / t * 100).toFixed(3) + '%';

function Overlays({ map, onPart }) {
  return (
    <div className="ovl">
      {map.boxes.map((b, j) => {
        const lab = partName(b), isSec = b.type == 'section';
        return (
          <button key={j} type="button" className={'ov ov-' + b.type} data-lab={lab}
            aria-label={'Edit ' + lab + (isSec ? '' : ' in ' + partName({ type: 'section', sectionType: b.sectionType }))}
            tabIndex={isSec ? 0 : -1} onClick={() => onPart(b)}
            style={{ left: pc(b.x, map.width), top: pc(b.y, map.height), width: pc(b.width, map.width), height: pc(b.height, map.height) }} />
        );
      })}
    </div>
  );
}

/** vp: 'desktop' | 'tablet' | 'phone' | 'all'. opt: { tpl, pageId, sel, openMenu }. onPart: makes boxes clickable. */
export default function Preview(props) {
  useStudio();
  return livePreview(S) ? <LivePreview {...props} /> : <ShotPreview {...props} />;
}

function ShotPreview({ vp, opt = {}, onPart, hint = '' }) {
  useStudio();
  const html = Render.page(S, opt.tpl || S.tpl.pick || 'news-a', { pageId: opt.pageId || S.ui.page, sel: opt.sel, openMenu: opt.openMenu });
  const [shots, setShots] = useState(null), [busy, setBusy] = useState(true), [err, setErr] = useState('');

  useEffect(() => {
    let live = true; setBusy(true);
    const vps = vp == 'all' ? ['desktop', 'tablet', 'phone'] : [vp];
    const t = setTimeout(() => {   // wait for typing to pause, as before (120 ms)
      Promise.all(vps.map(v => Shot.take(html, VPW[v], { scale: v == 'desktop' ? 1 : 2 })))
        .then(res => { if (live) { if (onPart) editMaps = res.map(r => r.map); setShots({ vp, vps, res }); setErr(''); setBusy(false); } })
        .catch(e => { if (live) { setErr('The preview couldn’t be made (' + ((e && e.message) || 'unknown problem') + ').'); setBusy(false); } });
    }, 120);
    return () => { live = false; clearTimeout(t); };
  }, [html, vp]);

  const label = err || (!shots ? 'Making preview…' : shots.vp == 'all' ? 'Full-page screenshots at 1280, 820 and 390 px wide.' : VPN[shots.vp] + ' screenshot, ' + VPW[shots.vp] + ' px wide, full page.' + hint);
  return (
    <div className={'stage' + (busy ? ' busy' : '')}>
      <div className={'shots' + (shots && shots.vp == 'all' ? ' all' : '')}>
        {shots && shots.res.map((r, i) => (
          <figure className="shot" key={shots.vps[i]}>
            {shots.vp == 'all' && <figcaption>{VPN[shots.vps[i]]}</figcaption>}
            <div className="shotw" style={{ maxWidth: r.w }}>
              <img src={r.url} alt={VPN[shots.vps[i]] + ' screenshot of the whole page'} />
              {onPart && r.map && <Overlays map={r.map} onPart={onPart} />}
            </div>
          </figure>
        ))}
      </div>
      <p className="vlab">{label}</p>
    </div>
  );
}

/** Buttons to choose the preview size; k is the S.ui key ('vp' or 'tvp'). */
export function SizeButtons({ k, onPick }) {
  useStudio();
  const list = (k == 'tvp' ? ['all'] : []).concat(Object.keys(VPW));
  return (
    <div className="row vps">
      {list.map(v => (
        <button key={v} aria-pressed={S.ui[k] == v} onClick={() => onPick(v)}>{v == 'all' ? 'All sizes' : VPN[v]}</button>
      ))}
    </div>
  );
}
