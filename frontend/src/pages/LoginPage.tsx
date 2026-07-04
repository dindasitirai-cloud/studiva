import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { message?: string } | null)?.message;

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): string | null {
    if (!email.trim()) return 'Email wajib diisi.';
    if (!EMAIL_RE.test(email)) return 'Format email tidak valid.';
    if (!password) return 'Password wajib diisi.';
    return null;
  }

  async function handleSubmit() {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setSubmitting(true);
    let user;
    try {
      // TODO: panggil endpoint POST /api/auth/login dengan { email, password }
      // Jangan simpan password di sisi klien; autentikasi sepenuhnya di backend.
      user = await login(email, password);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Email atau password salah. Silakan coba lagi.');
      setSubmitting(false);
      return;
    }

    // TODO: penentuan redirect berdasarkan role & tier dari data auth backend.
    // Backend mengembalikan { user: { role, ... }, token } setelah login sukses.
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }
    if (user.role === 'teacher') {
      navigate('/guru');
      setSubmitting(false);
      return;
    }

    // Parent: cek subscription tier untuk memilih dashboard yang tepat
    try {
      const { api } = await import('../api/client');
      const { data } = await api.get('/subscriptions/check');
      if (data.hasSubscription) {
        const dest = data.tier === 'tier1' ? '/dashboard/tier1'
                   : data.tier === 'tier2' ? '/dashboard/tier2'
                   : '/dashboard/parent';
        navigate(dest);
      } else {
        navigate('/pricing', { state: { message: 'Pilih paket Studiva Digital untuk mulai mengakses dashboard.' } });
      }
    } catch {
      navigate('/dashboard/parent');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-82px)] font-nunito-sans">

      {/* ── Panel kiri, branding ─────────────────────────────────────── */}
      <div className="relative hidden w-[44%] shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-stv-navy via-[#1a3f6f] to-[#0d2a4d] p-12 lg:flex">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-stv-yellow/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-8 h-40 w-40 rounded-full bg-stv-sky/15 blur-2xl" />
        <Sparkles className="absolute right-10 top-10 h-6 w-6 text-stv-yellow/30" fill="currentColor" strokeWidth={0} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <img src="/images/logo-studiva.png" alt="Studiva" className="h-12 w-12 object-contain" />
          <span className="font-baloo text-[22px] font-extrabold text-white">Studiva</span>
        </div>

        {/* Tagline */}
        <div className="relative">
          <h2 className="mb-4 font-baloo text-[32px] font-extrabold leading-[1.15] text-white">
            Selamat datang kembali di Studiva
          </h2>
          <p className="mb-10 text-[16px] leading-[1.7] text-white/70">
            Masuk untuk melanjutkan perjalanan belajar bersama anak Anda, memantau perkembangannya,
            dan terhubung dengan komunitas orang tua yang saling mendukung.
          </p>
          <div className="space-y-3">
            {[
              'Pantau perkembangan harian anak',
              'Akses panduan tumbuh kembang & webinar psikolog',
              'Terhubung dengan guru dan tim Studiva',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-[14px] text-white/80">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stv-yellow/20 text-stv-yellow text-[11px] font-bold">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[13px] text-white/40">
          © {new Date().getFullYear()} Studiva · Jl. Mandiangin No. 65, Bukittinggi
        </p>
      </div>

      {/* ── Panel kanan, form ────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/images/logo-studiva.png" alt="Studiva" className="h-10 w-10 object-contain" />
            <span className="font-baloo text-[20px] font-extrabold text-stv-navy">Studiva</span>
          </div>

          <h1 className="mb-1 font-baloo text-[28px] font-extrabold text-stv-navy sm:text-[32px]">Masuk</h1>
          <p className="mb-7 text-[15px] text-stv-body">Masuk ke akun Studiva Anda</p>

          {successMessage && (
            <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-[14px] text-emerald-700">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-[14px] text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="nama@email.com"
                autoComplete="email"
                className="w-full rounded-xl border border-stv-border px-4 py-3 text-[15px] text-stv-navy placeholder:text-stv-muted-2 transition focus:border-stv-sky-stroke focus:outline-none focus:ring-2 focus:ring-stv-sky-stroke/20"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[13px] font-semibold text-stv-navy">Password</label>
                {/* TODO: implementasi fitur "Lupa Password" dengan endpoint reset password backend */}
                <button
                  type="button"
                  onClick={() => setError('Fitur lupa password akan segera tersedia. Hubungi kami via WhatsApp.')}
                  className="text-[13px] font-semibold text-stv-sky-stroke transition hover:underline"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Password Anda"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-stv-border px-4 py-3 pr-11 text-[15px] text-stv-navy placeholder:text-stv-muted-2 transition focus:border-stv-sky-stroke focus:outline-none focus:ring-2 focus:ring-stv-sky-stroke/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stv-muted transition hover:text-stv-navy"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Ingat saya */}
            <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-stv-body">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded accent-stv-sky-stroke"
              />
              Ingat saya
            </label>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex min-h-[50px] items-center justify-center rounded-full bg-stv-navy font-baloo text-[16px] font-bold text-white shadow-[0_6px_20px_rgba(16,58,107,.25)] transition hover:-translate-y-0.5 hover:bg-stv-navy-dark disabled:opacity-60"
            >
              {submitting ? 'Memproses...' : 'Masuk'}
            </button>
          </div>

          {/* Daftar Tier 2 */}
          <p className="mt-6 text-center text-[14px] text-stv-body">
            Belum punya akun Studiva Digital?{' '}
            <Link to="/daftar" className="font-bold text-stv-sky-stroke no-underline transition hover:underline">
              Daftar sekarang
            </Link>
          </p>

          {/* Info Tier 1 & Guru */}
          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-[13px] leading-[1.6] text-stv-muted">
              <span className="font-semibold text-stv-body">Akun Sekolah Studiva & Guru</span> dibuat
              oleh tim kami secara langsung, tidak tersedia pendaftaran mandiri.{' '}
              <Link to="/kontak" className="font-semibold text-stv-sky-stroke no-underline hover:underline">
                Hubungi kami
              </Link>{' '}
              untuk informasi lebih lanjut.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
