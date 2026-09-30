// Ruang Tinjauan — beranda untuk akun peninjau klinis (Psikolog Fitri).
// Fokus: apa yang menunggu, mulai dari yang paling lama, dan jejak keputusan terakhir.
// Tanpa skor, tanpa target, tanpa hitungan beruntun — hanya jumlah yang perlu diketahui.
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, HeartHandshake, Leaf, NotebookPen, ShieldCheck, Sprout } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { muatAntrean, muatRiwayatSaya, LABEL_JENIS } from '../../../lib/supabase/pipeline';
import type { KontenDraf, RiwayatDenganDraf, JenisKonten } from '../../../lib/supabase/pipeline';
import { TEMA, BungaNilai } from '../tema/temaAdmin';
import type { KunciTema } from '../tema/temaAdmin';
import KebunFlat from './KebunFlat';
import { lamaMenunggu, sapaanWaktu, LABEL_TINDAKAN, PERIKSA_UMUM } from './panduanTinjauan';

export const TEMA_JENIS: Record<JenisKonten, KunciTema> = {
  kegiatan_ajak_main: 'ajak', panduan_tumbuh: 'wawasan', sikap: 'sikap', temani_journey: 'temani', bantu_situasi: 'bantu', kebiasaan_baik: 'sikap',
};
const URUT_JENIS: JenisKonten[] = ['kebiasaan_baik', 'temani_journey', 'bantu_situasi', 'panduan_tumbuh', 'kegiatan_ajak_main', 'sikap'];

const WARNA_TINDAKAN: Record<string, string> = {
  disetujui: 'bg-daun/15 text-daun', ditolak: 'bg-rekah/15 text-rekah-tua', revisi_diminta: 'bg-madu/25 text-pekat',
};

export function namaPeninjau(meta: Record<string, unknown> | undefined): string {
  const n = String(meta?.nama ?? meta?.full_name ?? meta?.name ?? '').trim();
  if (!n) return 'Bu Fitri';
  const depan = n.replace(/^(psikolog|psi\.?|dr\.?)\s+/i, '').split(/\s+/)[0];
  return `Bu ${depan}`;
}

