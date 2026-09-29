// Admin Kebiasaan Baik (Phase 19) — satu katalog, dua kategori:
//   • Rutin        → menempel di kegiatan template Irama Hari (Bangun tidur, Sarapan, …)
//   • Situasional  → muncul "kapan saja" di Kelola, dengan keterangan kapan
// Plus pengaturan kegiatan template (nama, jam, bagian waktu, urutan, tampil/sembunyi).
// Isi kebiasaan tayang lewat tinjauan Psikolog Fitri; kegiatan template disimpan langsung.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Archive, ArchiveRestore, ArrowDown, ArrowUp, Copy, Download, Eye, EyeOff, FileSpreadsheet, Layers, Pencil, Plus, Rocket,
  Save, Send, Trash2, Upload, X, Zap, Sun, CloudSun, Moon,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { HeroAdmin, TEMA, BungaNilai, KosongBerilustrasi } from '../tema/temaAdmin';
import { NILAI } from '../../../features/akar-keluarga/content';
import type { NilaiAkar } from '../../../features/akar-keluarga/content';
import {
  muatKatalogKebiasaan, muatDrafKebiasaan, muatTemplateIrama, ajukanDrafKebiasaan, hapusDrafKebiasaan, terapkanKebiasaan,
  aturStatusKebiasaan, buatDrafKebiasaan, perbaruiDrafKebiasaan, isiDariKebiasaan, isiKebiasaanKosong, idKebiasaanBerikutnya,
  simpanTemplate, simpanUrutanTemplate, hapusTemplate, normalisasiTemplate,
} from '../../../lib/supabase/kebiasaan';
import type { DrafKebiasaan, IsiKebiasaan, KebiasaanTayang } from '../../../lib/supabase/kebiasaan';
import {
  TEMPLATE_SEED, KEBIASAAN_SEED, BAND_USIA, IKON_TEMPLATE, LABEL_WAKTU, labelUsia,
} from '../../../features/irama-hari/kebiasaanSeed';
import type { TemplateIrama, Waktu, KategoriKebiasaan } from '../../../features/irama-hari/kebiasaanSeed';
import { muatUlangKatalogIrama } from '../../../features/irama-hari/iramaKatalog';
import IlustrasiKegiatan from '../../../features/irama-hari/IlustrasiKegiatan';
import {
  bacaFileKeb, validasiImportKeb, periksaKelengkapanKeb, periksaKataKeb, keCSVKeb,
} from '../../../features/irama-hari/admin/kebiasaanImport';
import type { BarisImportKeb } from '../../../features/irama-hari/admin/kebiasaanImport';
import { unduhTeks } from '../../../features/temani/admin/temaniImport';

const URL_TEMPLATE = '/templates/Rekah_Template_Import_Kebiasaan_v1.xlsx';
const DRAF_TERBUKA = ['draf', 'diajukan', 'disetujui', 'ditolak'];
const T = TEMA.sikap;
const WAKTU: Waktu[] = ['pagi', 'siang', 'malam'];
const WARNA_WAKTU: Record<Waktu, { dot: string; soft: string; Icon: typeof Sun }> = {
  pagi: { dot: '#F06BA8', soft: '#FDEAF3', Icon: Sun },
  siang: { dot: '#E9A93B', soft: '#FDF2DC', Icon: CloudSun },
  malam: { dot: '#8B6FD6', soft: '#F0EBFB', Icon: Moon },
};

interface Baris { kunci: string; isi: IsiKebiasaan; live: KebiasaanTayang | null; draf: DrafKebiasaan | null }
type Status = 'draf' | 'diajukan' | 'disetujui' | 'ditolak' | 'tayang' | 'diarsipkan';
const LABEL: Record<Status, string> = {
  draf: 'Draf', diajukan: 'Menunggu tinjauan', disetujui: 'Disetujui · siap diterapkan', ditolak: 'Ditolak', tayang: 'Tayang', diarsipkan: 'Diarsipkan',
};
const WARNA: Record<Status, string> = {
  draf: 'bg-pekat/8 text-pekat/60', diajukan: 'bg-madu/20 text-pekat', disetujui: 'bg-daun/20 text-daun',
  ditolak: 'bg-rekah/15 text-rekah-tua', tayang: 'bg-langit/25 text-pekat', diarsipkan: 'bg-pekat/8 text-pekat/45',
};
const statusBaris = (b: Baris): Status => (b.draf ? (b.draf.status as Status) : ((b.live?.status ?? 'draf') as Status));
const btnKecil = 'inline-flex items-center gap-1 rounded-full border border-rekah/20 bg-white px-2.5 py-1 text-[11.5px] font-semibold text-pekat/70 transition hover:border-rekah/50 disabled:opacity-40';
const inputCls = 'rounded-xl border border-rekah/15 bg-white px-3 py-2 text-[13px] text-pekat focus:border-[color:var(--ra-aksen)] focus:outline-none';

function seedSebagaiTayang(): KebiasaanTayang[] {
  return KEBIASAAN_SEED.map(k => ({ ...k, versi: 0, diterbitkan_pada: '' }));
}

