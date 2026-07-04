import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, MessageCircleWarning, CalendarCheck, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminProvider, useAdmin } from './AdminContext';
import { useAdminActionItems, AdminActionKind } from './useAdminActionItems';
import { canAccessModule, defaultModuleFor, MODULE_PATH, PATH_MODULE } from './adminAccess';
import SidebarAdmin from './SidebarAdmin';

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Beranda / Ringkasan',
  '/admin/resource-library': 'Resource Library',
  '/admin/courses': 'Courses',
  '/admin/strategies': 'Learning Strategies',
  '/admin/forum': 'Community Forum',
  '/admin/konsultasi': 'Konsultasi',
  '/admin/members': 'Anggota & Langganan',
  '/admin/payments': 'Pembayaran',
  '/admin/settings': 'Pengaturan',
  '/admin/spp-billing':  'Tagihan SPP, Sekolah Studiva',
  '/admin/sekolah-akun': 'Akun Orang Tua, Sekolah Studiva',
  '/admin/guru-akun':    'Akun Guru',
  '/admin/knowledge-cards': 'Panduan Tumbuh Kembang — CMS',
  '/admin/knowledge-cards/new': 'Tambah Kartu',
};

const ACTION_ICON: Record<AdminActionKind, typeof Bell> = {
  'forum-unanswered': MessageCircleWarning,
  'booking-new': CalendarCheck,
  'webinar-upcoming': Video,
};

// Lives inside <AdminProvider> (rendered as a child below), so it can call
// useAdmin()-adjacent hooks - AdminShell itself can't, since it's the one
// rendering the provider, not a descendant of it.
function NotificationBellAdmin() {
  const navigate = useNavigate();
  const items = useAdminActionItems();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifikasi"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-stv-muted transition hover:bg-slate-100 hover:text-stv-navy"
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        {items.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {items.length > 9 ? '9+' : items.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-[320px] rounded-2xl bg-white p-3 shadow-[0_20px_50px_rgba(16,58,107,.18)]">
            <p className="mb-2 px-1 font-baloo text-[15px] font-bold text-stv-navy">Perlu Tindakan Anda</p>

            {items.length === 0 ? (
              <p className="px-1 py-6 text-center text-[13px] text-stv-muted">
                Semua sudah ditangani. Tidak ada yang perlu tindakan saat ini.
              </p>
            ) : (
              <div className="flex max-h-[360px] flex-col gap-1 overflow-y-auto">
                {items.map(item => {
                  const Icon = ACTION_ICON[item.kind];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { navigate(item.to); setOpen(false); }}
                      className="flex items-start gap-2.5 rounded-xl p-2.5 text-left transition hover:bg-slate-50"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[13px] font-semibold leading-[1.4] text-stv-navy">{item.title}</span>
                        <span className="mt-0.5 block text-[12px] leading-[1.4] text-stv-body">{item.description}</span>
                      </span>
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

// Lives inside <AdminProvider> so it can read currentAdminRole. Redirects
// away from any module the current role can't reach (e.g. Pengelola Konten
// hitting /admin/members directly via URL) to that role's first allowed
// module, instead of rendering it.
function AdminSectionGuard({ children }: { children: React.ReactNode }) {
  const { currentAdminRole } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const module = PATH_MODULE[location.pathname];

  useEffect(() => {
    if (module && !canAccessModule(currentAdminRole, module)) {
      navigate(MODULE_PATH[defaultModuleFor(currentAdminRole)], { replace: true });
    }
  }, [module, currentAdminRole, navigate]);

  if (module && !canAccessModule(currentAdminRole, module)) {
    return <div className="flex h-48 items-center justify-center text-stv-muted">Mengalihkan...</div>;
  }

  return <>{children}</>;
}

export default function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <AdminProvider>
      <div className="flex font-nunito-sans">
        <SidebarAdmin open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content column */}
        <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-stv-border bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Hamburger for mobile */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Buka menu"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-stv-muted transition hover:bg-slate-100 hover:text-stv-navy lg:hidden"
              >
                <Menu className="h-5 w-5" strokeWidth={2} />
              </button>
              <h1 className="font-baloo text-[18px] font-bold text-stv-navy sm:text-[20px]">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-[14px] text-stv-body sm:block">
                Halo, <strong className="text-stv-navy">{user?.name?.split(' ')[0] ?? 'Admin'}</strong>
              </span>
              <NotificationBellAdmin />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <AdminSectionGuard>
              <Outlet />
            </AdminSectionGuard>
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
