// KONTEN: wajib review Psikolog Fitri sebelum rilis.

import React, { useState } from 'react';
import { ACTIVITY_MODULES, type ActivityModuleId, type RefleksiEntry } from '@studiva/shared';
import { REFLEKSI_COPY } from './rekahRefleksiCopy';
import { useRekahProfile } from '../../context/RekahProfileContext';
import { useRekahRefleksi } from '../../context/RekahRefleksiContext';
import { useJurnalRekah } from '../../context/JurnalRekahContext';

interface CeritaHariIniProps {
  moduleId: ActivityModuleId;
  onDone: () => void;
}

export default function CeritaHariIni({ moduleId, onDone }: CeritaHariIniProps) {
  const { profile } = useRekahProfile();
  const { addEntry } = useRekahRefleksi();
  const { addEntriFromRefleksi } = useJurnalRekah();

  const modul = ACTIVITY_MODULES.find(m => m.id === moduleId);
  const namaAnak = profile?.anak.namaPanggilan ?? 'si kecil';

  const [responsAnak, setResponsAnak] = useState<RefleksiEntry['responsAnak'] | null>(null);
  const [moodCaregiver, setMoodCaregiver] = useState<RefleksiEntry['moodCaregiver'] | null>(null);
  const [catatan, setCatatan] = useState('');
  const [simpanJurnal, setSimpanJurnal] = useState(false);

  function handleSimpan() {
    if (!responsAnak) return;
    // Tanpa id — database yang memberikannya. Lihat RekahRefleksiContext.
    const entry: Omit<RefleksiEntry, 'id'> = {
      moduleId,
      tanggal: new Date().toISOString().split('T')[0],
      responsAnak,
      moodCaregiver: moodCaregiver ?? undefined,
      catatan: catatan.trim() || undefined,
      nilaiUtama: modul?.nilaiUtama as RefleksiEntry['nilaiUtama'],
      simpanKeJurnal: simpanJurnal,
    };
    void addEntry(entry);
    if (simpanJurnal && catatan.trim()) {
      void addEntriFromRefleksi({
        judul: modul?.judul ?? 'Langkah Kecil',
        catatan: catatan.trim(),
        tanggal: entry.tanggal,
        nilaiId: entry.nilaiUtama,
      });
    }
    onDone();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-pekat/40"
      role="dialog"
      aria-modal="true"
      aria-label={REFLEKSI_COPY.judulCerita}
    >
      {/* Bottom sheet */}
      <div className="w-full max-w-lg rounded-t-[28px] bg-white px-5 pb-10 pt-6 shadow-[0_-8px_40px_rgba(224,82,107,0.14)]">
        {/* Handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-pekat/15" aria-hidden />

        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-rekah/70">
          {REFLEKSI_COPY.judulCerita}
        </p>
        <h2 className="mb-5 font-bricolage text-[1.2rem] font-extrabold text-pekat">
          {REFLEKSI_COPY.sub(namaAnak)}
        </h2>

        {/* ── Respons anak ─────────────────────────────────────────── */}
        <p className="mb-2 text-[13px] font-semibold text-pekat/70">
          {REFLEKSI_COPY.responsLabel(namaAnak)}
        </p>
        <p className="mb-3 text-[12px] text-pekat/45 italic">
          {REFLEKSI_COPY.responsPengantar}
        </p>
        <div className="mb-5 grid grid-cols-3 gap-2">
          {REFLEKSI_COPY.responsOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setResponsAnak(opt.value)}
              className={`flex flex-col items-center gap-1.5 rounded-[14px] border-2 p-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
                responsAnak === opt.value
                  ? 'border-rekah bg-fajar'
                  : 'border-fajar bg-white hover:border-rekah/40'
              }`}
            >
              <span className="text-[22px]" aria-hidden>{opt.emoji}</span>
              <span className="text-[12px] font-semibold leading-snug text-pekat/75">
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        {/* Note untuk belum-tertarik */}
        {responsAnak === 'belum-tertarik' && (
          <p className="mb-4 rounded-[12px] bg-pucuk/60 px-4 py-3 text-[13px] text-pekat/65">
            {REFLEKSI_COPY.belumTertarikNote}
          </p>
        )}

        {/* ── Mood caregiver (opsional) ─────────────────────────── */}
        <p className="mb-1 text-[13px] font-semibold text-pekat/70">
          {REFLEKSI_COPY.moodLabel}
        </p>
        <p className="mb-2 text-[11px] text-pekat/40">{REFLEKSI_COPY.moodSub}</p>
        <div className="mb-5 flex gap-2">
          {REFLEKSI_COPY.moodOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMoodCaregiver(moodCaregiver === opt.value ? null : opt.value)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-[12px] border-2 py-2.5 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
                moodCaregiver === opt.value
                  ? 'border-rekah bg-fajar text-rekah-tua'
                  : 'border-fajar bg-white text-pekat/60 hover:border-rekah/30'
              }`}
            >
              <span aria-hidden>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* ── Catatan bebas (opsional) ───────────────────────────── */}
        <p className="mb-1.5 text-[13px] font-semibold text-pekat/70">
          {REFLEKSI_COPY.catatanLabel}
        </p>
        <textarea
          value={catatan}
          onChange={e => setCatatan(e.target.value)}
          placeholder={REFLEKSI_COPY.catatanPlaceholder}
          rows={3}
          className="mb-2 w-full resize-none rounded-[14px] border border-fajar bg-kanvas px-4 py-3 font-caveat text-[16px] text-pekat/80 placeholder:text-pekat/30 focus:border-rekah/40 focus:outline-none focus:ring-2 focus:ring-rekah/20"
        />

        {/* Toggle simpan ke jurnal */}
        {catatan.trim() && (
          <label className="mb-5 flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={simpanJurnal}
              onChange={e => setSimpanJurnal(e.target.checked)}
              className="h-4 w-4 rounded accent-rekah"
            />
            <span className="text-[13px] font-semibold text-pekat/70">
              {REFLEKSI_COPY.simpanKeJurnalLabel}
            </span>
          </label>
        )}

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={!responsAnak}
            onClick={handleSimpan}
            className="flex min-h-[44px] w-full items-center justify-center rounded-[12px] bg-rekah text-[14px] font-bold text-white transition hover:bg-rekah-tua disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            {REFLEKSI_COPY.simpanCTA}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="flex min-h-[44px] w-full items-center justify-center text-[13px] text-pekat/50 hover:text-pekat/70 focus-visible:outline-none focus-visible:underline"
          >
            {REFLEKSI_COPY.lewatiLink}
          </button>
        </div>
      </div>
    </div>
  );
}
