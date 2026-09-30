// Admin Bantu — daftar situasi (tayang + draf/revisi), aksi per baris & massal, import
// CSV/Excel, ekspor CSV, dan tampilan pengaman (baca saja). Tayang lewat tinjauan Fitri.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Archive, ArchiveRestore, Copy, Download, Eye, FileSpreadsheet, Pencil, Plus, Rocket, Send, ShieldAlert, Trash2, Upload,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { HeroAdmin, TEMA, TamanTema } from '../tema/temaAdmin';
import {
  muatKatalogBantu, muatDrafBantu, ajukanDrafBantu, hapusDrafBantu, terapkanBantu, aturStatusBantu,
  buatDrafBantu, perbaruiDrafBantu, isiDariSituasi, LABEL_KATEGORI, rentangUsia,
} from '../../../lib/supabase/bantu';
import { labelUsia } from '../../../features/irama-hari/kebiasaanSeed';
import type { DrafBantu, IsiBantu, SituasiKatalog, KategoriBantu } from '../../../lib/supabase/bantu';
import { muatUlangKatalogBantu } from '../../../features/bantu/bantuKatalog';
import {
  BANTU_SITUASI as SEED_BANTU, KATA_KUNCI_KESELAMATAN, OPSI_MEMICU_B5, RUJUKAN_KESELAMATAN,
} from '../../../features/bantu/bantuSeed';
import type { BantuSituasi } from '../../../features/bantu/bantuSeed';
import {
  bacaFileBantu, validasiImportBantu, periksaKelengkapanBantu, periksaKataBantu, keCSVBantu,
} from '../../../features/bantu/admin/bantuImport';
import type { BarisImportBantu } from '../../../features/bantu/admin/bantuImport';
import { unduhTeks } from '../../../features/temani/admin/temaniImport';

const URL_TEMPLATE = '/templates/Rekah_Template_Import_Bantu_v1.xlsx';
const DRAF_TERBUKA = ['draf', 'diajukan', 'disetujui', 'ditolak'];

function isiDariSeed(s: BantuSituasi, i: number): IsiBantu {
  return {
    slug: s.slug, label: s.label, ringkas: s.ringkas ?? '', kategori: s.kategori, sensitif_keselamatan: !!s.sensitifKeselamatan,
    urutan: (i + 1) * 10,
    ...rentangUsia(s.usiaMinBulan, s.usiaMaxBulan),
    clarify: s.clarify.map(c => ({ pertanyaan: c.pertanyaan, opsi: [...c.opsi], opsi_keselamatan: [] })),
    validasi: s.respons.validasi, langkah: [...s.respons.langkah], yang_diamati: s.respons.yangDiamati ?? '',
    kenapa_sederhana: s.respons.kenapaSederhana ?? '', kenapa_sumber: s.respons.kenapaSumber ?? '',
  };
}

interface Baris { kunci: string; isi: IsiBantu; live: SituasiKatalog | null; draf: DrafBantu | null }
type Status = 'draf' | 'diajukan' | 'disetujui' | 'ditolak' | 'tayang' | 'diarsipkan';
const LABEL: Record<Status, string> = {
  draf: 'Draf', diajukan: 'Menunggu tinjauan', disetujui: 'Disetujui · siap diterapkan', ditolak: 'Ditolak', tayang: 'Tayang', diarsipkan: 'Diarsipkan',
};
const WARNA: Record<Status, string> = {
  draf: 'bg-pekat/8 text-pekat/60', diajukan: 'bg-madu/20 text-pekat', disetujui: 'bg-daun/20 text-daun',
  ditolak: 'bg-rekah/15 text-rekah-tua', tayang: 'bg-langit/25 text-pekat', diarsipkan: 'bg-pekat/8 text-pekat/45',
};
const statusBaris = (b: Baris): Status => (b.draf ? (b.draf.status as Status) : ((b.live?.status ?? 'draf') as Status));
const btnKecil = 'inline-flex items-center gap-1 rounded-full border border-rekah/20 bg-white px-3 py-1.5 text-[12px] font-semibold text-pekat/70 transition hover:border-rekah/50 disabled:opacity-40';

