/* Google Fonts picker: the full catalogue (about 1,900 families), searchable, filterable by category.
   Each visible name is shown in its own font (only the letters of the name are downloaded). */
import { useEffect, useState } from 'react';
import { fontList, previewFont, previewName, CATEGORY } from '../lib/fonts.js';

const POPULAR = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito', 'Work Sans', 'DM Sans', 'Raleway', 'Source Sans 3', 'Space Grotesk', 'Playfair Display', 'Merriweather', 'Lora', 'Libre Baskerville', 'Source Serif 4', 'EB Garamond', 'DM Serif Display', 'Oswald', 'Bebas Neue', 'Archivo Black', 'Caveat', 'Pacifico', 'JetBrains Mono'];
const SHOW = 60;

function Row({ f, on, pick }) {
  useEffect(() => { previewFont(f[0]); }, [f]);
  return (
    <li>
      <button type="button" role="option" aria-selected={on} onClick={() => pick(f)}
        className={'flex w-full min-h-10 items-center justify-between gap-2 rounded-lg border-0 px-2.5 py-1.5 text-left ' + (on ? 'bg-acc text-onacc' : 'bg-transparent')}>
        <span className="truncate text-lg" style={{ fontFamily: "'" + previewName(f[0]) + "', system-ui" }}>{f[0]}</span>
        <small className={on ? '' : 'text-muted'}>{CATEGORY[f[1]]}</small>
      </button>
    </li>
  );
}

/** value: family name or ''. onChange(family, categoryCode) — ('', '') means "use the default". */
export default function FontPicker({ label, value, onChange, defaultLabel = 'Default' }) {
  const [open, setOpen] = useState(false), [list, setList] = useState(null), [q, setQ] = useState(''), [cat, setCat] = useState('');
  useEffect(() => { if (open && !list) fontList().then(setList); }, [open, list]);
  useEffect(() => { if (value) previewFont(value); }, [value]);
  const pick = f => { onChange(f ? f[0] : '', f ? f[1] : ''); setOpen(false); };

  let shown = [], total = 0;
  if (list) {
    const ql = q.trim().toLowerCase();
    const all = list.filter(f => (!cat || f[1] == cat) && (!ql || f[0].toLowerCase().indexOf(ql) >= 0));
    total = all.length;
    if (!ql && !cat) { const pop = POPULAR.map(n => list.find(f => f[0] == n)).filter(Boolean); shown = pop.concat(all.filter(f => POPULAR.indexOf(f[0]) < 0)); }
    else shown = all.sort((a, b) => (a[0].toLowerCase().indexOf(ql) != 0) - (b[0].toLowerCase().indexOf(ql) != 0));
    shown = shown.slice(0, SHOW);
  }
  return (
    <div className="mb-3">
      <label className="mt-0">{label}</label>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-2 text-left">
        <span className="truncate text-lg" style={value ? { fontFamily: "'" + previewName(value) + "', system-ui" } : null}>{value || defaultLabel}</span>
        <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-line bg-panel p-2">
          <input autoFocus placeholder="Search 1,900 Google Fonts" aria-label="Search fonts" value={q} onChange={e => setQ(e.target.value)} className="min-h-9" />
          <div className="my-2 flex flex-wrap gap-1" role="group" aria-label="Category">
            {[['', 'All']].concat(Object.entries(CATEGORY)).map(([k, n]) => <button key={k} type="button" className="sm" aria-pressed={cat == k} onClick={() => setCat(k)}>{n}</button>)}
          </div>
          <ul role="listbox" aria-label={label} className="m-0 max-h-72 list-none overflow-auto p-0">
            <li><button type="button" role="option" aria-selected={!value} onClick={() => pick(null)} className={'w-full min-h-10 rounded-lg border-0 px-2.5 text-left ' + (!value ? 'bg-acc text-onacc' : 'bg-transparent')}>{defaultLabel}</button></li>
            {!list ? <li className="p-2 text-muted">Loading fonts…</li> : shown.map(f => <Row key={f[0]} f={f} on={value == f[0]} pick={pick} />)}
          </ul>
          {list && <p className="mt-1.5 mb-0 text-xs text-muted">{total > SHOW ? 'Showing ' + SHOW + ' of ' + total + '. Search to narrow it down.' : total + ' fonts'}{!q && !cat ? '. Popular fonts first.' : ''}</p>}
        </div>
      )}
    </div>
  );
}
