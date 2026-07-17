# Migration Inventory — Pemisahan Monorepo Studiva

Generated during Fase 0 prerequisite check.
All paths relative to `studiva-website/frontend/src/` unless stated otherwise.

---

## Deteksi Lingkungan

| Item | Nilai |
|------|-------|
| Package manager | npm (`frontend/package-lock.json`) → migrasikan ke pnpm |
| Framework frontend | Create React App (react-scripts 5.0.1) |
| Routing | react-router-dom v6 (routes defined in `App.tsx`) |
| TypeScript | Ya (`tsconfig.json`) |
| Node version | Tidak ada `.nvmrc`; tidak ada field `engines` |
| pnpm tersedia | Belum — akan di-install di Fase 1 |

---

## Fitur yang DIHAPUS dari `apps/sekolah`

### 1. Resource Library

| Tipe | File |
|------|------|
| Route public | `pages/ResourcesPage.tsx`, route `/resources` di `App.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/ResourceLibraryTier2.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/ArticleDetailTier2.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/articleData.ts` |
| Admin | `pages/AdminPages/ResourceLibraryAdmin.tsx` |
| Referensi | `context/DashboardTier2Context.tsx` (entri nav), `pages/DashboardPages/Tier1/BerandaTier1.tsx` (jika ada link) |

### 2. Courses

| Tipe | File |
|------|------|
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/CoursesTier2.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/courseData.ts` |
| Admin | `pages/AdminPages/CoursesAdmin.tsx` |
| Referensi | `pages/DashboardPages/Tier2/BerandaTier2.tsx` (link), `SidebarTier2.tsx` (nav item) |

### 3. Learning Strategies

| Tipe | File |
|------|------|
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/LearningStrategiesTier2.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/StrategyDetailTier2.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/strategyData.ts` |
| Admin | `pages/AdminPages/StrategiesAdmin.tsx` |
| Admin | `pages/AdminPages/CsvImportModal.tsx` (dipakai StrategiesAdmin) |
| Data | `data/learningStrategies.ts` |
| Context | `context/LearningStrategiesContext.tsx` |
| Referensi | `SidebarTier2.tsx`, `BerandaTier2.tsx`, `DashboardShellTier2.tsx` |

### 4. Community Forum

| Tipe | File |
|------|------|
| Route public | `pages/CommunityHubPage.tsx` |
| Route public | `pages/CommunityProfilePage.tsx` |
| Route public | `pages/AskFitriPage.tsx` |
| Route public | `pages/MyCommunityActivityPage.tsx` |
| Route public | `pages/NewDiscussionPage.tsx` |
| Route public | `pages/DiscussionDetailPage.tsx` |
| Admin (standalone) | `pages/AdminCommunityPage.tsx` |
| Admin (standalone) | `pages/AdminFitriDashboardPage.tsx` |
| Admin | `pages/AdminPages/ForumAdmin.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/CommunityTier2.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/ThreadDetailTier2.tsx` |
| Components | `components/DiscussionCard.tsx`, `CommunityGuidelines.tsx`, `TagInput.tsx`, `ReportModal.tsx`, `FitriProfileCard.tsx`, `ExpertBadge.tsx` |
| Lib | `lib/community.ts` |
| Routes di App.tsx | `/community/*`, `/admin/community`, `/admin/fitri-dashboard` |

### 5. Konsultasi

| Tipe | File |
|------|------|
| Route public | `pages/ConsultationPage.tsx` |
| Route public | `pages/MyConsultationsPage.tsx` |
| Admin (standalone) | `pages/AdminConsultationsPage.tsx` |
| Admin | `pages/AdminPages/KonsultasiAdmin.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/KonsultasiTier2.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/KonsultasiCTA.tsx` |
| Components | `components/ConsultationForm.tsx`, `ConsultationTypeCard.tsx` |
| Routes di App.tsx | `/consultation`, `/consultations/my-bookings`, `/admin/consultations`, `/admin/consultations/manage` |

### 6. Jurnal Perkembangan

| Tipe | File |
|------|------|
| Feature dir (semua) | `features/jurnal-perkembangan/` |
| Route | Route `jurnal-perkembangan` di Tier2 shell (`App.tsx`) |

### 7. Panduan Tumbuh Kembang (Knowledge Cards)

