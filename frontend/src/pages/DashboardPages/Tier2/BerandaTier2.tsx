import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Library,
  GraduationCap,
  Lightbulb,
  CalendarCheck,
  Baby,
  Plus,
  ArrowRight,
  BookOpen,
  Star,
  Clock,
} from 'lucide-react';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';

// ---------------------------------------------------------------------------
// Rotating motivational greeting messages
// ---------------------------------------------------------------------------
const MOTIVATIONS = [
  'Semangat terus dalam mendampingi si kecil! 💛',
  'Setiap langkah kecil itu berarti. ✨',
  'Anda tidak sendirian dalam perjalanan ini. 🤝',
  'Belajar bersama, tumbuh bersama. 🌱',
  'Anda adalah pengajar pertama dan terbaik anak Anda. 💪',
];

// ---------------------------------------------------------------------------
// Shortcut cards
// ---------------------------------------------------------------------------
const SHORTCUTS = [
  {
    to: '/dashboard/tier2/resources',
    icon: Library,
    label: 'Resource Library',
    desc: 'Rangkuman materi pendidikan anak',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    ring: 'ring-amber-200',
  },
  {
    to: '/dashboard/tier2/courses',
    icon: GraduationCap,
    label: 'Courses',
    desc: 'Kelas & webinar bersama psikolog',
    bg: 'bg-stv-sky-tint',
    iconColor: 'text-stv-sky-stroke',
    ring: 'ring-stv-sky-tint',
  },
  {
    to: '/dashboard/tier2/strategies',
    icon: Lightbulb,
    label: 'Learning Strategies',
    desc: 'Tips & aktivitas edukatif di rumah',
    bg: 'bg-stv-coral-tint',
    iconColor: 'text-stv-coral',
    ring: 'ring-stv-coral-tint',
  },
  {
    to: '/dashboard/tier2/konsultasi',
    icon: CalendarCheck,
    label: 'Konsultasi',
    desc: 'Booking sesi dengan psikolog',
    bg: 'bg-stv-green-tint',
    iconColor: 'text-stv-green',
    ring: 'ring-stv-green-tint',
  },
];

// ---------------------------------------------------------------------------
// Mock recommendations (replace with API data later)
// ---------------------------------------------------------------------------
// TODO: fetch personalized recommendations from backend based on child profile
const RECOMMENDATIONS = [
  {
    id: 'rec-1',
    type: 'article' as const,
    title: 'Mengenal Gaya Belajar Visual pada Anak',
    category: 'Gaya Belajar',
    readTime: '5 menit',
    to: '/dashboard/tier2/resources',
  },
  {
    id: 'rec-2',
    type: 'article' as const,
    title: 'Strategi Komunikasi Positif dengan Anak Sensorik',
    category: 'Komunikasi',
    readTime: '7 menit',
    to: '/dashboard/tier2/resources',
  },
  {
    id: 'rec-3',
    type: 'webinar' as const,
    title: 'Live Webinar: Mendampingi Anak dengan ADHD',
    category: 'Webinar',
    readTime: '60 menit',
    to: '/dashboard/tier2/courses',
  },
];

// ---------------------------------------------------------------------------
// Animated counter hook
// ---------------------------------------------------------------------------
function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // No "run once" guard here on purpose: this must re-animate every time
    // `target` changes (e.g. user reads another article), and must also
    // survive React.StrictMode's dev-mode double-invoke of effects, which a
    // one-shot ref guard would break (the first pass's interval gets torn
    // down by Strict Mode's simulated cleanup, and a guard would then block
    // the second pass from ever restarting it).
    if (target === 0) { setCount(0); return; }
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setCount(Math.round((target * current) / steps));
      if (current >= steps) clearInterval(interval);
    }, stepTime);
    return () => clearInterval(interval);
  }, [target, duration]);

  return count;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

