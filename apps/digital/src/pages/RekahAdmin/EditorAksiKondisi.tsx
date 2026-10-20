import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Send, Save, ArrowLeft } from 'lucide-react';
import { buatDraf, buatDanAjukan } from '../../lib/supabase/pipeline';
import { pindaiKata } from '../../lib/pemindaiKata';
import { HeroAdmin } from './tema/temaAdmin';

// Phase 28c/28d — Editor "Aksi per Kondisi" (teks/aksi yang muncul dari kondisi anak/caregiver/rumah).
// Logika pemicu tetap di kode; admin hanya mengisi TEKS untuk 'kunci' yang dikenali kode.
// Draf → pipeline konten_draf (jenis 'aksi_kondisi') → tinjauan Fitri → Terapkan (RPC 033).

interface Pilihan { v: string; label: string }
interface DomainSpec { v: string; label: string; pakaiMeta: boolean; kunci: Pilihan[] }

const DOMAINS: DomainSpec[] = [
  { v: 'persiapan_rumah', label: 'Persiapan rumah per tahap', pakaiMeta: true, kunci: [
    { v: 'bayi_diam', label: 'Bayi, belum berpindah (0–6 bln)' },
    { v: 'merangkak', label: 'Mulai merangkak & berdiri (6–12 bln)' },
    { v: 'jalan', label: 'Berjalan & menjelajah (1–3 th)' },
    { v: 'prasekolah', label: 'Memanjat & lebih mandiri (3–6 th)' },
  ] },
  { v: 'langkah_hari_ini', label: 'Satu langkah hari ini', pakaiMeta: false, kunci: [
    { v: 'tidur', label: 'Tidur belum stabil' },
    { v: 'energi_caregiver', label: 'Energi pengasuh terbatas' },
    { v: 'kembali_kerja', label: 'Kembali bekerja' },
    { v: 'kurang_nyaman', label: 'Anak kurang nyaman' },
    { v: 'transisi', label: 'Perpindahan aktivitas sulit' },
    { v: 'perubahan_ritme', label: 'Ritme keluarga berubah' },
  ] },
  { v: 'panduan_toilet', label: 'Panduan toilet training', pakaiMeta: false, kunci: [
    { v: 'prasyarat', label: 'Prasyarat (belum waktunya)' },
    { v: 'pengenalan', label: 'Pengenalan' },
    { v: 'latihan_aktif', label: 'Latihan aktif' },
    { v: 'kemandirian', label: 'Kemandirian' },
  ] },
  { v: 'panduan_layar', label: 'Panduan waktu layar', pakaiMeta: false, kunci: [
    { v: '0_23_bln', label: '0–23 bulan' },
    { v: '24_59_bln', label: '2–<5 tahun (24–59 bln)' },
    { v: '60_72_bln', label: '5–6 tahun' },
  ] },
  { v: 'panduan_saudara', label: 'Panduan saudara (adik)', pakaiMeta: false, kunci: [
    { v: 'menanti-adik', label: 'Akan punya adik' },
    { v: 'punya-adik', label: 'Punya adik' },
    { v: 'kembar', label: 'Kembar' },
  ] },
];
const KATEGORI: Pilihan[] = [
  { v: 'keamanan', label: 'Keamanan' }, { v: 'penataan', label: 'Penataan' }, { v: 'logistik', label: 'Logistik' },
];

interface FormAksi {
  domain: string; kunci: string; judul: string; detail: string;
  kategori: string; esensial: boolean; khasIndonesia: boolean; urutan: number; catatan_penulis: string;
}
const awal = (domain: DomainSpec): FormAksi => ({
  domain: domain.v, kunci: domain.kunci[0].v, judul: '', detail: '',
  kategori: 'keamanan', esensial: true, khasIndonesia: false, urutan: 0, catatan_penulis: '',
});

const inp = 'w-full rounded-xl border border-daun/30 px-4 py-3 text-[14px] text-pekat placeholder:text-pekat/30 focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20';

