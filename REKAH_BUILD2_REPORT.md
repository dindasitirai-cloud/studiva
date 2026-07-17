# REKAH BUILD 2/4 — REPORT

**Status:** COMPLETE  
**Date:** 2026-07-17  
**Branch:** `feat/rekah-onboarding`

---

## Verifikasi Akhir

| Check | Result |
|---|---|
| `pnpm --filter @studiva/shared build` | ✅ PASS |
| `pnpm --filter digital typecheck` | ✅ PASS |
| Kata terlarang (normal, seharusnya, tertinggal, terlambat, rata-rata) | ✅ 0 hasil |
| amber- di file baru | ✅ 0 hasil |
| `apps/sekolah` tidak tersentuh | ✅ Konfirmasi |

---

## FASE 1 — Tipe Data Profil

**`packages/shared/src/rekah/profiles.ts`** (BARU):
- `ProfilAnak` — namaPanggilan, tanggalLahir, temperamen?, tantanganUtama?
- `ProfilCaregiver` — namaPanggilan, peran (5 pilihan), energiSaatIni? (3 level)
- `AkarKeluarga` — nilaiFokus [NilaiId, NilaiId], musimMulai (ISO date)
- `RekahProfile` — komposisi Anak + Caregiver + Akar
- `hitungUsiaBulan(tanggalLahir)` — util hitung usia dalam bulan
- Di-ekspor dari `packages/shared/src/rekah/index.ts` → `@studiva/shared`

---

## FASE 2 — Alur Onboarding

### Context
**`apps/digital/src/context/RekahProfileContext.tsx`** (BARU):
- `RekahProfileProvider` wrapping App.tsx (di antara DashboardTier2Provider dan Layout)
- `useRekahProfile()` hook — `{ profile: RekahProfile | null, setProfile }`
- `// TODO: muat profil dari backend saat login (GET /api/me/rekah-profile)`

### Copy
**`apps/digital/src/features/rekah-onboarding/rekahOnboardingCopy.ts`** (BARU):
- Header: `// KONTEN: wajib review Psikolog Fitri sebelum rilis`
- Semua teks UI terpusat — heading, label, placeholder, pesan konfirmasi, error, perayaan, beranda
- `NILAI_COPY` — emoji + deskripsiSingkat per NilaiId (6 nilai)
- `// TODO: keputusan Raisha — batas keras atau lunak untuk usia 37–48 bln?` (default: lunak)

### Progress Indicator
**`apps/digital/src/features/rekah-onboarding/KelopakProgress.tsx`** (BARU):
- 5 kelopak-shaped div (border-radius: 70% 70% 70% 4px) dalam fan arrangement
- Filled = bg-rekah border-rekah; unfilled = transparan border-rekah/25
- `role="progressbar"` + `aria-valuenow/min/max/label`
- Transisi CSS 0.25s

### Alur Utama
**`apps/digital/src/features/rekah-onboarding/OnboardingFlow.tsx`** (BARU):
- `useReducer` dengan `FlowState` (single source of truth, tanpa localStorage)
- `Step = 1 | 2 | 3 | 4 | 5 | 'celebration'`
- Tombol kembali di semua langkah kecuali 1
- State tidak hilang saat bolak-balik antar langkah

**Langkah 1 — Sambutan:**
- LogoRekah besar, H1, paragraf penjelasan, CTA "Mulai"

**Langkah 2 — Profil anak:**
- Input nama panggilan (wajib)
- `<input type="date">`, `max` = hari ini
- Konfirmasi hangat "[nama], [X] bulan 🌱" setelah tanggal valid
- Pesan lembut (madu) jika usia > 36 bulan
- Error merah-tua hanya untuk tanggal masa depan (satu-satunya blokir keras)

**Langkah 3 — Tentang si kecil (opsional):**
- 4 kartu temperamen (toggleable, null jika tidak dipilih)
- Textarea tantangan utama
- CTA ganda: "Lewati dulu" + "Lanjut"

**Langkah 4 — Tentang kamu:**
- Input nama caregiver (wajib)
- 5 pill peran
- 3 kartu energi + note "bukan menilai kamu"