function ChildCard({ name, age, styles }: { name: string; age: number; styles: string[] }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-500 font-baloo text-[22px] font-bold text-white">
        {initial}
      </div>
      <div>
        <div className="font-bold text-stv-navy">{name}</div>
        <div className="text-[13px] text-stv-muted">{age} tahun</div>
        <div className="mt-1 flex flex-wrap gap-1">
          {styles.map(s => (
            <span key={s} className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Beranda component
// ---------------------------------------------------------------------------
export default function BerandaTier2() {
  const { children, totalArticlesRead, totalCoursesEnrolled, totalStrategiesSaved } = useDashboardTier2();

  // Rotating motivation
  const [motivIdx, setMotivIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMotivIdx(i => (i + 1) % MOTIVATIONS.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Animated counters for activity summary (totals across all children combined)
  const articlesRead = useAnimatedCounter(totalArticlesRead);
  const coursesJoined = useAnimatedCounter(totalCoursesEnrolled);
  const strategiesSaved = useAnimatedCounter(totalStrategiesSaved);

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Greeting ──────────────────────────────────────── */}
      <SectionCard>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy sm:text-[24px]">
              Selamat datang kembali! 👋
            </h2>
            <p
              key={motivIdx}
              className="mt-1 text-[15px] text-stv-body"
              style={{ animation: 'fadeInUp .4s ease-out both' }}
            >
              {MOTIVATIONS[motivIdx]}
            </p>
          </div>
          {/* Quick activity counts */}
          <div className="flex shrink-0 gap-4 text-center">
            <div>
              <div className="font-baloo text-[22px] font-extrabold text-amber-600">{articlesRead}</div>
              <div className="text-[11px] text-stv-muted">Artikel dibaca</div>
            </div>
            <div className="border-l border-amber-100 pl-4">
              <div className="font-baloo text-[22px] font-extrabold text-stv-sky-stroke">{coursesJoined}</div>
              <div className="text-[11px] text-stv-muted">Course diikuti</div>
            </div>
            <div className="border-l border-amber-100 pl-4">
              <div className="font-baloo text-[22px] font-extrabold text-stv-coral">{strategiesSaved}</div>
              <div className="text-[11px] text-stv-muted">Strategi disimpan</div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── 2. Kartu Anak ─────────────────────────────────────── */}
      <SectionCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-baloo text-[17px] font-bold text-stv-navy">Anak Saya</h3>
          {children.length > 0 && (
            <Link
              to="/dashboard/tier2/profil-anak"
              className="flex items-center gap-1 text-[13px] font-semibold text-amber-600 no-underline hover:underline"
            >
              Lihat profil lengkap <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {children.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-200 py-10 text-center">
            <Baby className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
            <p className="mt-3 text-[15px] font-semibold text-stv-navy">Belum ada profil anak</p>
            <p className="mt-1 max-w-[280px] text-[13px] text-stv-muted">
              Tambahkan profil anak supaya perjalanan belajarnya bisa terpantau di sini.
            </p>
            <Link
              to="/dashboard/tier2/profil-anak"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2 text-[14px] font-bold text-white no-underline transition hover:bg-amber-600"
            >
              <Plus className="h-4 w-4" />
              Tambahkan Profil Anak
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            {children.map(child => (
              <ChildCard
                key={child.id}
                name={child.name}
                age={child.age}
                styles={child.learningStyles}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── 3. Lanjutkan di mana Anda berhenti ───────────────── */}
      <SectionCard>
        <h3 className="mb-4 font-baloo text-[17px] font-bold text-stv-navy">Lanjutkan di Sini</h3>
        {totalArticlesRead === 0 && totalCoursesEnrolled === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-4 text-[14px] text-stv-muted">
            <BookOpen className="h-5 w-5 shrink-0 text-amber-400" strokeWidth={1.5} />
            <span>Mulai eksplorasi Resource Library atau Courses untuk melanjutkan dari sini.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <p className="col-span-full text-[13px] text-stv-muted">
              {totalArticlesRead} artikel dibaca · {totalCoursesEnrolled} course diikuti
            </p>
          </div>
        )}
      </SectionCard>

      {/* ── 4. Jalan Pintas ke Fitur ──────────────────────────── */}
      <div>
        <h3 className="mb-3 font-baloo text-[17px] font-bold text-stv-navy">Akses Cepat</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SHORTCUTS.map(({ to, icon: Icon, label, desc, bg, iconColor, ring }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col gap-3 rounded-2xl border p-4 no-underline transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(217,119,6,.15)] ${bg} ring-1 ${ring}`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ${iconColor}`}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <div className="font-baloo text-[14px] font-bold text-stv-navy">{label}</div>
                <div className="mt-0.5 text-[12px] leading-[1.4] text-stv-muted">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 5. Rekomendasi ────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 font-baloo text-[17px] font-bold text-stv-navy">Rekomendasi untuk Anda</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {RECOMMENDATIONS.map(rec => (
            <Link
              key={rec.id}
              to={rec.to}
              className="flex flex-col gap-3 rounded-2xl bg-white p-5 no-underline shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(217,119,6,.12)]"
            >
              <div className="flex items-center gap-2">
                {rec.type === 'webinar' ? (
                  <span className="rounded-full bg-stv-sky-tint px-2.5 py-0.5 text-[11px] font-bold text-stv-sky-stroke">
                    Webinar
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                    {rec.category}
                  </span>
                )}
              </div>
              <p className="flex-1 text-[14px] font-bold leading-[1.4] text-stv-navy">{rec.title}</p>
              <div className="flex items-center gap-1.5 text-[12px] text-stv-muted">
                <Clock className="h-3.5 w-3.5" />
                {rec.readTime}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 6. CTA Konsultasi ─────────────────────────────────── */}
      <div
        className="flex flex-col items-start gap-4 overflow-hidden rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)' }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Star className="h-6 w-6 text-white" fill="currentColor" strokeWidth={0} />
          </div>
          <div>
            <p className="font-baloo text-[16px] font-bold text-white">Butuh bantuan lebih lanjut?</p>
            <p className="mt-0.5 text-[13px] text-white/90">
              Pesan sesi konsultasi langsung dengan Psikolog Fitri Effendy.
            </p>
          </div>
        </div>
        <Link
          to="/dashboard/tier2/konsultasi"
          className="shrink-0 rounded-full bg-white px-6 py-2.5 font-baloo text-[14px] font-bold text-amber-600 no-underline transition hover:bg-amber-50"
        >
          Pesan Sekarang
        </Link>
      </div>
    </div>
  );
}