export default function BerandaPeninjau() {
  const { supabaseUser } = useAuth();
  const navigate = useNavigate();
  const [antrean, setAntrean] = useState<KontenDraf[]>([]);
  const [riwayat, setRiwayat] = useState<RiwayatDenganDraf[]>([]);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    Promise.all([muatAntrean(), muatRiwayatSaya(8).catch(() => [])])
      .then(([a, r]) => { setAntrean(a); setRiwayat(r); })
      .catch(console.error)
      .finally(() => setMemuat(false));
  }, []);

  const perJenis = useMemo(() => {
    const m = new Map<JenisKonten, KontenDraf[]>();
    antrean.forEach(d => m.set(d.jenis, [...(m.get(d.jenis) ?? []), d]));
    return m;
  }, [antrean]);
  const tertua = antrean[0];
  const nama = namaPeninjau(supabaseUser?.user_metadata);
  const jam = new Date().getHours();
  const suasana = jam < 11 ? 'pagi' : jam < 17 ? 'siang' : 'senja';

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Hero kebun */}
      <section className="mb-7 overflow-hidden rounded-[30px] bg-white shadow-[0_22px_48px_-40px_rgba(90,50,70,.55)]">
        <KebunFlat tinggi={250} suasana={suasana} />
        <div className="flex flex-col gap-5 px-7 py-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 max-w-[60ch]">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#5B3FAF]">Ruang Tinjauan · Peninjau klinis</p>
            <h1 className="mt-1 font-bricolage text-[28px] font-extrabold leading-tight text-pekat">{sapaanWaktu()}, {nama}</h1>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-pekat/70">
              {memuat ? 'Menyiapkan antrean…'
                : antrean.length === 0 ? 'Tidak ada konten yang menunggu. Terima kasih sudah merawat isi Rekah untuk keluarga.'
                  : <>Ada <b className="text-pekat">{antrean.length} konten</b> menunggu tinjauan{tertua ? <>; yang paling lama sudah menunggu <b className="text-pekat">{lamaMenunggu(tertua.diperbarui_pada).teks}</b></> : null}. Tidak ada yang tayang ke keluarga sebelum Ibu setujui.</>}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {tertua && (
              <button type="button" onClick={() => navigate(`/rekah-admin/diff/${tertua.id}`)}
                className="flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-white shadow-[0_10px_22px_-12px_rgba(91,63,175,.8)]" style={{ background: '#5B3FAF' }}>
                Mulai tinjau <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <Link to="/rekah-admin/antrean" className="flex items-center gap-2 rounded-full border-2 border-[#C9B8F0] bg-white px-5 py-2.5 text-[13.5px] font-bold text-[#5B3FAF]">
              Lihat antrean
            </Link>
          </div>
        </div>
      </section>

      {/* Menunggu per bagian */}
      <h2 className="mb-3 font-bricolage text-[18px] font-bold text-pekat">Menunggu per bagian</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {URUT_JENIS.map(j => {
          const t = TEMA[TEMA_JENIS[j]];
          const n = perJenis.get(j)?.length ?? 0;
          return (
            <Link key={j} to={`/rekah-admin/antrean?jenis=${j}`}
              className={`relative overflow-hidden rounded-[22px] p-4 transition hover:-translate-y-0.5 ${n ? '' : 'opacity-60'}`} style={{ background: t.tint }}>
              <span aria-hidden className="absolute -right-2 -top-2 opacity-80"><BungaNilai nilai={t.nilai} size={46} /></span>
              <p className="font-bricolage text-[28px] font-extrabold leading-none tabular-nums text-pekat">{n}</p>
              <p className="mt-1.5 text-[12.5px] font-bold leading-tight" style={{ color: t.teks }}>{LABEL_JENIS[j]}</p>
            </Link>
          );
        })}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Paling lama menunggu */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-bricolage text-[18px] font-bold text-pekat"><Clock className="h-[18px] w-[18px] text-[#5B3FAF]" /> Paling lama menunggu</h2>
          {antrean.length === 0 ? (
            <div className="overflow-hidden rounded-[24px] border border-dashed border-[#C9B8F0] bg-white">
              <KebunFlat tinggi={120} suasana="siang" aksesori={false} jumlah={6} />
              <p className="px-5 py-4 text-center text-[13px] text-pekat/55">{memuat ? 'Memuat…' : 'Antrean kosong. Kebun sedang tenang.'}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[24px] border border-rekah/10 bg-white">
              {antrean.slice(0, 5).map((d, i) => {
                const t = TEMA[TEMA_JENIS[d.jenis]];
                const lama = lamaMenunggu(d.diperbarui_pada);
                return (
                  <button key={d.id} type="button" onClick={() => navigate(`/rekah-admin/diff/${d.id}`)}
                    className={`flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition hover:bg-[#FBF7FF] ${i ? 'border-t border-rekah/8' : ''}`}>
                    <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ background: t.tint }}><BungaNilai nilai={t.nilai} size={26} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold text-pekat">{d.judul}</span>
                      <span className="text-[12px]"><b style={{ color: t.teks }}>{LABEL_JENIS[d.jenis]}</b><span className="text-pekat/45">{d.id_konten_sumber ? ' · revisi' : ' · baru'}</span></span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${lama.hari >= 3 ? 'bg-madu/25 text-pekat' : 'bg-pekat/5 text-pekat/55'}`}>{lama.teks}</span>
                  </button>
                );
              })}
              {antrean.length > 5 && <Link to="/rekah-admin/antrean" className="block border-t border-rekah/8 px-4 py-3 text-center text-[12.5px] font-bold text-[#5B3FAF]">Lihat {antrean.length - 5} lainnya →</Link>}
            </div>
          )}
        </section>

        {/* Keputusan terakhir */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-bricolage text-[18px] font-bold text-pekat"><NotebookPen className="h-[18px] w-[18px] text-[#5B3FAF]" /> Keputusan terakhir Ibu</h2>
          {riwayat.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#C9B8F0] bg-white px-5 py-8 text-center text-[13px] text-pekat/55">{memuat ? 'Memuat…' : 'Belum ada keputusan tercatat.'}</div>
          ) : (
            <div className="overflow-hidden rounded-[24px] border border-rekah/10 bg-white">
              {riwayat.slice(0, 5).map((r, i) => (
                <button key={r.id} type="button" onClick={() => navigate(`/rekah-admin/diff/${r.id_draf}`)}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#FBF7FF] ${i ? 'border-t border-rekah/8' : ''}`}>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${WARNA_TINDAKAN[r.tindakan] ?? 'bg-pekat/5 text-pekat/60'}`}>{LABEL_TINDAKAN[r.tindakan] ?? r.tindakan}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold text-pekat">{r.draf?.judul ?? '(konten)'}</span>
                    <span className="text-[12px] text-pekat/45">{r.draf ? LABEL_JENIS[r.draf.jenis] : ''} · {new Date(r.dibuat_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  </span>
                </button>
              ))}
              <Link to="/rekah-admin/riwayat" className="block border-t border-rekah/8 px-4 py-3 text-center text-[12.5px] font-bold text-[#5B3FAF]">Semua riwayat →</Link>
            </div>
          )}
        </section>
      </div>

      {/* Pegangan tinjauan */}
      <section className="relative overflow-hidden rounded-[26px] border border-[#C9B8F0]/60 p-6" style={{ background: 'linear-gradient(120deg,#EEE8FB 0%,#FFF6FB 100%)' }}>
        <h2 className="mb-1 font-bricolage text-[18px] font-bold text-pekat">Pegangan tinjauan</h2>
        <p className="mb-4 text-[13px] text-pekat/60">Pengingat singkat yang juga muncul di setiap layar tinjauan.</p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            [HeartHandshake, PERIKSA_UMUM[0]],
            [Leaf, PERIKSA_UMUM[1]],
            [Sprout, PERIKSA_UMUM[2]],
          ].map(([Icon, teks], i) => {
            const I = Icon as typeof Leaf;
            return (
              <div key={i} className="flex items-start gap-3 rounded-2xl bg-white/85 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEE8FB] text-[#5B3FAF]"><I className="h-[18px] w-[18px]" /></span>
                <p className="text-[13px] leading-snug text-pekat/80">{teks as string}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-4 flex items-center gap-2 text-[12.5px] text-pekat/60"><ShieldCheck className="h-4 w-4 text-daun" /> Penulis tidak bisa menyetujui kontennya sendiri — keputusan akhir selalu di tangan peninjau klinis.</p>
      </section>
    </div>
  );
}
