# REKAH BUILD 3/4 — REPORT

**Status:** COMPLETE  
**Date:** 2026-07-17  
**Branch:** `feat/rekah-plan-langkah-kecil`

---

## Verifikasi Akhir

| Check | Result |
|---|---|
| `pnpm --filter @studiva/shared build` | ✅ PASS |
| `pnpm --filter digital typecheck` | ✅ PASS |
| `pnpm --filter @studiva/shared test` (11 tests) | ✅ 11/11 PASS |
| Kata terlarang (normal, seharusnya, tertinggal, terlambat, rata-rata, streak) | ✅ 0 hasil |
| amber- di file baru | ✅ 0 hasil |
| `apps/sekolah` tidak tersentuh | ✅ Konfirmasi |
| `localStorage` tidak digunakan | ✅ Konfirmasi |

---

## FASE 1 — Ekspansi Activity Modules

### `packages/shared/src/rekah/activityModules.ts` (DITULIS ULANG)

**Interface diperluas** (non-breaking, semua field baru opsional `?`):
- `kenapaIni?` — mengapa aktivitas ini penting (1-2 kalimat)
- `script?` — kalimat siap pakai untuk caregiver
- `avoid?` — hal yang sebaiknya dihindari (nada santai)
- `amati?` — apa yang perlu diamati
- `sumberIds?` — ID sumber dari SOURCES registry

**31 modul total** (dari 5 seed sebelumnya), tersebar per nilaiUtama:

| Nilai | Jumlah Modul | Rentang Usia |
|---|---|---|
| Mandiri | 9 | 0-6 s/d 25-36 |
| Empatik | 7 | 0-6 s/d 25-36 |
| Percaya Diri | 5 | 0-6 s/d 25-36 |
| Regulasi Emosi | 5 | 0-6 s/d 25-36 |
| Komunikatif | 5 | 0-6 s/d 25-36 |
| Sosial | 5 | 0-6 s/d 25-36 |

Modul baru yang ditambahkan untuk menutup gap coverage:
- `am-senyum-balas` (empatik × 0-6)
- `am-genggam` (percaya-diri × 0-6)
- `am-bercerita-bersama` (sosial × 0-6)
- `am-bermain-paralel` (sosial × 13-18, 19-24) — gap sosial×13-18

**Validasi coverage:** `findCoverageGaps()` mengembalikan array kosong.  
Semua 30 kombinasi (6 nilai × 5 ageBand) memiliki ≥2 modul.

Modul topik medis dilewati: tidur aman (SIDS), ASI/MPASI, gigi, pertumbuhan, imunisasi, deteksi dini (DK) — jalur review Apoteker/Dokter sebelum masuk Rekah.

### `packages/shared/src/rekah/weeklyPlanTemplates.ts` (DITULIS ULANG)

**8 template terisi** untuk kombinasi nilaiTema × ageBand paling umum:

| ID | Judul | nilaiTema | ageBand |
|---|---|---|---|
| wpt-001 | Pekan Pertama: Bergerak Sendiri | mandiri | 0-6 |
| wpt-002 | Pekan Kedekatan & Kepekaan | empatik | 0-6 |
| wpt-003 | Eksplorasi Aktif | mandiri | 7-12 |
| wpt-004 | Belajar Bicara Bersama | komunikatif | 7-12 |
| wpt-005 | Tenang di Tengah Badai Kecil | regulasi-emosi | 13-18 |
| wpt-006 | Berani Mencoba Sendiri | percaya-diri | 13-18 |
| wpt-007 | Mengenal Perasaan Besar | regulasi-emosi | 19-24 |
| wpt-008 | Belajar Bersama Dunia | sosial | 25-36 |

---

## FASE 2 — Plan Composer

### `packages/shared/src/rekah/planComposer.ts` (BARU)

**Tipe:**
- `ComposedStep { posisi, moduleId }` — satu langkah dalam rencana
- `ComposedPlan { weekNumber, nilaiFokus, ageBandId, steps, poolTipis }` — rencana satu pekan

**`composeWeeklyPlan(profile, weekNumber)`:**
1. Hitung usiaBulan dari `profile.anak.tanggalLahir`
2. Resolve ageBandId (fallback: `'25-36'` untuk usia >36 bulan)
3. Filter kandidat pool: ageBand + nilaiUtama/nilaiPendukung cocok dengan nilaiFokus
4. Guard `SHOW_DRAFT_CONTENT` (default `true`; set `false` sebelum rilis)
5. Filter energi menipis: jika `energiSaatIni === 'menipis'`, hanya modul ≤10 menit, max 3 langkah
6. Sort deterministik berdasarkan `id` (localeCompare)
7. **Pekan 1:** cari template matching nilaiTema = nilaiFokus[0] + ageBand → gunakan urutan template; jika tidak ada → pool
8. **Pekan 2-4:** offset `= ((weekNumber - 1) × stepCount) % pool.length` → rotasi deterministik, tanpa duplikat dalam pekan

### `packages/shared/src/rekah/planComposer.test.ts` (BARU)

11 test cases dengan vitest:
- ✅ Coverage: setiap (nilai × ageBand) ≥2 modul
- ✅ Determinisme: panggilan berulang identik
- ✅ Rotasi: weekNumber berbeda → rencana berbeda
- ✅ Filter usia: ageBandId sesuai usiaBulan
- ✅ Filter nilai: semua modul relevan minimal satu nilaiFokus
- ✅ Energi menipis: ≤3 langkah, semua ≤10 menit
- ✅ Tanpa duplikat dalam pekan (pekan 1 dan 3)
- ✅ Pool tipis tidak melempar error

---

## FASE 3 — Context & Copy

