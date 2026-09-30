import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, XCircle, RefreshCw, AlertTriangle, Rocket, Eye, ListChecks, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  muatDraf, muatRiwayat, setujuiDraf, tolakDraf, muatAntrean,
  KontenDraf, RiwayatTinjauan, LABEL_STATUS, LABEL_JENIS,
} from '../../lib/supabase/pipeline';
import { pindaiFields } from '../../lib/pemindaiKata';
import { api } from '../../api/client';
import { KnowledgeCard, AgeKey, DomainCode } from '@studiva/shared';
import PreviewBuku from '../AdminPages/PreviewBuku';
import TinjauanTemani from './temani/TinjauanTemani';
import TinjauanBantu from './bantu/TinjauanBantu';
import TinjauanKebiasaan from './kebiasaan/TinjauanKebiasaan';
import { terapkanKebiasaan } from '../../lib/supabase/kebiasaan';
import { muatUlangKatalogIrama } from '../../features/irama-hari/iramaKatalog';
import { terapkanPanduan } from '../../lib/supabase/panduan';
import { terapkanAjakMain, terapkanSikap } from '../../lib/supabase/ajakMain';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';
import { useKnowledgeLibrary } from '../../context/KnowledgeLibraryContext';
import { terapkanBantu } from '../../lib/supabase/bantu';
import { muatUlangKatalogBantu } from '../../features/bantu/bantuKatalog';
import { terapkanTemani } from '../../lib/supabase/temani';
import { muatUlangKatalog } from '../../features/temani/temaniKatalog';
import { TEMA, BungaNilai } from './tema/temaAdmin';
import KebunFlat from './peninjau/KebunFlat';
import { TEMA_JENIS } from './peninjau/BerandaPeninjau';
import { PERIKSA_UMUM, PERIKSA_JENIS, CATATAN_CEPAT, LABEL_TINDAKAN, lamaMenunggu } from './peninjau/panduanTinjauan';

// ── Konversi draf panduan_tumbuh → KnowledgeCard untuk preview ───────────────

function drafToCard(draf: KontenDraf): KnowledgeCard | null {
  if (draf.jenis !== 'panduan_tumbuh') return null;
  const isi = draf.isi as Record<string, unknown>;
  const sci = (isi.scientific as Record<string, unknown> | null) ?? {};
  const sciSections = Array.isArray(sci.sections)
    ? (sci.sections as Array<{ judul?: string; isi: string }>).map(s => ({ judul: s.judul ?? '', isi: s.isi }))
    : [];
  return {
    id: String(isi.slug ?? 'preview'),
    ageKey: (isi.age_key as AgeKey) ?? '0-3m',
    domain: (isi.domain as DomainCode) ?? 'FM',
    title: String(isi.title ?? ''),
    photo: {
      src: String(isi.photo_src ?? ''),
      alt: String(isi.photo_alt ?? ''),
      credit: isi.photo_credit ? String(isi.photo_credit) : undefined,
    },
    readMinutes: Number(isi.read_minutes ?? 2),
    isMedical: Boolean(isi.is_medical),
    summary: {
      terjadi: String(isi.terjadi ?? ''),
      penting: String(isi.penting ?? ''),
      lakukan: Array.isArray(isi.lakukan) ? (isi.lakukan as unknown[]).map(String) : [],
      perhatian: String(isi.perhatian ?? ''),
    },
    scientific: {
      title: sci.title ? String(sci.title) : '',
      readMinutes: sci.readMinutes ? Number(sci.readMinutes) : undefined,
      sections: sciSections.length > 0 ? sciSections : undefined,
    },
    sources: Array.isArray(isi.sources) ? (isi.sources as unknown[]).map(String) : [],
  };
}

// ── Komponen tampilan field ───────────────────────────────────────────────────

