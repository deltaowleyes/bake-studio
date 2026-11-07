/* Inspector: the right-hand sidebar in step 3. Opens when a section or text in the preview is clicked.
   Tabs: Text (content + font, size, weight, spacing, colour), Section (padding, width, height, gaps,
   alignment, colours, layout), Page (drag to reorder sections), Site (Google Fonts for the whole site). */
import { useEffect, useState } from 'react';
import { Art } from '../lib/art.js';
import { Render } from '../lib/render.js';
import { fontList, fontInfo, nearest } from '../lib/fonts.js';
import { S, commit, useStudio } from '../store.js';
import { SEC, cur, FIELDS, F_COMMON } from '../edit.js';
import { fieldDef } from './Preview.jsx';
import ColourPicker from './ColourPicker.jsx';
import FontPicker from './FontPicker.jsx';
import SortableList from './SortableList.jsx';
import Field from './Field.jsx';

const ALL_W = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const WN = { 100: 'Thin', 200: 'Extra light', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold', 800: 'Extra bold', 900: 'Black' };
const LAYOUT_KEYS = ['layout', 'style', 'cols', 'showImg'];
const WIDTHS = [['', 'Template default'], ['720', 'Narrow (720 px)'], ['960', 'Medium (960 px)'], ['1200', 'Standard (1200 px)'], ['1440', 'Wide (1440 px)'], ['full', 'Full width']];

/** A number with a slider. value '' = template default (dflt positions the slider). */
function Num({ id, label, value, onChange, min, max, step = 1, unit, dflt }) {
  const has = value !== '' && value != null;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="m-0">{label}</label>
        <span className="flex items-center gap-1">
          <input id={id} type="number" inputMode="decimal" min={min} max={max} step={step} placeholder="Auto" value={has ? value : ''}
            onChange={e => onChange(e.target.value === '' ? '' : +e.target.value)} className="w-20 min-h-8 px-2 py-1 text-right" />
          {unit && <small className="w-5 text-muted">{unit}</small>}
          {has && <button type="button" className="ib min-h-8" aria-label={'Reset ' + label} title="Back to default" onClick={() => onChange('')}>↺</button>}
        </span>
      </div>
      <input type="range" aria-label={label + ' slider'} min={min} max={max} step={step} value={has ? value : dflt}
        onChange={e => onChange(+e.target.value)} className={'mt-1 w-full min-h-0 p-0 ' + (has ? '' : 'opacity-50')} />
    </div>
  );
}
function Sel({ id, label, value, onChange, options }) {
  return <div className="mb-3"><label htmlFor={id} className="mt-0">{label}</label>
    <select id={id} value={value == null ? '' : String(value)} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o[0]} value={o[0]}>{o[1]}</option>)}</select></div>;
}
/* set or clear one property of a nested override object (s.fx[key] or s.lx) */
function setProp(host, bag, key, prop, v) {
  commit(() => {
    host[bag] = host[bag] || {};
    const x = key ? (host[bag][key] = host[bag][key] || {}) : host[bag];
    if (v === '' || v == null || v === false) delete x[prop]; else x[prop] = v;
    if (key && !Object.keys(x).length) delete host[bag][key];
    if (!Object.keys(host[bag]).length) delete host[bag];
  });
}
function secName(s) { return s ? (s.title || s.headline || Render.SECTION_TYPES[s.type]) : 'Footer'; }

