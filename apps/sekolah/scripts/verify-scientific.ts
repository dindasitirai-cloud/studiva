// Verify composeScientific() reproduces the pre-refactor scientific snapshot.
// Compares title, readMinutes, reviewedBy, figure.id, sections (count+judul+isi)
// and stats (value+label). Citation-number-only differences are reported as
// CITATION_SHIFT (allowed); any other difference is an ERROR.
//
// Run:  npx tsx scripts/verify-scientific.ts   (from frontend/)
import * as fs from 'fs';
import * as path from 'path';
import { CARDS } from '../src/pages/DashboardPages/Tier2/knowledgeCardData';
import { composeScientific } from '../src/lib/composeScientific';

const dir = path.resolve(__dirname, '../snapshots');
const before = JSON.parse(fs.readFileSync(path.join(dir, 'scientific-before.json'), 'utf8')) as any[];
const byId = new Map(CARDS.map((c) => [c.id, c]));

const stripCite = (s: string) => s.replace(/\[\d+\]/g, '[#]');

let errors = 0;
let shifts = 0;
let ok = 0;
const after: any[] = [];
const lines: string[] = [];

for (const snap of before) {
  const card = byId.get(snap.id);
  if (!card) { console.error(`ERROR: card ${snap.id} no longer exists`); errors++; continue; }
  const got = composeScientific(card as any);
  const want = snap.scientific;
  after.push({ id: snap.id, scientific: got });

  const errs: string[] = [];
  let shifted = false;

  if (got.title !== want.title) errs.push(`title`);
  if ((got.readMinutes ?? null) !== (want.readMinutes ?? null)) errs.push(`readMinutes`);
  const rb1 = JSON.stringify(got.reviewedBy ?? null);
  const rb2 = JSON.stringify(want.reviewedBy ?? null);
  if (rb1 !== rb2) errs.push(`reviewedBy`);
  if ((got.figure?.id ?? null) !== (want.figure?.id ?? null)) errs.push(`figure.id`);

  // sections
  const gs = got.sections ?? [];
  const ws = want.sections ?? [];
  if (gs.length !== ws.length) {
    errs.push(`sections.count ${ws.length}->${gs.length}`);
  } else {
    for (let i = 0; i < ws.length; i++) {
      if (gs[i].judul !== ws[i].judul) errs.push(`§${i}.judul`);
      if (gs[i].isi !== ws[i].isi) {
        if (stripCite(gs[i].isi) === stripCite(ws[i].isi)) shifted = true;
        else errs.push(`§${i}.isi`);
      }
    }
  }

  // stats
  const gt = got.stats ?? [];
  const wt = want.stats ?? [];
  if (gt.length !== wt.length) {
    errs.push(`stats.count ${wt.length}->${gt.length}`);
  } else {
    for (let i = 0; i < wt.length; i++) {
      if (gt[i].value !== wt[i].value) errs.push(`stat${i}.value`);
      if (gt[i].label !== wt[i].label) errs.push(`stat${i}.label`);
    }
  }

  if (errs.length) { errors++; lines.push(`ERROR ${snap.id}: mismatch in ${errs.join(', ')}`); }
  else if (shifted) { shifts++; lines.push(`CITATION_SHIFT ${snap.id}: citation numbers renumbered (text identical)`); }
  else { ok++; lines.push(`OK ${snap.id}`); }
}

fs.writeFileSync(path.join(dir, 'scientific-after.json'), JSON.stringify(after, null, 2), 'utf8');

console.log(lines.join('\n'));
console.log(`\nSummary: ${ok} OK, ${shifts} CITATION_SHIFT, ${errors} ERROR (of ${before.length} cards)`);
process.exit(errors > 0 ? 1 : 0);
