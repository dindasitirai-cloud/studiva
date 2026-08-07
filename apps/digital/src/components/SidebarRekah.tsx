import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import LogoRekah from './LogoRekah';
import { useAuth } from '../context/AuthContext';
import { MENU_UTAMA, PROFIL_ANAK } from '../config/fiturRekah';

// TODO: review Fitri — semua label di bawah ini
const TEKS = {
  LEBARKAN: 'Lebarkan menu',
  SEMPITKAN: 'Sempitkan menu',
  NAV_LABEL: 'Navigasi utama',
  KONFIRMASI: 'Keluar dari akun?',
  BATAL: 'Batal',
  KELUAR: 'Keluar',
};

const MENU_BAWAH = [PROFIL_ANAK];

// Warna brand (tidak dihardcode di luar sini — diambil dari desain token Rekah)
const CLR = {
  REKAH:  '#E0526B',
  CREAM:  '#FFF3F6',
  TINTA:  '#3A2530',
  REDUP:  '#8A7A80',
  HOVER:  '#FDF8F5',
  GARIS:  'rgba(224,82,107,.10)',
  FOKUS:  '#E0526B',
};

interface PropsSidebarRekah {
  melipat: boolean;
  onToggle: () => void;
}

export default function SidebarRekah({ melipat, onToggle }: PropsSidebarRekah) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [konfirmasi, setKonfirmasi] = useState(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const transisi     = prefersReducedMotion ? undefined : 'width 240ms ease, min-width 240ms ease';
  const transisiItem = prefersReducedMotion ? undefined : 'background 160ms ease, color 160ms ease';
  const transisiLabel = prefersReducedMotion ? undefined : 'opacity 120ms ease';

  function handleKeluar() {
    setKonfirmasi(false);
    logout();
    navigate('/');
  }

  const styleItem = (isActive: boolean): React.CSSProperties => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: melipat ? '10px 0' : '10px 12px',
    justifyContent: melipat ? 'center' : 'flex-start',
    borderRadius: 14,
    background: isActive ? CLR.CREAM : 'transparent',
    color: isActive ? CLR.TINTA : CLR.REDUP,
    fontFamily: 'Nunito, system-ui, sans-serif',
    fontSize: 14,
    fontWeight: isActive ? 700 : 600,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: transisiItem,
    minHeight: 44,
    outline: 'none',
  });

  return (
    <aside
      style={{
        width: melipat ? 72 : 240,
        minWidth: melipat ? 72 : 240,
        transition: transisi,
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRight: `1px solid ${CLR.GARIS}`,
        flexShrink: 0,
        zIndex: 30,
      }}
    >
      {/* Kepala: logo + tombol lipat */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: melipat ? 'center' : 'space-between',
          padding: '0 14px',
          height: 64,
          borderBottom: `1px solid ${CLR.GARIS}`,
          flexShrink: 0,
        }}
      >
        {!melipat && (
          <div
            style={{
              overflow: 'hidden',
              opacity: melipat ? 0 : 1,
              transition: transisiLabel,
              whiteSpace: 'nowrap',
            }}
          >
            <LogoRekah size={26} withWordmark />
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!melipat}
          aria-label={melipat ? TEKS.LEBARKAN : TEKS.SEMPITKAN}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: CLR.REDUP,
            flexShrink: 0,
          }}
        >
          {melipat
            ? <ChevronRight aria-hidden="true" style={{ width: 18, height: 18 }} />
            : <ChevronLeft  aria-hidden="true" style={{ width: 18, height: 18 }} />
          }
        </button>
      </div>

      {/* Navigasi */}
      <nav
        aria-label={TEKS.NAV_LABEL}
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 0' }}
      >
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '0 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {MENU_UTAMA.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <ItemNav
                to={to}
                label={label}
                icon={Icon}
                end={end}
                melipat={melipat}
                styleItem={styleItem}
                transisiLabel={transisiLabel}
              />
            </li>
          ))}
        </ul>

        <hr
          aria-hidden="true"
          style={{ margin: '10px 16px', border: 'none', borderTop: `1px solid ${CLR.GARIS}` }}
        />

        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '0 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {MENU_BAWAH.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <ItemNav
                to={to}
                label={label}
                icon={Icon}
                end={end}
                melipat={melipat}
                styleItem={styleItem}
                transisiLabel={transisiLabel}
              />
            </li>
          ))}

          {/* Keluar */}
          <li>
            <button
              type="button"
              onClick={() => setKonfirmasi(true)}
              aria-label={melipat ? TEKS.KELUAR : undefined}
              title={melipat ? TEKS.KELUAR : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: melipat ? '10px 0' : '10px 12px',
                justifyContent: melipat ? 'center' : 'flex-start',
                borderRadius: 14,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: CLR.REDUP,
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                transition: transisiItem,
                minHeight: 44,
              }}
            >
              <LogOut
                aria-hidden="true"
                style={{ width: 20, height: 20, flexShrink: 0 }}
                strokeWidth={2}
              />
              {!melipat && (
                <span style={{ opacity: melipat ? 0 : 1, transition: transisiLabel }}>
                  {TEKS.KELUAR}
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>

      {/* Dialog konfirmasi */}
      {konfirmasi && (
        <KonfirmasiKeluar
          onBatal={() => setKonfirmasi(false)}
          onKeluar={handleKeluar}
        />
      )}
    </aside>
  );
}

