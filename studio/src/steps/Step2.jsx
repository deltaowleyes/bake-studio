/* Step 2: Brand. Business name, logo / hero / illustration options from four sources, colours, fonts. */
import { useRef, useState } from 'react';
import { Art } from '../lib/art.js';
import { Render } from '../lib/render.js';
import { S, commit, useStudio } from '../store.js';
import { nid, genSvg, libOpt, defPrompt, shrink, addLib } from '../edit.js';
import Preview, { SizeButtons } from '../components/Preview.jsx';
import Html from '../components/Html.jsx';

const BT = [['logo', 'Logo'], ['hero', 'Hero image'], ['ill', 'Illustrations']];
const SRC = [['svg', 'Generated'], ['upload', 'Upload'], ['ai', 'AI images'], ['site', 'From your site']];
const COLOURS = [['bg', 'Background'], ['ink', 'Text'], ['acc', 'Accent'], ['soft', 'Soft panels']];

export default function Step2() {
  useStudio();
  const b = S.brand, t = S.ui.btab, src = S.ui.bsrc;
  const [aiMsg, setAiMsg] = useState(null);
  const libUrl = useRef(null);

  async function aiGenerate(prompt) {
    setAiMsg('Generating…');
    try {
      if (S.ai.endpoint) {
        const r = await fetch(S.ai.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, type: t, n: 4 }) });
        const j = await r.json();
        commit(() => (j.images || []).forEach(s => b.opts[t].push({ id: nid('o'), kind: 'img', src: s, from: 'ai', label: prompt.slice(0, 60) })));
      } else {
        commit(() => Art.genOptions(t, 900 + (++b.seed[t]), 4).forEach(o => { o.id = nid('o'); o.from = 'ai'; o.label = 'Sample for: ' + prompt.slice(0, 50); b.opts[t].push(o); }));
      }
      setAiMsg(null);
    } catch (e) { setAiMsg('The image service didn’t answer: ' + e.message); }
  }
  function upload(e) {
    const files = Array.from(e.target.files);
    Promise.all(files.map(f => shrink(f, t == 'hero' ? 1600 : 700).then(s => ({ id: nid('o'), kind: 'img', src: s, from: 'upload', label: f.name }))))
      .then(list => commit(() => { b.opts[t] = b.opts[t].concat(list); if (list[0]) b.pick[t] = list[0].id; }))
      .catch(() => alert('That file couldn’t be read as an image.'));
    e.target.value = '';
  }
  function addByLink() {
    const lu = libUrl.current.value.trim(); if (!/^https?:\/\//.test(lu)) { libUrl.current.focus(); return; }
    commit(S => { addLib([{ id: nid('L'), src: lu, label: 'Added by link', logo: S.ui.btab == 'logo' }]); S.ui.libq = ''; });
    libUrl.current.value = '';
  }

  let list = b.opts[t].filter(o => (src == 'upload' ? o.from == 'upload' : o.from == src));
  if (src == 'site') {
    const have = {}; b.opts[t].forEach(o => { if (o.kind == 'img') have[o.src] = o; });
    const q = S.ui.libq.toLowerCase();
    list = S.lib.filter(l => !q || (l.label + ' ' + l.src).toLowerCase().indexOf(q) >= 0)
      .sort((x, y) => (t == 'logo' ? y.logo - x.logo : x.logo - y.logo)).slice(0, 120)
      .map(l => have[l.src] || { id: 'lib:' + l.id, kind: 'img', src: l.src, from: 'site', label: l.label });
  }
  const pals = (b.palFound ? [b.palFound] : []).concat(Art.PALETTES);

  return (
    <section className="step" aria-labelledby="h2s">
      <h2 id="h2s" className="sth">2. Brand</h2>
      <div className="card"><h3>Business</h3>
        <div className="g2">
          <div><label htmlFor="bname">Name</label><input id="bname" value={S.biz.name} onChange={e => commit(S => { S.biz.name = e.target.value; })} /></div>
          <div><label htmlFor="bdesc">Short description</label><input id="bdesc" value={S.biz.desc} onChange={e => commit(S => { S.biz.desc = e.target.value; })} /></div>
        </div>
      </div>

      <div className="card"><h3>Logo, hero image and illustrations</h3>
        <div className="row" role="group" aria-label="Asset">
          {BT.map(x => {
            const n = b.opts[x[0]].filter(o => b.star[o.id]).length;
            return <button key={x[0]} aria-pressed={t == x[0]} onClick={() => commit(S => { S.ui.btab = x[0]; if (S.ui.bsrc == 'site' && !b.opts[x[0]].some(o => o.from == 'site')) S.ui.bsrc = 'svg'; })}>{x[1]}{n ? ' (' + n + ' ★)' : ''}</button>;
          })}
        </div>
        <div className="row" role="group" aria-label="Source">
          {SRC.filter(x => x[0] != 'site' || S.lib.length).map(x => <button key={x[0]} className="sm" aria-pressed={src == x[0]} onClick={() => commit(S => { S.ui.bsrc = x[0]; })}>{x[1]}</button>)}
        </div>
        <div className="sub">
          {src == 'svg' && <>
            <p className="mu">Simple artwork drawn in your colours. Star the ones you like; starred ones stay when you generate more.</p>
            <div className="row"><button onClick={() => commit(() => genSvg(t))}>Generate more</button></div>
          </>}
          {src == 'upload' && <>
            <p className="mu">Upload {t == 'ill' ? 'one or more images' : 'an image'} (PNG, JPG, SVG or WebP). Large photos are shrunk to save space.</p>
            <div className="row"><label className="filebtn pri">Choose file{t == 'ill' ? 's' : ''}<input type="file" accept="image/*" multiple={t == 'ill'} onChange={upload} /></label></div>
          </>}
          {src == 'ai' && <>
            <label htmlFor="aip">Describe what you want</label>
            <textarea id="aip" rows={3} value={S.ui.prompt[t] || defPrompt(t)} onChange={e => commit(S => { S.ui.prompt[t] = e.target.value; })} />
            <div className="row"><button className="pri" onClick={() => aiGenerate(S.ui.prompt[t] || defPrompt(t))}>Generate 4 images</button></div>
            <p className="mu">{aiMsg || (S.ai.endpoint ? 'Uses your connected OpenAI image service.' : 'Real AI images switch on when we connect Supabase (it keeps your OpenAI key safe). Until then this makes sample artwork so you can try the flow.')}</p>
          </>}
          {src == 'site' && <>
            <p className="mu">Every image found on your website ({S.lib.length}). Tap Use to make one your {{ logo: 'logo', hero: 'hero image', ill: 'main illustration' }[t]}, or Star to keep it handy.{t == 'logo' ? ' Likely logos are listed first.' : ''}</p>
            <div className="row nowrap">
              <input placeholder="Search images by name" aria-label="Search images" value={S.ui.libq} onChange={e => commit(S => { S.ui.libq = e.target.value; })} />
              <input ref={libUrl} placeholder="Or paste an image link (https://…)" aria-label="Image link" />
              <button onClick={addByLink}>Add</button>
            </div>
          </>}
        </div>
        <div className="grid">
          {list.length ? list.map(o => {
            const on = b.pick[t] == o.id;
            return (
              <div key={o.id} className={'opt' + (on ? ' sel' : '')}>
                <Html as="div" className={'thumb' + (t != 'logo' ? ' full' : '')} style={{ background: t == 'logo' ? b.pal.bg : '#fff' }} html={Render.asset(S, o, t, 56)} />
                {o.label && <p className="src">{o.label}</p>}
                <div className="row">
                  <button aria-pressed={!!b.star[o.id]} onClick={() => commit(() => { const id = libOpt(o.id); b.star[id] = !b.star[id]; })}>{b.star[o.id] ? '★ Starred' : '☆ Star'}</button>
                  <button aria-pressed={on} onClick={() => commit(() => { b.pick[t] = libOpt(o.id); })}>{on ? 'In use' : 'Use'}</button>
                  {(o.from == 'upload' || o.from == 'ai') && <button className="ib" aria-label="Remove" onClick={() => commit(() => { b.opts[t] = b.opts[t].filter(x => x.id != o.id); if (b.pick[t] == o.id) b.pick[t] = b.opts[t][0] && b.opts[t][0].id; })}>✕</button>}
                </div>
              </div>
            );
          }) : <p className="mu">Nothing here yet.</p>}
        </div>
      </div>

      <div className="card"><h3>Colours</h3>
        <div className="pals">
          {pals.map((p, i) => {
            const on = ['bg', 'ink', 'acc', 'soft'].every(k => p[k] == b.pal[k]);
            return (
              <button key={i} className="pal" aria-pressed={on} onClick={() => commit(() => { b.pal = Object.assign({}, p); })}>
                <span className="sws">{['bg', 'ink', 'acc', 'soft'].map(k => <span key={k} style={{ background: p[k] }} />)}</span>{p.name}
              </button>
            );
          })}
        </div>
        <div className="cols">
          {COLOURS.map(c => (
            <div className="c" key={c[0]}>
              <input type="color" id={'pc-' + c[0]} value={b.pal[c[0]]} onChange={e => commit(() => { b.pal[c[0]] = e.target.value; })} />
              <label htmlFor={'pc-' + c[0]}>{c[1]}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="card"><h3>Fonts</h3>
        <div className="fonts">
          {Art.FONTS.map((f, i) => (
            <button key={i} aria-pressed={b.font == i} onClick={() => commit(() => { b.font = i; })}>
              <b style={{ fontFamily: f.h.replace(/"/g, "'") }}>Aa Headline</b><span>{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card"><h3>Preview</h3>
        <SizeButtons k="vp" onPick={v => commit(S => { S.ui.vp = v; })} />
        <Preview vp={S.ui.vp} />
      </div>
    </section>
  );
}
