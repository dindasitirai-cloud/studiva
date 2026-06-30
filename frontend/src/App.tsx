import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute, { AdminRoute, ParentRoute, TeacherRoute } from './components/PrivateRoute';
import SubscriptionGuard from './components/SubscriptionGuard';

import LandingPage from './pages/LandingPage';
import SekolahStudivaPage from './pages/SekolahStudivaPage';
import StudivaDigitalPage from './pages/StudivaDigitalPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import ResourcesPage from './pages/ResourcesPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
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

const CONSULTATION_UPGRADE_MESSAGE =
  'Anda perlu upgrade ke Tier 1 atau Tier 2 untuk melakukan booking konsultasi. Silakan pilih plan yang sesuai untuk mulai berkonsultasi.';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sekolah-studiva" element={<SekolahStudivaPage />} />
            <Route path="/studiva-digital" element={<StudivaDigitalPage />} />
            <Route path="/about" element={<AboutPage />} />
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
              <Route path="resources" element={<ResourceLibraryTier2 />} />
              <Route path="resources/:id" element={<ArticleDetailTier2 />} />
              <Route path="courses" element={<CoursesTier2 />} />
              <Route path="strategies" element={<LearningStrategiesTier2 />} />
              <Route path="strategies/:id" element={<StrategyDetailTier2 />} />
              <Route path="community" element={<CommunityTier2 />} />
              <Route path="community/:id" element={<ThreadDetailTier2 />} />
              <Route path="konsultasi" element={<KonsultasiTier2 />} />
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
      </BrowserRouter>
    </AuthProvider>
  );
}