function Baris({ label, nilai }: { label: string; nilai: unknown }) {
  if (nilai === null || nilai === undefined || nilai === '') return null;
  const teks = Array.isArray(nilai)
    ? (nilai as string[]).join(' · ')
    : typeof nilai === 'object'
    ? JSON.stringify(nilai, null, 2)
    : String(nilai);

  return (
    <div className="border-b border-rekah/8 px-5 py-3.5 last:border-0">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-pekat/35">{label}</p>
      <p className="whitespace-pre-wrap text-[14px] text-pekat">{teks}</p>
    </div>
  );
}

// ── Konten berdasarkan jenis ──────────────────────────────────────────────────

function PratampilanIsi({ draf }: { draf: KontenDraf }) {
  const isi = draf.isi as Record<string, unknown>;

  if (draf.jenis === 'temani_journey') {
    return <TinjauanTemani draf={draf} />;
  }

  if (draf.jenis === 'bantu_situasi') {
    return <TinjauanBantu draf={draf} />;
  }

  if (draf.jenis === 'kebiasaan_baik') {
    return <TinjauanKebiasaan draf={draf} />;
  }

  if (draf.jenis === 'sikap') {
    return (
      <>
        <Baris label="Judul" nilai={isi.judul} />
        <Baris label="Deskripsi" nilai={isi.deskripsi} />
        <Baris label="Nilai Akar" nilai={isi.nilai} />
        <Baris label="Fase" nilai={`Fase ${isi.fase_mulai} – ${isi.fase_selesai}`} />
      </>
    );
  }

  if (draf.jenis === 'panduan_tumbuh') {
    return (
      <>
        <Baris label="Judul" nilai={isi.title} />
        <Baris label="Usia" nilai={isi.age_key} />
        <Baris label="Domain" nilai={isi.domain} />
        <Baris label="Terjadi" nilai={isi.terjadi} />
        <Baris label="Penting" nilai={isi.penting} />
        <Baris label="Yang dilakukan" nilai={isi.lakukan} />
        <Baris label="Perhatian" nilai={isi.perhatian} />
      </>
    );
  }

  // kegiatan_ajak_main
  return (
    <>
      <Baris label="Judul" nilai={isi.judul} />
      <Baris label="Deskripsi" nilai={isi.deskripsi} />
      <Baris label="Usia" nilai={isi.ageId} />
      <Baris label="Domain" nilai={isi.domain} />
      <Baris label="Durasi (menit)" nilai={isi.durasiMenit} />
      <Baris label="Tujuan" nilai={isi.tujuan} />
      <Baris label="Langkah" nilai={isi.langkah} />
    </>
  );
}

// ── Pemindai kata ─────────────────────────────────────────────────────────────

