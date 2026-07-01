import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Library, GraduationCap, Lightbulb, CalendarCheck, Baby, Plus, ArrowRight,
  BookOpen, Star, Clock, Sparkles, TrendingUp, Zap,
} from 'lucide-react';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';

// ---------------------------------------------------------------------------
// Rotating motivational greeting messages
// ---------------------------------------------------------------------------
const MOTIVATIONS = [
  'Semangat terus dalam mendampingi si kecil!',
  'Setiap langkah kecil itu berarti.',
  'Anda tidak sendirian dalam perjalanan ini.',
  'Belajar bersama, tumbuh bersama.',
  'Anda adalah pengajar pertama dan terbaik anak Anda.',
];

// ---------------------------------------------------------------------------
// Shortcut cards (more vivid colors)
// ---------------------------------------------------------------------------
const SHORTCUTS = [
  {
    to: '/dashboard/tier2/resources',
    icon: Library,
    label: 'Resource Library',
    desc: 'Rangkuman materi pendidikan anak',
    gradient: 'from-amber-400 to-orange-500',
    iconBg: 'bg-white/20',
    emoji: '📚',
  },
  {
    to: '/dashboard/tier2/courses',
    icon: GraduationCap,
    label: 'Courses & Webinar',
    desc: 'Kelas live & video rekaman psikolog',
    gradient: 'from-sky-400 to-blue-600',
    iconBg: 'bg-white/20',
    emoji: '🎓',
  },
  {
    to: '/dashboard/tier2/strategies',
    icon: Lightbulb,
    label: 'Learning Strategies',
    desc: 'Tips & aktivitas edukatif di rumah',
    gradient: 'from-emerald-400 to-teal-600',
    iconBg: 'bg-white/20',
    emoji: '💡',
  },
  {
    to: '/dashboard/tier2/konsultasi',
    icon: CalendarCheck,
    label: 'Konsultasi',
    desc: 'Booking sesi dengan psikolog',
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-white/20',
    emoji: '🧠',
  },
];

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------
const RECOMMENDATIONS = [
  {
    id: 'rec-1',
    type: 'article' as const,
    title: 'Mengenal Gaya Belajar Visual pada Anak',
    category: 'Gaya Belajar',
    readTime: '5 menit',
    to: '/dashboard/tier2/resources',
    accent: 'from-amber-400 to-orange-400',
    emoji: '👁️',
  },
  {
    id: 'rec-2',
    type: 'article' as const,
    title: 'Strategi Komunikasi Positif dengan Anak Sensorik',
    category: 'Komunikasi',
    readTime: '7 menit',
    to: '/dashboard/tier2/resources',
    accent: 'from-emerald-400 to-teal-500',
    emoji: '💬',
  },
  {
    id: 'rec-3',
    type: 'webinar' as const,
    title: 'Live Webinar: Mendampingi Anak dengan ADHD',
    category: 'Webinar',
    readTime: '60 menit',
    to: '/dashboard/tier2/courses',
    accent: 'from-sky-400 to-blue-500',
    emoji: '🎤',
  },
];

