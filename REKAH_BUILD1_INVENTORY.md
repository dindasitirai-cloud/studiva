# REKAH_BUILD1_INVENTORY — apps/digital Sebelum Build 1

Tanggal: 2026-07-17 | Branch: feat/rekah-foundation

---

## 1. Kemunculan Teks "Studiva Digital" / "Studiva"

| File | Jenis | Baris |
|------|-------|-------|
| `src/components/Navbar.tsx` | Nav link label | 11 |
| `src/components/OnboardingModal.tsx` | Welcome modal | 177, 180, 261 |
| `src/context/DashboardTier2Context.tsx` | Komentar | 87 |
| `src/lib/pricing.ts` | Tier label | 33 |
| `src/pages/LoginPage.tsx` | CTA teks + redirect | 67, 218 |
| `src/pages/LandingPage.tsx` | Testimonial + desc | 82, 84, 106, 287, 293, 568 |
| `src/pages/DaftarPage.tsx` | Form signup | 259, 266, 267, 345, 363, 504 |
| `src/pages/StudivaDigitalPage.tsx` | Seluruh halaman | *(dihapus)* |
| `src/pages/TentangPage.tsx` | Deskripsi produk | 260 |
| `src/pages/PricingPage.tsx` | Paket / header | 14, 71, 78 |
| `src/pages/SignupPage.tsx` | Tier title | 166, 297 |
| `src/pages/DashboardPages/Tier2/SidebarTier2.tsx` | Logo area | 65, 66 |
| `src/pages/DashboardPages/Tier2/BerandaTier2.tsx` | Badge | 129 |
| `src/pages/DashboardPages/Tier2/SubscriptionTier2.tsx` | Deskripsi | 67 |
| `src/pages/DashboardPages/useDashboardBasePath.ts` | Komentar | 3 |
| `src/pages/DashboardPages/Tier2/sources.ts` | Komentar header | 2 |
| `src/pages/DashboardPages/Tier2/modules.ts` | Komentar header | 2 |
| `src/pages/DashboardPages/Tier2/domains.ts` | Komentar header | 2 |
| `src/pages/DashboardPages/Tier2/knowledgeCardData.ts` | Komentar header | 2 |
| `src/pages/AdminPages/PaymentsAdmin.tsx` | Tier label + desc | 13, 56, 112 |
| `src/pages/AdminPages/MembersAdmin.tsx` | Tier label + desc | 5, 123, 139 |
| `src/pages/AdminPages/useAdminActionItems.ts` | Komentar | 16 |
| `src/features/partner-orang-tua/parent/PartnerOrangTuaPage.tsx` | Komentar | 10 |
| `src/pages/DashboardPages/Tier2/Pilih Paket Digital.dc.html` | Draft HTML | *(aset lama)* |

---

## 2. Route & Komponen Fitur Lama

### User-facing (DIHAPUS di Fase 2)
| Route | Komponen | File |
|-------|----------|------|
| `/dashboard/tier2/knowledge` | KnowledgeGallery | `Tier2/KnowledgeGallery.tsx` |
| `/dashboard/tier2/knowledge/:id` | KnowledgeCardSummary | `Tier2/KnowledgeCardSummary.tsx` |
| `/dashboard/tier2/knowledge/:id/ilmiah` | KnowledgeCardScientific | `Tier2/KnowledgeCardScientific.tsx` |
| `/dashboard/tier2/courses` | CoursesTier2 | `Tier2/CoursesTier2.tsx` |
| `/dashboard/tier2/strategies` | LearningStrategiesTier2 | `Tier2/LearningStrategiesTier2.tsx` |
| `/dashboard/tier2/strategies/:id` | StrategyDetailTier2 | `Tier2/StrategyDetailTier2.tsx` |
| `/dashboard/tier2/community` | CommunityTier2 | `Tier2/CommunityTier2.tsx` |
| `/dashboard/tier2/community/:id` | ThreadDetailTier2 | `Tier2/ThreadDetailTier2.tsx` |
| `/dashboard/tier2/konsultasi` | KonsultasiTier2 | `Tier2/KonsultasiTier2.tsx` |
| `/consultation` | ConsultationPage | `pages/ConsultationPage.tsx` |
| `/consultations/my-bookings` | MyConsultationsPage | `pages/MyConsultationsPage.tsx` |
| `/community` | CommunityHubPage | `pages/CommunityHubPage.tsx` |
| `/community/ask-fitri` | AskFitriPage | `pages/AskFitriPage.tsx` |
| `/community/new` | NewDiscussionPage | `pages/NewDiscussionPage.tsx` |
| `/community/myactivity` | MyCommunityActivityPage | `pages/MyCommunityActivityPage.tsx` |
| `/community/profile/:id` | CommunityProfilePage | `pages/CommunityProfilePage.tsx` |
| `/community/discussions/:id` | DiscussionDetailPage | `pages/DiscussionDetailPage.tsx` |
| `/resources` | ResourcesPage | `pages/ResourcesPage.tsx` |
| `/studiva-digital` | StudivaDigitalPage | `pages/StudivaDigitalPage.tsx` |

