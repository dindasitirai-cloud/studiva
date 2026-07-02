import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, EyeOff, AlertCircle, CheckCircle, MessageCircle,
  MapPin, Mail as MailIcon, ArrowRight, ArrowLeft,
  Monitor, Globe, Lock, ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

const FEATURE_BADGE: { bg: string; color: string }[] = [
  { bg: '#E4F1FB', color: '#2E8BC9' },
  { bg: '#E4F1FB', color: '#2E8BC9' },
  { bg: '#FCE7DD', color: '#E07B4F' },
  { bg: '#FCE7DD', color: '#E07B4F' },
  { bg: '#E7F7EF', color: '#3FBF6A' },
  { bg: '#E7F7EF', color: '#3FBF6A' },
];

const PLANS: { id: Plan; label: string; labelColor: string; price: string; savings: string | null; badge: string | null }[] = [
  { id: 'monthly',   label: 'BULANAN',  labelColor: '#6B7790', price: 'Rp 79.000',  savings: null,        badge: null },
  { id: 'quarterly', label: '3 BULAN',  labelColor: '#2E8BC9', price: 'Rp 200.000', savings: 'Hemat 15%', badge: null },
  { id: 'yearly',    label: 'TAHUNAN',  labelColor: '#E07B4F', price: 'Rp 650.000', savings: 'Hemat 30%', badge: 'TERPOPULER' },
];

// ── Types ────────────────────────────────────────────────────────────────────

type Step = 'info' | 'pricing' | 'form';

interface FormState {
  namaLengkap: string; email: string; password: string;
  konfirmasiPassword: string; noHp: string;
  namaAnak: string; usiaAnak: string; setuju: boolean;
}

interface FormErrors {
  namaLengkap?: string; email?: string; password?: string;
  konfirmasiPassword?: string; namaAnak?: string; usiaAnak?: string; setuju?: string;
}

// ── Step indicator (design-spec exact) ──────────────────────────────────────

const STEP_LABELS = ['Pilih Jalur', 'Pilih Paket', 'Buat Akun'];

