import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pilihKegiatanPekan } from './pilihKegiatanPekan';
import type { MateriItem } from '../akar-keluarga/content';

interface Props {
  namaAnak: string;
  band: number;
  nilai: string[];
  fokus: string[];
}

export default function KartuPekanIni({ namaAnak, band, nilai, fokus }: Props) {
  const navigate = useNavigate();
  const kegiatan = pilihKegiatanPekan(band, nilai, fokus);
  const [centang, setCentang] = useState<boolean[]>([false, false, false]);

  const jumlahSelesai = centang.filter(Boolean).length;
  const semua = jumlahSelesai === 3;

  function toggle(i: number) {
    setCentang(prev => prev.map((v, idx) => (idx === i ? !v : v)));
    // TODO: persist status centang mingguan via API
  }

  return (
    <div className="rounded-[20px] bg-white p-5 shadow-[0_4px_16px_rgba(224,82,107,0.07)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12px] font-bold uppercase tracking-widest text-rekah/70">Pekan ini</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard/tier2/knowledge')}
          className="text-[11px] font-semibold text-rekah underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          Rencana lengkap →
        </button>
      </div>

      <p className="mb-4 text-[12px] text-pekat/50">
        3 kegiatan pilihan untuk {namaAnak} — dari nilai fokus keluarga
      </p>

      <div className="mb-4 flex flex-col gap-2">
        {kegiatan.map((item: MateriItem, i: number) => {
          const isFokus = item.nilai.some(n => fokus.includes(n));
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className={`flex items-start gap-3 rounded-[14px] p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah motion-reduce:transition-none ${
                isFokus ? 'bg-fajar' : 'bg-white border border-mawar/30'
              } ${centang[i] ? 'opacity-60' : ''}`}
              aria-pressed={centang[i]}
            >
              {/* Kelopak checkbox */}
              <span
                aria-hidden
                style={{ borderRadius: '70% 70% 70% 4px', flexShrink: 0 }}
                className={`mt-0.5 flex h-5 w-5 items-center justify-center text-[10px] font-bold transition ${
                  centang[i] ? 'bg-rekah text-white' : 'border-2 border-mawar bg-white'
                }`}
              >
                {centang[i] && '✓'}
              </span>
              <span>
                <span className={`block text-[13px] font-semibold text-pekat ${centang[i] ? 'line-through' : ''}`}>
                  {isFokus && <span className="mr-1 text-rekah" aria-hidden>★</span>}
                  {item.judul}
                </span>
                <span className="block text-[11px] leading-relaxed text-pekat/50">{item.deskripsi}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress kelopak */}
      <div className="mb-3 flex items-center gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            aria-hidden
            style={{ borderRadius: '70% 70% 70% 4px', width: 16, height: 22 }}
            className={`transition-colors motion-reduce:transition-none ${centang[i] ? 'bg-rekah' : 'bg-mawar'}`}
          />
        ))}
        <span className="text-[11px] text-pekat/50">{jumlahSelesai} dari 3 kegiatan pekan ini</span>
      </div>

      {/* Perayaan */}
      {semua && (
        <div className="rounded-[14px] bg-fajar px-4 py-3 text-center">
          <p className="font-fraunces text-[1rem] italic text-rekah">Mekar pekan ini! 🌸</p>
          <p className="mt-0.5 text-[12px] text-pekat/60">
            Tiga kegiatan tuntas — kelopak {namaAnak} bertambah penuh.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard/tier2/jurnal-perkembangan')}
            style={{ borderRadius: '100px 100px 100px 8px' }}
            className="mt-3 flex w-full min-h-[40px] items-center justify-center bg-rekah text-[13px] font-bold text-white transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah motion-reduce:transition-none"
          >
            Abadikan di Jurnal
            {/* TODO: prefill entri jurnal dari kegiatan pekan ini */}
          </button>
        </div>
      )}
    </div>
  );
}
