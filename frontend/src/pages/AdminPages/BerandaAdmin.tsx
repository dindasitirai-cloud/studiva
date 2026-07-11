import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserPlus, Video, CalendarCheck, MessageCircleWarning,
  BarChart3, GraduationCap, Lightbulb, ArrowRight,
} from 'lucide-react';
import { useAdmin, MEMBER_GROWTH } from './AdminContext';
import { useDashboardTier2 } from '../../context/DashboardTier2Context';
import { useAdminActionItems, AdminActionKind } from './useAdminActionItems';
import { ADMIN_COLORS } from './adminFeatureColors';

const ACTION_ICON: Record<AdminActionKind, typeof MessageCircleWarning> = {
  'forum-unanswered': MessageCircleWarning,
  'booking-new': CalendarCheck,
  'webinar-upcoming': Video,
};

function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // No "run once" guard on purpose - matches the identical hook in
    // BerandaTier2/KehadiranTier1, which explains why under React.StrictMode.
    if (target === 0) { setCount(0); return; }
    const steps = 24;
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

function KpiCard({ icon: Icon, value, label, colorKey }: { icon: typeof Users; value: number; label: string; colorKey: keyof typeof ADMIN_COLORS }) {
  const colors = ADMIN_COLORS[colorKey];
  const animated = useAnimatedCounter(value);
  return (
    <div className="animate-fade-in-up flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.bg}`}>
        <Icon className={`h-4 w-4 ${colors.text}`} strokeWidth={2} />
      </div>
      <div className="font-baloo text-[24px] font-extrabold text-stv-navy">{animated}</div>
      <div className="text-[12px] leading-[1.3] text-stv-muted">{label}</div>
    </div>
  );
}

const SHORTCUTS = [
  { to: '/admin/courses', label: 'Buat Course Baru', icon: GraduationCap, colorKey: 'courses' as const },
  { to: '/admin/strategies', label: 'Tambah Strategi', icon: Lightbulb, colorKey: 'strategies' as const },
  { to: '/admin/konsultasi', label: 'Atur Slot Konsultasi', icon: CalendarCheck, colorKey: 'konsultasi' as const },
];

export default function BerandaAdmin() {
  const { totalActiveMembers, newMembersThisMonth } = useAdmin();
  const { articles, courses, bookings } = useDashboardTier2();
  const actionItems = useAdminActionItems();

  const totalMateri = articles.length + courses.length;
  const upcomingWebinars = courses.filter(c => c.visibility === 'published' && c.type === 'webinar' && c.status === 'upcoming').length;
  const scheduledConsultations = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
  const unansweredForum = actionItems.filter(a => a.kind === 'forum-unanswered').length;

  const maxGrowth = Math.max(...MEMBER_GROWTH.map(m => m.count));

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Ringkasan Platform</h2>
        <p className="mt-1 text-[14px] text-stv-muted">Gambaran cepat kesehatan operasional Studiva hari ini.</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard icon={Users} value={totalActiveMembers} label="Anggota Aktif" colorKey="members" />
        <KpiCard icon={UserPlus} value={newMembersThisMonth} label="Langganan Baru Bulan Ini" colorKey="members" />
        <KpiCard icon={GraduationCap} value={totalMateri} label="Total Materi & Course" colorKey="courses" />
        <KpiCard icon={Video} value={upcomingWebinars} label="Webinar Mendatang" colorKey="courses" />
        <KpiCard icon={CalendarCheck} value={scheduledConsultations} label="Konsultasi Terjadwal" colorKey="konsultasi" />
        <KpiCard icon={MessageCircleWarning} value={unansweredForum} label="Komentar Perlu Ditanggapi" colorKey="forum" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Perlu Tindakan */}
        <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)] lg:col-span-2">
          <h3 className="font-baloo text-[16px] font-bold text-stv-navy">Perlu Tindakan Anda</h3>

          {actionItems.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CalendarCheck className="h-9 w-9 text-stv-green" strokeWidth={1.5} />
              <p className="mt-3 text-[14px] font-semibold text-stv-navy">Semua sudah ditangani</p>
              <p className="mt-1 text-[13px] text-stv-muted">Tidak ada to-do yang menunggu saat ini.</p>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {actionItems.map(item => {
                const Icon = ACTION_ICON[item.kind];
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 no-underline transition hover:bg-slate-100"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[13px] font-semibold text-stv-navy">{item.title}</span>
                      <span className="mt-0.5 block text-[12px] text-stv-body">{item.description}</span>
                    </span>
                    <ArrowRight className="mt-1.5 h-3.5 w-3.5 shrink-0 text-stv-muted" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Growth chart */}
        <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
          <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
            <BarChart3 className="h-4 w-4 text-stv-navy" />
            Pertumbuhan Anggota
          </h3>
          <div className="mt-5 flex h-32 items-end gap-2.5">
            {MEMBER_GROWTH.map(m => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-stv-navy to-stv-sky-stroke transition-all duration-700"
                  style={{ height: `${(m.count / maxGrowth) * 100}%` }}
                  title={`${m.count} anggota baru`}
                />
                <span className="text-[11px] text-stv-muted">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick shortcuts */}
      <div>
        <h3 className="mb-3 font-baloo text-[16px] font-bold text-stv-navy">Jalan Pintas</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SHORTCUTS.map(({ to, label, icon: Icon, colorKey }) => {
            const colors = ADMIN_COLORS[colorKey];
            return (
              <Link
                key={to}
                to={to}
                className="animate-fade-in-up flex flex-col gap-2 rounded-2xl bg-white p-4 no-underline shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,58,107,.12)]"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg}`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} strokeWidth={2} />
                </div>
                <p className="font-baloo text-[14px] font-bold text-stv-navy">{label}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
