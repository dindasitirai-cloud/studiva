// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React, { useState, useEffect, useRef } from 'react';
import { NILAI, PENJELASAN_NILAI } from '../akar-keluarga/content';
import type { NilaiAkar } from '../akar-keluarga/content';
import { REGISTRY_BUNGA } from '../akar-keluarga/registryBunga';
import { resolveSikap } from '../beranda-usia/adapter/sikapAdapter';
import type { ItemSikap } from '../beranda-usia/adapter/sikapAdapter';
import { KEBIASAAN_BAIK } from './content';

interface PropsKebiasaanBaik {
  nilaiFokus: readonly NilaiAkar[];
  usiaBulan: number;
  katalogSikap: readonly ItemSikap[];
  onTanam: (nilai: NilaiAkar) => void;
}

// ─── Bunga mini untuk kartu grid ─────────────────────────────────────────────

function BungaMini({
  warnaPetal, d, kelopak, r1, r2, c1, c2, ukuran = 52, pucat = false,
}: {
  warnaPetal: string; d: string; kelopak: number;
  r1: number; r2: number; c1: string; c2: string;
  ukuran?: number; pucat?: boolean;
}) {
  const step = 360 / kelopak;
  return (
    <svg viewBox="-74 -74 148 148" width={ukuran} height={ukuran} aria-hidden>
      {Array.from({ length: kelopak }, (_, i) => (
        <path
          key={i}
          d={d}
          fill={warnaPetal}
          opacity={pucat ? 0.25 : 0.9}
          transform={`rotate(${(i * step).toFixed(2)})`}
        />
      ))}
      <circle cx="0" cy="0" r={r1} fill={c1} opacity={pucat ? 0.4 : 1} />
      <circle cx="0" cy="0" r={r2} fill={c2} opacity={pucat ? 0.4 : 1} />
    </svg>
  );
}

// ─── Popup detail nilai — muncul setelah mengetuk kartu ──────────────────────

