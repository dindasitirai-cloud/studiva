import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PricingCard from '../components/PricingCard';
import PlanConfirmModal from '../components/PlanConfirmModal';
import { Plan, Tier, UserRole } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const tier1Features = [
  'Pembelajaran di kelas dengan guru bersertifikat',
  'Terapi profesional (speech, OT, behavioral)',
  'Dashboard orang tua real-time',
  'Komunikasi daily dengan guru',
  'Personalized learning plan',
  'Akses TIER 2 gratis',
];

const tier2Features = [
  'Ribuan panduan parenting berbasis research',
  'Kursus self-paced untuk orang tua',
  'Komunitas forum moderated',
  'Konsultasi 1-on-1 dengan expert',
  'Resource library (printables, templates)',
  'Webinar bulanan dengan Psikolog Fitri Effendy',
];

type Step = 'role' | 'tier' | 'form' | 'plan' | 'teacher-done';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const presetTier = (location.state as { presetTier?: Tier } | null)?.presetTier;

  const [step, setStep] = useState<Step>(presetTier ? 'form' : 'role');
  const [role, setRole] = useState<UserRole>('parent');
  const [tier, setTier] = useState<Tier | null>(presetTier ?? null);
  const [selection, setSelection] = useState<{ tier: Tier; plan: Plan } | null>(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    childName: '',
    childAge: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate(): string | null {
    if (!form.email || !form.password || !form.confirmPassword || !form.name) {
      return 'Semua field wajib diisi.';
    }
    if (!EMAIL_REGEX.test(form.email)) {
      return 'Format email tidak valid.';
    }
    if (form.password.length < 8) {
      return 'Password harus minimal 8 karakter.';
    }
    if (form.password !== form.confirmPassword) {
      return 'Password dan konfirmasi password tidak cocok.';
    }
    if (role === 'parent' && (!form.childName || !form.childAge)) {
      return 'Nama dan usia anak wajib diisi untuk pendaftaran orang tua.';
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signup({
        email: form.email,
        password: form.password,
        name: form.name,
        role,
        childName: role === 'parent' ? form.childName : undefined,
        childAge: role === 'parent' ? Number(form.childAge) : undefined,
      });
      if (role === 'teacher') {
        setStep('teacher-done');
      } else {
        setStep('plan');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleChoosePlan(chosenTier: Tier, plan: Plan) {
    setSelection({ tier: chosenTier, plan });
  }

  return (
    <div className="bg-background px-4 py-16">
      <div className="mx-auto max-w-3xl">
        {step === 'role' && (
          <div className="mx-auto max-w-md rounded-xl border border-bordergray bg-white p-8 shadow-sm">
            <h1 className="text-h2 font-bold text-navy">Buat Akun Studiva</h1>
            <p className="mt-2 text-textlight">Saya mendaftar sebagai...</p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => {
                  setRole('parent');
                  setStep('tier');
                }}
                className="min-h-[48px] rounded-md border-2 border-bordergray px-6 py-3 text-left font-semibold text-textdark transition hover:border-gold"
              >
                👨‍👩‍👧 Orang Tua / Wali
              </button>
              <button
                onClick={() => {
                  setRole('teacher');
                  setStep('form');
                }}
                className="min-h-[48px] rounded-md border-2 border-bordergray px-6 py-3 text-left font-semibold text-textdark transition hover:border-gold"
              >
                🍎 Guru / Staff
              </button>
            </div>
            <p className="mt-6 text-center text-sm text-textlight">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-medium text-gold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        )}

        {step === 'tier' && (
          <div>
            <h1 className="text-center text-h2 font-bold text-navy">Pilih Paket Studiva</h1>
            <p className="mt-2 text-center text-textlight">
              Anda bisa mengganti atau menambah paket lain nanti melalui halaman Subscription.
            </p>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <PricingCard
                tier="tier1"
                icon="🏫"
                title="Tier 1: Sekolah Studiva"
                subtitle="Bukittinggi - Kolaborasi Penuh"
                features={tier1Features}
                onChoosePlan={(chosenTier) => {
                  setTier(chosenTier);
                  setStep('form');
                }}
              />
              <PricingCard
                tier="tier2"
                icon="💻"
                title="Tier 2: Studiva Digital"
                subtitle="Nasional - Pembelajaran Online"
                features={tier2Features}
                onChoosePlan={(chosenTier) => {
                  setTier(chosenTier);
                  setStep('form');
                }}
              />
            </div>
            <p className="mt-4 text-center">
              <button onClick={() => setStep('role')} className="text-sm text-textlight hover:underline">
                &larr; Kembali
              </button>
            </p>
          </div>
        )}

        {step === 'form' && (
          <div className="mx-auto max-w-md rounded-xl border border-bordergray bg-white p-8 shadow-sm">
            <h1 className="text-h2 font-bold text-navy">
              {role === 'parent' ? `Daftar ${tier === 'tier1' ? 'Tier 1' : 'Tier 2'}` : 'Daftar sebagai Guru'}
            </h1>

            {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-textdark">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-textdark">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-textdark">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-textdark">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
                />
              </div>

              {role === 'parent' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-textdark">Child&apos;s Name</label>
                    <input
                      type="text"
                      name="childName"
                      value={form.childName}
                      onChange={handleChange}
                      required
                      className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-textdark">Child&apos;s Age</label>
                    <input
                      type="number"
                      name="childAge"
                      min={0}
                      max={18}
                      value={form.childAge}
                      onChange={handleChange}
                      required
                      className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="min-h-[48px] rounded-md bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold/90 disabled:opacity-60"
              >
                {submitting ? 'Memproses...' : role === 'parent' ? 'Lanjut ke Pembayaran' : 'Sign Up'}
              </button>
            </form>

            <p className="mt-4 text-center">
              <button
                onClick={() => setStep(role === 'parent' ? 'tier' : 'role')}
                className="text-sm text-textlight hover:underline"
              >
                &larr; Kembali
              </button>
            </p>
          </div>
        )}

        {step === 'plan' && tier && (
          <div>
            <h1 className="text-center text-h2 font-bold text-navy">Pilih Paket Pembayaran</h1>
            <p className="mt-2 text-center text-textlight">
              Akun Anda sudah dibuat. Pilih durasi paket {tier === 'tier1' ? 'Tier 1' : 'Tier 2'} untuk
              mengaktifkan dashboard.
            </p>
            <div className="mx-auto mt-8 max-w-xl">
              <PricingCard
                tier={tier}
                icon={tier === 'tier1' ? '🏫' : '💻'}
                title={tier === 'tier1' ? 'Tier 1: Sekolah Studiva' : 'Tier 2: Studiva Digital'}
                subtitle={tier === 'tier1' ? 'Bukittinggi - Kolaborasi Penuh' : 'Nasional - Pembelajaran Online'}
                features={tier === 'tier1' ? tier1Features : tier2Features}
                onChoosePlan={handleChoosePlan}
              />
            </div>
          </div>
        )}

        {step === 'teacher-done' && (
          <div className="mx-auto max-w-md rounded-xl border border-bordergray bg-white p-8 text-center shadow-sm">
            <div className="text-5xl">🍎</div>
            <h1 className="mt-4 text-h2 font-bold text-navy">Akun Guru Dibuat</h1>
            <p className="mt-2 text-textdark">
              Akun Anda telah dibuat. Admin Studiva akan mengaktifkan akses dashboard Anda dan
              menugaskan siswa dalam waktu singkat.
            </p>
            <button
              onClick={() => navigate('/dashboard/teacher')}
              className="mt-6 min-h-[48px] rounded-md bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold/90"
            >
              Lihat Dashboard
            </button>
          </div>
        )}
      </div>

      {selection && (
        <PlanConfirmModal tier={selection.tier} plan={selection.plan} onClose={() => setSelection(null)} />
      )}
    </div>
  );
}
