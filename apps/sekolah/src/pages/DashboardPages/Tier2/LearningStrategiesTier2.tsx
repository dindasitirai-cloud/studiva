import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Star, CheckCircle2, Download, ShoppingBag,
  Dumbbell, X, FlaskConical, Clock,
  Wrench, FileDown, Calendar, ChevronRight, Check,
  User, LayoutGrid, Sparkles,
} from 'lucide-react';
import {
  DOMAIN_META, AGE_RANGES,
  Activity, WeeklyPlan, EduTool, Downloadable, DomainKey,
} from '../../../data/learningStrategies';
import { useLearningStrategies } from '../../../context/LearningStrategiesContext';
import { useDashboardTier2, ChildProfile } from '../../../context/DashboardTier2Context';
import { fmtAge, ageInMonths } from './ProfilAnakTier2';

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
  return ageInMonths(child.birthdate);
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

export function ActivityCard({ activity, onOpen }: { activity: Activity; onOpen: () => void }) {
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

export function PlanCard({ plan, onOpen }: { plan: WeeklyPlan; onOpen: () => void }) {
  const { toggleSaved, isSaved, getPlanProgress, isPlanDone } = useLearningStrategies();
  const saved = isSaved('plans', plan.id);
  const progress = getPlanProgress(plan.id);
  const done = isPlanDone(plan.id);

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-[0_2px_12px_rgba(16,58,107,.06)] transition-all duration-300 hover:-translate-y-0.5 ${
      done ? 'border-green-200 bg-green-50/30 hover:shadow-[0_8px_24px_rgba(34,197,94,.14)]' : 'border-slate-100 hover:shadow-[0_8px_24px_rgba(217,119,6,.10)]'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${done ? 'bg-green-100' : 'bg-amber-50'}`}>
          {plan.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-baloo text-[15px] font-bold leading-tight text-stv-navy">{plan.judul}</p>
              {done && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                  <Check className="h-3 w-3" /> Sudah Dilakukan
                </span>
              )}
            </div>
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
          <span className={done ? 'font-bold text-green-600' : ''}>{progress}/7 hari</span>
        </div>
        <div className="flex gap-1.5">
          {plan.hari.map((_h, i) => {
            const dayDone = i < progress;
            return (
              <div key={i}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition ${
                  dayDone ? 'bg-green-500 text-white' : 'bg-slate-100 text-stv-muted'
                }`}>
                {dayDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
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

export function ToolCard({ tool, onOpen }: { tool: EduTool; onOpen: () => void }) {
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

export function DownloadCard({ item, onOpen }: { item: Downloadable; onOpen: () => void }) {
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

export function ActivityModal({ activity, onClose }: { activity: Activity; onClose: () => void }) {
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

export function PlanModal({ plan, onClose, childId }: { plan: WeeklyPlan; onClose: () => void; childId?: string }) {
  const { toggleSaved, isSaved, togglePlanDay, isPlanDayDone, getPlanProgress, isPlanDone, followPlan, unfollowPlan, isFollowing } = useLearningStrategies();
  const saved = isSaved('plans', plan.id);
  const progress = getPlanProgress(plan.id);
  const following = isFollowing(plan.id, childId);
  const planCompleted = isPlanDone(plan.id);

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

          {/* Completion banner — auto-shown when all 7 days checked */}
          {planCompleted && (
            <div className="flex items-center gap-3 rounded-xl border border-green-300 bg-green-50 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                <Check className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-bold text-green-700">Sudah Dilakukan!</p>
                <p className="text-[12px] text-green-600">Kamu telah menyelesaikan semua 7 hari program ini.</p>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div>
            <div className="mb-2 flex items-center justify-between text-[12px]">
              <span className="font-bold text-stv-navy">Progress Minggu Ini</span>
              <span className={`font-semibold ${planCompleted ? 'text-green-600' : 'text-amber-600'}`}>{progress}/7 hari</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${planCompleted ? 'bg-green-500' : 'bg-amber-400'}`}
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
            onClick={() => { following ? unfollowPlan(childId) : followPlan(plan.id, childId); }}
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

export function ToolModal({ tool, onClose }: { tool: EduTool; onClose: () => void }) {
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
          {/* TODO: catat event klik untuk analytics affiliate */}
          {tool.affiliateUrl && tool.affiliateUrl !== '#todo' && tool.affiliateUrl !== '' ? (
            <a
              href={tool.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-[13px] font-semibold text-orange-700 hover:bg-orange-100 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              Beli via Shopee
            </a>
          ) : (
            <a
              href={`https://shopee.co.id/search?keyword=${encodeURIComponent(tool.nama)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-[13px] font-semibold text-orange-700 hover:bg-orange-100 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              Cari di Shopee
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── DownloadModal ─────────────────────────────────────────────────────────────

export function DownloadModal({ item, onClose }: { item: Downloadable; onClose: () => void }) {
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

type Tab = 'aktivitas' | 'program' | 'alat' | 'unduhan' | 'selesai';
type ViewMode = 'personal' | 'browse';

// ── PersonalView ──────────────────────────────────────────────────────────────

function PersonalView({
  onOpenActivity,
  onOpenPlan,
  onOpenTool,
  onOpenDownload,
}: {
  onOpenActivity: (a: Activity) => void;
  onOpenPlan: (p: WeeklyPlan, childId?: string) => void;
  onOpenTool: (t: EduTool) => void;
  onOpenDownload: (d: Downloadable) => void;
}) {
  const { children } = useDashboardTier2();
  const { totalSaved, doneCount, getFollowedPlanId, unfollowPlan, isPlanDayDone, getPlanProgress, isPlanDone, isDone, isOwned, isDownloaded, publishedActivities: managedActivities, publishedPlans: managedPlans, publishedTools: managedTools, publishedDownloads: managedDownloads } = useLearningStrategies();
  const [selectedChildId, setSelectedChildId] = useState<string>(() => children[0]?.id ?? '');
  const [gridTab, setGridTab] = useState<Tab>('aktivitas');

  const child = children.find(c => c.id === selectedChildId) ?? children[0] ?? null;
  const ageMonths = child ? childAgeInMonths(child) : 0;

  // All age-matched content (no slice — used for grid + stats)
  const allActivities = useMemo(() =>
    managedActivities.filter(a => { const { min, max } = activityAgeMonthRange(a.ageId); return ageMonths >= min && ageMonths < max; }),
  [managedActivities, ageMonths]);
  const allPlans = useMemo(() => managedPlans.filter(p => matchesAgeMonths(p.minBulan, p.maxBulan, ageMonths)), [managedPlans, ageMonths]);
  const allTools = useMemo(() => managedTools.filter(t => matchesAgeMonths(t.minBulan, t.maxBulan, ageMonths)), [managedTools, ageMonths]);
  const allDownloads = useMemo(() => managedDownloads.filter(d => matchesAgeMonths(d.minBulan, d.maxBulan, ageMonths)), [managedDownloads, ageMonths]);

  const totalLS = allActivities.length + allPlans.length + allTools.length + allDownloads.length;
  const followedPlanId = getFollowedPlanId(selectedChildId);
  const followedPlan = followedPlanId
    ? managedPlans.find(p => p.id === followedPlanId) ?? null
    : null;
  // Hide banner if program is already completed (all 7 days done)
  const showFollowingBanner = followedPlan && !isPlanDone(followedPlan.id);
  const followProgress = followedPlanId ? getPlanProgress(followedPlanId) : 0;

  // "Rekomendasi hari ini" — 1 from each category (prefer undone/unsaved)
  const todayActivity = useMemo(() => allActivities.find(a => !isDone(a.id)) ?? allActivities[0] ?? null, [allActivities, isDone]);
  const todayPlan = useMemo(() => allPlans[0] ?? null, [allPlans]);
  const todayTool = useMemo(() => allTools.find(t => t.pilihanPsikolog) ?? allTools[0] ?? null, [allTools]);
  const todayDownload = useMemo(() => allDownloads[0] ?? null, [allDownloads]);

  if (!child) {
    return (
      <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-100 py-16 text-center">
        <span className="mb-3 text-4xl">👶</span>
        <p className="font-semibold text-stv-navy">Belum ada profil anak</p>
        <p className="mt-1 text-[13px] text-stv-muted">Tambahkan profil anak di menu Profil Anak untuk mendapatkan rekomendasi personal.</p>
      </div>
    );
  }

  const currentRange = AGE_RANGES.find(r => r.id === bestAgeRangeId(ageMonths));

  // Sudah Dilakukan counts
  const doneActivitiesAge = allActivities.filter(a => isDone(a.id));
  const donePlansAge      = allPlans.filter(p => isPlanDone(p.id));
  const doneToolsAge      = allTools.filter(t => isOwned(t.id));
  const doneDownloadsAge  = allDownloads.filter(d => isDownloaded(d.id));
  const doneTotal = doneActivitiesAge.length + donePlansAge.length + doneToolsAge.length + doneDownloadsAge.length;

  const GRID_TABS: { id: Tab; label: string; count: number }[] = [
    { id: 'aktivitas', label: 'Aktivitas',      count: allActivities.length },
    { id: 'program',   label: 'Program',         count: allPlans.length },
    { id: 'alat',      label: 'Alat Edukasi',    count: allTools.length },
    { id: 'unduhan',   label: 'Unduhan',          count: allDownloads.length },
    { id: 'selesai',   label: 'Sudah Dilakukan', count: doneTotal },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map(c => (
            <button key={c.id} type="button"
              onClick={() => setSelectedChildId(c.id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
                selectedChildId === c.id ? 'border-amber-400 bg-amber-400 text-white' : 'border-slate-200 bg-white text-stv-body hover:border-amber-300'
              }`}>
              <User className="h-3.5 w-3.5" />{c.name}
            </button>
          ))}
        </div>
      )}

      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-5">
        {/* Child info */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
            {child.photo
              ? <img src={child.photo} alt={child.name} className="h-14 w-14 rounded-2xl object-cover" />
              : '👶'}
          </div>
          <div className="flex-1">
            <p className="font-baloo text-[18px] font-bold text-stv-navy">{child.name}</p>
            <p className="text-[13px] text-stv-muted">
              {fmtAge(ageInMonths(child.birthdate))}
              {currentRange && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">{currentRange.label}</span>}
            </p>
          </div>
        </div>

        {/* Stats */}
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

        {/* Following plan status — hidden once plan is completed */}
        {showFollowingBanner && followedPlan && (
          <button type="button"
            onClick={() => onOpenPlan(followedPlan, selectedChildId)}
            className="mt-3 w-full rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-left transition hover:bg-green-100">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg">
                {followedPlan.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-green-600">Sedang Mengikuti Program</p>
                <p className="truncate text-[13px] font-semibold text-green-800">{followedPlan.judul}</p>
              </div>
              <button type="button"
                onClick={e => { e.stopPropagation(); unfollowPlan(selectedChildId); }}
                className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-stv-muted shadow-sm transition hover:text-red-500">
                Berhenti
              </button>
            </div>
            {/* H1–H7 progress dots */}
            <div className="mt-3 flex items-center gap-1.5">
              {followedPlan.hari.map((h, i) => {
                const done = isPlanDayDone(followedPlan.id, i);
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition ${
                      done ? 'bg-green-500 text-white' : 'bg-white border border-green-200 text-green-600'
                    }`}>
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span className="text-[9px] text-green-600 font-medium">H{i + 1}</span>
                  </div>
                );
              })}
              <span className="ml-auto text-[11px] font-semibold text-green-600">
                {followProgress}/7 selesai
              </span>
            </div>
            <p className="mt-2 text-[11px] text-green-500">
              Ketuk untuk melihat program lengkap
              {/* TODO: daily push notification reminder via backend */}
            </p>
          </button>
        )}
      </div>

      {/* Rekomendasi hari ini */}
      {(todayActivity || todayPlan || todayTool || todayDownload) && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="font-baloo text-[15px] font-bold text-stv-navy">
              Rekomendasi untuk {child.name} hari ini
            </h3>
          </div>
          {/* Horizontal scroll row */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {todayActivity && (
                <button type="button" onClick={() => onOpenActivity(todayActivity)}
                  className="flex w-44 shrink-0 flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                    style={{ background: DOMAIN_META[todayActivity.domain[0]].bg }}>
                    {todayActivity.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-600">Aktivitas</span>
                    <p className="text-[12px] font-bold leading-tight text-stv-navy line-clamp-2">{todayActivity.judul}</p>
                  </div>
                  <span className="mt-auto flex items-center gap-1 text-[10px] text-stv-muted">
                    <Clock className="h-3 w-3" />{todayActivity.durasiMenit} mnt
                  </span>
                </button>
              )}
              {todayPlan && (
                <button type="button" onClick={() => onOpenPlan(todayPlan, selectedChildId)}
                  className="flex w-44 shrink-0 flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl">
                    {todayPlan.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stv-navy">Program Mingguan</span>
                    <p className="text-[12px] font-bold leading-tight text-stv-navy line-clamp-2">{todayPlan.judul}</p>
                  </div>
                  <span className="mt-auto text-[10px] text-amber-600 font-semibold">{todayPlan.ageLabel}</span>
                </button>
              )}
              {todayTool && (
                <button type="button" onClick={() => onOpenTool(todayTool)}
                  className="flex w-44 shrink-0 flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-xl">
                    {todayTool.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-violet-600">Alat Edukasi</span>
                    <p className="text-[12px] font-bold leading-tight text-stv-navy line-clamp-2">{todayTool.nama}</p>
                  </div>
                  {todayTool.pilihanPsikolog && (
                    <span className="mt-auto text-[10px] font-bold text-violet-500">⭐ Pilihan Psikolog</span>
                  )}
                </button>
              )}
              {todayDownload && (
                <button type="button" onClick={() => onOpenDownload(todayDownload)}
                  className="flex w-44 shrink-0 flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
                    {todayDownload.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-600">Unduhan</span>
                    <p className="text-[12px] font-bold leading-tight text-stv-navy line-clamp-2">{todayDownload.nama}</p>
                  </div>
                  <span className="mt-auto text-[10px] text-stv-muted">{todayDownload.halaman}</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Tabbed grid — all age-matched content */}
      {totalLS > 0 && (
        <section>
          {/* Tab bar */}
          <div className="mb-4 flex gap-1 border-b border-slate-100" style={{ scrollbarWidth: 'none' }}>
            {GRID_TABS.map(tab => (
              <button key={tab.id} type="button"
                onClick={() => setGridTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-[12px] font-semibold transition-all ${
                  gridTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-stv-muted hover:text-stv-body'
                }`}>
                {tab.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  gridTab === tab.id ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                }`}>{tab.count}</span>
              </button>
            ))}
          </div>

          {gridTab === 'aktivitas' && (
            allActivities.length === 0
              ? <EmptyState message="Belum ada aktivitas untuk usia ini." />
              : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {allActivities.map(a => <ActivityCard key={a.id} activity={a} onOpen={() => onOpenActivity(a)} />)}
                </div>
          )}
          {gridTab === 'program' && (
            allPlans.length === 0
              ? <EmptyState message="Belum ada program untuk usia ini." />
              : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {allPlans.map(p => <PlanCard key={p.id} plan={p} onOpen={() => onOpenPlan(p, selectedChildId)} />)}
                </div>
          )}
          {gridTab === 'alat' && (
            allTools.length === 0
              ? <EmptyState message="Belum ada alat edukasi untuk usia ini." />
              : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {allTools.map(t => <ToolCard key={t.id} tool={t} onOpen={() => onOpenTool(t)} />)}
                </div>
          )}
          {gridTab === 'unduhan' && (
            allDownloads.length === 0
              ? <EmptyState message="Belum ada unduhan untuk usia ini." />
              : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {allDownloads.map(d => <DownloadCard key={d.id} item={d} onOpen={() => onOpenDownload(d)} />)}
                </div>
          )}
          {gridTab === 'selesai' && (
            doneTotal === 0
              ? <EmptyState message="Belum ada kegiatan yang selesai. Tandai 'Sudah Dicoba', selesaikan program, atau unduh materi!" />
              : <SelesaiContent
                  activities={doneActivitiesAge} plans={donePlansAge}
                  tools={doneToolsAge} downloads={doneDownloadsAge}
                  onOpenActivity={onOpenActivity} onOpenPlan={onOpenPlan}
                  onOpenTool={onOpenTool} onOpenDownload={onOpenDownload}
                />
          )}
        </section>
      )}

      {totalLS === 0 && (
        <EmptyState message={`Belum ada konten untuk usia ${fmtAge(ageInMonths(child.birthdate))}.`} />
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
  const [openPlan, setOpenPlan] = useState<{ plan: WeeklyPlan; childId?: string } | null>(null);
  const [openTool, setOpenTool] = useState<EduTool | null>(null);
  const [openDownload, setOpenDownload] = useState<Downloadable | null>(null);

  const { isSaved, isDone, isPlanDone, isOwned, isDownloaded, publishedActivities: managedActivities, publishedPlans: managedPlans, publishedTools: managedTools, publishedDownloads: managedDownloads } = useLearningStrategies();

  // Filtered data per tab
  const filteredActivities = useMemo(() => managedActivities.filter(a => {
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
  }), [managedActivities, searchQuery, filterAgeId, filterDomain, filterSavedOnly, filterDoneOnly, isSaved, isDone]);

  const filteredPlans = useMemo(() => managedPlans.filter(p => {
    const matchSearch = !searchQuery || p.judul.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAge = matchesAge(p.minBulan, p.maxBulan, filterAgeId);
    const matchSaved = !filterSavedOnly || isSaved('plans', p.id);
    return matchSearch && matchAge && matchSaved;
  }), [managedPlans, searchQuery, filterAgeId, filterSavedOnly, isSaved]);

  const filteredTools = useMemo(() => managedTools.filter(t => {
    const matchSearch = !searchQuery || t.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAge = matchesAge(t.minBulan, t.maxBulan, filterAgeId);
    const matchSaved = !filterSavedOnly || isSaved('tools', t.id);
    return matchSearch && matchAge && matchSaved;
  }), [managedTools, searchQuery, filterAgeId, filterSavedOnly, isSaved]);

  const filteredDownloads = useMemo(() => managedDownloads.filter(d => {
    const matchSearch = !searchQuery || d.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAge = matchesAge(d.minBulan, d.maxBulan, filterAgeId);
    const matchSaved = !filterSavedOnly || isSaved('downloads', d.id);
    return matchSearch && matchAge && matchSaved;
  }), [managedDownloads, searchQuery, filterAgeId, filterSavedOnly, isSaved]);

  // Sudah Dilakukan: across all content (no age/search filter — it's what you've done)
  const selesaiActivities = useMemo(() => managedActivities.filter(a => isDone(a.id)), [managedActivities, isDone]);
  const selesaiPlans      = useMemo(() => managedPlans.filter(p => isPlanDone(p.id)), [managedPlans, isPlanDone]);
  const selesaiTools      = useMemo(() => managedTools.filter(t => isOwned(t.id)), [managedTools, isOwned]);
  const selesaiDownloads  = useMemo(() => managedDownloads.filter(d => isDownloaded(d.id)), [managedDownloads, isDownloaded]);
  const selesaiTotal = selesaiActivities.length + selesaiPlans.length + selesaiTools.length + selesaiDownloads.length;

  const TABS: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'aktivitas', label: 'Aktivitas',      icon: <Dumbbell className="h-4 w-4" />,   count: filteredActivities.length },
    { id: 'program',   label: 'Program',         icon: <Calendar className="h-4 w-4" />,   count: filteredPlans.length },
    { id: 'alat',      label: 'Alat Edukasi',    icon: <Wrench className="h-4 w-4" />,     count: filteredTools.length },
    { id: 'unduhan',   label: 'Unduhan',          icon: <FileDown className="h-4 w-4" />,   count: filteredDownloads.length },
    { id: 'selesai',   label: 'Sudah Dilakukan', icon: <CheckCircle2 className="h-4 w-4" />, count: selesaiTotal },
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
          onOpenPlan={(plan, childId) => setOpenPlan({ plan, childId })}
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
              <PlanCard key={p.id} plan={p} onOpen={() => setOpenPlan({ plan: p })} />
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

      {activeTab === 'selesai' && (
        selesaiTotal === 0 ? (
          <EmptyState message="Belum ada kegiatan yang selesai. Tandai 'Sudah Dicoba', selesaikan program, tandai punya alat, atau unduh materi!" />
        ) : (
          <SelesaiContent
            activities={selesaiActivities} plans={selesaiPlans}
            tools={selesaiTools} downloads={selesaiDownloads}
            onOpenActivity={setOpenActivity} onOpenPlan={p => setOpenPlan({ plan: p })}
            onOpenTool={setOpenTool} onOpenDownload={setOpenDownload}
          />
        )
      )}

      </>)} {/* end browse view */}

      {/* Modals — shared by both views */}
      {openActivity && <ActivityModal activity={openActivity} onClose={() => setOpenActivity(null)} />}
      {openPlan && <PlanModal plan={openPlan.plan} childId={openPlan.childId} onClose={() => setOpenPlan(null)} />}
      {openTool && <ToolModal tool={openTool} onClose={() => setOpenTool(null)} />}
      {openDownload && <DownloadModal item={openDownload} onClose={() => setOpenDownload(null)} />}
    </div>
  );
}

// ── SelesaiContent ────────────────────────────────────────────────────────────

function SelesaiContent({
  activities, plans, tools, downloads,
  onOpenActivity, onOpenPlan, onOpenTool, onOpenDownload,
}: {
  activities: Activity[];
  plans: WeeklyPlan[];
  tools: EduTool[];
  downloads: Downloadable[];
  onOpenActivity: (a: Activity) => void;
  onOpenPlan: (p: WeeklyPlan, childId?: string) => void;
  onOpenTool: (t: EduTool) => void;
  onOpenDownload: (d: Downloadable) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {activities.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <h3 className="font-baloo text-[14px] font-bold text-stv-navy">
              Aktivitas Sudah Dicoba
            </h3>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">{activities.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map(a => <ActivityCard key={a.id} activity={a} onOpen={() => onOpenActivity(a)} />)}
          </div>
        </section>
      )}
      {plans.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <h3 className="font-baloo text-[14px] font-bold text-stv-navy">
              Program Sudah Diselesaikan
            </h3>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">{plans.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {plans.map(p => <PlanCard key={p.id} plan={p} onOpen={() => onOpenPlan(p)} />)}
          </div>
        </section>
      )}
      {tools.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <h3 className="font-baloo text-[14px] font-bold text-stv-navy">
              Alat Edukasi yang Dimiliki
            </h3>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">{tools.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map(t => <ToolCard key={t.id} tool={t} onOpen={() => onOpenTool(t)} />)}
          </div>
        </section>
      )}
      {downloads.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <h3 className="font-baloo text-[14px] font-bold text-stv-navy">
              Materi yang Sudah Diunduh
            </h3>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">{downloads.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {downloads.map(d => <DownloadCard key={d.id} item={d} onOpen={() => onOpenDownload(d)} />)}
          </div>
        </section>
      )}
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