export default function BantuAdmin() {
  const { peranStaf, supabaseUser } = useAuth();
  const admin = peranStaf === 'admin';
  const uid = supabaseUser?.id ?? null;
  const navigate = useNavigate();

  const [tab, setTab] = useState<'daftar' | 'import' | 'pengaman'>('daftar');
  const [katalog, setKatalog] = useState<SituasiKatalog[]>([]);
  const [drafs, setDrafs] = useState<DrafBantu[]>([]);
  const [katalogSiap, setKatalogSiap] = useState(true);
  const [memuat, setMemuat] = useState(true);
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'galat'; teks: string } | null>(null);
  const [q, setQ] = useState('');
  const [fStatus, setFStatus] = useState<'aktif' | Status>('aktif');
  const [fKat, setFKat] = useState<'semua' | KategoriBantu>('semua');
  const [pilih, setPilih] = useState<string[]>([]);
  const [konfirm, setKonfirm] = useState<{ jenis: 'hapus' | 'arsip'; baris: Baris } | null>(null);
  const [ketik, setKetik] = useState('');
  const [sibuk, setSibuk] = useState(false);

  const muat = useCallback(async () => {
    try {
      const [k, d] = await Promise.all([muatKatalogBantu({ sertakanArsip: true }), muatDrafBantu()]);
      setKatalogSiap(k !== null); setKatalog(k ?? []); setDrafs(d);
    } catch (e) {
      const m = (e as Error).message ?? '';
      if (/jenis_konten|does not exist|schema cache/i.test(m)) { setKatalogSiap(false); return; } // migrasi belum dijalankan
      setPesan({ tipe: 'galat', teks: `Gagal memuat: ${m}` });
    } finally {
      setMemuat(false);
    }
  }, []);
  useEffect(() => { void muat(); }, [muat]);

  const baris = useMemo<Baris[]>(() => {
    const terbuka = drafs.filter(d => DRAF_TERBUKA.includes(d.status));
    const out: Baris[] = katalog.map(s => {
      const d = terbuka.find(x => x.id_konten_sumber === s.slug) ?? null;
      return { kunci: `live-${s.slug}`, isi: d?.isi ?? isiDariSituasi(s), live: s, draf: d };
    });
    terbuka.filter(d => !d.id_konten_sumber || !katalog.some(s => s.slug === d.id_konten_sumber))
      .forEach(d => out.push({ kunci: `draf-${d.id}`, isi: d.isi, live: null, draf: d }));
    return out.sort((a, b) => a.isi.urutan - b.isi.urutan || a.isi.label.localeCompare(b.isi.label));
  }, [katalog, drafs]);

  const tampil = baris.filter(b => {
    const s = statusBaris(b);
    if (fStatus === 'aktif' ? s === 'diarsipkan' : s !== fStatus) return false;
    if (fKat !== 'semua' && b.isi.kategori !== fKat) return false;
    if (q && !`${b.isi.label} ${b.isi.slug} ${b.isi.ringkas}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const antre = baris.filter(b => b.draf?.status === 'diajukan').length;

  async function jalankan(aksi: () => Promise<void>, sukses: string) {
    setSibuk(true); setPesan(null);
    try { await aksi(); setPesan({ tipe: 'sukses', teks: sukses }); await muat(); }
    catch (e) { setPesan({ tipe: 'galat', teks: (e as Error).message ?? 'Terjadi kesalahan.' }); }
    finally { setSibuk(false); }
  }
  const milikSaya = (b: Baris) => !!b.draf && b.draf.id_penulis === uid;
  const bisaAjukan = (b: Baris) => milikSaya(b) && b.draf!.status === 'draf' && !periksaKelengkapanBantu(b.isi).length && !periksaKataBantu(b.isi).length;
  const ekspor = (daftar: Baris[]) => { if (daftar.length) unduhTeks(`rekah-bantu-${new Date().toISOString().slice(0, 10)}.csv`, keCSVBantu(daftar.map(b => b.isi))); };
  const duplikat = (b: Baris) => navigate('/rekah-admin/bantu/baru', { state: { isi: { ...b.isi, slug: `${b.isi.slug}_salinan`, label: `${b.isi.label} (salinan)` } } });

  async function ajukanMassal() {
    const cocok = baris.filter(b => pilih.includes(b.kunci) && bisaAjukan(b));
    const lewat = pilih.length - cocok.length;
    await jalankan(async () => { for (const b of cocok) await ajukanDrafBantu(b.draf!.id); },
      `${cocok.length} draf diajukan ke tinjauan${lewat ? `, ${lewat} dilewati (belum lengkap, bukan draf milik Anda, atau sudah diajukan)` : ''}.`);
    setPilih([]);
  }

  function Aksi({ b }: { b: Baris }) {
    const d = b.draf;
    if (!admin) return d ? <Link to={`/rekah-admin/diff/${d.id}`} className={btnKecil}><Eye className="h-3.5 w-3.5" /> {d.status === 'diajukan' ? 'Tinjau' : 'Lihat'}</Link> : null;
    return (
      <div className="flex flex-wrap justify-end gap-1.5">
        {d && ['draf', 'diajukan'].includes(d.status) && milikSaya(b) && <Link to={`/rekah-admin/bantu/draf/${d.id}`} className={btnKecil}><Pencil className="h-3.5 w-3.5" /> Edit</Link>}
        {!d && b.live && <Link to={`/rekah-admin/bantu/revisi/${b.live.slug}`} className={btnKecil}><Pencil className="h-3.5 w-3.5" /> Edit</Link>}
        {d && d.status === 'draf' && milikSaya(b) && (
          <button type="button" disabled={sibuk || !bisaAjukan(b)} title={bisaAjukan(b) ? '' : 'Lengkapi isi atau periksa kata yang ditandai di Edit'} onClick={() => jalankan(() => ajukanDrafBantu(d.id), 'Diajukan ke antrean tinjauan.')} className={btnKecil}>
            <Send className="h-3.5 w-3.5" /> Ajukan
          </button>
        )}
        {d && d.status === 'disetujui' && (
          <button type="button" disabled={sibuk} onClick={() => jalankan(async () => { await terapkanBantu(d.id); await muatUlangKatalogBantu(); }, 'Situasi tayang untuk orang tua.')}
            className="inline-flex items-center gap-1 rounded-full bg-daun px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-50">
            <Rocket className="h-3.5 w-3.5" /> Tayangkan
          </button>
        )}
        {d && d.status !== 'draf' && <Link to={`/rekah-admin/diff/${d.id}`} className={btnKecil}><Eye className="h-3.5 w-3.5" /> Tinjauan</Link>}
        <button type="button" onClick={() => duplikat(b)} className={btnKecil}><Copy className="h-3.5 w-3.5" /> Duplikat</button>
        {!d && b.live && (b.live.status === 'diarsipkan' ? (
          <button type="button" disabled={sibuk} onClick={() => jalankan(async () => { await aturStatusBantu(b.live!.slug, 'tayang'); await muatUlangKatalogBantu(); }, 'Situasi tayang kembali.')} className={btnKecil}>
            <ArchiveRestore className="h-3.5 w-3.5" /> Pulihkan
          </button>
        ) : (
          <button type="button" onClick={() => { setKonfirm({ jenis: 'arsip', baris: b }); setKetik(''); }} className={`${btnKecil} text-rekah-tua`}><Archive className="h-3.5 w-3.5" /> Arsipkan</button>
        ))}
        {d && ['draf', 'ditolak'].includes(d.status) && milikSaya(b) && (
          <button type="button" onClick={() => { setKonfirm({ jenis: 'hapus', baris: b }); setKetik(''); }} className={`${btnKecil} text-rekah-tua`}><Trash2 className="h-3.5 w-3.5" /> Hapus</button>
        )}
      </div>
    );
  }

  const TABS: Array<[typeof tab, string]> = [
    ['daftar', `Situasi (${baris.filter(b => statusBaris(b) !== 'diarsipkan').length})`],
    ...(admin ? [['import', 'Import CSV / Excel'] as [typeof tab, string]] : []),
    ['pengaman', 'Pengaman keselamatan'],
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <HeroAdmin
        tema="bantu"
        eyebrow="Konten Bantu"
        judul="Bantu"
        deskripsi="Situasi & respons terkurasi untuk momen sulit. Semua perubahan tayang setelah disetujui Psikolog Fitri."
        aksi={admin ? (
          <>
            <Link to="/rekah-admin/bantu/baru" className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_18px_-10px_rgba(110,59,87,0.6)]" style={{ background: TEMA.bantu.teks }}>
              <Plus className="h-4 w-4" /> Situasi baru
            </Link>
            <a href={URL_TEMPLATE} download className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-[13px] font-semibold text-pekat/75 hover:bg-white">
              <FileSpreadsheet className="h-4 w-4" /> Template Excel
            </a>
            <button type="button" onClick={() => ekspor(tampil)} disabled={!tampil.length} className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-[13px] font-semibold text-pekat/75 hover:bg-white disabled:opacity-40">
              <Download className="h-4 w-4" /> Ekspor CSV
            </button>
          </>
        ) : undefined}
      />

      {!katalogSiap && !memuat && (
        <div className="mb-4 rounded-xl bg-madu/15 px-5 py-3 text-[13px] text-pekat/80">
          Tabel katalog Bantu belum tersedia. Jalankan migrasi <code className="font-mono">025_bantu_konten.sql</code> di Supabase. Sampai itu, orang tua masih melihat situasi contoh bawaan.
        </div>
      )}
      {pesan && <div className={`mb-4 rounded-xl px-5 py-3.5 text-[13px] font-semibold ${pesan.tipe === 'sukses' ? 'bg-daun/15 text-daun' : 'bg-rekah/15 text-rekah-tua'}`}>{pesan.teks}</div>}

      <div className="mb-5 flex gap-2 border-b border-rekah/10">
        {TABS.map(([t, l]) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-t-xl px-5 py-2.5 text-[13px] font-semibold transition ${tab === t ? 'border-b-2 border-[color:var(--ra-teks)] bg-[color:var(--ra-tint)] text-[color:var(--ra-teks)]' : 'text-pekat/50 hover:text-pekat'}`}>{l}</button>
        ))}
        {antre > 0 && <Link to="/rekah-admin/antrean" className="ml-auto self-center text-[12px] font-semibold text-pekat/60 hover:text-rekah">{antre} menunggu tinjauan →</Link>}
      </div>

      {tab === 'import' && admin && (
        <PanelImport katalog={katalog} drafs={drafs} uid={uid} onSelesai={async teks => { await muat(); setTab('daftar'); setFStatus('aktif'); setPesan({ tipe: 'sukses', teks }); }} />
      )}

      {tab === 'pengaman' && <PanelPengaman />}

      {tab === 'daftar' && (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            <input aria-label="Cari" value={q} onChange={e => setQ(e.target.value)} placeholder="Cari label, slug, atau ringkasan…" className="min-w-0 flex-1 rounded-xl border border-rekah/15 bg-white px-3.5 py-2 text-[13px] focus:border-rekah focus:outline-none" />
            <select aria-label="Filter status" value={fStatus} onChange={e => setFStatus(e.target.value as typeof fStatus)} className="rounded-xl border border-rekah/15 bg-white px-3 py-2 text-[13px]">
              <option value="aktif">Semua kecuali arsip</option>
              {(Object.keys(LABEL) as Status[]).map(s => <option key={s} value={s}>{LABEL[s]}</option>)}
            </select>
            <select aria-label="Filter kategori" value={fKat} onChange={e => setFKat(e.target.value as typeof fKat)} className="rounded-xl border border-rekah/15 bg-white px-3 py-2 text-[13px]">
              <option value="semua">Semua kategori</option>
              {(Object.keys(LABEL_KATEGORI) as KategoriBantu[]).map(k => <option key={k} value={k}>{LABEL_KATEGORI[k]}</option>)}
            </select>
          </div>

          {admin && pilih.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-fajar px-4 py-2.5">
              <b className="text-[13px] text-pekat">{pilih.length} dipilih</b>
              <button type="button" disabled={sibuk} onClick={ajukanMassal} className={btnKecil}><Send className="h-3.5 w-3.5" /> Ajukan ke tinjauan</button>
              <button type="button" onClick={() => ekspor(baris.filter(b => pilih.includes(b.kunci)))} className={btnKecil}><Download className="h-3.5 w-3.5" /> Ekspor CSV</button>
              <button type="button" onClick={() => setPilih([])} className="text-[12px] font-semibold text-pekat/50 hover:text-pekat">Batal pilih</button>
            </div>
          )}

          {memuat ? <p className="text-[14px] text-pekat/40">Memuat...</p> : tampil.length === 0 ? (
            <div className="rounded-[24px] border border-dashed bg-white px-8 py-10 text-center" style={{ borderColor: `${TEMA.bantu.aksen}88` }}>
              <div className="mb-3 flex justify-center"><TamanTema tema="bantu" kecil /></div>
              <p className="font-semibold text-pekat/50">{baris.length ? 'Tidak ada situasi yang cocok dengan filter ini.' : 'Belum ada situasi yang dikelola di sini.'}</p>
              {!baris.length && admin && (
                <>
                  <p className="mt-1 text-[13px] text-pekat/40">Mulai dengan “Situasi baru”, import dari template Excel, atau salin {SEED_BANTU.length} situasi contoh yang sekarang dilihat orang tua.</p>
                  <button type="button" disabled={sibuk}
                    onClick={() => jalankan(async () => { for (let i = 0; i < SEED_BANTU.length; i++) await buatDrafBantu(isiDariSeed(SEED_BANTU[i], i), { catatan: 'Disalin dari situasi contoh bawaan' }); },
                      `${SEED_BANTU.length} situasi contoh disalin sebagai draf. Tinjau & ajukan agar bisa tayang.`)}
                    className="mt-4 rounded-full border border-rekah/30 px-5 py-2 text-[13px] font-bold text-rekah hover:bg-rekah/5 disabled:opacity-50">
                    Salin situasi contoh sebagai draf
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-rekah/10 bg-white">
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="border-b border-rekah/10 bg-rekah/5 text-left">
                    {admin && <th className="w-10 px-4 py-3"><span className="sr-only">Pilih</span></th>}
                    <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Situasi</th>
                    <th className="px-3 py-3 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Kategori</th>
                    <th className="px-3 py-3 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Usia</th>
                    <th className="px-3 py-3 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Langkah</th>
                    <th className="px-3 py-3 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Status</th>
                    <th className="px-4 py-3 text-right text-[12px] font-bold uppercase tracking-wider text-pekat/40">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tampil.map(b => {
                    const s = statusBaris(b);
                    return (
                      <tr key={b.kunci} className="border-t border-rekah/8 align-top">
                        {admin && (
                          <td className="px-4 py-3.5">
                            <input type="checkbox" id={`pilih-${b.kunci}`} aria-label={`Pilih ${b.isi.label}`} checked={pilih.includes(b.kunci)}
                              onChange={e => setPilih(p => (e.target.checked ? [...p, b.kunci] : p.filter(x => x !== b.kunci)))} />
                          </td>
                        )}
                        <td className="px-4 py-3.5">
                          <p className="flex items-center gap-1.5 text-[14px] font-semibold text-pekat">
                            {b.isi.label || '(tanpa label)'}
                            {b.isi.sensitif_keselamatan && <span title="Sensitif keselamatan" className="inline-flex items-center gap-0.5 rounded-md bg-rekah/10 px-1.5 py-0.5 text-[10px] font-bold text-rekah-tua"><ShieldAlert className="h-3 w-3" /> sensitif</span>}
                          </p>
                          <p className="text-[12px] text-pekat/50">{b.isi.ringkas}</p>
                          <p className="font-mono text-[11px] text-pekat/35">{b.isi.slug}</p>
                          {b.live && b.draf && <p className="mt-1 text-[12px] text-daun">Revisi · v{b.live.versi} tetap dipakai sampai revisi diterapkan</p>}
                          {b.draf?.catatan_tinjauan && <p className="mt-1 line-clamp-2 text-[12px] text-pekat/55">Catatan peninjau: {b.draf.catatan_tinjauan}</p>}
                        </td>
                        <td className="px-3 py-3.5 text-[13px] text-pekat/60">{LABEL_KATEGORI[b.isi.kategori]}</td>
                        <td className="px-3 py-3.5 text-[13px] text-pekat/60">{labelUsia(b.isi.usia_min_bulan, b.isi.usia_max_bulan)}</td>
                        <td className="px-3 py-3.5 text-[13px] tabular-nums text-pekat/60">{b.isi.langkah.length}</td>
                        <td className="px-3 py-3.5">
                          <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${WARNA[s]}`}>{LABEL[s]}{s === 'tayang' && b.live ? ` · v${b.live.versi}` : ''}</span>
                        </td>
                        <td className="px-4 py-3.5"><Aksi b={b} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-[12px] text-pekat/45">Arsipkan menyembunyikan situasi dari orang tua tanpa menghapus riwayatnya. Hapus permanen hanya untuk draf milik sendiri yang belum diajukan atau yang ditolak.</p>
        </>
      )}

      {konfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pekat/40 p-4" role="dialog" aria-modal="true" aria-labelledby="konfirm-bantu">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 id="konfirm-bantu" className="font-bricolage text-[18px] font-bold text-pekat">{konfirm.jenis === 'hapus' ? 'Hapus draf permanen?' : 'Arsipkan situasi?'}</h2>
            <p className="mt-2 text-[13px] text-pekat/70">
              {konfirm.jenis === 'hapus'
                ? `“${konfirm.baris.isi.label}” akan dihapus beserta riwayat tinjauannya. Tindakan ini tidak dapat dibatalkan.`
                : `“${konfirm.baris.isi.label}” tidak lagi muncul di Bantu. Panduan yang sudah disimpan keluarga tetap ada. Anda bisa memulihkannya kapan saja.`}
            </p>
            {konfirm.jenis === 'hapus' && (
              <label htmlFor="konfirm-slug-bantu" className="mt-4 block text-[12px] font-semibold text-pekat/60">
                Ketik <span className="font-mono">{konfirm.baris.isi.slug}</span> untuk konfirmasi
                <input id="konfirm-slug-bantu" autoFocus value={ketik} onChange={e => setKetik(e.target.value)} autoComplete="off" className="mt-1.5 w-full rounded-xl border border-rekah/20 px-3 py-2 font-mono text-[13px] focus:border-rekah focus:outline-none" />
              </label>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setKonfirm(null)} className="rounded-full px-4 py-2 text-[13px] font-semibold text-pekat/60">Batal</button>
              <button type="button" disabled={sibuk || (konfirm.jenis === 'hapus' && ketik.trim() !== konfirm.baris.isi.slug)}
                onClick={async () => {
                  const k = konfirm; setKonfirm(null);
                  if (k.jenis === 'hapus') await jalankan(() => hapusDrafBantu(k.baris.draf!.id), 'Draf dihapus.');
                  else await jalankan(async () => { await aturStatusBantu(k.baris.live!.slug, 'diarsipkan'); await muatUlangKatalogBantu(); }, 'Situasi diarsipkan.');
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

// ── Pengaman (baca saja) ─────────────────────────────────────────────────────

function PanelPengaman() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-langit/15 px-5 py-3 text-[13px] text-pekat/80">
        Pemindai kata keselamatan, pilihan jawaban yang otomatis membuka layar keselamatan, dan daftar rujukan disimpan di kode
        (<code className="font-mono">features/bantu/bantuSeed.ts</code>), bukan di admin. Pengaman ini sengaja tidak bisa diubah dari sini, agar tidak ada yang
        terhapus tanpa tinjauan Psikolog Fitri. Per situasi, Anda tetap bisa menandai pilihan jawaban tambahan yang membuka layar keselamatan.
      </div>
      <section className="rounded-2xl border border-rekah/10 bg-white p-5">
        <h2 className="mb-3 font-bricolage text-[16px] font-bold text-pekat">Rujukan yang ditampilkan di layar keselamatan</h2>
        <ul className="flex flex-col gap-2">
          {RUJUKAN_KESELAMATAN.map(r => (
            <li key={r.nama} className="rounded-xl border border-rekah/10 px-4 py-2.5 text-[13px]">
              <b className="text-pekat">{r.nama}</b> · <span className="text-pekat/60">{r.untuk}</span><br /><span className="font-mono text-pekat/80">{r.kontak}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12px] text-pekat/45">Status: kandidat — perlu diverifikasi dan ditunjuk penanggung jawab sebelum tayang.</p>
      </section>
      <section className="rounded-2xl border border-rekah/10 bg-white p-5">
        <h2 className="mb-1 font-bricolage text-[16px] font-bold text-pekat">Pilihan jawaban yang selalu membuka layar keselamatan</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">{OPSI_MEMICU_B5.map(o => <span key={o} className="rounded-full bg-rekah/10 px-3 py-1 text-[12px] font-semibold text-rekah-tua">{o}</span>)}</div>
      </section>
      <section className="rounded-2xl border border-rekah/10 bg-white p-5">
        <h2 className="mb-1 font-bricolage text-[16px] font-bold text-pekat">Kata kunci pemindai ({KATA_KUNCI_KESELAMATAN.length})</h2>
        <p className="mb-2 text-[12px] text-pekat/50">Dipakai pada teks bebas orang tua dan postingan forum.</p>
        <div className="flex flex-wrap gap-1.5">{KATA_KUNCI_KESELAMATAN.map(k => <span key={k} className="rounded-md bg-pekat/5 px-2 py-0.5 font-mono text-[11px] text-pekat/70">{k}</span>)}</div>
      </section>
    </div>
  );
}

// ── Panel import ─────────────────────────────────────────────────────────────

type Pilihan = 'baru' | 'revisi' | 'perbarui' | 'lewati';
interface Siap extends BarisImportBantu { pilihan: Pilihan; opsi: Pilihan[]; alasan?: string; drafId?: string }

function PanelImport({ katalog, drafs, uid, onSelesai }: { katalog: SituasiKatalog[]; drafs: DrafBantu[]; uid: string | null; onSelesai: (t: string) => Promise<void> }) {
  const [nama, setNama] = useState('');
  const [galat, setGalat] = useState('');
  const [grup, setGrup] = useState<Siap[] | null>(null);
  const [ajukan, setAjukan] = useState(false);
  const [jalan, setJalan] = useState(false);
  const [seret, setSeret] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function siapkan(g: BarisImportBantu): Siap {
    const terbuka = drafs.find(d => ['draf', 'diajukan', 'disetujui'].includes(d.status) && (d.isi.slug === g.slug || d.id_konten_sumber === g.slug));
    if (terbuka) {
      return terbuka.id_penulis === uid && ['draf', 'diajukan'].includes(terbuka.status)
        ? { ...g, pilihan: 'perbarui', opsi: ['perbarui', 'lewati'], drafId: terbuka.id, alasan: 'Sudah ada draf untuk slug ini.' }
        : { ...g, pilihan: 'lewati', opsi: ['lewati'], alasan: `Ada draf berstatus “${terbuka.status}” untuk slug ini yang tidak bisa ditimpa.` };
    }
    if (katalog.some(s => s.slug === g.slug)) return { ...g, pilihan: 'revisi', opsi: ['revisi', 'lewati'], alasan: 'Slug ini sudah tayang.' };
    return { ...g, pilihan: 'baru', opsi: ['baru'] };
  }

  async function baca(f: File) {
    setGalat(''); setGrup(null); setNama(f.name);
    try {
      const r = await bacaFileBantu(f);
      setNama(r.nama);
      if (r.error || !r.data) { setGalat(r.error ?? 'File tidak terbaca.'); return; }
      setGrup(validasiImportBantu(r.data).map(siapkan));
    } catch (e) { setGalat(`File tidak bisa dibaca: ${(e as Error).message}`); }
  }

  const siap = (grup ?? []).filter(g => !g.galat.length && g.pilihan !== 'lewati');

  async function jalankanImport() {
    setJalan(true);
    let ok = 0, diajukan = 0;
    const gagal: string[] = [];
    for (const g of siap) {
      const kirim = ajukan && !periksaKelengkapanBantu(g.isi).length && !periksaKataBantu(g.isi).length;
      try {
        if (g.pilihan === 'perbarui' && g.drafId) await perbaruiDrafBantu(g.drafId, g.isi, { ajukan: kirim, catatan: 'Diperbarui lewat import' });
        else await buatDrafBantu(g.isi, { idSumber: g.pilihan === 'revisi' ? g.slug : null, ajukan: kirim, catatan: 'Dibuat lewat import' });
        ok++; if (kirim) diajukan++;
      } catch (e) { gagal.push(`${g.slug}: ${(e as Error).message}`); }
    }
    setJalan(false);
    if (gagal.length) { setGalat(`Sebagian gagal: ${gagal.join(' · ')}`); if (!ok) return; }
    await onSelesai(`${ok} situasi diimpor sebagai draf${diajukan ? `, ${diajukan} langsung diajukan ke tinjauan` : ''}.`);
  }

  const LABEL_PILIHAN: Record<Pilihan, string> = { baru: 'Situasi baru', revisi: 'Jadikan revisi draf (versi tayang tidak berubah)', perbarui: 'Timpa draf yang ada', lewati: 'Lewati' };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ['Isi template', 'Satu baris = satu situasi. Langkah di kolom langkah_1 … langkah_6.'],
          ['Pertanyaan', 'Pilihan jawaban dipisah titik koma (;). opsi_keselamatan = pilihan yang membuka layar keselamatan.'],
          ['Periksa', 'Kolom wajib, slug dobel, pilihan keselamatan, dan kata yang perlu ditinjau.'],
          ['Masuk sebagai draf', 'Tidak ada yang langsung tayang. Peninjau tetap memeriksa.'],
        ].map(([j, t]) => (
          <div key={j} className="rounded-xl border border-rekah/10 bg-white p-3.5 text-[12px] text-pekat/60"><p className="mb-0.5 font-bricolage text-[14px] font-bold text-pekat">{j}</p>{t}</div>
        ))}
      </div>
      <div onDragOver={e => { e.preventDefault(); setSeret(true); }} onDragLeave={() => setSeret(false)}
        onDrop={e => { e.preventDefault(); setSeret(false); const f = e.dataTransfer.files[0]; if (f) void baca(f); }}
        className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${seret ? 'border-rekah bg-fajar' : 'border-rekah/20 bg-white'}`}>
        <Upload className="h-7 w-7 text-rekah" />
        <p className="font-bricolage text-[16px] font-bold text-pekat">Letakkan file di sini</p>
        <p className="text-[12px] text-pekat/50">.xlsx dari template (sheet “Isi di sini”), atau .csv</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full bg-rekah px-5 py-2 text-[13px] font-bold text-white hover:bg-rekah-tua">Pilih file</button>
          <a href={URL_TEMPLATE} download className="rounded-full border border-rekah/20 px-5 py-2 text-[13px] font-semibold text-pekat/70">Unduh template</a>
        </div>
        <input ref={inputRef} id="bantu-import-file" type="file" accept=".csv,.xlsx,.xls,text/csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) void baca(f); e.target.value = ''; }} />
      </div>
      {galat && <div className="rounded-xl bg-rekah/15 px-5 py-3 text-[13px] font-semibold text-rekah-tua">{nama ? `${nama}: ` : ''}{galat}</div>}
      {grup && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bricolage text-[16px] font-bold text-pekat">Pratinjau import</h2>
              <p className="text-[12px] text-pekat/50">{nama} · {grup.length} situasi · {siap.length} siap diimpor</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="imp-bantu-ajukan" className="flex items-center gap-2 text-[13px] text-pekat/70"><input id="imp-bantu-ajukan" type="checkbox" checked={ajukan} onChange={e => setAjukan(e.target.checked)} /> Langsung ajukan yang sudah lengkap</label>
              <button type="button" onClick={() => setGrup(null)} className="rounded-full px-4 py-2 text-[13px] font-semibold text-pekat/60">Batalkan</button>
              <button type="button" disabled={jalan || !siap.length} onClick={jalankanImport} className="rounded-full bg-rekah px-5 py-2 text-[13px] font-bold text-white disabled:opacity-40">{jalan ? 'Mengimpor…' : `Import ${siap.length} situasi`}</button>
            </div>
          </div>
          {grup.map((g, i) => (
            <div key={`${g.slug}-${i}`} className="overflow-hidden rounded-2xl border border-rekah/10 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-rekah/5 px-4 py-3">
                <div><b className="text-[14px] text-pekat">{g.label}</b><span className="ml-2 font-mono text-[12px] text-pekat/40">{g.slug} · {g.isi.langkah.length} langkah</span></div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${g.galat.length ? 'bg-rekah/15 text-rekah-tua' : g.catatan.length ? 'bg-madu/20 text-pekat' : 'bg-daun/15 text-daun'}`}>
                  {g.galat.length ? `${g.galat.length} kesalahan · dilewati` : g.catatan.length ? `${g.catatan.length} catatan` : 'Siap'}
                </span>
              </div>
              {!g.galat.length && g.opsi.length > 1 && (
                <div className="flex flex-wrap items-center gap-3 border-b border-rekah/8 px-4 py-2.5 text-[13px]">
                  <span className="text-pekat/60">{g.alasan}</span>
                  {g.opsi.map(o => (
                    <label key={o} htmlFor={`impb-${i}-${o}`} className="flex items-center gap-1.5 text-pekat/80">
                      <input type="radio" id={`impb-${i}-${o}`} name={`impb-${i}`} checked={g.pilihan === o} onChange={() => setGrup(gs => gs!.map((x, j) => (j === i ? { ...x, pilihan: o } : x)))} />
                      {LABEL_PILIHAN[o]}
                    </label>
                  ))}
                </div>
              )}
              {!g.galat.length && g.opsi.length === 1 && g.alasan && <p className="border-b border-rekah/8 px-4 py-2.5 text-[13px] text-pekat/60">{g.alasan} Situasi ini dilewati.</p>}
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
