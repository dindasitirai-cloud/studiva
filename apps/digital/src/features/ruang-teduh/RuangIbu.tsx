// =============================================================
// RuangIbu — konten khusus ibu baru melahirkan, dikembalikan ke Kelola →
// Kehidupan Keluarga. Menyatukan tiga modul lama Ruang Teduh: Piring Ibu,
// Lembar Nifas, dan Menyambut Si Kecil. Kartu pintu masuk mengikuti design
// system Rekah (Langit Peony); isi modul memakai komponen aslinya.
// =============================================================
import React, { useMemo, useState } from 'react';
import { UtensilsCrossed, ClipboardList, Gift, ChevronRight, ArrowLeft, HeartPulse } from 'lucide-react';
import { useAnakAktif } from '../../context/AnakContext';
import { CatatanHarianSupabase } from './penyimpanan/supabase';
import { PenyimpananProvider } from './penyimpanan/PenyimpananProvider';
import { hitungHariNifas } from './logika';
import type { RingkasNifas, SubTahapRuangTeduh } from './types';
import PiringIbu from './PiringIbu';
import MenyambutSiKecil from './MenyambutSiKecil';
import LembarNifas from './lembar-nifas/LembarNifas';

type View = null | 'piring-ibu' | 'lembar-nifas' | 'menyambut';

function resolveSubTahap(usiaBulan: number): SubTahapRuangTeduh {
  return usiaBulan < 6 ? 'menyusui-eksklusif' : 'mpasi-berlanjut';
}

const KARTU: { view: Exclude<View, null>; judul: string; sub: string; ikon: typeof UtensilsCrossed; tile: string; ink: string }[] = [
  { view: 'piring-ibu', judul: 'Piring Ibu', sub: 'Gizi harianmu selama menyusui', ikon: UtensilsCrossed, tile: '#FCE4EE', ink: '#C0567F' },
  { view: 'lembar-nifas', judul: 'Lembar Nifas', sub: 'Pantau pemulihan 42 hari pertama', ikon: ClipboardList, tile: '#EAF2FF', ink: '#3E6E9C' },
  { view: 'menyambut', judul: 'Menyambut Si Kecil', sub: 'Ceklis persiapan menyambut bayi', ikon: Gift, tile: '#EFE9FB', ink: '#7A5CA6' },
];

export default function RuangIbu() {
  const { anak, sapaan, usiaBulan } = useAnakAktif();
  const [view, setView] = useState<View>(null);

  const repo = useMemo(() => new CatatanHarianSupabase(), []);
  const hariIni = new Date().toISOString().slice(0, 10);
  const ringkasNifas: RingkasNifas | null = anak.tanggalLahir ? hitungHariNifas(anak.tanggalLahir, hariIni) : null;
  const subTahap = resolveSubTahap(usiaBulan);
  const caregiverId = anak.id;
  const hariKeNifas = ringkasNifas?.hariKe ?? 1;

  const judulAktif = KARTU.find(k => k.view === view)?.judul ?? '';

  return (
    <div className="rounded-[18px] border border-pekat/10 bg-white px-4 pb-4 pt-1">
      {/* Header seksi */}
      <div className="flex items-center gap-3 border-b border-rekah/10 py-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] text-rekah-tua" style={{ background: '#FDE7F0' }}><HeartPulse size={19} strokeWidth={2} /></span>
        <span className="flex-1">
          <span className="block font-fredoka text-[16px] font-semibold text-pekat">Untuk Ibu</span>
          <span className="font-nunito text-[11.5px] text-pekat/55">Perawatan & persiapan masa awal — nifas, gizi, menyambut bayi</span>
        </span>
      </div>

      {view === null ? (
        <div className="flex flex-col gap-2.5 pt-3">
          {KARTU.map(k => {
            const Ikon = k.ikon;
            return (
              <button key={k.view} type="button" onClick={() => setView(k.view)}
                className="flex items-center gap-3 rounded-[14px] border border-pekat/8 bg-white px-3 py-3 text-left transition hover:shadow-[0_10px_24px_-16px_rgba(110,59,87,.55)]"
                style={{ boxShadow: '0 8px 20px -18px rgba(90,50,70,.7)' }}>
                <span aria-hidden="true" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px]" style={{ background: k.tile, color: k.ink }}><Ikon size={18} strokeWidth={2} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-fredoka text-[15px] font-semibold text-pekat">{k.judul}</span>
                  <span className="block font-nunito text-[12px] text-pekat/60">{k.sub}</span>
                </span>
                <ChevronRight size={18} strokeWidth={2.2} className="flex-shrink-0 text-pekat/30" />
              </button>
            );
          })}
          <p className="mt-1 rounded-[12px] bg-fajar/70 px-3.5 py-2 font-nunito text-[11.5px] leading-relaxed text-pekat/60">
            Paling relevan di masa bayi baru lahir & nifas — tetap bisa kamu buka kapan saja.
          </p>
        </div>
      ) : (
        <div className="pt-3">
          <button type="button" onClick={() => setView(null)}
            className="mb-3 inline-flex items-center gap-1.5 font-nunito text-[13px] font-extrabold text-rekah-tua">
            <ArrowLeft size={16} strokeWidth={2.4} /> Kembali
          </button>
          <div className="rounded-[16px] border border-pekat/8 bg-white p-4">
            <h3 className="mb-3 font-fredoka text-[19px] font-semibold text-pekat">{judulAktif}</h3>
            {view === 'piring-ibu' && (
              <PenyimpananProvider caregiverId={caregiverId} repository={repo}>
                <PiringIbu subTahap={subTahap} hariIni={hariIni} />
              </PenyimpananProvider>
            )}
            {view === 'lembar-nifas' && (
              <LembarNifas hariKe={hariKeNifas} hariIni={hariIni} />
            )}
            {view === 'menyambut' && (
              <PenyimpananProvider caregiverId={caregiverId} repository={repo}>
                <MenyambutSiKecil sapaan={sapaan} />
              </PenyimpananProvider>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
