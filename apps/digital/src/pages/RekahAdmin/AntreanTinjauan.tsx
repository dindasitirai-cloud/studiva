// Antrean Tinjauan — konten yang diajukan admin dan menunggu keputusan peninjau klinis.
// Urut dari yang paling lama menunggu; bisa disaring per bagian (?jenis=...).
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { muatAntrean, LABEL_JENIS } from '../../lib/supabase/pipeline';
import type { KontenDraf, JenisKonten } from '../../lib/supabase/pipeline';
import { HeroAdmin, TEMA, BungaNilai } from './tema/temaAdmin';
import KebunFlat from './peninjau/KebunFlat';
import { TEMA_JENIS } from './peninjau/BerandaPeninjau';
import { lamaMenunggu } from './peninjau/panduanTinjauan';

export default function AntreanTinjauan() {
  const [antrean, setAntrean] = useState<KontenDraf[]>([]);
  const [memuat, setMemuat] = useState(true);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { peranStaf } = useAuth();
  const peninjau = peranStaf === 'peninjau_klinis';
  const filter = (params.get('jenis') as JenisKonten | null) ?? null;

  useEffect(() => {
    muatAntrean().then(setAntrean).catch(console.error).finally(() => setMemuat(false));
  }, []);

  const jumlah = useMemo(() => {
    const m = new Map<JenisKonten, number>();
    antrean.forEach(d => m.set(d.jenis, (m.get(d.jenis) ?? 0) + 1));
    return m;
  }, [antrean]);
  const tampil = filter ? antrean.filter(d => d.jenis === filter) : antrean;
  const buka = (d: KontenDraf) => navigate(`/rekah-admin/diff/${d.id}${filter ? `?jenis=${filter}` : ''}`);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <HeroAdmin
        tema="antrean"
        eyebrow="Tinjauan klinis"
        judul="Antrean Tinjauan"
        deskripsi={peninjau
          ? 'Mulai dari yang paling lama menunggu. Setelah memutuskan, Ibu langsung bisa lanjut ke konten berikutnya.'
          : 'Konten yang sudah diajukan dan menunggu persetujuan Psikolog Fitri. Penulis tidak bisa menyetujui kontennya sendiri.'}
        aksi={tampil.length > 0 && peninjau ? (
          <button type="button" onClick={() => buka(tampil[0])} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-white" style={{ background: '#5B3FAF' }}>
            Tinjau dari yang terlama <ArrowRight className="h-4 w-4" />
          </button>
        ) : undefined}
      />

      {/* Saring per bagian */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setParams({})}
          className={`rounded-full px-4 py-1.5 text-[12.5px] font-bold transition ${!filter ? 'bg-pekat text-white' : 'border border-rekah/15 bg-white text-pekat/65'}`}>
          Semua · {antrean.length}
        </button>
        {(Object.keys(LABEL_JENIS) as JenisKonten[]).filter(j => jumlah.get(j)).map(j => {
          const t = TEMA[TEMA_JENIS[j]];
          const aktif = filter === j;
          return (
            <button key={j} type="button" onClick={() => setParams({ jenis: j })}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition"
              style={aktif ? { background: t.teks, color: '#fff' } : { background: t.tint, color: t.teks }}>
              <BungaNilai nilai={t.nilai} size={14} /> {LABEL_JENIS[j]} · {jumlah.get(j)}
            </button>
          );
        })}
      </div>

      {memuat ? (
        <p className="text-[14px] text-pekat/40">Memuat antrean...</p>
      ) : tampil.length === 0 ? (
        <div className="overflow-hidden rounded-[26px] border border-dashed border-[#C9B8F0] bg-white">
          <KebunFlat tinggi={170} suasana="siang" aksesori={false} jumlah={7} />
          <div className="px-6 py-6 text-center">
            <p className="font-bricolage text-[17px] font-bold text-pekat">Antrean kosong</p>
            <p className="mt-1 text-[13px] text-pekat/55">Belum ada konten yang menunggu tinjauan{filter ? ' di bagian ini' : ''}.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {tampil.map((d, i) => {
            const t = TEMA[TEMA_JENIS[d.jenis]];
            const lama = lamaMenunggu(d.diperbarui_pada);
            return (
              <button key={d.id} type="button" onClick={() => buka(d)}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-[24px] border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-20px_rgba(90,50,70,.5)]"
                style={{ borderColor: `${t.aksen}66` }}>
                <span aria-hidden className="absolute -right-3 -top-3 opacity-70"><BungaNilai nilai={t.nilai} size={62} /></span>
                <div className="flex flex-wrap items-center gap-1.5 pr-12">
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: t.tint, color: t.teks }}>{LABEL_JENIS[d.jenis]}</span>
                  {d.id_konten_sumber
                    ? <span className="flex items-center gap-1 rounded-full bg-langit/20 px-2.5 py-0.5 text-[11px] font-bold text-pekat/70"><RefreshCw className="h-3 w-3" /> Revisi</span>
                    : <span className="flex items-center gap-1 rounded-full bg-kuning/60 px-2.5 py-0.5 text-[11px] font-bold text-pekat/75"><Sparkles className="h-3 w-3" /> Baru</span>}
                  {i === 0 && !filter && <span className="rounded-full bg-pekat px-2.5 py-0.5 text-[11px] font-bold text-white">Berikutnya</span>}
                </div>
                <p className="pr-10 font-bricolage text-[17px] font-bold leading-snug text-pekat">{d.judul}</p>
                {d.catatan_penulis && <p className="line-clamp-2 rounded-xl bg-fajar/60 px-3 py-2 text-[12.5px] text-pekat/70">“{d.catatan_penulis}”</p>}
                {d.catatan_tinjauan && <p className="line-clamp-2 text-[12px] text-pekat/55">Catatan tinjauan sebelumnya: {d.catatan_tinjauan}</p>}
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold ${lama.hari >= 3 ? 'bg-madu/25 text-pekat' : 'bg-pekat/5 text-pekat/55'}`}>Menunggu {lama.teks}</span>
                  <span className="flex items-center gap-1 text-[13px] font-bold transition group-hover:translate-x-0.5" style={{ color: t.teks }}>Tinjau <ArrowRight className="h-4 w-4" /></span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
