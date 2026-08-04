import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import LogoRekah from '../../../components/LogoRekah';
import Kelopak from '../../../components/Kelopak';

interface NavItem {
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Irama Hari',       to: '/dashboard/tier2/irama-hari' },
  { label: 'Bekal',            to: '/dashboard/tier2/bekal' },
  { label: 'Jurnal dan Galeri', to: '/dashboard/tier2/jurnal-perkembangan' },
  { label: 'Panen',             to: '/dashboard/tier2/jejak-mekar' },
];

interface TopNavTier2Props {
  onMenuClick: () => void;
}

export default function TopNavTier2({ onMenuClick }: TopNavTier2Props) {
  const { user } = useAuth();
  const inisial = user?.name?.charAt(0)?.toUpperCase() ?? 'A';
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-mawar/20 bg-white">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-6 px-5 sm:px-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <LogoRekah size={28} withWordmark />
        </div>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-[10px] px-3 py-2 text-[14px] font-semibold transition ${
                  isActive
                    ? 'bg-fajar text-rekah'
                    : 'text-pekat/65 hover:bg-fajar hover:text-rekah'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Avatar */}
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/tier2/pengaturan')}
            aria-label="Profil"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-rekah text-[14px] font-bold text-white shadow-sm transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            {inisial}
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Buka menu"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-pekat/50 transition hover:bg-fajar hover:text-rekah lg:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-pekat/40" onClick={onClose} />
      <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
        <div className="flex h-[60px] items-center justify-between border-b border-fajar px-5">
          <LogoRekah size={26} withWordmark />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-fajar text-rekah"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="px-3 py-4">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block rounded-[12px] px-4 py-2.5 text-[14px] font-semibold transition ${
                      isActive ? 'bg-fajar font-bold text-rekah' : 'text-pekat/65 hover:bg-fajar hover:text-rekah'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
