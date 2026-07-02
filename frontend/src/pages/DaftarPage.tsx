import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, EyeOff, AlertCircle, CheckCircle, MessageCircle,
  MapPin, Mail as MailIcon, ArrowRight, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PricingCard from '../components/PricingCard';
import PlanConfirmModal from '../components/PlanConfirmModal';
import { Plan, Tier } from '../types';

// ── Constants ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WA_NUMBER = '6281211470407';
const WA_MSG = encodeURIComponent('Halo Studiva, saya ingin mendaftarkan anak saya ke Sekolah Studiva.');

const TIER2_FEATURES = [
  'Ribuan panduan parenting berbasis riset',
  'Kursus self-paced & webinar psikolog',
  'Komunitas forum orang tua',
  'Konsultasi 1-on-1 dengan psikolog',
  'Resource library lengkap',
  'Dashboard kemajuan perjalanan anak',
];

// ── Types ────────────────────────────────────────────────────────────────────

type Step = 'info' | 'pricing' | 'form';

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

// ── Password strength bar ────────────────────────────────────────────────────

function PasswordStrengthBar({ password }: { password: string }) {
  const strength =
    password.length === 0 ? 0
    : password.length < 8 ? 1
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3
    : 2;
  if (strength === 0) return null;
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'];
  const labels = ['', 'Lemah', 'Cukup', 'Kuat'];
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

// ── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { key: 'info',    label: 'Pilih Jalur' },
  { key: 'pricing', label: 'Pilih Paket' },
  { key: 'form',    label: 'Buat Akun'   },
] as const;

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.findIndex(s => s.key === current);
  return (
    <div className="flex items-center justify-center gap-2 font-nunito-sans">
      {STEPS.map((s, i) => {
        const done    = i < idx;
        const active  = i === idx;
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold transition ${
                done   ? 'bg-emerald-500 text-white'
                : active ? 'bg-stv-navy text-white'
                : 'bg-stv-border text-stv-muted'
              }`}>
                {done ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-[13px] font-semibold ${active ? 'text-stv-navy' : done ? 'text-emerald-600' : 'text-stv-muted'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 ${i < idx ? 'bg-emerald-400' : 'bg-stv-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function DaftarPage() {
  const { signup } = useAuth();
  const [step, setStep]               = useState<Step>('info');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selection, setSelection]     = useState<{ tier: Tier; plan: Plan } | null>(null);

  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [apiError, setApiError]       = useState<string | null>(null);

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
    if (!form.email.trim())       e.email = 'Email wajib diisi.';
    else if (!EMAIL_RE.test(form.email)) e.email = 'Format email tidak valid.';
    if (!form.password)           e.password = 'Password wajib diisi.';
    else if (form.password.length < 8)   e.password = 'Password minimal 8 karakter.';
    if (!form.konfirmasiPassword) e.konfirmasiPassword = 'Konfirmasi password wajib diisi.';
    else if (form.password !== form.konfirmasiPassword) e.konfirmasiPassword = 'Password tidak cocok.';
    if (!form.namaAnak.trim())    e.namaAnak = 'Nama anak wajib diisi.';
    if (!form.usiaAnak || isNaN(Number(form.usiaAnak))) e.usiaAnak = 'Usia anak wajib diisi.';
    if (!form.setuju)             e.setuju = 'Anda harus menyetujui syarat & ketentuan.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleDaftar() {
    if (!validate()) return;
    setSubmitting(true);
    setApiError(null);
    try {
      // TODO: panggil POST /api/auth/signup — backend juga harus membuat Stripe
      // customer dan mengembalikan checkoutSessionUrl untuk redirect ke Stripe Checkout.
      // Jangan simpan password di sisi klien; autentikasi sepenuhnya di backend.
      await signup({
        email: form.email,
        password: form.password,
        name: form.namaLengkap,
        role: 'parent',
        childName: form.namaAnak,
        childAge: Number(form.usiaAnak),
      });
      // Buka modal Stripe Checkout untuk plan yang sudah dipilih sebelumnya
      if (selectedPlan) setSelection({ tier: 'tier2', plan: selectedPlan });
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
    <div className="font-nunito-sans">

      {/* ── Step indicator (semua step) ────────────────────────────────── */}
      <div className="border-b border-stv-border bg-white px-4 py-4 sm:px-8">
        <StepIndicator current={step} />
      </div>

      {/* ════════════════════════════════════════════════════════════════
          STEP 1 — INFORMASI PENDAFTARAN
      ════════════════════════════════════════════════════════════════ */}
      {step === 'info' && (
        <section className="px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-baloo text-[32px] font-extrabold leading-[1.1] text-stv-navy sm:text-[40px]">
                Daftar ke Studiva
              </h1>
              <p className="text-[16px] text-stv-body">
                Pilih jalur yang sesuai untuk anak dan keluarga Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

              {/* Tier 1 — offline */}
              <div className="flex flex-col rounded-2xl border-2 border-stv-sky-tint bg-stv-sky-tint/40 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stv-sky-stroke">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stv-sky-stroke">Tier 1</p>
                    <h2 className="font-baloo text-[18px] font-bold text-stv-navy">Sekolah Studiva</h2>
                  </div>
                </div>
                <p className="mb-4 text-[14px] leading-[1.7] text-stv-body">
                  Sekolah fisik inklusif di Bukittinggi untuk anak berkebutuhan khusus usia 5–10 tahun.
                  Pendaftaran dilakukan secara <strong className="text-stv-navy">offline</strong> — kami
                  ingin memastikan setiap anak mendapat pendampingan yang tepat sejak awal.
                </p>
                <ul className="mb-6 flex-1 space-y-2">
                  {['Hubungi via WhatsApp untuk sesi perkenalan', 'Asesmen awal bersama tim psikolog', 'Akun orang tua dibuatkan oleh admin'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-[13px] text-stv-body">
                      <CheckCircle className="h-4 w-4 shrink-0 text-stv-sky-stroke" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 self-start rounded-full bg-stv-sky-stroke px-5 py-2.5 text-[14px] font-bold text-white no-underline transition hover:bg-stv-sky-stroke/90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Hubungi via WhatsApp
                </a>
              </div>

              {/* Tier 2 — online */}
              <div className="flex flex-col rounded-2xl border-2 border-amber-300 bg-amber-50/40 p-6 shadow-[0_4px_20px_rgba(251,146,60,.12)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500">
                    <MailIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Tier 2</p>
                    <h2 className="font-baloo text-[18px] font-bold text-stv-navy">Studiva Digital</h2>
                  </div>
                </div>
                <p className="mb-4 text-[14px] leading-[1.7] text-stv-body">
                  Platform berlangganan online untuk orang tua di seluruh Indonesia. Akses ribuan panduan,
                  webinar psikolog, komunitas, dan konsultasi — <strong className="text-stv-navy">kapan saja, di mana saja</strong>.
                </p>
                <ul className="mb-6 flex-1 space-y-2">
                  {TIER2_FEATURES.map(f => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-stv-body">
                      <CheckCircle className="h-4 w-4 shrink-0 text-amber-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setStep('pricing')}
                  className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-500 px-6 py-3 font-baloo text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(251,146,60,.3)] transition hover:-translate-y-0.5 hover:bg-amber-600"
                >
                  Daftar Sekarang <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>

            <p className="mt-8 text-center text-[14px] text-stv-body">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-bold text-stv-sky-stroke no-underline hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          STEP 2 — PILIH PAKET (PRICING)
      ════════════════════════════════════════════════════════════════ */}
      {step === 'pricing' && (
        <section className="px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-[600px]">
            <button
              type="button"
              onClick={() => setStep('info')}
              className="mb-8 flex items-center gap-1.5 text-[14px] font-semibold text-stv-muted transition hover:text-stv-navy"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>

            <div className="mb-8 text-center">
              <h1 className="mb-2 font-baloo text-[30px] font-extrabold text-stv-navy sm:text-[36px]">
                Pilih Paket Studiva Digital
              </h1>
              <p className="text-[15px] text-stv-body">
                Pilih durasi langganan yang paling sesuai. Anda dapat berlangganan kembali kapan saja.
              </p>
            </div>

            <PricingCard
              tier="tier2"
              icon="💻"
              title="Studiva Digital"
              subtitle="Nasional — Pembelajaran Online"
              features={TIER2_FEATURES}
              onChoosePlan={(_tier: Tier, plan: Plan) => {
                setSelectedPlan(plan);
                setStep('form');
              }}
            />

            <p className="mt-6 text-center text-[13px] text-stv-muted">
              Pembayaran aman via Stripe. Kami tidak pernah menyimpan data kartu Anda.
            </p>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          STEP 3 — FORMULIR PENDAFTARAN
      ════════════════════════════════════════════════════════════════ */}
      {step === 'form' && (
        <section className="px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-[520px]">
            <button
              type="button"
              onClick={() => setStep('pricing')}
              className="mb-8 flex items-center gap-1.5 text-[14px] font-semibold text-stv-muted transition hover:text-stv-navy"
            >
              <ArrowLeft className="h-4 w-4" />
              Ganti Paket
            </button>

            {selectedPlan && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-[14px]">
                <CheckCircle className="h-4 w-4 shrink-0 text-amber-500" />
                <span className="text-stv-body">
                  Paket dipilih:{' '}
                  <strong className="text-stv-navy capitalize">
                    {{ monthly: 'Bulanan', quarterly: '3 Bulan', yearly: 'Tahunan' }[selectedPlan]}
                  </strong>
                </span>
              </div>
            )}

            <h1 className="mb-1 font-baloo text-[28px] font-extrabold text-stv-navy sm:text-[32px]">
              Buat Akun Studiva Digital
            </h1>
            <p className="mb-6 text-[14px] text-stv-body">
              Isi data di bawah untuk membuat akun, lalu lanjut ke pembayaran.
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
                <input type="text" value={form.namaLengkap} onChange={e => setField('namaLengkap', e.target.value)} placeholder="Nama lengkap Anda" autoComplete="name" className={inputCls('namaLengkap')} />
                {errors.namaLengkap && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.namaLengkap}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">
                  Email <span className="text-red-500">*</span>
                </label>
                <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="nama@email.com" autoComplete="email" className={inputCls('email')} />
                {errors.email && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
              </div>

              {/* No HP */}
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">
                  No. HP / WhatsApp <span className="text-[11px] font-normal text-stv-muted">(opsional)</span>
                </label>
                <input type="tel" value={form.noHp} onChange={e => setField('noHp', e.target.value)} placeholder="08xxxxxxxxxx" autoComplete="tel" className="w-full rounded-xl border border-stv-border bg-white px-4 py-3 text-[15px] text-stv-navy placeholder:text-stv-muted-2 transition focus:border-stv-sky-stroke focus:outline-none focus:ring-2 focus:ring-stv-sky-stroke/20" />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setField('password', e.target.value)} placeholder="Minimal 8 karakter" autoComplete="new-password" className={`${inputCls('password')} pr-11`} />
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
                  <input type={showConfirm ? 'text' : 'password'} value={form.konfirmasiPassword} onChange={e => setField('konfirmasiPassword', e.target.value)} placeholder="Ulangi password" autoComplete="new-password" className={`${inputCls('konfirmasiPassword')} pr-11`} />
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
                    <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nama Anak <span className="text-red-500">*</span></label>
                    <input type="text" value={form.namaAnak} onChange={e => setField('namaAnak', e.target.value)} placeholder="Nama anak" className={inputCls('namaAnak')} />
                    {errors.namaAnak && <p className="mt-1 text-[11px] text-red-500">{errors.namaAnak}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Usia <span className="text-red-500">*</span></label>
                    <input type="number" min={0} max={18} value={form.usiaAnak} onChange={e => setField('usiaAnak', e.target.value)} placeholder="Tahun" className={inputCls('usiaAnak')} />
                    {errors.usiaAnak && <p className="mt-1 text-[11px] text-red-500">{errors.usiaAnak}</p>}
                  </div>
                </div>
              </div>

              {/* S&K */}
              <div>
                <label className={`flex cursor-pointer items-start gap-2.5 text-[13px] leading-[1.6] ${errors.setuju ? 'text-red-600' : 'text-stv-body'}`}>
                  <input type="checkbox" checked={form.setuju} onChange={e => setField('setuju', e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-stv-sky-stroke" />
                  Saya setuju dengan{' '}
                  <Link to="/tentang" className="font-semibold text-stv-sky-stroke no-underline hover:underline">Syarat &amp; Ketentuan</Link>
                  {' '}dan{' '}
                  <Link to="/tentang" className="font-semibold text-stv-sky-stroke no-underline hover:underline">Kebijakan Privasi</Link>{' '}Studiva.
                </label>
                {errors.setuju && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.setuju}</p>}
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleDaftar}
                disabled={submitting}
                className="flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-amber-500 font-baloo text-[16px] font-bold text-white shadow-[0_6px_20px_rgba(251,146,60,.3)] transition hover:-translate-y-0.5 hover:bg-amber-600 disabled:opacity-60"
              >
                {submitting ? 'Memproses...' : 'Buat Akun & Lanjut ke Pembayaran'}
              </button>
            </div>

            <p className="mt-5 text-center text-[14px] text-stv-body">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-bold text-stv-sky-stroke no-underline hover:underline">Masuk</Link>
            </p>
          </div>
        </section>
      )}

      {selection && (
        <PlanConfirmModal
          tier={selection.tier}
          plan={selection.plan}
          onClose={() => setSelection(null)}
        />
      )}
    </div>
  );
}
