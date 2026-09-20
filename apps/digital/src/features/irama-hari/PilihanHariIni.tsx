// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePilihanHarian } from './PilihanHarianContext';
import { PILIHAN_HARI_INI } from './content';
import DetailKegiatan from './DetailKegiatan';
import type { ItemBekal } from '../beranda-usia/bekal';

// Domain colors from Langit Peony handoff
interface DomainStyle { bg: string; ink: string; label: string; }
const DOMAIN_STYLE: Record<string, DomainStyle> = {
  mh:  { bg: '#FCE3EE', ink: '#E0518F', label: 'Motorik Halus' },
  mk:  { bg: '#E4EFFD', ink: '#5F84E6', label: 'Motorik Kasar' },
  kog: { bg: '#F1ECFB', ink: '#8A6DC7', label: 'Kognitif' },
  bhs: { bg: '#FFF3D9', ink: '#C79020', label: 'Bahasa' },
  sos: { bg: '#E4EFFD', ink: '#5F84E6', label: 'Sosial' },
  sen: { bg: '#F1ECFB', ink: '#8A6DC7', label: 'Sensorik' },
  FM:  { bg: '#FCE3EE', ink: '#E0518F', label: 'Motorik' },
  KG:  { bg: '#F1ECFB', ink: '#8A6DC7', label: 'Kognitif' },
  BH:  { bg: '#FFF3D9', ink: '#C79020', label: 'Bahasa' },
  SE:  { bg: '#E4EFFD', ink: '#5F84E6', label: 'Sosial-Emosional' },
  KS:  { bg: '#FFF3D9', ink: '#C79020', label: 'Kesehatan' },
  PS:  { bg: '#FCE3EE', ink: '#E0518F', label: 'Seni' },
  fe:  { bg: '#ECFEFF', ink: '#0891B2', label: 'Fungsi Eksekutif' },
};

interface PropsPilihanHariIni {
  onLihatSemua?: () => void;
  onTambah?: () => void;
}

export default function PilihanHariIni({ onLihatSemua, onTambah }: PropsPilihanHariIni) {
  const { pilihanEfektif, kolamAnakJumlah } = usePilihanHarian();
  const [detailItem, setDetailItem] = useState<ItemBekal | null>(null);

  return (
    <section aria-labelledby="pilihan-hari-ini-judul">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="pilihan-hari-ini-judul"
          className="font-bricolage text-[18px] font-bold text-pekat"
        >
          {PILIHAN_HARI_INI.judul}
        </h2>
        {kolamAnakJumlah > pilihanEfektif.length && (
          <button
            type="button"
            onClick={onLihatSemua}
            className="text-[13px] font-semibold text-rekah"
          >
            {PILIHAN_HARI_INI.lihatSemuaTemplate(kolamAnakJumlah)} →
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {pilihanEfektif.length === 0 && (
          <p className="col-span-2 py-6 text-center font-nunito text-[13px] text-ink-soft">
            Belum ada kegiatan dipilih hari ini.
            <br />
            Tap <strong>+ Tambah</strong> untuk mulai.
          </p>
        )}

        {pilihanEfektif.map((item, idx) => {
          const ds = DOMAIN_STYLE[item.domain] ?? { bg: '#FCE3EE', ink: '#E0518F', label: item.domain };
          const nilaiUtama = item.nilai[0];
          const durasi = item.perkiraanDurasiMenit;
          const rotate = idx % 2 === 0 ? 'rotate(1.1deg)' : 'rotate(-1.1deg)';

          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => setDetailItem(item)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailItem(item); } }}
              aria-label={`Lihat detail: ${item.judul}`}
              className="relative min-h-[130px] cursor-pointer rounded-[22px] border p-4 transition hover:brightness-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah motion-reduce:transition-none"
              style={{
                background: ds.bg,
                borderColor: ds.bg,
                transform: rotate,
                boxShadow: '0 4px 16px -4px rgba(90,50,70,.12)',
              }}
            >
              <p className="mb-3 font-fredoka text-[15px] font-semibold leading-snug text-pekat">
                {item.judul}
              </p>

              {/* Domain chip */}
              <span
                className="inline-block rounded-full px-3 py-1 font-nunito text-[11.5px] font-bold"
                style={{ background: 'rgba(255,255,255,.55)', color: ds.ink }}
              >
                {ds.label}
              </span>

              {/* Nilai · durasi */}
              {(nilaiUtama || durasi) && (
                <p className="mt-1.5 font-nunito text-[12px]" style={{ color: ds.ink }}>
                  {nilaiUtama && !item.tanpaTemaNilai && (
                    <span className="font-semibold">{nilaiUtama}</span>
                  )}
                  {nilaiUtama && !item.tanpaTemaNilai && durasi !== undefined && durasi > 0 && (
                    <span className="opacity-60"> · </span>
                  )}
                  {durasi !== undefined && durasi > 0 && (
                    <span className="opacity-60">{durasi} mnt</span>
                  )}
                </p>
              )}
            </div>
          );
        })}

        {/* Tombol Tambah */}
        <button
          type="button"
          onClick={onTambah}
          aria-label={PILIHAN_HARI_INI.tambahLabel}
          className="flex flex-col items-center justify-center gap-1.5 rounded-[20px] border-2 border-dashed border-rekah/40 bg-white p-4 text-rekah transition hover:border-rekah hover:bg-fajar"
          style={{ minHeight: '130px' }}
        >
          <Plus className="h-5 w-5" strokeWidth={2} aria-hidden />
          <span className="text-[13px] font-semibold">Tambah</span>
        </button>
      </div>

      <DetailKegiatan item={detailItem} onClose={() => setDetailItem(null)} />
    </section>
  );
}