| Tipe | File |
|------|------|
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/BookCarousel.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/BookGrid.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/BookReader.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/KnowledgeCardScientific.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/KnowledgeCardSummary.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/KnowledgeGallery.tsx` |
| Dashboard Tier 2 | `pages/DashboardPages/Tier2/AudioPlayerWidget.tsx` |
| Data | `pages/DashboardPages/Tier2/knowledgeCardData.ts` |
| Data | `pages/DashboardPages/Tier2/domains.ts` |
| Data | `pages/DashboardPages/Tier2/modules.ts` |
| Data | `pages/DashboardPages/Tier2/sources.ts` |
| Admin | `pages/AdminPages/KnowledgeCardsAdmin.tsx` |
| Admin | `pages/AdminPages/KnowledgeCardFormAdmin.tsx` |
| Admin TrackerKonten | `pages/AdminPages/TrackerKonten/` (seluruh direktori) |
| Context | `context/KnowledgeLibraryContext.tsx` |
| Context | `context/AudioPlayerContext.tsx` |
| Lib | `lib/composeScientific.ts` |
| Lib | `lib/compose/index.ts` (shared compose) |
| Lib | `lib/buildUsageMap.ts` |
| Lib | `lib/contentFreshness.ts` |
| Components | `components/figures/` (seluruh direktori — 21 SVG figure components) |

### 8. Self-registration dan Stripe Checkout Tier 2

| Tipe | File |
|------|------|
| Pages | `pages/SignupPage.tsx`, `pages/DaftarPage.tsx` |
| Pages | `pages/PricingPage.tsx` |
| Pages | `pages/PaymentSuccessPage.tsx`, `pages/PaymentFailedPage.tsx` |
| Pages | `pages/SubscriptionSettingsPage.tsx` |
| Pages | `pages/StudivaDigitalPage.tsx` |
| Components | `components/PaymentButton.tsx`, `components/PlanConfirmModal.tsx` |
| Components | `components/PricingCard.tsx`, `components/SubscriptionCard.tsx` |
| Components | `components/SubscriptionGuard.tsx`, `components/UpgradeRequestForm.tsx` |
| Lib | `lib/pricing.ts` |
| Routes di App.tsx | `/daftar`, `/signup`, `/pricing`, `/payment-success`, `/payment-failed`, `/subscription-settings`, `/studiva-digital` |
| Catatan | Login untuk akun buatan admin **TETAP** ada |

### 9. Admin Digital (hapus dari Admin Sekolah)

Admin Sekolah hanya menyimpan: **SekolahAkun** + **SPP Billing**.

| Dihapus dari Admin Sekolah | File |
|---------------------------|------|
| CMS / Knowledge Cards | `pages/AdminPages/KnowledgeCardsAdmin.tsx`, `KnowledgeCardFormAdmin.tsx` |
| Tracker Konten | `pages/AdminPages/TrackerKonten/` |
| Moderasi Forum | `pages/AdminPages/ForumAdmin.tsx` |
| Manajemen Langganan | `pages/AdminPages/PaymentsAdmin.tsx`, `MembersAdmin.tsx` |
| Konsultasi Admin | `pages/AdminPages/KonsultasiAdmin.tsx` |
| Courses Admin | `pages/AdminPages/CoursesAdmin.tsx` |
| Strategies Admin | `pages/AdminPages/StrategiesAdmin.tsx` |
| Admin Fitri / Community | `pages/AdminCommunityPage.tsx`, `pages/AdminFitriDashboardPage.tsx` |
| Enrollment Requests | `pages/AdminEnrollmentRequestsPage.tsx` (TODO: klasifikasi — mungkin sekolah) |
| GuruAkun Admin | `pages/AdminPages/GuruAkunAdmin.tsx` — **TODO: klasifikasi admin — sekolah atau digital?** |
| **Dipertahankan** | `SppAdmin.tsx`, `SekolahAkunAdmin.tsx` |

---

## Fitur yang DIHAPUS dari `apps/digital`

### 1. Dashboard Guru

| Tipe | File |
|------|------|
| Dir (semua) | `pages/GuruPages/` |
| Route | `/guru/*`, `/dashboard/teacher` di `App.tsx` |
| Components | `pages/DashboardPages/TeacherDashboard.tsx` |

### 2. Dashboard Orang Tua Tier 1 — Spesifik Sekolah

| Tipe | File |
|------|------|
| Laporan harian | `pages/DashboardPages/Tier1/PerkembanganHarianTier1.tsx` |
| Portfolio | `pages/DashboardPages/Tier1/PortfolioTier1.tsx` |
| Asesmen | `pages/DashboardPages/Tier1/AsesmenTier1.tsx`, `AssessmentDetailTier1.tsx` |
| IEP | `pages/DashboardPages/Tier1/IEPTier1.tsx` |
| Kehadiran | `pages/DashboardPages/Tier1/KehadiranTier1.tsx` |
| Catatan guru | `pages/DashboardPages/Tier1/CatatanGuruTier1.tsx` |
| Pembayaran SPP | `pages/DashboardPages/Tier1/PembayaranSPPTier1.tsx` |
| Meta sekolah | `pages/DashboardPages/Tier1/assessmentMeta.ts`, `iepMeta.ts`, `portfolioCategoryMeta.ts` |
| **Pertahankan** | `BerandaTier1.tsx`, `ProfilAnakTier1.tsx`, `SidebarTier1.tsx`, `DashboardShellTier1.tsx`, `DashboardTier1Context.tsx` |
| Ambigu | `SubscriptionTier1.tsx` — **TODO: klasifikasi manual — sekolah atau digital?** |

### 3. Landing Spesifik Profil Sekolah Fisik

| Tipe | File |
|------|------|
| Halaman | `pages/SekolahStudivaPage.tsx` |
| Route | `/sekolah-studiva` di `App.tsx` |
| Context | `context/SekolahStudivaContext.tsx` |
| Landing sections | Bagian "Sekolah Studiva" di `pages/LandingPage.tsx` — inspeksi manual |

### 4. Admin Sekolah (hapus dari Admin Digital)

Admin Digital hanya menghapus: **SekolahAkun** + **SPP Billing**.
Semua admin digital lainnya **dipertahankan**.

| Dihapus dari Admin Digital | File |
|---------------------------|------|
| Pembuatan akun Tier 1 | `pages/AdminPages/SekolahAkunAdmin.tsx` |
| SPP Billing | `pages/AdminPages/SppAdmin.tsx` |
| GuruAkun Admin | `pages/AdminPages/GuruAkunAdmin.tsx` — **TODO: klasifikasi admin — sekolah atau digital?** |
| **Dipertahankan** | Semua admin konten, forum, langganan, konsultasi, courses, strategies |

---

## Fitur Tidak Ditemukan

| Fitur | Status |
|-------|--------|
| Dedicated Enrollment page (Tier 1 parent) | `AdminEnrollmentRequestsPage.tsx` ada (admin-side), tapi ini enrollment request admin. Parent-side enrollment tidak ditemukan secara terpisah — mungkin alur via Sekolah langsung. |

---

## TODO yang Perlu Klasifikasi Manual Raisha

1. `pages/AdminPages/GuruAkunAdmin.tsx` — admin akun guru: kemungkinan milik Sekolah, tapi bisa juga dibutuhkan Digital jika ada fitur guru di sana.
2. `pages/DashboardPages/Tier1/SubscriptionTier1.tsx` — apakah ini SPP (→ sekolah) atau langganan digital (→ digital)?
3. `pages/AdminEnrollmentRequestsPage.tsx` — halaman permintaan enrollment admin. Apakah Tier 1 enrollment hanya di Sekolah?
4. `context/SekolahStudivaContext.tsx` — dipakai di landing page juga. Cek apakah ada bagian landing yang harus tetap di Digital.
5. `pages/AdminPages/SettingsAdmin.tsx` — setelan admin umum: milik dua app atau satu?
6. `components/FullscreenNotificationProvider.tsx` — referensi SPP di dalamnya (lihat grep SPP). Perlu cek apakah relevan untuk Digital.

---

## Catatan Dependency

- `LearningStrategiesContext.tsx` membungkus data `learningStrategies.ts` — keduanya dihapus dari Sekolah.
- `KnowledgeLibraryContext.tsx` dan `AudioPlayerContext.tsx` membungkus knowledge cards — dihapus dari Sekolah.
- `DashboardTier2Context.tsx` mengatur fitur Tier 2 (termasuk courses, community, dll.) — perlu dibersihkan per app.
- `components/OnboardingModal.tsx` menyebut Resource Library, Konsultasi, Knowledge Cards — perlu dibersihkan di Sekolah.
- `components/Navbar.tsx` dan `components/Footer.tsx` menyebut fitur digital (Community, dll.) — perlu dibersihkan di Sekolah.
