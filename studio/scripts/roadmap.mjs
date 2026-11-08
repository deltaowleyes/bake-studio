// Makes ROADMAP.md from ROADMAP.json (the BAKE PRO list). Run: node studio/scripts/roadmap.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../../', import.meta.url);
const d = JSON.parse(readFileSync(new URL('ROADMAP.json', root), 'utf8'));
const f = Object.fromEntries(d.fields.map((k, i) => [k, i]));
const cell = s => String(s || '').replace(/\|/g, '\\|');
let md = `# BAKE PRO roadmap

Every idea for BAKE Studio, in one list. These are possible avenues, not a to-do list. The list itself lives in \`ROADMAP.json\` (edit that file and the BAKE PRO buttons update too); this page is made from it by \`node studio/scripts/roadmap.mjs\`. Business plan: \`VISION.md\`. Updated ${d.updated}. ${d.tasks.length} tasks.

**Already done:** ${d.done.join('; ')}.

**Top picks** are marked ★. **Plan first** means Claude shows a plan and costs and waits for an OK before building.
`;
// JavaScript puts number-like keys first, so list Anytime first on purpose.
const order = ['Anytime', ...Object.keys(d.phases).filter(k => k !== 'Anytime')];
for (const key of order) {
  const desc = d.phases[key];
  const rows = d.tasks.filter(t => t[f.phase] === key);
  md += `\n## ${key === 'Anytime' ? 'Anytime' : 'Phase ' + key}: ${desc}\n\n| | Task | Area | Size | You'll need |\n|---|---|---|---|---|\n`;
  for (const t of rows)
    md += `| ${t[f.top] ? '★' : ''} | **${cell(t[f.title])}**${t[f.planFirst] ? ' (plan first)' : ''}<br>${cell(t[f.why])} | ${t[f.area]} | ${t[f.size]} | ${cell(t[f.need]) || '—'} |\n`;
}
writeFileSync(new URL('ROADMAP.md', root), md);
console.log(`ROADMAP.md written: ${d.tasks.length} tasks.`);
