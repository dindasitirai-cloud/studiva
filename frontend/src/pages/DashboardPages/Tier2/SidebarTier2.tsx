import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Baby,
  Library,
  GraduationCap,
  Lightbulb,
  Users,
  CalendarCheck,
  Settings,
  LogOut,
  CreditCard,
  X,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const navItems = [
  { to: '/dashboard/tier2', label: 'Beranda', icon: Home, end: true },
  { to: '/dashboard/tier2/profil-anak', label: 'Profil Anak', icon: Baby },
  { to: '/dashboard/tier2/knowledge', label: 'Panduan Tumbuh Kembang', icon: BookOpen },
  { to: '/dashboard/tier2/resources', label: 'Resource Library', icon: Library },
  { to: '/dashboard/tier2/courses', label: 'Courses', icon: GraduationCap },
  { to: '/dashboard/tier2/strategies', label: 'Learning Strategies', icon: Lightbulb },
  { to: '/dashboard/tier2/community', label: 'Community Forum', icon: Users },
  { to: '/dashboard/tier2/konsultasi', label: 'Konsultasi', icon: CalendarCheck },
];

interface SidebarTier2Props {
  open: boolean;
  onClose: () => void;
}

export default function SidebarTier2({ open, onClose }: SidebarTier2Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleSubscriptionClick() {
    setSettingsOpen(false);
    onClose();
    navigate('/dashboard/tier2/subscription');
  }

  const sidebar = (
    <div className="flex h-full w-64 flex-col bg-white font-nunito-sans shadow-[2px_0_16px_rgba(0,0,0,.06)]">
      {/* Logo */}
      <div className="flex h-[72px] items-center gap-3 border-b border-amber-100 px-5">
        <img src="/images/logo-studiva.png" alt="Studiva" className="h-10 w-10 object-contain" />
        <div>
          <div className="font-baloo text-[15px] font-extrabold leading-none text-stv-navy">Studiva</div>
          <div className="text-[11px] font-semibold text-amber-600">Digital · Tier 2</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-[10px] text-[15px] font-semibold no-underline transition ${
                    isActive
                      ? 'bg-amber-50 font-bold text-amber-700'
                      : 'text-stv-body hover:bg-amber-50 hover:text-amber-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 shrink-0 ${isActive ? 'text-amber-600' : 'text-stv-muted'}`}
                      strokeWidth={2}
                    />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom: user info + settings + logout */}
      <div className="border-t border-amber-100 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-amber-50 px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 font-baloo text-[16px] font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold text-stv-navy">{user?.name ?? '-'}</div>
            <div className="truncate text-[11px] text-stv-muted">{user?.email ?? ''}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setSettingsOpen(o => !o)}
              aria-expanded={settingsOpen}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-200 py-2 text-[13px] font-semibold text-stv-body transition hover:bg-amber-50"
            >
              <Settings className="h-4 w-4" strokeWidth={2} />
              Pengaturan
            </button>

            {settingsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
                <div className="absolute bottom-full left-0 z-50 mb-2 w-48 rounded-xl bg-white p-1.5 shadow-[0_12px_32px_rgba(16,58,107,.18)]">
                  <button
                    type="button"
                    onClick={handleSubscriptionClick}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-stv-body transition hover:bg-amber-50 hover:text-amber-700"
                  >
                    <CreditCard className="h-4 w-4 shrink-0" strokeWidth={2} />
                    Subscription
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 py-2 text-[13px] font-semibold text-stv-body transition hover:bg-amber-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Keluar
          </button>
        </div>
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
                className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700"
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
