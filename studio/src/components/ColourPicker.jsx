/* Colour picker: your brand colours (and tints of them), every palette from art.js, a free picker and hex box. */
import { Art } from '../lib/art.js';
import { S } from '../store.js';

const KEYS = ['bg', 'ink', 'acc', 'soft'];
const okHex = v => /^#[0-9a-f]{6}$/i.test(v);

export default function ColourPicker({ label, value, onChange }) {
  const p = S.brand.pal;
  const yours = [...new Set(KEYS.map(k => p[k]).concat([Art.mix(p.acc, p.bg, .5), Art.mix(p.ink, p.bg, .3), Art.mix(p.acc, p.ink, .35), Art.mix(p.soft, p.ink, .1)]))];
  const pals = (S.brand.palFound ? [S.brand.palFound] : []).concat(Art.PALETTES);
  const Sw = ({ c }) => (
    <button type="button" className="h-6 w-6 min-h-0 rounded-md border border-line p-0" style={{ background: c, outline: value == c ? '2px solid var(--acc)' : 'none', outlineOffset: 1 }}
      aria-label={c} aria-pressed={value == c} title={c} onClick={() => onChange(c)} />
  );
  return (
    <fieldset className="m-0 mb-3 min-w-0 border-0 p-0">
      <legend className="mb-1.5 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap items-center gap-2">
        <input type="color" aria-label={label + ': choose any colour'} className="h-9 w-11 min-h-0 cursor-pointer p-0.5" value={okHex(value) ? value : '#000000'} onChange={e => onChange(e.target.value)} />
        <input aria-label={label + ': hex code'} className="w-24 min-h-9 font-mono text-sm" placeholder="Default" value={value || ''}
          onChange={e => { const v = e.target.value.trim(); if (!v) onChange(''); else if (/^#[0-9a-f]{6}$/i.test(v)) onChange(v.toLowerCase()); }} />
        {value && <button type="button" className="sm" onClick={() => onChange('')}>Default</button>}
      </div>
      <p className="mt-2 mb-1 text-xs text-muted">Your colours</p>
      <div className="flex flex-wrap gap-1.5">{yours.map(c => <Sw key={c} c={c} />)}</div>
      <details className="mt-1.5">
        <summary className="cursor-pointer text-xs text-muted">All palettes</summary>
        <div className="mt-1.5 grid gap-1.5">
          {pals.map((pl, i) => (
            <div key={i} className="flex items-center gap-1.5"><span className="w-24 truncate text-xs text-muted">{pl.name}</span>{KEYS.map(k => <Sw key={k} c={pl[k]} />)}</div>
          ))}
        </div>
      </details>
    </fieldset>
  );
}
