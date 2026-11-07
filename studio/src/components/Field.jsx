/* One editor field (used by step 3's editor and the Inspector). */
import { Render } from '../lib/render.js';
import { S, commit } from '../store.js';
import { fieldId } from '../edit.js';
import Html from './Html.jsx';

/** f = [key, label, kind?, options?]; obj = the thing being edited; path = 'sec' | 'item:N' | 'footer'.
    idp prefixes the element id when the same field appears twice on screen (the Inspector uses 'i'). */
export default function Field({ f, obj, path, openPicker, openEditor, idp = '' }) {
  const [k, lab, kind = 'text'] = f, id = idp + fieldId(path, k);
  const set = v => commit(() => { obj[k] = v; });
  if (kind == 'pick') {
    const im = obj[k];
    return <>
      <label>{lab}</label>
      <div className="pickf">
        {im === null ? <span className="pv-th"><span className="mu">No image</span></span>
          : im === undefined ? <span className="pv-th"><span className="mu">Template default</span></span>
          : <Html className="pv-th" html={Render.imageRef(S, im, 0)} />}
        <button className="sm" data-pick={path} onClick={() => openPicker(path, k)}>Choose image</button>
        {openEditor && im !== null && <button className="sm" onClick={() => openEditor(path, k)}>Crop and frame</button>}
        {im && <button className="sm" onClick={() => set(null)}>Remove</button>}
      </div>
    </>;
  }
  const v = obj[k] == null ? '' : obj[k];
  if (kind == 'chk') return <label className="ck"><input type="checkbox" id={id} checked={!!v} onChange={e => set(e.target.checked)} /> {lab}</label>;
  if (kind == 'sel') return <>
    <label htmlFor={id}>{lab}</label>
    <select id={id} value={String(v === '' ? f[3][0][0] : v)} onChange={e => set(k == 'cols' ? +e.target.value : e.target.value)}>
      {f[3].map(o => <option key={o[0]} value={o[0]}>{o[1]}</option>)}
    </select>
  </>;
  if (kind == 'area') return <><label htmlFor={id}>{lab}</label><textarea id={id} rows={3} value={v} onChange={e => set(e.target.value)} /></>;
  return <><label htmlFor={id}>{lab}</label><input id={id} value={v} onChange={e => set(e.target.value)} /></>;
}