**Langkah 5 — Akar Keluarga:**
- 6 kartu nilai (2 col mobile / 3 col desktop)
- Tepat 2 harus dipilih — kartu ke-3 memunculkan warning inline di bg-mawar
- `// TODO: endpoint simpan RekahProfile (POST /api/me/rekah-profile)`
- CTA "Tanam Akar Keluargaku" aktif hanya saat tepat 2 terpilih

**Layar Perayaan:**
- Animasi bloom-in kelopak madu (5 petal + center)
- `@media (prefers-reduced-motion: reduce)` mematikan animasi
- Font Fraunces italic "Akarnya tertanam!"
- "Musim [nilai1] & [nilai2] dimulai hari ini 🌱"
- CTA → `onComplete(profile)` → `setProfile` → beranda musim

---

## FASE 3 — Beranda Musim

**`apps/digital/src/pages/DashboardPages/Tier2/BerandaRekah.tsx`** (DIGANTI):
- Jika `profile === null` → `<OnboardingFlow onComplete={setProfile} />`
- Jika profile ada → `<BerandaMusim profile={profile} />`

**BerandaMusim** berisi:
1. Header Musim — "Musim ini: menanam [nilai1] & [nilai2]", usia anak, 2 nilai pills
2. Deskripsi nilai1 (dari `NILAI_REKAH.deskripsi`)
3. Kartu Langkah Kecil placeholder — `// TODO: diganti kartu Langkah Kecil (build 3)`
4. Kartu Jejak Mekar disabled — `// TODO: build 4`
5. Fallback jika no profile: `// TODO: hilang setelah profil dimuat dari backend`

---

## TODOs — Semua Path

| Lokasi | Keterangan |
|---|---|
| `RekahProfileContext.tsx:5` | `GET /api/me/rekah-profile` — muat profil saat login |
| `OnboardingFlow.tsx` (handleSubmit) | `POST /api/me/rekah-profile` — simpan setelah onboarding |
| `rekahOnboardingCopy.ts:29` | Keputusan Raisha: batas keras/lunak usia 37–48 bln |
| `rekahOnboardingCopy.ts:28` | Tangkap minat usia >36 bln untuk Musim selanjutnya |
| `BerandaRekah.tsx` (OnboardingFlow fallback) | Hilangkan CTA ulang setelah backend aktif |
| `BerandaRekah.tsx` (langkahKecil card) | Gantikan dengan Langkah Kecil build 3 |
| `BerandaRekah.tsx` (jejakMekar card) | Aktifkan Jejak Mekar di build 4 |
| `SidebarTier2.tsx` | Tambahkan Rencana Pekan Ini di build 3 |

---

## Konten Menunggu Review Psikolog Fitri

1. **Semua copy di `rekahOnboardingCopy.ts`** — heading, deskripsi temperamen, energi, note "bukan menilai kamu", copy perayaan
2. **`NILAI_COPY`** — deskripsiSingkat per nilai (6 teks)
3. **Copy beranda musim** — terutama deskripsi Musim dari nilai1.deskripsi

---

## File Baru/Diubah

| File | Status |
|---|---|
| `packages/shared/src/rekah/profiles.ts` | BARU |
| `packages/shared/src/rekah/index.ts` | DIUBAH (+profiles export) |
| `apps/digital/src/context/RekahProfileContext.tsx` | BARU |
| `apps/digital/src/features/rekah-onboarding/rekahOnboardingCopy.ts` | BARU |
| `apps/digital/src/features/rekah-onboarding/KelopakProgress.tsx` | BARU |
| `apps/digital/src/features/rekah-onboarding/OnboardingFlow.tsx` | BARU |
| `apps/digital/src/pages/DashboardPages/Tier2/BerandaRekah.tsx` | DIGANTI |
| `apps/digital/src/pages/DashboardPages/Tier2/SidebarTier2.tsx` | DIUBAH (TODO diperbarui) |
| `apps/digital/src/App.tsx` | DIUBAH (+RekahProfileProvider) |
