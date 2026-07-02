import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardTier2Provider } from './context/DashboardTier2Context';
import { SekolahStudivaProvider } from './context/SekolahStudivaContext';
import { ToastProvider } from './components/ToastProvider';
import { FullscreenNotificationProvider } from './components/FullscreenNotificationProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute, { AdminRoute, ParentRoute, TeacherRoute } from './components/PrivateRoute';
import SubscriptionGuard from './components/SubscriptionGuard';

import LandingPage from './pages/LandingPage';
import SekolahStudivaPage from './pages/SekolahStudivaPage';
import StudivaDigitalPage from './pages/StudivaDigitalPage';
import AboutPage from './pages/AboutPage';
import TentangPage from './pages/TentangPage';
import KontakPage from './pages/KontakPage';
import PricingPage from './pages/PricingPage';
import ResourcesPage from './pages/ResourcesPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DaftarPage from './pages/DaftarPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';
import SubscriptionSettingsPage from './pages/SubscriptionSettingsPage';
import ConsultationPage from './pages/ConsultationPage';
import MyConsultationsPage from './pages/MyConsultationsPage';
import AdminConsultationsPage from './pages/AdminConsultationsPage';
import AdminEnrollmentRequestsPage from './pages/AdminEnrollmentRequestsPage';
import CommunityHubPage from './pages/CommunityHubPage';
import DiscussionDetailPage from './pages/DiscussionDetailPage';
import NewDiscussionPage from './pages/NewDiscussionPage';
import MyCommunityActivityPage from './pages/MyCommunityActivityPage';
import CommunityProfilePage from './pages/CommunityProfilePage';
import AdminCommunityPage from './pages/AdminCommunityPage';
import AskFitriPage from './pages/AskFitriPage';
import AdminFitriDashboardPage from './pages/AdminFitriDashboardPage';
import ParentDashboard from './pages/DashboardPages/ParentDashboard';
import TeacherDashboard from './pages/DashboardPages/TeacherDashboard';
import ChildProfile from './pages/DashboardPages/ChildProfile';
import DashboardShellTier2 from './pages/DashboardPages/Tier2/DashboardShellTier2';
import BerandaTier2 from './pages/DashboardPages/Tier2/BerandaTier2';
import ProfilAnakTier2 from './pages/DashboardPages/Tier2/ProfilAnakTier2';
import ResourceLibraryTier2 from './pages/DashboardPages/Tier2/ResourceLibraryTier2';
import ArticleDetailTier2 from './pages/DashboardPages/Tier2/ArticleDetailTier2';
import CoursesTier2 from './pages/DashboardPages/Tier2/CoursesTier2';
import LearningStrategiesTier2 from './pages/DashboardPages/Tier2/LearningStrategiesTier2';
import StrategyDetailTier2 from './pages/DashboardPages/Tier2/StrategyDetailTier2';
import CommunityTier2 from './pages/DashboardPages/Tier2/CommunityTier2';
import ThreadDetailTier2 from './pages/DashboardPages/Tier2/ThreadDetailTier2';
import KonsultasiTier2 from './pages/DashboardPages/Tier2/KonsultasiTier2';
import SubscriptionTier2 from './pages/DashboardPages/Tier2/SubscriptionTier2';
import DashboardShellTier1 from './pages/DashboardPages/Tier1/DashboardShellTier1';
import BerandaTier1 from './pages/DashboardPages/Tier1/BerandaTier1';
import ProfilAnakTier1 from './pages/DashboardPages/Tier1/ProfilAnakTier1';
import PerkembanganHarianTier1 from './pages/DashboardPages/Tier1/PerkembanganHarianTier1';
import KehadiranTier1 from './pages/DashboardPages/Tier1/KehadiranTier1';
import PortfolioTier1 from './pages/DashboardPages/Tier1/PortfolioTier1';
import AsesmenTier1 from './pages/DashboardPages/Tier1/AsesmenTier1';
import AssessmentDetailTier1 from './pages/DashboardPages/Tier1/AssessmentDetailTier1';
import IEPTier1 from './pages/DashboardPages/Tier1/IEPTier1';
import CatatanGuruTier1 from './pages/DashboardPages/Tier1/CatatanGuruTier1';
import SubscriptionTier1 from './pages/DashboardPages/Tier1/SubscriptionTier1';
import PembayaranSPPTier1 from './pages/DashboardPages/Tier1/PembayaranSPPTier1';
import GuruShell from './pages/GuruPages/GuruShell';
import BerandaGuru from './pages/GuruPages/BerandaGuru';
import KelasSayaGuru from './pages/GuruPages/KelasSayaGuru';
import PerkembanganGuru from './pages/GuruPages/PerkembanganGuru';
import KehadiranGuru from './pages/GuruPages/KehadiranGuru';
import PortfolioGuru from './pages/GuruPages/PortfolioGuru';
import AsesmenGuru from './pages/GuruPages/AsesmenGuru';
import IEPGuru from './pages/GuruPages/IEPGuru';
import CatatanOrangTuaGuru from './pages/GuruPages/CatatanOrangTuaGuru';
import StudentProfileGuru from './pages/GuruPages/StudentProfileGuru';
import AdminShell from './pages/AdminPages/AdminShell';
import BerandaAdmin from './pages/AdminPages/BerandaAdmin';
import ResourceLibraryAdmin from './pages/AdminPages/ResourceLibraryAdmin';
import CoursesAdmin from './pages/AdminPages/CoursesAdmin';
import StrategiesAdmin from './pages/AdminPages/StrategiesAdmin';
import ForumAdmin from './pages/AdminPages/ForumAdmin';
import KonsultasiAdmin from './pages/AdminPages/KonsultasiAdmin';
import MembersAdmin from './pages/AdminPages/MembersAdmin';
import PaymentsAdmin from './pages/AdminPages/PaymentsAdmin';
import SettingsAdmin from './pages/AdminPages/SettingsAdmin';
import SppAdmin from './pages/AdminPages/SppAdmin';
import SekolahAkunAdmin from './pages/AdminPages/SekolahAkunAdmin';
import GuruAkunAdmin from './pages/AdminPages/GuruAkunAdmin';

