// Snapshot the CURRENT scientific structure of every card that has non-empty
// scientific.sections, BEFORE the data-layer refactor. Used as the golden
// baseline for verify-scientific.ts.
//
// Run:  npx tsx scripts/snapshot-scientific.ts   (from frontend/)
import * as fs from 'fs';
import * as path from 'path';
import { CARDS } from '../src/pages/DashboardPages/Tier2/knowledgeCardData';

interface Snap {
  id: string;
  ageKey: string;
  domain: string;
  scientific: {
    title: string;
    readMinutes?: number;
    reviewedBy?: { name: string; date: string };
    stats?: unknown;
    figure?: unknown;
    sections?: unknown;
    references?: unknown;
  };
}

const out: Snap[] = [];
for (const card of CARDS) {
  const sci: any = card.scientific;
  const sections = sci?.sections;
  if (!Array.isArray(sections) || sections.length === 0) continue;
  out.push({
    id: card.id,
    ageKey: card.ageKey,
    domain: card.domain,
    scientific: {
      title: sci.title,
      readMinutes: sci.readMinutes,
      reviewedBy: sci.reviewedBy,
      stats: sci.stats,
      figure: sci.figure,
      sections: sci.sections,
      references: sci.references,
    },
  });
}

const dir = path.resolve(__dirname, '../snapshots');
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, 'scientific-before.json');
fs.writeFileSync(file, JSON.stringify(out, null, 2), 'utf8');
console.log(`Wrote ${out.length} cards with scientific.sections to ${file}`);
