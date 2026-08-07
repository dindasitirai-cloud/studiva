// KONTEN: wajib review Psikolog Fitri sebelum rilis.

import React, { useState } from 'react';
import { NILAI_REKAH, type NilaiId } from '@studiva/shared';
import { useRekahProfile } from '../../context/RekahProfileContext';
import { useRekahRefleksi } from '../../context/RekahRefleksiContext';
import { useRekahPlan } from '../../context/RekahPlanContext';
import { useJurnalRekah } from '../../context/JurnalRekahContext';
import { useAnak } from '../../context/AnakContext';
import Kelopak from '../../components/Kelopak';
import { MUSIM_COPY } from './rekahMusimCopy';
import { tutupMusim } from '../../lib/supabase/rekahMusim';
import { dispatchRekahError } from '../../utils/rekahApiError';

type LayarMusim = 'rangkuman' | 'refleksi' | 'pilihan' | 'selesai';

interface PenutupMusimFlowProps {
  onMusimBaru: () => void;
}

export default function PenutupMusimFlow({ onMusimBaru }: PenutupMusimFlowProps) {
  const { profile, idMusimBerjalan, muatUlangMusim } = useRekahProfile();
  const { entries, refleksiMusim, setRefleksiMusim } = useRekahRefleksi();
  const { setPlan, musimKe } = useRekahPlan();
  const { addEntriFromMusim } = useJurnalRekah();
  const { anakAktif } = useAnak();

  const [layar, setLayar] = useState<LayarMusim>('rangkuman');
  const [syukurCatatan, setSyukurCatatan] = useState('');
  const [simpanJurnal, setSimpanJurnal] = useState(false);
  const [pilihan, setPilihan] = useState<'sama' | 'baru' | null>(null);

  if (!profile) return null;

  const [nilai1Id, nilai2Id] = profile.akar.nilaiFokus;
  const nilai1 = NILAI_REKAH.find(n => n.id === nilai1Id);
  const nilai2 = NILAI_REKAH.find(n => n.id === nilai2Id);

  const totalSelesai = entries.length;
  const momenList = entries.filter(e => e.catatan).slice(0, 3);

  // ── Mulai Musim Baru ────────────────────────────────────────────────
  // Dulu: POST /seasons/close (kegagalannya DIABAIKAN) lalu setProfile
  // menimpa musim_ke. Kalau arsip gagal tapi profil berhasil, musim lama
  // hilang tanpa jejak dan tidak ada yang tahu.
  //
  // Sekarang: tutupMusim() menutup baris lama dan membuka baris baru. Kalau
  // gagal, tidak ada yang berubah dan orang tua diberi tahu — menutup musim
  // adalah momen bermakna, bukan operasi yang boleh diam-diam gagal.
  async function mulaiMusimBaru(nilaiCopy: [NilaiId, NilaiId]) {
    if (!anakAktif || !idMusimBerjalan) return;
    try {
      await tutupMusim({
        idAnak: anakAktif.id,
        idMusim: idMusimBerjalan,
        totalLangkah: totalSelesai,
        refleksiMusim: refleksiMusim ?? undefined,
        nilaiFokusBaru: [...nilaiCopy],
        musimKeBaru: musimKe + 1,
      });
    } catch {
      dispatchRekahError('Musim belum bisa ditutup. Periksa koneksi lalu coba lagi.');
      return;
    }
    await muatUlangMusim();
    setPlan(null);
    setLayar('selesai');
  }

  function handleRefleksiSimpan() {
    const catatan = syukurCatatan.trim() || undefined;
    if (catatan) {
      setRefleksiMusim({
        musimId: profile!.akar.musimMulai,
        syukurCatatan: catatan,
        tanggal: new Date().toISOString().split('T')[0],
      });
      if (simpanJurnal) {
        void addEntriFromMusim({
          judul: `Penutup Musim ${nilai1?.label ?? ''} & ${nilai2?.label ?? ''}`,
          catatan,
          tanggal: new Date().toISOString().split('T')[0],
        });
      }
    }
    setLayar('pilihan');
  }

  // ── Layar 1: Rangkuman ───────────────────────────────────────────────
  if (layar === 'rangkuman') {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <p
          className="mb-4 text-center font-fraunces text-[1.4rem] font-bold italic leading-snug text-pekat"
          style={{ fontStyle: 'italic' }}
        >
          {nilai1 && nilai2
            ? MUSIM_COPY.rangkumanJudul(nilai1.label, nilai2.label)
            : ''}
        </p>

        {/* Total langkah */}
        <div className="mb-4 rounded-[16px] bg-white p-5 text-center shadow-[0_4px_16px_rgba(224,82,107,0.08)]">
          <p className="font-bricolage text-[2rem] font-extrabold text-rekah">
            {totalSelesai}
          </p>
          <p className="text-[13px] text-pekat/55">
            {MUSIM_COPY.rangkumanLangkahLabel(totalSelesai)}
          </p>
        </div>

        {/* Momen tersimpan (1–3) */}
        {momenList.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-[12px] font-bold uppercase tracking-widest text-pekat/45">
              {MUSIM_COPY.rangkumanMomenLabel}
            </p>
            {momenList.map(m => (
              <div key={m.id} className="rounded-[14px] bg-kanvas px-4 py-3">
                <p className="font-caveat text-[15px] leading-relaxed text-pekat/75">
                  "{m.catatan}"
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setLayar('refleksi')}
          className="flex min-h-[44px] w-full items-center justify-center rounded-[12px] bg-rekah text-[14px] font-bold text-white transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          {MUSIM_COPY.rangkumanCTA}
        </button>
      </div>
    );
  }

  // ── Layar 2: Refleksi Musim ──────────────────────────────────────────
  if (layar === 'refleksi') {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <h2 className="mb-1 font-bricolage text-[1.2rem] font-extrabold text-pekat">
          {MUSIM_COPY.refleksiJudul}
        </h2>
        <p className="mb-4 text-[13px] text-pekat/50">{MUSIM_COPY.refleksiSub}</p>

        <textarea
          value={syukurCatatan}
          onChange={e => setSyukurCatatan(e.target.value)}
          placeholder={MUSIM_COPY.refleksiPlaceholder}
          rows={4}
          className="mb-3 w-full resize-none rounded-[14px] border border-fajar bg-kanvas px-4 py-3 font-caveat text-[16px] text-pekat/80 placeholder:text-pekat/30 focus:border-rekah/40 focus:outline-none focus:ring-2 focus:ring-rekah/20"
        />

        {syukurCatatan.trim() && (
          <label className="mb-5 flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={simpanJurnal}
              onChange={e => setSimpanJurnal(e.target.checked)}
              className="h-4 w-4 rounded accent-rekah"
            />
            <span className="text-[13px] font-semibold text-pekat/70">
              {MUSIM_COPY.abadikanJurnalLabel}
            </span>
          </label>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleRefleksiSimpan}
            className="flex min-h-[44px] w-full items-center justify-center rounded-[12px] bg-rekah text-[14px] font-bold text-white transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            {MUSIM_COPY.refleksiCTA}
          </button>
          <button
            type="button"
            onClick={() => setLayar('pilihan')}
            className="flex min-h-[44px] w-full items-center justify-center text-[13px] text-pekat/50 hover:text-pekat/70 focus-visible:outline-none focus-visible:underline"
          >
            {MUSIM_COPY.refleksiLewati}
          </button>
        </div>
      </div>
    );
  }

  // ── Layar 3: Pilihan Musim Berikutnya ────────────────────────────────
  if (layar === 'pilihan') {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <h2 className="mb-4 font-bricolage text-[1.2rem] font-extrabold text-pekat">
          {MUSIM_COPY.pilihanJudul}
        </h2>

        <div className="mb-5 space-y-3">
          {/* Lanjutkan nilai sama */}
          <button
            type="button"
            onClick={() => setPilihan('sama')}
            className={`w-full rounded-[16px] border-2 p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
              pilihan === 'sama'
                ? 'border-rekah bg-fajar'
                : 'border-fajar bg-white hover:border-rekah/40'
            }`}
          >
            <p className="font-bricolage text-[15px] font-bold text-pekat">
              {MUSIM_COPY.lanjutkanSama}
            </p>
            <p className="mt-1 text-[13px] text-pekat/55">{MUSIM_COPY.lanjutkanSamaSub}</p>
          </button>

          {/* Tanam nilai baru */}
          <button
            type="button"
            onClick={() => setPilihan('baru')}
            className={`w-full rounded-[16px] border-2 p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
              pilihan === 'baru'
                ? 'border-rekah bg-fajar'
                : 'border-fajar bg-white hover:border-rekah/40'
            }`}
          >
            <p className="font-bricolage text-[15px] font-bold text-pekat">
              {MUSIM_COPY.tanamanBaru}
            </p>
            <p className="mt-1 text-[13px] text-pekat/55">{MUSIM_COPY.tanamanBaruSub}</p>
          </button>
        </div>

        <button
          type="button"
          disabled={!pilihan}
          onClick={() => {
            if (pilihan === 'sama') {
              mulaiMusimBaru(profile.akar.nilaiFokus);
            } else {
              // TODO: buka kembali langkah Akar Keluarga dari onboarding
              // Untuk sementara: konfirmasi dan mulai ulang dengan nilai yang sama
              mulaiMusimBaru(profile.akar.nilaiFokus);
            }
          }}
          className="flex min-h-[44px] w-full items-center justify-center rounded-[12px] bg-rekah text-[14px] font-bold text-white transition hover:bg-rekah-tua disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          Mulai Musim Baru
        </button>
        {/* TODO: build 4 — titik natural untuk paywall. JANGAN bangun sekarang. */}
      </div>
    );
  }

  // ── Layar selesai ────────────────────────────────────────────────────
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <Kelopak
        aria-hidden
        rotate={90}
        className="pointer-events-none absolute -right-12 top-8 h-40 w-40 bg-madu opacity-30"
      />
      <p className="mb-3 text-[3rem]" aria-hidden>🌸</p>
      <h2 className="font-bricolage text-[1.4rem] font-extrabold text-pekat">
        {MUSIM_COPY.musimBaruMulai}
      </h2>
      <button
        type="button"
        onClick={onMusimBaru}
        className="mt-6 flex min-h-[44px] items-center justify-center rounded-[12px] bg-rekah px-6 text-[14px] font-bold text-white transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
      >
        Ke Beranda
      </button>
    </div>
  );
}
