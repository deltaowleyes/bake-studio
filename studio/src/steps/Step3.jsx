/* Step 3: Sections. Pick a page; add, reorder, delete and edit sections and items.
   The preview has click-to-edit overlays: clicking any part jumps to its field. */
import { useState } from 'react';
import { Render } from '../lib/render.js';
import { S, commit, useStudio } from '../store.js';
import { nid, curPage, SEC, cur, placeholderPage, defaultSection, FIELDS, ITEMF, F_COMMON, FOOTER_F, fieldId } from '../edit.js';
import Preview, { SizeButtons, fieldDef } from '../components/Preview.jsx';
import ImagePicker from '../components/ImagePicker.jsx';
import Inspector from '../components/Inspector.jsx';
import ImageEditor from '../components/ImageEditor.jsx';
import SortableList from '../components/SortableList.jsx';
import Field from '../components/Field.jsx';

function move(list, i, d) { const j = i + d; list.splice(j, 0, list.splice(i, 1)[0]); }

export default function Step3() {
  useStudio();
  const [pick, setPick] = useState(null), [imgEdit, setImgEdit] = useState(null), [addType, setAddType] = useState('hero');
  const p = curPage(), secs = SEC();
  if (S.ui.sel != 'footer' && !cur() && secs[0]) S.ui.sel = secs[0].id;
  const s = S.ui.sel == 'footer' ? null : cur();
  const openPicker = (path, k) => setPick({ path, k });
  const openEditor = (path, k) => { const x = cur(); setImgEdit({ path, k, box: null, type: x ? x.type : '', item: /^item:/.test(path) ? +path.slice(5) : null }); };
  const select = id => commit(S => { S.ui.sel = id; S.ui.insp.key = null; if (S.ui.insp.tab == 'text') S.ui.insp.tab = 'section'; });

  /* a click on the preview: images open the picker; sections, items and text open the Inspector */
  function editPart(b) {
    const path = b.sectionType == 'footer' ? 'footer' : b.itemIndex != null ? 'item:' + b.itemIndex : 'sec', f = b.field && fieldDef(b);
    if (f && f[2] == 'pick') { select(b.sectionId); return setImgEdit({ path, k: b.field, box: { width: b.width, height: b.height }, type: b.sectionType, item: b.itemIndex }); }
    const text = b.type == 'text' && b.field;
    commit(S => { S.ui.sel = b.sectionId; S.ui.insp = { open: true, tab: text ? 'text' : 'section', key: text ? b.field : null, item: text ? b.itemIndex : null }; });
  }
  function addPage() { commit(S => { const np = placeholderPage('New page'); S.pages.push(np); S.ui.page = np.id; S.ui.sel = np.sections[0].id; }); }
  function delPage() {
    if (!confirm('Delete the page “' + p.name + '”?')) return;
    commit(S => { S.pages = S.pages.filter(x => x !== p); S.ui.page = S.pages[0].id; S.ui.sel = null; });
  }
  function addSection() { commit(S => { const ns = defaultSection(addType), at = secs.indexOf(cur()); secs.splice(at < 0 ? secs.length : at + 1, 0, ns); S.ui.sel = ns.id; }); }
  function delSection(i) {
    const x = secs[i]; if (!confirm('Delete the section “' + (x.title || Render.SECTION_TYPES[x.type]) + '”?')) return;
    commit(S => { secs.splice(i, 1); if (S.ui.sel == x.id) S.ui.sel = secs[0] && secs[0].id; });
  }

  return (
    <section className="step" aria-labelledby="h3s">
      <h2 id="h3s" className="sth">3. Sections</h2>
      <div className="split">
        <div>
          <div className="card" id="pbar">
            <label htmlFor="psel">Page</label>
            <div className="row nowrap">
              <select id="psel" value={p.id} onChange={e => commit(S => { S.ui.page = e.target.value; const np = curPage(); S.ui.sel = np.sections[0] && np.sections[0].id; })}>
                {S.pages.map(x => <option key={x.id} value={x.id}>{x.name}{x.status == 'waiting' ? ' (not imported)' : ''}</option>)}
              </select>
              <button className="sm" onClick={addPage}>Add page</button>
            </div>
            <div className="row">
              <label className="ck m-0">Name <input value={p.name} onChange={e => commit(() => { p.name = e.target.value; })} className="w-auto min-h-9" /></label>
              {S.pages.length > 1 && S.pages[0].id != p.id && <button className="sm" onClick={delPage}>Delete this page</button>}
            </div>
          </div>

          <div className="card"><h3>Sections on this page</h3>
            <p className="mu">Drag ⠿ to reorder. Tap a section here, or any text or picture in the preview, to edit it.</p>
            <SortableList className="slist" label="Sections on this page" onMove={(a, b) => commit(() => move(secs, a, b - a))}>
              {secs.map((x, i) => (
                <li key={x.id} className={'sortable' + (S.ui.sel == x.id ? ' on' : '')}>
                  <span className="drag" title="Drag to reorder" aria-hidden="true">⠿</span>
                  <button className="nm" onClick={() => select(x.id)}>{x.title || x.headline || '(untitled)'}<small>{Render.SECTION_TYPES[x.type]}</small></button>
                  <button className="ib" aria-label="Move up" disabled={i == 0} onClick={() => commit(() => move(secs, i, -1))}>↑</button>
                  <button className="ib" aria-label="Move down" disabled={i == secs.length - 1} onClick={() => commit(() => move(secs, i, 1))}>↓</button>
                  <button className="ib" aria-label="Delete section" onClick={() => delSection(i)}>✕</button>
                </li>
              ))}
              <li className={S.ui.sel == 'footer' ? 'on' : ''}><button className="nm" onClick={() => select('footer')}>Footer<small>Always at the bottom</small></button></li>
            </SortableList>
            <div className="row nowrap">
              <select aria-label="Section type" value={addType} onChange={e => setAddType(e.target.value)}>
                {Object.keys(Render.SECTION_TYPES).map(k => <option key={k} value={k}>{Render.SECTION_TYPES[k]}</option>)}
              </select>
              <button onClick={addSection}>Add section</button>
            </div>
          </div>

          <div className="card" id="sedit">
            {S.ui.sel == 'footer' ? <>
              <h3>Footer</h3>
              {FOOTER_F.map(f => <Field key={f[0]} f={f} obj={S.footer} path="footer" openPicker={openPicker} openEditor={openEditor} />)}
            </> : !s ? <p className="mu">Add a section to start.</p> : <>
              <h3>Edit: {Render.SECTION_TYPES[s.type]}</h3>
              {(FIELDS[s.type] || []).concat(F_COMMON).map(f => <Field key={f[0]} f={f} obj={s} path="sec" openPicker={openPicker} openEditor={openEditor} />)}
              {ITEMF[s.type] && <>
                <h4>Items ({(s.items || []).length})</h4>
                <div className="items">
                  {(s.items || []).map((it, i) => (
                    <div className="item" key={it.id || i}>
                      <div className="ih">
                        <b>{i + 1}. {it.title || it.text || 'Item'}</b>
                        <button className="ib" aria-label="Move item up" disabled={i == 0} onClick={() => commit(() => move(s.items, i, -1))}>↑</button>
                        <button className="ib" aria-label="Move item down" disabled={i == s.items.length - 1} onClick={() => commit(() => move(s.items, i, 1))}>↓</button>
                        <button className="ib" aria-label="Delete item" onClick={() => commit(() => s.items.splice(i, 1))}>✕</button>
                      </div>
                      {ITEMF[s.type].map(f => <Field key={f[0]} f={f} obj={it} path={'item:' + i} openPicker={openPicker} openEditor={openEditor} />)}
                    </div>
                  ))}
                </div>
                <div className="row"><button onClick={() => commit(() => { s.items = s.items || []; s.items.push({ id: nid('i'), title: 'New item', text: '', link: '', linkText: '' }); })}>Add item</button></div>
              </>}
            </>}
          </div>
        </div>

        <div className="sticky"><div className="card">
          <div className="flex items-center justify-between gap-2"><h3 className="m-0">Preview</h3>
            <button className="sm" aria-pressed={!!S.ui.insp.open} onClick={() => commit(S => { S.ui.insp.open = !S.ui.insp.open; })}>{S.ui.insp.open ? 'Hide inspector' : 'Inspector'}</button></div>
          <SizeButtons k="vp" onPick={v => commit(S => { S.ui.vp = v; })} />
          <Preview vp={S.ui.vp} opt={{ sel: S.ui.sel }} onPart={editPart} hint=" Tap any text or section to style it in the inspector, or a picture to crop and frame it." />
        </div></div>
      </div>
      {S.ui.insp.open && <Inspector openPicker={openPicker} />}
      <ImageEditor edit={imgEdit} onClose={() => setImgEdit(null)} onReplace={(path, k) => { setImgEdit(null); openPicker(path, k); }} />
      <ImagePicker pick={pick} onClose={() => setPick(null)} />
    </section>
  );
}