const CONSULTATION_UPGRADE_MESSAGE =
  'Anda perlu upgrade ke Tier 1 atau Tier 2 untuk melakukan booking konsultasi. Silakan pilih plan yang sesuai untuk mulai berkonsultasi.';

// New AdminShell routes only - deliberately NOT a blanket "/admin" prefix
// check, since the older standalone admin pages (consultations, community,
// enrollment-requests, fitri-dashboard) still rely on the public Navbar for
// navigation and aren't wrapped in AdminShell.
const ADMIN_SHELL_PATHS = [
  '/admin', '/admin/resource-library', '/admin/courses', '/admin/strategies',
  '/admin/forum', '/admin/konsultasi', '/admin/members', '/admin/payments', '/admin/settings',
  '/admin/spp-billing', '/admin/sekolah-akun', '/admin/guru-akun',
];

function Layout({ children }: { children: React.ReactNode }) {
  // Both member dashboards (and now the admin dashboard) have their own
  // sidebar + topbar (incl. logout), so the public marketing navbar would
  // just be redundant, duplicate navigation there.
  const location = useLocation();
  const isMemberDashboard =
    location.pathname.startsWith('/dashboard/tier2') || location.pathname.startsWith('/dashboard/tier1');
  const isAdminShell = ADMIN_SHELL_PATHS.some(p => location.pathname === p || location.pathname.startsWith(`${p}/`));
  const isGuruShell = location.pathname === '/guru' || location.pathname.startsWith('/guru/');

  return (
    <div className="flex min-h-screen flex-col">
      {!isMemberDashboard && !isAdminShell && !isGuruShell && <Navbar />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Hoisted here (not inside DashboardShellTier2) so the Tier 1 and
            Tier 2 dashboards share the exact same forum/article/course state
            instead of each mounting its own independent copy. ToastProvider
            wraps it so DashboardTier2Provider can pop up a toast the moment
            a notification is created, not just add it to the bell list. */}
        <ToastProvider>
        <FullscreenNotificationProvider>
        <SekolahStudivaProvider>
        <DashboardTier2Provider>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sekolah-studiva" element={<SekolahStudivaPage />} />
            <Route path="/studiva-digital" element={<StudivaDigitalPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/signup" element={<Navigate to="/daftar" replace />} />
            <Route path="/daftar" element={<DaftarPage />} />
            <Route path="/tentang" element={<TentangPage />} />
            <Route path="/kontak" element={<KontakPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
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

            <Route
              path="/consultation"
              element={
                <PrivateRoute>
                  <SubscriptionGuard message={CONSULTATION_UPGRADE_MESSAGE}>
                    <ConsultationPage />
                  </SubscriptionGuard>
                </PrivateRoute>
              }
            />
            <Route
              path="/consultations/my-bookings"
              element={
                <PrivateRoute>
                  <SubscriptionGuard message={CONSULTATION_UPGRADE_MESSAGE}>
                    <MyConsultationsPage />
                  </SubscriptionGuard>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/consultations"
              element={
                <AdminRoute>
                  <AdminConsultationsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/consultations/manage"
              element={
                <AdminRoute>
                  <AdminConsultationsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/enrollment-requests"
              element={
                <AdminRoute>
                  <AdminEnrollmentRequestsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/community"
              element={
                <AdminRoute>
                  <AdminCommunityPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/fitri-dashboard"
              element={
                <AdminRoute>
                  <AdminFitriDashboardPage />
                </AdminRoute>
              }
            />

            <Route
              path="/community"
              element={
                <PrivateRoute>
                  <CommunityHubPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/community/ask-fitri"
              element={
                <PrivateRoute>
                  <AskFitriPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/community/new"
              element={
                <PrivateRoute>
                  <SubscriptionGuard message="Anda perlu subscription aktif (Tier 1 atau Tier 2) untuk membuat diskusi.">
                    <NewDiscussionPage />
                  </SubscriptionGuard>
                </PrivateRoute>
              }
            />
            <Route
              path="/community/myactivity"
              element={
                <PrivateRoute>
                  <MyCommunityActivityPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/community/profile/:userId"
              element={
                <PrivateRoute>
                  <CommunityProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/community/discussions/:id"
              element={
                <PrivateRoute>
                  <DiscussionDetailPage />
                </PrivateRoute>
              }
            />

            {/* Tier 2 member dashboard — nested routes with shared DashboardShellTier2 layout */}
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
              <Route index element={<BerandaTier2 />} />
              <Route path="profil-anak" element={<ProfilAnakTier2 />} />
              <Route path="subscription" element={<SubscriptionTier2 />} />
              <Route path="resources" element={<ResourceLibraryTier2 />} />
              <Route path="resources/:id" element={<ArticleDetailTier2 />} />
              <Route path="courses" element={<CoursesTier2 />} />
              <Route path="strategies" element={<LearningStrategiesTier2 />} />
              <Route path="strategies/:id" element={<StrategyDetailTier2 />} />
              <Route path="community" element={<CommunityTier2 />} />
              <Route path="community/:id" element={<ThreadDetailTier2 />} />
              <Route path="konsultasi" element={<KonsultasiTier2 />} />
            </Route>

            {/* Tier 1 (Sekolah Studiva) member dashboard — nested routes with shared DashboardShellTier1 layout */}
            <Route
              path="/dashboard/tier1"
              element={
                <ParentRoute>
                  <SubscriptionGuard>
                    <DashboardShellTier1 />
                  </SubscriptionGuard>
                </ParentRoute>
              }
            >
              <Route index element={<BerandaTier1 />} />
              <Route path="profil-anak" element={<ProfilAnakTier1 />} />
              <Route path="perkembangan" element={<PerkembanganHarianTier1 />} />
              <Route path="kehadiran" element={<KehadiranTier1 />} />
              <Route path="portfolio" element={<PortfolioTier1 />} />
              <Route path="asesmen" element={<AsesmenTier1 />} />
              <Route path="asesmen/:id" element={<AssessmentDetailTier1 />} />
              <Route path="iep" element={<IEPTier1 />} />
              <Route path="catatan-guru" element={<CatatanGuruTier1 />} />
              <Route path="subscription" element={<SubscriptionTier1 />} />
              <Route path="pembayaran-spp" element={<PembayaranSPPTier1 />} />
              {/* Same components as /dashboard/tier2 below, reading from the
                  same hoisted DashboardTier2Provider - one shared forum,
                  article-read state, course enrollments, etc. across both
                  dashboards. Each component resolves its own internal links
                  via useDashboardBasePath() so it stays inside whichever
                  dashboard shell the parent is currently in. */}
              <Route path="resources" element={<ResourceLibraryTier2 />} />
              <Route path="resources/:id" element={<ArticleDetailTier2 />} />
              <Route path="courses" element={<CoursesTier2 />} />
              <Route path="strategies" element={<LearningStrategiesTier2 />} />
              <Route path="strategies/:id" element={<StrategyDetailTier2 />} />
              <Route path="community" element={<CommunityTier2 />} />
              <Route path="community/:id" element={<ThreadDetailTier2 />} />
              <Route path="konsultasi" element={<KonsultasiTier2 />} />
            </Route>

            {/* Admin dashboard - internal Studiva team only. Resource Library/
                Courses/Learning Strategies/Forum/Konsultasi modules manage the
                SAME shared data the Tier 1 & Tier 2 parent dashboards read
                from (via DashboardTier2Context, hoisted globally above), not
                a separate copy - publishing here is meant to show up there.
                TODO: role distinction beyond AdminRoute's role==='admin'
                check (e.g. content-editor vs psikolog vs super-admin) once
                real auth/roles exist. */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminShell />
                </AdminRoute>
              }
            >
              <Route index element={<BerandaAdmin />} />
              <Route path="resource-library" element={<ResourceLibraryAdmin />} />
              <Route path="courses" element={<CoursesAdmin />} />
              <Route path="strategies" element={<StrategiesAdmin />} />
              <Route path="forum" element={<ForumAdmin />} />
              <Route path="konsultasi" element={<KonsultasiAdmin />} />
              <Route path="members" element={<MembersAdmin />} />
              <Route path="payments" element={<PaymentsAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
              <Route path="spp-billing" element={<SppAdmin />} />
              <Route path="sekolah-akun" element={<SekolahAkunAdmin />} />
              <Route path="guru-akun" element={<GuruAkunAdmin />} />
            </Route>

            <Route
              path="/dashboard/parent"
              element={
                <ParentRoute>
                  <SubscriptionGuard>
                    <ParentDashboard />
                  </SubscriptionGuard>
                </ParentRoute>
              }
            />
            <Route
              path="/dashboard/teacher"
              element={
                <TeacherRoute>
                  <SubscriptionGuard>
                    <TeacherDashboard />
                  </SubscriptionGuard>
                </TeacherRoute>
              }
            />

            {/* Guru dashboard — input area for teachers managing student data.
                What teachers write here (daily updates, attendance, portfolio,
                assessments, IEP) flows as read-only data to the Tier 1 parent
                dashboard. Parent "Catatan untuk Guru" notes are readable here.
                TODO: role-guard will expand once backend auth includes a more
                granular teacher/staff role model. */}
            <Route
              path="/guru"
              element={
                <TeacherRoute>
                  <GuruShell />
                </TeacherRoute>
              }
            >
              <Route index element={<BerandaGuru />} />
              <Route path="kelas" element={<KelasSayaGuru />} />
              <Route path="kelas/:id" element={<StudentProfileGuru />} />
              <Route path="perkembangan" element={<PerkembanganGuru />} />
              <Route path="kehadiran" element={<KehadiranGuru />} />
              <Route path="portfolio" element={<PortfolioGuru />} />
              <Route path="asesmen" element={<AsesmenGuru />} />
              <Route path="iep" element={<IEPGuru />} />
              <Route path="catatan-orang-tua" element={<CatatanOrangTuaGuru />} />
            </Route>
            <Route
              path="/dashboard/child/:id"
              element={
                <PrivateRoute>
                  <SubscriptionGuard>
                    <ChildProfile />
                  </SubscriptionGuard>
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
        </DashboardTier2Provider>
        </SekolahStudivaProvider>
        </FullscreenNotificationProvider>
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
