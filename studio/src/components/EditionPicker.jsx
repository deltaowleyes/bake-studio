/* Choose the BAKE version (editions.js). Cards in step 1; a compact menu in the header. */
import { S, commit, useStudio } from '../store.js';
import { EDITIONS, EDITION_KEYS } from '../editions.js';

function pick(k) {
  commit(S => { S.edition = k; });
  try { const u = new URL(location.href); u.searchParams.set('v', k); history.replaceState(null, '', u); } catch (e) { /* ignore */ }
}

export function EditionCards() {
  useStudio();
  return (
    <div className="card">
      <h3>Which version of BAKE?</h3>
      <p className="mu">You can change this any time. EXPRESS, IndigiHub and BAKER show the live page and its code; PRO shows screenshots.</p>
      <div className="eds" role="group" aria-label="BAKE version">
        {EDITION_KEYS.map(k => (
          <button key={k} aria-pressed={S.edition == k} onClick={() => pick(k)}>
            <b>{EDITIONS[k].name}</b><span>{EDITIONS[k].blurb}</span><span>{EDITIONS[k].price}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function EditionMenu() {
  useStudio();
  return (
    <label className="ed"><span className="mu small" style={{ margin: 0 }}>Version</span>
      <select value={S.edition} onChange={e => pick(e.target.value)} aria-label="BAKE version">
        {EDITION_KEYS.map(k => <option key={k} value={k}>{EDITIONS[k].name}</option>)}
      </select>
    </label>
  );
}
