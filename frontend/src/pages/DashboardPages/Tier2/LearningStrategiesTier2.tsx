import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Star, CheckCircle2, Download, ShoppingBag,
  Dumbbell, X, FlaskConical, Clock,
  Wrench, FileDown, Calendar, ChevronRight, Check,
  User, LayoutGrid, Sparkles,
} from 'lucide-react';
import {
  ACTIVITIES, WEEKLY_PLANS, EDU_TOOLS, DOWNLOADABLES,
  DOMAIN_META, AGE_RANGES,
  Activity, WeeklyPlan, EduTool, Downloadable, DomainKey,
} from '../../../data/learningStrategies';
import { useLearningStrategies } from '../../../context/LearningStrategiesContext';
import { useDashboardTier2, ChildProfile } from '../../../context/DashboardTier2Context';

// ── helpers ─────────────────────────────────────────────────────────────────

function ageLabel(minBulan: number, maxBulan: number): string {
  const fmt = (m: number) => m >= 12 ? `${Math.floor(m / 12)} thn` : `${m} bln`;
  return `${fmt(minBulan)} - ${fmt(maxBulan)}`;
}

function matchesAge(minBulan: number, maxBulan: number, filterAgeId: string): boolean {
  if (filterAgeId === 'all') return true;
  const range = AGE_RANGES.find(r => r.id === filterAgeId);
  if (!range) return true;
  return minBulan < range.max && maxBulan > range.min;
}

function childAgeInMonths(child: ChildProfile): number {
  // child.age is stored in years; convert to months for strategy matching
  return child.age * 12; // TODO: use precise birthdate from backend
}

function bestAgeRangeId(ageMonths: number): string {
  const range = AGE_RANGES.find(r => ageMonths >= r.min && ageMonths < r.max);
  return range?.id ?? AGE_RANGES[AGE_RANGES.length - 1].id;
}

function matchesAgeMonths(minBulan: number, maxBulan: number, ageMonths: number): boolean {
  return ageMonths >= minBulan && ageMonths < maxBulan;
}

function activityAgeMonthRange(ageId: string): { min: number; max: number } {
  const range = AGE_RANGES.find(r => r.id === ageId);
  return { min: range?.min ?? 0, max: range?.max ?? 72 };
}

// ── SciBox ───────────────────────────────────────────────────────────────────

function SciBox({ sci, sumber }: { sci: string; sumber: string }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
      <div className="flex gap-2">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" strokeWidth={1.5} />
        <div>
          <p className="text-[12px] leading-[1.6] text-blue-800">{sci}</p>
          <p className="mt-1 text-[11px] text-blue-500"><span className="font-semibold">Sumber:</span> {sumber}</p>
        </div>
      </div>
    </div>
  );
}

// ── DomainBadge ──────────────────────────────────────────────────────────────

function DomainBadge({ domain }: { domain: DomainKey }) {
  const meta = DOMAIN_META[domain];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
      style={{ background: meta.bg, color: meta.color }}>
      {meta.emoji} {meta.label}
    </span>
  );
}

// ── AgePill ──────────────────────────────────────────────────────────────────

function AgePill({ ageId }: { ageId: string }) {
  const range = AGE_RANGES.find(r => r.id === ageId);
  return (
    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
      {range?.label ?? ageId}
    </span>
  );
}

// ── ActivityCard ──────────────────────────────────────────────────────────────