function StepperBar({ current }: { current: Step }) {
  const idx = current === 'info' ? 0 : current === 'pricing' ? 1 : 2;
  return (
    <div
      className="sticky z-40 flex items-center justify-center gap-0 border-b bg-white px-8 py-[14px] font-nunito-sans"
      style={{ top: 82, borderBottomColor: '#EEF0F4', borderBottomWidth: 1.5 }}
    >
      {STEP_LABELS.map((label, i) => {
        const done   = i < idx;
        const active = i === idx;
        return (
          <React.Fragment key={label}>
            {/* Circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: done ? '#3FBF6A' : active ? '#103A6B' : '#fff',
                  border: done || active ? 'none' : '2px solid #D1D9E6',
                  boxShadow: done
                    ? '0 4px 12px rgba(63,191,106,.28)'
                    : active
                    ? '0 4px 14px rgba(16,58,107,.25)'
                    : 'none',
                }}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span
                    className="text-[13px]"
                    style={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: active ? 800 : 600,
                      color: active ? '#fff' : '#94A0B8',
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                className="text-[12px]"
                style={{
                  fontWeight: 600,
                  color: done ? '#3FBF6A' : active ? '#103A6B' : '#94A0B8',
                  fontFamily: "'Nunito Sans', sans-serif",
                }}
              >
                {label}
              </span>
            </div>

            {/* Connector */}
            {i < STEP_LABELS.length - 1 && (
              <div className="mx-3 mb-5 h-[2px] w-16 rounded-full" style={{
                background: i < idx
                  ? 'linear-gradient(90deg, #3FBF6A 40%, #D1D9E6 100%)'
                  : '#EEF0F4',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Password strength bar ────────────────────────────────────────────────────

function PasswordStrengthBar({ password }: { password: string }) {
  const s = password.length === 0 ? 0 : password.length < 8 ? 1 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3 : 2;
  if (s === 0) return null;
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'];
  const labels = ['', 'Lemah', 'Cukup', 'Kuat'];
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[1,2,3].map(n => <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${s >= n ? colors[s] : 'bg-stv-border'}`}/>)}
      </div>
      <span className={`text-[11px] font-semibold ${s===3?'text-emerald-600':s===2?'text-amber-600':'text-red-500'}`}>{labels[s]}</span>
    </div>
  );
}

// ── Sparkle SVG (4-point star) ───────────────────────────────────────────────

function Star4({ size = 18, color = 'rgba(251,208,10,.55)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"/>
    </svg>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function DaftarPage() {
  const { signup } = useAuth();
  const [step, setStep]                 = useState<Step>('info');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selection, setSelection]       = useState<{ tier: Tier; plan: Plan } | null>(null);
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [apiError, setApiError]         = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    namaLengkap: '', email: '', password: '', konfirmasiPassword: '',
    noHp: '', namaAnak: '', usiaAnak: '', setuju: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k as keyof FormErrors]) setErrors(p => ({ ...p, [k]: undefined }));
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
    if (!form.setuju) e.setuju = 'Anda harus menyetujui syarat & ketentuan.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleDaftar() {
    if (!validate()) return;
    setSubmitting(true); setApiError(null);
    try {
      // TODO: POST /api/auth/signup — backend buat Stripe customer & kembalikan checkoutSessionUrl
      await signup({ email: form.email, password: form.password, name: form.namaLengkap, role: 'parent', childName: form.namaAnak, childAge: Number(form.usiaAnak) });
      if (selectedPlan) setSelection({ tier: 'tier2', plan: selectedPlan });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setApiError(msg || 'Gagal membuat akun. Periksa kembali data Anda atau coba lagi.');
    } finally { setSubmitting(false); }
  }

  const inputCls = (f: keyof FormErrors) =>
    `w-full rounded-xl border px-4 py-3 text-[15px] text-stv-navy placeholder:text-stv-muted-2 transition focus:outline-none focus:ring-2 ${errors[f] ? 'border-red-400 bg-red-50 focus:ring-red-400/20' : 'border-stv-border bg-white focus:border-stv-sky-stroke focus:ring-stv-sky-stroke/20'}`;

  return (
    <div className="font-nunito-sans">

      {/* Step bar — sticky below nav */}
      <StepperBar current={step} />

      {/* ════════════════════════════════════════════════════════════════
          STEP 1 — PILIH JALUR
      ════════════════════════════════════════════════════════════════ */}
      {step === 'info' && (
        <section className="px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-baloo text-[32px] font-extrabold leading-[1.1] text-stv-navy sm:text-[40px]">
                Daftar ke Studiva
              </h1>
              <p className="text-[16px] text-stv-body">Pilih jalur yang sesuai untuk anak dan keluarga Anda.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Tier 1 */}
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
                  Pendaftaran dilakukan secara <strong className="text-stv-navy">offline</strong> — kami ingin memastikan setiap anak mendapat pendampingan yang tepat.
                </p>
                <ul className="mb-6 flex-1 space-y-2">
                  {['Hubungi via WhatsApp untuk sesi perkenalan','Asesmen awal bersama tim psikolog','Akun orang tua dibuatkan oleh admin'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-[13px] text-stv-body">
                      <CheckCircle className="h-4 w-4 shrink-0 text-stv-sky-stroke" />{item}
                    </li>
                  ))}
                </ul>
                <a href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 self-start rounded-full bg-stv-sky-stroke px-5 py-2.5 text-[14px] font-bold text-white no-underline transition hover:bg-stv-sky-stroke/90">
                  <MessageCircle className="h-4 w-4" />Hubungi via WhatsApp
                </a>
              </div>
              {/* Tier 2 */}
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
                      <CheckCircle className="h-4 w-4 shrink-0 text-amber-500" />{f}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => setStep('pricing')}
                  className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-500 px-6 py-3 font-baloo text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(251,146,60,.3)] transition hover:-translate-y-0.5 hover:bg-amber-600">
                  Daftar Sekarang <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-8 text-center text-[14px] text-stv-body">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-bold text-stv-sky-stroke no-underline hover:underline">Masuk</Link>
            </p>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          STEP 2 — PILIH PAKET  (design handoff exact)
      ════════════════════════════════════════════════════════════════ */}
      {step === 'pricing' && (
        <main className="relative min-h-screen overflow-hidden" style={{ background: '#FCF4DE' }}>

          {/* ── Blob decorations ── */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {/* Blob 1 */}
            <div className="animate-stv-float-slow motion-reduce:animate-none absolute -top-[60px] right-[-80px] h-[380px] w-[380px] rounded-full"
              style={{ background: 'rgba(251,208,10,.16)', filter: 'blur(70px)' }} />
            {/* Blob 2 */}
            <div className="animate-stv-float motion-reduce:animate-none absolute -bottom-[40px] left-[-60px] h-[300px] w-[300px] rounded-full"
              style={{ background: 'rgba(95,176,221,.15)', filter: 'blur(60px)' }} />
            {/* Sparkle top-right */}
            <span className="absolute right-[5%]" style={{ top: '22%' }}>
              <Star4 size={18} color="rgba(251,208,10,.55)" />
            </span>
            {/* Coral dot */}
            <span className="absolute left-[4%] h-[10px] w-[10px] rounded-full" style={{ top: '55%', background: 'rgba(224,123,79,.38)' }} />
            {/* Sky sparkle */}
            <span className="absolute right-[7%]" style={{ bottom: '28%' }}>
              <Star4 size={13} color="rgba(95,176,221,.45)" />
            </span>
            {/* Green dot */}
            <span className="absolute left-[8%] h-[7px] w-[7px] rounded-full" style={{ top: '12%', background: 'rgba(63,191,106,.40)' }} />
          </div>

          {/* ── Page content ── */}
          <div className="relative mx-auto max-w-[780px] px-5 pb-20 pt-10 sm:px-6">

            {/* Back link */}
            <button
              type="button"
              onClick={() => setStep('info')}
              className="mb-10 flex items-center gap-1.5 transition"
              style={{ color: '#6B7790', fontFamily: "'Nunito Sans', sans-serif", fontWeight: 600, fontSize: 15 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#103A6B')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6B7790')}
            >
              <ChevronLeft className="h-4 w-4" />
              Kembali
            </button>

            {/* Page header */}
            <div className="mb-11 text-center">
              <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 52, color: '#103A6B', lineHeight: 1.1, margin: 0 }}>
                Pilih Paket{' '}
                <span style={{ position: 'relative', display: 'inline-block', zIndex: 0 }}>
                  <span style={{ position: 'absolute', left: -5, right: -5, bottom: '10%', height: '32%', background: '#FBD00A', borderRadius: 7, zIndex: -1 }} />
                  Studiva Digital
                </span>
              </h1>
              <p style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 400, fontSize: 17, color: '#6B7790', lineHeight: 1.65, maxWidth: 500, margin: '14px auto 0' }}>
                Pilih durasi langganan yang paling sesuai. Anda dapat berlangganan kembali kapan saja.
              </p>
            </div>

            {/* Product card */}
            <div style={{ background: '#fff', border: '1.5px solid #EEF0F4', borderRadius: 28, boxShadow: '0 16px 48px rgba(16,58,107,.08)', padding: '44px 44px 40px', marginBottom: 24 }}>

              {/* Product header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30 }}>
                <div style={{ width: 68, height: 68, borderRadius: 20, background: '#E4F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(46,139,201,.15)' }}>
                  <Monitor size={34} color="#2E8BC9" />
                </div>
                <div>
                  <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 36, color: '#103A6B', margin: 0, lineHeight: 1.15 }}>
                    Studiva Digital
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#E4F1FB', color: '#2E8BC9', fontWeight: 700, fontSize: 13, borderRadius: 999, padding: '4px 12px' }}>
                      <Globe size={12} />
                      Nasional
                    </span>
                    <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#94A0B8' }}>
                      Pembelajaran Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1.5, background: '#EEF0F4', borderRadius: 99, marginBottom: 26 }} />

              {/* Feature eyebrow */}
              <div style={{ marginBottom: 16 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFF3CC', color: '#103A6B', fontWeight: 800, fontSize: 11, letterSpacing: '2.5px', padding: '7px 18px', borderRadius: 999, textTransform: 'uppercase' as const }}>
                  <span style={{ width: 6, height: 6, background: '#FBD00A', borderRadius: '50%', flexShrink: 0 }} />
                  FITUR TERMASUK
                </span>
              </div>

              {/* Feature list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 34 }}>
                {TIER2_FEATURES.map((f, i) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: FEATURE_BADGE[i].bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke={FEATURE_BADGE[i].color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 600, fontSize: 15, color: '#2E3A52' }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* "Pilih Durasi" section label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 19, color: '#103A6B', flexShrink: 0 }}>Pilih Durasi</span>
                <div style={{ flex: 1, height: 1.5, background: '#EEF0F4', borderRadius: 99 }} />
              </div>

              {/* Pricing rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PLANS.map(plan => {
                  const isYearly = plan.id === 'yearly';
                  return (
                    <div
                      key={plan.id}
                      style={{
                        position: 'relative',
                        background: isYearly ? '#FFFEF0' : '#F8FBFE',
                        border: isYearly ? '2px solid #FBD00A' : '1.5px solid #EEF0F4',
                        borderRadius: 16,
                        padding: isYearly ? '22px 24px 20px' : '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isYearly ? '0 6px 22px rgba(251,208,10,.22)' : 'none',
                        transition: 'border-color .2s, box-shadow .2s',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => {
                        if (isYearly) e.currentTarget.style.boxShadow = '0 10px 32px rgba(251,208,10,.35)';
                        else { e.currentTarget.style.borderColor = '#C8E4F5'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,58,107,.07)'; }
                      }}
                      onMouseLeave={e => {
                        if (isYearly) e.currentTarget.style.boxShadow = '0 6px 22px rgba(251,208,10,.22)';
                        else { e.currentTarget.style.borderColor = '#EEF0F4'; e.currentTarget.style.boxShadow = 'none'; }
                      }}
                    >
                      {/* TERPOPULER badge */}
                      {plan.badge && (
                        <span style={{ position: 'absolute', top: -14, left: 20, background: '#FBD00A', color: '#103A6B', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: '2px', padding: '4px 16px', borderRadius: 999, textTransform: 'uppercase' as const }}>
                          {plan.badge}
                        </span>
                      )}

                      {/* Left: label + price */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 700, fontSize: 11, color: plan.labelColor, textTransform: 'uppercase' as const, letterSpacing: '2px' }}>
                            {plan.label}
                          </span>
                          {plan.savings && (
                            <span style={{ background: '#E7F7EF', color: '#3FBF6A', fontWeight: 800, fontSize: 11, borderRadius: 999, padding: '3px 10px' }}>
                              {plan.savings}
                            </span>
                          )}
                        </div>
                        <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 32, color: '#103A6B', lineHeight: 1 }}>
                          {plan.price}
                        </span>
                      </div>

                      {/* Right: button */}
                      <ChoosePlanBtn
                        variant={isYearly ? 'navy' : 'yellow'}
                        onClick={() => { setSelectedPlan(plan.id); setStep('form'); }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stripe note */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#94A0B8', fontSize: 14, fontFamily: "'Nunito Sans', sans-serif" }}>
              <Lock size={14} color="#94A0B8" />
              Pembayaran aman via Stripe. Kami tidak pernah menyimpan data kartu Anda.
            </div>
          </div>
        </main>
      )}

      {/* ════════════════════════════════════════════════════════════════
          STEP 3 — BUAT AKUN
      ════════════════════════════════════════════════════════════════ */}
      {step === 'form' && (
        <section className="px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-[520px]">
            <button type="button" onClick={() => setStep('pricing')}
              className="mb-8 flex items-center gap-1.5 text-[14px] font-semibold text-stv-muted transition hover:text-stv-navy">
              <ArrowLeft className="h-4 w-4" />Ganti Paket
            </button>

            {selectedPlan && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-[14px]">
                <CheckCircle className="h-4 w-4 shrink-0 text-amber-500" />
                <span className="text-stv-body">
                  Paket dipilih:{' '}
                  <strong className="text-stv-navy">
                    {{ monthly: 'Bulanan', quarterly: '3 Bulan', yearly: 'Tahunan' }[selectedPlan]}
                  </strong>
                </span>
              </div>
            )}

            <h1 className="mb-1 font-baloo text-[28px] font-extrabold text-stv-navy sm:text-[32px]">Buat Akun Studiva Digital</h1>
            <p className="mb-6 text-[14px] text-stv-body">Isi data di bawah untuk membuat akun, lalu lanjut ke pembayaran.</p>

            {apiError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{apiError}
              </div>
            )}

            <div className="flex flex-col gap-3.5">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">Nama Lengkap <span className="text-red-500">*</span></label>
                <input type="text" value={form.namaLengkap} onChange={e => setField('namaLengkap', e.target.value)} placeholder="Nama lengkap Anda" autoComplete="name" className={inputCls('namaLengkap')} />
                {errors.namaLengkap && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.namaLengkap}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">Email <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="nama@email.com" autoComplete="email" className={inputCls('email')} />
                {errors.email && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">No. HP / WhatsApp <span className="text-[11px] font-normal text-stv-muted">(opsional)</span></label>
                <input type="tel" value={form.noHp} onChange={e => setField('noHp', e.target.value)} placeholder="08xxxxxxxxxx" autoComplete="tel" className="w-full rounded-xl border border-stv-border bg-white px-4 py-3 text-[15px] text-stv-navy placeholder:text-stv-muted-2 transition focus:border-stv-sky-stroke focus:outline-none focus:ring-2 focus:ring-stv-sky-stroke/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setField('password', e.target.value)} placeholder="Minimal 8 karakter" autoComplete="new-password" className={`${inputCls('password')} pr-11`} />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stv-muted hover:text-stv-navy">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrengthBar password={form.password} />
                {errors.password && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.password}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-stv-navy">Konfirmasi Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={form.konfirmasiPassword} onChange={e => setField('konfirmasiPassword', e.target.value)} placeholder="Ulangi password" autoComplete="new-password" className={`${inputCls('konfirmasiPassword')} pr-11`} />
                  <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stv-muted hover:text-stv-navy">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.konfirmasiPassword && <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.konfirmasiPassword}</p>}
              </div>
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
              <button type="button" onClick={handleDaftar} disabled={submitting}
                className="flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-amber-500 font-baloo text-[16px] font-bold text-white shadow-[0_6px_20px_rgba(251,146,60,.3)] transition hover:-translate-y-0.5 hover:bg-amber-600 disabled:opacity-60">
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
        <PlanConfirmModal tier={selection.tier} plan={selection.plan} onClose={() => setSelection(null)} />
      )}
    </div>
  );
}

// ── ChoosePlanButton (inline to use hover state via React) ───────────────────

function ChoosePlanBtn({ variant, onClick }: { variant: 'yellow' | 'navy'; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const base = {
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 700,
    fontSize: 16,
    padding: '14px 30px',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    transition: 'background .18s, transform .18s, box-shadow .18s',
    transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
    whiteSpace: 'nowrap' as const,
  };
  const yellow = {
    background: hovered ? '#F5C800' : '#FBD00A',
    color: '#103A6B',
    boxShadow: hovered ? '0 8px 20px rgba(251,208,10,.45)' : '0 5px 14px rgba(251,208,10,.35)',
  };
  const navy = {
    background: hovered ? '#0C2E54' : '#103A6B',
    color: '#FBD00A',
    boxShadow: hovered ? '0 8px 24px rgba(16,58,107,.32)' : '0 5px 16px rgba(16,58,107,.22)',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...base, ...(variant === 'navy' ? navy : yellow) }}
    >
      Pilih
    </button>
  );
}
