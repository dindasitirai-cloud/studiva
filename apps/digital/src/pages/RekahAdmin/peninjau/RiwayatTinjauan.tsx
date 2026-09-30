// Riwayat Tinjauan — jejak keputusan peninjau yang sedang login (setujui, tolak, minta revisi),
// termasuk status konten sekarang (mis. sudah tayang atau sedang direvisi penulis).
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { muatRiwayatSaya, LABEL_JENIS, LABEL_STATUS } from '../../../lib/supabase/pipeline';
import type { RiwayatDenganDraf } from '../../../lib/supabase/pipeline';
import { HeroAdmin, TEMA, BungaNilai } from '../tema/temaAdmin';
import KebunFlat from './KebunFlat';
import { TEMA_JENIS } from './BerandaPeninjau';
import { LABEL_TINDAKAN } from './panduanTinjauan';

type Saring = 'semua' | 'disetujui' | 'revisi_diminta' | 'ditolak';
const WARNA: Record<string, string> = {
  disetujui: 'bg-daun/15 text-daun', ditolak: 'bg-rekah/15 text-rekah-tua', revisi_diminta: 'bg-madu/25 text-pekat',
};

export default function RiwayatTinjauan() {
  const navigate = useNavigate();
  const [daftar, setDaftar] = useState<RiwayatDenganDraf[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [saring, setSaring] = useState<Saring>('semua');

  useEffect(() => {
    muatRiwayatSaya(300).then(setDaftar).catch(e => setGalat((e as Error).message)).finally(() => setMemuat(false));
  }, []);

  const tampil = saring === 'semua' ? daftar : daftar.filter(r => r.tindakan === saring);
  const perBulan = useMemo(() => {
    const m = new Map<string, RiwayatDenganDraf[]>();
    tampil.forEach(r => {
      const k = new Date(r.dibuat_pada).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      m.set(k, [...(m.get(k) ?? []), r]);
    });
    return [...m.entries()];
  }, [tampil]);
  const hitung = (t: Saring) => (t === 'semua' ? daftar.length : daftar.filter(r => r.tindakan === t).length);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <HeroAdmin tema="antrean" eyebrow="Tinjauan klinis" judul="Riwayat Tinjauan"
        deskripsi="Semua keputusan yang pernah Ibu buat, lengkap dengan catatannya dan status konten sekarang." />

      <div className="mb-5 flex flex-wrap gap-2">
        {(['semua', 'disetujui', 'revisi_diminta', 'ditolak'] as Saring[]).map(s => (
          <button key={s} type="button" onClick={() => setSaring(s)}
            className={`rounded-full px-4 py-1.5 text-[12.5px] font-bold transition ${saring === s ? 'bg-pekat text-white' : 'border border-rekah/15 bg-white text-pekat/65'}`}>
            {s === 'semua' ? 'Semua' : LABEL_TINDAKAN[s]} · {hitung(s)}
          </button>
        ))}
      </div>

      {galat && <div className="mb-4 rounded-xl bg-rekah/15 px-5 py-3 text-[13px] font-semibold text-rekah-tua">Gagal memuat: {galat}</div>}

      {memuat ? <p className="text-[14px] text-pekat/40">Memuat…</p> : tampil.length === 0 ? (
        <div className="overflow-hidden rounded-[26px] border border-dashed border-[#C9B8F0] bg-white">
          <KebunFlat tinggi={150} suasana="pagi" aksesori={false} jumlah={7} />
          <p className="px-6 py-6 text-center text-[13px] text-pekat/55">Belum ada keputusan di sini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {perBulan.map(([bulan, isi]) => (
            <section key={bulan}>
              <h2 className="mb-2 font-bricolage text-[15px] font-bold capitalize text-pekat/70">{bulan}</h2>
              <div className="overflow-hidden rounded-[22px] border border-rekah/10 bg-white">
                {isi.map((r, i) => {
                  const t = r.draf ? TEMA[TEMA_JENIS[r.draf.jenis]] : TEMA.antrean;
                  return (
                    <button key={r.id} type="button" onClick={() => navigate(`/rekah-admin/diff/${r.id_draf}`)}
                      className={`flex w-full items-start gap-3.5 px-4 py-3.5 text-left transition hover:bg-[#FBF7FF] ${i ? 'border-t border-rekah/8' : ''}`}>
                      <span aria-hidden className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: t.tint }}><BungaNilai nilai={t.nilai} size={22} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${WARNA[r.tindakan] ?? 'bg-pekat/5 text-pekat/60'}`}>{LABEL_TINDAKAN[r.tindakan] ?? r.tindakan}</span>
                          <span className="truncate text-[14px] font-bold text-pekat">{r.draf?.judul ?? '(konten)'}</span>
                        </span>
                        {r.catatan && <span className="mt-1 block text-[12.5px] leading-snug text-pekat/65">“{r.catatan}”</span>}
                        <span className="mt-1 block text-[11.5px] text-pekat/45">
                          {r.draf ? `${LABEL_JENIS[r.draf.jenis]} · sekarang: ${LABEL_STATUS[r.draf.status]}` : ''} · {new Date(r.dibuat_pada).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
