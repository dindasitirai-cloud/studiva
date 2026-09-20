import React, { useState, useMemo, useEffect } from 'react';
import {
  Star, CheckCircle2, Download, ShoppingBag,
  X, FlaskConical, Clock,
  Calendar, ChevronRight, Check,
  Sparkles,
} from 'lucide-react';
import {
  DOMAIN_META, AGE_RANGES,
  Activity, WeeklyPlan, EduTool, Downloadable, DomainKey,
} from '../../../data/learningStrategies';
import { useLearningStrategies } from '../../../context/LearningStrategiesContext';
import { useAnakAktif, useFotoAnak } from '../../../context/AnakContext';
import { formatUsia } from '../../../types/anak';
import BotanicalStem, { BotanicalConfig } from '../../../components/BotanicalStem';
import FlowerMark from '../../../components/FlowerMark';

// ── helpers ─────────────────────────────────────────────────────────────────

function ageLabel(minBulan: number, maxBulan: number): string {
  const fmt = (m: number) => m >= 12 ? `${Math.floor(m / 12)} thn` : `${m} bln`;
  return `${fmt(minBulan)} - ${fmt(maxBulan)}`;
}

// Tidak dipakai saat ini — penyaringan usia kini lewat FilterSubUsia.
// Disimpan karena logikanya masih jadi rujukan; hapus kalau sudah pasti mati.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function matchesAge(minBulan: number, maxBulan: number, filterAgeId: string): boolean {
  if (filterAgeId === 'all') return true;
  const range = AGE_RANGES.find(r => r.id === filterAgeId);
  if (!range) return true;
  return minBulan < range.max && maxBulan > range.min;
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

// ── Rekah v2 tokens — palet & ikon per domain (dipakai kartu & modal Ajak Main) ─
// STR_DOM (peta warna + path ikon per domain) didefinisikan di bawah pada berkas
// yang sama; aman dirujuk di sini karena hanya dipakai saat render.

// Palet untuk Unduhan (tidak bertema domain)
const DL_PAL = { soft: '#F4E6EF', ink: '#A85683', border: '#E9CADB' };

