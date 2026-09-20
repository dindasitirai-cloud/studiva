// =============================================================
// IramaPeluncur — "Irama Hari" (Phase 14L). Susunan hari = rencana hari yang
// bisa disusun bebas; Rekah mengisi DEFAULT kegiatan umum (susunanDefault.ts).
// Kartu gaya referensi Raisha: GARIS WARNA KIRI (kategori) + jam + judul + meta,
// ilustrasi FLAT (bukan emoji). Warna: Kebiasaan Baik biru, Ajak Main pink,
// Wawasan Tumbuh ungu, Parent Time kuning. Papan kanan ringan.
// Data nyata: mekar (centang) + imunisasi (Buku KIA). STATUS: DRAFT — review Fitri.
// =============================================================
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { BungaSVG } from './KartuKebiasaanBaik';
import { JADWAL_KIA_2024 } from './papanUtil';
import { SUSUNAN_DEFAULT, WARNA_KATEGORI } from './susunanDefault';
import type { KegiatanDefault } from './susunanDefault';
import IlustrasiKegiatan from './IlustrasiKegiatan';
import { derivedRiwayatSiram, tingkatMekar } from '@studiva/shared';

function statusMekar(level: number): string {
  return level >= 3 ? 'Mekar' : level >= 1 ? 'Tumbuh' : 'Kuncup';
}

const LEGENDA: { k: keyof typeof WARNA_KATEGORI; label: string }[] = [
  { k: 'kebiasaan', label: 'Kebiasaan Baik' },
  { k: 'main', label: 'Ajak Main' },
  { k: 'wawasan', label: 'Wawasan Tumbuh' },
  { k: 'parentTime', label: 'Parent Time' },
];

export interface PropsIramaPeluncur {
  usiaBulan: number;
  nilaiFokus: readonly NilaiAkar[];
  centangKebiasaan: Record<string, Record<string, string[]>>;
  onBekal: () => void;
}

