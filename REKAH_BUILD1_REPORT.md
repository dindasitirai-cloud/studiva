# REKAH BUILD 1/4 — REPORT

**Status:** COMPLETE  
**Date:** 2026-07-17  
**Branch:** `feat/rekah-foundation`

---

## Verifikasi Akhir

| Check | Result |
|---|---|
| `pnpm --filter @studiva/shared build` | ✅ PASS |
| `pnpm --filter digital typecheck` | ✅ PASS |
| `grep "amber-" apps/digital/src/` | ✅ 0 hasil |
| `grep "Studiva Digital" apps/digital/src/` | ✅ 0 hasil |
| `apps/sekolah` tidak tersentuh | ✅ Konfirmasi |

---

## FASE 1 — Global Design System

### Font & Tokens
- `apps/digital/public/index.html`: judul "Rekah — Mekar pada waktunya.", theme-color `#E0526B`, Google Fonts: Bricolage Grotesque, Plus Jakarta Sans, Fraunces (italic), Caveat
- `apps/digital/tailwind.config.js`: `font-sans` → Plus Jakarta Sans, 9 token warna Rekah: rekah, rekah-tua, mawar, fajar, kanvas, daun, pucuk, madu, pekat

### Komponen Bersama
- `apps/digital/src/components/LogoRekah.tsx` — dipindahkan dari `features/rekah/`
- `apps/digital/src/components/Kelopak.tsx` — dipindahkan dari `features/rekah/`

### Shell Rebrand
- `apps/digital/src/components/Navbar.tsx` — LogoRekah, nav hanya Dashboard/Masuk/Mulai Merekah
- `apps/digital/src/components/Footer.tsx` — LogoRekah, bg-pekat, teks Rekah
- `apps/digital/src/pages/LoginPage.tsx` — panel kiri pekat + Kelopak dekoratif, panel kanan kanvas, ring rekah
- `apps/digital/src/pages/DashboardPages/Tier2/SidebarTier2.tsx` — nav Rekah (Beranda, Profil Anak, Partner Orang Tua)
- `apps/digital/src/pages/DashboardPages/Tier2/DashboardShellTier2.tsx` — token rekah/fajar/mawar, PAGE_TITLES diperbarui

### Token Replacement
- **amber-** → 0 referensi (sebelumnya ~284 kemunculan di 30+ file)
  - amber-50 → fajar, amber-100 → mawar, amber-200 → mawar
  - amber-300/400/500 → madu, amber-600 → rekah, amber-700 → rekah-tua, amber-800 → pekat
- **"Studiva Digital"** → "Rekah" di 15+ file

---

## FASE 2 — Feature Cutover

### Homepage
- `/` → `RekahLandingPage` (sebelumnya `LandingPage`)
- `/rekah` → `<Navigate to="/" replace />`

### File Dihapus (user-facing)
| File | Keterangan |
|---|---|
| `pages/LandingPage.tsx` | Halaman lama Studiva |
| `pages/StudivaDigitalPage.tsx` | Marketing page lama |
| `pages/ResourcesPage.tsx` | Resource library publik |
| `pages/CommunityHubPage.tsx` | Forum community |
| `pages/AskFitriPage.tsx` | Konsultasi publik |
| `pages/DiscussionDetailPage.tsx` | Detail diskusi forum |
| `pages/NewDiscussionPage.tsx` | Buat diskusi baru |
| `pages/MyCommunityActivityPage.tsx` | Aktivitas forum user |
| `pages/CommunityProfilePage.tsx` | Profil forum user |
| `pages/ConsultationPage.tsx` | Halaman konsultasi |
| `pages/MyConsultationsPage.tsx` | List konsultasi user |
| `Tier2/ResourceLibraryTier2.tsx` | Library resource Tier 2 |
| `Tier2/ArticleDetailTier2.tsx` | Detail artikel |
| `Tier2/AudioPlayerWidget.tsx` | Widget audio |
| `Tier2/BookCarousel.tsx` | Carousel buku |
| `Tier2/BookGrid.tsx` | Grid buku |
| `Tier2/BookReader.tsx` | Reader buku |
| `Tier2/KnowledgeGallery.tsx` | Galeri knowledge |
| `Tier2/KnowledgeCardSummary.tsx` | Ringkasan kartu |
| `Tier2/KnowledgeCardScientific.tsx` | Kartu saintifik |
| `Tier2/CoursesTier2.tsx` | Halaman kursus |
| `Tier2/LearningStrategiesTier2.tsx` | Strategi belajar |
| `Tier2/StrategyDetailTier2.tsx` | Detail strategi |
| `Tier2/CommunityTier2.tsx` | Community Tier 2 |
| `Tier2/ThreadDetailTier2.tsx` | Detail thread |
| `Tier2/KonsultasiTier2.tsx` | Konsultasi Tier 2 |
| `Tier2/KonsultasiCTA.tsx` | CTA konsultasi |
| `Tier2/BerandaTier2.tsx` | Beranda lama |

