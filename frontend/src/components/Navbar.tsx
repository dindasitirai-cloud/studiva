import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Community is intentionally left out of the desktop nav per spec (it lives in
// the footer instead) but still offered in the mobile dropdown, where there's
// more room and less competition for attention.
const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/sekolah-studiva', label: 'Sekolah Studiva' },
  { to: '/studiva-digital', label: 'Studiva Digital' },
  { to: '/about', label: 'About' },
  { to: '/about#contact', label: 'Contact' },
];

const mobileOnlyLinks = [{ to: '/community', label: 'Community' }];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, tier, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  const dashboardPath =
    user?.role === 'teacher'
      ? '/dashboard/teacher'
      : user?.role === 'parent'
      ? tier === 'tier2'
        ? '/dashboard/tier2'
        : '/dashboard/parent'
      : '/login';

  // Tier 1 (school) vs Tier 2 (digital) get a different dashboard icon; the menu
  // items themselves (Resources/Consultation/Subscription) are shared since both
  // tiers can use them - the real differentiation lives in dashboard content.
  const dashboardIcon = tier === 'tier1' ? '🏫 ' : tier === 'tier2' ? '💻 ' : '';

  return (
    <header className="sticky top-0 z-50 border-b border-stv-border bg-white/[.92] backdrop-blur-[14px]">
      <nav className="mx-auto flex min-h-[82px] max-w-[1240px] items-center justify-between gap-6 px-4 py-[14px] font-nunito-sans md:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img src="/images/logo-studiva.png" alt="Studiva" className="h-[52px] w-[52px] object-contain" />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            // Each tier keeps its own brand color for the active-link indicator
            // (sky for Sekolah Studiva, amber for Studiva Digital) rather than
            // one fixed color that would clash on the other tier's page.
            const activeColorClass = link.to === '/studiva-digital' ? 'border-amber-500 text-amber-600' : 'border-stv-sky-stroke text-stv-sky-stroke';
            return (
              <Link
                key={link.to}
                to={link.to}
                className={
                  isActive
                    ? `rounded-[8px] border-[1.5px] px-[14px] py-[6px] text-[16px] font-bold no-underline ${activeColorClass}`
                    : 'text-[16px] font-semibold text-stv-navy no-underline transition hover:text-stv-sky-stroke'
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-[18px] lg:flex">
          {user?.role === 'admin' ? (
            <>
              <Link to="/admin/consultations" className="font-semibold text-stv-navy transition hover:text-stv-yellow-deep">
                Consultations
              </Link>
              <Link
                to="/admin/enrollment-requests"
                className="font-semibold text-stv-navy transition hover:text-stv-yellow-deep"
              >
                Enrollment Requests
              </Link>
              <Link to="/admin/community" className="font-semibold text-stv-navy transition hover:text-stv-yellow-deep">
                Moderate Community
              </Link>
              <Link
                to="/admin/fitri-dashboard"
                className="font-semibold text-stv-navy transition hover:text-stv-yellow-deep"
              >
                Psikolog Fitri Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border-2 border-stv-navy px-5 py-2 font-bold text-stv-navy transition hover:bg-stv-navy hover:text-white"
              >
                Logout
              </button>
            </>
          ) : user ? (
            <>
              <Link
                to={dashboardPath}
                className="rounded-full bg-stv-yellow px-6 py-3 font-baloo font-bold text-stv-navy shadow-[0_6px_16px_rgba(251,208,10,.4)] transition hover:-translate-y-px hover:bg-stv-yellow-hover"
              >
                {dashboardIcon}Dashboard
              </Link>
              <Link
                to="/community/ask-fitri"
                className="font-semibold text-stv-navy transition hover:text-stv-yellow-deep"
              >
                Ask Psikolog Fitri
              </Link>
              <Link to="/consultation" className="font-semibold text-stv-navy transition hover:text-stv-yellow-deep">
                Book Consultation
              </Link>
              <Link
                to="/subscription-settings"
                className="font-semibold text-stv-navy transition hover:text-stv-yellow-deep"
              >
                Subscription
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border-2 border-stv-navy px-5 py-2 font-bold text-stv-navy transition hover:bg-stv-navy hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[16px] font-bold text-stv-navy no-underline transition hover:text-stv-yellow-deep">
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-stv-yellow px-6 py-3 font-baloo text-[16px] font-bold text-stv-navy no-underline shadow-[0_6px_16px_rgba(251,208,10,.4)] transition hover:-translate-y-px hover:bg-stv-yellow-hover"
              >
                Daftar Sekarang
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          className="flex min-h-[44px] items-center gap-2 rounded-[20px] bg-stv-navy px-5 py-3 text-white lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <div className="absolute left-0 right-0 flex flex-col gap-2 border-t border-stv-border bg-white px-4 pb-4 pt-2 font-nunito-sans shadow-lg lg:hidden">
          {[...navLinks, ...mobileOnlyLinks].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="flex min-h-[48px] items-center font-semibold text-stv-navy hover:text-stv-yellow-deep"
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'admin' ? (
            <>
              <Link
                to="/admin/consultations"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center font-semibold text-stv-navy hover:text-stv-yellow-deep"
              >
                Consultations
              </Link>
              <Link
                to="/admin/enrollment-requests"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center font-semibold text-stv-navy hover:text-stv-yellow-deep"
              >
                Enrollment Requests
              </Link>
              <Link
                to="/admin/community"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center font-semibold text-stv-navy hover:text-stv-yellow-deep"
              >
                Moderate Community
              </Link>
              <Link
                to="/admin/fitri-dashboard"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center font-semibold text-stv-navy hover:text-stv-yellow-deep"
              >
                Psikolog Fitri Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full rounded-full border-2 border-stv-navy px-5 py-2 font-bold text-stv-navy"
              >
                Logout
              </button>
            </>
          ) : user ? (
            <>
              <Link
                to={dashboardPath}
                onClick={() => setOpen(false)}
                className="w-full rounded-full bg-stv-yellow px-6 py-3 text-center font-baloo font-bold text-stv-navy"
              >
                {dashboardIcon}Dashboard
              </Link>
              <Link
                to="/community/ask-fitri"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center font-semibold text-stv-navy hover:text-stv-yellow-deep"
              >
                Ask Psikolog Fitri
              </Link>
              <Link
                to="/consultation"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center font-semibold text-stv-navy hover:text-stv-yellow-deep"
              >
                Book Consultation
              </Link>
              <Link
                to="/subscription-settings"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center font-semibold text-stv-navy hover:text-stv-yellow-deep"
              >
                Subscription
              </Link>
              <button
                onClick={handleLogout}
                className="w-full rounded-full border-2 border-stv-navy px-5 py-2 font-bold text-stv-navy"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="w-full rounded-full border-2 border-stv-navy px-5 py-2 text-center font-bold text-stv-navy"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="w-full rounded-full bg-stv-yellow px-6 py-3 text-center font-baloo font-bold text-stv-navy"
              >
                Daftar Sekarang
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
