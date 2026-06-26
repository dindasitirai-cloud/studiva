import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Community is intentionally left out of the desktop nav per spec (it lives in
// the footer instead) but still offered in the mobile dropdown, where there's
// more room and less competition for attention.
const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/#tier1', label: 'Sekolah Studiva' },
  { to: '/#tier2', label: 'Studiva Digital' },
  { to: '/about', label: 'About' },
  { to: '/about#contact', label: 'Contact' },
];

const mobileOnlyLinks = [{ to: '/community', label: 'Community' }];

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
    user?.role === 'teacher' ? '/dashboard/teacher' : user?.role === 'parent' ? '/dashboard/parent' : '/login';

  // Tier 1 (school) vs Tier 2 (digital) get a different dashboard icon; the menu
  // items themselves (Resources/Consultation/Subscription) are shared since both
  // tiers can use them - the real differentiation lives in dashboard content.
  const dashboardIcon = tier === 'tier1' ? '🏫 ' : tier === 'tier2' ? '💻 ' : '';

  return (
    <header className="sticky top-0 z-50 h-[70px] border-b border-bordergray bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 md:px-10">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo-studiva.png" alt="Studiva" className="h-[50px] w-auto" />
        </Link>

        <div className="hidden items-center gap-[30px] lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[16px] font-semibold text-navy decoration-gold decoration-2 underline-offset-4 transition hover:text-gold hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user?.role === 'admin' ? (
            <>
              <Link to="/admin/consultations" className="font-semibold text-navy transition hover:text-gold">
                Consultations
              </Link>
              <Link to="/admin/enrollment-requests" className="font-semibold text-navy transition hover:text-gold">
                Enrollment Requests
              </Link>
              <Link to="/admin/community" className="font-semibold text-navy transition hover:text-gold">
                Moderate Community
              </Link>
              <Link to="/admin/fitri-dashboard" className="font-semibold text-navy transition hover:text-gold">
                Psikolog Fitri Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-outline">
                Logout
              </button>
            </>
          ) : user ? (
            <>
              <Link to={dashboardPath} className="btn-primary">
                {dashboardIcon}Dashboard
              </Link>
              <Link to="/community/ask-fitri" className="font-semibold text-navy transition hover:text-gold">
                Ask Psikolog Fitri
              </Link>
              <Link to="/consultation" className="font-semibold text-navy transition hover:text-gold">
                Book Consultation
              </Link>
              <Link to="/subscription-settings" className="font-semibold text-navy transition hover:text-gold">
                Subscription
              </Link>
              <button onClick={handleLogout} className="btn-outline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-semibold text-navy transition hover:text-gold">
                Login
              </Link>
              <Link to="/signup" className="btn-primary">
                Daftar Sekarang
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          className="flex min-h-[44px] items-center gap-2 rounded-[20px] bg-[#6B5B5A] px-5 py-3 text-white lg:hidden"
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
        <div className="absolute left-0 right-0 flex flex-col gap-2 border-t border-bordergray bg-white px-4 pb-4 pt-2 shadow-lg lg:hidden">
          {[...navLinks, ...mobileOnlyLinks].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="min-h-[48px] flex items-center font-semibold text-navy hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'admin' ? (
            <>
              <Link
                to="/admin/consultations"
                onClick={() => setOpen(false)}
                className="min-h-[48px] flex items-center font-semibold text-navy hover:text-gold"
              >
                Consultations
              </Link>
              <Link
                to="/admin/enrollment-requests"
                onClick={() => setOpen(false)}
                className="min-h-[48px] flex items-center font-semibold text-navy hover:text-gold"
              >
                Enrollment Requests
              </Link>
              <Link
                to="/admin/community"
                onClick={() => setOpen(false)}
                className="min-h-[48px] flex items-center font-semibold text-navy hover:text-gold"
              >
                Moderate Community
              </Link>
              <Link
                to="/admin/fitri-dashboard"
                onClick={() => setOpen(false)}
                className="min-h-[48px] flex items-center font-semibold text-navy hover:text-gold"
              >
                Psikolog Fitri Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-outline w-full">
                Logout
              </button>
            </>
          ) : user ? (
            <>
              <Link to={dashboardPath} onClick={() => setOpen(false)} className="btn-primary w-full">
                {dashboardIcon}Dashboard
              </Link>
              <Link
                to="/community/ask-fitri"
                onClick={() => setOpen(false)}
                className="min-h-[48px] flex items-center font-semibold text-navy hover:text-gold"
              >
                Ask Psikolog Fitri
              </Link>
              <Link
                to="/consultation"
                onClick={() => setOpen(false)}
                className="min-h-[48px] flex items-center font-semibold text-navy hover:text-gold"
              >
                Book Consultation
              </Link>
              <Link
                to="/subscription-settings"
                onClick={() => setOpen(false)}
                className="min-h-[48px] flex items-center font-semibold text-navy hover:text-gold"
              >
                Subscription
              </Link>
              <button onClick={handleLogout} className="btn-outline w-full">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="btn-outline w-full">
                Login
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary w-full">
                Daftar Sekarang
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
