// KONTEN: wajib review Psikolog Fitri sebelum rilis.

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ACTIVITY_MODULES,
  NILAI_REKAH,
  AGE_BANDS,
  getAgeBand,
  type ActivityModuleId,
  type AgeBandId,
  type NilaiId,
} from '@studiva/shared';
import { Search, X, Wrench, BookOpen, ChevronRight } from 'lucide-react';
import { useRekahProfile } from '../../../context/RekahProfileContext';
import { useRekahPlan } from '../../../context/RekahPlanContext';
import LangkahKecilCard from '../../../features/rekah-plan/LangkahKecilCard';
import { JELAJAH_COPY } from '../../../features/rekah-plan/rekahJelajahCopy';

type AlatFilter = 'semua' | 'pakai' | 'tanpa';
type DurasiFilter = 5 | 10 | 15 | null;

export default function JelajahAktivitasPage() {
  const navigate = useNavigate();
  const { profile } = useRekahProfile();
  const { plan, setPlan } = useRekahPlan();
  const [feedback, setFeedback] = useState<string | null>(null);

  // ── Derive default filters from profile ─────────────────────────────────
  const childAgeBandId: AgeBandId | null = useMemo(() => {
    if (!profile) return null;
    const { tanggalLahir } = profile.anak;
    const lahir = new Date(tanggalLahir);
    const now = new Date();
    const bulan = Math.floor((now.getTime() - lahir.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    return getAgeBand(bulan)?.id ?? '25-36';
  }, [profile]);

  const defaultNilai: NilaiId[] = profile?.akar.nilaiFokus ?? [];

  // ── Filter state ────────────────────────────────────────────────────────
  const [nilaiFilter, setNilaiFilter] = useState<NilaiId[]>(
    defaultNilai.length > 0 ? defaultNilai.slice(0, 2) : [],
  );
  const [ageBandFilter, setAgeBandFilter] = useState<AgeBandId | null>(childAgeBandId);
  const [durasiFilter, setDurasiFilter] = useState<DurasiFilter>(null);
  const [alatFilter, setAlatFilter] = useState<AlatFilter>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<ActivityModuleId | null>(null);

  // ── Derived: filtered modules ───────────────────────────────────────────
  const filtered = useMemo(() => {
    return ACTIVITY_MODULES.filter(m => {
      // Nilai filter — any overlap is enough
      if (nilaiFilter.length > 0) {
        const hasNilai =
          nilaiFilter.includes(m.nilaiUtama) ||
          (m.nilaiPendukung?.some(n => nilaiFilter.includes(n)) ?? false);
        if (!hasNilai) return false;
      }

      // Usia filter
      if (ageBandFilter && !m.ageBands.includes(ageBandFilter)) return false;

      // Durasi filter
      if (durasiFilter !== null && m.durasiMenit > durasiFilter) return false;

      // Alat filter
      if (alatFilter === 'pakai' && (!m.alatEdukasi || m.alatEdukasi.length === 0)) return false;
      if (alatFilter === 'tanpa' && m.alatEdukasi && m.alatEdukasi.length > 0) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!m.judul.toLowerCase().includes(q)) return false;
      }

      return true;
    });
  }, [nilaiFilter, ageBandFilter, durasiFilter, alatFilter, searchQuery]);

  // ── Jelajah actions ─────────────────────────────────────────────────────
  const handleJadikanHariIni = useCallback((moduleId: ActivityModuleId) => {
    if (!plan) return;
    // Replace today's step (index 0) — displaced step goes back to pool (just remove from plan)
    const existing = plan.steps[0];
    const newSteps = [
      { moduleId, posisi: 1 },
      ...plan.steps.slice(1).map((s, i) => ({ ...s, posisi: i + 2 })),
    ];
    if (existing && existing.moduleId !== moduleId) {
      // displaced step removed from plan — pool naturally includes it next cycle
    }
    setPlan({ ...plan, steps: newSteps });
    setSelectedId(null);
    setFeedback(JELAJAH_COPY.jadikanHariIniOk);
    setTimeout(() => setFeedback(null), 3000);
    // TODO: persist week plan to backend when week-plan endpoint is available
  }, [plan, setPlan]);

  const handleTambahkanKePekan = useCallback((moduleId: ActivityModuleId) => {
    if (!plan) return;
    if (plan.steps.length >= 7) {
      setFeedback(JELAJAH_COPY.pekanSudahPenuh);
      setTimeout(() => setFeedback(null), 4000);
      return;
    }
    if (plan.steps.some(s => s.moduleId === moduleId)) return;
    const newSteps = [
      ...plan.steps,
      { moduleId, posisi: plan.steps.length + 1 },
    ];
    setPlan({ ...plan, steps: newSteps });
    setSelectedId(null);
    setFeedback(JELAJAH_COPY.tambahkanKePekanOk);
    setTimeout(() => setFeedback(null), 3000);
    // TODO: persist week plan to backend when week-plan endpoint is available
  }, [plan, setPlan]);

  // ── Toggle nilai chip ───────────────────────────────────────────────────
  function toggleNilai(nilaiId: NilaiId) {
    setNilaiFilter(prev =>
      prev.includes(nilaiId) ? prev.filter(n => n !== nilaiId) : [...prev, nilaiId],
    );
    setSelectedId(null);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">

      {/* ── Feedback banner ──────────────────────────────────────────────── */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-[14px] bg-pucuk px-4 py-3 text-[14px] font-semibold text-daun"
        >
          {feedback}
        </div>
      )}

      {/* ── Panduan Tumbuh Kembang entry card ───────────────────────────── */}
      <button
        type="button"
        onClick={() => navigate('/dashboard/tier2/knowledge')}
        className="flex w-full items-center gap-4 rounded-[18px] bg-white px-5 py-4 text-left shadow-[0_2px_16px_rgba(78,156,110,0.09)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(78,156,110,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-pucuk">
          <BookOpen className="h-5 w-5 text-daun" strokeWidth={1.8} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bricolage text-[14px] font-bold text-pekat">Panduan Tumbuh Kembang</p>
          <p className="mt-0.5 text-[12px] text-pekat/50">Jelajahi per usia & domain ilmu — berbasis riset</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-daun/50" strokeWidth={2} aria-hidden />
      </button>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pekat/35"
          strokeWidth={2}
          aria-hidden
        />
        <input
          type="search"
          aria-label={JELAJAH_COPY.searchAria}
          placeholder={JELAJAH_COPY.searchPlaceholder}
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setSelectedId(null); }}
          className="h-11 w-full rounded-[14px] border border-fajar bg-white pl-10 pr-4 text-[14px] text-pekat placeholder:text-pekat/35 focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Hapus pencarian"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-pekat/40 hover:text-pekat"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Nilai chips */}
        <div className="flex flex-wrap gap-2">
          {NILAI_REKAH.map(nilai => {
            const active = nilaiFilter.includes(nilai.id as NilaiId);
            return (
              <button
                key={nilai.id}
                type="button"
                aria-label={JELAJAH_COPY.filterNilaiAria(nilai.label)}
                aria-pressed={active}
                onClick={() => toggleNilai(nilai.id as NilaiId)}
                className={`flex min-h-[36px] items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
                  active
                    ? 'text-white'
                    : 'border border-pekat/15 bg-white text-pekat/60 hover:border-pekat/30'
                }`}
                style={active ? { backgroundColor: nilai.warna } : undefined}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: active ? 'rgba(255,255,255,0.7)' : nilai.warna }}
                />
                {nilai.label}
              </button>
            );
          })}
        </div>

        {/* Row: usia + durasi + alat */}
        <div className="flex flex-wrap gap-2">
          {/* Pita usia */}
          <select
            value={ageBandFilter ?? ''}
            onChange={e => {
              setAgeBandFilter((e.target.value as AgeBandId) || null);
              setSelectedId(null);
            }}
            aria-label="Filter pita usia"
            className="h-9 rounded-[10px] border border-fajar bg-white px-3 text-[13px] text-pekat/70 focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20"
          >
            <option value="">{JELAJAH_COPY.filterUsiaSemua}</option>
            {AGE_BANDS.map(b => (
              <option key={b.id} value={b.id}>
                {b.id} bulan
              </option>
            ))}
          </select>

          {/* Durasi */}
          {([null, 5, 10, 15] as DurasiFilter[]).map(d => (
            <button
              key={d ?? 'semua'}
              type="button"
              aria-pressed={durasiFilter === d}
              onClick={() => { setDurasiFilter(d); setSelectedId(null); }}
              className={`flex min-h-[36px] items-center rounded-[10px] px-3 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
                durasiFilter === d
                  ? 'bg-rekah text-white'
                  : 'border border-fajar bg-white text-pekat/60 hover:border-pekat/20'
              }`}
            >
              {d === null
                ? JELAJAH_COPY.filterDurasiSemua
                : d === 5
                ? JELAJAH_COPY.filterDurasi5
                : d === 10
                ? JELAJAH_COPY.filterDurasi10
                : JELAJAH_COPY.filterDurasi15}
            </button>
          ))}

          {/* Alat toggle */}
          {(['semua', 'pakai', 'tanpa'] as AlatFilter[]).map(a => (
            <button
              key={a}
              type="button"
              aria-pressed={alatFilter === a}
              onClick={() => { setAlatFilter(a); setSelectedId(null); }}
              className={`flex min-h-[36px] items-center gap-1 rounded-[10px] px-3 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
                alatFilter === a
                  ? 'bg-pekat text-white'
                  : 'border border-fajar bg-white text-pekat/60 hover:border-pekat/20'
              }`}
            >
              {a === 'pakai' && <span aria-hidden>🧸</span>}
              {a === 'tanpa' && <span aria-hidden>🙌</span>}
              {a === 'semua'
                ? JELAJAH_COPY.filterSemuaAlatLabel
                : a === 'pakai'
                ? JELAJAH_COPY.filterPakaiAlatLabel
                : JELAJAH_COPY.filterTanpaAlatLabel}
            </button>
          ))}
        </div>
      </div>

      {/* ── Result count ───────────────────────────────────────────────── */}
      <p className="text-[13px] text-pekat/45">
        {filtered.length} aktivitas
      </p>

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="rounded-[20px] bg-white p-8 text-center shadow-[0_4px_20px_rgba(224,82,107,0.06)]">
          <p className="text-[15px] text-pekat/60">{JELAJAH_COPY.emptyState}</p>
        </div>
      )}

      {/* ── Detail view (tap to expand) ──────────────────────────────────── */}
      {selectedId && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-rekah hover:text-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah rounded"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            Kembali ke daftar
          </button>
          <LangkahKecilCard
            moduleId={selectedId}
            posisi={1}
            totalSteps={1}
            onSelesai={() => setSelectedId(null)}
            onBelumPas={() => setSelectedId(null)}
            isLast
            mode="jelajah"
            onJadikanHariIni={plan ? () => handleJadikanHariIni(selectedId) : undefined}
            onTambahkanKePekan={plan ? () => handleTambahkanKePekan(selectedId) : undefined}
          />
        </div>
      )}

      {/* ── Grid of compact cards ────────────────────────────────────────── */}
      {!selectedId && filtered.length > 0 && (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="list">
          {filtered.map(m => {
            const nilai = NILAI_REKAH.find(n => n.id === m.nilaiUtama);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  aria-label={`Lihat detail: ${m.judul}`}
                  className="w-full rounded-[16px] bg-white p-4 text-left shadow-[0_2px_12px_rgba(224,82,107,0.07)] transition hover:shadow-[0_4px_20px_rgba(224,82,107,0.13)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-bricolage text-[14px] font-bold leading-snug text-pekat">
                      {m.judul}
                    </h3>
                    {m.alatEdukasi && m.alatEdukasi.length > 0 && (
                      <Wrench
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-madu"
                        strokeWidth={2}
                        aria-label={JELAJAH_COPY.alatIconAria}
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {nilai && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{ background: `${nilai.warna}22`, color: nilai.warna }}
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ background: nilai.warna }}
                        />
                        {nilai.label}
                      </span>
                    )}
                    <span className="text-[11px] text-pekat/40">
                      {m.durasiMenit} menit
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
