"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const planComposer_1 = require("./planComposer");
const activityModules_1 = require("./activityModules");
const activityModules_2 = require("./activityModules");
// Profil fixture — semua tanggal lahir dihitung dari 2026-07-17
const profil4Bulan = {
    anak: { namaPanggilan: 'Mira', tanggalLahir: '2026-03-17' },
    caregiver: { namaPanggilan: 'Bunda', peran: 'ibu', energiSaatIni: 'penuh' },
    akar: { nilaiFokus: ['mandiri', 'empatik'], musimMulai: '2026-07-17' },
};
const profil9Bulan = {
    anak: { namaPanggilan: 'Rafi', tanggalLahir: '2025-10-17' },
    caregiver: { namaPanggilan: 'Ayah', peran: 'ayah', energiSaatIni: 'cukup' },
    akar: { nilaiFokus: ['komunikatif', 'mandiri'], musimMulai: '2026-07-17' },
};
const profil15Bulan = {
    anak: { namaPanggilan: 'Dira', tanggalLahir: '2025-04-17' },
    caregiver: { namaPanggilan: 'Bunda', peran: 'ibu', energiSaatIni: 'menipis' },
    akar: { nilaiFokus: ['regulasi-emosi', 'percaya-diri'], musimMulai: '2026-07-17' },
};
const profil22Bulan = {
    anak: { namaPanggilan: 'Bagas', tanggalLahir: '2024-09-17' },
    caregiver: { namaPanggilan: 'Oma', peran: 'nenek-kakek', energiSaatIni: 'penuh' },
    akar: { nilaiFokus: ['sosial', 'komunikatif'], musimMulai: '2026-07-17' },
};
// ── COVERAGE ─────────────────────────────────────────────────────────────────
(0, vitest_1.describe)('Coverage: setiap (nilai × ageBand) punya ≥2 modul', () => {
    (0, vitest_1.it)('findCoverageGaps harus return array kosong', () => {
        const gaps = (0, activityModules_2.findCoverageGaps)(activityModules_1.ACTIVITY_MODULES);
        if (gaps.length > 0) {
            const list = gaps.map(g => `${g.nilaiId} × ${g.ageBandId}`).join(', ');
            throw new Error(`Gap coverage ditemukan: ${list}`);
        }
        (0, vitest_1.expect)(gaps).toHaveLength(0);
    });
});
// ── DETERMINISME ──────────────────────────────────────────────────────────────
(0, vitest_1.describe)('Determinisme', () => {
    (0, vitest_1.it)('panggilan berulang dengan profil + weekNumber sama → hasil identik', () => {
        const plan1 = (0, planComposer_1.composeWeeklyPlan)(profil9Bulan, 1);
        const plan2 = (0, planComposer_1.composeWeeklyPlan)(profil9Bulan, 1);
        (0, vitest_1.expect)(plan1.steps.map(s => s.moduleId)).toEqual(plan2.steps.map(s => s.moduleId));
    });
    (0, vitest_1.it)('weekNumber berbeda menghasilkan rencana berbeda (rotasi pekan 1 vs 2)', () => {
        const plan1 = (0, planComposer_1.composeWeeklyPlan)(profil9Bulan, 1);
        const plan2 = (0, planComposer_1.composeWeeklyPlan)(profil9Bulan, 2);
        // Tidak harus 100% berbeda (bisa ada overlap), tapi urutan harus berbeda
        (0, vitest_1.expect)(plan1.steps.map(s => s.moduleId)).not.toEqual(plan2.steps.map(s => s.moduleId));
    });
});
// ── FILTER USIA ───────────────────────────────────────────────────────────────
(0, vitest_1.describe)('Filter usia', () => {
    (0, vitest_1.it)('bayi 4 bulan hanya mendapat modul ageBand 0-6', () => {
        const plan = (0, planComposer_1.composeWeeklyPlan)(profil4Bulan, 1);
        (0, vitest_1.expect)(plan.ageBandId).toBe('0-6');
        for (const step of plan.steps) {
            const modul = activityModules_1.ACTIVITY_MODULES.find(m => m.id === step.moduleId);
            (0, vitest_1.expect)(modul.ageBands).toContain('0-6');
        }
    });
    (0, vitest_1.it)('bayi 9 bulan hanya mendapat modul ageBand 7-12', () => {
        const plan = (0, planComposer_1.composeWeeklyPlan)(profil9Bulan, 1);
        (0, vitest_1.expect)(plan.ageBandId).toBe('7-12');
        for (const step of plan.steps) {
            const modul = activityModules_1.ACTIVITY_MODULES.find(m => m.id === step.moduleId);
            (0, vitest_1.expect)(modul.ageBands).toContain('7-12');
        }
    });
});
// ── FILTER NILAI ──────────────────────────────────────────────────────────────
(0, vitest_1.describe)('Filter nilai', () => {
    (0, vitest_1.it)('semua modul yang dipilih relevan dengan setidaknya satu nilaiFokus', () => {
        const plan = (0, planComposer_1.composeWeeklyPlan)(profil9Bulan, 1);
        const [n1, n2] = plan.nilaiFokus;
        for (const step of plan.steps) {
            const m = activityModules_1.ACTIVITY_MODULES.find(mod => mod.id === step.moduleId);
            const relevan = m.nilaiUtama === n1 ||
                m.nilaiUtama === n2 ||
                m.nilaiPendukung?.includes(n1) ||
                m.nilaiPendukung?.includes(n2);
            (0, vitest_1.expect)(relevan, `Modul ${m.id} tidak relevan dengan ${n1}/${n2}`).toBe(true);
        }
    });
});
// ── ENERGI MENIPIS ────────────────────────────────────────────────────────────
(0, vitest_1.describe)('Energi menipis', () => {
    (0, vitest_1.it)('menghasilkan ≤3 langkah saat energi menipis', () => {
        const plan = (0, planComposer_1.composeWeeklyPlan)(profil15Bulan, 1);
        (0, vitest_1.expect)(plan.steps.length).toBeLessThanOrEqual(3);
    });
    (0, vitest_1.it)('semua modul durasi ≤10 menit saat energi menipis', () => {
        const plan = (0, planComposer_1.composeWeeklyPlan)(profil15Bulan, 2);
        for (const step of plan.steps) {
            const m = activityModules_1.ACTIVITY_MODULES.find(mod => mod.id === step.moduleId);
            (0, vitest_1.expect)(m.durasiMenit, `${m.id} durasi ${m.durasiMenit} menit — terlalu panjang untuk energi menipis`).toBeLessThanOrEqual(10);
        }
    });
});
// ── TANPA DUPLIKAT DALAM PEKAN ────────────────────────────────────────────────
(0, vitest_1.describe)('Tanpa duplikat dalam satu pekan', () => {
    (0, vitest_1.it)('tidak ada moduleId yang sama dua kali di pekan 1', () => {
        const plan = (0, planComposer_1.composeWeeklyPlan)(profil9Bulan, 1);
        const ids = plan.steps.map(s => s.moduleId);
        (0, vitest_1.expect)(new Set(ids).size).toBe(ids.length);
    });
    (0, vitest_1.it)('tidak ada moduleId yang sama dua kali di pekan 3', () => {
        const plan = (0, planComposer_1.composeWeeklyPlan)(profil22Bulan, 3);
        const ids = plan.steps.map(s => s.moduleId);
        (0, vitest_1.expect)(new Set(ids).size).toBe(ids.length);
    });
});
// ── POOL TIPIS — TANPA ERROR ──────────────────────────────────────────────────
(0, vitest_1.describe)('Pool tipis tidak melempar error', () => {
    (0, vitest_1.it)('profil dengan nilai sangat spesifik + SHOW_DRAFT_CONTENT masih return rencana', () => {
        // sosial × 0-6 adalah kombinasi yang punya pool sangat kecil
        const profilEdge = {
            anak: { namaPanggilan: 'Tes', tanggalLahir: '2026-03-17' },
            caregiver: { namaPanggilan: 'Tes', peran: 'ibu' },
            akar: { nilaiFokus: ['sosial', 'percaya-diri'], musimMulai: '2026-07-17' },
        };
        let plan;
        (0, vitest_1.expect)(() => {
            plan = (0, planComposer_1.composeWeeklyPlan)(profilEdge, 1);
        }).not.toThrow();
        // @ts-ignore — plan is assigned inside expect callback
        (0, vitest_1.expect)(plan.steps.length).toBeGreaterThanOrEqual(0);
        // @ts-ignore
        if (plan.poolTipis) {
            // @ts-ignore
            (0, vitest_1.expect)(plan.steps.length).toBeLessThan(5);
        }
    });
});
//# sourceMappingURL=planComposer.test.js.map