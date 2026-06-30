import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, CalendarDays, ClipboardList, CheckCircle2 } from 'lucide-react';
import { useDashboardTier1 } from './DashboardTier1Context';
import { scoreLevel, averageScore } from './assessmentMeta';

export default function AssessmentDetailTier1() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assessments } = useDashboardTier1();

  const assessment = assessments.find(a => a.id === id);

  if (!assessment) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 text-center shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <ClipboardList className="h-10 w-10 text-indigo-300" strokeWidth={1.5} />
        <h2 className="font-baloo text-[20px] font-bold text-stv-navy">Asesmen tidak ditemukan</h2>
        <Link
          to="/dashboard/tier1/asesmen"
          className="rounded-full bg-indigo-500 px-5 py-2 text-[14px] font-bold text-white no-underline transition hover:bg-indigo-600"
        >
          Kembali ke Asesmen
        </Link>
      </div>
    );
  }

  const avg = averageScore(assessment.areas);
  const overallLevel = scoreLevel(avg);

  return (
    <div className="mx-auto max-w-[680px]">
      <button
        type="button"
        onClick={() => navigate('/dashboard/tier1/asesmen')}
        className="mb-5 flex items-center gap-1.5 text-[14px] font-semibold text-stv-muted transition hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Asesmen
      </button>

      {/* Header */}
      <div className="animate-fade-in-up rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-baloo text-[22px] font-extrabold leading-[1.3] text-stv-navy sm:text-[26px]">{assessment.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-stv-muted">
              <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{new Date(assessment.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{assessment.assessor} ({assessment.assessorRole})</span>
            </div>
          </div>
          <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-[12px] font-bold ${overallLevel.bg} ${overallLevel.text}`}>
            Rata-rata: {overallLevel.label}
          </span>
        </div>
        <p className="mt-4 text-[15px] leading-[1.75] text-stv-body">{assessment.summary}</p>
      </div>

      {/* Area yang Dinilai */}
      <div className="animate-fade-in-up mt-6 rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:p-8">
        <h3 className="font-baloo text-[17px] font-bold text-stv-navy">Area yang Dinilai</h3>
        <div className="mt-4 flex flex-col gap-5">
          {assessment.areas.map(area => {
            const level = scoreLevel(area.score);
            return (
              <div key={area.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[14px] font-semibold text-stv-navy">{area.name}</p>
                  <span className={`text-[12px] font-bold ${level.text}`}>{level.label}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-stv-border">
                  <div
                    className={`h-full rounded-full ${level.bar} transition-all duration-700`}
                    style={{ width: `${area.score}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[13px] leading-[1.6] text-stv-muted">{area.note}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rekomendasi */}
      <div className="animate-fade-in-up mt-6 rounded-2xl bg-indigo-50 p-6 sm:p-8">
        <h3 className="font-baloo text-[17px] font-bold text-stv-navy">Rekomendasi</h3>
        <ul className="mt-3 flex flex-col gap-2.5">
          {assessment.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-stv-body">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
