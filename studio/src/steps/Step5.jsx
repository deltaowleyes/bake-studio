/* Step 5: Templates. Browse templates that fit, preview any page at any size, pick one, request development. */
import { useEffect, useState } from 'react';
import { Render } from '../lib/render.js';
import { Shot } from '../lib/shot.js';
import { S, commit, useStudio, useRev, startOver } from '../store.js';
import { nid, SEC } from '../edit.js';
import { edition } from '../editions.js';
import Preview, { SizeButtons } from '../components/Preview.jsx';

/* Thumbnails are made one after another (Home page, 1280 px wide, cropped to 960 px, half scale, JPEG). */
function PublishCard() {
  useStudio();
  const ed = edition(S), pn = S.req.pagename || '';
  const ok = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(pn);
  const addr = S.edition == 'pro' ? 'your own domain (for example yourname.com)' : ed.host + '/' + (pn || 'yourname');
  return (
    <div className="card" id="pubc"><h3>Publish ({ed.name})</h3>
      <p className="mu">{ed.blurb}</p>
      {S.edition != 'pro' && <>
        <label htmlFor="pname">Your page name</label>
        <input id="pname" value={pn} placeholder="sunrise-bakery" aria-describedby="pnhelp"
          onChange={e => commit(S => { S.req.pagename = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''); })} />
        <p id="pnhelp" className={pn && !ok ? 'errmsg' : 'mu small'}>{pn && !ok ? 'Use 3 to 40 lowercase letters, numbers or dashes, starting and ending with a letter or number.' : 'Lowercase letters, numbers and dashes.'}</p>
      </>}
      <p>Your site’s address: <b>https://{addr}</b></p>
      {S.edition == 'baker' && <p className="mu small">Portfolio pieces on bakedbya.pro are published as screenshots, with every link and menu clickable.</p>}
      {S.edition == 'indigihub' && <p className="mu small">IndigiHub pages go live after a short review by our team.</p>}
      <p className="mu small">One-click publishing turns on when accounts arrive. Until then, use Request development below and we’ll publish it for you.</p>
    </div>
  );
}

function useThumbs(ids) {
  const rev = useRev(), [urls, setUrls] = useState({}), key = ids.join(',');
  useEffect(() => {
    let live = true; const list = ids.slice(), home = S.pages[0] && S.pages[0].id;
    (function next() {
      if (!live || !list.length) return;
      const id = list.shift();
      Shot.take(Render.page(S, id, { pageId: home }), 1280, { maxH: 960, scale: .5, type: 'image/jpeg' })
        .then(r => { if (live) setUrls(u => (u[id] == r.url ? u : Object.assign({}, u, { [id]: r.url }))); }).catch(() => { }).then(next);
    })();
    return () => { live = false; };
  }, [rev, key]); // eslint-disable-line react-hooks/exhaustive-deps
  return urls;
}

