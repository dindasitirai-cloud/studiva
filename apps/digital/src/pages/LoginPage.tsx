import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLangganan, statusGerbang, TEKS_GERBANG } from '../lib/supabase/langganan';
import { supabase } from '../lib/supabase/client';
import LogoRekah from '../components/LogoRekah';
import Kelopak from '../components/Kelopak';

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
    try {
      await login(email, password);
    } catch (e: unknown) {
      const msg =
        (e instanceof Error ? e.message : null) ||
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Login gagal. Coba lagi.';
      setError(msg);
      setSubmitting(false);
      return;
    }

    // ── Sesi Supabase lebih dulu — staf Rekah masuk sebelum cek Express ──────
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const peranStaf = session.user.app_metadata?.role as string | undefined;

      // Staf Rekah (admin atau peninjau klinis) → rekah-admin, tidak melewati cek Express
      if (peranStaf === 'admin' || peranStaf === 'peninjau_klinis') {
        navigate('/rekah-admin');
        setSubmitting(false);
        return;
      }
    }

    // ── Cek Express (untuk admin Studiva dan guru) ────────────────────────────
    // Tidak blokir login bila backend mati
    let expressUser;
    try {
      const { api } = await import('../api/client');
      const { data } = await api.get('/auth/me');
      expressUser = data.user as { role: string } | null;
    } catch {
      expressUser = { role: 'parent' };
    }

    if (expressUser?.role === 'admin') {
      navigate('/admin');
      setSubmitting(false);
      return;
    }
    if (expressUser?.role === 'teacher') {
      navigate('/guru');
      setSubmitting(false);
      return;
    }

    // ── Rekah parent: cek langganan Supabase ─────────────────────────────────
    // KEPUTUSAN MANUSIA: gerbang dulu — belum berlangganan → pricing sebelum wizard profil.
    if (session?.user) {
      try {
        const langganan = await getLangganan();
        const gate = statusGerbang(langganan, new Date().toISOString());

        if (gate === 'aktif') {
          navigate('/dashboard/tier2');
        } else {
          navigate('/pricing', { state: { message: TEKS_GERBANG[gate] } });
        }
      } catch {
        navigate('/dashboard/tier2');
      }
      setSubmitting(false);
      return;
    }

    // ── Jalur Express lama (Tier 1 / admin dengan Express JWT) ───────────────
    // TODO: integrasi Stripe — ketika Tier 1 penuh migrasi ke Supabase, jalur ini disederhanakan
    try {
      const { api } = await import('../api/client');
      const { data } = await api.get('/subscriptions/check');
      if (data.hasSubscription) {
        const dest = data.tier === 'tier1' ? '/dashboard/tier1'
                   : data.tier === 'tier2' ? '/dashboard/tier2'
                   : '/dashboard/parent';
        navigate(dest);
      } else {
        navigate('/pricing', { state: { message: 'Pilih paket Rekah untuk mulai mengakses dashboard.' } });
      }
    } catch {
      navigate('/dashboard/parent');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-82px)]">

      {/* ── Panel kiri, branding ─────────────────────────────────────── */}
      <div className="relative hidden w-[44%] shrink-0 flex-col justify-between overflow-hidden bg-pekat p-12 lg:flex">
        <Kelopak
          aria-hidden
          rotate={90}
          className="absolute -right-16 -top-16 h-56 w-56 bg-rekah/20 pointer-events-none"
        />
        <Kelopak
          aria-hidden
          rotate={270}
          className="absolute -bottom-20 -left-12 h-64 w-64 bg-rekah/10 pointer-events-none"
        />

        <div className="relative">
          <LogoRekah size={40} withWordmark light />
        </div>

        <div className="relative">
          <h2 className="mb-4 font-bricolage text-[32px] font-extrabold leading-[1.1] text-white">
            Selamat datang<br/>kembali, Ayah-Bunda.
          </h2>
          <p className="mb-10 text-[15px] leading-[1.7] text-white/60">
            Masuk dan lanjutkan pendampingan si kecil — satu langkah kecil hari ini bermakna besar.
          </p>
          <div className="space-y-3">
            {[
              'Rencana pekan ini sudah menunggu kamu',
              'Dikurasi Psikolog Fitri Effendy',
              'Setiap anak mekar pada waktunya',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-[14px] text-white/75">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rekah/25 text-mawar text-[11px] font-bold">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[13px] text-white/30">
          © {new Date().getFullYear()} Rekah · oleh Psikolog Fitri Effendy
        </p>
      </div>

      {/* ── Panel kanan, form ────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center bg-kanvas px-4 py-12 sm:px-8">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoRekah size={36} withWordmark />
          </div>

          <h1 className="mb-1 font-bricolage text-[28px] font-extrabold text-pekat sm:text-[32px]">Masuk</h1>
          <p className="mb-7 text-[15px] text-pekat/60">Masuk ke akun Rekah kamu</p>

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
              <label className="mb-1.5 block text-[13px] font-semibold text-pekat">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="nama@email.com"
                autoComplete="email"
                className="w-full rounded-[14px] border border-daun/30 bg-white px-4 py-3 text-[15px] text-pekat placeholder:text-pekat/35 transition focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20 min-h-[52px]"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[13px] font-semibold text-pekat">Password</label>
                {/* TODO: implementasi fitur "Lupa Password" dengan endpoint reset password backend */}
                <button
                  type="button"
                  onClick={() => setError('Fitur lupa password akan segera tersedia. Hubungi kami via WhatsApp.')}
                  className="text-[13px] font-semibold text-rekah transition hover:underline"
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
                  placeholder="Password kamu"
                  autoComplete="current-password"
                  className="w-full rounded-[14px] border border-daun/30 bg-white px-4 py-3 pr-11 text-[15px] text-pekat placeholder:text-pekat/35 transition focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20 min-h-[52px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pekat/40 transition hover:text-pekat"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Ingat saya */}
            <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-pekat/70">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded accent-rekah"
              />
              Ingat saya
            </label>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex min-h-[52px] items-center justify-center rounded-full bg-rekah font-bricolage text-[16px] font-bold text-white shadow-[0_4px_16px_rgba(224,82,107,0.28)] transition hover:bg-rekah-tua disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
            >
              {submitting ? 'Memproses...' : 'Masuk'}
            </button>
          </div>

          <p className="mt-6 text-center text-[14px] text-pekat/65">
            Belum punya akun Rekah?{' '}
            <Link to="/daftar" className="font-bold text-rekah no-underline transition hover:underline">
              Daftar sekarang
            </Link>
          </p>

          <div className="mt-5 rounded-[16px] bg-fajar px-4 py-4">
            <p className="text-[13px] leading-[1.6] text-pekat/60">
              <span className="font-semibold text-pekat/80">Akun Sekolah Studiva & Guru</span> dibuat
              oleh tim kami secara langsung.{' '}
              <Link to="/kontak" className="font-semibold text-rekah no-underline hover:underline">
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
