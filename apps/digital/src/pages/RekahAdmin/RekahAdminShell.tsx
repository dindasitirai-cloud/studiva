import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList, BookOpen, Layers, LayoutDashboard, LogOut, PlayCircle, Library, BarChart2, Footprints, LifeBuoy, History, Flower2,
} from 'lucide-react';
import { muatAntrean } from '../../lib/supabase/pipeline';
import { namaPeninjau } from './peninjau/BerandaPeninjau';
import { useAuth } from '../../context/AuthContext';
import LogoRekah from '../../components/LogoRekah';
import { TEMA, temaDariPath, varTema, TamanTema } from './tema/temaAdmin';
import type { KunciTema } from './tema/temaAdmin';
import './tema/rekahAdminTema.css';

type ItemNav = { to: string; label: string; Icon: typeof LayoutDashboard; tema: KunciTema; end?: boolean; badge?: boolean; grup?: string };

// Akun peninjau klinis (Psikolog Fitri): fokus meninjau, konten tayang bisa dilihat (baca saja).
const NAV_PENINJAU: ItemNav[] = [
  { to: '/rekah-admin',          label: 'Ruang Tinjauan',   Icon: Flower2,       tema: 'antrean', end: true },
  { to: '/rekah-admin/antrean',  label: 'Antrean Tinjauan', Icon: ClipboardList, tema: 'antrean', badge: true },
  { to: '/rekah-admin/riwayat',  label: 'Riwayat Tinjauan', Icon: History,       tema: 'antrean' },
  { to: '/rekah-admin/semua',    label: 'Semua Konten',     Icon: BookOpen,      tema: 'semua' },
  { to: '/rekah-admin/sikap',    label: 'Kebiasaan Baik',   Icon: Layers,        tema: 'sikap',  grup: 'Lihat konten' },
  { to: '/rekah-admin/temani',   label: 'Temani',           Icon: Footprints,    tema: 'temani', grup: 'Lihat konten' },
  { to: '/rekah-admin/bantu',    label: 'Bantu',            Icon: LifeBuoy,      tema: 'bantu',  grup: 'Lihat konten' },
];

/** Halaman khusus admin (menulis konten) — peninjau diarahkan ke Ruang Tinjauan. */
const KHUSUS_ADMIN = /^\/rekah-admin\/(ajak-main|wawasan|tracker|sikap\/(baru|draf|revisi|fase)|temani\/(baru|draf|revisi)|bantu\/(baru|draf|revisi))/;

const NAV: ItemNav[] = [
  { to: '/rekah-admin',           label: 'Beranda',          Icon: LayoutDashboard, tema: 'beranda', end: true },
  { to: '/rekah-admin/ajak-main', label: 'Ajak Main',        Icon: PlayCircle,      tema: 'ajak' },
  { to: '/rekah-admin/wawasan',   label: 'Wawasan Tumbuh',   Icon: Library,         tema: 'wawasan' },
  { to: '/rekah-admin/sikap',     label: 'Kebiasaan Baik',   Icon: Layers,          tema: 'sikap' },
  { to: '/rekah-admin/temani',    label: 'Temani',           Icon: Footprints,      tema: 'temani' },
  { to: '/rekah-admin/bantu',     label: 'Bantu',            Icon: LifeBuoy,        tema: 'bantu' },
  { to: '/rekah-admin/tracker',   label: 'Tracker Konten',   Icon: BarChart2,       tema: 'tracker' },
  { to: '/rekah-admin/antrean',   label: 'Antrean Tinjauan', Icon: ClipboardList,   tema: 'antrean', badge: true },
  { to: '/rekah-admin/semua',     label: 'Semua Draf',       Icon: BookOpen,        tema: 'semua' },
];

