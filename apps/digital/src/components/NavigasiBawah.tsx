import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Sun, Package, BookHeart, Sprout } from 'lucide-react';

// TODO: review Fitri — semua label di bawah ini
const TABS = [
  { to: '/dashboard/tier2',                     label: 'Beranda',           icon: Home,      end: true  },
  { to: '/dashboard/tier2/irama-hari',           label: 'Irama Hari',        icon: Sun,       end: false },
  { to: '/dashboard/tier2/bekal',                label: 'Bekal',             icon: Package,   end: false },
  { to: '/dashboard/tier2/jurnal-perkembangan',  label: 'Jurnal dan Galeri', icon: BookHeart, end: false },
  { to: '/dashboard/tier2/jejak-mekar',          label: 'Panen',             icon: Sprout,    end: false },
] as const;

export default function NavigasiBawah() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-mawar/20 bg-white/95 backdrop-blur-sm lg:hidden"
      style={{ height: 'calc(64px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ to, label, icon: Icon, end }) => {
        const isActive = end ? pathname === to : pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-inset"
            style={{ color: isActive ? '#E0526B' : 'rgba(58,37,48,.4)' }}
          >
            <span
              className="flex items-center justify-center rounded-full transition motion-reduce:transition-none"
              style={{
                width: 34,
                height: 34,
                background: isActive ? 'rgba(224,82,107,.12)' : 'transparent',
              }}
            >
              <Icon
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={isActive ? 2.5 : 1.5}
              />
            </span>
            <span
              className="font-nunito font-semibold leading-none"
              style={{ fontSize: 10 }}
            >
              {label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