function BannerKataTerlarang({ draf }: { draf: KontenDraf }) {
  if (draf.jenis === 'temani_journey' || draf.jenis === 'bantu_situasi' || draf.jenis === 'kebiasaan_baik') return null; // tampilan tinjauan khusus memeriksa kata sendiri
  const teksFields: Record<string, string> = {};
  function tambah(k: string, v: unknown) {
    if (typeof v === 'string' && v) teksFields[k] = v;
    else if (Array.isArray(v)) teksFields[k] = v.filter(s => typeof s === 'string').join(' ');
  }
  const isi = draf.isi as Record<string, unknown>;
  Object.entries(isi).forEach(([k, v]) => tambah(k, v));

  const temuan = pindaiFields(teksFields);
  const ada = Object.keys(temuan).length > 0;
  if (!ada) return null;

  return (
    <div className="mb-5 rounded-xl border border-rekah/30 bg-rekah/8 px-5 py-4">
      <div className="mb-2 flex items-center gap-2 text-rekah">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span className="text-[13px] font-bold">Kata yang perlu ditinjau ditemukan</span>
      </div>
      {Object.entries(temuan).map(([field, ts]) => (
        <div key={field} className="mt-2">
          <p className="text-[12px] font-semibold text-rekah-tua">{field}</p>
          {ts.map((t, i) => (
            <p key={i} className="mt-0.5 font-mono text-[12px] text-pekat/70">
              "…{t.potongan}…"
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Riwayat ───────────────────────────────────────────────────────────────────

function RiwayatItem({ r }: { r: RiwayatTinjauan }) {
  const warna = r.tindakan === 'disetujui' || r.tindakan === 'tayang'
    ? 'bg-daun/15 text-daun'
    : r.tindakan === 'ditolak'
    ? 'bg-rekah/15 text-rekah'
    : r.tindakan === 'revisi_diminta'
    ? 'bg-madu/25 text-pekat'
    : 'bg-pekat/8 text-pekat/60';

  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${warna}`}>
        {LABEL_TINDAKAN[r.tindakan] ?? r.tindakan}
      </span>
      <div className="flex-1 min-w-0">
        {r.catatan && <p className="text-[13px] text-pekat">{r.catatan}</p>}
        <p className="text-[12px] text-pekat/40">
          {new Date(r.dibuat_pada).toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  );
}

// ── Layar utama ───────────────────────────────────────────────────────────────

export default function LayarDiff() {
  const { muatUlangPanduan } = useKnowledgeLibrary();
  const { muatUlangAjakMain } = useLearningStrategies();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { peranStaf } = useAuth();

  const [draf, setDraf] = useState<KontenDraf | null>(null);
  const [riwayat, setRiwayat] = useState<RiwayatTinjauan[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [catatan, setCatatan] = useState('');
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'galat'; teks: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [antrean, setAntrean] = useState<KontenDraf[]>([]);
  const [dicentang, setDicentang] = useState<string[]>([]);
  const [baruSaja, setBaruSaja] = useState<'disetujui' | 'ditolak' | 'revisi_diminta' | null>(null);

  const bolehtinjau = peranStaf === 'peninjau_klinis';
  const bolehTerapkan = peranStaf === 'admin';
  const saringJenis = params.get('jenis');

  useEffect(() => {
    if (!id) return;
    setMemuat(true); setPesan(null); setCatatan(''); setDicentang([]); setBaruSaja(null);
    Promise.all([muatDraf(id), muatRiwayat(id)])
      .then(([d, r]) => { setDraf(d); setRiwayat(r); })
      .catch(console.error)
      .finally(() => setMemuat(false));
  }, [id]);

  useEffect(() => {
    if (!bolehtinjau) return;
    muatAntrean().then(setAntrean).catch(() => setAntrean([]));
  }, [bolehtinjau, id]);

  const antreanSaring = useMemo(
    () => (saringJenis ? antrean.filter(d => d.jenis === saringJenis) : antrean),
    [antrean, saringJenis],
  );
  const posisi = antreanSaring.findIndex(d => d.id === id);
  const sesudah = antreanSaring.filter(d => d.id !== id);
  const berikutnya = posisi >= 0 ? (antreanSaring[posisi + 1] ?? antreanSaring[0]) : sesudah[0];
  const keDraf = (d: KontenDraf | undefined) => { if (d && d.id !== id) navigate(`/rekah-admin/diff/${d.id}${saringJenis ? `?jenis=${saringJenis}` : ''}`); };

  async function tindak(aksi: 'disetujui' | 'ditolak' | 'revisi_diminta') {
    if (!id || !draf) return;
    if ((aksi === 'ditolak' || aksi === 'revisi_diminta') && !catatan.trim()) {
      setPesan({ tipe: 'galat', teks: 'Tuliskan catatan untuk penulis saat menolak atau meminta revisi.' });
      return;
    }
    setMenyimpan(true);
    setPesan(null);
    try {
      if (aksi === 'disetujui') await setujuiDraf(id, catatan.trim() || undefined);
      else await tolakDraf(id, aksi, catatan.trim());
      const [d, r, a] = await Promise.all([muatDraf(id), muatRiwayat(id), muatAntrean().catch(() => antrean)]);
      setDraf(d); setRiwayat(r); setAntrean(a); setCatatan(''); setBaruSaja(aksi);
    } catch (e) {
      setPesan({ tipe: 'galat', teks: (e as Error).message ?? 'Terjadi kesalahan.' });
    } finally {
      setMenyimpan(false);
    }
  }

  async function terapkan() {
    if (!id || !draf) return;
    setMenyimpan(true);
    setPesan(null);
    try {
      if (draf.jenis === 'temani_journey') {
        await terapkanTemani(id); // RPC SECURITY DEFINER (024), tanpa backend
        await muatUlangKatalog();
      } else if (draf.jenis === 'bantu_situasi') {
        await terapkanBantu(id); // RPC SECURITY DEFINER (025), tanpa backend
        await muatUlangKatalogBantu();
      } else if (draf.jenis === 'panduan_tumbuh') {
        await terapkanPanduan(id); // RPC SECURITY DEFINER (027) → tabel panduan_tumbuh, dibaca website online
        await muatUlangPanduan();
      } else if (draf.jenis === 'kebiasaan_baik') {
        await terapkanKebiasaan(id); // RPC SECURITY DEFINER (026), tanpa backend
        await muatUlangKatalogIrama();
      } else if (draf.jenis === 'kegiatan_ajak_main') {
        await terapkanAjakMain(id); // RPC SECURITY DEFINER (028) → tabel ajak_main_kegiatan
        await muatUlangAjakMain();
      } else if (draf.jenis === 'sikap') {
        await terapkanSikap(id); // RPC SECURITY DEFINER (028) → tabel sikap, dibaca Bekal
      } else {
        await api.post(`/rekah-admin/terapkan-konten/${id}`);
      }
      setPesan({ tipe: 'sukses', teks: 'Konten berhasil diterapkan ke dashboard pengguna.' });
      const [d, r] = await Promise.all([muatDraf(id), muatRiwayat(id)]);
      setDraf(d);
      setRiwayat(r);
    } catch (e) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (e as Error).message
        ?? 'Gagal menerapkan konten.';
      setPesan({ tipe: 'galat', teks: msg });
    } finally {
      setMenyimpan(false);
    }
  }

  if (memuat) {
    return <div className="flex h-48 items-center justify-center text-pekat/40">Memuat...</div>;
  }

  if (!draf) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <p className="text-pekat/50">Draf tidak ditemukan.</p>
        <button type="button" onClick={() => navigate(-1)} className="mt-3 text-[14px] text-rekah hover:underline">Kembali</button>
      </div>
    );
  }

  const statusAktif = draf.status === 'diajukan';
  const t = TEMA[TEMA_JENIS[draf.jenis]];
  const daftarPeriksa = [...PERIKSA_UMUM, ...PERIKSA_JENIS[draf.jenis]];
  const tambahCatatan = (teks: string) => { setCatatan(c => (c.includes(teks) ? c : `${c.trim()}${c.trim() ? '\n' : ''}${teks}`)); setPesan(null); };
  const tindakanPenulis = riwayat.find(r => r.tindakan === 'diajukan');

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Navigasi atas */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => (bolehtinjau ? navigate(`/rekah-admin/antrean${saringJenis ? `?jenis=${saringJenis}` : ''}`) : navigate(-1))}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-pekat/50 transition hover:text-pekat">
          <ArrowLeft className="h-4 w-4" /> {bolehtinjau ? 'Antrean Tinjauan' : 'Kembali'}
        </button>
        {bolehtinjau && posisi >= 0 && antreanSaring.length > 1 && (
          <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1 shadow-[0_8px_18px_-14px_rgba(90,50,70,.6)]">
            <button type="button" aria-label="Konten sebelumnya" disabled={posisi <= 0} onClick={() => keDraf(antreanSaring[posisi - 1])} className="rounded-full p-1.5 text-pekat/60 hover:bg-pekat/5 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-[12px] font-bold text-pekat/70">{posisi + 1} dari {antreanSaring.length} di antrean</span>
            <button type="button" aria-label="Konten berikutnya" disabled={posisi >= antreanSaring.length - 1} onClick={() => keDraf(antreanSaring[posisi + 1])} className="rounded-full p-1.5 text-pekat/60 hover:bg-pekat/5 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>

      {/* Kepala konten */}
      <section className="relative mb-6 overflow-hidden rounded-[26px] border px-6 py-5" style={{ background: `linear-gradient(120deg, ${t.tint} 0%, ${t.tint2} 100%)`, borderColor: `${t.aksen}55` }}>
        <span aria-hidden className="absolute -right-4 -top-4 opacity-70"><BungaNilai nilai={t.nilai} size={96} /></span>
        <div className="relative flex flex-wrap items-center gap-1.5 pr-20">
          <span className="rounded-full bg-white/85 px-2.5 py-0.5 text-[11.5px] font-bold" style={{ color: t.teks }}>{LABEL_JENIS[draf.jenis]}</span>
          {draf.id_konten_sumber
            ? <span className="flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-0.5 text-[11.5px] font-bold text-pekat/70"><RefreshCw className="h-3 w-3" /> Revisi konten tayang</span>
            : <span className="flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-0.5 text-[11.5px] font-bold text-pekat/70"><Sparkles className="h-3 w-3" /> Konten baru</span>}
          <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${
            draf.status === 'diajukan' ? 'bg-kuning text-pekat' :
            draf.status === 'disetujui' ? 'bg-daun/20 text-daun' :
            draf.status === 'ditolak' ? 'bg-rekah/20 text-rekah-tua' :
            draf.status === 'tayang' ? 'bg-langit/30 text-pekat' : 'bg-pekat/10 text-pekat/60'}`}>{LABEL_STATUS[draf.status]}</span>
        </div>
        <h1 className="relative mt-2 pr-20 font-bricolage text-[24px] font-extrabold leading-tight text-pekat" style={{ textWrap: 'balance' } as React.CSSProperties}>{draf.judul}</h1>
        <p className="relative mt-1 text-[13px] text-pekat/60">
          Diajukan {new Date((tindakanPenulis?.dibuat_pada ?? draf.diperbarui_pada)).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          {statusAktif ? ` · menunggu ${lamaMenunggu(draf.diperbarui_pada).teks}` : ''}
        </p>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Kolom kiri — isi */}
        <div className="flex min-w-0 flex-col gap-5">
          <BannerKataTerlarang draf={draf} />
          {draf.catatan_penulis && (
            <div className="rounded-2xl border border-rekah/10 bg-fajar/60 px-5 py-3.5">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-pekat/40">Catatan penulis</p>
              <p className="whitespace-pre-wrap text-[13.5px] text-pekat/80">{draf.catatan_penulis}</p>
            </div>
          )}
          <div className="overflow-hidden rounded-2xl border border-rekah/10 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-rekah/8 px-5 py-3" style={{ background: t.tint2 }}>
              <p className="text-[12px] font-bold uppercase tracking-wider text-pekat/45">Isi konten</p>
              {draf.jenis === 'panduan_tumbuh' && (
                <button type="button" onClick={() => setShowPreview(true)}
                  className="flex items-center gap-1.5 rounded-full border border-rekah/30 bg-white px-3 py-1 text-[12px] font-bold text-rekah transition hover:bg-rekah/8">
                  <Eye className="h-3.5 w-3.5" /> Lihat seperti orang tua
                </button>
              )}
            </div>
            <PratampilanIsi draf={draf} />
          </div>
          {riwayat.length > 0 && (
            <div>
              <h2 className="mb-2 font-bricolage text-[15px] font-bold text-pekat">Riwayat tinjauan</h2>
              <div className="divide-y divide-rekah/8 rounded-2xl border border-rekah/10 bg-white px-5">
                {riwayat.map(r => <RiwayatItem key={r.id} r={r} />)}
              </div>
            </div>
          )}
        </div>

        {/* Kolom kanan — keputusan */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          {pesan && (
            <div className={`rounded-xl px-4 py-3 text-[13px] font-semibold ${pesan.tipe === 'sukses' ? 'bg-daun/15 text-daun' : 'bg-rekah/15 text-rekah-tua'}`}>{pesan.teks}</div>
          )}

          {/* Selesai memutuskan → lanjut */}
          {bolehtinjau && baruSaja && (
            <div className="overflow-hidden rounded-[24px] border border-[#C9B8F0] bg-white">
              <KebunFlat tinggi={110} suasana="pagi" aksesori={false} jumlah={6} />
              <div className="p-5">
                <p className="font-bricolage text-[17px] font-bold text-pekat">
                  {baruSaja === 'disetujui' ? 'Disetujui. Terima kasih, Bu.' : baruSaja === 'revisi_diminta' ? 'Dikembalikan untuk revisi.' : 'Konten ditolak.'}
                </p>
                <p className="mt-1 text-[13px] text-pekat/60">
                  {baruSaja === 'disetujui' ? 'Admin akan menayangkannya untuk keluarga.' : 'Catatan Ibu sudah terkirim ke penulis.'}
                  {sesudah.length ? ` Masih ada ${sesudah.length} konten di antrean.` : ' Antrean sudah kosong.'}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {berikutnya ? (
                    <button type="button" onClick={() => keDraf(berikutnya)} className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-bold text-white" style={{ background: '#5B3FAF' }}>
                      Lanjut ke berikutnya <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button type="button" onClick={() => navigate('/rekah-admin')} className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-bold text-white" style={{ background: '#5B3FAF' }}>
                      Kembali ke Ruang Tinjauan
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Panel keputusan peninjau */}
          {bolehtinjau && statusAktif && (
            <div className="rounded-[24px] border border-[#C9B8F0]/70 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(91,63,175,.6)]">
              <h2 className="flex items-center gap-2 font-bricolage text-[16px] font-bold text-pekat"><ListChecks className="h-[18px] w-[18px] text-[#5B3FAF]" /> Daftar periksa</h2>
              <p className="mb-3 mt-0.5 text-[12px] text-pekat/50">Pengingat saja — tidak mengunci tombol keputusan.</p>
              <ul className="mb-4 flex flex-col gap-1.5">
                {daftarPeriksa.map((p, i) => {
                  const on = dicentang.includes(p);
                  return (
                    <li key={p}>
                      <label htmlFor={`periksa-${i}`} className={`flex cursor-pointer items-start gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] leading-snug transition ${on ? 'bg-daun/10 text-pekat/60' : 'text-pekat/80 hover:bg-[#FBF7FF]'}`}>
                        <input id={`periksa-${i}`} type="checkbox" className="mt-0.5 accent-[#4E9C6E]" checked={on} onChange={() => setDicentang(d => (on ? d.filter(x => x !== p) : [...d, p]))} />
                        {p}
                      </label>
                    </li>
                  );
                })}
              </ul>

              <label htmlFor="catatan-tinjauan" className="mb-1.5 block text-[12px] font-bold text-pekat/70">Catatan untuk penulis <span className="font-normal text-pekat/45">(wajib bila revisi/tolak)</span></label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {CATATAN_CEPAT.map(c => (
                  <button key={c} type="button" onClick={() => tambahCatatan(c)} className="rounded-full border border-[#C9B8F0] bg-[#FBF7FF] px-2.5 py-1 text-left text-[11px] font-semibold text-[#5B3FAF] hover:bg-[#EEE8FB]">+ {c.replace(/^Mohon /, '').replace(/\.$/, '')}</button>
                ))}
              </div>
              <textarea id="catatan-tinjauan" value={catatan} onChange={e => { setCatatan(e.target.value); setPesan(null); }} rows={4}
                className="w-full rounded-xl border border-[#C9B8F0] px-3.5 py-2.5 text-[13.5px] text-pekat placeholder:text-pekat/30 focus:border-[#8B6FD6] focus:outline-none focus:ring-2 focus:ring-[#EEE8FB]"
                placeholder="Tulis masukan yang jelas dan hangat…" />

              <div className="mt-3 flex flex-col gap-2">
                <button type="button" disabled={menyimpan} onClick={() => tindak('disetujui')}
                  className="flex items-center justify-center gap-2 rounded-full bg-daun px-5 py-2.5 text-[13.5px] font-bold text-white transition hover:opacity-90 disabled:opacity-50">
                  <CheckCircle2 className="h-4 w-4" /> Setujui
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" disabled={menyimpan} onClick={() => tindak('revisi_diminta')}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-madu/50 bg-madu/10 px-3 py-2.5 text-[12.5px] font-bold text-[#8A5A10] transition hover:bg-madu/20 disabled:opacity-50">
                    <RefreshCw className="h-3.5 w-3.5" /> Minta revisi
                  </button>
                  <button type="button" disabled={menyimpan} onClick={() => tindak('ditolak')}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-rekah/30 bg-white px-3 py-2.5 text-[12.5px] font-bold text-rekah-tua transition hover:bg-rekah/8 disabled:opacity-50">
                    <XCircle className="h-3.5 w-3.5" /> Tolak
                  </button>
                </div>
              </div>
              <p className="mt-3 text-[11.5px] leading-snug text-pekat/50">Minta revisi mengembalikan konten ke penulis sebagai draf. Tolak berarti konten tidak dilanjutkan.</p>
            </div>
          )}

          {/* Status untuk peninjau bila bukan antrean */}
          {bolehtinjau && !statusAktif && !baruSaja && (
            <div className="rounded-[22px] border border-rekah/10 bg-white p-5 text-[13px] text-pekat/70">
              {draf.status === 'disetujui' && 'Sudah disetujui. Menunggu admin menayangkannya untuk keluarga.'}
              {draf.status === 'tayang' && 'Konten ini sudah tayang untuk keluarga.'}
              {draf.status === 'ditolak' && 'Konten ini ditolak dan tidak dilanjutkan.'}
              {draf.status === 'draf' && 'Konten ini sedang di tangan penulis (draf atau revisi).'}
              {draf.catatan_tinjauan && <p className="mt-2 rounded-xl bg-[#FBF7FF] px-3 py-2 text-[12.5px] text-pekat/75">Catatan tinjauan: {draf.catatan_tinjauan}</p>}
            </div>
          )}

          {/* Admin: menunggu peninjau */}
          {bolehTerapkan && statusAktif && (
            <div className="rounded-[22px] border border-kuning bg-kuning/30 p-5 text-[13px] text-pekat/80">
              Menunggu keputusan Psikolog Fitri. Penulis tidak bisa menyetujui kontennya sendiri.
            </div>
          )}

          {/* Admin: siap tayang */}
          {bolehTerapkan && draf.status === 'disetujui' && (
            <div className="rounded-[22px] border border-daun/30 bg-daun/8 p-5">
              <div className="mb-2 flex items-center gap-2">
                <Rocket className="h-4 w-4 shrink-0 text-daun" />
                <h2 className="font-bricolage text-[15px] font-bold text-daun">Siap tayang</h2>
              </div>
              <p className="mb-4 text-[13px] text-pekat/70">Konten ini telah disetujui Psikolog Fitri. Terapkan untuk menampilkannya di dashboard pengguna.</p>
              {draf.catatan_tinjauan && <p className="mb-3 rounded-xl bg-white px-3 py-2 text-[12.5px] text-pekat/75">Catatan peninjau: {draf.catatan_tinjauan}</p>}
              <button type="button" disabled={menyimpan} onClick={terapkan}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-daun px-5 py-2.5 text-[13px] font-bold text-white transition hover:opacity-90 disabled:opacity-50">
                <Rocket className="h-4 w-4" />
                {menyimpan ? 'Menerapkan...' : 'Terapkan ke dashboard pengguna'}
              </button>
            </div>
          )}

          {bolehTerapkan && draf.status === 'tayang' && (
            <div className="rounded-[22px] border border-daun/20 bg-daun/5 px-5 py-3.5">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-daun"><CheckCircle2 className="h-4 w-4 shrink-0" /> Konten ini sudah tayang di dashboard pengguna.</p>
            </div>
          )}
        </aside>
      </div>

      {showPreview && (() => {
        const previewCard = drafToCard(draf);
        return previewCard ? <PreviewBuku card={previewCard} onClose={() => setShowPreview(false)} /> : null;
      })()}
    </div>
  );
}