export default function Inspector({ openPicker }) {
  useStudio();
  const I = S.ui.insp, footer = S.ui.sel == 'footer', s = footer ? null : cur();
  const [, setReady] = useState(0);
  useEffect(() => { fontList().then(() => setReady(1)); }, []);   // so weight lists know each font's weights
  useEffect(() => {
    const k = e => { if (e.key == 'Escape' && !document.querySelector('dialog[open]')) close(); };
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, []);
  function close() { commit(S => { S.ui.insp.open = false; }); }
  const tab = I.tab == 'text' && !I.key ? 'section' : I.tab;
  const setTab = t => commit(S => { S.ui.insp.tab = t; });
  const TABS = [['text', 'Text'], ['section', 'Section'], ['page', 'Page'], ['site', 'Site']];

  return (
    <aside className="fixed top-0 right-0 bottom-0 z-[100] flex w-[min(380px,100vw)] flex-col border-l border-line bg-panel shadow-[-12px_0_32px_rgba(0,0,0,.12)]" aria-label="Inspector">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0"><h2 className="m-0 text-lg">Inspector</h2><p className="m-0 truncate text-sm text-muted">{secName(s)}{I.key && tab == 'text' ? ' · ' + fieldLabel(s, I) : ''}</p></div>
        <button type="button" className="ib" aria-label="Close inspector" onClick={close}>✕</button>
      </div>
      <div className="flex gap-1 border-b border-line px-3 py-2" role="tablist">
        {TABS.map(([k, n]) => <button key={k} type="button" role="tab" aria-selected={tab == k} aria-pressed={tab == k} disabled={k == 'text' && !I.key} className="sm flex-1" onClick={() => setTab(k)}>{n}</button>)}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3" role="tabpanel">
        {tab == 'text' && <TextTab s={s} footer={footer} I={I} />}
        {tab == 'section' && (footer ? <p className="text-muted">The footer uses the template’s layout. Click its motto or bottom line in the preview to style the text.</p> : s ? <SectionTab s={s} openPicker={openPicker} /> : <p className="text-muted">Select a section.</p>)}
        {tab == 'page' && <PageTab />}
        {tab == 'site' && <SiteTab />}
      </div>
    </aside>
  );
}

function fieldLabel(s, I) {
  const d = fieldDef({ sectionType: s ? s.type : 'footer', itemIndex: I.item, field: I.key });
  return (d ? d[1] : I.key) + (I.item != null ? ' (item ' + (I.item + 1) + ')' : '');
}

/* ---------- Text ---------- */
function TextTab({ s, footer, I }) {
  const host = footer ? S.footer : s; if (!host) return null;
  const key = I.item != null ? 'item.' + I.key : I.key, x = (host.fx && host.fx[key]) || {};
  const obj = I.item != null ? s && s.items && s.items[I.item] : host;
  const def = fieldDef({ sectionType: footer ? 'footer' : s.type, itemIndex: I.item, field: I.key });
  const set = (p, v) => setProp(host, 'fx', key, p, v);
  const fi = x.font && fontInfo(x.font), weights = fi ? fi[2] : ALL_W;
  const n = s && s.items ? s.items.length : 0;
  return <>
    {obj && def && def[2] != 'pick' && (
      <div className="mb-4">
        <label htmlFor="i-text" className="mt-0">{def[1]}</label>
        <textarea id="i-text" rows={def[2] == 'area' || String(obj[I.key] || '').length > 40 ? 4 : 2} value={obj[I.key] == null ? '' : obj[I.key]} onChange={e => commit(() => { obj[I.key] = e.target.value; })} />
      </div>
    )}
    {I.item != null && n > 1 && <p className="mb-3 rounded-lg bg-warnbg px-3 py-2 text-sm">Style changes apply to this text on all {n} items in this section, so they stay consistent.</p>}
    <FontPicker label="Font" value={x.font || ''} defaultLabel="Site font" onChange={(fam, cat) => commit(() => {
      host.fx = host.fx || {}; const y = host.fx[key] = host.fx[key] || {};
      if (!fam) { delete y.font; delete y.fcat; } else { y.font = fam; y.fcat = cat; const f = fontInfo(fam); if (y.weight && f && f[2].indexOf(+y.weight) < 0) y.weight = nearest(f[2], +y.weight); }
      if (!Object.keys(y).length) delete host.fx[key];
    })} />
    <Num id="i-size" label="Size" unit="px" min={8} max={120} value={x.size ?? ''} dflt={18} onChange={v => set('size', v)} />
    <Sel id="i-weight" label="Weight" value={x.weight || ''} onChange={v => set('weight', v ? +v : '')} options={[['', 'Default']].concat(weights.map(w => [String(w), w + ' · ' + WN[w]]))} />
    <Num id="i-ls" label="Letter spacing" unit="em" min={-0.1} max={0.5} step={0.01} value={x.ls ?? ''} dflt={0} onChange={v => set('ls', v)} />
    <Num id="i-lh" label="Line height" unit="×" min={0.8} max={2.5} step={0.05} value={x.lh ?? ''} dflt={1.4} onChange={v => set('lh', v)} />
    <div className="grid grid-cols-2 gap-3">
      <Sel id="i-tt" label="Capitals" value={x.tt || ''} onChange={v => set('tt', v)} options={[['', 'Default'], ['none', 'As typed'], ['uppercase', 'ALL CAPS'], ['capitalize', 'Each Word'], ['lowercase', 'lowercase']]} />
      <div className="mb-3"><label className="mt-0">Style</label><label className="ck m-0 min-h-[42px]"><input type="checkbox" checked={!!x.ital} onChange={e => set('ital', e.target.checked)} /> Italic</label></div>
    </div>
    <ColourPicker label="Text colour" value={x.color || ''} onChange={v => set('color', v)} />
    {Object.keys(x).length > 0 && <button type="button" onClick={() => commit(() => { delete host.fx[key]; if (!Object.keys(host.fx).length) delete host.fx; })}>Reset this text’s style</button>}
  </>;
}

/* ---------- Section ---------- */
function SectionTab({ s, openPicker }) {
  const x = s.lx || {}, set = (p, v) => setProp(s, 'lx', null, p, v);
  const lay = (FIELDS[s.type] || []).filter(f => LAYOUT_KEYS.indexOf(f[0]) >= 0);
  return <>
    <h3 className="mt-0 text-base">{Render.SECTION_TYPES[s.type]}</h3>
    {lay.length > 0 && <div className="mb-2">{lay.map(f => <Field key={f[0]} f={f} obj={s} path="sec" idp="i" openPicker={openPicker} />)}</div>}
    <h4 className="mt-4 mb-2">Spacing</h4>
    <Num id="i-pt" label="Space above" unit="px" min={0} max={240} value={x.pt ?? ''} dflt={64} onChange={v => set('pt', v)} />
    <Num id="i-pb" label="Space below" unit="px" min={0} max={240} value={x.pb ?? ''} dflt={64} onChange={v => set('pb', v)} />
    <Num id="i-gap" label="Gap between items" unit="px" min={0} max={80} value={x.gap ?? ''} dflt={24} onChange={v => set('gap', v)} />
    <p className="-mt-1 mb-3 text-xs text-muted">On phones, space above and below shrinks to 60%.</p>
    <h4 className="mt-4 mb-2">Layout</h4>
    <Sel id="i-cw" label="Content width" value={x.cw || ''} onChange={v => set('cw', v === 'full' ? 'full' : v ? +v : '')} options={WIDTHS} />
    <Num id="i-mh" label="Minimum height" unit="px" min={0} max={900} step={10} value={x.mh ?? ''} dflt={0} onChange={v => set('mh', v || '')} />
    {x.mh > 0 && <Sel id="i-va" label="Content position" value={x.va || ''} onChange={v => set('va', v)} options={[['', 'Middle'], ['top', 'Top'], ['bottom', 'Bottom']]} />}
    <Sel id="i-align" label="Text alignment" value={s.align || 'auto'} onChange={v => commit(() => { s.align = v; })} options={F_COMMON[1][3]} />
    <Num id="i-r" label="Corner rounding" unit="px" min={0} max={40} value={x.r ?? ''} dflt={8} onChange={v => set('r', v)} />
    <h4 className="mt-4 mb-2">Colours</h4>
    <Sel id="i-bg" label="Background" value={s.bg || 'auto'} onChange={v => commit(() => { s.bg = v; })} options={F_COMMON[0][3]} />
    <ColourPicker label="Custom background" value={x.bgc || ''} onChange={v => set('bgc', v)} />
    <ColourPicker label="Text colour" value={x.ink || ''} onChange={v => set('ink', v)} />
    {x.bgc && !x.ink && <p className="-mt-1 mb-3 text-xs text-muted">Text colour is picked automatically for contrast ({Art.onColor(x.bgc) == '#ffffff' ? 'white' : 'black'}).</p>}
    {s.lx && <button type="button" onClick={() => commit(() => { delete s.lx; })}>Reset this section’s layout</button>}
  </>;
}

/* ---------- Page ---------- */
function PageTab() {
  const secs = SEC();
  const move = (a, b) => commit(() => { secs.splice(b, 0, secs.splice(a, 1)[0]); });
  return <>
    <p className="mt-0 text-sm text-muted">Drag the handle ⠿ to reorder sections on this page. Click a name to inspect it.</p>
    <SortableList className="m-0 grid list-none gap-2 p-0" onMove={move} label="Sections on this page">
      {secs.map((x, i) => (
        <li key={x.id} className={'sortable flex items-center gap-2 rounded-xl border bg-panel p-1.5 ' + (S.ui.sel == x.id ? 'border-acc' : 'border-line')}>
          <span className="drag cursor-grab select-none px-1.5 text-xl text-muted" title="Drag to reorder" aria-hidden="true">⠿</span>
          <button type="button" className="min-w-0 flex-1 border-0 bg-transparent px-1 text-left" onClick={() => commit(S => { S.ui.sel = x.id; S.ui.insp.tab = 'section'; S.ui.insp.key = null; })}>
            <span className="block truncate">{x.title || x.headline || '(untitled)'}</span><small className="text-muted">{Render.SECTION_TYPES[x.type]}</small>
          </button>
          <button type="button" className="ib" aria-label="Move up" disabled={i == 0} onClick={() => move(i, i - 1)}>↑</button>
          <button type="button" className="ib" aria-label="Move down" disabled={i == secs.length - 1} onClick={() => move(i, i + 1)}>↓</button>
        </li>
      ))}
    </SortableList>
  </>;
}

/* ---------- Site ---------- */
function SiteTab() {
  const g = S.brand.gf || {}, pair = Art.FONTS[S.brand.font] || Art.FONTS[0];
  const set = (p, v) => setProp(S.brand, 'gf', null, p, v);
  const hi = g.h && fontInfo(g.h);
  return <>
    <p className="mt-0 text-sm text-muted">Choose Google Fonts for the whole site. They replace the “{pair.name}” pair from step 2.</p>
    <FontPicker label="Headings" value={g.h || ''} defaultLabel={pair.name + ' (step 2)'} onChange={(fam, cat) => commit(() => { S.brand.gf = Object.assign({}, g, { h: fam || undefined, hcat: cat || undefined }); if (fam && g.hw && hi) S.brand.gf.hw = nearest(fontInfo(fam)[2], g.hw); })} />
    <Sel id="i-hw" label="Heading weight" value={g.hw || ''} onChange={v => set('hw', v ? +v : '')} options={[['', 'Default (' + pair.w + ')']].concat((hi ? hi[2] : ALL_W).map(w => [String(w), w + ' · ' + WN[w]]))} />
    <FontPicker label="Body text" value={g.b || ''} defaultLabel={pair.name + ' (step 2)'} onChange={(fam, cat) => commit(() => { S.brand.gf = Object.assign({}, g, { b: fam || undefined, bcat: cat || undefined }); })} />
    {S.brand.gf && Object.values(S.brand.gf).some(Boolean) && <button type="button" onClick={() => commit(() => { delete S.brand.gf; })}>Use the step 2 fonts again</button>}
  </>;
}
