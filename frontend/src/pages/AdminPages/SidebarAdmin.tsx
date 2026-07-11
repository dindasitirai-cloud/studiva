import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Library,
  GraduationCap,
  Lightbulb,
  Users,
  CalendarCheck,
  UserCog,
  CreditCard,
  Settings,
  LogOut,
  X,
  Receipt,
  UserPlus,
  BookUser,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_COLORS, AdminModuleKey } from './adminFeatureColors';
import { useAdmin, AdminRole } from './AdminContext';
import { canAccessModule } from './adminAccess';

const ROLE_OPTIONS: AdminRole[] = ['Super Admin', 'Pengelola Konten', 'Psikolog', 'Staf Operasional'];

const contentNav: { to: string; label: string; icon: typeof Library; key: AdminModuleKey }[] = [
  { to: '/admin/courses', label: 'Courses', icon: GraduationCap, key: 'courses' },
  { to: '/admin/strategies', label: 'Learning Strategies', icon: Lightbulb, key: 'strategies' },
  { to: '/admin/knowledge-cards', label: 'Panduan Tumbuh Kembang', icon: BookOpen, key: 'knowledge-cards' },
];

const communityNav: { to: string; label: string; icon: typeof Users; key: AdminModuleKey }[] = [
  { to: '/admin/forum', label: 'Community Forum', icon: Users, key: 'forum' },
  { to: '/admin/konsultasi', label: 'Konsultasi', icon: CalendarCheck, key: 'konsultasi' },
];

const managementNav: { to: string; label: string; icon: typeof UserCog; key: AdminModuleKey }[] = [
  { to: '/admin/members', label: 'Anggota & Langganan', icon: UserCog, key: 'members' },
  { to: '/admin/payments', label: 'Pembayaran', icon: CreditCard, key: 'payments' },
  { to: '/admin/settings', label: 'Pengaturan', icon: Settings, key: 'settings' },
];

const sekolahNav: { to: string; label: string; icon: typeof UserCog; key: AdminModuleKey }[] = [
  { to: '/admin/spp-billing',  label: 'Tagihan SPP',    icon: Receipt,  key: 'spp-billing'  },
  { to: '/admin/sekolah-akun', label: 'Akun Orang Tua', icon: UserPlus, key: 'sekolah-akun' },
  { to: '/admin/guru-akun',    label: 'Akun Guru',      icon: BookUser, key: 'guru-akun'    },
];

function NavSection({ title, items, onClose }: {
  title?: string;
  items: { to: string; label: string; icon: typeof Library; key: AdminModuleKey }[];
  onClose: () => void;
}) {
  return (
    <>
      {title && (
        <div className="my-4 flex items-center gap-2 px-2">
          <div className="h-px flex-1 bg-stv-border" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-stv-muted-2">{title}</span>
          <div className="h-px flex-1 bg-stv-border" />
        </div>
      )}
      <ul className="space-y-1">
        {items.map(({ to, label, icon: Icon, key }) => {
          const colors = ADMIN_COLORS[key];
          return (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-[10px] text-[15px] font-semibold no-underline transition ${
                    isActive ? `${colors.bg} font-bold ${colors.text}` : 'text-stv-body hover:bg-slate-50 hover:text-stv-navy'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? colors.text : 'text-stv-muted'}`} strokeWidth={2} />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </>
  );
}

interface SidebarAdminProps {
  open: boolean;
  onClose: () => void;
}

export default function SidebarAdmin({ open, onClose }: SidebarAdminProps) {
  const { user, logout } = useAuth();
  const { currentAdminRole, setCurrentAdminRole } = useAdmin();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const canSeeBeranda = canAccessModule(currentAdminRole, 'beranda');
  const visibleContentNav = contentNav.filter(item => canAccessModule(currentAdminRole, item.key));
  const visibleCommunityNav = communityNav.filter(item => canAccessModule(currentAdminRole, item.key));
  const visibleManagementNav = managementNav.filter(item => canAccessModule(currentAdminRole, item.key));
  const visibleSekolahNav = sekolahNav.filter(item => canAccessModule(currentAdminRole, item.key));

  const sidebar = (
    <div className="flex h-full w-64 flex-col bg-white font-nunito-sans shadow-[2px_0_16px_rgba(0,0,0,.06)]">
      {/* Logo */}
      <div className="flex h-[72px] items-center gap-3 border-b border-stv-border px-5">
        <img src="/images/logo-studiva.png" alt="Studiva" className="h-10 w-10 object-contain" />
        <div>
          <div className="font-baloo text-[15px] font-extrabold leading-none text-stv-navy">Studiva</div>
          <div className="text-[11px] font-semibold text-stv-muted">Admin</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {canSeeBeranda && (
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/admin"
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-[10px] text-[15px] font-semibold no-underline transition ${
                    isActive ? 'bg-stv-badge-navy-tint font-bold text-stv-navy' : 'text-stv-body hover:bg-slate-50 hover:text-stv-navy'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <LayoutDashboard className={`h-5 w-5 shrink-0 ${isActive ? 'text-stv-navy' : 'text-stv-muted'}`} strokeWidth={2} />
                    Beranda / Ringkasan
                  </>
                )}
              </NavLink>
            </li>
          </ul>
        )}

        {visibleContentNav.length > 0 && <NavSection title="Konten" items={visibleContentNav} onClose={onClose} />}
        {visibleCommunityNav.length > 0 && <NavSection title="Komunitas" items={visibleCommunityNav} onClose={onClose} />}
        {visibleManagementNav.length > 0 && <NavSection title="Manajemen" items={visibleManagementNav} onClose={onClose} />}
        {visibleSekolahNav.length > 0 && <NavSection title="Sekolah Studiva" items={visibleSekolahNav} onClose={onClose} />}
      </nav>

      {/* Bottom: user info + logout */}
      <div className="border-t border-stv-border p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stv-navy font-baloo text-[16px] font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold text-stv-navy">{user?.name ?? '-'}</div>
            <div className="truncate text-[11px] text-stv-muted">{user?.email ?? ''}</div>
          </div>
        </div>

        {/* TODO: remove once real auth exposes the admin's true role - this
            exists only so role-based access can be tested without separate
            logins per role. */}
        <div className="mb-3">
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-stv-muted-2">Lihat sebagai (demo)</label>
          <select
            value={currentAdminRole}
            onChange={e => setCurrentAdminRole(e.target.value as AdminRole)}
            className="w-full rounded-lg border border-stv-border px-2.5 py-1.5 text-[12px] font-semibold text-stv-navy focus:border-slate-400 focus:outline-none"
          >
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-stv-border py-2 text-[13px] font-semibold text-stv-body transition hover:bg-slate-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <aside className="sticky top-0 hidden h-screen shrink-0 lg:block">
        {sidebar}
      </aside>

      {/* Mobile: overlay drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-stv-navy/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full">
            <div className="relative h-full">
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup menu"
                className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-stv-navy"
              >
                <X className="h-4 w-4" />
              </button>
              {sidebar}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
