import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { muatSemuaDraf, KontenDraf, LABEL_STATUS, LABEL_JENIS, JenisKonten, StatusPipeline } from '../../lib/supabase/pipeline';
import { HeroAdmin, TEMA, BungaNilai, KosongBerilustrasi } from './tema/temaAdmin';
import type { KunciTema } from './tema/temaAdmin';

const TEMA_JENIS: Record<JenisKonten, KunciTema> = {
  kegiatan_ajak_main: 'ajak', panduan_tumbuh: 'wawasan', sikap: 'sikap', temani_journey: 'temani', bantu_situasi: 'bantu', kebiasaan_baik: 'sikap',
};

const WARNA_STATUS: Record<StatusPipeline, string> = {
  draf: 'bg-pekat/8 text-pekat/60',
  diajukan: 'bg-kuning text-pekat',
  disetujui: 'bg-daun/20 text-daun',
  ditolak: 'bg-rekah/15 text-rekah-tua',
  tayang: 'bg-langit/30 text-pekat',
};

const BAGIAN: Array<{ to: string; label: string; tema: KunciTema; jenis?: JenisKonten; ket: string }> = [
  { to: '/rekah-admin/ajak-main', label: 'Ajak Main', tema: 'ajak', jenis: 'kegiatan_ajak_main', ket: 'Kegiatan main sesuai usia' },
  { to: '/rekah-admin/wawasan', label: 'Wawasan Tumbuh', tema: 'wawasan', jenis: 'panduan_tumbuh', ket: 'Kartu panduan tumbuh kembang' },
  { to: '/rekah-admin/sikap', label: 'Kebiasaan Baik', tema: 'sikap', jenis: 'kebiasaan_baik', ket: 'Rutin di Irama Hari & situasional' },
  { to: '/rekah-admin/temani', label: 'Temani', tema: 'temani', jenis: 'temani_journey', ket: 'Perjalanan berpandu hari demi hari' },
  { to: '/rekah-admin/bantu', label: 'Bantu', tema: 'bantu', jenis: 'bantu_situasi', ket: 'Situasi & respons momen sulit' },
  { to: '/rekah-admin/tracker', label: 'Tracker Konten', tema: 'tracker', ket: 'Kesegaran sumber & modul' },
];

function KartuStat({ label, nilai, Icon, tema }: { label: string; nilai: number; Icon: React.ElementType; tema: KunciTema }) {
  const t = TEMA[tema];
  return (
    <div className="relative overflow-hidden rounded-[22px] p-5" style={{ background: t.tint }}>
      <span aria-hidden className="absolute -right-3 -top-3 opacity-80"><BungaNilai nilai={t.nilai} size={64} /></span>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white" style={{ color: t.teks }}><Icon className="h-[18px] w-[18px]" /></span>
      <p className="mt-3 font-bricolage text-[30px] font-extrabold leading-none tabular-nums text-pekat">{nilai}</p>
      <p className="mt-1 text-[13px] font-semibold" style={{ color: t.teks }}>{label}</p>
    </div>
  );
}

export default function BerandaRekahAdmin() {
  const { peranStaf } = useAuth();
  const navigate = useNavigate();
  const [daftar, setDaftar] = useState<KontenDraf[]>([]);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    muatSemuaDraf()
      .then(setDaftar)
      .catch(console.error)
      .finally(() => setMemuat(false));
  }, []);

  const hitung = (s: StatusPipeline) => daftar.filter(d => d.status === s).length;
  const menunggu = hitung('diajukan');
  const terakhir = [...daftar]
    .sort((a, b) => new Date(b.diperbarui_pada).getTime() - new Date(a.diperbarui_pada).getTime())
    .slice(0, 6);
  const peninjau = peranStaf === 'peninjau_klinis';

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <HeroAdmin
        tema="beranda"
        eyebrow={peninjau ? 'Peninjau klinis' : 'Admin konten'}
        judul="Taman konten Rekah"
        deskripsi={peninjau
          ? 'Tinjau dan setujui konten sebelum tayang ke orang tua. Semua yang Anda setujui tumbuh di sini.'
          : 'Kelola dan ajukan konten untuk ditinjau Psikolog Fitri. Setiap bagian punya warnanya sendiri.'}
        aksi={menunggu > 0 ? (
          <Link to="/rekah-admin/antrean" className="inline-flex items-center gap-2 rounded-full bg-pekat px-5 py-2.5 text-[13px] font-bold text-white hover:bg-rekah-tua">
            {menunggu} menunggu tinjauan <ArrowRight className="h-4 w-4" />
          </Link>
        ) : undefined}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <KartuStat label="Menunggu tinjauan" nilai={menunggu} Icon={Clock} tema="ajak" />
        <KartuStat label="Disetujui" nilai={hitung('disetujui')} Icon={CheckCircle2} tema="sikap" />
        <KartuStat label="Ditolak" nilai={hitung('ditolak')} Icon={XCircle} tema="bantu" />
        <KartuStat label="Tayang" nilai={hitung('tayang')} Icon={ClipboardList} tema="wawasan" />
      </div>

      <h2 className="mb-3 font-bricolage text-[18px] font-bold text-pekat">Bagian konten</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {BAGIAN.map(b => {
          const t = TEMA[b.tema];
          const aktif = b.jenis ? daftar.filter(d => d.jenis === b.jenis && d.status !== 'tayang').length : null;
          return (
            <Link key={b.to} to={b.to}
              className="group relative flex min-h-[120px] items-center gap-4 overflow-hidden rounded-[24px] border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-16px_rgba(110,59,87,0.45)]"
              style={{ borderColor: `${t.aksen}66` }}>
              <span aria-hidden className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px_20px_20px_6px]" style={{ background: t.tint }}>
                <BungaNilai nilai={t.nilai} size={46} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bricolage text-[16px] font-bold text-pekat">{b.label}</span>
                <span className="block text-[12.5px] text-pekat/60">{b.ket}</span>
                {aktif !== null && (
                  <span className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: t.tint, color: t.teks }}>
                    {aktif} draf aktif
                  </span>
                )}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" style={{ color: t.teks }} />
            </Link>
          );
        })}
      </div>

      <h2 className="mb-3 font-bricolage text-[18px] font-bold text-pekat">Aktivitas terakhir</h2>
      {memuat ? (
        <p className="text-[14px] text-pekat/40">Memuat...</p>
      ) : terakhir.length === 0 ? (
        <KosongBerilustrasi tema="beranda" judul="Belum ada draf konten">
          <p className="text-[13px] text-pekat/55">Draf yang dibuat di setiap bagian akan muncul di sini.</p>
        </KosongBerilustrasi>
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-rekah/10 bg-white">
          {terakhir.map((d, i) => {
            const t = TEMA[TEMA_JENIS[d.jenis] ?? 'beranda'];
            return (
              <div key={d.id} onClick={() => navigate(`/rekah-admin/diff/${d.id}`)} role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') navigate(`/rekah-admin/diff/${d.id}`); }}
                className={`flex cursor-pointer items-center gap-4 px-5 py-4 transition hover:bg-fajar ${i > 0 ? 'border-t border-rekah/8' : ''}`}>
                <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ background: t.tint }}>
                  <BungaNilai nilai={t.nilai} size={26} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-pekat">{d.judul}</p>
                  <p className="text-[12px]"><span className="font-semibold" style={{ color: t.teks }}>{LABEL_JENIS[d.jenis]}</span><span className="text-pekat/45"> · {new Date(d.diperbarui_pada).toLocaleDateString('id-ID')}</span></p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${WARNA_STATUS[d.status]}`}>{LABEL_STATUS[d.status]}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
