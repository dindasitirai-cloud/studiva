import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SekolahStudivaProvider } from './context/SekolahStudivaContext';
import { DashboardTier2Provider } from './context/DashboardTier2Context';
import { ToastProvider } from './components/ToastProvider';
import { FullscreenNotificationProvider } from './components/FullscreenNotificationProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute, { AdminRoute, ParentRoute, TeacherRoute } from './components/PrivateRoute';

import LandingPage from './pages/LandingPage';
import SekolahStudivaPage from './pages/SekolahStudivaPage';
import AboutPage from './pages/AboutPage';
import TentangPage from './pages/TentangPage';
import KontakPage from './pages/KontakPage';
import LoginPage from './pages/LoginPage';
// TODO: verifikasi callback URL auth untuk domain sekolah
// ParentDashboard removed — sekolah hanya punya Tier 1 parents, redirect langsung
import TeacherDashboard from './pages/DashboardPages/TeacherDashboard';
import ChildProfile from './pages/DashboardPages/ChildProfile';

// Tier 1 parent dashboard (school-specific)
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
import PembayaranSPPTier1 from './pages/DashboardPages/Tier1/PembayaranSPPTier1';
// TODO: klasifikasi manual — sekolah atau digital?
import SubscriptionTier1 from './pages/DashboardPages/Tier1/SubscriptionTier1';

// Guru dashboard
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

// Admin Sekolah — HANYA pembuatan akun Tier 1 + SPP billing
import AdminShell from './pages/AdminPages/AdminShell';
import BerandaAdmin from './pages/AdminPages/BerandaAdmin';
import SettingsAdmin from './pages/AdminPages/SettingsAdmin';
import SppAdmin from './pages/AdminPages/SppAdmin';
import SekolahAkunAdmin from './pages/AdminPages/SekolahAkunAdmin';
// TODO: klasifikasi admin — sekolah atau digital?
import GuruAkunAdmin from './pages/AdminPages/GuruAkunAdmin';
// TODO: klasifikasi admin — sekolah atau digital?
import AdminEnrollmentRequestsPage from './pages/AdminEnrollmentRequestsPage';

// Partner Orang Tua (school communication feature)
import PartnerOrangTuaPage from './features/partner-orang-tua/parent/PartnerOrangTuaPage';
import PartnerInboxPage from './features/partner-orang-tua/admin/PartnerInboxPage';

const ADMIN_SHELL_PATHS = [
  '/admin',
  '/admin/spp-billing',
  '/admin/sekolah-akun',
  '/admin/guru-akun',
  '/admin/settings',
  '/admin/partner-orang-tua',
];

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isMemberDashboard =
    location.pathname.startsWith('/dashboard/tier1');
  const isAdminShell = ADMIN_SHELL_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`),
  );
  const isGuruShell =
    location.pathname === '/guru' || location.pathname.startsWith('/guru/');

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
        <ToastProvider>
        <FullscreenNotificationProvider>
        <SekolahStudivaProvider>
        <DashboardTier2Provider>
        <Layout>
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/sekolah-studiva" element={<SekolahStudivaPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/tentang" element={<TentangPage />} />
            <Route path="/kontak" element={<KontakPage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Self-registration removed — akun dibuat oleh admin */}

            {/* Admin Enrollment Requests — TODO: klasifikasi admin — sekolah atau digital? */}
            <Route
              path="/admin/enrollment-requests"
              element={
                <AdminRoute>
                  <AdminEnrollmentRequestsPage />
                </AdminRoute>
              }
            />

            {/* Tier 1 parent dashboard (school-specific) */}
            <Route
              path="/dashboard/tier1"
              element={
                <ParentRoute>
                  <DashboardShellTier1 />
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
              <Route path="pembayaran-spp" element={<PembayaranSPPTier1 />} />
              {/* TODO: klasifikasi manual — sekolah atau digital? */}
              <Route path="subscription" element={<SubscriptionTier1 />} />
              <Route
                path="partner-orang-tua"
                element={<PartnerOrangTuaPage tierContext="tier1" />}
              />
            </Route>

            {/* Admin Sekolah — HANYA pembuatan akun Tier 1 + SPP billing */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminShell />
                </AdminRoute>
              }
            >
              <Route index element={<BerandaAdmin />} />
              <Route path="spp-billing" element={<SppAdmin />} />
              <Route path="sekolah-akun" element={<SekolahAkunAdmin />} />
              {/* TODO: klasifikasi admin — sekolah atau digital? */}
              <Route path="guru-akun" element={<GuruAkunAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
              <Route path="partner-orang-tua" element={<PartnerInboxPage />} />
            </Route>

            {/* Guru dashboard */}
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

            {/* Legacy parent path → redirect to Tier 1 (sekolah only has Tier 1 parents) */}
            <Route
              path="/dashboard/parent"
              element={<Navigate to="/dashboard/tier1" replace />}
            />
            <Route
              path="/dashboard/teacher"
              element={
                <TeacherRoute>
                  <TeacherDashboard />
                </TeacherRoute>
              }
            />
            <Route
              path="/dashboard/child/:id"
              element={
                <PrivateRoute>
                  <ChildProfile />
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