function ActivityCard({ activity, onOpen }: { activity: Activity; onOpen: () => void }) {
  const { toggleSaved, isSaved, toggleDone, isDone } = useLearningStrategies();
  const saved = isSaved('activities', activity.id);
  const done = isDone(activity.id);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(16,58,107,.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(217,119,6,.12)]">
      {/* Color header */}
      <button type="button" onClick={onOpen} className="relative focus:outline-none">
        <div className="flex h-24 items-center justify-center gap-3 px-4"
          style={{ background: DOMAIN_META[activity.domain[0]].bg }}>
          <span className="text-4xl">{activity.icon}</span>
        </div>
        {done && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            <Check className="h-3 w-3" /> Sudah Dicoba
          </span>
        )}
      </button>

      {/* Body */}
      <button type="button" onClick={onOpen} className="flex flex-1 flex-col gap-2 p-3 text-left focus:outline-none">
        <div className="flex flex-wrap gap-1">
          <AgePill ageId={activity.ageId} />
          {activity.domain.map(d => <DomainBadge key={d} domain={d} />)}
        </div>
        <p className="font-baloo text-[15px] font-bold leading-tight text-stv-navy">{activity.judul}</p>
        <p className="line-clamp-2 text-[12px] leading-relaxed text-stv-muted">{activity.deskripsi}</p>

        <div className="mt-auto flex items-center gap-3 pt-1 text-[11px] text-stv-muted">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{activity.durasiMenit} mnt</span>
          {activity.isDIY && <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">DIY</span>}
        </div>

        {/* Sci box */}
        <div className="mt-1 rounded-lg border border-blue-100 bg-blue-50 p-2">
          <div className="flex gap-1.5">
            <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" strokeWidth={1.5} />
            <p className="line-clamp-2 text-[11px] leading-relaxed text-blue-700">{activity.sci}</p>
          </div>
        </div>
      </button>

      {/* Action bar */}
      <div className="flex items-center gap-1 border-t border-slate-100 px-3 py-2">
        <button type="button"
          onClick={e => { e.stopPropagation(); toggleDone(activity.id); }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-[11px] font-semibold transition ${
            done ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'text-stv-muted hover:bg-slate-50 hover:text-green-600'
          }`}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          {done ? 'Sudah Dicoba' : 'Tandai Dicoba'}
        </button>
        <div className="h-4 w-px bg-slate-100" />
        <button type="button"
          onClick={e => { e.stopPropagation(); toggleSaved('activities', activity.id); }}
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
            saved ? 'text-amber-500' : 'text-stv-muted hover:text-amber-500'
          }`}>
          <Star className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ── PlanCard ──────────────────────────────────────────────────────────────────

function PlanCard({ plan, onOpen }: { plan: WeeklyPlan; onOpen: () => void }) {
  const { toggleSaved, isSaved, getPlanProgress } = useLearningStrategies();
  const saved = isSaved('plans', plan.id);
  const progress = getPlanProgress(plan.id);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_12px_rgba(16,58,107,.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(217,119,6,.10)]">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-2xl">
          {plan.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-baloo text-[15px] font-bold leading-tight text-stv-navy">{plan.judul}</p>
            <button type="button"
              onClick={e => { e.stopPropagation(); toggleSaved('plans', plan.id); }}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
                saved ? 'text-amber-500' : 'text-stv-muted hover:text-amber-500'
              }`}>
              <Star className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} strokeWidth={2} />
            </button>
          </div>
          <span className="text-[11px] font-semibold text-amber-600">{plan.ageLabel}</span>
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-stv-muted">{plan.deskripsi}</p>

      {/* 7-day progress */}
      <div>
        <div className="mb-2 flex items-center justify-between text-[11px] text-stv-muted">
          <span className="font-semibold">Progress</span>
          <span>{progress}/7 hari</span>
        </div>
        <div className="flex gap-1.5">
          {plan.hari.map((h, i) => {
            // We'd need per-day status but keep it simple with progress count
            const done = i < progress;
            return (
              <div key={i}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition ${
                  done ? 'bg-green-500 text-white' : 'bg-slate-100 text-stv-muted'
                }`}>
                H{i + 1}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-2">
        <div className="flex gap-1.5">
          <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" strokeWidth={1.5} />
          <p className="line-clamp-2 text-[11px] leading-relaxed text-blue-700">{plan.sci}</p>
        </div>
      </div>

      <button type="button" onClick={onOpen}
        className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-amber-50 py-2 text-[13px] font-semibold text-amber-700 transition hover:bg-amber-100">
        Lihat Program <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── ToolCard ──────────────────────────────────────────────────────────────────

function ToolCard({ tool, onOpen }: { tool: EduTool; onOpen: () => void }) {
  const { toggleSaved, isSaved, toggleOwned, isOwned } = useLearningStrategies();
  const saved = isSaved('tools', tool.id);
  const owned = isOwned(tool.id);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_12px_rgba(16,58,107,.06)] transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl">
          {tool.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-baloo text-[14px] font-bold leading-tight text-stv-navy">{tool.nama}</p>
              {tool.pilihanPsikolog && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600">
                  ⭐ Pilihan Psikolog
                </span>
              )}
            </div>
            <button type="button"
              onClick={e => { e.stopPropagation(); toggleSaved('tools', tool.id); }}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition ${
                saved ? 'text-amber-500' : 'text-stv-muted hover:text-amber-500'
              }`}>
              <Star className="h-3.5 w-3.5" fill={saved ? 'currentColor' : 'none'} strokeWidth={2} />
            </button>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stv-muted">
            <span>{tool.ageLabel}</span>
            <span className="font-semibold text-stv-body">{tool.hargaEstimasi}</span>
          </div>
        </div>
      </div>

      <p className="text-[12px] leading-relaxed text-stv-muted">{tool.deskripsi}</p>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-2">
        <div className="flex gap-1.5">
          <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" strokeWidth={1.5} />
          <p className="line-clamp-2 text-[11px] leading-relaxed text-blue-700">{tool.sci}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onOpen}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-amber-200 py-2 text-[12px] font-semibold text-amber-700 transition hover:bg-amber-50">
          Detail
        </button>
        <button type="button"
          onClick={e => { e.stopPropagation(); toggleOwned(tool.id); }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold transition ${
            owned
              ? 'bg-green-50 text-green-600 hover:bg-green-100'
              : 'bg-slate-50 text-stv-body hover:bg-slate-100'
          }`}>
          {owned ? <><Check className="h-3.5 w-3.5" /> Punya</> : 'Tandai Punya'}
        </button>
      </div>
    </div>
  );
}

