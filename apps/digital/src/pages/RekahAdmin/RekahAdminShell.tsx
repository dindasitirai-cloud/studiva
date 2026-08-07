import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ClipboardList, BookOpen, Layers, LayoutDashboard, LogOut, PlayCircle, Library, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoRekah from '../../components/LogoRekah';

const NAV = [
  { to: '/rekah-admin',              label: 'Beranda',          Icon: LayoutDashboard, end: true },
  { to: '/rekah-admin/ajak-main',    label: 'Ajak Main',        Icon: PlayCircle },
  { to: '/rekah-admin/wawasan',      label: 'Wawasan Tumbuh',   Icon: Library },
  { to: '/rekah-admin/sikap',        label: 'Kebiasaan Baik',   Icon: Layers },
  { to: '/rekah-admin/tracker',      label: 'Tracker Konten',   Icon: BarChart2 },
  { to: '/rekah-admin/antrean',      label: 'Antrean Tinjauan', Icon: ClipboardList },
  { to: '/rekah-admin/semua',        label: 'Semua Draf',       Icon: BookOpen },
];

export default function RekahAdminShell() {
  const { peranStaf, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-kanvas">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-rekah/10 bg-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-rekah/10">
          <LogoRekah size={28} withWordmark />
          <span className="text-[11px] font-semibold text-pekat/40 uppercase tracking-widest ml-1">
            Admin
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {NAV.map(({ to, label, Icon, end }) => {
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${
                    isActive
                      ? 'bg-rekah/10 text-rekah'
                      : 'text-pekat/60 hover:bg-rekah/5 hover:text-pekat'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-rekah/10 p-3">
          <div className="mb-2 px-3 py-1">
            <p className="text-[11px] font-bold text-pekat/30 uppercase tracking-widest">
              {peranStaf === 'peninjau_klinis' ? 'Peninjau Klinis' : 'Admin'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-pekat/50 transition hover:bg-red-50 hover:text-rekah"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
