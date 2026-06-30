import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CalendarCheck, TrendingUp, FolderOpen, FileText, Star, Smile, Meh, Frown,
  Sparkles, Image as ImageIcon, Video, Phone,
} from 'lucide-react';
import { useDashboardTier1, UpdateMood, AttendanceStatus } from './DashboardTier1Context';
import { FEATURE_COLORS } from './featureColors';
import { CATEGORY_META } from './updateCategoryMeta';

const MOOD_ICON: Record<UpdateMood, typeof Star> = { great: Star, good: Smile, ok: Meh, challenging: Frown };
const MOOD_COLOR: Record<UpdateMood, string> = {
  great: 'text-stv-green', good: 'text-stv-sky-stroke', ok: 'text-orange-500', challenging: 'text-red-500',
};

const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alfa: 'Alfa',
};
const ATTENDANCE_STYLE: Record<AttendanceStatus, string> = {
  hadir: 'bg-stv-green-tint text-stv-green',
  izin: 'bg-yellow-100 text-yellow-700',
  sakit: 'bg-orange-100 text-orange-700',
  alfa: 'bg-red-100 text-red-600',
};

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`animate-fade-in-up rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

const SHORTCUTS = [
  { key: 'perkembangan' as const, to: '/dashboard/tier1/perkembangan', label: 'Perkembangan Harian', desc: 'Catatan terbaru dari guru', icon: TrendingUp },
  { key: 'kehadiran' as const, to: '/dashboard/tier1/kehadiran', label: 'Kehadiran', desc: 'Kalender & statistik bulanan', icon: CalendarCheck },
  { key: 'portfolio' as const, to: '/dashboard/tier1/portfolio', label: 'Portfolio', desc: 'Galeri karya & video anak', icon: FolderOpen },
  { key: 'iep' as const, to: '/dashboard/tier1/iep', label: 'IEP', desc: 'Tujuan & progress belajar', icon: FileText },
];

export default function BerandaTier1() {
  const { child, latestUpdate, todayAttendance, portfolioItems } = useDashboardTier1();
  const MoodIcon = latestUpdate?.mood ? MOOD_ICON[latestUpdate.mood] : null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Greeting + Kartu Anak ─────────────────────────── */}
      <SectionCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy sm:text-[24px]">Selamat datang kembali! 👋</h2>
            <p className="mt-1 text-[15px] text-stv-body">Berikut perkembangan {child.name} di Sekolah Studiva.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl bg-stv-sky-tint p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-stv-sky-stroke font-baloo text-[22px] font-bold text-white">
            {child.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-baloo text-[17px] font-bold text-stv-navy">{child.name}</div>
            <div className="text-[13px] text-stv-muted">{child.age} tahun &middot; {child.kelas}</div>
            <div className="mt-1 text-[13px] text-stv-body">Wali Kelas: <strong className="text-stv-navy">{child.waliKelas}</strong></div>
          </div>
          <Link
            to="/dashboard/tier1/profil-anak"
            className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-stv-sky-stroke no-underline hover:underline"
          >
            Lihat profil lengkap <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </SectionCard>

      {/* ── 2. Update Hari Ini dari Guru ─────────────────────── */}
      <SectionCard className="border-2 border-stv-sky-tint">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-stv-sky-stroke" />
          <h3 className="font-baloo text-[17px] font-bold text-stv-navy">Update Hari Ini dari Guru</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-stv-sky-tint/60 p-4">
            <p className="text-[12px] font-semibold text-stv-muted">Catatan Perkembangan Terbaru</p>
            {latestUpdate ? (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-stv-sky-stroke">
                    {CATEGORY_META[latestUpdate.category].label}
                  </span>
                  {MoodIcon && <MoodIcon className={`h-4 w-4 ${MOOD_COLOR[latestUpdate.mood!]}`} />}
                </div>
                <p className="mt-2 text-[14px] leading-[1.6] text-stv-body">{latestUpdate.note}</p>
                <p className="mt-2 text-[12px] text-stv-muted">— {latestUpdate.teacherName}</p>
              </>
            ) : (
              <p className="mt-2 text-[14px] text-stv-muted">Belum ada catatan dari guru.</p>
            )}
          </div>

          <div className="rounded-xl bg-stv-sky-tint/60 p-4">
            <p className="text-[12px] font-semibold text-stv-muted">Status Kehadiran Hari Ini</p>
            {todayAttendance ? (
              <span className={`mt-2 inline-block w-fit rounded-full px-3 py-1 text-[13px] font-bold ${ATTENDANCE_STYLE[todayAttendance.status]}`}>
                {ATTENDANCE_LABEL[todayAttendance.status]}
              </span>
            ) : (
              <p className="mt-2 text-[14px] text-stv-muted">Belum ada data kehadiran hari ini.</p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── 3. Jalan Pintas ───────────────────────────────────── */}
      <div>
        <h3 className="mb-3 font-baloo text-[17px] font-bold text-stv-navy">Jalan Pintas</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SHORTCUTS.map(({ key, to, label, desc, icon: Icon }) => {
            const colors = FEATURE_COLORS[key];
            return (
              <Link
                key={to}
                to={to}
                className={`animate-fade-in-up flex flex-col gap-2 rounded-2xl bg-white p-4 no-underline shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,58,107,.12)]`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg}`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-baloo text-[14px] font-bold text-stv-navy">{label}</p>
                  <p className="mt-0.5 text-[12px] text-stv-muted">{desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 4. Karya Terbaru ──────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-baloo text-[17px] font-bold text-stv-navy">Karya Terbaru</h3>
          <Link to="/dashboard/tier1/portfolio" className="flex items-center gap-1 text-[13px] font-semibold text-purple-600 no-underline hover:underline">
            Lihat semua <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {portfolioItems.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-purple-200 py-10 text-center">
            <FolderOpen className="h-10 w-10 text-purple-300" strokeWidth={1.5} />
            <p className="mt-3 text-[13px] text-stv-muted">Belum ada karya yang diunggah.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {portfolioItems.slice(0, 3).map(item => (
              <Link
                key={item.id}
                to="/dashboard/tier1/portfolio"
                className="animate-fade-in-up overflow-hidden rounded-2xl bg-white no-underline shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,58,107,.12)]"
              >
                <div className="flex h-28 items-center justify-center" style={{ backgroundColor: `${item.thumbnailColor}33` }}>
                  {item.mediaType === 'video' ? (
                    <Video className="h-8 w-8" style={{ color: item.thumbnailColor }} />
                  ) : (
                    <ImageIcon className="h-8 w-8" style={{ color: item.thumbnailColor }} />
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate font-baloo text-[13px] font-bold text-stv-navy">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-stv-muted">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── 5. CTA Studiva Digital ────────────────────────────── */}
      <div
        className="flex flex-col items-start gap-4 overflow-hidden rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)' }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-baloo text-[16px] font-bold text-white">Nilai Tambah: Studiva Digital</p>
            <p className="mt-0.5 text-[13px] text-white/90">Akses materi belajar, komunitas orang tua, dan konsultasi psikolog langsung dari akun Anda.</p>
          </div>
        </div>
        <Link
          to="/dashboard/tier1/resources"
          className="shrink-0 rounded-full bg-white px-6 py-2.5 font-baloo text-[14px] font-bold text-amber-600 no-underline transition hover:bg-amber-50"
        >
          Jelajahi Sekarang
        </Link>
      </div>
    </div>
  );
}
