import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardTier2Provider } from './context/DashboardTier2Context';
import { LearningStrategiesProvider } from './context/LearningStrategiesContext';
import { ToastProvider } from './components/ToastProvider';
import { FullscreenNotificationProvider } from './components/FullscreenNotificationProvider';
import { AnakProvider } from './context/AnakContext';
import { RekahProfileProvider } from './context/RekahProfileContext';
import { RekahPlanProvider } from './context/RekahPlanContext';
import { RekahRefleksiProvider } from './context/RekahRefleksiContext';
import { JurnalRekahProvider } from './context/JurnalRekahContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute, { AdminRoute, ParentRoute, PeninjauRoute } from './components/PrivateRoute';
import RekahAdminShell from './pages/RekahAdmin/RekahAdminShell';
import BerandaRekahAdmin from './pages/RekahAdmin/BerandaRekahAdmin';
import AntreanTinjauan from './pages/RekahAdmin/AntreanTinjauan';
import LayarDiff from './pages/RekahAdmin/LayarDiff';
import EditorSikap from './pages/RekahAdmin/EditorSikap';
import SemuaDraf from './pages/RekahAdmin/SemuaDraf';
import WawasanTumbuhAdmin from './pages/RekahAdmin/WawasanTumbuhAdmin';
import SubscriptionGuard from './components/SubscriptionGuard';

// Public pages
import RekahLandingPage from './features/rekah/RekahLandingPage';
import TentangPage from './pages/TentangPage';
import KontakPage from './pages/KontakPage';
// TODO: paywall Rekah dirancang setelah build 4
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import DaftarPage from './pages/DaftarPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';
import SubscriptionSettingsPage from './pages/SubscriptionSettingsPage';

// Admin standalone pages (use public Navbar)
import AdminConsultationsPage from './pages/AdminConsultationsPage';
import AdminEnrollmentRequestsPage from './pages/AdminEnrollmentRequestsPage';
import AdminCommunityPage from './pages/AdminCommunityPage';
import AdminFitriDashboardPage from './pages/AdminFitriDashboardPage';

// Dashboard Tier 2
import DashboardShellTier2 from './pages/DashboardPages/Tier2/DashboardShellTier2';
import JourneyRoutes from './features/rekah-journey/JourneyRoutes'; // Family Journey (additive, Phase 10C-5)
import ProfilAnakTier2 from './pages/DashboardPages/Tier2/ProfilAnakTier2';
import SubscriptionTier2 from './pages/DashboardPages/Tier2/SubscriptionTier2';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { KnowledgeLibraryProvider } from './context/KnowledgeLibraryContext';
import PartnerOrangTuaPage from './features/partner-orang-tua/parent/PartnerOrangTuaPage';
import RencanaPage from './pages/DashboardPages/Tier2/RencanaPage';
import JejakMekarPage from './pages/DashboardPages/Tier2/JejakMekarPage';
import JurnalPage from './pages/DashboardPages/Tier2/JurnalPage';
import PengaturanPage from './pages/DashboardPages/Tier2/PengaturanPage';
import JurnalPerkembanganPage from './features/jurnal-perkembangan/JurnalPerkembanganPage';
import JelajahAktivitasPage from './pages/DashboardPages/Tier2/JelajahAktivitasPage';
import KnowledgeGallery from './pages/DashboardPages/Tier2/KnowledgeGallery';
import KnowledgeCardSummary from './pages/DashboardPages/Tier2/KnowledgeCardSummary';
import KnowledgeCardScientific from './pages/DashboardPages/Tier2/KnowledgeCardScientific';
import IramaHariPage from './pages/DashboardPages/Tier2/IramaHariPage';
import KelolaPage from './pages/DashboardPages/Tier2/KelolaPage';
import TemaniPage from './features/temani/TemaniPage'; // Phase 14 — Temani (additive)
import BantuPage from './features/bantu/BantuPage'; // Phase 14 — Bantu (additive)
import KompasKeluargaPage from './pages/DashboardPages/Tier2/KompasKeluargaPage';
import CetakMingguPage from './pages/DashboardPages/Tier2/CetakMingguPage';
import BerandaPage from './features/beranda/BerandaPage';
import LearningStrategiesTier2 from './pages/DashboardPages/Tier2/LearningStrategiesTier2';
import StrategyDetailTier2 from './pages/DashboardPages/Tier2/StrategyDetailTier2';
import BekalPage from './pages/DashboardPages/Tier2/BekalPage';
import RuangTeduhPage from './pages/DashboardPages/Tier2/RuangTeduhPage';
import TahunPertama from './features/beranda-usia/bands/tahun-pertama/TahunPertama';