### Komponen pendukung (DIHAPUS)
- `Tier2/ResourceLibraryTier2.tsx`
- `Tier2/ArticleDetailTier2.tsx`
- `Tier2/AudioPlayerWidget.tsx`
- `Tier2/BookCarousel.tsx`, `BookGrid.tsx`, `BookReader.tsx`
- `Tier2/KonsultasiCTA.tsx`
- `Tier2/BerandaTier2.tsx` → digantikan placeholder

### DIPARKIR (jangan hapus)
- `features/jurnal-perkembangan/` → `_parked/jurnal/`

### Admin (TETAP, rebrand visual saja)
- `/admin/courses`, `/admin/strategies`, `/admin/forum`, `/admin/konsultasi`
- `/admin/community`, `/admin/fitri-dashboard`, `/admin/knowledge-cards`
- `/admin/tracker-konten`, `/admin/partner-orang-tua`

---

## 3. File Data Konten (DILINDUNGI)

Semua masih di `apps/digital/src/pages/DashboardPages/Tier2/`. **Belum ada** di `packages/shared/src/content`.

| File | Isi | Konsumen utama |
|------|-----|----------------|
| `domains.ts` | DOMAIN_CONFIGS, DomainCode | TrackerKonten, knowledgeCardData, KnowledgeCardsAdmin |
| `modules.ts` | MODULES, KnowledgeModule | TrackerKonten, composeScientific, AudioPlayerContext |
| `sources.ts` | SOURCES, Source | TrackerKonten, composeScientific |
| `knowledgeCardData.ts` | CARDS, KnowledgeCard, AGE_RANGES | TrackerKonten, KnowledgeCardsAdmin, AudioPlayerContext, KnowledgeLibraryContext |

Action: **git mv** semua ke `packages/shared/src/content/`, update import di semua konsumen admin yang bertahan.

---

## 4. Struktur Shell Saat Ini

### Dashboard Shell (Tier 2 — `DashboardShellTier2.tsx`)
- Sidebar kiri (desktop): `SidebarTier2.tsx`
- Top bar: Menu burger (mobile), notification bell, page title
- Mobile: sidebar sebagai overlay drawer
- Warna: amber-50, amber-100, border-amber (AKAN diganti Rekah)

### Sidebar nav items (AKAN dirombak):
```
Beranda · Profil Anak · Panduan Tumbuh Kembang · Courses · Learning Strategies
· Community Forum · Konsultasi · Jurnal Perkembangan · Partner Orang Tua
```

### Setelah Build 1:
```
Beranda (placeholder) · Profil Anak · Partner Orang Tua · Subscription
```
Jurnal = parkir. Akar Keluarga & Rencana = build 2+.

### Admin Shell (`AdminShell.tsx` + `SidebarAdmin.tsx`)
- Sidebar dengan seksi: Konten, Komunitas & Pendampingan, Manajemen
- Warna: stv-* tokens (TETAP untuk admin)
- Nav entries untuk forum/konsultasi → DISEMBUNYIKAN dari nav user, tetap di admin

### Login (`LoginPage.tsx`)
- Panel kiri: gradient navy, logo Studiva, tagline lama
- Panel kanan: form email + password
- Warna: stv-navy, stv-yellow (AKAN diganti Rekah)

### Navbar publik (`Navbar.tsx`)
- Links: Beranda, Sekolah Studiva, Studiva Digital, Tentang Kami, Kontak
- Logo: `/images/logo-studiva.png`
- AKAN diperbarui: logo Rekah, hilangkan link Studiva Digital

---

## 5. Font & Warna Saat Ini

### Fonts di `public/index.html`
- Nunito (400/600/700/800)
- Poppins (600/700/800)
- Baloo 2 (500/600/700/800)
- Nunito Sans italic/regular
- Caveat (500/700)
- Patrick Hand

### Rekah Fonts (AKAN ditambahkan / dijadikan default)
- Bricolage Grotesque 700/800 → heading
- Plus Jakarta Sans 400/600/700 → body/UI (jadi `font-sans` default)
- Fraunces italic 600 → aksen perayaan
- Caveat 500/700 → siap untuk jurnal nanti (sudah ada)

### Warna Rekah (sudah di tailwind.config) ✓
rekah · rekah-tua · mawar · fajar · kanvas · daun · pucuk · madu · pekat