// ── DownloadCard ─────────────────────────────────────────────────────────────

function DownloadCard({ item, onOpen }: { item: Downloadable; onOpen: () => void }) {
  const { toggleSaved, isSaved, toggleDownloaded, isDownloaded } = useLearningStrategies();
  const saved = isSaved('downloads', item.id);
  const downloaded = isDownloaded(item.id);

  const kategoriColor: Record<string, string> = {
    'Buku Cerita': 'bg-rose-50 text-rose-600',
    'Flashcard': 'bg-blue-50 text-blue-600',
    'Worksheet': 'bg-violet-50 text-violet-600',
    'Checklist': 'bg-green-50 text-green-600',
    'Panduan': 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_12px_rgba(16,58,107,.06)] transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl">
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${kategoriColor[item.kategori] ?? 'bg-slate-100 text-slate-600'}`}>
                {item.kategori}
              </span>
              <p className="mt-1 font-baloo text-[14px] font-bold leading-tight text-stv-navy">{item.nama}</p>
            </div>
            <button type="button"
              onClick={e => { e.stopPropagation(); toggleSaved('downloads', item.id); }}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition ${
                saved ? 'text-amber-500' : 'text-stv-muted hover:text-amber-500'
              }`}>
              <Star className="h-3.5 w-3.5" fill={saved ? 'currentColor' : 'none'} strokeWidth={2} />
            </button>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stv-muted">
            <span>{ageLabel(item.minBulan, item.maxBulan)}</span>
            <span>{item.halaman}</span>
            <span>{item.jumlahUnduhan.toLocaleString('id')} unduhan</span>
          </div>
        </div>
      </div>

      <p className="text-[12px] leading-relaxed text-stv-muted">{item.deskripsi}</p>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-2">
        <div className="flex gap-1.5">
          <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" strokeWidth={1.5} />
          <p className="line-clamp-2 text-[11px] leading-relaxed text-blue-700">{item.sci}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onOpen}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-[12px] font-semibold text-stv-body transition hover:bg-slate-50">
          Detail
        </button>
        <button type="button"
          onClick={e => {
            e.stopPropagation();
            toggleDownloaded(item.id);
            // TODO: trigger actual file download when backend ready
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold transition ${
            downloaded
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}>
          <Download className="h-3.5 w-3.5" />
          {downloaded ? 'Diunduh' : 'Unduh'}
        </button>
      </div>
    </div>
  );
}

// ── ActivityModal ─────────────────────────────────────────────────────────────

