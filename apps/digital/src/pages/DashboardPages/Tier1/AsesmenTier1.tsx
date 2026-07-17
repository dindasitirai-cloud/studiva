import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, User, ArrowRight, CalendarDays } from 'lucide-react';
import { useDashboardTier1 } from './DashboardTier1Context';
import { scoreLevel, averageScore } from './assessmentMeta';

export default function AsesmenTier1() {
  const { assessments } = useDashboardTier1();

  const sorted = [...assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-6">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Asesmen</h2>
        <p className="text-[14px] text-stv-muted">Hasil asesmen awal dan berkala anak Anda dari guru & psikolog.</p>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-indigo-200 py-14 text-center">
          <ClipboardList className="h-10 w-10 text-indigo-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Belum ada hasil asesmen</p>
          <p className="mt-1 text-[13px] text-stv-muted">Hasil asesmen akan muncul di sini begitu tersedia.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map(a => {
            const avg = averageScore(a.areas);
            const level = scoreLevel(avg);
            return (
              <Link
                key={a.id}
                to={`/dashboard/tier1/asesmen/${a.id}`}
                className="animate-fade-in-up flex flex-col gap-3 rounded-2xl bg-white p-5 no-underline shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,58,107,.12)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-baloo text-[16px] font-bold text-stv-navy">{a.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-stv-muted">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{a.assessor} ({a.assessorRole})</span>
                    </div>
                  </div>
                  <span className={`w-fit shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${level.bg} ${level.text}`}>{level.label}</span>
                </div>

                <p className="text-[14px] leading-[1.6] text-stv-body">{a.summary}</p>

                <span className="flex items-center gap-1 text-[13px] font-semibold text-indigo-600">
                  Lihat detail lengkap <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