// Admin shell
import AdminShell from './pages/AdminPages/AdminShell';
import BerandaAdmin from './pages/AdminPages/BerandaAdmin';
import CoursesAdmin from './pages/AdminPages/CoursesAdmin';
import StrategiesAdmin from './pages/AdminPages/StrategiesAdmin';
import ForumAdmin from './pages/AdminPages/ForumAdmin';
import KonsultasiAdmin from './pages/AdminPages/KonsultasiAdmin';
import MembersAdmin from './pages/AdminPages/MembersAdmin';
import PaymentsAdmin from './pages/AdminPages/PaymentsAdmin';
import SettingsAdmin from './pages/AdminPages/SettingsAdmin';
import GuruAkunAdmin from './pages/AdminPages/GuruAkunAdmin';
import KnowledgeCardsAdmin from './pages/AdminPages/KnowledgeCardsAdmin';
import KnowledgeCardFormAdmin from './pages/AdminPages/KnowledgeCardFormAdmin';
import TrackerKontenAdmin from './pages/AdminPages/TrackerKonten';
import PartnerInboxPage from './features/partner-orang-tua/admin/PartnerInboxPage';

// AdminShell routes only — not a blanket "/admin" prefix check, since older
// standalone admin pages (consultations, community, etc.) still use public Navbar.
const ADMIN_SHELL_PATHS = [
  '/admin', '/admin/courses', '/admin/strategies',
  '/admin/forum', '/admin/konsultasi', '/admin/members', '/admin/payments', '/admin/settings',
  '/admin/guru-akun', '/admin/knowledge-cards', '/admin/tracker-konten', '/admin/partner-orang-tua',
  '/rekah-admin',
];

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isMemberDashboard = location.pathname.startsWith('/dashboard/tier2');
  const isAdminShell = ADMIN_SHELL_PATHS.some(p =>
    location.pathname === p || location.pathname.startsWith(`${p}/`)
  );
  // Homepage (Rekah landing) renders its own footer
  const isStandaloneLayout = location.pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      {!isMemberDashboard && !isAdminShell && !isStandaloneLayout && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isMemberDashboard && !isAdminShell && !isStandaloneLayout && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastProvider>
        <AudioPlayerProvider>
        <KnowledgeLibraryProvider>
        <LearningStrategiesProvider>
        <FullscreenNotificationProvider>
        <DashboardTier2Provider>
        {/* AnakProvider harus di atas RekahProfileProvider: profil musim
            memproyeksikan data anak dari sini. */}
        <AnakProvider>
        <RekahProfileProvider>
        <RekahPlanProvider>
        <RekahRefleksiProvider>
        <JurnalRekahProvider>
        <Layout>
          <Routes>
            {/* Homepage = Rekah landing */}
            <Route path="/" element={<RekahLandingPage />} />
            {/* Legacy /rekah URL still works */}
            <Route path="/rekah" element={<Navigate to="/" replace />} />

            {/* Public pages */}
            <Route path="/tentang" element={<TentangPage />} />
            <Route path="/kontak" element={<KontakPage />} />
            {/* TODO: paywall Rekah dirancang setelah build 4 — pricing disembunyikan dari nav */}
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Navigate to="/daftar" replace />} />
            <Route path="/daftar" element={<DaftarPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-failed" element={<PaymentFailedPage />} />
            <Route
              path="/subscription-settings"
              element={
                <PrivateRoute>
                  <SubscriptionSettingsPage />
                </PrivateRoute>
              }
            />

            {/* Admin standalone (use public Navbar) */}
            <Route path="/admin/consultations" element={<AdminRoute><AdminConsultationsPage /></AdminRoute>} />
            <Route path="/admin/consultations/manage" element={<AdminRoute><AdminConsultationsPage /></AdminRoute>} />
            <Route path="/admin/enrollment-requests" element={<AdminRoute><AdminEnrollmentRequestsPage /></AdminRoute>} />
            <Route path="/admin/community" element={<AdminRoute><AdminCommunityPage /></AdminRoute>} />
            <Route path="/admin/fitri-dashboard" element={<AdminRoute><AdminFitriDashboardPage /></AdminRoute>} />

            {/* Tier 2 member dashboard */}
            <Route
              path="/dashboard/tier2"
              element={
                <ParentRoute>
                  <SubscriptionGuard>
                    <DashboardShellTier2 />
                  </SubscriptionGuard>
                </ParentRoute>
              }
            >
              <Route index element={<BerandaPage />} />
              <Route path="journey/*" element={<JourneyRoutes />} /> {/* Family Journey — additive, inherits DashboardShellTier2 */}
              <Route path="kompas-keluarga" element={<KompasKeluargaPage />} /> {/* GROUND: Kompas Keluarga — additive */}
              <Route path="profil-anak" element={<ProfilAnakTier2 />} />
              <Route path="subscription" element={<SubscriptionTier2 />} />
              <Route path="partner-orang-tua" element={<PartnerOrangTuaPage tierContext="tier2" />} />
              <Route path="rencana" element={<RencanaPage />} />
              <Route path="jelajah" element={<JelajahAktivitasPage />} />
              <Route path="knowledge" element={<KnowledgeGallery />} />
              <Route path="knowledge/:cardId" element={<KnowledgeCardSummary />} />
              <Route path="knowledge/:cardId/ilmiah" element={<KnowledgeCardScientific />} />
              <Route path="jejak-mekar" element={<JejakMekarPage />} />
              <Route path="jurnal" element={<JurnalPage />} />
              <Route path="jurnal-perkembangan" element={<JurnalPerkembanganPage />} />
              <Route path="pengaturan" element={<PengaturanPage />} />
              <Route path="irama-hari" element={<IramaHariPage />} />
              <Route path="kelola" element={<KelolaPage />} />
              <Route path="temani" element={<TemaniPage />} /> {/* Phase 14 — Temani (additive) */}
              <Route path="bantu" element={<BantuPage />} /> {/* Phase 14 — Bantu (additive) */}
              <Route path="irama-hari/minggu/:tanggalSenin/cetak" element={<CetakMingguPage />} />
              <Route path="akar-keluarga" element={<Navigate to="../irama-hari" replace />} />
              <Route path="cermin-tumbuh" element={<Navigate to="../irama-hari" replace />} />
              <Route path="strategies" element={<LearningStrategiesTier2 />} />
              <Route path="strategies/:id" element={<StrategyDetailTier2 />} />
              <Route path="bekal" element={<BekalPage />} />
              <Route path="ruang-teduh" element={<RuangTeduhPage />} />
              <Route path="panduan" element={<TahunPertama />} />
            </Route>

            {/* Admin Digital — CMS, konten, manajemen langganan */}
            <Route path="/admin" element={<AdminRoute><AdminShell /></AdminRoute>}>
              <Route index element={<BerandaAdmin />} />
              <Route path="courses" element={<CoursesAdmin />} />
              <Route path="strategies" element={<StrategiesAdmin />} />
              {/* PARKIR: aktifkan lagi jika forum kembali */}
              <Route path="forum" element={<ForumAdmin />} />
              <Route path="konsultasi" element={<KonsultasiAdmin />} />
              <Route path="members" element={<MembersAdmin />} />
              <Route path="payments" element={<PaymentsAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
              <Route path="guru-akun" element={<GuruAkunAdmin />} />
              <Route path="knowledge-cards" element={<KnowledgeCardsAdmin />} />
              <Route path="knowledge-cards/new" element={<KnowledgeCardFormAdmin />} />
              <Route path="knowledge-cards/:id/edit" element={<KnowledgeCardFormAdmin />} />
              <Route path="tracker-konten" element={<TrackerKontenAdmin />} />
              <Route path="partner-orang-tua" element={<PartnerInboxPage />} />
            </Route>

            {/* Rekah Admin — pipeline tinjauan konten, staf Rekah */}
            <Route
              path="/rekah-admin"
              element={<PeninjauRoute><RekahAdminShell /></PeninjauRoute>}
            >
              <Route index element={<BerandaRekahAdmin />} />
              <Route path="ajak-main" element={<StrategiesAdmin pipelineOnly />} />
              <Route path="wawasan" element={<WawasanTumbuhAdmin />} />
              <Route path="wawasan/new" element={<KnowledgeCardFormAdmin pipelineOnly backPath="/rekah-admin/wawasan" />} />
              <Route path="wawasan/:id/edit" element={<KnowledgeCardFormAdmin pipelineOnly backPath="/rekah-admin/wawasan" />} />
              <Route path="sikap" element={<EditorSikap />} />
              <Route path="tracker" element={<TrackerKontenAdmin />} />
              <Route path="antrean" element={<AntreanTinjauan />} />
              <Route path="diff/:id" element={<LayarDiff />} />
              <Route path="semua" element={<SemuaDraf />} />
            </Route>

            {/* Legacy redirects */}
            <Route path="/dashboard/parent" element={<Navigate to="/dashboard/tier2" replace />} />
          </Routes>
        </Layout>
        </JurnalRekahProvider>
        </RekahRefleksiProvider>
        </RekahPlanProvider>
        </RekahProfileProvider>
        </AnakProvider>
        </DashboardTier2Provider>
        </FullscreenNotificationProvider>
        </LearningStrategiesProvider>
        </KnowledgeLibraryProvider>
        </AudioPlayerProvider>
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
