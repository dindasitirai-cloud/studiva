// KONTEN: aturan komposisi rencana — review bersama Psikolog Fitri sebelum rilis.

import type { NilaiId } from './values';
import type { AgeBandId } from './ageBands';
import type { ActivityModule, ActivityModuleId } from './activityModules';
import type { RekahProfile } from './profiles';
import { hitungUsiaBulan } from './profiles';
import { getAgeBand } from './ageBands';
import { ACTIVITY_MODULES } from './activityModules';
import { WEEKLY_PLAN_TEMPLATES } from './weeklyPlanTemplates';

// TODO: set false sebelum rilis — saat false hanya modul status 'published' yang tampil
export const SHOW_DRAFT_CONTENT = true;

const STEPS_NORMAL = 5;
const STEPS_MENIPIS = 3;
const MAX_DURASI_MENIPIS = 10; // menit

export interface ComposedStep {
  posisi: number; // 1-based
  moduleId: ActivityModuleId;
}

export interface ComposedPlan {
  weekNumber: number;
  nilaiFokus: [NilaiId, NilaiId];
  ageBandId: AgeBandId;
  steps: ComposedStep[];
  poolTipis: boolean; // true jika kandidat modul lebih sedikit dari jumlah langkah ideal
}

export function composeWeeklyPlan(profile: RekahProfile, weekNumber: number): ComposedPlan {
  const usiaBulan = hitungUsiaBulan(profile.anak.tanggalLahir);
  const ageBandId: AgeBandId = getAgeBand(usiaBulan)?.id ?? '25-36';

  const [nilai1, nilai2] = profile.akar.nilaiFokus;
  const energiMenipis = profile.caregiver.energiSaatIni === 'menipis';
  const stepCount = energiMenipis ? STEPS_MENIPIS : STEPS_NORMAL;

  // Bangun kandidat pool: modul yang cocok dengan usia dan minimal satu nilai fokus
  let pool: ActivityModule[] = ACTIVITY_MODULES.filter(
    m =>
      m.ageBands.includes(ageBandId) &&
      (m.nilaiUtama === nilai1 ||
        m.nilaiUtama === nilai2 ||
        m.nilaiPendukung?.includes(nilai1) ||
        m.nilaiPendukung?.includes(nilai2)),
  );

  if (!SHOW_DRAFT_CONTENT) {
    pool = pool.filter(m => m.status === 'published');
  }

  if (energiMenipis) {
    pool = pool.filter(m => m.durasiMenit <= MAX_DURASI_MENIPIS);
  }

  // Sort deterministik berdasarkan id — hasil selalu sama untuk input yang sama
  pool = [...pool].sort((a, b) => a.id.localeCompare(b.id));

  const effectiveCount = Math.min(stepCount, pool.length);
  const poolTipis = pool.length < stepCount;

  let selectedIds: ActivityModuleId[];

  if (weekNumber === 1) {
    selectedIds = composeWeek1(pool, nilai1, ageBandId, effectiveCount);
  } else {
    const offset = ((weekNumber - 1) * stepCount) % Math.max(pool.length, 1);
    selectedIds = pickFromPool(pool, effectiveCount, offset);
  }

  return {
    weekNumber,
    nilaiFokus: [nilai1, nilai2],
    ageBandId,
    steps: selectedIds.map((id, i) => ({ posisi: i + 1, moduleId: id })),
    poolTipis,
  };
}

function composeWeek1(
  pool: ActivityModule[],
  nilaiPrimer: NilaiId,
  ageBandId: AgeBandId,
  count: number,
): ActivityModuleId[] {
  const template = WEEKLY_PLAN_TEMPLATES.find(
    t => t.nilaiTema === nilaiPrimer && t.ageBand === ageBandId,
  );

  if (!template) {
    return pickFromPool(pool, count, 0);
  }

  const poolIds = new Set(pool.map(m => m.id));
  const fromTemplate = template.hari
    .map(h => h.activityModuleId)
    .filter(id => poolIds.has(id));

  const usedIds = new Set(fromTemplate);
  const fromPool = pool
    .filter(m => !usedIds.has(m.id))
    .slice(0, count - fromTemplate.length)
    .map(m => m.id);

  return [...fromTemplate, ...fromPool].slice(0, count);
}

function pickFromPool(
  pool: ActivityModule[],
  count: number,
  offset: number,
): ActivityModuleId[] {
  if (pool.length === 0) return [];
  const n = pool.length;
  const result: ActivityModuleId[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[(offset + i) % n].id);
  }
  return result;
}
