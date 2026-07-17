import React from 'react';
import { Info, Users, CalendarDays, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDashboardTier1 } from './DashboardTier1Context';
import { IEP_STATUS_META, IEP_TERM_META } from './iepMeta';

export default function IEPTier1() {
  const { child, iep } = useDashboardTier1();

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">IEP (Individualized Education Program)</h2>
        <p className="text-[14px] text-stv-muted">Rencana belajar individual untuk {child.name}.</p>
      </div>

      {/* Apa itu IEP? */}
      <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-5">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div>
          <p className="font-baloo text-[14px] font-bold text-stv-navy">Apa itu IEP?</p>
          <p className="mt-1 text-[13px] leading-[1.65] text-stv-body">
            IEP adalah rencana belajar yang dirancang khusus untuk {child.name}, disusun bersama oleh guru, psikolog, dan terapis.
            IEP berisi tujuan belajar yang ingin dicapai serta strategi yang digunakan sekolah untuk membantu mencapainya.
            Halaman ini bersifat hanya-baca dan ditinjau ulang secara berkala bersama tim sekolah.
          </p>
        </div>
      </div>

      {/* Timeline Review */}
      <div className="animate-fade-in-up rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
          <CalendarDays className="h-4 w-4 text-blue-600" />
          Timeline Review
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-blue-50 p-3.5">
            <p className="text-[12px] text-stv-muted">Dibuat</p>
            <p className="mt-1 text-[14px] font-bold text-stv-navy">{new Date(iep.createdDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-3.5">
            <p className="text-[12px] text-stv-muted">Ditinjau Terakhir</p>
            <p className="mt-1 text-[14px] font-bold text-stv-navy">{new Date(iep.lastReviewDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-3.5">
            <p className="text-[12px] text-stv-muted">Tinjauan Berikutnya</p>
            <p className="mt-1 text-[14px] font-bold text-stv-navy">{new Date(iep.nextReviewDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Tim Penyusun */}
      <div className="animate-fade-in-up rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
          <Users className="h-4 w-4 text-blue-600" />
          Tim Penyusun
        </h3>
        <div className="mt-3 flex flex-col gap-2">
          {iep.team.map(member => (
            <div key={member.name} className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[12px] font-bold text-white">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-bold text-stv-navy">{member.name}</p>
                <p className="text-[12px] text-stv-muted">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tujuan & Progress */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
          <Target className="h-4 w-4 text-blue-600" />
          Tujuan & Progress
        </h3>
        <div className="flex flex-col gap-4">
          {iep.goals.map(goal => {
            const statusMeta = IEP_STATUS_META[goal.status];
            const termMeta = IEP_TERM_META[goal.term];
            return (
              <div key={goal.id} className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${termMeta.bg} ${termMeta.text}`}>{termMeta.label}</span>
                  <span className="w-fit rounded-full bg-stv-sky-tint px-2.5 py-0.5 text-[11px] font-bold text-stv-sky-stroke">{goal.areaFokus}</span>
                  <span className={`ml-auto flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusMeta.bg} ${statusMeta.text}`}>
                    {goal.status === 'perlu-perhatian' && <AlertTriangle className="h-3 w-3" />}
                    {goal.status === 'tercapai' && <CheckCircle2 className="h-3 w-3" />}
                    {statusMeta.label}
                  </span>
                </div>

                <p className="mt-3 font-baloo text-[15px] font-bold text-stv-navy">{goal.tujuan}</p>
                <p className="mt-1.5 text-[13px] leading-[1.6] text-stv-body"><strong className="text-stv-navy">Target Terukur:</strong> {goal.targetTerukur}</p>
                <p className="mt-1 text-[13px] leading-[1.6] text-stv-body"><strong className="text-stv-navy">Strategi:</strong> {goal.strategi}</p>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[12px] font-semibold text-stv-muted">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-stv-border">
                    <div
                      className={`h-full rounded-full ${statusMeta.bar} transition-all duration-700`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
