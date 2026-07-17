import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoRekah from './LogoRekah';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, tier, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'parent'
      ? '/dashboard/tier2'
      : '/login';

  return (
    <header className="sticky top-0 z-50 border-b border-fajar bg-white/[.95] backdrop-blur-[14px]">
      <nav className="mx-auto flex min-h-[72px] max-w-[1200px] items-center justify-between gap-6 px-4 py-3 md:px-8">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Rekah — beranda">
          <LogoRekah size={36} withWordmark />
        </Link>

        {/* Desktop actions */}
        <div className="hidden items-center gap-4 lg:flex">
          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="rounded-full bg-rekah px-6 py-2.5 font-bricolage text-[15px] font-bold text-white shadow-[0_2px_12px_rgba(224,82,107,0.3)] transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
              >
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin/consultations"
                  className="text-[15px] font-semibold text-pekat/70 transition hover:text-rekah"
                >
                  Konsultasi
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="rounded-full border-2 border-mawar px-5 py-2 text-[15px] font-semibold text-pekat/70 transition hover:border-rekah hover:text-rekah"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[15px] font-semibold text-pekat/70 transition hover:text-rekah"
              >
                Masuk
              </Link>
              <Link
                to="/daftar"
                className="rounded-full bg-rekah px-6 py-2.5 font-bricolage text-[15px] font-bold text-white shadow-[0_2px_12px_rgba(224,82,107,0.3)] transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
              >
                Mulai Merekah
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          aria-label="Toggle menu"
          className="flex min-h-[44px] items-center gap-2 rounded-full bg-rekah px-5 py-2.5 text-white lg:hidden"
          onClick={() => setOpen(prev => !prev)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
          <span className="text-sm font-semibold">Menu</span>
        </button>
      </nav>

      {open && (
        <div className="absolute left-0 right-0 flex flex-col gap-2 border-t border-fajar bg-white px-4 pb-4 pt-2 shadow-lg lg:hidden">
          {user ? (
            <>
              <Link
                to={dashboardPath}
                onClick={() => setOpen(false)}
                className="w-full rounded-full bg-rekah px-6 py-3 text-center font-bricolage font-bold text-white"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full rounded-full border-2 border-mawar px-5 py-2 font-semibold text-pekat/70"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center font-semibold text-pekat/70 hover:text-rekah"
              >
                Masuk
              </Link>
              <Link
                to="/daftar"
                onClick={() => setOpen(false)}
                className="w-full rounded-full bg-rekah px-6 py-3 text-center font-bricolage font-bold text-white"
              >
                Mulai Merekah
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