function ActivityModal({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const { toggleSaved, isSaved, toggleDone, isDone } = useLearningStrategies();
  const saved = isSaved('activities', activity.id);
  const done = isDone(activity.id);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 pb-4" style={{ background: DOMAIN_META[activity.domain[0]].bg }}>
          <span className="text-4xl">{activity.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1 mb-1">
              <AgePill ageId={activity.ageId} />
              {activity.domain.map(d => <DomainBadge key={d} domain={d} />)}
            </div>
            <h2 className="font-baloo text-[18px] font-bold leading-tight text-stv-navy">{activity.judul}</h2>
            <div className="mt-1 flex items-center gap-3 text-[12px] text-stv-muted">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{activity.durasiMenit} menit</span>
              {activity.isDIY && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">DIY - tanpa alat khusus</span>}
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-stv-body hover:bg-white transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Sci callout */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="mb-1 flex items-center gap-1.5 text-[12px] font-bold text-blue-700">
              <FlaskConical className="h-3.5 w-3.5" /> Kenapa ini bermanfaat?
            </p>
            <p className="text-[13px] leading-relaxed text-blue-800">{activity.sci}</p>
            <p className="mt-2 text-[11px] text-blue-500"><span className="font-semibold">Sumber:</span> {activity.sumber}</p>
          </div>

          {/* Tujuan */}
          <div>
            <p className="mb-1 text-[12px] font-bold text-stv-navy">Tujuan</p>
            <p className="text-[13px] leading-relaxed text-stv-body">{activity.tujuan}</p>
          </div>

          {/* Bahan */}
          {activity.bahan.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] font-bold text-stv-navy">Yang Dibutuhkan</p>
              <ul className="space-y-1">
                {activity.bahan.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px] text-stv-body">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    {b.nama}
                    {b.affiliateUrl && b.affiliateUrl !== '#todo' && (
                      <a href={b.affiliateUrl} target="_blank" rel="noopener noreferrer"
                        className="ml-auto text-[11px] font-semibold text-amber-600 hover:underline">
                        Beli online
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Langkah */}
          <div>
            <p className="mb-2 text-[12px] font-bold text-stv-navy">Cara Melakukan</p>
            <ol className="space-y-2">
              {activity.langkah.map((step, i) => (
                <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-stv-body">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Variasi */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-green-50 p-3">
              <p className="mb-1 text-[11px] font-bold text-green-700">Lebih Mudah</p>
              <p className="text-[12px] leading-relaxed text-green-800">{activity.variasiMudah}</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-3">
              <p className="mb-1 text-[11px] font-bold text-orange-700">Lebih Menantang</p>
              <p className="text-[12px] leading-relaxed text-orange-800">{activity.variasiMenantang}</p>
            </div>
          </div>

          {/* ABK */}
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
            <p className="mb-1 text-[11px] font-bold text-violet-700">Adaptasi untuk Anak dengan Kebutuhan Khusus</p>
            <p className="text-[12px] leading-relaxed text-violet-800">{activity.adaptasiABK}</p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-slate-100 p-4 flex gap-3">
          <button type="button"
            onClick={() => toggleSaved('activities', activity.id)}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition ${
              saved ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-stv-body hover:border-amber-300'
            }`}>
            <Star className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
            {saved ? 'Disimpan' : 'Simpan'}
          </button>
          <button type="button"
            onClick={() => toggleDone(activity.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-semibold transition ${
              done ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}>
            <CheckCircle2 className="h-4 w-4" />
            {done ? 'Sudah Dicoba!' : 'Tandai Sudah Dicoba'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PlanModal ─────────────────────────────────────────────────────────────────

function PlanModal({ plan, onClose }: { plan: WeeklyPlan; onClose: () => void }) {
  const { toggleSaved, isSaved, togglePlanDay, isPlanDayDone, getPlanProgress, followPlan, unfollowPlan, isFollowing } = useLearningStrategies();
  const saved = isSaved('plans', plan.id);
  const progress = getPlanProgress(plan.id);
  const following = isFollowing(plan.id);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-[slideUp_0.3s_ease-out]">
        <div className="flex items-start gap-3 bg-amber-50 p-5 pb-4">
          <span className="text-3xl">{plan.icon}</span>
          <div className="flex-1">
            <span className="text-[11px] font-bold text-amber-600">{plan.ageLabel}</span>
            <h2 className="font-baloo text-[18px] font-bold leading-tight text-stv-navy">{plan.judul}</h2>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 hover:bg-white transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <SciBox sci={plan.sci} sumber={plan.sumber} />

          <div>
            <p className="mb-1 text-[12px] font-bold text-stv-navy">Cara Menggunakan Program Ini</p>
            <p className="text-[13px] leading-relaxed text-stv-body">{plan.caraPakai}</p>
          </div>

          {/* Progress bar */}
          <div>
            <div className="mb-2 flex items-center justify-between text-[12px]">
              <span className="font-bold text-stv-navy">Progress Minggu Ini</span>
              <span className="font-semibold text-amber-600">{progress}/7 hari</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-amber-400 transition-all duration-500"
                style={{ width: `${(progress / 7) * 100}%` }} />
            </div>
          </div>

          {/* Day cards */}
          <div className="space-y-2">
            {plan.hari.map((h, i) => {
              const done = isPlanDayDone(plan.id, i);
              return (
                <div key={i} className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                  done ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-white'
                }`}>
                  <button type="button"
                    onClick={() => togglePlanDay(plan.id, i)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      done ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 bg-white text-transparent hover:border-amber-400'
                    }`}>
                    <Check className="h-4 w-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[13px] ${done ? 'text-green-700 line-through' : 'text-stv-navy'}`}>
                      {h.judul}
                    </p>
                    <p className="text-[12px] text-stv-muted">{h.deskripsi}</p>
                    {h.activityIds.length > 0 && (
                      <p className="mt-1 text-[11px] text-amber-600 font-semibold">
                        {h.activityIds.length} aktivitas terkait
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 p-4 flex flex-col gap-2">
          {/* Ikuti Program button */}
          <button type="button"
            onClick={() => { following ? unfollowPlan() : followPlan(plan.id); }}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition ${
              following
                ? 'border-2 border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                : 'bg-stv-navy text-white hover:bg-stv-navy/90'
            }`}>
            {following ? (
              <><Check className="h-4 w-4" /> Sedang Mengikuti Program</>
            ) : (
              <><Calendar className="h-4 w-4" /> Ikuti Program Ini</>
            )}
          </button>
          {following && (
            <p className="text-center text-[11px] text-stv-muted">
              {/* TODO: connect to push notification backend for daily reminders */}
              Pengingat harian akan dikirim setiap pagi
            </p>
          )}

          {/* Simpan button */}
          <button type="button"
            onClick={() => toggleSaved('plans', plan.id)}
            className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-semibold transition ${
              saved ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}>
            <Star className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
            {saved ? 'Disimpan' : 'Simpan Program Ini'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ToolModal ─────────────────────────────────────────────────────────────────

function ToolModal({ tool, onClose }: { tool: EduTool; onClose: () => void }) {
  const { toggleSaved, isSaved, toggleOwned, isOwned } = useLearningStrategies();
  const saved = isSaved('tools', tool.id);
  const owned = isOwned(tool.id);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-[slideUp_0.3s_ease-out]">
        <div className="flex items-start gap-3 bg-slate-50 p-5 pb-4">
          <span className="text-3xl">{tool.icon}</span>
          <div className="flex-1">
            <div className="flex flex-wrap gap-1 mb-1">
              {tool.pilihanPsikolog && (
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600">
                  ⭐ Pilihan Psikolog
                </span>
              )}
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">{tool.ageLabel}</span>
            </div>
            <h2 className="font-baloo text-[18px] font-bold leading-tight text-stv-navy">{tool.nama}</h2>
            <p className="text-[13px] font-semibold text-amber-600">{tool.hargaEstimasi}</p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-[13px] leading-relaxed text-stv-body">{tool.deskripsi}</p>
          <SciBox sci={tool.sci} sumber={tool.sumber} />

          <div>
            <p className="mb-2 text-[12px] font-bold text-stv-navy">Keunggulan</p>
            <ul className="space-y-1.5">
              {tool.keunggulan.map((k, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-stv-body">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  {k}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4 flex gap-3">
          <button type="button"
            onClick={() => toggleSaved('tools', tool.id)}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition ${
              saved ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-stv-body hover:border-amber-300'
            }`}>
            <Star className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
          </button>
          <button type="button"
            onClick={() => toggleOwned(tool.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-semibold transition ${
              owned ? 'bg-green-500 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}>
            <ShoppingBag className="h-4 w-4" />
            {owned ? 'Sudah Punya' : 'Tandai Sudah Punya'}
          </button>
          {/* TODO: link to affiliate/store when backend ready */}
        </div>
      </div>
    </div>
  );
}

// ── DownloadModal ─────────────────────────────────────────────────────────────

function DownloadModal({ item, onClose }: { item: Downloadable; onClose: () => void }) {
  const { toggleSaved, isSaved, toggleDownloaded, isDownloaded } = useLearningStrategies();
  const saved = isSaved('downloads', item.id);
  const downloaded = isDownloaded(item.id);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-[slideUp_0.3s_ease-out]">
        <div className="flex items-start gap-3 bg-slate-50 p-5 pb-4">
          <span className="text-3xl">{item.icon}</span>
          <div className="flex-1">
            <span className="text-[10px] font-bold text-stv-muted uppercase tracking-wider">{item.kategori}</span>
            <h2 className="font-baloo text-[17px] font-bold leading-tight text-stv-navy">{item.nama}</h2>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-stv-muted">
              <span>{ageLabel(item.minBulan, item.maxBulan)}</span>
              <span>{item.halaman}</span>
              <span>{item.jumlahUnduhan.toLocaleString('id')} unduhan</span>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-[13px] leading-relaxed text-stv-body">{item.deskripsi}</p>
          <SciBox sci={item.sci} sumber={item.sumber} />
          <div>
            <p className="mb-1 text-[12px] font-bold text-stv-navy">Cara Menggunakan</p>
            <p className="text-[13px] leading-relaxed text-stv-body">{item.caraPakai}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4 flex gap-3">
          <button type="button"
            onClick={() => toggleSaved('downloads', item.id)}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition ${
              saved ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-stv-body hover:border-amber-300'
            }`}>
            <Star className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
          </button>
          <button type="button"
            onClick={() => {
              toggleDownloaded(item.id);
              // TODO: open fileUrl when backend provides real download link
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-semibold transition ${
              downloaded ? 'bg-green-500 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}>
            <Download className="h-4 w-4" />
            {downloaded ? 'Sudah Diunduh' : 'Unduh Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab types & config ────────────────────────────────────────────────────────

type Tab = 'aktivitas' | 'program' | 'alat' | 'unduhan';
type ViewMode = 'personal' | 'browse';

// ── PersonalView ──────────────────────────────────────────────────────────────

function PersonalView({
  onOpenActivity,
  onOpenPlan,
  onOpenTool,
  onOpenDownload,
}: {
  onOpenActivity: (a: Activity) => void;
  onOpenPlan: (p: WeeklyPlan) => void;
  onOpenTool: (t: EduTool) => void;
  onOpenDownload: (d: Downloadable) => void;
}) {
  const { children } = useDashboardTier2();
  const { totalSaved, doneCount, followedPlanId, unfollowPlan } = useLearningStrategies();
  const [selectedChildId, setSelectedChildId] = useState<string>(() => children[0]?.id ?? '');

  const child = children.find(c => c.id === selectedChildId) ?? children[0] ?? null;
  const ageMonths = child ? childAgeInMonths(child) : 0;

  const recActivities = useMemo(() =>
    ACTIVITIES.filter(a => {
      const { min, max } = activityAgeMonthRange(a.ageId);
      return ageMonths >= min && ageMonths < max;
    }).slice(0, 6),
  [ageMonths]);

  const recPlans = useMemo(() =>
    WEEKLY_PLANS.filter(p => matchesAgeMonths(p.minBulan, p.maxBulan, ageMonths)).slice(0, 3),
  [ageMonths]);

  const recTools = useMemo(() =>
    EDU_TOOLS.filter(t => matchesAgeMonths(t.minBulan, t.maxBulan, ageMonths) && t.pilihanPsikolog).slice(0, 3),
  [ageMonths]);

  const recDownloads = useMemo(() =>
    DOWNLOADABLES.filter(d => matchesAgeMonths(d.minBulan, d.maxBulan, ageMonths)).slice(0, 4),
  [ageMonths]);

  const totalLS = ACTIVITIES.length + WEEKLY_PLANS.length + EDU_TOOLS.length + DOWNLOADABLES.length;
  const followedPlan = followedPlanId ? WEEKLY_PLANS.find(p => p.id === followedPlanId) ?? null : null;

  if (!child) {
    return (
      <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-100 py-16 text-center">
        <span className="mb-3 text-4xl">👶</span>
        <p className="font-semibold text-stv-navy">Belum ada profil anak</p>
        <p className="mt-1 text-[13px] text-stv-muted">Tambahkan profil anak di menu Profil Anak untuk mendapatkan rekomendasi personal.</p>
      </div>
    );
  }

  const currentRange = AGE_RANGES.find(r => {
    const id = bestAgeRangeId(ageMonths);
    return r.id === id;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map(c => (
            <button key={c.id} type="button"
              onClick={() => setSelectedChildId(c.id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
                selectedChildId === c.id
                  ? 'border-amber-400 bg-amber-400 text-white'
                  : 'border-slate-200 bg-white text-stv-body hover:border-amber-300'
              }`}>
              <User className="h-3.5 w-3.5" />
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
            {child.photo
              ? <img src={child.photo} alt={child.name} className="h-14 w-14 rounded-2xl object-cover" />
              : '👶'}
          </div>
          <div className="flex-1">
            <p className="font-baloo text-[18px] font-bold text-stv-navy">{child.name}</p>
            <p className="text-[13px] text-stv-muted">
              {child.age} tahun ({ageMonths} bulan)
              {currentRange && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">{currentRange.label}</span>}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/70 p-3 text-center">
            <p className="font-baloo text-[22px] font-bold text-amber-500">{totalLS}</p>
            <p className="text-[11px] leading-tight text-stv-muted">Total Learning Strategies</p>
          </div>
          <div className="rounded-xl bg-white/70 p-3 text-center">
            <p className="font-baloo text-[22px] font-bold text-green-500">{doneCount()}</p>
            <p className="text-[11px] leading-tight text-stv-muted">Sudah Dilakukan</p>
          </div>
          <div className="rounded-xl bg-white/70 p-3 text-center">
            <p className="font-baloo text-[22px] font-bold text-stv-navy">{totalSaved()}</p>
            <p className="text-[11px] leading-tight text-stv-muted">Favorit Saya</p>
          </div>
        </div>

        {/* Following plan status */}
        {followedPlan && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg">
              {followedPlan.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-green-600">Sedang Mengikuti Program</p>
              <p className="truncate text-[13px] font-semibold text-green-800">{followedPlan.judul}</p>
              {/* TODO: show daily reminder countdown when backend push notification is ready */}
            </div>
            <button type="button"
              onClick={unfollowPlan}
              className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-stv-muted shadow-sm transition hover:text-red-500">
              Berhenti
            </button>
          </div>
        )}
      </div>

      {/* Recommended activities */}
      {recActivities.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="font-baloo text-[15px] font-bold text-stv-navy">
              Aktivitas untuk {child.name}
            </h3>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              {recActivities.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recActivities.map(a => (
              <ActivityCard key={a.id} activity={a} onOpen={() => onOpenActivity(a)} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended programs */}
      {recPlans.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-stv-navy" />
            <h3 className="font-baloo text-[15px] font-bold text-stv-navy">Program Mingguan Sesuai Usia</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recPlans.map(p => (
              <PlanCard key={p.id} plan={p} onOpen={() => onOpenPlan(p)} />
            ))}
          </div>
        </section>
      )}

      {/* Pilihan psikolog tools */}
      {recTools.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-violet-500" />
            <h3 className="font-baloo text-[15px] font-bold text-stv-navy">Alat Edukasi Pilihan Psikolog</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recTools.map(t => (
              <ToolCard key={t.id} tool={t} onOpen={() => onOpenTool(t)} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended downloads */}
      {recDownloads.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <FileDown className="h-4 w-4 text-blue-500" />
            <h3 className="font-baloo text-[15px] font-bold text-stv-navy">Materi Unduhan untuk Usia Ini</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recDownloads.map(d => (
              <DownloadCard key={d.id} item={d} onOpen={() => onOpenDownload(d)} />
            ))}
          </div>
        </section>
      )}

      {recActivities.length === 0 && recPlans.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-100 py-14 text-center">
          <span className="mb-3 text-4xl">🔍</span>
          <p className="font-semibold text-stv-navy">Belum ada konten untuk usia {child.age} tahun</p>
          <p className="mt-1 text-[13px] text-stv-muted">Coba gunakan mode Jelajahi untuk melihat semua konten.</p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LearningStrategiesTier2() {
  const [viewMode, setViewMode] = useState<ViewMode>('personal');
  const [activeTab, setActiveTab] = useState<Tab>('aktivitas');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgeId, setFilterAgeId] = useState('all');
  const [filterDomain, setFilterDomain] = useState<DomainKey | 'all'>('all');
  const [filterSavedOnly, setFilterSavedOnly] = useState(false);
  const [filterDoneOnly, setFilterDoneOnly] = useState(false);

  const [openActivity, setOpenActivity] = useState<Activity | null>(null);
  const [openPlan, setOpenPlan] = useState<WeeklyPlan | null>(null);
  const [openTool, setOpenTool] = useState<EduTool | null>(null);
  const [openDownload, setOpenDownload] = useState<Downloadable | null>(null);

  const { isSaved, isDone } = useLearningStrategies();

  // Filtered data per tab
  const filteredActivities = useMemo(() => ACTIVITIES.filter(a => {
    const matchSearch = !searchQuery || a.judul.toLowerCase().includes(searchQuery.toLowerCase()) || a.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAge = filterAgeId === 'all' || matchesAge(
      AGE_RANGES.find(r => r.id === a.ageId)?.min ?? 0,
      AGE_RANGES.find(r => r.id === a.ageId)?.max ?? 72,
      filterAgeId
    );
    const matchDomain = filterDomain === 'all' || a.domain.includes(filterDomain);
    const matchSaved = !filterSavedOnly || isSaved('activities', a.id);
    const matchDone = !filterDoneOnly || isDone(a.id);
    return matchSearch && matchAge && matchDomain && matchSaved && matchDone;
  }), [searchQuery, filterAgeId, filterDomain, filterSavedOnly, filterDoneOnly, isSaved, isDone]);

  const filteredPlans = useMemo(() => WEEKLY_PLANS.filter(p => {
    const matchSearch = !searchQuery || p.judul.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAge = matchesAge(p.minBulan, p.maxBulan, filterAgeId);
    const matchSaved = !filterSavedOnly || isSaved('plans', p.id);
    return matchSearch && matchAge && matchSaved;
  }), [searchQuery, filterAgeId, filterSavedOnly, isSaved]);

  const filteredTools = useMemo(() => EDU_TOOLS.filter(t => {
    const matchSearch = !searchQuery || t.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAge = matchesAge(t.minBulan, t.maxBulan, filterAgeId);
    const matchSaved = !filterSavedOnly || isSaved('tools', t.id);
    return matchSearch && matchAge && matchSaved;
  }), [searchQuery, filterAgeId, filterSavedOnly, isSaved]);

  const filteredDownloads = useMemo(() => DOWNLOADABLES.filter(d => {
    const matchSearch = !searchQuery || d.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAge = matchesAge(d.minBulan, d.maxBulan, filterAgeId);
    const matchSaved = !filterSavedOnly || isSaved('downloads', d.id);
    return matchSearch && matchAge && matchSaved;
  }), [searchQuery, filterAgeId, filterSavedOnly, isSaved]);

  const TABS: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'aktivitas', label: 'Aktivitas', icon: <Dumbbell className="h-4 w-4" />, count: filteredActivities.length },
    { id: 'program',   label: 'Program Mingguan', icon: <Calendar className="h-4 w-4" />, count: filteredPlans.length },
    { id: 'alat',      label: 'Alat Edukasi', icon: <Wrench className="h-4 w-4" />, count: filteredTools.length },
    { id: 'unduhan',   label: 'Unduhan', icon: <FileDown className="h-4 w-4" />, count: filteredDownloads.length },
  ];

  return (
    <div className="flex flex-col gap-5 font-nunito-sans" style={{ background: '#FFFDF8' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Learning Strategies</h2>
          <p className="text-[14px] text-stv-muted">
            Aktivitas berbasis riset, program mingguan, alat edukatif, dan materi unduhan.
          </p>
        </div>
        {/* View mode toggle */}
        <div className="flex shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <button type="button"
            onClick={() => setViewMode('personal')}
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold transition ${
              viewMode === 'personal' ? 'bg-amber-500 text-white' : 'text-stv-muted hover:bg-amber-50'
            }`}>
            <User className="h-3.5 w-3.5" />
            Personal
          </button>
          <button type="button"
            onClick={() => setViewMode('browse')}
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold transition ${
              viewMode === 'browse' ? 'bg-amber-500 text-white' : 'text-stv-muted hover:bg-amber-50'
            }`}>
            <LayoutGrid className="h-3.5 w-3.5" />
            Jelajahi
          </button>
        </div>
      </div>

      {/* Personal View */}
      {viewMode === 'personal' && (
        <PersonalView
          onOpenActivity={setOpenActivity}
          onOpenPlan={setOpenPlan}
          onOpenTool={setOpenTool}
          onOpenDownload={setOpenDownload}
        />
      )}

      {/* Browse View filters + content */}
      {viewMode === 'browse' && (<>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari aktivitas, program, atau alat..."
          className="w-full rounded-2xl border border-amber-200 bg-white py-3 pl-11 pr-4 text-[14px] shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Age filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          <button type="button"
            onClick={() => setFilterAgeId('all')}
            className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-semibold transition ${
              filterAgeId === 'all' ? 'border-stv-navy bg-stv-navy text-white' : 'border-slate-200 bg-white text-stv-body hover:border-slate-300'
            }`}>
            Semua Usia
          </button>
          {AGE_RANGES.map(r => (
            <button key={r.id} type="button"
              onClick={() => setFilterAgeId(r.id)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-semibold transition ${
                filterAgeId === r.id ? 'border-amber-400 bg-amber-400 text-white' : 'border-slate-200 bg-white text-stv-body hover:border-amber-200'
              }`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Domain filter (Aktivitas tab only) */}
      {activeTab === 'aktivitas' && (
        <div className="flex flex-wrap gap-2">
          <button type="button"
            onClick={() => setFilterDomain('all')}
            className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition ${
              filterDomain === 'all' ? 'border-stv-navy bg-stv-navy text-white' : 'border-slate-200 bg-white text-stv-body hover:border-slate-300'
            }`}>
            Semua Domain
          </button>
          {(Object.entries(DOMAIN_META) as [DomainKey, typeof DOMAIN_META[DomainKey]][]).map(([key, meta]) => (
            <button key={key} type="button"
              onClick={() => setFilterDomain(key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition ${
                filterDomain === key ? 'border-current text-current' : 'border-slate-200 bg-white text-stv-body hover:border-slate-300'
              }`}
              style={filterDomain === key ? { background: meta.bg, color: meta.color, borderColor: meta.color } : {}}>
              {meta.emoji} {meta.label}
            </button>
          ))}
        </div>
      )}

      {/* Saved / Done quick filters */}
      <div className="flex gap-2">
        <button type="button"
          onClick={() => setFilterSavedOnly(v => !v)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition ${
            filterSavedOnly ? 'border-amber-400 bg-amber-400 text-white' : 'border-slate-200 bg-white text-stv-body hover:bg-amber-50'
          }`}>
          <Star className="h-3.5 w-3.5" fill={filterSavedOnly ? 'currentColor' : 'none'} />
          Disimpan
        </button>
        {activeTab === 'aktivitas' && (
          <button type="button"
            onClick={() => setFilterDoneOnly(v => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition ${
              filterDoneOnly ? 'border-green-400 bg-green-400 text-white' : 'border-slate-200 bg-white text-stv-body hover:bg-green-50'
            }`}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Sudah Dicoba
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 overflow-x-auto pb-0.5 border-b border-slate-100" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button key={tab.id} type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] font-semibold transition-all ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-stv-muted hover:text-stv-body'
              }`}>
              {tab.icon}
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                activeTab === tab.id ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'aktivitas' && (
        filteredActivities.length === 0 ? (
          <EmptyState message="Tidak ada aktivitas yang cocok dengan filter ini." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredActivities.map(a => (
              <ActivityCard key={a.id} activity={a} onOpen={() => setOpenActivity(a)} />
            ))}
          </div>
        )
      )}

      {activeTab === 'program' && (
        filteredPlans.length === 0 ? (
          <EmptyState message="Tidak ada program yang cocok." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredPlans.map(p => (
              <PlanCard key={p.id} plan={p} onOpen={() => setOpenPlan(p)} />
            ))}
          </div>
        )
      )}

      {activeTab === 'alat' && (
        filteredTools.length === 0 ? (
          <EmptyState message="Tidak ada alat edukasi yang cocok." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map(t => (
              <ToolCard key={t.id} tool={t} onOpen={() => setOpenTool(t)} />
            ))}
          </div>
        )
      )}

      {activeTab === 'unduhan' && (
        filteredDownloads.length === 0 ? (
          <EmptyState message="Tidak ada unduhan yang cocok." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredDownloads.map(d => (
              <DownloadCard key={d.id} item={d} onOpen={() => setOpenDownload(d)} />
            ))}
          </div>
        )
      )}

      </>)} {/* end browse view */}

      {/* Modals — shared by both views */}
      {openActivity && <ActivityModal activity={openActivity} onClose={() => setOpenActivity(null)} />}
      {openPlan && <PlanModal plan={openPlan} onClose={() => setOpenPlan(null)} />}
      {openTool && <ToolModal tool={openTool} onClose={() => setOpenTool(null)} />}
      {openDownload && <DownloadModal item={openDownload} onClose={() => setOpenDownload(null)} />}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-100 py-14 text-center">
      <span className="text-4xl mb-3">🔍</span>
      <p className="font-semibold text-stv-navy">{message}</p>
      <p className="mt-1 text-[13px] text-stv-muted">Coba ubah filter atau kata kunci pencarian.</p>
    </div>
  );
}
