import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GuruProvider, useGuru, PANGGILAN_GURU } from './GuruContext';
import SidebarGuru from './SidebarGuru';

const PAGE_TITLES: Record<string, string> = {
  '/guru': 'Beranda',
  '/guru/kelas': 'Kelas Saya',
  '/guru/perkembangan': 'Perkembangan Harian',
  '/guru/kehadiran': 'Kehadiran',
  '/guru/portfolio': 'Portfolio',
  '/guru/asesmen': 'Asesmen',
  '/guru/iep': 'IEP',
  '/guru/catatan-orang-tua': 'Catatan dari Orang Tua',
};

// Rendered inside <GuruProvider> so it can call useGuru() safely.
function GuruNotificationBell() {
  const navigate = useNavigate();
  const { unreadParentNoteCount } = useGuru();

  return (
    <button
      type="button"
      onClick={() => navigate('/guru/catatan-orang-tua')}
      aria-label="Catatan baru dari orang tua"
      title={unreadParentNoteCount > 0 ? `${unreadParentNoteCount} catatan orang tua belum dibaca` : 'Tidak ada catatan baru'}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl text-stv-muted transition hover:bg-teal-50 hover:text-teal-600"
    >
      <Bell className="h-5 w-5" strokeWidth={2} />
      {unreadParentNoteCount > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unreadParentNoteCount > 9 ? '9+' : unreadParentNoteCount}
        </span>
      )}
    </button>
  );
}

// Guard: teacher-role only. Non-teacher users who somehow land here get
// redirected. TODO: wire to real auth/role system.
function TeacherGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && user && user.role !== 'teacher') {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard/tier2', { replace: true });
    }
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="flex h-48 items-center justify-center text-stv-muted">Memuat dashboard guru...</div>;
  }

  return <>{children}</>;
}

export default function GuruShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <TeacherGuard>
      <GuruProvider>
        <div className="flex font-nunito-sans">
          <SidebarGuru open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
            {/* Topbar */}
            <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-stv-border bg-white px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Buka menu"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-stv-muted transition hover:bg-teal-50 hover:text-teal-600 lg:hidden"
                >
                  <Menu className="h-5 w-5" strokeWidth={2} />
                </button>
                <h1 className="font-baloo text-[18px] font-bold text-stv-navy sm:text-[20px]">{pageTitle}</h1>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden text-[14px] text-stv-body sm:block">
                  Halo, <strong className="text-teal-600">{PANGGILAN_GURU} {user?.name?.split(' ')[0] ?? 'Guru'}</strong> 👋
                </span>
                <GuruNotificationBell />
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
              <Outlet />
            </main>
          </div>
        </div>
      </GuruProvider>
    </TeacherGuard>
  );
}
