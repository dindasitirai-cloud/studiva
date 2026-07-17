import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardTier2Provider } from './context/DashboardTier2Context';
import { LearningStrategiesProvider } from './context/LearningStrategiesContext';
import { ToastProvider } from './components/ToastProvider';
import { FullscreenNotificationProvider } from './components/FullscreenNotificationProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute, { AdminRoute, ParentRoute } from './components/PrivateRoute';
import SubscriptionGuard from './components/SubscriptionGuard';

import LandingPage from './pages/LandingPage';
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
// TODO: klasifikasi — sekolah atau digital?
import AdminEnrollmentRequestsPage from './pages/AdminEnrollmentRequestsPage';
import CommunityHubPage from './pages/CommunityHubPage';
import DiscussionDetailPage from './pages/DiscussionDetailPage';
import NewDiscussionPage from './pages/NewDiscussionPage';
import MyCommunityActivityPage from './pages/MyCommunityActivityPage';
import CommunityProfilePage from './pages/CommunityProfilePage';
import AdminCommunityPage from './pages/AdminCommunityPage';
import AskFitriPage from './pages/AskFitriPage';
import AdminFitriDashboardPage from './pages/AdminFitriDashboardPage';
// TODO: klasifikasi — sekolah atau digital?
import ChildProfile from './pages/DashboardPages/ChildProfile';
import DashboardShellTier2 from './pages/DashboardPages/Tier2/DashboardShellTier2';
import BerandaTier2 from './pages/DashboardPages/Tier2/BerandaTier2';
import ProfilAnakTier2 from './pages/DashboardPages/Tier2/ProfilAnakTier2';
import CoursesTier2 from './pages/DashboardPages/Tier2/CoursesTier2';
import LearningStrategiesTier2 from './pages/DashboardPages/Tier2/LearningStrategiesTier2';
import StrategyDetailTier2 from './pages/DashboardPages/Tier2/StrategyDetailTier2';
import CommunityTier2 from './pages/DashboardPages/Tier2/CommunityTier2';
import ThreadDetailTier2 from './pages/DashboardPages/Tier2/ThreadDetailTier2';
import KonsultasiTier2 from './pages/DashboardPages/Tier2/KonsultasiTier2';
import SubscriptionTier2 from './pages/DashboardPages/Tier2/SubscriptionTier2';
import KnowledgeGallery from './pages/DashboardPages/Tier2/KnowledgeGallery';
import KnowledgeCardSummary from './pages/DashboardPages/Tier2/KnowledgeCardSummary';
import KnowledgeCardScientific from './pages/DashboardPages/Tier2/KnowledgeCardScientific';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { KnowledgeLibraryProvider } from './context/KnowledgeLibraryContext';
import AdminShell from './pages/AdminPages/AdminShell';
import BerandaAdmin from './pages/AdminPages/BerandaAdmin';
import CoursesAdmin from './pages/AdminPages/CoursesAdmin';
import StrategiesAdmin from './pages/AdminPages/StrategiesAdmin';
import ForumAdmin from './pages/AdminPages/ForumAdmin';
import KonsultasiAdmin from './pages/AdminPages/KonsultasiAdmin';
import MembersAdmin from './pages/AdminPages/MembersAdmin';
import PaymentsAdmin from './pages/AdminPages/PaymentsAdmin';
import SettingsAdmin from './pages/AdminPages/SettingsAdmin';
// TODO: klasifikasi — sekolah atau digital?
import GuruAkunAdmin from './pages/AdminPages/GuruAkunAdmin';
import KnowledgeCardsAdmin from './pages/AdminPages/KnowledgeCardsAdmin';
import KnowledgeCardFormAdmin from './pages/AdminPages/KnowledgeCardFormAdmin';
import TrackerKontenAdmin from './pages/AdminPages/TrackerKonten';
import PartnerOrangTuaPage from './features/partner-orang-tua/parent/PartnerOrangTuaPage';
import PartnerInboxPage from './features/partner-orang-tua/admin/PartnerInboxPage';
import JurnalPerkembanganPage from './features/jurnal-perkembangan/JurnalPerkembanganPage';

