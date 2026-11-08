/* Step 1: Your site. Import a site (by address or pasted code) and its other pages, or start fresh. */
import { useRef, useState } from 'react';
import { Importer } from '../lib/importer.js';
import { Render } from '../lib/render.js';
import { S, commit, useStudio } from '../store.js';
import { EditionCards } from '../components/EditionPicker.jsx';
import { applyImport, importPage, logLine, starter, ensureArt, SEC } from '../edit.js';

const STATUS = { imported: '✓ Imported', waiting: 'Not imported yet', blocked: 'Blocked: paste its code', importing: 'Importing…', 'new': 'Built here' };
const log = (t, c) => commit(() => logLine(t, c));

export default function Step1({ go }) {
  useStudio();
  const src = S.source;
  const [pasteOpen, setPasteOpen] = useState(false);
  const paste = useRef(null), pasteBox = useRef(null), fname = useRef(null), fdesc = useRef(null), ftype = useRef(null);

  async function runImport(html, url) {
    try {
      const r = await Importer.analyse(html, url, log);
      log('Found ' + r.menu.length + ' menu items, ' + r.sections.length + ' sections, ' + r.lib.length + ' images, ' + r.pages.length + ' other pages' + (r.colours ? ' and your colours' : '') + '.', 'ok');
      commit(() => applyImport(r));
    } catch (e) { log('Couldn’t read that page: ' + e.message, 'bad'); }
  }
  function goImport() {
    let u = (src.url || '').trim(); if (!/^https?:\/\//.test(u)) u = 'https://' + u;
    commit(S => { S.source.url = u; S.source.log = []; logLine('Reading ' + u + ' …'); });
    Importer.fetchHtml(u).then(r => { log('Got the page.', 'ok'); return runImport(r.html, r.url); })
      .catch(er => { log('That site didn’t let us read it directly (' + er.message + '). Use “Paste the page’s code instead” below.', 'bad'); setPasteOpen(true); });
  }
  function readPaste() {
    const h = paste.current.value; if (h.length < 50) return log('Paste the whole page code first.', 'bad');
    const tp = S.pages.filter(p => p.id == S.ui.pasteFor)[0];
    if (tp) {
      log('Reading the pasted code for ' + tp.name + '…'); commit(S => { S.ui.pasteFor = null; }); paste.current.value = '';
      return importPage(tp, h).then(() => log(tp.status == 'imported' ? tp.name + ' imported.' : 'Couldn’t read that code.', tp.status == 'imported' ? 'ok' : 'bad'));
    }
    commit(S => { S.source.log = []; logLine('Reading the pasted code…'); });
    return runImport(h, src.url || 'https://example.com/');
  }
  function importOne(pg) { commit(() => { pg.status = 'importing'; }); importPage(pg).then(() => commit()); }
  async function importAll() {
    const todo = S.pages.filter(p => p.url && p.status != 'imported');
    commit(() => todo.forEach(p => { p.status = 'importing'; }));
    for (const p of todo) { await importPage(p); commit(); }
    const bl = todo.filter(p => p.status == 'blocked').length;
    log(bl ? bl + ' page' + (bl > 1 ? 's' : '') + ' blocked importing. Use Paste code for those.' : 'All pages imported.', bl ? 'bad' : 'ok');
  }
  function pasteFor(pp) {
    commit(S => { S.ui.pasteFor = pp.id; logLine('Paste the code for “' + pp.name + '” (' + pp.url + ') below, then click Read code.'); });
    setPasteOpen(true);
    setTimeout(() => { paste.current.focus(); pasteBox.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 30);
  }
  function makeStarter() {
    commit(S => {
      S.biz.name = fname.current.value.trim() || 'Your business'; S.biz.desc = fdesc.current.value.trim(); S.source.found = null;
      S.brand.opts = { logo: [], hero: [], ill: [] }; S.brand.pick = {}; ensureArt(); starter(ftype.current.value); S.ui.sel = SEC()[0].id;
    });
  }

  return (
    <section className="step" aria-labelledby="h1s">
      <h2 id="h1s" className="sth">1. Your site</h2>
      <EditionCards />
      <div className="card">
        <h3>Do you already have a website?</h3>
        <div className="row" role="group" aria-label="Existing site">
          <button aria-pressed={src.has} onClick={() => commit(S => { S.source.has = true; })}>Yes, import it</button>
          <button aria-pressed={!src.has} onClick={() => commit(S => { S.source.has = false; })}>No, start fresh</button>
        </div>
        {src.has ? (
          <div className="sub">
            <label htmlFor="url">Website address</label>
            <div className="row nowrap">
              <input id="url" type="url" placeholder="https://example.com" autoComplete="url" value={src.url} onChange={e => commit(S => { S.source.url = e.target.value; })} onKeyDown={e => { if (e.key == 'Enter') goImport(); }} />
              <button className="pri" onClick={goImport}>Import</button>
            </div>
            <ol className="log" aria-live="polite">{src.log.map((l, i) => <li key={i} className={l[1]}>{l[0]}</li>)}</ol>
            <details className="help" ref={pasteBox} open={pasteOpen} onToggle={e => setPasteOpen(e.currentTarget.open)}>
              <summary>Import didn’t work? Paste the page’s code instead</summary>
              <p className="mu">Many websites block other sites from reading them. You can copy the code yourself:</p>
              <ol className="mu small">
                <li>Open your website in a new tab.</li>
                <li>Press <kbd>Ctrl</kbd>+<kbd>U</kbd> (Windows) or <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>U</kbd> (Mac) to see the page code.</li>
                <li>Press <kbd>Ctrl</kbd>+<kbd>A</kbd> then <kbd>Ctrl</kbd>+<kbd>C</kbd> (or <kbd>Cmd</kbd> on Mac) to copy it all.</li>
                <li>Paste it below and click Read code.</li>
              </ol>
              <label htmlFor="paste">Page code</label><textarea id="paste" ref={paste} rows={5} placeholder="<!doctype html>…" />
              <div className="row"><button onClick={readPaste}>Read code</button></div>
            </details>
          </div>
        ) : (
          <div className="sub">
            <div className="g2">
              <div><label htmlFor="fname">Business name</label><input id="fname" ref={fname} /></div>
              <div><label htmlFor="fdesc">One-line description</label><input id="fdesc" ref={fdesc} /></div>
            </div>
            <label htmlFor="ftype" className="mt-3">What kind of site?</label>
            <select id="ftype" ref={ftype} defaultValue="community">
              <option value="community">Community or news</option><option value="food">Restaurant or café</option>
              <option value="shop">Shop</option><option value="services">Services or trades</option>
            </select>
            <div className="row"><button className="pri" id="mk" onClick={makeStarter}>Create starter site</button></div>
          </div>
        )}
      </div>
      <Found go={go} importOne={importOne} importAll={importAll} pasteFor={pasteFor} />
    </section>
  );
}

function Found({ go, importOne, importAll, pasteFor }) {
  const f = S.source.found, home = S.pages[0];
  if (!home || !home.sections.length) return null;
  const logos = S.lib.filter(l => l.logo).slice(0, 6);
  const others = S.pages.slice(1), waiting = others.filter(p => p.url && p.status != 'imported').length;
  return (
    <div className="card" id="found">
      <h3>{f ? 'What we found on ' + f.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'Your starter site'}</h3>
      <div className="found-grid">
        <div>
          <h4>{S.biz.name}</h4><p className="mu">{S.biz.desc || ''}</p>
          {S.footer.motto && <p className="mu">Motto: {S.footer.motto}</p>}
        </div>
        {logos.length > 0 && (
          <div><h4>Likely logos</h4>
            <div className="thumbs">{logos.map(o => <img key={o.id} src={o.src} alt={o.label} />)}</div>
            <p className="mu">{S.lib.length} images found in total. You can use any of them in steps 2 and 3.</p>
          </div>
        )}
        {f && f.colours && <div><h4>Colours</h4>{f.colours.found.map(h => <span key={h} className="sw" style={{ background: h }} title={h} />)}</div>}
        <div><h4>Menu ({S.menu.items.length})</h4>
          <ul className="tags">{S.menu.items.map(m => <li key={m.id}>{m.label}{m.children && m.children.length ? <span className="mu"> ({m.children.length} links)</span> : null}</li>)}</ul>
        </div>
        <div><h4>Home page sections ({home.sections.length})</h4>
          <ol className="tags">{home.sections.map((s, i) => <li key={s.id}>{s.title || Render.SECTION_TYPES[s.type]} <span className="mu">{Render.SECTION_TYPES[s.type]}{f && i == 0 ? ', suggested' : ''}</span></li>)}</ol>
        </div>
      </div>
      {others.length > 0 && <>
        <h4 className="mt-5">Other pages ({others.length})</h4>
        <p className="mu">Import each page so the templates can show your whole site. Pages that block importing can be pasted in.</p>
        {waiting > 0 && <div className="row"><button onClick={importAll}>Import all pages</button></div>}
        <ul className="pages">{others.map(p => (
          <li key={p.id}><b>{p.name}</b><span className="mu">{(p.url || '').replace(/^https?:\/\/[^/]+/, '') || 'new page'}</span>
            <span className={'st st-' + p.status}>{STATUS[p.status] || p.status}</span>
            {p.url && p.status != 'imported' && <><button className="sm" onClick={() => importOne(p)}>Import</button><button className="sm" onClick={() => pasteFor(p)}>Paste code</button></>}
          </li>
        ))}</ul>
      </>}
      <div className="row"><button className="pri" onClick={() => go(2)}>Next: brand</button></div>
    </div>
  );
}
