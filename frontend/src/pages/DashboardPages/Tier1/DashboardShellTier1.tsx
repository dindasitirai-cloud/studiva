import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { DashboardTier1Provider, useDashboardTier1 } from './DashboardTier1Context';
import SidebarTier1 from './SidebarTier1';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard/tier1': 'Beranda',
  '/dashboard/tier1/profil-anak': 'Profil Anak',
  '/dashboard/tier1/perkembangan': 'Perkembangan Harian',
  '/dashboard/tier1/kehadiran': 'Kehadiran',
  '/dashboard/tier1/portfolio': 'Portfolio',
  '/dashboard/tier1/asesmen': 'Asesmen',
  '/dashboard/tier1/iep': 'IEP',
  '/dashboard/tier1/catatan-guru': 'Catatan untuk Guru',
  '/dashboard/tier1/resources': 'Resource Library',
  '/dashboard/tier1/courses': 'Courses',
  '/dashboard/tier1/strategies': 'Learning Strategies',
  '/dashboard/tier1/community': 'Community Forum',
  '/dashboard/tier1/konsultasi': 'Konsultasi',
};

// Lives inside <DashboardTier1Provider> (rendered as a child below), so it
// can call useDashboardTier1() - DashboardShellTier1 itself can't, since
// it's the one rendering the provider, not a descendant of it.
function NotificationBellTier1() {
  const navigate = useNavigate();
  const { latestUpdate } = useDashboardTier1();
  const isToday = latestUpdate && latestUpdate.date.slice(0, 10) === new Date().toISOString().slice(0, 10);

  return (
    <button
      type="button"
      onClick={() => navigate('/dashboard/tier1/perkembangan')}
      aria-label="Notifikasi update guru"
      title={isToday ? 'Ada update baru dari guru hari ini' : 'Belum ada update baru hari ini'}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl text-stv-muted transition hover:bg-stv-sky-tint hover:text-stv-sky-stroke"
    >
      <Bell className="h-5 w-5" strokeWidth={2} />
      {isToday && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />}
    </button>
  );
}

// Guard: tier1 users only. Other tiers who somehow land here get sent back.
function Tier1Guard({ children }: { children: React.ReactNode }) {
  const { tier, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && tier && tier !== 'tier1') {
      navigate(tier === 'tier2' ? '/dashboard/tier2' : '/dashboard/parent', { replace: true });
    }
  }, [tier, loading, navigate]);

  if (loading || !tier) {
    return <div className="flex h-48 items-center justify-center text-stv-muted">Memuat dashboard...</div>;
  }

  return <>{children}</>;
}

export default function DashboardShellTier1() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const pageTitle =
    PAGE_TITLES[location.pathname] ??
    (location.pathname.startsWith('/dashboard/tier1/resources/')
      ? 'Artikel'
      : location.pathname.startsWith('/dashboard/tier1/strategies/')
      ? 'Strategi'
      : location.pathname.startsWith('/dashboard/tier1/community/')
      ? 'Diskusi'
      : location.pathname.startsWith('/dashboard/tier1/asesmen/')
      ? 'Detail Asesmen'
      : 'Dashboard');

  return (
    <Tier1Guard>
      <DashboardTier1Provider>
        <div className="flex font-nunito-sans">
          <SidebarTier1 open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main content column */}
          <div className="flex min-h-screen flex-1 flex-col bg-stv-sky-tint/30">
            {/* Topbar */}
            <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-stv-sky-tint bg-white px-4 sm:px-6">
              <div className="flex items-center gap-3">
                {/* Hamburger for mobile */}
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Buka menu"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-stv-muted transition hover:bg-stv-sky-tint hover:text-stv-sky-stroke lg:hidden"
                >
                  <Menu className="h-5 w-5" strokeWidth={2} />
                </button>
                <h1 className="font-baloo text-[18px] font-bold text-stv-navy sm:text-[20px]">{pageTitle}</h1>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden text-[14px] text-stv-body sm:block">
                  Halo, <strong className="text-stv-navy">{user?.name?.split(' ')[0] ?? 'Bunda'}</strong> 👋
                </span>
                <NotificationBellTier1 />
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
              <Outlet />
            </main>
          </div>
        </div>
      </DashboardTier1Provider>
    </Tier1Guard>
  );
}
