import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Baby, HeartHandshake, CreditCard, Settings, LogOut, X, CalendarDays, Sprout, BookOpen, BookHeart, Compass,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import LogoRekah from '../../../components/LogoRekah';
import Kelopak from '../../../components/Kelopak';

const navItems = [
  { to: '/dashboard/tier2', label: 'Beranda', icon: Home, end: true },
  { to: '/dashboard/tier2/rencana', label: 'Rencana Pekan Ini', icon: CalendarDays },
  { to: '/dashboard/tier2/jelajah', label: 'Jelajah', icon: Compass },
  { to: '/dashboard/tier2/jejak-mekar', label: 'Jejak Mekar', icon: Sprout },
  { to: '/dashboard/tier2/jurnal', label: 'Jurnal', icon: BookOpen },
  { to: '/dashboard/tier2/jurnal-perkembangan', label: 'Jurnal Perkembangan', icon: BookHeart },
  { to: '/dashboard/tier2/profil-anak', label: 'Profil Anak', icon: Baby },
  { to: '/dashboard/tier2/partner-orang-tua', label: 'Partner Orang Tua', icon: HeartHandshake },
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
    <div className="flex h-full w-64 flex-col bg-white shadow-[2px_0_16px_rgba(224,82,107,0.07)]">
      <div className="flex h-[72px] items-center gap-3 border-b border-fajar px-5">
        <LogoRekah size={32} withWordmark />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-[14px] px-4 py-[10px] text-[15px] font-semibold no-underline transition ${
                    isActive
                      ? 'bg-fajar font-bold text-rekah-tua'
                      : 'text-pekat/65 hover:bg-fajar hover:text-rekah'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 shrink-0 ${isActive ? 'text-rekah' : 'text-pekat/40'}`}
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

      <div className="border-t border-fajar p-3">
        <div className="mb-3 flex items-center gap-3 rounded-[16px] bg-fajar px-3 py-3">
          <Kelopak className="flex h-9 w-9 shrink-0 items-center justify-center bg-rekah">
            <span className="font-bricolage text-[16px] font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </Kelopak>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold text-pekat">{user?.name ?? '-'}</div>
            <div className="truncate text-[11px] text-pekat/50">{user?.email ?? ''}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setSettingsOpen(o => !o)}
              aria-expanded={settingsOpen}
              className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-mawar py-2 text-[13px] font-semibold text-pekat/70 transition hover:bg-fajar min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
            >
              <Settings className="h-4 w-4" strokeWidth={2} />
              Pengaturan
            </button>

            {settingsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
                <div className="absolute bottom-full left-0 z-50 mb-2 w-48 rounded-[16px] bg-white p-1.5 shadow-[0_12px_32px_rgba(224,82,107,0.16)]">
                  <button
                    type="button"
                    onClick={() => { setSettingsOpen(false); onClose(); navigate('/dashboard/tier2/pengaturan'); }}
                    className="flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-pekat/70 transition hover:bg-fajar hover:text-rekah"
                  >
                    <Settings className="h-4 w-4 shrink-0" strokeWidth={2} />
                    Profil & Nilai
                  </button>
                  <button
                    type="button"
                    onClick={handleSubscriptionClick}
                    className="flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-pekat/70 transition hover:bg-fajar hover:text-rekah"
                  >
                    <CreditCard className="h-4 w-4 shrink-0" strokeWidth={2} />
                    Langganan
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 rounded-[10px] border border-mawar py-2 text-[13px] font-semibold text-pekat/70 transition hover:bg-fajar hover:text-rekah-tua min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
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
      <aside className="sticky top-0 hidden h-screen shrink-0 lg:block">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-pekat/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full">
            <div className="relative h-full">
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup menu"
                className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-fajar text-rekah"
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
