import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList, BookOpen, Layers, LayoutDashboard, LogOut, PlayCircle, Library, BarChart2, Footprints, LifeBuoy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoRekah from '../../components/LogoRekah';
import { TEMA, temaDariPath, varTema, TamanTema } from './tema/temaAdmin';
import type { KunciTema } from './tema/temaAdmin';
import './tema/rekahAdminTema.css';

const NAV: Array<{ to: string; label: string; Icon: typeof LayoutDashboard; tema: KunciTema; end?: boolean }> = [
  { to: '/rekah-admin',           label: 'Beranda',          Icon: LayoutDashboard, tema: 'beranda', end: true },
  { to: '/rekah-admin/ajak-main', label: 'Ajak Main',        Icon: PlayCircle,      tema: 'ajak' },
  { to: '/rekah-admin/wawasan',   label: 'Wawasan Tumbuh',   Icon: Library,         tema: 'wawasan' },
  { to: '/rekah-admin/sikap',     label: 'Kebiasaan Baik',   Icon: Layers,          tema: 'sikap' },
  { to: '/rekah-admin/temani',    label: 'Temani',           Icon: Footprints,      tema: 'temani' },
  { to: '/rekah-admin/bantu',     label: 'Bantu',            Icon: LifeBuoy,        tema: 'bantu' },
  { to: '/rekah-admin/tracker',   label: 'Tracker Konten',   Icon: BarChart2,       tema: 'tracker' },
  { to: '/rekah-admin/antrean',   label: 'Antrean Tinjauan', Icon: ClipboardList,   tema: 'antrean' },
  { to: '/rekah-admin/semua',     label: 'Semua Draf',       Icon: BookOpen,        tema: 'semua' },
];

export default function RekahAdminShell() {
  const { peranStaf, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const temaAktif = temaDariPath(pathname);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="ra-tema flex min-h-screen bg-kanvas" style={varTema(temaAktif)}>
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-rekah/10 bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-rekah/10 px-5 py-5">
          <LogoRekah size={28} withWordmark />
          <span className="ml-1 rounded-full bg-fajar px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-rekah-tua">Admin</span>
        </div>

        <nav aria-label="Menu Rekah Admin" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {NAV.map(({ to, label, Icon, end, tema }) => {
            const t = TEMA[tema];
            return (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => `group flex items-center gap-3 rounded-2xl px-2.5 py-2 text-[13px] font-semibold transition ${isActive ? 'text-pekat' : 'text-pekat/60 hover:text-pekat'}`}
                style={({ isActive }) => (isActive ? { background: t.tint } : undefined)}
              >
                {({ isActive }) => (
                  <>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition"
                      style={{ background: isActive ? t.teks : t.tint, color: isActive ? '#FFFFFF' : t.teks }}>
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-rekah/10 p-3">
          <div className="mb-1 hidden justify-center opacity-90 [@media(min-height:900px)]:flex"><TamanTema tema={temaAktif} kecil /></div>
          <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-pekat/35">
            {peranStaf === 'peninjau_klinis' ? 'Peninjau Klinis' : 'Admin'}
          </p>
          <button type="button" onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-pekat/50 transition hover:bg-fajar hover:text-rekah-tua">
            <LogOut className="h-4 w-4 shrink-0" /> Keluar
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Navigasi ponsel/tablet */}
        <nav aria-label="Menu Rekah Admin" className="sticky top-0 z-20 flex gap-2 overflow-x-auto border-b border-rekah/10 bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
          {NAV.map(({ to, label, Icon, end, tema }) => {
            const t = TEMA[tema];
            return (
              <NavLink key={to} to={to} end={end}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                style={({ isActive }) => (isActive ? { background: t.teks, color: '#fff' } : { background: t.tint, color: t.teks })}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </NavLink>
            );
          })}
          <button type="button" onClick={handleLogout} className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-pekat/50">
            <LogOut className="h-3.5 w-3.5" /> Keluar
          </button>
        </nav>

        <main className="relative flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