export default function RekahAdminShell() {
  const { peranStaf, logout, supabaseUser } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const peninjau = peranStaf === 'peninjau_klinis';
  const temaAktif: KunciTema = peninjau && pathname.replace(/\/$/, '') === '/rekah-admin' ? 'antrean' : temaDariPath(pathname);
  const nav = peninjau ? NAV_PENINJAU : NAV;

  // Jumlah antrean untuk lencana menu (dimuat ulang saat berpindah halaman).
  const [jumlahAntrean, setJumlahAntrean] = useState(0);
  useEffect(() => { muatAntrean().then(a => setJumlahAntrean(a.length)).catch(() => undefined); }, [pathname]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  if (peninjau && KHUSUS_ADMIN.test(pathname)) return <Navigate to="/rekah-admin" replace />;

  return (
    <div className="ra-tema flex min-h-screen bg-kanvas" style={varTema(temaAktif)}>
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-rekah/10 bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-rekah/10 px-5 py-5">
          <LogoRekah size={28} withWordmark />
          <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${peninjau ? 'bg-[#EEE8FB] text-[#5B3FAF]' : 'bg-fajar text-rekah-tua'}`}>{peninjau ? 'Tinjauan' : 'Admin'}</span>
        </div>

        <nav aria-label="Menu Rekah Admin" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {nav.map(({ to, label, Icon, end, tema, badge, grup }, i) => {
            const t = TEMA[tema];
            const judulGrup = grup && nav[i - 1]?.grup !== grup;
            return (
              <React.Fragment key={to}>
              {judulGrup && <p className="mt-3 px-3 pb-1 text-[10.5px] font-bold uppercase tracking-widest text-pekat/35">{grup}</p>}
              <NavLink to={to} end={end}
                className={({ isActive }) => `group flex items-center gap-3 rounded-2xl px-2.5 py-2 text-[13px] font-semibold transition ${isActive ? 'text-pekat' : 'text-pekat/60 hover:text-pekat'}`}
                style={({ isActive }) => (isActive ? { background: t.tint } : undefined)}
              >
                {({ isActive }) => (
                  <>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition"
                      style={{ background: isActive ? t.teks : t.tint, color: isActive ? '#FFFFFF' : t.teks }}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{label}</span>
                    {badge && jumlahAntrean > 0 && (
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: '#5B3FAF' }}>{jumlahAntrean}</span>
                    )}
                  </>
                )}
              </NavLink>
              </React.Fragment>
            );
          })}
        </nav>

        <div className="border-t border-rekah/10 p-3">
          <div className="mb-1 hidden justify-center opacity-90 [@media(min-height:900px)]:flex"><TamanTema tema={temaAktif} kecil /></div>
          {peninjau ? (
            <div className="mb-1 flex items-center gap-2.5 rounded-2xl bg-[#EEE8FB] px-3 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[13px] font-extrabold text-white" style={{ background: 'linear-gradient(150deg,#F890BE,#9C7BF0)' }}>
                {namaPeninjau(supabaseUser?.user_metadata).replace('Bu ', '').charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-bold text-pekat">{namaPeninjau(supabaseUser?.user_metadata).replace('Bu ', 'Psikolog ')}</span>
                <span className="block text-[11px] font-semibold text-[#5B3FAF]">Peninjau klinis</span>
              </span>
            </div>
          ) : (
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-pekat/35">Admin</p>
          )}
          <button type="button" onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-pekat/50 transition hover:bg-fajar hover:text-rekah-tua">
            <LogOut className="h-4 w-4 shrink-0" /> Keluar
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Navigasi ponsel/tablet */}
        <nav aria-label="Menu Rekah Admin" className="sticky top-0 z-20 flex gap-2 overflow-x-auto border-b border-rekah/10 bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
          {nav.map(({ to, label, Icon, end, tema, badge }) => {
            const t = TEMA[tema];
            return (
              <NavLink key={to} to={to} end={end}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                style={({ isActive }) => (isActive ? { background: t.teks, color: '#fff' } : { background: t.tint, color: t.teks })}
              >
                <Icon className="h-3.5 w-3.5" /> {label}{badge && jumlahAntrean > 0 ? ` · ${jumlahAntrean}` : ''}
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
