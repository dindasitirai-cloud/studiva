import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, TrendingUp, FolderOpen, ClipboardList, MessageSquare, Video, Clock as ClockIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';
import { DashboardTier1Provider, useDashboardTier1, TeacherNotificationKind } from './DashboardTier1Context';
import { relativeTime } from '../Tier2/relativeTime';
import SidebarTier1 from './SidebarTier1';

const TEACHER_NOTIF_ICON: Record<TeacherNotificationKind, typeof TrendingUp> = {
  perkembangan: TrendingUp,
  portfolio: FolderOpen,
  asesmen: ClipboardList,
};

interface MergedNotification {
  id: string;
  icon: typeof Bell;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  onClick: () => void;
}

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
  '/dashboard/tier1/subscription': 'Subscription',
};

// Lives inside <DashboardTier1Provider> (rendered as a child below), so it
// can call useDashboardTier1() - DashboardShellTier1 itself can't, since
// it's the one rendering the provider, not a descendant of it. Merges two
// sources: things the TEACHER inputs (Tier1Context) and shared Studiva
// Digital activity - forum replies + webinar updates (Tier2Context, which
// is hoisted globally in App.tsx so Tier 1 parents see it too).
function NotificationBellTier1() {
  const navigate = useNavigate();
  const {
    teacherNotifications, unreadTeacherNotificationCount, markTeacherNotificationRead, markAllTeacherNotificationsRead,
  } = useDashboardTier1();
  const { notifications: digitalNotifications, markNotificationRead } = useDashboardTier2();
  const [open, setOpen] = useState(false);

  const merged: MergedNotification[] = [
    ...teacherNotifications.map(n => ({
      id: n.id,
      icon: TEACHER_NOTIF_ICON[n.kind],
      title: n.title,
      message: n.message,
      createdAt: n.createdAt,
      read: n.read,
      onClick: () => { markTeacherNotificationRead(n.id); navigate(n.to); },
    })),
    ...digitalNotifications.map(n => ({
      id: n.id,
      icon: n.kind === 'forum-reply' ? MessageSquare : n.kind === 'webinar-registered' ? Video : ClockIcon,
      title: n.title,
      message: n.message,
      createdAt: n.createdAt,
      read: n.read,
      onClick: () => {
        markNotificationRead(n.id);
        navigate(n.kind === 'forum-reply' && n.threadId ? `/dashboard/tier1/community/${n.threadId}` : '/dashboard/tier1/courses');
      },
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = unreadTeacherNotificationCount + digitalNotifications.filter(n => !n.read).length;

  function handleMarkAllRead() {
    markAllTeacherNotificationsRead();
    digitalNotifications.forEach(n => { if (!n.read) markNotificationRead(n.id); });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifikasi"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-stv-muted transition hover:bg-stv-sky-tint hover:text-stv-sky-stroke"
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-[320px] rounded-2xl bg-white p-3 shadow-[0_20px_50px_rgba(16,58,107,.18)]">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="font-baloo text-[15px] font-bold text-stv-navy">Notifikasi</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[12px] font-semibold text-stv-sky-stroke hover:underline"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {merged.length === 0 ? (
              <p className="px-1 py-6 text-center text-[13px] text-stv-muted">
                Belum ada notifikasi. Anda akan diberi tahu di sini saat ada update dari guru atau aktivitas Studiva Digital.
              </p>
            ) : (
              <div className="flex max-h-[360px] flex-col gap-1 overflow-y-auto">
                {merged.map(n => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => { n.onClick(); setOpen(false); }}
                      className={`flex items-start gap-2.5 rounded-xl p-2.5 text-left transition hover:bg-stv-sky-tint ${
                        n.read ? '' : 'bg-stv-sky-tint/60'
                      }`}
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stv-sky-tint text-stv-sky-stroke">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[13px] font-semibold leading-[1.4] text-stv-navy">{n.title}</span>
                        <span className="mt-0.5 block text-[12px] leading-[1.4] text-stv-body">{n.message}</span>
                        <span className="mt-0.5 block text-[11px] text-stv-muted">{relativeTime(n.createdAt)}</span>
                      </span>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />}
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