const CONSULTATION_UPGRADE_MESSAGE =
  'Anda perlu upgrade ke Tier 2 untuk melakukan booking konsultasi. Silakan pilih plan yang sesuai untuk mulai berkonsultasi.';

// AdminShell routes only - deliberately NOT a blanket "/admin" prefix check,
// since older standalone admin pages (consultations, community, enrollment-
// requests, fitri-dashboard) still rely on the public Navbar.
const ADMIN_SHELL_PATHS = [
  '/admin', '/admin/courses', '/admin/strategies',
  '/admin/forum', '/admin/konsultasi', '/admin/members', '/admin/payments', '/admin/settings',
  '/admin/guru-akun',
  '/admin/knowledge-cards',
  '/admin/tracker-konten',
  '/admin/partner-orang-tua',
];

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isMemberDashboard = location.pathname.startsWith('/dashboard/tier2');
  const isAdminShell = ADMIN_SHELL_PATHS.some(p => location.pathname === p || location.pathname.startsWith(`${p}/`));

  return (
    <div className="flex min-h-screen flex-col">
      {!isMemberDashboard && !isAdminShell && <Navbar />}
      <main className="flex-1">{children}</main>
      <Footer />
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
        <Layout>
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<LandingPage />} />
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
                  <SubscriptionGuard message="Anda perlu subscription Tier 2 aktif untuk membuat diskusi.">
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
              <Route index element={<BerandaTier2 />} />
              <Route path="profil-anak" element={<ProfilAnakTier2 />} />
              <Route path="subscription" element={<SubscriptionTier2 />} />
              <Route path="knowledge" element={<KnowledgeGallery />} />
              <Route path="knowledge/:cardId" element={<KnowledgeCardSummary />} />
              <Route path="knowledge/:cardId/ilmiah" element={<KnowledgeCardScientific />} />
              <Route path="courses" element={<CoursesTier2 />} />
              <Route path="strategies" element={<LearningStrategiesTier2 />} />
              <Route path="strategies/:id" element={<StrategyDetailTier2 />} />
              <Route path="community" element={<CommunityTier2 />} />
              <Route path="community/:id" element={<ThreadDetailTier2 />} />
              <Route path="konsultasi" element={<KonsultasiTier2 />} />
              <Route path="partner-orang-tua" element={<PartnerOrangTuaPage tierContext="tier2" />} />
              <Route path="jurnal-perkembangan" element={<JurnalPerkembanganPage />} />
            </Route>

            {/* Admin Digital — CMS/content, courses, strategies, forum, konsultasi, subscriptions */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminShell />
                </AdminRoute>
              }
            >
              <Route index element={<BerandaAdmin />} />
              <Route path="courses" element={<CoursesAdmin />} />
              <Route path="strategies" element={<StrategiesAdmin />} />
              <Route path="forum" element={<ForumAdmin />} />
              <Route path="konsultasi" element={<KonsultasiAdmin />} />
              <Route path="members" element={<MembersAdmin />} />
              <Route path="payments" element={<PaymentsAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
              {/* TODO: klasifikasi — sekolah atau digital? */}
              <Route path="guru-akun" element={<GuruAkunAdmin />} />
              <Route path="knowledge-cards" element={<KnowledgeCardsAdmin />} />
              <Route path="knowledge-cards/new" element={<KnowledgeCardFormAdmin />} />
              <Route path="knowledge-cards/:id/edit" element={<KnowledgeCardFormAdmin />} />
              <Route path="tracker-konten" element={<TrackerKontenAdmin />} />
              <Route path="partner-orang-tua" element={<PartnerInboxPage />} />
            </Route>

            {/* Legacy parent path → redirect to Tier 2 (digital has only Tier 2 parents) */}
            <Route
              path="/dashboard/parent"
              element={<Navigate to="/dashboard/tier2" replace />}
            />
            {/* TODO: klasifikasi — sekolah atau digital? */}
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
        </FullscreenNotificationProvider>
        </LearningStrategiesProvider>
        </KnowledgeLibraryProvider>
        </AudioPlayerProvider>
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
