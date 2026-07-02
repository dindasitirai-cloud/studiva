import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, MessageCircle, Sparkles, MapPin, Mail as MailIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PricingCard from '../components/PricingCard';
import PlanConfirmModal from '../components/PlanConfirmModal';
import { Plan, Tier } from '../types';

// ── Constants ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WA_NUMBER = '6281211470407';
const WA_MSG = encodeURIComponent('Halo Studiva, saya ingin mendaftarkan anak saya ke Sekolah Studiva.');

const tier2Features = [
  'Ribuan panduan parenting berbasis riset',
  'Kursus self-paced & webinar psikolog',
  'Komunitas forum orang tua',
  'Konsultasi 1-on-1 dengan psikolog',
  'Resource library lengkap',
  'Dashboard kemajuan perjalanan anak',
];

// ── Types ────────────────────────────────────────────────────────────────────

type Step = 'form' | 'plan';

interface FormState {
  namaLengkap: string;
  email: string;
  password: string;
  konfirmasiPassword: string;
  noHp: string;
  namaAnak: string;
  usiaAnak: string;
  setuju: boolean;
}

interface FormErrors {
  namaLengkap?: string;
  email?: string;
  password?: string;
  konfirmasiPassword?: string;
  namaAnak?: string;
  usiaAnak?: string;
  setuju?: string;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function PasswordStrengthBar({ password }: { password: string }) {
  const strength =
    password.length === 0 ? 0
    : password.length < 8 ? 1
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3
    : 2;
  const labels = ['', 'Lemah', 'Cukup', 'Kuat'];
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'];
  if (strength === 0) return null;
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${strength >= s ? colors[strength] : 'bg-stv-border'}`} />
        ))}
      </div>
      <span className={`text-[11px] font-semibold ${strength === 3 ? 'text-emerald-600' : strength === 2 ? 'text-amber-600' : 'text-red-500'}`}>
        {labels[strength]}
      </span>
    </div>
  );
}

// ── Halaman Utama ────────────────────────────────────────────────────────────

export default function DaftarPage() {
  const { signup } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [selection, setSelection] = useState<{ tier: Tier; plan: Plan } | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    namaLengkap: '', email: '', password: '', konfirmasiPassword: '',
    noHp: '', namaAnak: '', usiaAnak: '', setuju: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key as keyof FormErrors]) setErrors(p => ({ ...p, [key]: undefined }));
    setApiError(null);
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.namaLengkap.trim()) e.namaLengkap = 'Nama wajib diisi.';
    if (!form.email.trim()) e.email = 'Email wajib diisi.';
    else if (!EMAIL_RE.test(form.email)) e.email = 'Format email tidak valid.';
    if (!form.password) e.password = 'Password wajib diisi.';
    else if (form.password.length < 8) e.password = 'Password minimal 8 karakter.';
    if (!form.konfirmasiPassword) e.konfirmasiPassword = 'Konfirmasi password wajib diisi.';
    else if (form.password !== form.konfirmasiPassword) e.konfirmasiPassword = 'Password tidak cocok.';
    if (!form.namaAnak.trim()) e.namaAnak = 'Nama anak wajib diisi.';
    if (!form.usiaAnak || isNaN(Number(form.usiaAnak))) e.usiaAnak = 'Usia anak wajib diisi.';
    if (!form.setuju) e.setuju = 'Anda harus menyetujui syarat & ketentuan untuk melanjutkan.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleDaftar() {
    if (!validate()) return;
    setSubmitting(true);
    setApiError(null);
    try {
      // TODO: panggil POST /api/auth/signup dengan payload di bawah untuk membuat
      // akun parent baru. Backend juga harus membuat Stripe customer dan mengembalikan
      // checkoutSessionUrl agar user langsung diarahkan ke Stripe Checkout.
      // Jangan simpan password di sisi klien; autentikasi sepenuhnya di backend.
      await signup({
        email: form.email,
        password: form.password,
        name: form.namaLengkap,
        role: 'parent',
        childName: form.namaAnak,
        childAge: Number(form.usiaAnak),
      });
      // Setelah akun dibuat → tampilkan pilihan paket Tier 2
      setStep('plan');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setApiError(msg || 'Gagal membuat akun. Periksa kembali data Anda atau coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = (field: keyof FormErrors) =>
    `w-full rounded-xl border px-4 py-3 text-[15px] text-stv-navy placeholder:text-stv-muted-2 transition focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-400 bg-red-50 focus:ring-red-400/20'
        : 'border-stv-border bg-white focus:border-stv-sky-stroke focus:ring-stv-sky-stroke/20'
    }`;

  return (
    <div className="flex min-h-[calc(100vh-82px)] font-nunito-sans">

      {/* ── Panel kiri — branding ─────────────────────────────────────── */}
      <div className="relative hidden w-[40%] shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 p-12 lg:flex">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <Sparkles className="absolute right-8 top-8 h-5 w-5 text-white/30" fill="currentColor" strokeWidth={0} />

        <div className="relative flex items-center gap-3">
          <img src="/images/logo-studiva.png" alt="Studiva" className="h-12 w-12 object-contain" />
          <span className="font-baloo text-[22px] font-extrabold text-stv-navy">Studiva</span>
        </div>

        <div className="relative">
          <span className="mb-3 inline-block rounded-full bg-white/25 px-3 py-1 text-[12px] font-bold text-white">
            Studiva Digital · Tier 2
          </span>
          <h2 className="mb-4 font-baloo text-[30px] font-extrabold leading-[1.15] text-white">
            Mulai Perjalanan Bersama Anak Anda
          </h2>
          <p className="mb-8 text-[15px] leading-[1.7] text-white/80">
            Bergabung dengan ribuan orang tua yang sudah mendapat panduan, dukungan, dan komunitas
            untuk mendampingi anak berkebutuhan khusus.
          </p>
          <div className="space-y-2.5">
            {tier2Features.map(f => (
              <div key={f} className="flex items-center gap-2.5 text-[14px] text-white/90">
                <CheckCircle className="h-4 w-4 shrink-0 text-white" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[12px] text-white/50">
          © {new Date().getFullYear()} Studiva · Untuk orang tua Studiva Digital
        </p>
      </div>

      {/* ── Panel kanan — form / plan ─────────────────────────────────── */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-10 sm:px-8">
        <div className="w-full max-w-[460px]">

          {/* Mobile logo */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <img src="/images/logo-studiva.png" alt="Studiva" className="h-10 w-10 object-contain" />
            <span className="font-baloo text-[20px] font-extrabold text-stv-navy">Studiva</span>
          </div>

          {/* ── CATATAN TIER 1 & GURU — selalu terlihat ── */}
          <div className="mb-6 rounded-2xl border border-stv-sky-tint bg-stv-sky-tint/60 p-4">
            <p className="text-[13px] leading-[1.6] text-stv-body">
              <span className="font-bold text-stv-navy">Halaman ini untuk Studiva Digital (Tier 2).</span>{' '}
              Untuk pendaftaran Sekolah Studiva (Tier 1) atau akun Guru, silakan hubungi kami langsung.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-stv-sky-stroke px-3 py-1.5 text-[12px] font-bold text-white no-underline transition hover:bg-stv-sky-stroke/90"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
              <Link
                to="/kontak"
                className="inline-flex items-center gap-1.5 rounded-full border border-stv-sky-stroke px-3 py-1.5 text-[12px] font-bold text-stv-sky-stroke no-underline transition hover:bg-stv-sky-tint"
              >
                Info Pendaftaran
              </Link>
            </div>
          </div>

          {step === 'form' && (
            <>
              <h1 className="mb-1 font-baloo text-[26px] font-extrabold text-stv-navy sm:text-[30px]">
                Daftar Studiva Digital
              </h1>
              <p className="mb-6 text-[14px] text-stv-body">
                Buat akun dan pilih paket berlangganan untuk mulai mengakses platform.
              </p>

              {apiError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {apiError}
                </div>
              )}

              <div className="flex flex-col gap-3.5">
                {/* Nama */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.namaLengkap}
                    onChange={e => setField('namaLengkap', e.target.value)}
                    placeholder="Nama lengkap Anda"
                    autoComplete="name"
                    className={inputCls('namaLengkap')}
                  />
                  {errors.namaLengkap && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.namaLengkap}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    className={inputCls('email')}
                  />
                  {errors.email && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
                </div>

                {/* No HP */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">
                    No. HP / WhatsApp <span className="text-stv-muted text-[11px] font-normal">(opsional)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.noHp}
                    onChange={e => setField('noHp', e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    autoComplete="tel"
                    className="w-full rounded-xl border border-stv-border px-4 py-3 text-[15px] text-stv-navy placeholder:text-stv-muted-2 transition focus:border-stv-sky-stroke focus:outline-none focus:ring-2 focus:ring-stv-sky-stroke/20"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setField('password', e.target.value)}
                      placeholder="Minimal 8 karakter"
                      autoComplete="new-password"
                      className={`${inputCls('password')} pr-11`}
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stv-muted hover:text-stv-navy">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrengthBar password={form.password} />
                  {errors.password && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.password}</p>}
                </div>

                {/* Konfirmasi password */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.konfirmasiPassword}
                      onChange={e => setField('konfirmasiPassword', e.target.value)}
                      placeholder="Ulangi password"
                      autoComplete="new-password"
                      className={`${inputCls('konfirmasiPassword')} pr-11`}
                    />
                    <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stv-muted hover:text-stv-navy">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.konfirmasiPassword && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.konfirmasiPassword}</p>}
                </div>

                {/* Info anak */}
                <div className="rounded-xl border border-stv-border bg-slate-50 p-4">
                  <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-stv-muted-2">Info Anak</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[13px] font-semibold text-stv-navy">
                        Nama Anak <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.namaAnak}
                        onChange={e => setField('namaAnak', e.target.value)}
                        placeholder="Nama anak"
                        className={inputCls('namaAnak')}
                      />
                      {errors.namaAnak && <p className="mt-1 text-[11px] text-red-500">{errors.namaAnak}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-[13px] font-semibold text-stv-navy">
                        Usia <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={18}
                        value={form.usiaAnak}
                        onChange={e => setField('usiaAnak', e.target.value)}
                        placeholder="Tahun"
                        className={inputCls('usiaAnak')}
                      />
                      {errors.usiaAnak && <p className="mt-1 text-[11px] text-red-500">{errors.usiaAnak}</p>}
                    </div>
                  </div>
                </div>

                {/* Syarat & Ketentuan */}
                <div>
                  <label className={`flex cursor-pointer items-start gap-2.5 text-[13px] leading-[1.6] ${errors.setuju ? 'text-red-600' : 'text-stv-body'}`}>
                    <input
                      type="checkbox"
                      checked={form.setuju}
                      onChange={e => setField('setuju', e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-stv-sky-stroke"
                    />
                    Saya setuju dengan{' '}
                    <Link to="/tentang" className="font-semibold text-stv-sky-stroke no-underline hover:underline">
                      Syarat & Ketentuan
                    </Link>{' '}
                    dan{' '}
                    <Link to="/tentang" className="font-semibold text-stv-sky-stroke no-underline hover:underline">
                      Kebijakan Privasi
                    </Link>{' '}
                    Studiva.
                  </label>
                  {errors.setuju && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.setuju}</p>}
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleDaftar}
                  disabled={submitting}
                  className="flex min-h-[50px] items-center justify-center rounded-full bg-amber-500 font-baloo text-[16px] font-bold text-white shadow-[0_6px_20px_rgba(251,146,60,.3)] transition hover:-translate-y-0.5 hover:bg-amber-600 disabled:opacity-60"
                >
                  {submitting ? 'Memproses...' : 'Buat Akun & Pilih Paket'}
                </button>
              </div>

              <p className="mt-5 text-center text-[14px] text-stv-body">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-bold text-stv-sky-stroke no-underline hover:underline">
                  Masuk
                </Link>
              </p>
            </>
          )}

          {step === 'plan' && (
            <div>
              <div className="mb-6 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                <p className="text-[14px] font-semibold text-emerald-700">
                  Akun berhasil dibuat! Sekarang pilih paket berlangganan.
                </p>
              </div>
              <h2 className="mb-2 font-baloo text-[24px] font-extrabold text-stv-navy">Pilih Paket Studiva Digital</h2>
              <p className="mb-6 text-[14px] text-stv-body">
                Pilih durasi paket yang paling sesuai. Anda akan diarahkan ke halaman pembayaran
                Stripe yang aman — kami tidak pernah menyimpan data kartu Anda.
              </p>
              <PricingCard
                tier="tier2"
                icon="💻"
                title="Studiva Digital"
                subtitle="Nasional — Pembelajaran Online"
                features={tier2Features}
                onChoosePlan={(tier, plan) => setSelection({ tier, plan })}
              />
              {/* TODO: setelah user klik "Choose Plan", backend harus:
                  1. Buat Stripe customer dengan email user
                  2. Buat Stripe Checkout Session untuk produk yang dipilih
                  3. Kembalikan checkoutSessionUrl dan redirect user ke sana
                  Jangan pernah memproses kartu atau pembayaran di frontend. */}
            </div>
          )}

        </div>
      </div>

      {selection && (
        <PlanConfirmModal
          tier={selection.tier}
          plan={selection.plan}
          onClose={() => setSelection(null)}
        />
      )}

      {/* ── INFORMASI PENDAFTARAN ──────────────────────────────────────── */}
      <section className="border-t border-stv-border bg-slate-50 px-4 py-16 font-nunito-sans sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="mb-8 text-center font-baloo text-[28px] font-extrabold text-stv-navy sm:text-[34px]">
            Informasi Pendaftaran
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            {/* Tier 1 */}
            <div className="rounded-2xl border-2 border-stv-sky-tint bg-stv-sky-tint/40 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stv-sky-stroke">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stv-sky-stroke">Tier 1</p>
                  <h3 className="font-baloo text-[17px] font-bold text-stv-navy">Sekolah Studiva</h3>
                </div>
              </div>
              <p className="mb-4 text-[14px] leading-[1.7] text-stv-body">
                Pendaftaran Sekolah Studiva dilakukan secara <strong className="text-stv-navy">offline</strong>,
                langsung melalui tim kami. Kami ingin memastikan setiap anak mendapat pendampingan
                yang tepat sejak awal.
              </p>
              <ul className="mb-5 space-y-2">
                {[
                  'Hubungi via WhatsApp untuk sesi perkenalan',
                  'Asesmen awal bersama tim psikolog',
                  'Akun orang tua dibuatkan oleh admin',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-stv-body">
                    <CheckCircle className="h-4 w-4 shrink-0 text-stv-sky-stroke" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo Studiva, saya ingin mendaftarkan anak saya ke Sekolah Studiva.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-stv-sky-stroke px-5 py-2.5 text-[14px] font-bold text-white no-underline transition hover:bg-stv-sky-stroke/90"
              >
                <MessageCircle className="h-4 w-4" />
                Hubungi via WhatsApp
              </a>
            </div>

            {/* Tier 2 */}
            <div className="rounded-2xl border-2 border-amber-100 bg-amber-50/40 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500">
                  <MailIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Tier 2</p>
                  <h3 className="font-baloo text-[17px] font-bold text-stv-navy">Studiva Digital</h3>
                </div>
              </div>
              <p className="mb-4 text-[14px] leading-[1.7] text-stv-body">
                Pendaftaran Studiva Digital dilakukan <strong className="text-stv-navy">sepenuhnya online</strong>.
                Buat akun, pilih paket berlangganan, dan akses langsung semua fitur platform dari
                mana saja di Indonesia.
              </p>
              <ul className="mb-5 space-y-2">
                {[
                  'Daftar mandiri di website — tak perlu menghubungi tim',
                  'Pilih paket bulanan, 3 bulan, atau tahunan',
                  'Akses langsung setelah pembayaran berhasil',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-stv-body">
                    <CheckCircle className="h-4 w-4 shrink-0 text-amber-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-amber-600"
              >
                Daftar Sekarang <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
