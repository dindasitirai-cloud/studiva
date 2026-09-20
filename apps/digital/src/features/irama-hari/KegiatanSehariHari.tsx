// Kegiatan Sehari-hari (Phase 14E) — tab gabungan "Kebiasaan & Momen".
// Satu daftar kegiatan terurut per momen; tiap item punya lambang bunga (nilai) + centang.
// Additive; memakai centang kebiasaan yang sudah ada. Copy DRAFT — review Fitri.
import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
import type { NilaiAkar } from '../akar-keluarga/content';
import type { ItemSikap } from '../beranda-usia/adapter/sikapAdapter';
import { MOMEN_SLOTS, kegiatanHariIni } from './kegiatanMomen';
import { BungaSVG } from './KartuKebiasaanBaik';
import { derivedRiwayatSiram, tingkatMekar } from '@studiva/shared';
import type { KegiatanHari } from './kegiatanMomen';

const NILAI_WARNA: Record<string, { bunga: string; chipBg: string; chipInk: string }> = {
  'Kasih Sayang':      { bunga: '#F8B9D4', chipBg: '#FCE0EC', chipInk: '#C0567F' },
  'Kemandirian':       { bunga: '#FFD98A', chipBg: '#FFF3CC', chipInk: '#B98900' },
  'Empati':            { bunga: '#C9B8F0', chipBg: '#EBE3FA', chipInk: '#7A5CA6' },
  'Sabar':             { bunga: '#A8D8E8', chipBg: '#E4F1FB', chipInk: '#3E6E9C' },
  'Tanggung Jawab':    { bunga: '#F6B860', chipBg: '#FBE7CF', chipInk: '#A76A1E' },
  'Syukur':            { bunga: '#FFE29A', chipBg: '#FFF3CC', chipInk: '#B98900' },
  'Berbagi':           { bunga: '#F4A6C0', chipBg: '#FDE1EC', chipInk: '#C0567F' },
  'Kesederhanaan':     { bunga: '#D9C7B0', chipBg: '#F2EBDF', chipInk: '#8A6E45' },
  'Hormat pada Sesama':{ bunga: '#B7D3F0', chipBg: '#E7EEF7', chipInk: '#3E6E9C' },
  'Cinta Ilmu':        { bunga: '#9FD8C0', chipBg: '#E4F5EC', chipInk: '#3F7A4F' },
  'Kejujuran':         { bunga: '#FFC59A', chipBg: '#FCE7D6', chipInk: '#B06A2E' },
  'Keberanian':        { bunga: '#F49AB0', chipBg: '#FCE0E7', chipInk: '#C0567F' },
};
const DEFAULT_WARNA = { bunga: '#F8B9D4', chipBg: '#FCE0EC', chipInk: '#C0567F' };

export interface PropsKegiatanSehariHari {
  usiaBulan: number;
  nilaiFokus: readonly NilaiAkar[];
  katalogSikap: readonly ItemSikap[];
  centangKebiasaan: Record<string, Record<string, string[]>>;
  tanggalHariIni: string;
  onCentangToggle: (nilaiId: NilaiAkar, butirId: string) => void;
  onBekal?: () => void;
}

export default function KegiatanSehariHari({
  usiaBulan, nilaiFokus, katalogSikap, centangKebiasaan, tanggalHariIni, onCentangToggle, onBekal,
}: PropsKegiatanSehariHari) {
  const daftar = useMemo(
    () => kegiatanHariIni(usiaBulan, nilaiFokus, katalogSikap),
    [usiaBulan, nilaiFokus, katalogSikap],
  );
  const perSlot = useMemo(() => {
    const map = new Map<string, KegiatanHari[]>();
    for (const k of daftar) { const a = map.get(k.momenKey) ?? []; a.push(k); map.set(k.momenKey, a); }
    return map;
  }, [daftar]);
  const mekarPerNilai = useMemo(() => {
    const derived = derivedRiwayatSiram(centangKebiasaan);
    const dates = Object.keys(centangKebiasaan).sort();
    const m = new Map<NilaiAkar, number>();
    for (const n of nilaiFokus) {
      const riwayat = dates.map(t => (derived[t] ?? []).includes(n));
      const levels = tingkatMekar(riwayat);
      m.set(n, levels[levels.length - 1] ?? 0);
    }
    return m;
  }, [centangKebiasaan, nilaiFokus]);
  const centangHari = centangKebiasaan[tanggalHariIni] ?? {};

  if (nilaiFokus.length === 0) {
    return (
      <div className="rounded-[16px] border border-rekah/12 bg-white px-5 py-6 text-center">
        <p className="font-fredoka text-[16px] font-semibold text-pekat">Belum ada nilai keluarga</p>
        <p className="mt-1 font-nunito text-[13px] text-pekat/60">Tanam nilai dulu di Kompas Keluarga agar Rekah bisa menampilkan kegiatan sehari-hari yang cocok.</p>
        {onBekal && <button type="button" onClick={onBekal} className="mt-3 rounded-full bg-rekah px-4 py-2 font-nunito text-[13px] font-extrabold text-white">Tanam Nilai</button>}
      </div>
    );
  }

  return (
    <section aria-label="Kegiatan sehari-hari">
      <p className="mb-1 font-fredoka text-[18px] font-semibold text-pekat">Cara kecil hari ini</p>
      <p className="mb-4 font-nunito text-[13px] leading-relaxed text-pekat/70">
        Kebiasaan &amp; momen dalam satu daftar — tiap kegiatan menumbuhkan sebuah nilai (lambang bunga), terurut mengikuti alur hari. Centang saat sudah dilakukan.
      </p>

      {MOMEN_SLOTS.map(slot => {
        const items = perSlot.get(slot.key);
        if (!items || items.length === 0) return null;
        return (
          <div key={slot.key} className="mb-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[9px] bg-kanvas text-[15px]" aria-hidden>{slot.ikon}</span>
              <span className="font-fredoka text-[14.5px] font-semibold text-pekat">{slot.label}</span>
              <span className="h-px flex-1 bg-bordergray/70" />
              <span className="flex-shrink-0 font-nunito text-[11px] font-extrabold text-pekat/45">{items.length}</span>
            </div>
            {items.map(it => {
              const w = NILAI_WARNA[it.nilaiUtama] ?? DEFAULT_WARNA;
              const done = (centangHari[it.nilaiUtama] ?? []).includes(it.id);
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => onCentangToggle(it.nilaiUtama, it.id)}
                  aria-pressed={done}
                  className="flex w-full items-start gap-3 rounded-[12px] px-2.5 py-2 text-left hover:bg-fajar/60"
                >
                  <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[6px] border-2 ${done ? 'border-daun bg-daun text-white' : 'border-rose-soft bg-white text-transparent'}`}>
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="mt-0.5 flex-shrink-0"><BungaSVG nilai={it.nilaiUtama} mekar={mekarPerNilai.get(it.nilaiUtama) ?? 0} ukuran={26} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span className={`font-nunito text-[13px] font-bold leading-snug text-pekat ${done ? 'line-through opacity-50' : ''}`}>{it.judul}</span>
                      <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: w.chipBg, color: w.chipInk }}>{it.nilaiUtama}</span>
                    </span>
                    {it.deskripsi && <span className={`mt-0.5 block font-nunito text-[12px] leading-snug text-pekat/60 ${done ? 'opacity-50' : ''}`}>{it.deskripsi}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}