### `apps/digital/src/features/rekah-plan/rekahPlanCopy.ts` (BARU)
- Semua copy UI terpusat
- `// KONTEN: wajib review Psikolog Fitri sebelum rilis`

### `apps/digital/src/context/RekahPlanContext.tsx` (BARU)
- `RekahPlanProvider` — state session-only, tanpa localStorage
- `useRekahPlan()` hook
- `plan`, `currentWeek`, `completions`, `swappedIds`
- `markComplete(moduleId)` — `// TODO: POST /api/me/rekah-completions`
- `markSwap(moduleId)`, `isComplete()`, `isSwapped()`, `allDone`

---

## FASE 4 — UI

### `apps/digital/src/features/rekah-plan/LangkahKecilCard.tsx` (BARU)

Komponen kartu langkah kecil lengkap:
- Judul + badge posisi + nilai chip + durasi
- Deskripsi + "Selengkapnya ▾" / "Sembunyikan ▴" toggle
- Expanded: `kenapaIni` + sumber (dari SOURCES registry), langkah bernomor, script (Caveat font + tombol Salin), avoid (ikon AlertCircle madu), amati (background pucuk)
- **"Tandai selesai"** → pulse madu + "Merekah! 🌸" → `onSelesai()` callback
- **"Belum pas hari ini"** → `onBelumPas()` callback (tersembunyi di langkah terakhir)
- **Share** → Web Share API → fallback wa.me; text: judul + langkah[0] + script (tanpa data personal)
- A11y: `role="article"`, aria-label, aria-expanded, `min-h-[44px]` touch targets, `focus-visible:ring-rekah`

### `apps/digital/src/pages/DashboardPages/Tier2/RencanaPage.tsx` (BARU)
- Route: `/dashboard/tier2/rencana`
- Compose plan dari RekahProfile saat mount
- Header: Pekan N + "Musim nilai1 & nilai2" + langkahCount
- `KelopakProgress` menampilkan progres kelopak terisi
- Kartu langkah aktif satu per satu (progressive disclosure)
- Preview 2 langkah berikutnya (tertutup/dim)
- `allDone` → layar perayaan "Pekan ini penuh mekar! 🌸"

### `apps/digital/src/pages/DashboardPages/Tier2/BerandaRekah.tsx` (DIUBAH)
- Langkah Kecil placeholder diganti dengan tombol preview yang menampilkan modul pertama plan
- Klik → navigate ke `/dashboard/tier2/rencana`
- Plan di-compose saat beranda mount (jika belum ada plan di context)

### File yang diperbarui:

| File | Perubahan |
|---|---|
| `apps/digital/src/App.tsx` | + `RekahPlanProvider`, + route `rencana` + import `RencanaPage` |
| `apps/digital/src/pages/DashboardPages/Tier2/SidebarTier2.tsx` | + nav item "Rencana Pekan Ini" dengan ikon `CalendarDays` |
| `apps/digital/src/pages/DashboardPages/Tier2/DashboardShellTier2.tsx` | + `PAGE_TITLES['/dashboard/tier2/rencana']` |

---

## TODOs — Semua Path

| Lokasi | Keterangan |
|---|---|
| `planComposer.ts:9` | `SHOW_DRAFT_CONTENT = true` — set false sebelum rilis |
| `RekahPlanContext.tsx` markComplete | `POST /api/me/rekah-completions` — simpan ke backend |
| `BerandaRekah.tsx` + `RencanaPage.tsx` | `GET /api/me/rekah-plan` — muat plan pekan dari backend |
| `RencanaPage.tsx` semuaSelesai | Build 4 — link ke Jejak Mekar |
| `activityModules.ts` header | Modul medis/kesehatan — jalur review Apoteker/Dokter |

---

## Konten Menunggu Review Psikolog Fitri

1. **Semua copy di `rekahPlanCopy.ts`** — judul, label CTA, teks perayaan
2. **Semua copy `kenapaIni`, `script`, `avoid`, `amati`** di 31 modul activityModules.ts
3. **Catatan di weeklyPlanTemplates.ts** (8 template, ~32 catatan)
4. **Aturan komposisi** di `planComposer.ts` — khususnya aturan "menipis" (3 langkah ≤10 menit)

---

## File Baru/Diubah

| File | Status |
|---|---|
| `packages/shared/src/rekah/activityModules.ts` | DITULIS ULANG (31 modul, interface diperluas) |
| `packages/shared/src/rekah/weeklyPlanTemplates.ts` | DITULIS ULANG (8 template) |
| `packages/shared/src/rekah/planComposer.ts` | BARU |
| `packages/shared/src/rekah/planComposer.test.ts` | BARU |
| `packages/shared/src/rekah/index.ts` | DIUBAH (+planComposer export) |
| `packages/shared/vitest.config.ts` | BARU |
| `packages/shared/package.json` | DIUBAH (+vitest devDep, test script) |
| `apps/digital/src/features/rekah-plan/rekahPlanCopy.ts` | BARU |
| `apps/digital/src/features/rekah-plan/LangkahKecilCard.tsx` | BARU |
| `apps/digital/src/context/RekahPlanContext.tsx` | BARU |
| `apps/digital/src/pages/DashboardPages/Tier2/RencanaPage.tsx` | BARU |
| `apps/digital/src/pages/DashboardPages/Tier2/BerandaRekah.tsx` | DIUBAH (preview plan) |
| `apps/digital/src/App.tsx` | DIUBAH (+RekahPlanProvider, +RencanaPage route) |
| `apps/digital/src/pages/DashboardPages/Tier2/SidebarTier2.tsx` | DIUBAH (+nav Rencana) |
| `apps/digital/src/pages/DashboardPages/Tier2/DashboardShellTier2.tsx` | DIUBAH (+PAGE_TITLES) |