export default function Step5() {
  useStudio();
  const all = Render.TEMPLATES.map(t => ({ t, c: Render.compat(t, S) })), ok = all.filter(x => x.c.ok);
  const CUR = all.filter(x => (S.tpl.all || x.c.ok) && (!S.tpl.favOnly || S.tpl.fav[x.t.id]));
  if (!S.pages.some(p => p.id == S.ui.tpage)) S.ui.tpage = S.pages[0] && S.pages[0].id;
  if (!S.tpl.view) S.tpl.view = S.tpl.pick || (ok[0] || all[0]).t.id;
  const thumbs = useThumbs(CUR.map(x => x.t.id));
  const [note, setNote] = useState(''), [msg, setMsg] = useState(null);

  const vt = Render.tpl(S.tpl.view), vc = Render.compat(vt, S), picked = S.tpl.pick == vt.id;
  function view(id) { commit(S => { S.tpl.view = id; }); document.getElementById('tpc').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function step(d) {
    const L = CUR.length ? CUR : Render.TEMPLATES.map(t => ({ t }));
    let ix = L.map(x => x.t.id).indexOf(S.tpl.view); ix = (ix + d + L.length) % L.length;
    commit(S => { S.tpl.view = L[ix].t.id; });
  }
  function request() {
    const nm = S.req.name.trim(), em = S.req.email.trim(), nt = note.trim();
    if (!S.tpl.pick) return setMsg({ bad: true, text: 'Pick a template first: preview one above and click “Use this template”.' });
    if (!nm) { setMsg({ bad: true, text: 'Enter your name.' }); return document.getElementById('rname').focus(); }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setMsg({ bad: true, text: 'Enter a valid email address so we can reach you.' }); return document.getElementById('remail').focus(); }
    commit(S => {
      S.req = { name: nm, email: em, pagename: S.req.pagename || '' };
      S.notes.unshift({ id: nid('n'), at: Date.now(), name: nm, email: em, text: nt, tpl: S.tpl.pick, edition: S.edition, pagename: S.req.pagename || '', status: 'Requested', summary: { sections: SEC().map(x => x.title || x.type), menu: S.menu.items.map(m => m.label) } });
    });
    setNote(''); setMsg({ bad: false, text: 'Request saved. We’ll be in touch at ' + em + '.' });
  }

  return (
    <section className="step" aria-labelledby="h5s">
      <h2 id="h5s" className="sth">5. Templates</h2>
      <div className="card">
        <div className="bar">
          <div className="flex-1 min-w-[220px]"><h3>{ok.length} of {all.length} templates fit your site</h3><p className="mu">Only templates that can show every section and your desktop menu style are listed.</p></div>
          <label className="ck"><input type="checkbox" checked={!!S.tpl.all} onChange={e => commit(S => { S.tpl.all = e.target.checked; })} /> Show templates that don’t fit</label>
          <label className="ck"><input type="checkbox" checked={!!S.tpl.favOnly} onChange={e => commit(S => { S.tpl.favOnly = e.target.checked; })} /> Favourites only</label>
        </div>
        <div className="tg">
          {CUR.length ? CUR.map(({ t, c }) => {
            const on = S.tpl.pick == t.id, fav = !!S.tpl.fav[t.id];
            return (
              <article key={t.id} className={'tc' + (on ? ' sel' : '') + (c.ok ? '' : ' no')}>
                <div className="tw" role="button" tabIndex={0} aria-label={'Preview ' + t.name} onClick={() => view(t.id)} onKeyDown={e => { if (e.key == 'Enter' || e.key == ' ') { e.preventDefault(); view(t.id); } }}>
                  <img alt={'Screenshot of ' + t.name} src={thumbs[t.id] || undefined} />
                </div>
                <div className="tb">
                  <h4>{t.name}{on && <span className="chip on">Picked</span>}</h4>
                  <p className="mu">{t.fam.desc}</p>
                  {!c.ok && <p className="why">Doesn’t fit: {c.why.join('; ')}.</p>}
                  <div className="row">
                    <button onClick={() => view(t.id)}>Preview</button>
                    <button aria-pressed={fav} onClick={() => commit(S => { S.tpl.fav[t.id] = !fav; })}>{fav ? '♥ Favourite' : '♡ Favourite'}</button>
                  </div>
                </div>
              </article>
            );
          }) : <p className="mu">No templates to show. Try turning off “Favourites only”, or tick “Show templates that don’t fit”.</p>}
        </div>
      </div>

      <div className="card" id="tpc">
        <div className="bar">
          <div className="flex-1 min-w-[200px]"><h3>{vt.name}</h3><p className="mu">{picked ? 'This is your picked template.' : vt.fam.desc + (vc.ok ? '' : ' Doesn’t fit: ' + vc.why.join('; ') + '.')}</p></div>
          <button aria-label="Previous template" onClick={() => step(-1)}>←</button>
          <button aria-label="Next template" onClick={() => step(1)}>→</button>
          <button className={picked ? '' : 'pri'} aria-pressed={picked} onClick={() => commit(S => { S.tpl.pick = S.tpl.view; })}>{picked ? 'Picked' : 'Use this template'}</button>
        </div>
        <div className="bar mt-2.5">
          <label htmlFor="tpage" className="m-0">Page</label>
          <select id="tpage" className="w-auto max-w-full" value={S.ui.tpage || ''} onChange={e => commit(S => { S.ui.tpage = e.target.value; })}>
            {S.pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <SizeButtons k="tvp" onPick={v => commit(S => { S.ui.tvp = v; })} />
        <Preview vp={S.ui.tvp} opt={{ tpl: vt.id, pageId: S.ui.tpage }} />
      </div>

      <PublishCard />

      <div className="card" id="reqc"><h3>Request development</h3>
        <p className="mu">Happy with your choices? Send them to us and we’ll build your site. Add anything you’d like changed.</p>
        <div className="g2">
          <div><label htmlFor="rname">Your name</label><input id="rname" autoComplete="name" value={S.req.name} onChange={e => commit(S => { S.req.name = e.target.value; })} /></div>
          <div><label htmlFor="remail">Email</label><input id="remail" type="email" autoComplete="email" value={S.req.email} onChange={e => commit(S => { S.req.email = e.target.value; })} /></div>
        </div>
        <label htmlFor="note">Notes for changes (optional)</label>
        <textarea id="note" rows={4} value={note} onChange={e => setNote(e.target.value)} placeholder="For example: make the hero image bigger and add our phone number to the menu." />
        <p className="mu">{S.tpl.pick ? 'Template: ' + Render.tpl(S.tpl.pick).name + '.' : 'Pick a template above (Use this template) before requesting development.'}</p>
        {msg && <p className={msg.bad ? 'errmsg' : 'okmsg'} role="alert">{msg.text}</p>}
        <div className="row"><button className="pri" onClick={request}>Request development</button></div>
        {S.notes.length > 0 && <h4>Your requests</h4>}
        <ul className="notes">
          {S.notes.map((n, i) => (
            <li key={n.id || i}>
              <div><b>{n.status || 'Requested'}</b> · {new Date(n.at).toLocaleString()} · {Render.tpl(n.tpl).name}{n.name ? ' · ' + n.name : ''}{n.text ? '\n' + n.text : ''}</div>
              <button className="ib" aria-label="Cancel request" onClick={() => commit(S => { S.notes.splice(i, 1); })}>✕</button>
            </li>
          ))}
        </ul>
        <p className="mu small">Requests are saved in this browser for now. Once Supabase is connected, they’ll be sent to us automatically.</p>
      </div>
      <p className="mu mt-4"><button onClick={() => { if (confirm('Start over? This clears everything saved in this browser.')) startOver(); }}>Start over</button></p>
    </section>
  );
}
