/* Step 4: Menu. A menu style per screen size, the menu links and groups, and the header button. */
import { Render } from '../lib/render.js';
import { S, commit, useStudio } from '../store.js';
import { nid, mget, VPW, VPN } from '../edit.js';
import Preview from '../components/Preview.jsx';

export default function Step4() {
  useStudio();
  const vp = S.ui.mvp, c = S.menu.vp[vp], items = S.menu.items;
  const setOpt = (k, v) => commit(() => { c[k] = v; });
  const mv = (path, d) => commit(() => { const g = mget(path); g.list.splice(g.i + d, 0, g.list.splice(g.i, 1)[0]); });
  const rm = path => commit(() => { const g = mget(path); g.list.splice(g.i, 1); });
  const setLink = (path, k, v) => commit(() => { const g = mget(path); g.list[g.i][k] = v; });
  function copyStyle() { commit(S => Object.keys(VPW).forEach(v => { if (v != vp && Render.MENU_TYPES[c.type].vps.indexOf(v) >= 0) S.menu.vp[v] = Object.assign({}, c); })); }
  function moveOut(i, j) { commit(S => { const it = items[i].children.splice(j, 1)[0]; S.menu.items.splice(i + 1, 0, it); }); }
  function moveIntoAbove(i) {
    commit(S => {
      let prev = S.menu.items[i - 1]; const m = S.menu.items[i];
      if (!prev.children) { prev = { id: nid('g'), label: prev.label, href: '', children: [prev] }; S.menu.items[i - 1] = prev; }
      prev.children.push({ id: m.id, label: m.label, href: m.href }); (m.children || []).forEach(k => prev.children.push(k));
      S.menu.items.splice(i, 1);
    });
  }

  return (
    <section className="step" aria-labelledby="h4s">
      <h2 id="h4s" className="sth">4. Menu</h2>
      <div className="split">
        <div>
          <div className="card"><h3>Menu style for each screen size</h3>
            <div className="row" role="group" aria-label="Screen">
              {Object.keys(VPW).map(v => <button key={v} aria-pressed={vp == v} onClick={() => commit(S => { S.ui.mvp = v; })}>{VPN[v]} <small>({Render.MENU_TYPES[S.menu.vp[v].type].name})</small></button>)}
            </div>
            <div className="mtypes">
              {Object.keys(Render.MENU_TYPES).filter(k => Render.MENU_TYPES[k].vps.indexOf(vp) >= 0).map(k => {
                const m = Render.MENU_TYPES[k];
                return <button key={k} aria-pressed={c.type == k} onClick={() => setOpt('type', k)}><b>{m.name}</b><small>{m.desc}</small></button>;
              })}
            </div>
            <div className="mopts">
              {c.type != 'split' && <>
                <label htmlFor="mlogo">Logo position</label>
                <select id="mlogo" value={c.logo} onChange={e => setOpt('logo', e.target.value)}><option value="left">Left</option><option value="center">Centre</option></select>
              </>}
              <div className="row">
                <label className="ck"><input type="checkbox" checked={!!c.sticky} onChange={e => setOpt('sticky', e.target.checked)} /> Keep header visible when scrolling</label>
                <label className="ck"><input type="checkbox" checked={!!c.search} onChange={e => setOpt('search', e.target.checked)} /> Show search</label>
                <label className="ck"><input type="checkbox" checked={!!c.cta} onChange={e => setOpt('cta', e.target.checked)} /> Show button</label>
              </div>
              <div className="row"><button className="sm" onClick={copyStyle}>Use this style on the other screen sizes where it fits</button></div>
            </div>
          </div>

          <div className="card"><h3>Menu links</h3><p className="mu">A group holds sub-links and shows as a dropdown or a heading.</p>
            {items.map((m, i) => {
              const g = !!m.children;
              return (
                <div className="mi" key={m.id || i}>
                  <div className="mr">
                    <input aria-label="Label" data-mk="label" value={m.label} onChange={e => setLink(i, 'label', e.target.value)} />
                    {!g && <input aria-label="Link" value={m.href} onChange={e => setLink(i, 'href', e.target.value)} />}
                    <button className="ib" aria-label="Move up" disabled={i == 0} onClick={() => mv(i, -1)}>↑</button>
                    <button className="ib" aria-label="Move down" disabled={i == items.length - 1} onClick={() => mv(i, 1)}>↓</button>
                    <button className="ib" aria-label="Delete" onClick={() => rm(i)}>✕</button>
                  </div>
                  {g ? (
                    <div className="kids">
                      {m.children.map((k, j) => (
                        <div className="mr" key={k.id || j}>
                          <input aria-label="Sub-link label" data-mk="label" value={k.label} onChange={e => setLink(i + '.' + j, 'label', e.target.value)} />
                          <input aria-label="Sub-link" value={k.href} onChange={e => setLink(i + '.' + j, 'href', e.target.value)} />
                          <button className="ib" aria-label="Move up" disabled={j == 0} onClick={() => mv(i + '.' + j, -1)}>↑</button>
                          <button className="ib" aria-label="Move down" disabled={j == m.children.length - 1} onClick={() => mv(i + '.' + j, 1)}>↓</button>
                          <button className="ib" aria-label="Move out of group" onClick={() => moveOut(i, j)}>⇤</button>
                          <button className="ib" aria-label="Delete" onClick={() => rm(i + '.' + j)}>✕</button>
                        </div>
                      ))}
                      <div className="row"><button className="sm" onClick={() => commit(() => m.children.push({ id: nid('m'), label: 'New link', href: '#' }))}>Add sub-link</button></div>
                    </div>
                  ) : i > 0 && <div className="row"><button className="sm" onClick={() => moveIntoAbove(i)}>Move into group above</button></div>}
                </div>
              );
            })}
            <div className="row">
              <button onClick={() => commit(S => S.menu.items.push({ id: nid('m'), label: 'New link', href: '#' }))}>Add link</button>
              <button onClick={() => commit(S => S.menu.items.push({ id: nid('g'), label: 'New group', href: '', children: [{ id: nid('m'), label: 'New link', href: '#' }] }))}>Add group</button>
            </div>
            <h4>Menu button</h4><p className="mu">Shown when “Show button” is on for a screen size.</p>
            <div className="g2">
              <div><label htmlFor="ctal">Label</label><input id="ctal" value={S.menu.cta.label} onChange={e => commit(S => { S.menu.cta.label = e.target.value; })} /></div>
              <div><label htmlFor="ctah">Link</label><input id="ctah" value={S.menu.cta.href} onChange={e => commit(S => { S.menu.cta.href = e.target.value; })} /></div>
            </div>
          </div>
        </div>

        <div className="sticky"><div className="card"><h3>Preview</h3>
          <div className="row"><label className="ck"><input type="checkbox" checked={!!S.ui.open} onChange={e => commit(S => { S.ui.open = e.target.checked; })} /> Show the menu open</label></div>
          <Preview vp={vp} opt={{ openMenu: S.ui.open ? vp : null, pageId: S.pages[0] && S.pages[0].id }} />
        </div></div>
      </div>
    </section>
  );
}
