import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Users, TrendingUp, CalendarCheck, FolderOpen, ClipboardList,
  Target, MessageSquare, Settings, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGuru, PANGGILAN_GURU } from './GuruContext';
import { GURU_COLORS, GuruModuleKey } from './guruFeatureColors';

type NavItem = { to: string; label: string; icon: typeof Home; key: GuruModuleKey };

const mainNav: NavItem[] = [
  { to: '/guru', label: 'Beranda', icon: Home, key: 'beranda' },
  { to: '/guru/kelas', label: 'Kelas Saya', icon: Users, key: 'kelas' },
  { to: '/guru/perkembangan', label: 'Perkembangan Harian', icon: TrendingUp, key: 'perkembangan' },
  { to: '/guru/kehadiran', label: 'Kehadiran', icon: CalendarCheck, key: 'kehadiran' },
  { to: '/guru/portfolio', label: 'Portfolio', icon: FolderOpen, key: 'portfolio' },
  { to: '/guru/asesmen', label: 'Asesmen', icon: ClipboardList, key: 'asesmen' },
  { to: '/guru/iep', label: 'IEP', icon: Target, key: 'iep' },
  { to: '/guru/catatan-orang-tua', label: 'Catatan Orang Tua', icon: MessageSquare, key: 'catatan-ortu' },
];

interface SidebarGuruProps {
  open: boolean;
  onClose: () => void;
}

export default function SidebarGuru({ open, onClose }: SidebarGuruProps) {
  const { user, logout } = useAuth();
  const { unreadParentNoteCount } = useGuru();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const sidebar = (
    <div className="flex h-full w-64 flex-col bg-white font-nunito-sans shadow-[2px_0_16px_rgba(0,0,0,.06)]">
      {/* Logo */}
      <div className="flex h-[72px] items-center gap-3 border-b border-stv-border px-5">
        <img src="/images/logo-studiva.png" alt="Studiva" className="h-10 w-10 object-contain" />
        <div>
          <div className="font-baloo text-[15px] font-extrabold leading-none text-stv-navy">Studiva</div>
          <div className="text-[11px] font-semibold text-teal-600">Panel Guru</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {mainNav.map(({ to, label, icon: Icon, key }) => {
            const colors = GURU_COLORS[key];
            const isCatatanOrtu = key === 'catatan-ortu';
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/guru'}
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
                      <span className="flex-1">{label}</span>
                      {isCatatanOrtu && unreadParentNoteCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          {unreadParentNoteCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: user info + settings + logout */}
      <div className="border-t border-stv-border p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-teal-50 px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 font-baloo text-[16px] font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold text-stv-navy">{PANGGILAN_GURU} {user?.name ?? '-'}</div>
            <div className="truncate text-[11px] text-stv-muted">Guru &middot; {user?.email ?? ''}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setSettingsOpen(o => !o)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-stv-border py-2 text-[13px] font-semibold text-stv-body transition hover:bg-teal-50"
            >
              <Settings className="h-4 w-4" strokeWidth={2} />
              Pengaturan
            </button>
            {settingsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
                <div className="absolute bottom-full left-0 z-50 mb-2 w-44 rounded-xl bg-white p-1.5 shadow-[0_12px_32px_rgba(16,58,107,.18)]">
                  <button
                    type="button"
                    onClick={() => { setSettingsOpen(false); onClose(); navigate('/subscription-settings'); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-stv-body transition hover:bg-teal-50 hover:text-teal-700"
                  >
                    Subscription
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-stv-border py-2 text-[13px] font-semibold text-stv-body transition hover:bg-red-50 hover:text-red-600"
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
      <aside className="sticky top-0 hidden h-screen shrink-0 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-stv-navy/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full">
            <div className="relative h-full">
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup menu"
                className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-700"
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