export default function KebiasaanAdmin() {
  const { peranStaf, supabaseUser } = useAuth();
  const admin = peranStaf === 'admin';
  const uid = supabaseUser?.id ?? null;
  const navigate = useNavigate();

  const [tab, setTab] = useState<'rutin' | 'situasional' | 'kegiatan' | 'import'>('rutin');
  const [katalog, setKatalog] = useState<KebiasaanTayang[]>([]);
  const [templates, setTemplates] = useState<TemplateIrama[]>(TEMPLATE_SEED);
  const [drafs, setDrafs] = useState<DrafKebiasaan[]>([]);
  const [katalogSiap, setKatalogSiap] = useState(true);
  const [memuat, setMemuat] = useState(true);
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'galat'; teks: string } | null>(null);
  const [q, setQ] = useState('');
  const [fUsia, setFUsia] = useState<number>(-1); // indeks BAND_USIA, -1 = semua
  const [fNilai, setFNilai] = useState<'semua' | NilaiAkar>('semua');
  const [fStatus, setFStatus] = useState<'aktif' | Status>('aktif');
  const [konfirm, setKonfirm] = useState<{ jenis: 'hapus' | 'arsip'; baris: Baris } | null>(null);
  const [sibuk, setSibuk] = useState(false);

  const muat = useCallback(async () => {
    try {
      const [k, tpl] = await Promise.all([muatKatalogKebiasaan({ sertakanArsip: true }), muatTemplateIrama()]);
      const siap = k !== null && tpl !== null;
      setKatalogSiap(siap);
      setKatalog(siap ? k! : seedSebagaiTayang());
      setTemplates(siap ? tpl! : TEMPLATE_SEED);
      setDrafs(siap ? await muatDrafKebiasaan() : []);
    } catch (e) {
      const m = (e as Error).message ?? '';
      if (/jenis_konten|does not exist|schema cache|invalid input value/i.test(m)) { setKatalogSiap(false); setKatalog(seedSebagaiTayang()); return; }
      setPesan({ tipe: 'galat', teks: `Gagal memuat: ${m}` });
    } finally {
      setMemuat(false);
    }
  }, []);
  useEffect(() => { void muat(); }, [muat]);

  const baris = useMemo<Baris[]>(() => {
    const terbuka = drafs.filter(d => DRAF_TERBUKA.includes(d.status));
    const out: Baris[] = katalog.map(s => {
      const d = terbuka.find(x => x.id_konten_sumber === s.id) ?? null;
      return { kunci: `live-${s.id}`, isi: d?.isi ?? isiDariKebiasaan(s), live: s, draf: d };
    });
    terbuka.filter(d => !d.id_konten_sumber || !katalog.some(s => s.id === d.id_konten_sumber))
      .forEach(d => out.push({ kunci: `draf-${d.id}`, isi: d.isi, live: null, draf: d }));
    return out.sort((a, b) => a.isi.urutan - b.isi.urutan || a.isi.id.localeCompare(b.isi.id));
  }, [katalog, drafs]);

  const kunciTemplate = useMemo(() => templates.map(t => t.key), [templates]);
  const namaKegiatan = (k: string | null) => templates.find(t => t.key === k)?.nama ?? (k ? `${k} (tidak ada)` : '—');

  const cocok = (b: Baris) => {
    const s = statusBaris(b);
    if (fStatus === 'aktif' ? s === 'diarsipkan' : s !== fStatus) return false;
    if (fNilai !== 'semua' && !b.isi.nilai.includes(fNilai)) return false;
    if (fUsia >= 0) { const u = BAND_USIA[fUsia]; if (b.isi.usia_max_bulan < u.min || b.isi.usia_min_bulan > u.max) return false; }
    if (q && !`${b.isi.judul} ${b.isi.id} ${b.isi.deskripsi} ${b.isi.kapan ?? ''}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  };
  const rutin = baris.filter(b => b.isi.kategori === 'rutin');
  const situ = baris.filter(b => b.isi.kategori === 'situasional');
  const hidup = (b: Baris) => statusBaris(b) !== 'diarsipkan';
  const antre = baris.filter(b => b.draf?.status === 'diajukan').length;

  async function jalankan(aksi: () => Promise<void>, sukses: string) {
    setSibuk(true); setPesan(null);
    try { await aksi(); setPesan({ tipe: 'sukses', teks: sukses }); await muat(); await muatUlangKatalogIrama(); }
    catch (e) { setPesan({ tipe: 'galat', teks: (e as Error).message ?? 'Terjadi kesalahan.' }); }
    finally { setSibuk(false); }
  }
  const milikSaya = (b: Baris) => !!b.draf && b.draf.id_penulis === uid;
  const bisaAjukan = (b: Baris) => milikSaya(b) && b.draf!.status === 'draf' && !periksaKelengkapanKeb(b.isi, kunciTemplate).length && !periksaKataKeb(b.isi).length;
  const ekspor = (daftar: Baris[]) => { if (daftar.length) unduhTeks(`rekah-kebiasaan-${new Date().toISOString().slice(0, 10)}.csv`, keCSVKeb(daftar.map(b => b.isi))); };
  const idBaru = () => idKebiasaanBerikutnya([...baris.map(b => b.isi.id), ...drafs.map(d => d.isi.id)]);
  const baru = (kategori: KategoriKebiasaan, template: string | null = null) =>
    navigate('/rekah-admin/sikap/baru', { state: { isi: { ...isiKebiasaanKosong(kategori, template), id: idBaru() } } });
  const duplikat = (b: Baris) => navigate('/rekah-admin/sikap/baru', { state: { isi: { ...b.isi, id: idBaru(), judul: `${b.isi.judul} (salinan)` } } });

  function Aksi({ b }: { b: Baris }) {
    const d = b.draf;
    if (!katalogSiap) return null;
    if (!admin) return d ? <Link to={`/rekah-admin/diff/${d.id}`} className={btnKecil}><Eye className="h-3 w-3" /> {d.status === 'diajukan' ? 'Tinjau' : 'Lihat'}</Link> : null;
    return (
      <div className="flex flex-wrap justify-end gap-1">
        {d && ['draf', 'diajukan'].includes(d.status) && milikSaya(b) && <Link to={`/rekah-admin/sikap/draf/${d.id}`} className={btnKecil}><Pencil className="h-3 w-3" /> Edit</Link>}
        {!d && b.live && <Link to={`/rekah-admin/sikap/revisi/${b.live.id}`} className={btnKecil}><Pencil className="h-3 w-3" /> Edit</Link>}
        {d && d.status === 'draf' && milikSaya(b) && (
          <button type="button" disabled={sibuk || !bisaAjukan(b)} title={bisaAjukan(b) ? '' : 'Lengkapi isi atau periksa kata yang ditandai di Edit'} onClick={() => jalankan(() => ajukanDrafKebiasaan(d.id), 'Diajukan ke antrean tinjauan.')} className={btnKecil}>
            <Send className="h-3 w-3" /> Ajukan
          </button>
        )}
        {d && d.status === 'disetujui' && (
          <button type="button" disabled={sibuk} onClick={() => jalankan(() => terapkanKebiasaan(d.id), 'Kebiasaan tayang untuk orang tua.')}
            className="inline-flex items-center gap-1 rounded-full bg-daun px-2.5 py-1 text-[11.5px] font-bold text-white disabled:opacity-50">
            <Rocket className="h-3 w-3" /> Tayangkan
          </button>
        )}
        {d && d.status !== 'draf' && <Link to={`/rekah-admin/diff/${d.id}`} className={btnKecil}><Eye className="h-3 w-3" /> Tinjauan</Link>}
        <button type="button" onClick={() => duplikat(b)} className={btnKecil} aria-label={`Duplikat ${b.isi.judul}`}><Copy className="h-3 w-3" /></button>
        {!d && b.live && (b.live.status === 'diarsipkan' ? (
          <button type="button" disabled={sibuk} onClick={() => jalankan(() => aturStatusKebiasaan(b.live!.id, 'tayang'), 'Kebiasaan tayang kembali.')} className={btnKecil}>
            <ArchiveRestore className="h-3 w-3" /> Pulihkan
          </button>
        ) : (
          <button type="button" onClick={() => setKonfirm({ jenis: 'arsip', baris: b })} className={`${btnKecil} text-rekah-tua`} aria-label={`Arsipkan ${b.isi.judul}`}><Archive className="h-3 w-3" /></button>
        ))}
        {d && ['draf', 'ditolak'].includes(d.status) && milikSaya(b) && (
          <button type="button" onClick={() => setKonfirm({ jenis: 'hapus', baris: b })} className={`${btnKecil} text-rekah-tua`} aria-label={`Hapus ${b.isi.judul}`}><Trash2 className="h-3 w-3" /></button>
        )}
      </div>
    );
  }

  function KartuKebiasaan({ b }: { b: Baris }) {
    const s = statusBaris(b);
    return (
      <div className={`flex flex-wrap items-start gap-3 rounded-2xl border border-rekah/10 bg-white px-3.5 py-3 ${s === 'diarsipkan' ? 'opacity-60' : ''}`}>
        <span aria-hidden className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: T.tint }}>
          {b.isi.nilai[0] && <BungaNilai nilai={b.isi.nilai[0]} size={26} />}
        </span>
        <div className="min-w-0 flex-1 basis-[220px]">
          <p className="text-[14px] font-bold leading-snug text-pekat">{b.isi.judul || '(tanpa judul)'}</p>
          {b.isi.deskripsi && <p className="mt-0.5 text-[12.5px] leading-snug text-pekat/60">{b.isi.deskripsi}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {b.isi.kategori === 'situasional' && <span className="rounded-full bg-kuning/60 px-2 py-0.5 text-[11px] font-bold text-pekat"><Zap className="-mt-0.5 mr-0.5 inline h-3 w-3" />{b.isi.kapan || 'kapan saja'}</span>}
            <span className="rounded-full bg-langit/20 px-2 py-0.5 text-[11px] font-semibold text-pekat/75">{labelUsia(b.isi.usia_min_bulan, b.isi.usia_max_bulan)}</span>
            {b.isi.nilai.map(n => <span key={n} className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: T.tint, color: T.teks }}>{n}</span>)}
            <span className="font-mono text-[10.5px] text-pekat/35">{b.isi.id}</span>
          </div>
          {b.live && b.draf && <p className="mt-1 text-[11.5px] text-daun">Revisi · versi tayang tetap dipakai sampai revisi diterapkan</p>}
          {b.draf?.catatan_tinjauan && <p className="mt-1 line-clamp-2 text-[11.5px] text-pekat/55">Catatan peninjau: {b.draf.catatan_tinjauan}</p>}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {(s !== 'tayang' || !katalogSiap) && <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${WARNA[s]}`}>{katalogSiap ? LABEL[s] : 'Bawaan'}</span>}
          <Aksi b={b} />
        </div>
      </div>
    );
  }

  const TABS: Array<[typeof tab, string]> = [
    ['rutin', `Rutin · Irama Hari (${rutin.filter(hidup).length})`],
    ['situasional', `Situasional (${situ.filter(hidup).length})`],
    ['kegiatan', `Kegiatan template (${templates.filter(t => t.aktif).length})`],
    ...(admin && katalogSiap ? [['import', 'Import CSV / Excel'] as [typeof tab, string]] : []),
  ];

  const Filter = (
    <div className="mb-4 flex flex-wrap gap-2">
      <input aria-label="Cari" value={q} onChange={e => setQ(e.target.value)} placeholder="Cari judul, ID, deskripsi, atau kapan…" className={`${inputCls} min-w-0 flex-1`} />
      <select aria-label="Filter usia" value={fUsia} onChange={e => setFUsia(Number(e.target.value))} className={inputCls}>
        <option value={-1}>Semua usia</option>
        {BAND_USIA.map((u, i) => <option key={u.label} value={i}>Usia {u.label}</option>)}
      </select>
      <select aria-label="Filter nilai" value={fNilai} onChange={e => setFNilai(e.target.value as typeof fNilai)} className={inputCls}>
        <option value="semua">Semua nilai</option>
        {NILAI.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      {katalogSiap && (
        <select aria-label="Filter status" value={fStatus} onChange={e => setFStatus(e.target.value as typeof fStatus)} className={inputCls}>
          <option value="aktif">Semua kecuali arsip</option>
          {(Object.keys(LABEL) as Status[]).map(s => <option key={s} value={s}>{LABEL[s]}</option>)}
        </select>
      )}
    </div>
  );

  const tanpaKegiatan = rutin.filter(b => cocok(b) && !templates.some(t => t.key === b.isi.template_key && t.aktif));

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <HeroAdmin
        tema="sikap"
        eyebrow="Konten Kebiasaan Baik"
        judul="Kebiasaan Baik"
        deskripsi={<>Dua kategori: <b>rutin</b> menempel di kegiatan Irama Hari, <b>situasional</b> muncul saat momennya datang. Orang tua hanya melihat yang cocok dengan usia anak dan nilai fokus keluarganya.</>}
        aksi={(
          <>
            {admin && katalogSiap && (
              <button type="button" onClick={() => baru(tab === 'situasional' ? 'situasional' : 'rutin')} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_18px_-10px_rgba(110,59,87,0.6)]" style={{ background: T.teks }}>
                <Plus className="h-4 w-4" /> Kebiasaan baru
              </button>
            )}
            <a href={URL_TEMPLATE} download className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-[13px] font-semibold text-pekat/75 hover:bg-white">
              <FileSpreadsheet className="h-4 w-4" /> Template Excel
            </a>
            <button type="button" onClick={() => ekspor(baris.filter(cocok))} disabled={!baris.length} className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-[13px] font-semibold text-pekat/75 hover:bg-white disabled:opacity-40">
              <Download className="h-4 w-4" /> Ekspor CSV
            </button>
            <Link to="/rekah-admin/sikap/fase" className="flex items-center gap-2 rounded-full bg-white/60 px-4 py-2.5 text-[13px] font-semibold text-pekat/65 hover:bg-white">
              <Layers className="h-4 w-4" /> Sikap per fase (Bekal)
            </Link>
          </>
        )}
      >
        <div className="flex flex-wrap gap-2">
          {[
            [`${rutin.filter(hidup).length}`, 'kebiasaan rutin'],
            [`${situ.filter(hidup).length}`, 'kebiasaan situasional'],
            [`${templates.filter(t => t.aktif).length}`, 'kegiatan template'],
          ].map(([n, l]) => (
            <span key={l} className="rounded-2xl bg-white/80 px-3.5 py-2 text-[12px] font-semibold text-pekat/65">
              <b className="mr-1 font-bricolage text-[18px] text-pekat">{n}</b>{l}
            </span>
          ))}
        </div>
      </HeroAdmin>

      {!katalogSiap && !memuat && (
        <div className="mb-4 rounded-xl bg-madu/15 px-5 py-3 text-[13px] leading-relaxed text-pekat/80">
          Tabel katalog belum tersedia. Jalankan migrasi <code className="font-mono">026_kebiasaan_irama.sql</code> di Supabase — migrasi itu juga memasukkan
          semua kebiasaan yang ada sekarang ke dua kategori di bawah. Sampai itu, halaman ini menampilkan klasifikasi bawaan (baca saja) dan orang tua melihat isi yang sama.
        </div>
      )}
      {pesan && <div className={`mb-4 rounded-xl px-5 py-3.5 text-[13px] font-semibold ${pesan.tipe === 'sukses' ? 'bg-daun/15 text-daun' : 'bg-rekah/15 text-rekah-tua'}`}>{pesan.teks}</div>}

      <div className="mb-5 flex flex-wrap gap-2 border-b border-rekah/10">
        {TABS.map(([t, l]) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-t-xl px-4 py-2.5 text-[13px] font-semibold transition ${tab === t ? 'border-b-2 border-[color:var(--ra-teks)] bg-[color:var(--ra-tint)] text-[color:var(--ra-teks)]' : 'text-pekat/50 hover:text-pekat'}`}>{l}</button>
        ))}
        {antre > 0 && <Link to="/rekah-admin/antrean" className="ml-auto self-center text-[12px] font-semibold text-pekat/60 hover:text-rekah">{antre} menunggu tinjauan →</Link>}
      </div>

      {memuat && <p className="text-[14px] text-pekat/40">Memuat...</p>}

      {!memuat && tab === 'rutin' && (
        <>
          {Filter}
          <p className="mb-4 text-[12.5px] text-pekat/55">Setiap kebiasaan rutin tampil sebagai centang di kartu kegiatannya pada papan Irama Hari orang tua.</p>
          <div className="grid gap-5 lg:grid-cols-3">
            {WAKTU.map(w => {
              const { dot, soft, Icon } = WARNA_WAKTU[w];
              const tpl = templates.filter(t => t.waktu === w).sort((a, b) => a.urutan - b.urutan);
              return (
                <section key={w} className="flex flex-col gap-3 rounded-[26px] p-3.5" style={{ background: soft }}>
                  <h2 className="flex items-center gap-2 px-1 font-bricolage text-[18px] font-bold text-pekat">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white" style={{ color: dot }}><Icon className="h-4 w-4" /></span>
                    {LABEL_WAKTU[w]}
                  </h2>
                  {tpl.map(t => {
                    const isi = rutin.filter(b => b.isi.template_key === t.key && cocok(b));
                    return (
                      <div key={t.key} className={`rounded-[20px] bg-white/70 p-3 ${t.aktif ? '' : 'opacity-60'}`}>
                        <div className="mb-2 flex items-center gap-2.5">
                          <span className="block h-8 w-1 rounded-full" style={{ background: dot }} />
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white"><IlustrasiKegiatan ikon={t.ikon} size={22} /></span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bricolage text-[15px] font-bold text-pekat">{t.nama}</p>
                            <p className="text-[11.5px] font-semibold text-pekat/45">{t.jam || 'tanpa jam'} · {isi.length} kebiasaan{t.aktif ? '' : ' · disembunyikan'}</p>
                          </div>
                          {admin && katalogSiap && (
                            <button type="button" onClick={() => baru('rutin', t.key)} aria-label={`Tambah kebiasaan di ${t.nama}`} className="flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ background: dot }}>
                              <Plus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {isi.length === 0
                            ? <p className="rounded-xl border border-dashed border-rekah/20 px-3 py-2.5 text-center text-[12px] text-pekat/45">Belum ada yang cocok dengan filter.</p>
                            : isi.map(b => <KartuKebiasaan key={b.kunci} b={b} />)}
                        </div>
                      </div>
                    );
                  })}
                </section>
              );
            })}
          </div>
          {tanpaKegiatan.length > 0 && (
            <section className="mt-5 rounded-[22px] border border-madu/40 bg-madu/10 p-4">
              <h3 className="font-bricolage text-[15px] font-bold text-pekat">Belum menempel di kegiatan yang tampil ({tanpaKegiatan.length})</h3>
              <p className="mb-3 text-[12.5px] text-pekat/60">Kegiatannya disembunyikan atau dihapus, jadi kebiasaan ini tidak muncul di papan orang tua. Edit untuk memindahkannya.</p>
              <div className="grid gap-2 md:grid-cols-2">{tanpaKegiatan.map(b => <KartuKebiasaan key={b.kunci} b={b} />)}</div>
            </section>
          )}
        </>
      )}

      {!memuat && tab === 'situasional' && (
        <>
          {Filter}
          <p className="mb-4 text-[12.5px] text-pekat/55">Tampil di panel “Kebiasaan situasional” Kelola — seperti catatan tempel yang bisa dicentang kapan pun momennya datang.</p>
          {situ.filter(cocok).length === 0 ? (
            <KosongBerilustrasi tema="sikap" judul="Belum ada yang cocok dengan filter ini" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {situ.filter(cocok).map(b => <KartuKebiasaan key={b.kunci} b={b} />)}
            </div>
          )}
        </>
      )}

      {!memuat && tab === 'kegiatan' && (
        <PanelKegiatan templates={templates} rutin={rutin} admin={admin && katalogSiap}
          onSimpan={async (aksi, teks) => jalankan(aksi, teks)} sibuk={sibuk} />
      )}

      {!memuat && tab === 'import' && admin && katalogSiap && (
        <PanelImport baris={baris} drafs={drafs} uid={uid} kunciTemplate={kunciTemplate} namaKegiatan={namaKegiatan} idBaru={idBaru}
          onSelesai={async teks => { await muat(); setTab('rutin'); setFStatus('aktif'); setPesan({ tipe: 'sukses', teks }); }} />
      )}

      {konfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pekat/40 p-4" role="dialog" aria-modal="true" aria-labelledby="konfirm-keb">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 id="konfirm-keb" className="font-bricolage text-[18px] font-bold text-pekat">{konfirm.jenis === 'hapus' ? 'Hapus draf permanen?' : 'Arsipkan kebiasaan?'}</h2>
            <p className="mt-2 text-[13px] text-pekat/70">
              {konfirm.jenis === 'hapus'
                ? `“${konfirm.baris.isi.judul}” akan dihapus beserta riwayat tinjauannya. Tindakan ini tidak dapat dibatalkan.`
                : `“${konfirm.baris.isi.judul}” tidak lagi muncul untuk orang tua. Centang yang sudah tercatat tetap ada. Anda bisa memulihkannya kapan saja.`}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setKonfirm(null)} className="rounded-full px-4 py-2 text-[13px] font-semibold text-pekat/60">Batal</button>
              <button type="button" disabled={sibuk}
                onClick={async () => {
                  const k = konfirm; setKonfirm(null);
                  if (k.jenis === 'hapus') await jalankan(() => hapusDrafKebiasaan(k.baris.draf!.id), 'Draf dihapus.');
                  else await jalankan(() => aturStatusKebiasaan(k.baris.live!.id, 'diarsipkan'), 'Kebiasaan diarsipkan.');
                }}
                className="rounded-full bg-rekah px-4 py-2 text-[13px] font-bold text-white disabled:opacity-40">
                {konfirm.jenis === 'hapus' ? 'Hapus permanen' : 'Arsipkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Kegiatan template ────────────────────────────────────────────────────────

function PanelKegiatan({ templates, rutin, admin, onSimpan, sibuk }: {
  templates: TemplateIrama[]; rutin: Baris[]; admin: boolean; sibuk: boolean;
  onSimpan: (aksi: () => Promise<void>, teks: string) => Promise<void>;
}) {
  const [edit, setEdit] = useState<{ keyLama?: string; tpl: TemplateIrama } | null>(null);
  const jumlah = (k: string) => rutin.filter(b => b.isi.template_key === k && statusBaris(b) !== 'diarsipkan').length;

  function geser(w: Waktu, key: string, arah: -1 | 1) {
    const daftar = templates.filter(t => t.waktu === w).sort((a, b) => a.urutan - b.urutan).map(t => t.key);
    const i = daftar.indexOf(key), j = i + arah;
    if (j < 0 || j >= daftar.length) return;
    [daftar[i], daftar[j]] = [daftar[j], daftar[i]];
    void onSimpan(() => simpanUrutanTemplate(daftar.map((k, n) => ({ key: k, waktu: w, urutan: (n + 1) * 10 }))), 'Urutan kegiatan disimpan.');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-[color:var(--ra-tint)] px-5 py-3 text-[13px] leading-relaxed text-pekat/80">
        Kegiatan template adalah kerangka hari di papan Irama Hari orang tua (mereka tetap bisa menambah, menyembunyikan, dan mengubah urutan di papannya sendiri).
        Perubahan di sini <b>langsung berlaku</b> tanpa tinjauan karena tidak berisi saran pengasuhan — isi kebiasaan tetap lewat tinjauan Psikolog Fitri.
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {WAKTU.map(w => {
          const { dot, soft, Icon } = WARNA_WAKTU[w];
          const tpl = templates.filter(t => t.waktu === w).sort((a, b) => a.urutan - b.urutan);
          return (
            <section key={w} className="flex flex-col gap-2.5 rounded-[26px] p-3.5" style={{ background: soft }}>
              <h2 className="flex items-center gap-2 px-1 font-bricolage text-[18px] font-bold text-pekat">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white" style={{ color: dot }}><Icon className="h-4 w-4" /></span>
                {LABEL_WAKTU[w]}
              </h2>
              {tpl.map((t, i) => (
                <div key={t.key} className={`flex items-center gap-2.5 rounded-[18px] bg-white px-3 py-2.5 ${t.aktif ? '' : 'opacity-55'}`}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: soft }}><IlustrasiKegiatan ikon={t.ikon} size={24} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold text-pekat">{t.nama}</p>
                    <p className="text-[11.5px] text-pekat/50">{t.jam || 'tanpa jam'} · {jumlah(t.key)} kebiasaan{t.saran.length ? ` · ${t.saran.length} saran` : ''}{t.aktif ? '' : ' · disembunyikan'}</p>
                  </div>
                  {admin && (
                    <div className="flex items-center gap-0.5">
                      <button type="button" disabled={sibuk || i === 0} onClick={() => geser(w, t.key, -1)} aria-label={`Naikkan ${t.nama}`} className="rounded-lg p-1 text-pekat/50 hover:bg-pekat/5 disabled:opacity-25"><ArrowUp className="h-3.5 w-3.5" /></button>
                      <button type="button" disabled={sibuk || i === tpl.length - 1} onClick={() => geser(w, t.key, 1)} aria-label={`Turunkan ${t.nama}`} className="rounded-lg p-1 text-pekat/50 hover:bg-pekat/5 disabled:opacity-25"><ArrowDown className="h-3.5 w-3.5" /></button>
                      <button type="button" disabled={sibuk} onClick={() => void onSimpan(() => simpanTemplate({ ...t, aktif: !t.aktif }, t.key), t.aktif ? `“${t.nama}” disembunyikan dari papan.` : `“${t.nama}” tampil lagi.`)}
                        aria-label={t.aktif ? `Sembunyikan ${t.nama}` : `Tampilkan ${t.nama}`} className="rounded-lg p-1 text-pekat/50 hover:bg-pekat/5">
                        {t.aktif ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button type="button" onClick={() => setEdit({ keyLama: t.key, tpl: { ...t, saran: t.saran.map(s => ({ ...s })) } })} aria-label={`Edit ${t.nama}`} className="rounded-lg p-1 text-pekat/50 hover:bg-pekat/5"><Pencil className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </div>
              ))}
              {admin && (
                <button type="button" onClick={() => setEdit({ tpl: { key: '', waktu: w, nama: '', jam: '', ikon: 'main', urutan: (tpl.length + 1) * 10, aktif: true, saran: [] } })}
                  className="rounded-[18px] border-2 border-dashed px-3 py-2.5 text-[13px] font-bold" style={{ borderColor: `${dot}88`, color: dot }}>
                  + tambah kegiatan {LABEL_WAKTU[w].toLowerCase()}
                </button>
              )}
            </section>
          );
        })}
      </div>

      {edit && (
        <EditorTemplate awal={edit.tpl} keyLama={edit.keyLama} dipakai={edit.keyLama ? jumlah(edit.keyLama) : 0} sibuk={sibuk}
          kunciLain={templates.map(t => t.key).filter(k => k !== edit.keyLama)}
          onTutup={() => setEdit(null)}
          onSimpan={async tpl => { setEdit(null); await onSimpan(() => simpanTemplate(tpl, edit.keyLama), `Kegiatan “${tpl.nama}” disimpan.`); }}
          onHapus={edit.keyLama ? async () => { const k = edit.keyLama!; setEdit(null); await onSimpan(() => hapusTemplate(k), 'Kegiatan dihapus.'); } : undefined} />
      )}
    </div>
  );
}

function EditorTemplate({ awal, keyLama, dipakai, kunciLain, sibuk, onTutup, onSimpan, onHapus }: {
  awal: TemplateIrama; keyLama?: string; dipakai: number; kunciLain: string[]; sibuk: boolean;
  onTutup: () => void; onSimpan: (t: TemplateIrama) => Promise<void>; onHapus?: () => Promise<void>;
}) {
  const [t, setT] = useState<TemplateIrama>(awal);
  const atur = <K extends keyof TemplateIrama>(k: K, v: TemplateIrama[K]) => setT(p => ({ ...p, [k]: v }));
  const kunciOtomatis = (nama: string) => nama.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '').slice(0, 24);
  const key = keyLama ? t.key : (t.key || kunciOtomatis(t.nama));
  const galat = !t.nama.trim() ? 'Nama kegiatan wajib diisi.'
    : !/^[a-z0-9]+([_-][a-z0-9]+)*$/.test(key) ? 'Kunci hanya huruf kecil, angka, garis bawah, atau tanda-hubung.'
      : kunciLain.includes(key) ? `Kunci “${key}” sudah dipakai kegiatan lain.` : '';
  const [yakinHapus, setYakinHapus] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pekat/40 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-tpl">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-white p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="edit-tpl" className="font-bricolage text-[19px] font-bold text-pekat">{keyLama ? 'Edit kegiatan template' : 'Kegiatan template baru'}</h2>
          <button type="button" onClick={onTutup} aria-label="Tutup" className="rounded-lg p-1 text-pekat/50 hover:bg-pekat/5"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label htmlFor="tpl-nama" className="flex flex-col gap-1 sm:col-span-2 text-[12px] font-bold text-pekat/70">Nama kegiatan
            <input id="tpl-nama" autoFocus value={t.nama} onChange={e => atur('nama', e.target.value)} placeholder="mis. Camilan sore" maxLength={60} className={inputCls} />
          </label>
          <label htmlFor="tpl-waktu" className="flex flex-col gap-1 text-[12px] font-bold text-pekat/70">Bagian hari
            <select id="tpl-waktu" value={t.waktu} onChange={e => atur('waktu', e.target.value as Waktu)} className={inputCls}>
              {WAKTU.map(w => <option key={w} value={w}>{LABEL_WAKTU[w]}</option>)}
            </select>
          </label>
          <label htmlFor="tpl-jam" className="flex flex-col gap-1 text-[12px] font-bold text-pekat/70">Jam (opsional)
            <input id="tpl-jam" type="time" value={t.jam} onChange={e => atur('jam', e.target.value)} className={inputCls} />
          </label>
          <label htmlFor="tpl-key" className="flex flex-col gap-1 sm:col-span-2 text-[12px] font-bold text-pekat/70">Kunci (dipakai file import & catatan harian)
            <input id="tpl-key" value={key} disabled={!!keyLama} onChange={e => atur('key', e.target.value.toLowerCase())} className={`${inputCls} font-mono disabled:bg-pekat/5 disabled:text-pekat/50`} />
            {keyLama && <span className="text-[11.5px] font-normal text-pekat/45">Kunci tidak diubah agar susunan hari yang sudah disimpan orang tua tetap cocok.</span>}
          </label>
        </div>
        <p className="mb-1.5 mt-4 text-[12px] font-bold text-pekat/70">Ilustrasi</p>
        <div className="flex flex-wrap gap-1.5">
          {IKON_TEMPLATE.map(ik => (
            <button key={ik.key} type="button" onClick={() => atur('ikon', ik.key)} aria-pressed={t.ikon === ik.key} title={ik.label}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 transition ${t.ikon === ik.key ? 'border-[color:var(--ra-aksen)] bg-[color:var(--ra-tint)]' : 'border-transparent bg-kanvas hover:bg-[color:var(--ra-tint)]'}`}>
              <IlustrasiKegiatan ikon={ik.key} size={26} />
              <span className="sr-only">{ik.label}</span>
            </button>
          ))}
        </div>
        <p className="mb-1.5 mt-4 text-[12px] font-bold text-pekat/70">Saran to-do bawaan (opsional)</p>
        <div className="flex flex-col gap-2">
          {t.saran.map((s, i) => (
            <div key={s.id} className="flex gap-2">
              <select aria-label="Jenis saran" value={s.tipe} onChange={e => atur('saran', t.saran.map((x, j) => (j === i ? { ...x, tipe: e.target.value as 'main' | 'buku' } : x)))} className={inputCls}>
                <option value="main">Ajak main</option><option value="buku">Baca buku</option>
              </select>
              <input aria-label="Teks saran" value={s.t} onChange={e => atur('saran', t.saran.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)))} className={`${inputCls} min-w-0 flex-1`} />
              <button type="button" onClick={() => atur('saran', t.saran.filter((_, j) => j !== i))} aria-label="Hapus saran" className="rounded-lg p-2 text-pekat/45 hover:bg-pekat/5"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => atur('saran', [...t.saran, { id: `sr-${key || 'baru'}-${Date.now().toString(36)}`, tipe: 'main', t: '' }])} className="self-start text-[12.5px] font-bold text-[color:var(--ra-teks)]">+ tambah saran</button>
        </div>
        <label htmlFor="tpl-aktif" className="mt-4 flex items-center gap-2 text-[13px] text-pekat/75">
          <input id="tpl-aktif" type="checkbox" checked={t.aktif} onChange={e => atur('aktif', e.target.checked)} /> Tampil di papan orang tua
        </label>
        {galat && <p className="mt-3 rounded-xl bg-rekah/10 px-3 py-2 text-[12.5px] font-semibold text-rekah-tua">{galat}</p>}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          {onHapus ? (
            dipakai > 0 ? <span className="text-[11.5px] text-pekat/50">{dipakai} kebiasaan menempel di sini — pindahkan dulu, atau sembunyikan saja.</span>
              : yakinHapus ? <button type="button" disabled={sibuk} onClick={() => void onHapus()} className="rounded-full bg-rekah px-4 py-2 text-[12.5px] font-bold text-white">Ya, hapus kegiatan</button>
                : <button type="button" onClick={() => setYakinHapus(true)} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rekah-tua"><Trash2 className="h-3.5 w-3.5" /> Hapus kegiatan</button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={onTutup} className="rounded-full px-4 py-2 text-[13px] font-semibold text-pekat/60">Batal</button>
            <button type="button" disabled={sibuk || !!galat} onClick={() => void onSimpan(normalisasiTemplate({ ...t, key, saran: t.saran.filter(s => s.t.trim()) }))}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-bold text-white disabled:opacity-40" style={{ background: T.teks }}>
              <Save className="h-4 w-4" /> Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Panel import ─────────────────────────────────────────────────────────────

type Pilihan = 'baru' | 'revisi' | 'perbarui' | 'lewati';
interface Siap extends BarisImportKeb { pilihan: Pilihan; opsi: Pilihan[]; alasan?: string; drafId?: string }

function PanelImport({ baris, drafs, uid, kunciTemplate, namaKegiatan, idBaru, onSelesai }: {
  baris: Baris[]; drafs: DrafKebiasaan[]; uid: string | null; kunciTemplate: string[];
  namaKegiatan: (k: string | null) => string; idBaru: () => string; onSelesai: (t: string) => Promise<void>;
}) {
  const [nama, setNama] = useState('');
  const [galat, setGalat] = useState('');
  const [grup, setGrup] = useState<Siap[] | null>(null);
  const [ajukan, setAjukan] = useState(false);
  const [jalan, setJalan] = useState(false);
  const [seret, setSeret] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function siapkan(g: BarisImportKeb): Siap {
    if (g.idKosong) return { ...g, pilihan: 'baru', opsi: ['baru'] };
    const terbuka = drafs.find(d => ['draf', 'diajukan', 'disetujui'].includes(d.status) && (d.isi.id === g.isi.id || d.id_konten_sumber === g.isi.id));
    if (terbuka) {
      return terbuka.id_penulis === uid && ['draf', 'diajukan'].includes(terbuka.status)
        ? { ...g, pilihan: 'perbarui', opsi: ['perbarui', 'lewati'], drafId: terbuka.id, alasan: 'Sudah ada draf untuk ID ini.' }
        : { ...g, pilihan: 'lewati', opsi: ['lewati'], alasan: `Ada draf berstatus “${terbuka.status}” untuk ID ini yang tidak bisa ditimpa.` };
    }
    if (baris.some(b => b.live?.id === g.isi.id)) return { ...g, pilihan: 'revisi', opsi: ['revisi', 'lewati'], alasan: 'ID ini sudah tayang.' };
    return { ...g, pilihan: 'baru', opsi: ['baru'] };
  }

  async function baca(f: File) {
    setGalat(''); setGrup(null); setNama(f.name);
    try {
      const r = await bacaFileKeb(f);
      setNama(r.nama);
      if (r.error || !r.data) { setGalat(r.error ?? 'File tidak terbaca.'); return; }
      setGrup(validasiImportKeb(r.data, kunciTemplate).map(siapkan));
    } catch (e) { setGalat(`File tidak bisa dibaca: ${(e as Error).message}`); }
  }

  const siap = (grup ?? []).filter(g => !g.galat.length && g.pilihan !== 'lewati');

  async function jalankanImport() {
    setJalan(true);
    let ok = 0, diajukan = 0;
    const gagal: string[] = [];
    const terpakai = new Set<string>();
    for (const g of siap) {
      let isi = g.isi;
      if (g.idKosong) {
        let id = idBaru();
        while (terpakai.has(id)) id = `kb-${String(Number(id.slice(3)) + 1).padStart(3, '0')}`;
        isi = { ...isi, id };
      }
      terpakai.add(isi.id);
      const kirim = ajukan && !periksaKelengkapanKeb(isi, kunciTemplate).length && !periksaKataKeb(isi).length;
      try {
        if (g.pilihan === 'perbarui' && g.drafId) await perbaruiDrafKebiasaan(g.drafId, isi, { ajukan: kirim, catatan: 'Diperbarui lewat import' });
        else await buatDrafKebiasaan(isi, { idSumber: g.pilihan === 'revisi' ? isi.id : null, ajukan: kirim, catatan: 'Dibuat lewat import' });
        ok++; if (kirim) diajukan++;
      } catch (e) { gagal.push(`${isi.id}: ${(e as Error).message}`); }
    }
    setJalan(false);
    if (gagal.length) { setGalat(`Sebagian gagal: ${gagal.join(' · ')}`); if (!ok) return; }
    await onSelesai(`${ok} kebiasaan diimpor sebagai draf${diajukan ? `, ${diajukan} langsung diajukan ke tinjauan` : ''}.`);
  }

  const LABEL_PILIHAN: Record<Pilihan, string> = { baru: 'Kebiasaan baru', revisi: 'Jadikan revisi (versi tayang tidak berubah)', perbarui: 'Timpa draf yang ada', lewati: 'Lewati' };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ['Isi template', 'Satu baris = satu kebiasaan. Nilai dipisah titik koma (;).'],
          ['Kategori', '“rutin” → isi kolom kegiatan (kunci, mis. sarapan). “situasional” → isi kolom kapan.'],
          ['Periksa', 'Kolom wajib, ID dobel, kegiatan yang tidak ada, dan kata yang perlu ditinjau.'],
          ['Masuk sebagai draf', 'Tidak ada yang langsung tayang. Peninjau tetap memeriksa.'],
        ].map(([j, t]) => (
          <div key={j} className="rounded-xl border border-rekah/10 bg-white p-3.5 text-[12px] text-pekat/60"><p className="mb-0.5 font-bricolage text-[14px] font-bold text-pekat">{j}</p>{t}</div>
        ))}
      </div>
      <div className="rounded-xl border border-rekah/10 bg-white px-4 py-3 text-[12px] text-pekat/60">
        <b className="text-pekat/80">Kunci kegiatan yang tersedia:</b>{' '}
        {kunciTemplate.map(k => <span key={k} className="mr-1.5 inline-block rounded-md bg-pekat/5 px-1.5 py-0.5 font-mono text-[11px]">{k}</span>)}
      </div>
      <div onDragOver={e => { e.preventDefault(); setSeret(true); }} onDragLeave={() => setSeret(false)}
        onDrop={e => { e.preventDefault(); setSeret(false); const f = e.dataTransfer.files[0]; if (f) void baca(f); }}
        className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${seret ? 'border-[color:var(--ra-aksen)] bg-[color:var(--ra-tint)]' : 'border-rekah/20 bg-white'}`}>
        <Upload className="h-7 w-7" style={{ color: T.teks }} />
        <p className="font-bricolage text-[16px] font-bold text-pekat">Letakkan file di sini</p>
        <p className="text-[12px] text-pekat/50">.xlsx dari template (sheet “Isi di sini”), atau .csv hasil Ekspor</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full px-5 py-2 text-[13px] font-bold text-white" style={{ background: T.teks }}>Pilih file</button>
          <a href={URL_TEMPLATE} download className="rounded-full border border-rekah/20 px-5 py-2 text-[13px] font-semibold text-pekat/70">Unduh template</a>
        </div>
        <input ref={inputRef} id="keb-import-file" type="file" accept=".csv,.xlsx,.xls,text/csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) void baca(f); e.target.value = ''; }} />
      </div>
      {galat && <div className="rounded-xl bg-rekah/15 px-5 py-3 text-[13px] font-semibold text-rekah-tua">{nama ? `${nama}: ` : ''}{galat}</div>}
      {grup && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bricolage text-[16px] font-bold text-pekat">Pratinjau import</h2>
              <p className="text-[12px] text-pekat/50">{nama} · {grup.length} baris · {siap.length} siap diimpor</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="imp-keb-ajukan" className="flex items-center gap-2 text-[13px] text-pekat/70"><input id="imp-keb-ajukan" type="checkbox" checked={ajukan} onChange={e => setAjukan(e.target.checked)} /> Langsung ajukan yang sudah lengkap</label>
              <button type="button" onClick={() => setGrup(null)} className="rounded-full px-4 py-2 text-[13px] font-semibold text-pekat/60">Batalkan</button>
              <button type="button" disabled={jalan || !siap.length} onClick={jalankanImport} className="rounded-full px-5 py-2 text-[13px] font-bold text-white disabled:opacity-40" style={{ background: T.teks }}>{jalan ? 'Mengimpor…' : `Import ${siap.length} kebiasaan`}</button>
            </div>
          </div>
          {grup.map((g, i) => (
            <div key={`${g.isi.id}-${i}`} className="overflow-hidden rounded-2xl border border-rekah/10 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3" style={{ background: T.tint2 }}>
                <div>
                  <b className="text-[14px] text-pekat">{g.isi.judul || '(tanpa judul)'}</b>
                  <span className="ml-2 font-mono text-[12px] text-pekat/40">{g.isi.id || 'ID baru'} · baris {g.baris}</span>
                  <span className="ml-2 text-[12px] text-pekat/55">{g.isi.kategori === 'rutin' ? `Rutin · ${namaKegiatan(g.isi.template_key)}` : `Situasional · ${g.isi.kapan || '—'}`} · {labelUsia(g.isi.usia_min_bulan, g.isi.usia_max_bulan)}</span>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${g.galat.length ? 'bg-rekah/15 text-rekah-tua' : g.catatan.length ? 'bg-madu/20 text-pekat' : 'bg-daun/15 text-daun'}`}>
                  {g.galat.length ? `${g.galat.length} kesalahan · dilewati` : g.catatan.length ? `${g.catatan.length} catatan` : 'Siap'}
                </span>
              </div>
              {!g.galat.length && g.opsi.length > 1 && (
                <div className="flex flex-wrap items-center gap-3 border-b border-rekah/8 px-4 py-2.5 text-[13px]">
                  <span className="text-pekat/60">{g.alasan}</span>
                  {g.opsi.map(o => (
                    <label key={o} htmlFor={`impk-${i}-${o}`} className="flex items-center gap-1.5 text-pekat/80">
                      <input type="radio" id={`impk-${i}-${o}`} name={`impk-${i}`} checked={g.pilihan === o} onChange={() => setGrup(gs => gs!.map((x, j) => (j === i ? { ...x, pilihan: o } : x)))} />
                      {LABEL_PILIHAN[o]}
                    </label>
                  ))}
                </div>
              )}
              {!g.galat.length && g.opsi.length === 1 && g.alasan && <p className="border-b border-rekah/8 px-4 py-2.5 text-[13px] text-pekat/60">{g.alasan} Baris ini dilewati.</p>}
              {(g.galat.length > 0 || g.catatan.length > 0) && (
                <ul className="list-disc space-y-0.5 py-3 pl-9 pr-4 text-[13px]">
                  {g.galat.map(e => <li key={e} className="text-rekah-tua">{e}</li>)}
                  {g.catatan.map(w => <li key={w} className="text-pekat/65">{w}</li>)}
                </ul>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