function PopupDetailNilai({
  nilai,
  sikapList,
  sudahDitanam,
  onTanam,
  onTutup,
}: {
  nilai: NilaiAkar;
  sikapList: ItemSikap[];
  sudahDitanam: boolean;
  onTanam: () => void;
  onTutup: () => void;
}) {
  const info = PENJELASAN_NILAI[nilai];
  const bunga = REGISTRY_BUNGA.find(b => b.nama === nilai);
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onTutup(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onTutup]);

  useEffect(() => { elRef.current?.focus(); }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(110,59,87,0.25)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onTutup(); }}
    >
      <div
        ref={elRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Detail nilai ${nilai}`}
        tabIndex={-1}
        className="w-full max-w-md max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-white p-6 shadow-[0_-8px_40px_rgba(110,59,87,0.18)] sm:rounded-[24px] sm:shadow-[0_8px_40px_rgba(110,59,87,0.18)] focus:outline-none"
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {bunga && (
              <div className="flex-shrink-0">
                <BungaMini
                  warnaPetal={bunga.warnaPetal} d={bunga.d} kelopak={bunga.kelopak}
                  r1={bunga.r1} r2={bunga.r2} c1={bunga.c1} c2={bunga.c2} ukuran={44}
                />
              </div>
            )}
            <div>
              <p className="font-nunito text-[10px] font-[800] uppercase tracking-widest text-rekah/60">
                {nilai}
              </p>
              <p className="font-fraunces text-[1.05rem] italic leading-snug text-pekat/80">
                {info.tagline}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label={KEBIASAAN_BAIK.tutup}
            onClick={onTutup}
            className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[18px] text-pekat/40 hover:bg-mawar/20 hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            ×
          </button>
        </div>

        {/* Deskripsi */}
        <p className="mb-4 text-[13px] leading-relaxed text-pekat/70">{info.deskripsi}</p>

        {/* Cara merawat (umum) */}
        <div className="mb-4 rounded-[16px] border border-mawar/20 bg-white px-4 py-3">
          <p className="mb-1 font-nunito text-[10px] font-[800] uppercase tracking-wider text-pekat/40">
            {KEBIASAAN_BAIK.kebiasaanLabel}
          </p>
          <p className="text-[12px] leading-relaxed text-pekat/65">{info.caraRawat}</p>
        </div>

        {/* Kebiasaan spesifik per usia */}
        {sikapList.length > 0 && (
          <div className="mb-5 rounded-[16px] bg-fajar px-4 py-3">
            <p className="mb-2 font-nunito text-[10px] font-[800] uppercase tracking-wider text-rekah/60">
              {KEBIASAAN_BAIK.jumlahKebiasaan(sikapList.length)}
            </p>
            <ul className="space-y-2">
              {sikapList.map(s => (
                <li key={s.id} className="flex items-start gap-2 text-[12px] leading-snug text-pekat/70">
                  <span className="mt-0.5 flex-shrink-0 text-[8px] text-rekah/50">●</span>
                  {s.judul}
                </li>
              ))}
            </ul>
          </div>
        )}

        {sikapList.length === 0 && (
          <div className="mb-5 rounded-[16px] bg-fajar/50 px-4 py-3 text-center">
            <p className="text-[12px] text-pekat/50">{KEBIASAAN_BAIK.sikapSedangDilengkapi}</p>
            <p className="mt-1 text-[11px] text-pekat/35">{KEBIASAAN_BAIK.tetapBisaDitanam}</p>
          </div>
        )}

        {/* Ajakan tanam — hanya di dalam detail, bukan di daftar sekilas */}
        {sudahDitanam ? (
          <div className="rounded-[16px] bg-daun/10 px-4 py-3 text-center">
            <p className="font-nunito text-[13px] font-semibold text-daun">
              {KEBIASAAN_BAIK.sudahDiTaman}
            </p>
          </div>
        ) : (
          <div className="rounded-[16px] border border-mawar/30 bg-fajar/50 px-4 py-4">
            <p className="mb-3 text-center font-bricolage text-[14px] font-semibold text-pekat/80">
              {KEBIASAAN_BAIK.ajakanTanam(nilai)}
            </p>
            <button
              type="button"
              onClick={onTanam}
              style={{ borderRadius: '100px 100px 100px 8px' }}
              className="w-full min-h-[48px] bg-rekah px-6 text-[15px] font-bold text-white hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah transition"
            >
              {KEBIASAAN_BAIK.tombolTanam(nilai)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function KebiasaanBaik({
  nilaiFokus,
  usiaBulan,
  katalogSikap,
  onTanam,
}: PropsKebiasaanBaik) {
  const [nilaiDibuka, setNilaiDibuka] = useState<NilaiAkar | null>(null);

  const nilaiFokusSet = new Set<string>(nilaiFokus);

  const nilaiList = [...NILAI] as NilaiAkar[];
  const sikapPerNilai = new Map<NilaiAkar, ItemSikap[]>();
  for (const n of nilaiList) {
    sikapPerNilai.set(n, resolveSikap(usiaBulan, [n], katalogSikap));
  }

  function handleTanam(nilai: NilaiAkar) {
    onTanam(nilai);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 px-6 pt-6 sm:px-10">
        <p
          className="mb-1.5 font-nunito font-[800] text-[13px] tracking-[0.08em] text-rekah"
          style={{ textTransform: 'uppercase' }}
        >
          BEKAL
        </p>
        <h1 className="mb-2 font-fredoka font-bold text-pekat" style={{ fontSize: 44, lineHeight: 1.05 }}>
          Kebiasaan Baik
        </h1>
        <p className="font-shantell text-[18px] text-rekah">
          {KEBIASAAN_BAIK.pembuka}
        </p>
      </div>

      {/* Grid kartu nilai */}
      <div className="px-6 pb-6 sm:px-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {nilaiList.map(nama => {
            const sikapList = sikapPerNilai.get(nama) ?? [];
            const adaSikap = sikapList.length > 0;
            const sudahDitanam = nilaiFokusSet.has(nama);
            const bunga = REGISTRY_BUNGA.find(b => b.nama === nama);
            const info = PENJELASAN_NILAI[nama];

            return (
              <button
                key={nama}
                type="button"
                onClick={() => setNilaiDibuka(nama)}
                aria-label={`${nama} — ${adaSikap ? KEBIASAAN_BAIK.jumlahKebiasaan(sikapList.length) : KEBIASAAN_BAIK.sikapSedangDilengkapi}`}
                className={[
                  'flex flex-col overflow-hidden rounded-[20px] text-left transition',
                  adaSikap
                    ? 'bg-white shadow-[0_2px_10px_rgba(240,107,168,0.10)] hover:shadow-[0_6px_20px_rgba(240,107,168,0.16)]'
                    : 'bg-white/50 opacity-50 hover:opacity-70',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah',
                ].join(' ')}
              >
                {/* Zona bunga */}
                <div className="flex items-center justify-center bg-fajar py-5">
                  {bunga ? (
                    <BungaMini
                      warnaPetal={bunga.warnaPetal} d={bunga.d} kelopak={bunga.kelopak}
                      r1={bunga.r1} r2={bunga.r2} c1={bunga.c1} c2={bunga.c2}
                      ukuran={52} pucat={!adaSikap}
                    />
                  ) : (
                    <div className="h-[52px] w-[52px] rounded-full bg-mawar/20" />
                  )}
                </div>

                {/* Teks */}
                <div className="flex flex-1 flex-col gap-1 px-3 py-3">
                  <p className={[
                    'font-bricolage text-[13px] font-bold leading-snug',
                    adaSikap ? 'text-pekat' : 'text-pekat/40',
                  ].join(' ')}>
                    {nama}
                  </p>
                  <p className={[
                    'font-nunito text-[11px] leading-snug',
                    adaSikap ? 'text-pekat/55' : 'text-pekat/30',
                  ].join(' ')}>
                    {info.tagline}
                  </p>
                  {adaSikap && (
                    <p className="mt-1 font-nunito text-[10px] text-rekah/65">
                      {KEBIASAAN_BAIK.jumlahKebiasaan(sikapList.length)}
                    </p>
                  )}
                  {sudahDitanam && (
                    <p className="mt-1 font-nunito text-[9px] font-semibold text-daun">
                      {KEBIASAAN_BAIK.sudahDiTaman}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popup detail */}
      {nilaiDibuka !== null && (
        <PopupDetailNilai
          nilai={nilaiDibuka}
          sikapList={sikapPerNilai.get(nilaiDibuka) ?? []}
          sudahDitanam={nilaiFokusSet.has(nilaiDibuka)}
          onTanam={() => handleTanam(nilaiDibuka)}
          onTutup={() => setNilaiDibuka(null)}
        />
      )}
    </div>
  );
}
