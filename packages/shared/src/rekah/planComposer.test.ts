import { describe, it, expect } from 'vitest';
import { composeWeeklyPlan, SHOW_DRAFT_CONTENT } from './planComposer';
import { ACTIVITY_MODULES } from './activityModules';
import { findCoverageGaps } from './activityModules';
import type { RekahProfile } from './profiles';

// Profil fixture — semua tanggal lahir dihitung dari 2026-07-17
const profil4Bulan: RekahProfile = {
  anak: { namaPanggilan: 'Mira', tanggalLahir: '2026-03-17' },
  caregiver: { namaPanggilan: 'Bunda', peran: 'ibu', energiSaatIni: 'penuh' },
  akar: { nilaiFokus: ['mandiri', 'empatik'], musimMulai: '2026-07-17' },
};

const profil9Bulan: RekahProfile = {
  anak: { namaPanggilan: 'Rafi', tanggalLahir: '2025-10-17' },
  caregiver: { namaPanggilan: 'Ayah', peran: 'ayah', energiSaatIni: 'cukup' },
  akar: { nilaiFokus: ['komunikatif', 'mandiri'], musimMulai: '2026-07-17' },
};

const profil15Bulan: RekahProfile = {
  anak: { namaPanggilan: 'Dira', tanggalLahir: '2025-04-17' },
  caregiver: { namaPanggilan: 'Bunda', peran: 'ibu', energiSaatIni: 'menipis' },
  akar: { nilaiFokus: ['regulasi-emosi', 'percaya-diri'], musimMulai: '2026-07-17' },
};

const profil22Bulan: RekahProfile = {
  anak: { namaPanggilan: 'Bagas', tanggalLahir: '2024-09-17' },
  caregiver: { namaPanggilan: 'Oma', peran: 'nenek-kakek', energiSaatIni: 'penuh' },
  akar: { nilaiFokus: ['sosial', 'komunikatif'], musimMulai: '2026-07-17' },
};

// ── COVERAGE ─────────────────────────────────────────────────────────────────

describe('Coverage: setiap (nilai × ageBand) punya ≥2 modul', () => {
  it('findCoverageGaps harus return array kosong', () => {
    const gaps = findCoverageGaps(ACTIVITY_MODULES);
    if (gaps.length > 0) {
      const list = gaps.map(g => `${g.nilaiId} × ${g.ageBandId}`).join(', ');
      throw new Error(`Gap coverage ditemukan: ${list}`);
    }
    expect(gaps).toHaveLength(0);
  });
});

// ── DETERMINISME ──────────────────────────────────────────────────────────────

describe('Determinisme', () => {
  it('panggilan berulang dengan profil + weekNumber sama → hasil identik', () => {
    const plan1 = composeWeeklyPlan(profil9Bulan, 1);
    const plan2 = composeWeeklyPlan(profil9Bulan, 1);
    expect(plan1.steps.map(s => s.moduleId)).toEqual(plan2.steps.map(s => s.moduleId));
  });

  it('weekNumber berbeda menghasilkan rencana berbeda (rotasi pekan 1 vs 2)', () => {
    const plan1 = composeWeeklyPlan(profil9Bulan, 1);
    const plan2 = composeWeeklyPlan(profil9Bulan, 2);
    // Tidak harus 100% berbeda (bisa ada overlap), tapi urutan harus berbeda
    expect(plan1.steps.map(s => s.moduleId)).not.toEqual(plan2.steps.map(s => s.moduleId));
  });
});

// ── FILTER USIA ───────────────────────────────────────────────────────────────

describe('Filter usia', () => {
  it('bayi 4 bulan hanya mendapat modul ageBand 0-6', () => {
    const plan = composeWeeklyPlan(profil4Bulan, 1);
    expect(plan.ageBandId).toBe('0-6');
    for (const step of plan.steps) {
      const modul = ACTIVITY_MODULES.find(m => m.id === step.moduleId)!;
      expect(modul.ageBands).toContain('0-6');
    }
  });

  it('bayi 9 bulan hanya mendapat modul ageBand 7-12', () => {
    const plan = composeWeeklyPlan(profil9Bulan, 1);
    expect(plan.ageBandId).toBe('7-12');
    for (const step of plan.steps) {
      const modul = ACTIVITY_MODULES.find(m => m.id === step.moduleId)!;
      expect(modul.ageBands).toContain('7-12');
    }
  });
});

// ── FILTER NILAI ──────────────────────────────────────────────────────────────

describe('Filter nilai', () => {
  it('semua modul yang dipilih relevan dengan setidaknya satu nilaiFokus', () => {
    const plan = composeWeeklyPlan(profil9Bulan, 1);
    const [n1, n2] = plan.nilaiFokus;
    for (const step of plan.steps) {
      const m = ACTIVITY_MODULES.find(mod => mod.id === step.moduleId)!;
      const relevan =
        m.nilaiUtama === n1 ||
        m.nilaiUtama === n2 ||
        m.nilaiPendukung?.includes(n1) ||
        m.nilaiPendukung?.includes(n2);
      expect(relevan, `Modul ${m.id} tidak relevan dengan ${n1}/${n2}`).toBe(true);
    }
  });
});

// ── ENERGI MENIPIS ────────────────────────────────────────────────────────────

describe('Energi menipis', () => {
  it('menghasilkan ≤3 langkah saat energi menipis', () => {
    const plan = composeWeeklyPlan(profil15Bulan, 1);
    expect(plan.steps.length).toBeLessThanOrEqual(3);
  });

  it('semua modul durasi ≤10 menit saat energi menipis', () => {
    const plan = composeWeeklyPlan(profil15Bulan, 2);
    for (const step of plan.steps) {
      const m = ACTIVITY_MODULES.find(mod => mod.id === step.moduleId)!;
      expect(m.durasiMenit, `${m.id} durasi ${m.durasiMenit} menit — terlalu panjang untuk energi menipis`).toBeLessThanOrEqual(10);
    }
  });
});

// ── TANPA DUPLIKAT DALAM PEKAN ────────────────────────────────────────────────

describe('Tanpa duplikat dalam satu pekan', () => {
  it('tidak ada moduleId yang sama dua kali di pekan 1', () => {
    const plan = composeWeeklyPlan(profil9Bulan, 1);
    const ids = plan.steps.map(s => s.moduleId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tidak ada moduleId yang sama dua kali di pekan 3', () => {
    const plan = composeWeeklyPlan(profil22Bulan, 3);
    const ids = plan.steps.map(s => s.moduleId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── POOL TIPIS — TANPA ERROR ──────────────────────────────────────────────────

describe('Pool tipis tidak melempar error', () => {
  it('profil dengan nilai sangat spesifik + SHOW_DRAFT_CONTENT masih return rencana', () => {
    // sosial × 0-6 adalah kombinasi yang punya pool sangat kecil
    const profilEdge: RekahProfile = {
      anak: { namaPanggilan: 'Tes', tanggalLahir: '2026-03-17' }, // 4 bulan
      caregiver: { namaPanggilan: 'Tes', peran: 'ibu' },
      akar: { nilaiFokus: ['sosial', 'percaya-diri'], musimMulai: '2026-07-17' },
    };
    let plan: ReturnType<typeof composeWeeklyPlan>;
    expect(() => {
      plan = composeWeeklyPlan(profilEdge, 1);
    }).not.toThrow();
    // @ts-ignore — plan is assigned inside expect callback
    expect(plan!.steps.length).toBeGreaterThanOrEqual(0);
    // @ts-ignore
    if (plan!.poolTipis) {
      // @ts-ignore
      expect(plan!.steps.length).toBeLessThan(5);
    }
  });
});