export default function IramaPeluncur({ usiaBulan, nilaiFokus, centangKebiasaan, onBekal }: PropsIramaPeluncur) {
  const navigate = useNavigate();

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

  const vaksin = JADWAL_KIA_2024[usiaBulan] ?? null;

  const Kartu = ({ k }: { k: KegiatanDefault }) => {
    const w = WARNA_KATEGORI[k.kategori];
    const meta = k.meta ?? (k.kategori !== 'rutin' ? w.label : undefined);
    return (
      <div
        className="flex items-start gap-2.5 rounded-[14px] rounded-l-[6px] border border-pekat/8 bg-white py-2.5 pl-2.5 pr-3 transition hover:shadow-[0_4px_14px_-8px_rgba(110,59,87,.45)]"
        style={{ borderLeft: `5px solid ${w.bar}` }}
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: w.tint, color: w.ink }}>
          <IlustrasiKegiatan ikon={k.ikon} size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-nunito text-[13px] font-extrabold leading-snug text-pekat">{k.judul}</span>
          {meta && <span className="mt-1 block font-nunito text-[11px] font-medium leading-snug text-pekat/55">{meta}</span>}
        </span>
      </div>
    );
  };

  return (
    <div>
      <p className="mb-2.5 rounded-[12px] bg-fajar/70 px-3.5 py-2 font-nunito text-[12.5px] leading-relaxed text-pekat/70">
        Rekah sudah mengisi <b className="font-extrabold text-pekat">kegiatan umum sehari-hari</b> sebagai titik awal.
        Kamu bebas menyusunnya sendiri — ganti waktu, ganti kegiatan, atau tambah yang lain.
      </p>

      {/* Legenda warna */}
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {LEGENDA.map(l => (
          <span key={l.k} className="flex items-center gap-1.5 font-nunito text-[11px] font-bold text-pekat/60">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: WARNA_KATEGORI[l.k].bar }} />{l.label}
          </span>
        ))}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_290px]">
        {/* Susunan hari (3 waktu) */}
        <div className="grid gap-4 sm:grid-cols-3">
          {SUSUNAN_DEFAULT.map(blok => (
            <div key={blok.key} className="rounded-[18px] bg-kanvas/60 p-2.5">
              <h3 className="mb-2 px-1 font-shantell text-[15px] font-bold text-pekat">{blok.judul}</h3>
              <div className="flex flex-col gap-2">
                {blok.kegiatan.map(k => <Kartu key={k.id} k={k} />)}
              </div>
              <button
                type="button"
                onClick={onBekal}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-[12px] border border-dashed border-rekah/30 py-2 font-nunito text-[12px] font-extrabold text-rekah/70 transition hover:bg-fajar"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.6} /> Tambah kegiatan
              </button>
            </div>
          ))}
        </div>

        {/* Papan kanan */}
        <aside className="flex flex-col gap-3.5">
          <div className="flex flex-wrap gap-2.5">
            {vaksin && (
              <div className="relative min-h-[84px] flex-1 rounded-[12px] border border-langit/50 bg-[#F2F7FF] px-3 py-2.5">
                <p className="font-shantell text-[12px] font-semibold text-[#3E6E9C]">Pengingat</p>
                <p className="mt-0.5 font-nunito text-[12.5px] font-bold leading-snug text-[#3E6E9C]">Imunisasi &amp; Vitamin</p>
                <p className="mt-1 font-nunito text-[10.5px] font-bold text-[#3E6E9C]/80">{usiaBulan} bln · {vaksin.join(', ')}</p>
              </div>
            )}
            <button type="button" onClick={() => navigate('/dashboard/tier2/rencana')} className="flex min-h-[84px] flex-1 flex-col items-center justify-center gap-1 rounded-[12px] border border-dashed border-rekah/30 bg-white px-3 py-2.5 text-rekah/70">
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              <span className="font-nunito text-[11.5px] font-extrabold">Tambah pengingat</span>
            </button>
          </div>

          <div className="rounded-[16px] border border-rekah/15 bg-white px-3.5 py-3">
            <h4 className="mb-2.5 font-shantell text-[15px] font-bold text-rekah-tua">Pita Kebiasaan</h4>
            {nilaiFokus.length === 0 ? (
              <p className="font-nunito text-[11.5px] text-pekat/55">Tanam nilai di Kompas Keluarga untuk melihat bunga tumbuh di sini.</p>
            ) : (
              <div className="flex flex-wrap gap-x-4 gap-y-2.5">
                {nilaiFokus.map(n => (
                  <div key={n} className="text-center">
                    <BungaSVG nilai={n} mekar={mekarPerNilai.get(n) ?? 0} ukuran={34} />
                    <div className="mt-0.5 font-nunito text-[10.5px] font-bold text-pekat">{n}</div>
                    <div className="font-nunito text-[9.5px] font-bold text-pekat/50">({statusMekar(mekarPerNilai.get(n) ?? 0)})</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="button" onClick={onBekal} className="rounded-[16px] border border-pekat/10 bg-white px-3.5 py-3 text-left transition hover:border-rekah/25">
            <div className="flex items-center justify-between">
              <h4 className="font-shantell text-[15px] font-bold text-[#3E6E9C]">Ajak Main</h4>
              <Sparkles className="h-4 w-4 text-langit" strokeWidth={2.2} />
            </div>
            <p className="mt-1 font-nunito text-[11.5px] text-pekat/60">Ide main sesuai usia — motorik, bahasa, kognitif, sensorik.</p>
            <p className="mt-1.5 flex items-center gap-1 font-nunito text-[11px] font-extrabold text-langit">Lihat ide <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.6} /></p>
          </button>

          <button type="button" onClick={() => navigate('/dashboard/tier2/knowledge')} className="rounded-[16px] border border-pekat/10 bg-white px-3.5 py-3 text-left transition hover:border-rekah/25">
            <div className="flex items-center justify-between">
              <h4 className="font-shantell text-[15px] font-bold text-pekat">Wawasan Tumbuh</h4>
              <BookOpen className="h-4 w-4 text-pekat/50" strokeWidth={2.2} />
            </div>
            <p className="mt-1 font-nunito text-[11.5px] text-pekat/60">Bacaan singkat untuk memahami tahap tumbuh anak.</p>
            <p className="mt-1.5 flex items-center gap-1 font-nunito text-[11px] font-extrabold text-pekat/60">Buka Wawasan <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.6} /></p>
          </button>
        </aside>
      </div>
    </div>
  );
}