### File Dibuat (Rekah)
- `apps/digital/src/pages/DashboardPages/Tier2/BerandaRekah.tsx` — placeholder "Rekah sedang mekar"

### File Diparkir
- `apps/digital/src/_parked/jurnal/` — seluruh fitur Jurnal Perkembangan (akan diintegrasikan kembali di build 4 sebagai Jejak Mekar)

### Stub Files (untuk kompatibilitas DashboardTier2Context)
- `Tier2/articleData.ts` — stub kosong, tipe Article dipertahankan
- `Tier2/courseData.ts` — stub kosong + `isVideoLike()` + `thumbnailUrl?`
- `Tier2/strategyData.ts` — stub kosong
- `Tier2/LearningStrategiesTier2.tsx` — 8 komponen stub untuk StrategiesAdmin

### Admin
- Semua route admin dipertahankan (KnowledgeCards, Courses, Strategies, Forum, Members, Payments, dll.)
- `KnowledgeCardsAdmin.tsx`: BookCarousel/BookReader diganti placeholder div
- `StrategiesAdmin.tsx`: preview components sekarang gunakan stub
- `CoursesAdmin.tsx`: `isVideoLike` dan `thumbnailUrl` ditambahkan ke stub

---

## FASE 3 — Data Foundation (packages/shared/src/rekah/)

### File Baru
| File | Isi |
|---|---|
| `values.ts` | 6 nilai Rekah + `NilaiId` + `Nilai` interface |
| `ageBands.ts` | 5 age bands (0–6, 7–12, 13–18, 19–24, 25–36 bulan) + `getAgeBand()` |
| `activityModules.ts` | `ActivityModule` interface + 5 modul seed (3 published, 2 draft) |
| `weeklyPlanTemplates.ts` | `WeeklyPlanTemplate` interface + 1 template contoh |
| `index.ts` | Re-export semua |

### Modul Seed
1. **am-001** Waktu Bebas di Lantai (0–12 bln, nilai: Mandiri) — published
2. **am-002** Menceritakan Gambar Bersama (7–18 bln, nilai: Komunikatif) — published
3. **am-003** Permainan Imitasi Wajah (0–12 bln, nilai: Empatik) — published
4. **am-004** Rutinitas Makan yang Tenang (13–24 bln, nilai: Regulasi Emosi) — draft
5. **am-005** Bermain Peran Sederhana (19–36 bln, nilai: Sosial) — draft

### Migrasi Content Data
- `packages/shared/src/content/` — domains.ts, sources.ts, modules.ts, knowledgeCardData.ts (dipindahkan dari apps/digital via git mv di sesi sebelumnya)
- Import paths di semua consumer digital diupdate ke `@studiva/shared`

---

## TODOs & PARKIRs

| Lokasi | Keterangan | Build Target |
|---|---|---|
| `BerandaRekah.tsx` | Gantikan dengan onboarding Akar Keluarga | Build 2 |
| `SidebarTier2.tsx:PARKIR` | Aktifkan Akar Keluarga & Rencana Pekan Ini | Build 2 |
| `App.tsx:PARKIR` | Aktifkan kembali route Jurnal Perkembangan | Build 4 |
| `_parked/jurnal/` | Integrasikan sebagai Jejak Mekar premium | Build 4 |
| `LearningStrategiesTier2.tsx` | Stub — aktifkan kembali saat strategi didesain ulang | Build 4 |
| `articleData.ts`, `courseData.ts`, `strategyData.ts` | Stub — hapus atau isi kembali | Build 4 |
| `DashboardShellTier2.tsx:TODO` | Update PAGE_TITLES setelah build 2 | Build 2 |
| `LoginPage.tsx:TODO` | Implementasi "Lupa Password" | Build 3 |
| `packages/shared/src/rekah/activityModules.ts` | am-004 & am-005 masih draft — review dengan Psikolog Fitri | Pre-launch |
| `KnowledgeCardsAdmin.tsx:TODO` | Sambungkan kembali BookCarousel/BookReader | Build 4 |

---

## Konten Menunggu Review Psikolog Fitri

1. **Copy landing page** — sudah disetujui ✅
2. **6 nilai Rekah** di `values.ts` — deskripsi perlu konfirmasi nada & akurasi klinis
3. **5 activity modules seed** — langkah & tip perlu review psikolog sebelum published
4. **WeeklyPlanTemplate seed** — struktur hari perlu konfirmasi frekuensi ideal

---

## Catatan Teknis

- `apps/sekolah` tidak disentuh sama sekali dalam build ini
- Stripe infrastructure dipertahankan sepenuhnya
- Tidak ada fitur baru Rekah yang dibangun (Akar Keluarga, Rencana, Langkah Kecil, Refleksi — ini semua di build 2–4)
- CRA (react-scripts 5.0.1) mengkompilasi semua file di `src/` — semua stub harus valid TypeScript
