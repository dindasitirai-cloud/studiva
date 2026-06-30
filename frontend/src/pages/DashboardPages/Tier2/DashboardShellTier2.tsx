import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, MessageSquare, Video, Clock as ClockIcon, CalendarCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useDashboardTier2, AppNotification } from '../../../context/DashboardTier2Context';
import SidebarTier2 from './SidebarTier2';
import { relativeTime } from './relativeTime';

const NOTIF_ICON: Record<AppNotification['kind'], typeof MessageSquare> = {
  'forum-reply': MessageSquare,
  'webinar-registered': Video,
  'webinar-reminder': ClockIcon,
  'consultation-confirmed': CalendarCheck,
};

const PAGE_TITLES: Record<string, string> = {
  '/dashboard/tier2': 'Beranda',
  '/dashboard/tier2/profil-anak': 'Profil Anak',
  '/dashboard/tier2/resources': 'Resource Library',
  '/dashboard/tier2/courses': 'Courses',
  '/dashboard/tier2/strategies': 'Learning Strategies',
  '/dashboard/tier2/community': 'Community Forum',
  '/dashboard/tier2/konsultasi': 'Konsultasi',
  '/dashboard/tier2/subscription': 'Subscription',
};

// Lives inside <DashboardTier2Provider> (rendered as a child below), so it
// can call useDashboardTier2() - the parent DashboardShellTier2 component
// itself can't, since it's the one rendering the provider, not a descendant
// of it.
function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead } = useDashboardTier2();
  const [open, setOpen] = useState(false);

  function handleClickNotification(n: AppNotification) {
    markNotificationRead(n.id);
    setOpen(false);
    if (n.kind === 'forum-reply' && n.threadId) {
      navigate(`/dashboard/tier2/community/${n.threadId}`);
    } else if (n.kind === 'consultation-confirmed') {
      navigate('/dashboard/tier2/konsultasi');
    } else {
      navigate('/dashboard/tier2/courses');
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifikasi"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-stv-muted transition hover:bg-amber-50 hover:text-amber-600"
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        {unreadNotificationCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-[320px] rounded-2xl bg-white p-3 shadow-[0_20px_50px_rgba(16,58,107,.18)]">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="font-baloo text-[15px] font-bold text-stv-navy">Notifikasi</p>
              {unreadNotificationCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-[12px] font-semibold text-amber-600 hover:underline"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="px-1 py-6 text-center text-[13px] text-stv-muted">
                Belum ada notifikasi. Anda akan diberi tahu di sini saat ada balasan forum atau update webinar.
              </p>
            ) : (
              <div className="flex max-h-[360px] flex-col gap-1 overflow-y-auto">
                {notifications.map(n => {
                  const Icon = NOTIF_ICON[n.kind];
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleClickNotification(n)}
                      className={`flex items-start gap-2.5 rounded-xl p-2.5 text-left transition hover:bg-amber-50 ${
                        n.read ? '' : 'bg-amber-50/70'
                      }`}
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[13px] font-semibold leading-[1.4] text-stv-navy">{n.title}</span>
                        <span className="mt-0.5 block text-[12px] leading-[1.4] text-stv-body">{n.message}</span>
                        <span className="mt-0.5 block text-[11px] text-stv-muted">{relativeTime(n.createdAt)}</span>
                      </span>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Guard: tier2 users only. Tier1 parents who somehow land here get sent back.
function Tier2Guard({ children }: { children: React.ReactNode }) {
  const { tier, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && tier && tier !== 'tier2') {
      navigate(tier === 'tier1' ? '/dashboard/tier1' : '/dashboard/parent', { replace: true });
    }
  }, [tier, loading, navigate]);

  if (loading || !tier) {
    return <div className="flex h-48 items-center justify-center text-stv-muted">Memuat dashboard...</div>;
  }

  return <>{children}</>;
}

export default function DashboardShellTier2() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const pageTitle =
    PAGE_TITLES[location.pathname] ??
    (location.pathname.startsWith('/dashboard/tier2/resources/')
      ? 'Artikel'
      : location.pathname.startsWith('/dashboard/tier2/strategies/')
      ? 'Strategi'
      : location.pathname.startsWith('/dashboard/tier2/community/')
      ? 'Diskusi'
      : 'Dashboard');

  return (
    <Tier2Guard>
      <div className="flex font-nunito-sans">
        <SidebarTier2 open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content column */}
        <div className="flex min-h-screen flex-1 flex-col bg-amber-50/30">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-amber-100 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Hamburger for mobile */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Buka menu"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-stv-muted transition hover:bg-amber-50 hover:text-amber-600 lg:hidden"
              >
                <Menu className="h-5 w-5" strokeWidth={2} />
              </button>
              <h1 className="font-baloo text-[18px] font-bold text-stv-navy sm:text-[20px]">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-[14px] text-stv-body sm:block">
                Halo, <strong className="text-stv-navy">{user?.name?.split(' ')[0] ?? 'Bunda'}</strong> 👋
              </span>
              <NotificationBell />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </Tier2Guard>
  );
}