// ---------------------------------------------------------------------------
// Animated counter
// ---------------------------------------------------------------------------
function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
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
// Main Beranda component
// ---------------------------------------------------------------------------
export default function BerandaTier2() {
  const { children, totalArticlesRead, totalCoursesEnrolled, totalStrategiesSaved } = useDashboardTier2();

  const [motivIdx, setMotivIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMotivIdx(i => (i + 1) % MOTIVATIONS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const articlesRead = useAnimatedCounter(totalArticlesRead);
  const coursesJoined = useAnimatedCounter(totalCoursesEnrolled);
  const strategiesSaved = useAnimatedCounter(totalStrategiesSaved);

  return (
    <div className="flex flex-col gap-5">

      {/* ── 1. Greeting — gradient hero card ─────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stv-navy via-[#1a3f6f] to-[#0d2a4d] p-6 sm:p-8">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-6 left-12 h-24 w-24 rounded-full bg-sky-400/20 blur-2xl" />
        <Sparkles className="absolute right-6 top-6 h-5 w-5 text-amber-300/60" fill="currentColor" strokeWidth={0} />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-[12px] font-bold text-amber-200">Studiva Digital</span>
            </div>
            <h2 className="font-baloo text-[24px] font-extrabold text-white sm:text-[28px]">
              Selamat datang kembali! 👋
            </h2>
            <p
              key={motivIdx}
              className="mt-1.5 text-[15px] text-white/70"
              style={{ animation: 'fadeInUp .4s ease-out both' }}
            >
              {MOTIVATIONS[motivIdx]}
            </p>
          </div>

          {/* Stats chips */}
          <div className="flex gap-3 sm:flex-col sm:items-end sm:gap-2">
            {[
              { value: articlesRead,     label: 'Artikel', color: 'text-amber-300',  bg: 'bg-amber-400/15'  },
              { value: coursesJoined,    label: 'Courses', color: 'text-sky-300',    bg: 'bg-sky-400/15'    },
              { value: strategiesSaved,  label: 'Strategi', color: 'text-emerald-300', bg: 'bg-emerald-400/15' },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-2 rounded-full ${s.bg} px-3 py-1.5`}>
                <span className={`font-baloo text-[18px] font-extrabold ${s.color}`}>{s.value}</span>
                <span className="text-[12px] text-white/60">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Kartu Anak ─────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400">
              <Baby className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-baloo text-[17px] font-bold text-stv-navy">Anak Saya</h3>
          </div>
          {children.length > 0 && (
            <Link to="/dashboard/tier2/profil-anak" className="flex items-center gap-1 text-[13px] font-semibold text-amber-600 no-underline hover:underline">
              Profil lengkap <ArrowRight className="h-3.5 w-3.5" />
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
            <Link to="/dashboard/tier2/profil-anak" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2 text-[14px] font-bold text-white no-underline transition hover:bg-amber-600">
              <Plus className="h-4 w-4" />
              Tambahkan Profil Anak
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {children.map(child => (
              <div key={child.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(217,119,6,.10)]">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 font-baloo text-[22px] font-bold text-white shadow-[0_4px_12px_rgba(251,146,60,.4)]">
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-stv-navy">{child.name}</div>
                  <div className="text-[13px] text-stv-muted">{child.age} tahun</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {child.learningStyles.map(s => (
                      <span key={s} className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Akses Cepat — gradient shortcut cards ──────────── */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-baloo text-[17px] font-bold text-stv-navy">
          <TrendingUp className="h-5 w-5 text-amber-500" />
          Akses Cepat
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SHORTCUTS.map(({ to, icon: Icon, label, desc, gradient, emoji }) => (
            <Link
              key={to}
              to={to}
              className={`group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 no-underline shadow-[0_8px_24px_rgba(0,0,0,.12)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,.18)]`}
            >
              {/* background decoration */}
              <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10" />
              <div className="text-[28px] leading-none">{emoji}</div>
              <div className="mt-auto pt-3">
                <div className="font-baloo text-[14px] font-bold text-white">{label}</div>
                <div className="mt-0.5 text-[11px] leading-[1.4] text-white/75">{desc}</div>
              </div>
              <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-white/50 transition group-hover:text-white/90 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── 4. Lanjutkan di mana Anda berhenti ───────────────── */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:p-6">
        <h3 className="mb-4 font-baloo text-[17px] font-bold text-stv-navy">Lanjutkan di Sini</h3>
        {totalArticlesRead === 0 && totalCoursesEnrolled === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-4 text-[14px] text-stv-muted">
            <BookOpen className="h-5 w-5 shrink-0 text-amber-400" strokeWidth={1.5} />
            <span>Mulai eksplorasi Resource Library atau Courses untuk melanjutkan dari sini.</span>
          </div>
        ) : (
          <div className="rounded-xl bg-gradient-to-r from-stv-sky-tint to-blue-50 px-4 py-3 text-[14px] text-stv-body">
            <span className="font-semibold text-stv-navy">{articlesRead} artikel</span> dibaca &middot;{' '}
            <span className="font-semibold text-stv-navy">{coursesJoined} course</span> diikuti &middot;{' '}
            <span className="font-semibold text-stv-navy">{strategiesSaved} strategi</span> disimpan
          </div>
        )}
      </div>

      {/* ── 5. Rekomendasi ────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-baloo text-[17px] font-bold text-stv-navy">
          <Sparkles className="h-5 w-5 text-violet-500" />
          Rekomendasi untuk Anda
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {RECOMMENDATIONS.map(rec => (
            <Link
              key={rec.id}
              to={rec.to}
              className="group flex flex-col gap-3 overflow-hidden rounded-2xl bg-white no-underline shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(16,58,107,.12)]"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${rec.accent}`} />
              <div className="flex flex-col gap-2 px-5 pb-5">
                <div className="flex items-center gap-2">
                  <span className="text-[20px]">{rec.emoji}</span>
                  {rec.type === 'webinar' ? (
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-700">Webinar</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">{rec.category}</span>
                  )}
                </div>
                <p className="flex-1 text-[14px] font-bold leading-[1.4] text-stv-navy">{rec.title}</p>
                <div className="flex items-center gap-1.5 text-[12px] text-stv-muted">
                  <Clock className="h-3.5 w-3.5" />
                  {rec.readTime}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 6. CTA Konsultasi — colorful gradient banner ──────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-4 left-20 h-16 w-16 rounded-full bg-white/10" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Star className="h-6 w-6 text-white" fill="currentColor" strokeWidth={0} />
            </div>
            <div>
              <p className="font-baloo text-[17px] font-bold text-white">Butuh bantuan lebih lanjut?</p>
              <p className="mt-0.5 text-[13px] text-white/80">
                Pesan sesi konsultasi langsung dengan Psikolog Fitri Effendy.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/tier2/konsultasi"
            className="shrink-0 rounded-full bg-white px-6 py-2.5 font-baloo text-[14px] font-bold text-violet-600 no-underline shadow-[0_4px_16px_rgba(0,0,0,.15)] transition hover:scale-105"
          >
            Pesan Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
