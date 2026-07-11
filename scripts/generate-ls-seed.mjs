// Run with: node scripts/generate-ls-seed.mjs
// Uses ts-node to properly evaluate TypeScript and extract data arrays

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Write a temporary evaluator script
const tmpScript = path.join(__dirname, '_tmp_extract.ts');
fs.writeFileSync(tmpScript, `
import { ACTIVITIES, WEEKLY_PLANS, EDU_TOOLS, DOWNLOADABLES } from '../frontend/src/data/learningStrategies';
import fs from 'fs';
import path from 'path';

const seed = {
  activities: ACTIVITIES,
  plans: WEEKLY_PLANS,
  tools: EDU_TOOLS,
  downloads: DOWNLOADABLES,
};

const outDir = path.join(__dirname, '../backend/src/seeds');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'learningStrategies.json');
fs.writeFileSync(outFile, JSON.stringify(seed, null, 2));
console.log('Wrote ' + outFile);
console.log('activities: ' + seed.activities.length);
console.log('plans: ' + seed.plans.length);
console.log('tools: ' + seed.tools.length);
console.log('downloads: ' + seed.downloads.length);
`);

try {
  // Use ts-node from the backend directory
  const result = execSync(
    `npx ts-node --project tsconfig.json ${tmpScript}`,
    {
      cwd: path.join(ROOT, 'backend'),
      encoding: 'utf-8',
      stdio: 'pipe',
    }
  );
  console.log(result);
} catch (e) {
  console.error('ts-node failed:', e.stderr || e.message);
  // Fallback: write minimal seed from inline data
  console.log('Writing minimal seed...');
  writeFallbackSeed();
} finally {
  if (fs.existsSync(tmpScript)) fs.unlinkSync(tmpScript);
}

function writeFallbackSeed() {
  // Minimal seed to get the backend tables populated
  // Full data will be synced when admin visits the page
  const seed = { activities: [], plans: [], tools: [], downloads: [] };
  const outDir = path.join(ROOT, 'backend/src/seeds');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'learningStrategies.json'), JSON.stringify(seed, null, 2));
  console.log('Wrote empty fallback seed (admin will seed on first visit)');
}