// ─── ItemNav ─────────────────────────────────────────────────────────────────

interface PropsItemNav {
  to: string;
  label: string;
  icon: React.ElementType;
  end: boolean;
  melipat: boolean;
  styleItem: (isActive: boolean) => React.CSSProperties;
  transisiLabel?: string;
}

function ItemNav({ to, label, icon: Icon, end, melipat, styleItem, transisiLabel }: PropsItemNav) {
  const { pathname } = useLocation();
  const isActive = end ? pathname === to : pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      end={end}
      aria-label={melipat ? label : undefined}
      aria-current={isActive ? 'page' : undefined}
      title={melipat ? label : undefined}
      style={styleItem(isActive)}
      className="focus-visible:ring-2 focus-visible:ring-[#E0526B] focus-visible:ring-offset-1 rounded-[14px]"
    >
      {/* Indikator kelopak kiri */}
      {isActive && !melipat && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 4,
            height: 26,
            borderRadius: '70% 70% 70% 4px',
            background: '#E0526B',
            flexShrink: 0,
          }}
        />
      )}

      <Icon
        aria-hidden="true"
        style={{
          width: 20,
          height: 20,
          color: isActive ? '#E0526B' : '#8A7A80',
          flexShrink: 0,
        }}
        strokeWidth={isActive ? 2.5 : 2}
      />

      {!melipat && (
        <span style={{ opacity: melipat ? 0 : 1, transition: transisiLabel }}>
          {label}
        </span>
      )}
    </NavLink>
  );
}

// ─── KonfirmasiKeluar ─────────────────────────────────────────────────────────

function KonfirmasiKeluar({ onBatal, onKeluar }: { onBatal: () => void; onKeluar: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(58,37,48,.35)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onBatal}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={TEKS.KONFIRMASI}
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '28px 28px 24px',
          width: 280,
          boxShadow: '0 24px 48px -12px rgba(58,37,48,.22)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <p
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 20,
            fontWeight: 600,
            color: '#3A2530',
            margin: '0 0 20px',
          }}
        >
          {TEKS.KONFIRMASI}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onBatal}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 12,
              border: '1.5px solid rgba(224,82,107,.3)',
              background: 'none',
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              color: '#8A7A80',
              cursor: 'pointer',
            }}
          >
            {TEKS.BATAL}
          </button>
          <button
            type="button"
            onClick={onKeluar}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 12,
              border: 'none',
              background: '#8A7A80',
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {TEKS.KELUAR}
          </button>
        </div>
      </div>
    </div>
  );
}
