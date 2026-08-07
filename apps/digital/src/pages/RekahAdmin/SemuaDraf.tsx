import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { muatSemuaDraf, KontenDraf, LABEL_STATUS, LABEL_JENIS, StatusPipeline } from '../../lib/supabase/pipeline';

const STATUS_URUTAN: StatusPipeline[] = ['diajukan', 'draf', 'disetujui', 'tayang', 'ditolak'];

const WARNA_STATUS: Record<StatusPipeline, string> = {
  draf:      'bg-pekat/8 text-pekat/60',
  diajukan:  'bg-madu/20 text-madu',
  disetujui: 'bg-daun/20 text-daun',
  ditolak:   'bg-rekah/20 text-rekah',
  tayang:    'bg-rekah/10 text-rekah-tua',
};

export default function SemuaDraf() {
  const [daftar, setDaftar] = useState<KontenDraf[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [filter, setFilter] = useState<StatusPipeline | 'semua'>('semua');
  const navigate = useNavigate();

  useEffect(() => {
    muatSemuaDraf()
      .then(setDaftar)
      .catch(console.error)
      .finally(() => setMemuat(false));
  }, []);

  const tampil = filter === 'semua' ? daftar : daftar.filter(d => d.status === filter);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-1 font-bricolage text-[22px] font-extrabold text-pekat">Semua Draf Konten</h1>
      <p className="mb-6 text-[13px] text-pekat/50">Seluruh konten dalam pipeline, semua status.</p>

      {/* Filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(['semua', ...STATUS_URUTAN] as const).map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
              filter === s
                ? 'bg-rekah text-white'
                : 'border border-rekah/20 text-pekat/50 hover:border-rekah/50'
            }`}
          >
            {s === 'semua' ? 'Semua' : LABEL_STATUS[s]}
          </button>
        ))}
      </div>

      {memuat ? (
        <p className="text-[14px] text-pekat/40">Memuat...</p>
      ) : tampil.length === 0 ? (
        <p className="text-[14px] text-pekat/40">Tidak ada konten.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-rekah/10 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-rekah/10 bg-rekah/5 text-left">
                <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Judul</th>
                <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Jenis</th>
                <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Status</th>
                <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Diperbarui</th>
              </tr>
            </thead>
            <tbody>
              {tampil.map((d, i) => (
                <tr
                  key={d.id}
                  onClick={() => navigate(`/rekah-admin/diff/${d.id}`)}
                  className={`cursor-pointer transition hover:bg-rekah/5 ${i > 0 ? 'border-t border-rekah/8' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <p className="text-[14px] font-semibold text-pekat">{d.judul}</p>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-pekat/60">{LABEL_JENIS[d.jenis]}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${WARNA_STATUS[d.status]}`}>
                      {LABEL_STATUS[d.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-pekat/50">
                    {new Date(d.diperbarui_pada).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-rekah/8 px-5 py-3 text-[12px] text-pekat/40">
            {tampil.length} dari {daftar.length} konten
          </div>
        </div>
      )}
    </div>
  );
}
