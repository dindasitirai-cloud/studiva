import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, LogOut } from 'lucide-react';
import LogoRekah from './LogoRekah';
import { useAuth } from '../context/AuthContext';

// TODO: review Fitri
const TEKS = {
  PROFIL: 'Profil Anak',
  KELUAR: 'Keluar',
  KONFIRMASI: 'Keluar dari akun?',
  BATAL: 'Batal',
  BUKA_MENU: 'Buka menu akun',
};

export default function HeaderMobileRekah() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const tombolRef = useRef<HTMLButtonElement>(null);

  const inisial = user?.name?.charAt(0)?.toUpperCase() ?? 'A';

  useEffect(() => {
    if (!menuTerbuka) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuTerbuka(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuTerbuka]);

  function handleKeluar() {
    setKonfirmasi(false);
    logout();
    navigate('/');
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between border-b border-mawar/20 bg-white/95 px-5 backdrop-blur-sm lg:hidden">
        <LogoRekah size={24} withWordmark />

        {/* Avatar — membuka dropdown */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            ref={tombolRef}
            type="button"
            onClick={() => setMenuTerbuka(o => !o)}
            aria-expanded={menuTerbuka}
            aria-haspopup="menu"
            aria-label={TEKS.BUKA_MENU}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#E0526B',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {inisial}
          </button>

          {menuTerbuka && (
            <>
              {/* Penutup transparan di belakang menu */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                onClick={() => setMenuTerbuka(false)}
              />
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  zIndex: 50,
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 12px 32px rgba(224,82,107,.16)',
                  padding: 6,
                  minWidth: 180,
                  border: '1px solid rgba(224,82,107,.10)',
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setMenuTerbuka(false); navigate('/dashboard/tier2/profil-anak'); }}
                  style={styleMenuItem}
                >
                  <Baby aria-hidden="true" style={{ width: 16, height: 16 }} strokeWidth={2} />
                  {TEKS.PROFIL}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setMenuTerbuka(false); setKonfirmasi(true); }}
                  style={styleMenuItem}
                >
                  <LogOut aria-hidden="true" style={{ width: 16, height: 16 }} strokeWidth={2} />
                  {TEKS.KELUAR}
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Dialog konfirmasi keluar */}
      {konfirmasi && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(58,37,48,.35)',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setKonfirmasi(false)}
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
            <p style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontSize: 20, fontWeight: 600, color: '#3A2530', margin: '0 0 20px' }}>
              {TEKS.KONFIRMASI}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setKonfirmasi(false)} style={styleBatal}>
                {TEKS.BATAL}
              </button>
              <button type="button" onClick={handleKeluar} style={styleKeluar}>
                {TEKS.KELUAR}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styleMenuItem: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 14px',
  borderRadius: 12,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'Nunito, system-ui, sans-serif',
  fontSize: 14,
  fontWeight: 600,
  color: '#3A2530',
  textAlign: 'left',
};

const styleBatal: React.CSSProperties = {
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
};

const styleKeluar: React.CSSProperties = {
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
};
