// KONTEN: wajib review Psikolog Fitri sebelum rilis.

import React, { useState, useRef } from 'react';
import {
  ACTIVITY_MODULES,
  NILAI_REKAH,
  SOURCES,
  type ActivityModuleId,
} from '@studiva/shared';
import { Copy, Check, ChevronDown, ChevronUp, Share2, AlertCircle, Wrench, ArrowRightCircle, Plus } from 'lucide-react';
import { PLAN_COPY } from './rekahPlanCopy';
import { JELAJAH_COPY } from './rekahJelajahCopy';
import CeritaHariIni from './CeritaHariIni';

interface LangkahKecilCardProps {
  moduleId: ActivityModuleId;
  posisi: number;
  totalSteps: number;
  onSelesai: () => void;
  onBelumPas: () => void;
  isLast: boolean;
  mode?: 'rencana' | 'jelajah';
  onJadikanHariIni?: () => void;
  onTambahkanKePekan?: () => void;
}

export default function LangkahKecilCard({
  moduleId,
  posisi,
  totalSteps,
  onSelesai,
  onBelumPas,
  isLast,
  mode = 'rencana',
  onJadikanHariIni,
  onTambahkanKePekan,
}: LangkahKecilCardProps) {
  const modul = ACTIVITY_MODULES.find(m => m.id === moduleId);
  const [expanded, setExpanded] = useState(mode === 'jelajah');
  const [copied, setCopied] = useState(false);
  const [selesai, setSelesai] = useState(false);
  const [showRefleksi, setShowRefleksi] = useState(false);
  const scriptRef = useRef<HTMLParagraphElement>(null);

  if (!modul) return null;

  const nilai = NILAI_REKAH.find(n => n.id === modul.nilaiUtama);

  // ── Salin script ─────────────────────────────────────────────────────
  async function handleSalin() {
    if (!modul?.script) return;
    try {
      await navigator.clipboard.writeText(modul.script);
    } catch {
      // fallback untuk browser lama
      if (scriptRef.current) {
        const range = document.createRange();
        range.selectNode(scriptRef.current);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
        document.execCommand('copy');
        window.getSelection()?.removeAllRanges();
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Tandai selesai → tampilkan Cerita Hari Ini ───────────────────────
  function handleSelesai() {
    setSelesai(true);
    setTimeout(() => {
      setShowRefleksi(true);
    }, 700);
  }

  function handleRefleksiDone() {
    setShowRefleksi(false);
    onSelesai();
  }

  // ── Share ─────────────────────────────────────────────────────────────
  async function handleShare() {
    const langkahSingkat = modul!.langkah[0] ?? '';
    const script = modul!.script ?? '';
    const text = PLAN_COPY.shareText(modul!.judul, langkahSingkat, script);
    const title = PLAN_COPY.shareTitle(modul!.judul);

    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch {
        // fallback ke WhatsApp
      }
    }
    // Fallback: buka WhatsApp
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  }

  // ── Source labels ─────────────────────────────────────────────────────
  const sourceItems = (modul.sumberIds ?? [])
    .map(id => SOURCES[id])
    .filter(Boolean);

  return (
  <>
    <article
      aria-label={`Langkah ${posisi} dari ${totalSteps}: ${modul.judul}`}
      className={`rounded-[20px] bg-white p-5 shadow-[0_4px_20px_rgba(224,82,107,0.08)] transition-all ${
        selesai ? 'scale-[0.98] opacity-60' : ''
      }`}
    >
      {/* ── Header: posisi badge + judul + nilai chip + durasi ──────── */}
      <div className="mb-3 flex items-start gap-3">
        <div
          aria-hidden
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mawar text-[13px] font-bold text-rekah-tua"
        >
          {posisi}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-bricolage text-[16px] font-bold leading-snug text-pekat">
            {modul.judul}
          </h2>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {nilai && (
              <span
                role="img"
                aria-label={PLAN_COPY.nilaiChipAria(nilai.label)}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold"
                style={{ background: `${nilai.warna}22`, color: nilai.warna }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: nilai.warna }}
                />
                {nilai.label}
              </span>
            )}
            <span className="text-[12px] text-pekat/45">
              {PLAN_COPY.menitLabel(modul.durasiMenit)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Deskripsi + kenapa ini ───────────────────────────────────── */}
      <p className="mb-3 text-[14px] leading-relaxed text-pekat/65">
        {modul.deskripsi}
      </p>

      {/* Expand toggle */}
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(e => !e)}
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-rekah hover:text-rekah-tua transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah rounded"
      >
        {expanded ? PLAN_COPY.sembunyikanLabel : PLAN_COPY.selengkapnyaLabel}
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
        )}
      </button>

      {/* ── Expanded detail ───────────────────────────────────────────── */}
      {expanded && (
        <div className="mb-4 space-y-4">

          {/* Kenapa ini */}
          {modul.kenapaIni && (
            <div className="rounded-[14px] bg-fajar p-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-rekah/70">
                {PLAN_COPY.kenapaIniLabel}
              </p>
              <p className="text-[13px] leading-relaxed text-pekat/75">
                {modul.kenapaIni}
              </p>

              {/* Sumber */}
              {sourceItems.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-pekat/40">
                    {PLAN_COPY.sumberLabel}
                  </p>
                  {sourceItems.map(src => (
                    <p key={src.id} className="text-[11px] text-pekat/50 leading-snug">
                      {src.label}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Langkah */}
          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-widest text-pekat/50">
              {PLAN_COPY.langkahSectionLabel}
            </p>
            <ol className="space-y-2">
              {modul.langkah.map((l, i) => (
                <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-pekat/75">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pucuk text-[11px] font-bold text-daun">
                    {i + 1}
                  </span>
                  <span>{l}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Script */}
          {modul.script && (
            <div className="rounded-[14px] border border-mawar/50 bg-white p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[12px] font-bold uppercase tracking-widest text-pekat/50">
                  {PLAN_COPY.scriptLabel}
                </p>
                <button
                  type="button"
                  onClick={handleSalin}
                  aria-label={copied ? PLAN_COPY.salinOkLabel : PLAN_COPY.salinLabel}
                  className="flex min-h-[36px] min-w-[36px] items-center justify-center gap-1.5 rounded-[10px] border border-mawar px-3 py-1.5 text-[12px] font-semibold text-pekat/60 transition hover:bg-fajar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-daun" strokeWidth={2.5} />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                  <span>{copied ? PLAN_COPY.salinOkLabel : PLAN_COPY.salinLabel}</span>
                </button>
              </div>
              <p
                ref={scriptRef}
                className="font-caveat text-[16px] leading-relaxed text-pekat/85"
              >
                "{modul.script}"
              </p>
            </div>
          )}

          {/* Avoid */}
          {modul.avoid && (
            <div className="flex gap-2.5 rounded-[14px] bg-kanvas p-4">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-madu"
                strokeWidth={2}
                aria-hidden
              />
              <div>
                <p className="mb-1 text-[12px] font-bold uppercase tracking-widest text-pekat/50">
                  {PLAN_COPY.avoidLabel}
                </p>
                <p className="text-[13px] leading-relaxed text-pekat/65">
                  {modul.avoid}
                </p>
              </div>
            </div>
          )}

          {/* Amati */}
          {modul.amati && (
            <div className="rounded-[14px] bg-pucuk/60 p-4">
              <p className="mb-1 text-[12px] font-bold uppercase tracking-widest text-daun/80">
                {PLAN_COPY.amatiLabel}
              </p>
              <p className="text-[13px] leading-relaxed text-pekat/70">
                {modul.amati}
              </p>
            </div>
          )}

          {/* Alat Edukasi */}
          {modul.alatEdukasi && modul.alatEdukasi.length > 0 && (
            <div className="rounded-[14px] border border-madu/40 bg-kanvas p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-madu" strokeWidth={2} aria-hidden />
                <p className="text-[12px] font-bold uppercase tracking-widest text-madu/80">
                  {JELAJAH_COPY.alatSectionLabel}
                </p>
              </div>
              <div className="space-y-3">
                {modul.alatEdukasi.map((alat, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[13px] font-semibold text-pekat/80">{alat.nama}</p>
                    {alat.caraPakai && (
                      <p className="text-[12px] text-pekat/55">
                        <span className="font-semibold">{JELAJAH_COPY.alatCaraPakaiLabel}:</span> {alat.caraPakai}
                      </p>
                    )}
                    {alat.alternatifRumah && (
                      <p className="text-[12px] text-daun/80">
                        <span className="font-semibold">{JELAJAH_COPY.alatAlternatifLabel}:</span> {alat.alternatifRumah}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Aksi utama ────────────────────────────────────────────────── */}
      {mode === 'jelajah' ? (
        <div className="flex flex-col gap-2">
          {onJadikanHariIni && (
            <button
              type="button"
              onClick={onJadikanHariIni}
              aria-label={JELAJAH_COPY.jadikanHariIniAria(modul.judul)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-rekah px-4 text-[14px] font-bold text-white transition hover:bg-rekah-tua active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
            >
              <ArrowRightCircle className="h-4 w-4" strokeWidth={2} />
              {JELAJAH_COPY.jadikanHariIniCTA}
            </button>
          )}
          {onTambahkanKePekan && (
            <button
              type="button"
              onClick={onTambahkanKePekan}
              aria-label={JELAJAH_COPY.tambahkanKePekanAria(modul.judul)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[12px] border border-rekah px-4 text-[14px] font-bold text-rekah transition hover:bg-fajar active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              {JELAJAH_COPY.tambahkanKePekanCTA}
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Tandai selesai */}
          <button
            type="button"
            disabled={selesai}
            onClick={handleSelesai}
            aria-label={selesai ? PLAN_COPY.selesaiCelebration : PLAN_COPY.selesaiCTA}
            className={`relative flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[12px] px-4 text-[14px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
              selesai
                ? 'bg-daun/15 text-daun'
                : 'bg-rekah text-white hover:bg-rekah-tua active:scale-95'
            }`}
          >
            {selesai ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2.5} />
                {PLAN_COPY.selesaiCelebration}
              </>
            ) : (
              PLAN_COPY.selesaiCTA
            )}

            {/* Bloom animation saat selesai */}
            {selesai && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 animate-ping rounded-[12px] bg-madu/30"
                style={{ animationDuration: '0.6s', animationIterationCount: '1' }}
              />
            )}
          </button>

          {/* Aksi sekunder */}
          <div className="flex shrink-0 gap-2">
            {/* Belum pas hari ini */}
            {!isLast && (
              <button
                type="button"
                disabled={selesai}
                onClick={onBelumPas}
                className="flex min-h-[44px] items-center justify-center rounded-[12px] border border-fajar px-3 text-[13px] font-semibold text-pekat/55 transition hover:bg-fajar disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
              >
                {PLAN_COPY.belumPasLabel}
              </button>
            )}

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              aria-label={PLAN_COPY.bagikanLabel}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[12px] border border-fajar text-pekat/45 transition hover:bg-fajar hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
            >
              <Share2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </article>

    {/* ── Cerita Hari Ini (muncul setelah Merekah!) ─────────────── */}
    {showRefleksi && (
      <CeritaHariIni moduleId={moduleId} onDone={handleRefleksiDone} />
    )}
  </>
  );
}
