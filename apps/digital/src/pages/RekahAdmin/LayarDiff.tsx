import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, AlertTriangle, Rocket, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  muatDraf, muatRiwayat, setujuiDraf, tolakDraf,
  KontenDraf, RiwayatTinjauan, LABEL_STATUS, LABEL_JENIS,
} from '../../lib/supabase/pipeline';
import { pindaiFields } from '../../lib/pemindaiKata';
import { api } from '../../api/client';
import { KnowledgeCard, AgeKey, DomainCode } from '@studiva/shared';
import PreviewBuku from '../AdminPages/PreviewBuku';

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
  const warna = r.tindakan === 'disetujui'
    ? 'bg-daun/15 text-daun'
    : r.tindakan === 'ditolak'
    ? 'bg-rekah/15 text-rekah'
    : 'bg-pekat/8 text-pekat/60';

  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${warna}`}>
        {r.tindakan}
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { peranStaf } = useAuth();

  const [draf, setDraf] = useState<KontenDraf | null>(null);
  const [riwayat, setRiwayat] = useState<RiwayatTinjauan[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [catatan, setCatatan] = useState('');
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'galat'; teks: string } | null>(null);

  const [showPreview, setShowPreview] = useState(false);

  const bolehtinjau = peranStaf === 'peninjau_klinis';
  const bolehTerapkan = peranStaf === 'admin';

  useEffect(() => {
    if (!id) return;
    Promise.all([muatDraf(id), muatRiwayat(id)])
      .then(([d, r]) => { setDraf(d); setRiwayat(r); })
      .catch(console.error)
      .finally(() => setMemuat(false));
  }, [id]);

  async function tindak(
    aksi: 'disetujui' | 'ditolak' | 'revisi_diminta',
  ) {
    if (!id || !draf) return;
    if ((aksi === 'ditolak' || aksi === 'revisi_diminta') && !catatan.trim()) {
      setPesan({ tipe: 'galat', teks: 'Catatan wajib diisi saat menolak atau meminta revisi.' });
      return;
    }
    setMenyimpan(true);
    try {
      if (aksi === 'disetujui') {
        await setujuiDraf(id, catatan.trim() || undefined);
      } else {
        await tolakDraf(id, aksi, catatan.trim());
      }
      setPesan({ tipe: 'sukses', teks: `Konten berhasil ${aksi === 'disetujui' ? 'disetujui' : aksi === 'ditolak' ? 'ditolak' : 'diminta revisi'}.` });
      const [d, r] = await Promise.all([muatDraf(id), muatRiwayat(id)]);
      setDraf(d);
      setRiwayat(r);
      setCatatan('');
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
      await api.post(`/rekah-admin/terapkan-konten/${id}`);
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
        <button type="button" onClick={() => navigate(-1)} className="mt-3 text-rekah hover:underline text-[14px]">
          Kembali
        </button>
      </div>
    );
  }

  const statusAktif = draf.status === 'diajukan';

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Header */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-semibold text-pekat/50 hover:text-rekah transition"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-bricolage text-[22px] font-extrabold text-pekat">{draf.judul}</h1>
          <p className="mt-1 text-[13px] text-pekat/50">
            {LABEL_JENIS[draf.jenis]} · diajukan {new Date(draf.dibuat_pada).toLocaleDateString('id-ID')}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${
          draf.status === 'diajukan'  ? 'bg-madu/20 text-madu' :
          draf.status === 'disetujui' ? 'bg-daun/20 text-daun' :
          draf.status === 'ditolak'   ? 'bg-rekah/20 text-rekah' :
          draf.status === 'tayang'    ? 'bg-rekah/10 text-rekah-tua' :
          'bg-pekat/10 text-pekat/60'
        }`}>
          {LABEL_STATUS[draf.status]}
        </span>
      </div>

      {/* Pemindai kata */}
      <BannerKataTerlarang draf={draf} />

      {/* Pesan aksi */}
      {pesan && (
        <div className={`mb-5 rounded-xl px-5 py-3.5 text-[13px] font-semibold ${
          pesan.tipe === 'sukses' ? 'bg-daun/15 text-daun' : 'bg-rekah/15 text-rekah'
        }`}>
          {pesan.teks}
        </div>
      )}

      {/* Isi konten */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-rekah/10 bg-white">
        <div className="border-b border-rekah/8 bg-rekah/5 px-5 py-3 flex items-center justify-between gap-3">
          <p className="text-[12px] font-bold uppercase tracking-wider text-pekat/40">Isi Konten</p>
          {draf.jenis === 'panduan_tumbuh' && (
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 rounded-full border border-rekah/30 px-3 py-1 text-[12px] font-bold text-rekah hover:bg-rekah/8 transition"
            >
              <Eye className="h-3.5 w-3.5" /> Preview Buku
            </button>
          )}
        </div>
        <PratampilanIsi draf={draf} />
        {draf.catatan_penulis && (
          <div className="border-t border-rekah/8 bg-fajar/40 px-5 py-3.5">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-pekat/35">
              Catatan Penulis
            </p>
            <p className="text-[13px] text-pekat/70">{draf.catatan_penulis}</p>
          </div>
        )}
      </div>

      {/* Panel tinjauan Fitri */}
      {bolehtinjau && statusAktif && (
        <div className="mb-6 rounded-2xl border border-rekah/10 bg-white p-5">
          <h2 className="mb-4 font-bricolage text-[15px] font-bold text-pekat">Keputusan Tinjauan</h2>
          <div className="mb-4">
            <label className="mb-1.5 block text-[12px] font-semibold text-pekat/60">
              Catatan (wajib bila menolak atau meminta revisi)
            </label>
            <textarea
              value={catatan}
              onChange={e => { setCatatan(e.target.value); setPesan(null); }}
              rows={3}
              className="w-full rounded-xl border border-daun/30 px-4 py-3 text-[14px] text-pekat placeholder:text-pekat/30 focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20"
              placeholder="Catatan untuk penulis…"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={menyimpan}
              onClick={() => tindak('disetujui')}
              className="flex items-center gap-2 rounded-full bg-daun px-5 py-2.5 text-[13px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" /> Setujui
            </button>
            <button
              type="button"
              disabled={menyimpan}
              onClick={() => tindak('revisi_diminta')}
              className="flex items-center gap-2 rounded-full border border-madu/40 bg-madu/10 px-5 py-2.5 text-[13px] font-bold text-madu transition hover:bg-madu/20 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" /> Minta Revisi
            </button>
            <button
              type="button"
              disabled={menyimpan}
              onClick={() => tindak('ditolak')}
              className="flex items-center gap-2 rounded-full border border-rekah/30 px-5 py-2.5 text-[13px] font-bold text-rekah transition hover:bg-rekah/8 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" /> Tolak
            </button>
          </div>
        </div>
      )}

      {/* Panel Terapkan — hanya untuk admin, saat konten sudah disetujui Fitri */}
      {bolehTerapkan && draf.status === 'disetujui' && (
        <div className="mb-6 rounded-2xl border border-daun/30 bg-daun/8 p-5">
          <div className="mb-2 flex items-center gap-2">
            <Rocket className="h-4 w-4 text-daun shrink-0" />
            <h2 className="font-bricolage text-[15px] font-bold text-daun">Siap Tayang</h2>
          </div>
          <p className="mb-4 text-[13px] text-pekat/70">
            Konten ini telah disetujui Psikolog Fitri. Klik tombol di bawah untuk menerapkannya
            ke database dan menampilkannya di dashboard pengguna.
          </p>
          <button
            type="button"
            disabled={menyimpan}
            onClick={terapkan}
            className="flex items-center gap-2 rounded-full bg-daun px-5 py-2.5 text-[13px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Rocket className="h-4 w-4" />
            {menyimpan ? 'Menerapkan...' : 'Terapkan ke Dashboard Pengguna'}
          </button>
        </div>
      )}

      {/* Sudah tayang */}
      {bolehTerapkan && draf.status === 'tayang' && (
        <div className="mb-6 rounded-2xl border border-daun/20 bg-daun/5 px-5 py-3.5">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-daun">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Konten ini sudah tayang di dashboard pengguna.
          </p>
        </div>
      )}

      {/* Riwayat */}
      {riwayat.length > 0 && (
        <div>
          <h2 className="mb-3 font-bricolage text-[15px] font-bold text-pekat">Riwayat Tinjauan</h2>
          <div className="divide-y divide-rekah/8 rounded-2xl border border-rekah/10 bg-white px-5">
            {riwayat.map(r => <RiwayatItem key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {showPreview && (() => {
        const previewCard = drafToCard(draf);
        return previewCard
          ? <PreviewBuku card={previewCard} onClose={() => setShowPreview(false)} />
          : null;
      })()}
    </div>
  );
}