export default function EditorAksiKondisi() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormAksi>(awal(DOMAINS[0]));
  const [galat, setGalat] = useState('');
  const [sukses, setSukses] = useState('');
  const [menyimpan, setMenyimpan] = useState(false);

  const spec = DOMAINS.find(d => d.v === form.domain) ?? DOMAINS[0];

  function atur<K extends keyof FormAksi>(k: K, v: FormAksi[K]) {
    setForm(f => ({ ...f, [k]: v })); setGalat(''); setSukses('');
  }
  function gantiDomain(v: string) {
    const d = DOMAINS.find(x => x.v === v) ?? DOMAINS[0];
    setForm(awal(d)); setGalat(''); setSukses('');
  }

  const kataBermasalah = [...pindaiKata(form.judul), ...pindaiKata(form.detail)];

  function validasi(): string | null {
    if (!form.domain || !form.kunci) return 'Pilih domain & kunci.';
    if (!form.judul.trim()) return 'Judul wajib diisi.';
    return null;
  }

  function isi() {
    return {
      domain: form.domain,
      kunci: form.kunci,
      judul: form.judul.trim(),
      detail: form.detail.trim() || undefined,
      meta: spec.pakaiMeta ? { kategori: form.kategori, esensial: form.esensial, khasIndonesia: form.khasIndonesia } : {},
      urutan: form.urutan,
    };
  }

  async function simpanDraf() {
    const err = validasi(); if (err) { setGalat(err); return; }
    setMenyimpan(true);
    try {
      await buatDraf({ jenis: 'aksi_kondisi', judul: form.judul.trim(), isi: isi(), catatan_penulis: form.catatan_penulis.trim() || undefined });
      setSukses('Draf disimpan. Ajukan bila sudah siap untuk ditinjau Fitri.');
    } catch (e) { setGalat((e as Error).message ?? 'Gagal menyimpan draf.'); }
    finally { setMenyimpan(false); }
  }
  async function ajukan() {
    const err = validasi(); if (err) { setGalat(err); return; }
    if (kataBermasalah.length > 0) { setGalat('Konten mengandung kata yang perlu ditinjau. Perbaiki sebelum mengajukan.'); return; }
    setMenyimpan(true);
    try {
      await buatDanAjukan({ jenis: 'aksi_kondisi', judul: form.judul.trim(), isi: isi(), catatan_penulis: form.catatan_penulis.trim() || undefined });
      setSukses('Konten berhasil diajukan untuk tinjauan Fitri.');
      setForm(awal(spec));
    } catch (e) { setGalat((e as Error).message ?? 'Gagal mengajukan konten.'); }
    finally { setMenyimpan(false); }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <button type="button" onClick={() => navigate('/rekah-admin')} className="mb-5 flex items-center gap-1.5 text-[13px] font-semibold text-pekat/50 transition hover:text-rekah">
        <ArrowLeft className="h-4 w-4" /> Beranda Admin
      </button>

      <HeroAdmin
        tema="tracker"
        eyebrow="Aksi & Panduan per Kondisi"
        judul="Teks yang muncul dari kondisi keluarga"
        deskripsi="Tambah atau ubah teks yang Rekah tampilkan saat kondisi tertentu muncul (persiapan rumah, satu langkah hari ini, panduan toilet/layar/saudara). Pemicunya diatur sistem; kamu mengisi teksnya. Semua melewati tinjauan Psikolog Fitri sebelum tayang."
      />

      {kataBermasalah.length > 0 && (
        <div className="mb-5 rounded-xl border border-rekah/30 bg-rekah/8 px-5 py-4">
          <div className="flex items-center gap-2 text-rekah"><AlertTriangle className="h-4 w-4 shrink-0" /><span className="text-[13px] font-bold">Kata yang perlu ditinjau ({kataBermasalah.length})</span></div>
          {kataBermasalah.map((t, i) => <p key={i} className="mt-1 font-mono text-[12px] text-pekat/70">"…{t.potongan}…"</p>)}
        </div>
      )}
      {galat && <div className="mb-5 rounded-xl bg-rekah/10 px-4 py-3 text-[13px] font-semibold text-rekah">{galat}</div>}
      {sukses && <div className="mb-5 rounded-xl bg-daun/15 px-4 py-3 text-[13px] font-semibold text-daun">{sukses}</div>}

      <div className="flex flex-col gap-5 rounded-2xl border border-rekah/10 bg-white p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-[13px] font-semibold text-pekat">Domain *</label>
            <select value={form.domain} onChange={e => gantiDomain(e.target.value)} className={inp}>
              {DOMAINS.map(d => <option key={d.v} value={d.v}>{d.label}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-[13px] font-semibold text-pekat">Kunci (pemicu) *</label>
            <select value={form.kunci} onChange={e => atur('kunci', e.target.value)} className={inp}>
              {spec.kunci.map(k => <option key={k.v} value={k.v}>{k.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-pekat">Judul *</label>
          <input value={form.judul} onChange={e => atur('judul', e.target.value)} placeholder="cth: Jangkar lemari, rak & TV ke dinding" className={inp} />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-pekat">Detail <span className="font-normal text-pekat/40">(opsional)</span></label>
          <textarea value={form.detail} onChange={e => atur('detail', e.target.value)} rows={2} placeholder="Penjelasan singkat bila perlu…" className={inp} />
        </div>

        {spec.pakaiMeta && (
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[160px]">
              <label className="mb-1.5 block text-[13px] font-semibold text-pekat">Kategori</label>
              <select value={form.kategori} onChange={e => atur('kategori', e.target.value)} className={inp}>
                {KATEGORI.map(k => <option key={k.v} value={k.v}>{k.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pb-1">
              {([['esensial', 'Esensial'], ['khasIndonesia', 'Khas Indonesia']] as const).map(([key, label]) => (
                <button key={key} type="button" onClick={() => atur(key, !form[key])}
                  className={`rounded-full px-3 py-2 text-[12px] font-semibold transition ${form[key] ? 'bg-rekah text-white' : 'border border-rekah/30 text-pekat/60 hover:border-rekah/60'}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="w-24">
              <label className="mb-1.5 block text-[13px] font-semibold text-pekat">Urutan</label>
              <input type="number" value={form.urutan} onChange={e => atur('urutan', Number(e.target.value))} className={inp} />
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-pekat">Catatan untuk Fitri <span className="font-normal text-pekat/40">(opsional)</span></label>
          <textarea value={form.catatan_penulis} onChange={e => atur('catatan_penulis', e.target.value)} rows={2} placeholder="Konteks tambahan atau sumber…" className={inp} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rekah/8 pt-4">
          <button type="button" onClick={() => setForm(awal(spec))} className="text-[12px] font-semibold text-pekat/40 hover:text-pekat transition">Kosongkan form</button>
          <div className="flex gap-2">
            <button type="button" onClick={simpanDraf} disabled={menyimpan} className="flex items-center gap-2 rounded-full border border-pekat/20 bg-white px-5 py-2.5 text-[13px] font-semibold text-pekat/70 transition hover:border-pekat/40 disabled:opacity-50"><Save className="h-4 w-4" /> Simpan Draf</button>
            <button type="button" onClick={ajukan} disabled={menyimpan || kataBermasalah.length > 0} className="flex items-center gap-2 rounded-full bg-rekah px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_3px_12px_rgba(224,82,107,0.25)] transition hover:bg-rekah-tua disabled:opacity-50"><Send className="h-4 w-4" /> Ajukan Tinjauan</button>
          </div>
        </div>
      </div>
    </div>
  );
}