/** Ikon stroke per domain untuk tile kartu/modal (desain v2, bukan emoji). */
function DomIcon({ domain, size = 26, color }: { domain: DomainKey; size?: number; color?: string }) {
  const paths = STR_DOM[domain]?.icon ?? STR_DOM.kog.icon;
  const clr = color ?? STR_DOM[domain]?.ink ?? '#6E3B57';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={clr} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

// ── ActivityCard ──────────────────────────────────────────────────────────────

export function ActivityCard({ activity, onOpen, onJadwalkan }: { activity: Activity; onOpen: () => void; onJadwalkan?: () => void }) {
  const { toggleSaved, isSaved, toggleDone, isDone } = useLearningStrategies();
  const saved = isSaved('activities', activity.id);
  const done = isDone(activity.id);
  const dom = activity.domain[0];
  const pal = STR_DOM[dom] ?? STR_DOM.kog;

  return (
    <div
      className="flex flex-col overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1.5"
      style={{ borderRadius: 24, border: `2px solid ${pal.border}`, boxShadow: '0 20px 34px -30px rgba(90,50,70,.6)' }}
    >
      {/* Band atas berwarna */}
      <button type="button" onClick={onOpen} className="relative w-full text-left focus:outline-none"
        style={{ background: pal.soft, padding: '22px 22px 26px' }}>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center justify-center rounded-2xl bg-white" style={{ width: 56, height: 56 }}>
            <DomIcon domain={dom} size={26} color={pal.ink} />
          </span>
          <span className="inline-flex items-center gap-1 rounded-full font-nunito font-[800]"
            style={{ background: 'rgba(255,255,255,.8)', color: '#6E3B57', fontSize: 12, padding: '4px 10px' }}>
            <Clock className="h-3.5 w-3.5" />{activity.durasiMenit} mnt
          </span>
        </div>
        {done && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-daun px-2 py-0.5 text-[10px] font-bold text-white shadow">
            <Check className="h-3 w-3" /> Sudah Dicoba
          </span>
        )}
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col" style={{ padding: '20px 22px 22px' }}>
        <button type="button" onClick={onOpen} className="flex flex-col gap-1.5 text-left focus:outline-none">
          <div className="mb-0.5 flex flex-wrap gap-1">
            <AgePill ageId={activity.ageId} />
            {activity.isDIY && <span className="rounded-full bg-daun/10 px-2 py-0.5 text-[10px] font-bold text-daun">DIY</span>}
          </div>
          <p className="font-fredoka font-bold text-pekat" style={{ fontSize: 22, lineHeight: 1.2 }}>{activity.judul}</p>
          <p className="font-nunito font-semibold" style={{ fontSize: 14.5, lineHeight: 1.5, color: '#8A6F86', minHeight: 44 }}>{activity.deskripsi}</p>
        </button>

        {/* Baris aksi */}
        <div className="mt-4 flex items-center gap-2">
          {onJadwalkan ? (
            <button type="button"
              onClick={e => { e.stopPropagation(); onJadwalkan(); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-rekah py-2.5 font-nunito text-[13px] font-bold text-white transition hover:bg-rekah-tua">
              <Calendar className="h-4 w-4" />
              Jadwalkan kegiatan ini
            </button>
          ) : (
            <button type="button"
              onClick={e => { e.stopPropagation(); toggleDone(activity.id); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 font-nunito text-[13px] font-bold transition"
              style={done ? { background: '#E4F3E8', color: '#2E8B57' } : { background: pal.soft, color: pal.ink }}>
              <CheckCircle2 className="h-4 w-4" />
              {done ? 'Sudah Dicoba' : 'Tandai Dicoba'}
            </button>
          )}
          <button type="button" aria-label={saved ? 'Batal simpan' : 'Simpan'}
            onClick={e => { e.stopPropagation(); toggleSaved('activities', activity.id); }}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${
              saved ? 'border-amber-300 text-amber-500' : 'border-[#F2E4D2] text-pekat/40 hover:text-amber-500'
            }`}>
            <Star className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
        </div>
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

export function ToolCard({ tool, onOpen, onJadwalkan }: { tool: EduTool; onOpen: () => void; onJadwalkan?: () => void }) {
  const { toggleSaved, isSaved, toggleOwned, isOwned } = useLearningStrategies();
  const saved = isSaved('tools', tool.id);
  const owned = isOwned(tool.id);

  const pal = STR_DOM[tool.domain] ?? STR_DOM.kog;

  return (
    <div
      className="flex flex-col overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1.5"
      style={{ borderRadius: 24, border: `2px solid ${pal.border}`, boxShadow: '0 20px 34px -30px rgba(90,50,70,.6)' }}
    >
      {/* Band atas berwarna */}
      <button type="button" onClick={onOpen} className="w-full text-left focus:outline-none"
        style={{ background: pal.soft, padding: '22px 22px 26px' }}>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center justify-center rounded-2xl bg-white" style={{ width: 56, height: 56 }}>
            <DomIcon domain={tool.domain} size={26} color={pal.ink} />
          </span>
          <span className="inline-flex items-center rounded-full font-nunito font-[800]"
            style={{ background: 'rgba(255,255,255,.8)', color: '#6E3B57', fontSize: 12, padding: '4px 10px' }}>
            {tool.hargaEstimasi}
          </span>
        </div>
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col" style={{ padding: '20px 22px 22px' }}>
        <button type="button" onClick={onOpen} className="flex flex-col gap-1.5 text-left focus:outline-none">
          <div className="mb-0.5 flex flex-wrap gap-1">
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: '#FFF3D0', color: '#8A5510' }}>{tool.ageLabel}</span>
            {tool.pilihanPsikolog && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: '#F1EBFB', color: '#8A6DC7' }}>
                ⭐ Pilihan Psikolog
              </span>
            )}
          </div>
          <p className="font-fredoka font-bold text-pekat" style={{ fontSize: 22, lineHeight: 1.2 }}>{tool.nama}</p>
          <p className="font-nunito font-semibold" style={{ fontSize: 14.5, lineHeight: 1.5, color: '#8A6F86', minHeight: 44 }}>{tool.deskripsi}</p>
        </button>

        {/* Baris aksi */}
        <div className="mt-4 flex items-center gap-2">
          {onJadwalkan ? (
            <button type="button"
              onClick={e => { e.stopPropagation(); onJadwalkan(); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-rekah py-2.5 font-nunito text-[13px] font-bold text-white transition hover:bg-rekah-tua">
              <Calendar className="h-4 w-4" />
              Simpan alat ini
            </button>
          ) : (
            <button type="button"
              onClick={e => { e.stopPropagation(); toggleOwned(tool.id); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 font-nunito text-[13px] font-bold transition"
              style={owned ? { background: '#E4F3E8', color: '#2E8B57' } : { background: pal.soft, color: pal.ink }}>
              {owned ? <><Check className="h-4 w-4" /> Punya</> : 'Tandai Punya'}
            </button>
          )}
          <button type="button" aria-label={saved ? 'Batal simpan' : 'Simpan'}
            onClick={e => { e.stopPropagation(); toggleSaved('tools', tool.id); }}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${
              saved ? 'border-amber-300 text-amber-500' : 'border-[#F2E4D2] text-pekat/40 hover:text-amber-500'
            }`}>
            <Star className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DownloadCard ─────────────────────────────────────────────────────────────

export function DownloadCard({ item, onOpen, onJadwalkan }: { item: Downloadable; onOpen: () => void; onJadwalkan?: () => void }) {
  const { toggleSaved, isSaved, toggleDownloaded, isDownloaded } = useLearningStrategies();
  const saved = isSaved('downloads', item.id);
  const downloaded = isDownloaded(item.id);

  const pal = DL_PAL;

  return (
    <div
      className="flex flex-col overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1.5"
      style={{ borderRadius: 24, border: `2px solid ${pal.border}`, boxShadow: '0 20px 34px -30px rgba(90,50,70,.6)' }}
    >
      {/* Band atas berwarna */}
      <button type="button" onClick={onOpen} className="w-full text-left focus:outline-none"
        style={{ background: pal.soft, padding: '22px 22px 26px' }}>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center justify-center rounded-2xl bg-white" style={{ width: 56, height: 56 }}>
            <Download className="h-6 w-6" style={{ color: pal.ink }} strokeWidth={2} />
          </span>
          <span className="inline-flex items-center rounded-full font-nunito font-[800]"
            style={{ background: 'rgba(255,255,255,.8)', color: pal.ink, fontSize: 12, padding: '4px 10px' }}>
            {item.kategori}
          </span>
        </div>
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col" style={{ padding: '20px 22px 22px' }}>
        <button type="button" onClick={onOpen} className="flex flex-col gap-1.5 text-left focus:outline-none">
          <div className="mb-0.5 flex flex-wrap items-center gap-2 font-nunito text-[11px] font-semibold" style={{ color: '#A98DA0' }}>
            <span>{ageLabel(item.minBulan, item.maxBulan)}</span>
            <span>·</span>
            <span>{item.halaman}</span>
            <span>·</span>
            <span>{item.jumlahUnduhan.toLocaleString('id')} unduhan</span>
          </div>
          <p className="font-fredoka font-bold text-pekat" style={{ fontSize: 22, lineHeight: 1.2 }}>{item.nama}</p>
          <p className="font-nunito font-semibold" style={{ fontSize: 14.5, lineHeight: 1.5, color: '#8A6F86', minHeight: 44 }}>{item.deskripsi}</p>
        </button>

        {/* Baris aksi */}
        <div className="mt-4 flex items-center gap-2">
          {onJadwalkan ? (
            <button type="button"
              onClick={e => { e.stopPropagation(); onJadwalkan(); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-rekah py-2.5 font-nunito text-[13px] font-bold text-white transition hover:bg-rekah-tua">
              <Calendar className="h-4 w-4" />
              Unduh lembar ini
            </button>
          ) : (
            <button type="button"
              onClick={e => { e.stopPropagation(); toggleDownloaded(item.id); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 font-nunito text-[13px] font-bold text-white transition"
              style={downloaded ? { background: '#2E8B57' } : { background: '#F06BA8' }}>
              <Download className="h-4 w-4" />
              {downloaded ? 'Diunduh' : 'Unduh'}
            </button>
          )}
          <button type="button" aria-label={saved ? 'Batal simpan' : 'Simpan'}
            onClick={e => { e.stopPropagation(); toggleSaved('downloads', item.id); }}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${
              saved ? 'border-amber-300 text-amber-500' : 'border-[#F2E4D2] text-pekat/40 hover:text-amber-500'
            }`}>
            <Star className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ActivityModal ─────────────────────────────────────────────────────────────

export function ActivityModal({ activity, onClose, onJadwalkan }: { activity: Activity; onClose: () => void; onJadwalkan?: () => void }) {
  const { toggleSaved, isSaved, toggleDone, isDone } = useLearningStrategies();
  const saved = isSaved('activities', activity.id);
  const done = isDone(activity.id);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const pal = STR_DOM[activity.domain[0]] ?? STR_DOM.kog;

  return (
    <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(110,59,87,0.42)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden bg-white animate-[slideUp_0.3s_ease-out]"
        style={{ maxWidth: 620, borderRadius: 30, boxShadow: '0 40px 80px -40px rgba(90,50,70,.75)' }}>
        {/* Header (tetap) */}
        <div className="relative flex items-start gap-4" style={{ background: pal.soft, padding: '24px 28px' }}>
          <span className="flex shrink-0 items-center justify-center rounded-[18px] bg-white" style={{ width: 62, height: 62 }}>
            <DomIcon domain={activity.domain[0]} size={30} color={pal.ink} />
          </span>
          <div className="min-w-0 flex-1 pr-8">
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              <span className="rounded-full px-2.5 py-0.5 font-nunito text-[11px] font-[800]" style={{ background: '#FFE29A', color: '#8A5510' }}>{AGE_RANGES.find(r => r.id === activity.ageId)?.label ?? activity.ageId}</span>
              {activity.domain.map(d => (
                <span key={d} className="rounded-full bg-white px-2.5 py-0.5 font-nunito text-[11px] font-[800]" style={{ color: STR_DOM[d]?.ink ?? '#6E3B57' }}>{DOMAIN_META[d].label}</span>
              ))}
              {activity.isDIY && <span className="rounded-full px-2.5 py-0.5 font-nunito text-[11px] font-[800]" style={{ background: 'rgba(255,255,255,.7)', color: '#9B7E92' }}>DIY</span>}
            </div>
            <h2 className="font-fredoka font-bold text-pekat" style={{ fontSize: 26, lineHeight: 1.15 }}>{activity.judul}</h2>
            <div className="mt-1 flex items-center gap-1 font-nunito text-[13.5px] font-bold" style={{ color: '#7A5E71' }}>
              <Clock className="h-3.5 w-3.5" />{activity.durasiMenit} menit
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup"
            className="absolute right-5 top-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-pekat/60 transition hover:text-pekat"
            style={{ background: 'rgba(255,255,255,.75)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Isi (scroll) */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '24px 28px' }}>
          <div className="flex flex-col gap-5">
            {/* Kenapa ini bermanfaat */}
            <div style={{ background: '#EEF4FE', border: '1.5px solid #D5E4FB', borderRadius: 20, padding: '16px 18px' }}>
              <p className="mb-1 flex items-center gap-1.5 font-fredoka font-semibold" style={{ fontSize: 17, color: '#2F5BB7' }}>
                <FlaskConical className="h-4 w-4" /> Kenapa ini bermanfaat?
              </p>
              <p className="font-nunito font-semibold" style={{ fontSize: 15, lineHeight: 1.6, color: '#5B6E93' }}>{activity.sci}</p>
              <p className="mt-2 font-nunito font-bold" style={{ fontSize: 12.5, color: '#7C93C4' }}>Sumber: {activity.sumber}</p>
            </div>

            {/* Tujuan */}
            <div>
              <p className="mb-1 font-fredoka font-semibold text-pekat" style={{ fontSize: 17 }}>Tujuan</p>
              <p className="font-nunito font-semibold" style={{ fontSize: 15, lineHeight: 1.6, color: '#7A5E71' }}>{activity.tujuan}</p>
            </div>

            {/* Yang dibutuhkan */}
            {activity.bahan.length > 0 && (
              <div>
                <p className="mb-2 font-fredoka font-semibold text-pekat" style={{ fontSize: 17 }}>Yang Dibutuhkan</p>
                <ul className="space-y-1.5">
                  {activity.bahan.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 font-nunito font-semibold" style={{ fontSize: 14.5, color: '#7A5E71' }}>
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: pal.ink }} />
                      {b.nama}
                      {b.affiliateUrl && b.affiliateUrl !== '#todo' && (
                        <a href={b.affiliateUrl} target="_blank" rel="noopener noreferrer"
                          className="ml-auto font-bold text-rekah hover:underline" style={{ fontSize: 12.5 }}>
                          Beli online
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cara melakukan */}
            <div>
              <p className="mb-2 font-fredoka font-semibold text-pekat" style={{ fontSize: 17 }}>Cara Melakukan</p>
              <ol className="space-y-2.5">
                {activity.langkah.map((step, i) => (
                  <li key={i} className="flex gap-3 font-nunito font-semibold" style={{ fontSize: 15, lineHeight: 1.6, color: '#7A5E71' }}>
                    <span className="flex shrink-0 items-center justify-center rounded-full font-[800]" style={{ width: 26, height: 26, background: '#FFE29A', color: '#8A5510', fontSize: 13 }}>
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Variasi */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div style={{ background: '#ECF4DE', borderRadius: 18, padding: '14px 16px' }}>
                <p className="mb-1 font-fredoka font-semibold" style={{ fontSize: 15, color: '#4E7A28' }}>Lebih mudah</p>
                <p className="font-nunito font-semibold" style={{ fontSize: 14, lineHeight: 1.55, color: '#5E7748' }}>{activity.variasiMudah}</p>
              </div>
              <div style={{ background: '#FFF2D0', borderRadius: 18, padding: '14px 16px' }}>
                <p className="mb-1 font-fredoka font-semibold" style={{ fontSize: 15, color: '#8A5510' }}>Lebih menantang</p>
                <p className="font-nunito font-semibold" style={{ fontSize: 14, lineHeight: 1.55, color: '#7A5E2A' }}>{activity.variasiMenantang}</p>
              </div>
            </div>

            {/* Adaptasi ABK */}
            <div style={{ background: '#F1EBFB', borderRadius: 20, padding: '16px 18px' }}>
              <p className="mb-1 font-fredoka font-semibold" style={{ fontSize: 17, color: '#6244B8' }}>Adaptasi untuk anak dengan kebutuhan khusus</p>
              <p className="font-nunito font-semibold" style={{ fontSize: 15, lineHeight: 1.6, color: '#6B5A93' }}>{activity.adaptasiABK}</p>
            </div>
          </div>
        </div>

        {/* Footer (tetap) */}
        <div className="flex gap-3" style={{ borderTop: '1.5px solid #F3E7D6', padding: '16px 28px 20px' }}>
          <button type="button"
            onClick={() => toggleSaved('activities', activity.id)}
            className="flex items-center gap-1.5 rounded-[16px] border-2 px-5 py-2.5 font-nunito text-[14px] font-bold transition"
            style={saved ? { borderColor: '#F5B9D6', background: '#FCE3EE', color: '#C6407F' } : { borderColor: '#F2E4D2', background: '#fff', color: '#9B7E92' }}>
            <Star className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
            {saved ? 'Disimpan' : 'Simpan'}
          </button>
          {onJadwalkan ? (
            <button type="button"
              onClick={onJadwalkan}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[16px] bg-rekah py-2.5 font-nunito text-[14px] font-bold text-white transition hover:bg-rekah-tua">
              <CheckCircle2 className="h-4 w-4" />
              Jadwalkan Kegiatan Ini
            </button>
          ) : (
            <button type="button"
              onClick={() => toggleDone(activity.id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[16px] py-2.5 font-nunito text-[14px] font-bold text-white transition"
              style={done ? { background: '#2E8B57' } : { background: '#F06BA8' }}>
              <CheckCircle2 className="h-4 w-4" />
              {done ? 'Sudah Dicoba!' : 'Tandai Sudah Dicoba'}
            </button>
          )}
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

  const pal = STR_DOM[tool.domain] ?? STR_DOM.kog;

  return (
    <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(110,59,87,0.42)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden bg-white animate-[slideUp_0.3s_ease-out]"
        style={{ maxWidth: 620, borderRadius: 30, boxShadow: '0 40px 80px -40px rgba(90,50,70,.75)' }}>
        <div className="relative flex items-start gap-4" style={{ background: pal.soft, padding: '24px 28px' }}>
          <span className="flex shrink-0 items-center justify-center rounded-[18px] bg-white" style={{ width: 62, height: 62 }}>
            <DomIcon domain={tool.domain} size={30} color={pal.ink} />
          </span>
          <div className="min-w-0 flex-1 pr-8">
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {tool.pilihanPsikolog && (
                <span className="rounded-full px-2.5 py-0.5 font-nunito text-[11px] font-[800]" style={{ background: '#F1EBFB', color: '#8A6DC7' }}>
                  ⭐ Pilihan Psikolog
                </span>
              )}
              <span className="rounded-full px-2.5 py-0.5 font-nunito text-[11px] font-[800]" style={{ background: '#FFE29A', color: '#8A5510' }}>{tool.ageLabel}</span>
            </div>
            <h2 className="font-fredoka font-bold text-pekat" style={{ fontSize: 26, lineHeight: 1.15 }}>{tool.nama}</h2>
            <p className="mt-0.5 font-nunito font-bold" style={{ fontSize: 13.5, color: pal.ink }}>{tool.hargaEstimasi}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup"
            className="absolute right-5 top-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-pekat/60 transition hover:text-pekat"
            style={{ background: 'rgba(255,255,255,.75)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: '24px 28px' }}>
          <div className="flex flex-col gap-5">
            <p className="font-nunito font-semibold" style={{ fontSize: 15, lineHeight: 1.6, color: '#7A5E71' }}>{tool.deskripsi}</p>

            <div style={{ background: '#EEF4FE', border: '1.5px solid #D5E4FB', borderRadius: 20, padding: '16px 18px' }}>
              <p className="mb-1 flex items-center gap-1.5 font-fredoka font-semibold" style={{ fontSize: 17, color: '#2F5BB7' }}>
                <FlaskConical className="h-4 w-4" /> Kenapa ini bermanfaat?
              </p>
              <p className="font-nunito font-semibold" style={{ fontSize: 15, lineHeight: 1.6, color: '#5B6E93' }}>{tool.sci}</p>
              <p className="mt-2 font-nunito font-bold" style={{ fontSize: 12.5, color: '#7C93C4' }}>Sumber: {tool.sumber}</p>
            </div>

            <div>
              <p className="mb-2 font-fredoka font-semibold text-pekat" style={{ fontSize: 17 }}>Keunggulan</p>
              <ul className="space-y-2">
                {tool.keunggulan.map((k, i) => (
                  <li key={i} className="flex items-start gap-2 font-nunito font-semibold" style={{ fontSize: 15, lineHeight: 1.55, color: '#7A5E71' }}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#2E8B57' }} />
                    {k}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3" style={{ borderTop: '1.5px solid #F3E7D6', padding: '16px 28px 20px' }}>
          <button type="button" aria-label={saved ? 'Batal simpan' : 'Simpan'}
            onClick={() => toggleSaved('tools', tool.id)}
            className="flex items-center gap-1.5 rounded-[16px] border-2 px-5 py-2.5 font-nunito text-[14px] font-bold transition"
            style={saved ? { borderColor: '#F5B9D6', background: '#FCE3EE', color: '#C6407F' } : { borderColor: '#F2E4D2', background: '#fff', color: '#9B7E92' }}>
            <Star className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
          </button>
          <button type="button"
            onClick={() => toggleOwned(tool.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[16px] py-2.5 font-nunito text-[14px] font-bold text-white transition"
            style={owned ? { background: '#2E8B57' } : { background: '#F06BA8' }}>
            <ShoppingBag className="h-4 w-4" />
            {owned ? 'Sudah Punya' : 'Tandai Sudah Punya'}
          </button>
          {/* TODO: catat event klik untuk analytics affiliate */}
          <a
            href={tool.affiliateUrl && tool.affiliateUrl !== '#todo' && tool.affiliateUrl !== ''
              ? tool.affiliateUrl
              : `https://shopee.co.id/search?keyword=${encodeURIComponent(tool.nama)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-[16px] border-2 px-4 py-2.5 font-nunito text-[14px] font-bold transition"
            style={{ borderColor: '#F6D0B8', background: '#FDE8DC', color: '#D9743A' }}
          >
            <ShoppingBag className="h-4 w-4" />
            {tool.affiliateUrl && tool.affiliateUrl !== '#todo' && tool.affiliateUrl !== '' ? 'Beli via Shopee' : 'Cari di Shopee'}
          </a>
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

  const pal = DL_PAL;

  return (
    <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(110,59,87,0.42)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden bg-white animate-[slideUp_0.3s_ease-out]"
        style={{ maxWidth: 620, borderRadius: 30, boxShadow: '0 40px 80px -40px rgba(90,50,70,.75)' }}>
        <div className="relative flex items-start gap-4" style={{ background: pal.soft, padding: '24px 28px' }}>
          <span className="flex shrink-0 items-center justify-center rounded-[18px] bg-white" style={{ width: 62, height: 62 }}>
            <Download className="h-7 w-7" style={{ color: pal.ink }} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1 pr-8">
            <span className="font-nunito text-[11px] font-[800] uppercase tracking-wider" style={{ color: pal.ink }}>{item.kategori}</span>
            <h2 className="font-fredoka font-bold text-pekat" style={{ fontSize: 24, lineHeight: 1.15 }}>{item.nama}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 font-nunito text-[12px] font-semibold" style={{ color: '#A98DA0' }}>
              <span>{ageLabel(item.minBulan, item.maxBulan)}</span>
              <span>·</span>
              <span>{item.halaman}</span>
              <span>·</span>
              <span>{item.jumlahUnduhan.toLocaleString('id')} unduhan</span>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup"
            className="absolute right-5 top-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-pekat/60 transition hover:text-pekat"
            style={{ background: 'rgba(255,255,255,.75)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: '24px 28px' }}>
          <div className="flex flex-col gap-5">
            <p className="font-nunito font-semibold" style={{ fontSize: 15, lineHeight: 1.6, color: '#7A5E71' }}>{item.deskripsi}</p>

            <div style={{ background: '#EEF4FE', border: '1.5px solid #D5E4FB', borderRadius: 20, padding: '16px 18px' }}>
              <p className="mb-1 flex items-center gap-1.5 font-fredoka font-semibold" style={{ fontSize: 17, color: '#2F5BB7' }}>
                <FlaskConical className="h-4 w-4" /> Kenapa ini bermanfaat?
              </p>
              <p className="font-nunito font-semibold" style={{ fontSize: 15, lineHeight: 1.6, color: '#5B6E93' }}>{item.sci}</p>
              <p className="mt-2 font-nunito font-bold" style={{ fontSize: 12.5, color: '#7C93C4' }}>Sumber: {item.sumber}</p>
            </div>

            <div>
              <p className="mb-1 font-fredoka font-semibold text-pekat" style={{ fontSize: 17 }}>Cara Menggunakan</p>
              <p className="font-nunito font-semibold" style={{ fontSize: 15, lineHeight: 1.6, color: '#7A5E71' }}>{item.caraPakai}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3" style={{ borderTop: '1.5px solid #F3E7D6', padding: '16px 28px 20px' }}>
          <button type="button" aria-label={saved ? 'Batal simpan' : 'Simpan'}
            onClick={() => toggleSaved('downloads', item.id)}
            className="flex items-center gap-1.5 rounded-[16px] border-2 px-5 py-2.5 font-nunito text-[14px] font-bold transition"
            style={saved ? { borderColor: '#F5B9D6', background: '#FCE3EE', color: '#C6407F' } : { borderColor: '#F2E4D2', background: '#fff', color: '#9B7E92' }}>
            <Star className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
          </button>
          <button type="button"
            onClick={() => {
              toggleDownloaded(item.id);
              // TODO: open fileUrl when backend provides real download link
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[16px] py-2.5 font-nunito text-[14px] font-bold text-white transition"
            style={downloaded ? { background: '#2E8B57' } : { background: '#F06BA8' }}>
            <Download className="h-4 w-4" />
            {downloaded ? 'Sudah Diunduh' : 'Unduh Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Strategi Belajar design tokens ───────────────────────────────────────────

const STR_DOM: Record<DomainKey, {
  soft: string; softLo: string; ink: string; blob: string; border: string; icon: string[];
}> = {
  mk:  { soft:'#E9F4DD', softLo:'#DCEBC8', ink:'#5E8A34', blob:'#CDE6B4', border:'#D6E7B0',
         icon:['M3 12h3l2-6 4 13 3-9 2 2h4'] },
  mh:  { soft:'#FFF2D0', softLo:'#FBE6B0', ink:'#BF8A18', blob:'#FADD8C', border:'#F3D488',
         icon:['M8 13V6.5a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V11m0-3a1.5 1.5 0 0 1 3 0v5a6 6 0 0 1-6 6 6 6 0 0 1-5-2.6L6 16'] },
  bhs: { soft:'#E3EEFD', softLo:'#CFE0FA', ink:'#4A72D6', blob:'#BCD6FA', border:'#C6DBFB',
         icon:['M4 5h16v11H9l-5 4V5z'] },
  kog: { soft:'#F1EBFB', softLo:'#E4D8F5', ink:'#8A6DC7', blob:'#D8C9F2', border:'#DCCEF3',
         icon:['M9 18h6','M10 21h4','M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.1 1 1.9h5c.1-.8.4-1.4 1-1.9A6 6 0 0 0 12 3z'] },
  sos: { soft:'#FCE1ED', softLo:'#F8CBDF', ink:'#DC4E8B', blob:'#F6C2DB', border:'#F7C8DF',
         icon:['M12 20s-7-4.6-7-9.6C5 7.9 7 6 9.2 6c1.3 0 2.3.6 2.8 1.4C12.5 6.6 13.5 6 14.8 6 17 6 19 7.9 19 10.4c0 5-7 9.6-7 9.6z'] },
  sen: { soft:'#FDE8DC', softLo:'#F8D3BC', ink:'#D9743A', blob:'#F8CBAC', border:'#F6D0B8',
         icon:['M12 3l1.8 4.9L19 9.5l-5.2 1.6L12 16l-1.8-4.9L5 9.5l5.2-1.6z'] },
  // MENUNGGU REVIEW PSIKOLOG FITRI — domain ke-7, belum ada kegiatan yang ditag
  fe:  { soft:'#E0F2FE', softLo:'#BAE6FD', ink:'#0369A1', blob:'#7DD3FC', border:'#BAE6FD',
         icon:['M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'] },
};

interface SeedActivity {
  id: number; age: string; doms: DomainKey[]; title: string;
  dur: string; diy: boolean; desc: string; evidence: string;
}

const SEED_ACTS: SeedActivity[] = [
  { id:0, age:'0–3 bln', doms:['mk'], title:'Tummy Time Bertahap', dur:'5 mnt', diy:false,
    desc:'Latihan tengkurap singkat dicicil beberapa kali sehari, dimulai di dada orang tua lalu di alas datar.',
    evidence:'Systematic review mengaitkan tummy time dengan perkembangan motorik kasar (berguling, merangkak) yang lebih baik.' },
  { id:1, age:'0–3 bln', doms:['sen'], title:'Kartu Kontras Hitam-Putih', dur:'5 mnt', diy:false,
    desc:'Menunjukkan pola kontras tinggi pada jarak 20–30 cm dari wajah bayi untuk melatih fokus visual awal.',
    evidence:'Bayi baru lahir secara bawaan lebih lama menatap pola kontras tinggi dan wajah dibanding permukaan polos.' },
  { id:2, age:'0–3 bln', doms:['bhs','sos'], title:'Saling Balas Celoteh', dur:'10 mnt', diy:true,
    desc:'Menanggapi setiap suara dan ekspresi bayi dengan tatapan, senyum, dan bicara bernada lembut bergantian.',
    evidence:'Interaksi serve & return yang responsif membangun arsitektur otak awal dan pondasi bahasa.' },
  { id:3, age:'3–6 bln', doms:['mh'], title:'Genggam & Lepas', dur:'8 mnt', diy:false,
    desc:'Menawarkan mainan bertekstur ringan agar bayi berlatih meraih, menggenggam, memindah, lalu melepas.',
    evidence:'Latihan menggenggam dini melatih koordinasi mata-tangan yang mendahului keterampilan menjimpit.' },
  { id:4, age:'4–6 bln', doms:['sos','kog'], title:'Cermin Ajaib', dur:'6 mnt', diy:true,
    desc:'Duduk bersama di depan cermin aman, menamai wajah dan ekspresi untuk membangun kesadaran diri.',
    evidence:'Permainan cermin mendukung kesadaran diri awal dan pengenalan emosi lewat wajah.' },
  { id:5, age:'3–6 bln', doms:['kog','sen'], title:'Buku Kain Sederhana', dur:'12 mnt', diy:true,
    desc:'Menjelajah buku kain bertekstur, warna, dan bunyi kemericik untuk melatih sebab-akibat dan indra.',
    evidence:'Eksplorasi multisensori mendukung pemahaman sebab-akibat dan rentang perhatian pada bayi.' },
];

// ── StratActivityCard ─────────────────────────────────────────────────────────

function StratActivityCard({ act, saved, tried, onSave, onTry }: {
  act: SeedActivity; saved: boolean; tried: boolean; onSave: () => void; onTry: () => void;
}) {
  const d = STR_DOM[act.doms[0]];
  return (
    <div style={{ border:`2px solid ${d.border}`, borderRadius:26, overflow:'hidden', background:'#fff',
      boxShadow:'0 20px 40px -30px rgba(90,50,70,.55)', display:'flex', flexDirection:'column' }}>
      {/* Header band */}
      <div style={{ height:132, background:`linear-gradient(135deg,${d.soft},${d.softLo})`,
        position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {tried && (
          <div style={{ position:'absolute', top:10, left:12, background:'#3FBF6A', borderRadius:999,
            padding:'3px 10px', display:'flex', alignItems:'center', gap:4,
            fontSize:11, fontWeight:700, color:'#fff', fontFamily:"'Nunito',sans-serif" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Sudah dicoba
          </div>
        )}
        <div style={{ position:'absolute', top:-20, right:-20, width:90, height:90, borderRadius:'50%', background:d.blob, opacity:.5 }} />
        <div style={{ position:'absolute', bottom:-14, left:-14, width:60, height:60, borderRadius:'50%', background:d.blob, opacity:.35 }} />
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 16px rgba(0,0,0,.08)', position:'relative', zIndex:1 }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={d.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {d.icon.map((path, i) => <path key={i} d={path} />)}
          </svg>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding:'18px 20px 0', flex:1, display:'flex', flexDirection:'column', gap:9 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, alignItems:'center' }}>
          <span style={{ background:'#FFF2D0', color:'#A9791C', borderRadius:999, padding:'2px 10px',
            fontSize:11, fontWeight:700, fontFamily:"'Nunito',sans-serif" }}>{act.age}</span>
          {act.doms.map(dk => {
            const dt = STR_DOM[dk];
            return (
              <span key={dk} style={{ background:dt.soft, color:dt.ink, borderRadius:999, padding:'2px 9px',
                fontSize:11, fontWeight:700, fontFamily:"'Nunito',sans-serif",
                display:'inline-flex', alignItems:'center', gap:4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  {dt.icon.map((p, i) => <path key={i} d={p} />)}
                </svg>
                {DOMAIN_META[dk].label}
              </span>
            );
          })}
          {act.diy && (
            <span style={{ background:'#E9F4DD', color:'#5E8A34', borderRadius:999, padding:'2px 9px',
              fontSize:11, fontWeight:700, fontFamily:"'Nunito',sans-serif" }}>DIY</span>
          )}
        </div>
        <p style={{ fontFamily:"'Fredoka',sans-serif", fontWeight:600, fontSize:22, color:'#6E3B57', lineHeight:1.2, margin:0 }}>
          {act.title}
        </p>
        <p style={{ fontFamily:"'Nunito',sans-serif", fontWeight:600, fontSize:14.5, color:'#7A5E71',
          lineHeight:1.5, margin:0, display:'-webkit-box', WebkitLineClamp:3,
          WebkitBoxOrient:'vertical' as React.CSSProperties['WebkitBoxOrient'], overflow:'hidden' }}>
          {act.desc}
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontFamily:"'Nunito',sans-serif", fontSize:12, color:'#A98DA0' }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {act.dur}
          </span>
        </div>
        <div style={{ background:d.soft, borderRadius:14, padding:'8px 10px',
          display:'flex', alignItems:'flex-start', gap:7, marginTop:'auto', marginBottom:0 }}>
          <FlaskConical style={{ width:13, height:13, flexShrink:0, marginTop:2, color:d.ink } as React.CSSProperties} strokeWidth={2.2} />
          <p style={{ fontFamily:"'Nunito',sans-serif", fontWeight:600, fontSize:12, color:d.ink, lineHeight:1.5, margin:0 }}>
            {act.evidence}
          </p>
        </div>
      </div>
      {/* Footer */}
      <div style={{ borderTop:'1px solid #F3E7D9', padding:'10px 14px', marginTop:14,
        display:'flex', alignItems:'center', gap:6 }}>
        <button type="button" onClick={onTry} style={{ flex:1, background:'none', border:'none', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13,
          color: tried ? '#5E8A34' : '#6E3B57', padding:'6px 0' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill={tried ? '#5E8A34' : 'none'}
            stroke={tried ? '#5E8A34' : '#6E3B57'} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 12.5l2.2 2.2 4.8-5" /><path d="M21 12a9 9 0 1 1-4-7.5" />
          </svg>
          {tried ? 'Sudah dicoba' : 'Tandai Dicoba'}
        </button>
        <div style={{ width:1, height:20, background:'#F3E7D9' }} />
        <button type="button" onClick={onSave} style={{ width:40, height:36, background:'none', border:'none',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="17" height="17" viewBox="0 0 24 24"
            fill={saved ? '#F0B429' : 'none'} stroke={saved ? '#F0B429' : '#C7A9BE'}
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Tab types & config ────────────────────────────────────────────────────────

type Tab = 'aktivitas' | 'alat' | 'unduhan' | 'selesai';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ViewMode = 'personal' | 'browse';

// ── PersonalView ──────────────────────────────────────────────────────────────

// Komponen ini belum terpasang di mana pun — toggle Personal/Browse belum
// dihidupkan. Dibiarkan utuh, bukan dihapus, karena ia kerja yang sudah jadi.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // Anak aktif dari AnakContext. Pemilihan anak terjadi di layar Pilih Anak
  // sebelum dashboard, jadi halaman ini tidak lagi punya pemilih anak sendiri.
  const { anak: child, usiaBulan: ageMonths } = useAnakAktif();
  const fotoAnak = useFotoAnak(child.fotoPath);
  const selectedChildId = child.id;
  const { totalSaved, doneCount, getFollowedPlanId, unfollowPlan, isPlanDayDone, getPlanProgress, isPlanDone, isDone, isOwned, isDownloaded, publishedActivities: managedActivities, publishedPlans: managedPlans, publishedTools: managedTools, publishedDownloads: managedDownloads } = useLearningStrategies();
  const [gridTab, setGridTab] = useState<Tab>('aktivitas');

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

  const currentRange = AGE_RANGES.find(r => r.id === bestAgeRangeId(ageMonths));

  // Sudah Dilakukan counts
  const doneActivitiesAge = allActivities.filter(a => isDone(a.id));
  const donePlansAge      = allPlans.filter(p => isPlanDone(p.id));
  const doneToolsAge      = allTools.filter(t => isOwned(t.id));
  const doneDownloadsAge  = allDownloads.filter(d => isDownloaded(d.id));
  const doneTotal = doneActivitiesAge.length + donePlansAge.length + doneToolsAge.length + doneDownloadsAge.length;

  const GRID_TABS: { id: Tab; label: string; count: number }[] = [
    { id: 'aktivitas', label: 'Aktivitas',      count: allActivities.length },
    { id: 'alat',      label: 'Alat Edukasi',    count: allTools.length },
    { id: 'unduhan',   label: 'Unduhan',          count: allDownloads.length },
    { id: 'selesai',   label: 'Sudah Dilakukan', count: doneTotal },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Pemilihan anak dilakukan di layar Pilih Anak sebelum dashboard. */}

      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-5">
        {/* Child info */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
            {fotoAnak
              ? <img src={fotoAnak} alt="" className="h-14 w-14 rounded-2xl object-cover" />
              : '👶'}
          </div>
          <div className="flex-1">
            <p className="font-baloo text-[18px] font-bold text-stv-navy">{child.namaAnak}</p>
            <p className="text-[13px] text-stv-muted">
              {formatUsia(ageMonths)}
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
              Rekomendasi untuk {child.namaAnak} hari ini
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
        <EmptyState message={`Belum ada konten untuk usia ${formatUsia(ageMonths)}.`} />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const STR_TAB_DEFS: { id: Tab; label: string; icon: string[]; count: number }[] = [
  { id:'aktivitas', label:'Aktivitas',      count:78, icon:['M14 4l6 6-10 10-6 0 0-6z','M13 5l6 6'] },
  { id:'alat',      label:'Alat Edukasi',    count:14, icon:['M14 7a4 4 0 0 1-5 5l-5 5 2 2 5-5a4 4 0 0 1 5-5z'] },
  { id:'unduhan',   label:'Unduhan',          count:12, icon:['M12 4v11','M8 11l4 4 4-4','M5 20h14'] },
  { id:'selesai',   label:'Sudah Dilakukan', count:0,  icon:['M8.5 12.5l2.2 2.2 4.8-5','M21 12a9 9 0 1 1-4-7.5'] },
];

const OTHER_MAP: Record<string, { title: string; sub: string; bot: { type: BotanicalConfig['type']; bloom?: string; bloom2?: string; center?: string } }> = {
  alat:    { title:'Alat Edukasi', sub:'14 alat bantu dan permainan edukatif pilihan. Segera hadir.',
    bot:{ type:'daisy', bloom:'#8FB8F7', bloom2:'#5F84E6', center:'#FFE29A' } },
  unduhan: { title:'Materi Unduhan', sub:'12 lembar kegiatan dan panduan siap cetak. Segera hadir.',
    bot:{ type:'bell', bloom:'#F8B9D4', bloom2:'#F06BA8' } },
};

export default function LearningStrategiesTier2() {
  const [domain, setDomain] = useState<DomainKey | 'Semua Domain'>('Semua Domain');
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<Tab>('aktivitas');
  const [savedOnly, setSavedOnly] = useState(false);
  const [triedOnly, setTriedOnly] = useState(false);
  const [saved, setSaved] = useState<Record<number, boolean>>({ 4: true });
  const [tried, setTried] = useState<Record<number, boolean>>({ 5: true });

  const toggleSave = (id: number) => setSaved(s => ({ ...s, [id]: !s[id] }));
  const toggleTry  = (id: number) => setTried(s => ({ ...s, [id]: !s[id] }));

  const filteredActs = useMemo(() => {
    const qLow = q.trim().toLowerCase();
    return SEED_ACTS.filter(a => {
      if (domain !== 'Semua Domain' && !a.doms.includes(domain as DomainKey)) return false;
      if (savedOnly && !saved[a.id]) return false;
      if (triedOnly && !tried[a.id]) return false;
      if (qLow && !(a.title.toLowerCase().includes(qLow) || a.desc.toLowerCase().includes(qLow))) return false;
      return true;
    });
  }, [domain, q, savedOnly, triedOnly, saved, tried]);

  const triedCount = Object.values(tried).filter(Boolean).length;
  const showGrid   = tab === 'aktivitas' || tab === 'selesai';
  const gridCards  = tab === 'selesai' ? filteredActs.filter(a => tried[a.id]) : filteredActs;
  const n = gridCards.length;
  const resultLine = tab === 'selesai'
    ? `${n} aktivitas sudah dilakukan`
    : (n === SEED_ACTS.length ? `${n} aktivitas berbasis riset` : `${n} aktivitas ditemukan`);

  const TABS = STR_TAB_DEFS.map(t => ({
    ...t, count: t.id === 'selesai' ? triedCount : t.count,
  }));

  const domainKeys = Object.keys(STR_DOM) as DomainKey[];

  return (
    <div style={{ position:'relative', overflow:'hidden', background:'#FBEFDF',
      borderRadius:34, padding:'26px 30px 44px',
      boxShadow:'0 30px 60px -44px rgba(90,50,70,.6)' }}>

      {/* ── Floral pattern layer ── */}
      <div style={{ position:'absolute', inset:0, zIndex:0, pointerEvents:'none' }}>
        {/* Botanical sprigs */}
        {[
          { l:'-1%',  t:110,  w:120, rot:-8,  anim:'animate-sway2', cfg:{ type:'tulip'    as const, bloom:'#F8B9D4', bloom2:'#F06BA8', center:'#6E3B57' } },
          { l:'87%',  t:70,   w:120, rot:10,  anim:'animate-sway',  cfg:{ type:'daisy'    as const, bloom:'#8FB8F7', bloom2:'#5F84E6', center:'#FFE29A' } },
          { l:'92%',  t:460,  w:100, rot:-12, anim:'animate-sway2', cfg:{ type:'bell'     as const, bloom:'#F8B9D4', bloom2:'#F06BA8' } },
          { l:'-1.4%',t:580,  w:100, rot:9,   anim:'animate-sway',  cfg:{ type:'foliage'  as const, leaf:'#B7D06A', leaf2:'#9CC050' } },
          { l:'90%',  t:880,  w:118, rot:8,   anim:'animate-sway',  cfg:{ type:'tulip'    as const, bloom:'#8FB8F7', bloom2:'#5F84E6', center:'#6E3B57' } },
          { l:'-0.7%',t:980,  w:112, rot:-10, anim:'animate-sway2', cfg:{ type:'fivepetal'as const, bloom:'#F8B9D4', center:'#F06BA8' } },
          { l:'10%',  t:1130, w:92,  rot:6,   anim:'animate-sway',  cfg:{ type:'sprig'    as const, bloom:'#5F84E6', bloom2:'#8FB8F7' } },
          { l:'78%',  t:1150, w:96,  rot:-7,  anim:'animate-sway2', cfg:{ type:'daisy'    as const, bloom:'#F06BA8', bloom2:'#F8B9D4', center:'#FFE29A' } },
        ].map(({ l, t: top, w, rot, anim, cfg }, i) => (
          <div key={i} style={{ position:'absolute', left:l, top, width:w, opacity:.14,
            transform:`rotate(${rot}deg)`, transformOrigin:'center bottom' }}
            className={anim}>
            <BotanicalStem cfg={cfg} />
          </div>
        ))}
        {/* Flower marks */}
        {[
          { l:'81%', t:150, w:58, cfg:{ shape:'cosmos'  as const, petalColors:['#F8B9D4','#F06BA8'], centerColors:['#6E3B57','#F06BA8','#FFE29A'], jitter:.18 } },
          { l:'4%',  t:380, w:50, cfg:{ shape:'gerbera' as const, petalColors:['#8FB8F7','#5F84E6'], centerColors:['#6E3B57','#F06BA8','#FFE29A'], jitter:.18 } },
          { l:'95%', t:700, w:46, cfg:{ shape:'daisy'   as const, petalColors:['#FFE29A','#F8B9D4'], centerColors:['#6E3B57','#F06BA8','#FFE29A'], jitter:.18 } },
          { l:'1.4%',t:840, w:52, cfg:{ shape:'scallop' as const, petalColors:['#F8B9D4','#F06BA8'], centerColors:['#6E3B57','#F06BA8','#FFE29A'], jitter:.18 } },
          { l:'86%', t:1060,w:50, cfg:{ shape:'cosmos'  as const, petalColors:['#8FB8F7','#C9B8F0'], centerColors:['#6E3B57','#F06BA8','#FFE29A'], jitter:.18 } },
          { l:'44%', t:1200,w:46, cfg:{ shape:'gerbera' as const, petalColors:['#F06BA8','#F8B9D4'], centerColors:['#6E3B57','#F06BA8','#FFE29A'], jitter:.18 } },
        ].map(({ l, t: top, w, cfg }, i) => (
          <div key={i} style={{ position:'absolute', left:l, top, width:w, height:w, opacity:.14 }}
            className="animate-sway2">
            <FlowerMark cfg={cfg} />
          </div>
        ))}
      </div>

      {/* ── Content layer ── */}
      <div style={{ position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:'#F06BA8',
            letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 0 6px' }}>
            BEKAL
          </p>
          <h1 style={{ fontFamily:"'Fredoka',sans-serif", fontWeight:700, fontSize:52, color:'#6E3B57',
            lineHeight:1.1, margin:'0 0 8px' }}>
            Ajak Main
          </h1>
          <p style={{ fontFamily:"'Shantell Sans',cursive", fontWeight:600, fontSize:21, color:'#F06BA8', margin:0 }}>
            Aktivitas berbasis riset, alat edukasi, dan materi unduhan.
          </p>
        </div>

        {/* Search */}
        <div style={{ position:'relative', marginBottom:18 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F06BA8" strokeWidth={2.2}
            strokeLinecap="round" strokeLinejoin="round"
            style={{ position:'absolute', left:18, top:'50%', transform:'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Cari aktivitas, alat, atau unduhan…"
            style={{ width:'100%', borderRadius:999, border:'2px solid #F6E3D0', background:'#fff',
              padding:'13px 18px 13px 46px', fontFamily:"'Nunito',sans-serif", fontWeight:700,
              fontSize:16, color:'#6E3B57', outline:'none', boxSizing:'border-box' }}
          />
        </div>

        {/* Domain chips */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
          {(['Semua Domain', ...domainKeys] as const).map(key => {
            const isAll = key === 'Semua Domain';
            const isActive = domain === key;
            const ink = isAll ? '#6E3B57' : STR_DOM[key as DomainKey].ink;
            const bord = isAll ? '#F2E4D2' : STR_DOM[key as DomainKey].border;
            const icon = isAll
              ? ['M4 6h16','M4 12h16','M4 18h10']
              : STR_DOM[key as DomainKey].icon;
            return (
              <button key={key} type="button" onClick={() => setDomain(key as typeof domain)}
                style={{ display:'inline-flex', alignItems:'center', gap:6, borderRadius:999,
                  padding:'7px 14px', fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13,
                  cursor:'pointer', border:`2px solid ${isActive ? ink : bord}`,
                  background: isActive ? ink : '#fff',
                  color: isActive ? '#fff' : ink }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                  stroke={isActive ? '#fff' : ink} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
                  {icon.map((d, i) => <path key={i} d={d} />)}
                </svg>
                {isAll ? 'Semua Domain' : DOMAIN_META[key as DomainKey].label}
              </button>
            );
          })}
        </div>

        {/* Toggle chips */}
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          <button type="button" onClick={() => setSavedOnly(v => !v)}
            style={{ display:'inline-flex', alignItems:'center', gap:7, borderRadius:999,
              padding:'7px 15px', fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13,
              cursor:'pointer', border:`2px solid ${savedOnly ? '#F0B429' : '#F2E4D2'}`,
              background: savedOnly ? '#F0B429' : '#fff',
              color: savedOnly ? '#fff' : '#F0B429' }}>
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill={savedOnly ? '#fff' : 'none'} stroke={savedOnly ? '#fff' : '#F0B429'}
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z" />
            </svg>
            Disimpan
          </button>
          <button type="button" onClick={() => setTriedOnly(v => !v)}
            style={{ display:'inline-flex', alignItems:'center', gap:7, borderRadius:999,
              padding:'7px 15px', fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13,
              cursor:'pointer', border:`2px solid ${triedOnly ? '#5E8A34' : '#F2E4D2'}`,
              background: triedOnly ? '#5E8A34' : '#fff',
              color: triedOnly ? '#fff' : '#5E8A34' }}>
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke={triedOnly ? '#fff' : '#5E8A34'}
              strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 12.5l2.2 2.2 4.8-5" /><path d="M21 12a9 9 0 1 1-4-7.5" />
            </svg>
            Sudah Dicoba
          </button>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom:'2px solid #F1E2D0', display:'flex', gap:2, marginBottom:20, overflowX:'auto' }}>
          {TABS.map(t => {
            const isActive = tab === t.id;
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'12px 16px',
                  fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:14,
                  color: isActive ? '#E0762A' : '#A98DA0', background:'none', border:'none',
                  borderBottom: isActive ? '3px solid #E0762A' : '3px solid transparent',
                  cursor:'pointer', whiteSpace:'nowrap', marginBottom:-2 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
                  {t.icon.map((d, i) => <path key={i} d={d} />)}
                </svg>
                {t.label}
                <span style={{ background: isActive ? '#FFE7CF' : '#F1E2D0',
                  color: isActive ? '#E0762A' : '#A98DA0',
                  borderRadius:999, padding:'1px 8px', fontSize:11, fontWeight:700,
                  fontFamily:"'Nunito',sans-serif" }}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Result line */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:20, fontFamily:"'Fredoka',sans-serif" }}>
          <span style={{ fontWeight:600, fontSize:16, color:'#6E3B57' }}>{resultLine}</span>
          <span style={{ fontWeight:600, fontSize:13, color:'#A98DA0' }}>Urut · Paling relevan</span>
        </div>

        {/* Body */}
        {showGrid ? (
          gridCards.length === 0 ? (
            <div style={{ background:'#fff', borderRadius:20, padding:'48px 24px', textAlign:'center' }}>
              <p style={{ fontFamily:"'Shantell Sans',cursive", fontWeight:600, fontSize:18, color:'#A98DA0', margin:'0 0 6px' }}>
                Tidak ada aktivitas yang cocok…
              </p>
              <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:'#A98DA0', margin:0 }}>
                Coba ubah filter atau kata kunci pencarian.
              </p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
              {gridCards.map(act => (
                <StratActivityCard key={act.id} act={act}
                  saved={!!saved[act.id]} tried={!!tried[act.id]}
                  onSave={() => toggleSave(act.id)} onTry={() => toggleTry(act.id)} />
              ))}
            </div>
          )
        ) : (
          /* Coming soon panel */
          (() => {
            const other = OTHER_MAP[tab] ?? OTHER_MAP.alat;
            return (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'60px 24px 40px', gap:16 }}>
                <div style={{ width:100, opacity:.75 }} className="animate-sway">
                  <BotanicalStem cfg={other.bot} />
                </div>
                <p style={{ fontFamily:"'Fredoka',sans-serif", fontWeight:700, fontSize:28, color:'#6E3B57',
                  margin:0, textAlign:'center' }}>{other.title}</p>
                <p style={{ fontFamily:"'Nunito',sans-serif", fontWeight:600, fontSize:15, color:'#A98DA0',
                  margin:0, textAlign:'center' }}>{other.sub}</p>
              </div>
            );
          })()
        )}

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:24,
          marginTop:52, paddingTop:24, borderTop:'1px solid #F3E7D9' }}>
          <div style={{ width:56, opacity:.7, transform:'scaleX(-1)' }} className="animate-sway2">
            <BotanicalStem cfg={{ type:'fivepetal', bloom:'#F8B9D4', center:'#F06BA8' }} />
          </div>
          <span style={{ fontFamily:"'Shantell Sans',cursive", fontWeight:600, fontSize:18,
            color:'#A98DA0', textAlign:'center' }}>
            tumbuh dari bermain
          </span>
          <div style={{ width:56, opacity:.7 }} className="animate-sway">
            <BotanicalStem cfg={{ type:'bell', bloom:'#8FB8F7', bloom2:'#5F84E6' }} />
          </div>
        </div>

      </div>
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
