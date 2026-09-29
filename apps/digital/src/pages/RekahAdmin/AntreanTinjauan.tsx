import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { muatAntrean, KontenDraf, LABEL_JENIS } from '../../lib/supabase/pipeline';
import { HeroAdmin, KosongBerilustrasi } from './tema/temaAdmin';

function baris(d: KontenDraf, onClick: () => void) {
  return (
    <tr
      key={d.id}
      onClick={onClick}
      className="cursor-pointer border-b border-rekah/8 transition hover:bg-rekah/5"
    >
      <td className="px-5 py-3.5">
        <p className="text-[14px] font-semibold text-pekat">{d.judul}</p>
        {d.catatan_penulis && (
          <p className="mt-0.5 text-[12px] text-pekat/45 line-clamp-1">{d.catatan_penulis}</p>
        )}
      </td>
      <td className="px-4 py-3.5 text-[13px] text-pekat/60">{LABEL_JENIS[d.jenis]}</td>
      <td className="px-4 py-3.5 text-[13px] text-pekat/50">
        {new Date(d.dibuat_pada).toLocaleDateString('id-ID', {
          day: '2-digit', month: 'short', year: 'numeric',
        })}
      </td>
      <td className="px-4 py-3.5 text-right">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onClick(); }}
          className="flex items-center gap-1.5 rounded-full bg-rekah px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-rekah-tua"
        >
          <Eye className="h-3.5 w-3.5" /> Tinjau
        </button>
      </td>
    </tr>
  );
}

export default function AntreanTinjauan() {
  const [antrean, setAntrean] = useState<KontenDraf[]>([]);
  const [memuat, setMemuat] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    muatAntrean()
      .then(setAntrean)
      .catch(console.error)
      .finally(() => setMemuat(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <HeroAdmin
        tema="antrean"
        eyebrow="Tinjauan klinis"
        judul="Antrean Tinjauan"
        deskripsi="Konten yang sudah diajukan admin dan menunggu persetujuan Psikolog Fitri. Penulis tidak bisa menyetujui kontennya sendiri."
      />

      {memuat ? (
        <p className="text-[14px] text-pekat/40">Memuat antrean...</p>
      ) : antrean.length === 0 ? (
        <KosongBerilustrasi tema="antrean" judul="Antrean kosong">
          <p className="text-[13px] text-pekat/55">Belum ada konten yang menunggu tinjauan saat ini.</p>
        </KosongBerilustrasi>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-rekah/10 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-rekah/10 bg-rekah/5 text-left">
                <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-pekat/40">
                  Judul Konten
                </th>
                <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-pekat/40">
                  Jenis
                </th>
                <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-pekat/40">
                  Diajukan
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {antrean.map(d => baris(d, () => navigate(`/rekah-admin/diff/${d.id}`)))}
            </tbody>
          </table>
          <div className="border-t border-rekah/8 px-5 py-3 text-[12px] text-pekat/40">
            {antrean.length} item menunggu tinjauan
          </div>
        </div>
      )}
    </div>
  );
}
