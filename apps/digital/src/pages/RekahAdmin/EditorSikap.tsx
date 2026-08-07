import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Send, Save, ArrowLeft, ChevronDown, Plus, Pencil } from 'lucide-react';
import {
  NILAI, NilaiAkar, MATERI, PENJELASAN_NILAI, MateriItem,
} from '../../features/akar-keluarga/content';
import { buatDraf, buatDanAjukan } from '../../lib/supabase/pipeline';
import { pindaiKata } from '../../lib/pemindaiKata';

// Band index → fase (1-5)
const BAND_TO_FASE = [1, 1, 1, 1, 2, 2, 3, 4, 5, 5] as const;

const LABEL_FASE: Record<number, string> = {
  1: 'Fase 1 · 0–12 bulan',
  2: 'Fase 2 · 12–24 bulan',
  3: 'Fase 3 · 2–3 tahun',
  4: 'Fase 4 · 3–4 tahun',
  5: 'Fase 5 · 4–6 tahun',
};

function getItemsForNilaiFase(nilaiTarget: string, fase: number): MateriItem[] {
  const result: MateriItem[] = [];
  MATERI.forEach((band, bandIdx) => {
    if (BAND_TO_FASE[bandIdx] !== fase) return;
    band.forEach(item => {
      if (item.nilai.includes(nilaiTarget)) result.push(item);
    });
  });
  return result;
}

interface FormSikap {
  judul: string;
  deskripsi: string;
  nilai: NilaiAkar[];
  fase_mulai: number;
  fase_selesai: number;
  catatan_penulis: string;
}

const KOSONG: FormSikap = {
  judul: '', deskripsi: '', nilai: [],
  fase_mulai: 1, fase_selesai: 1, catatan_penulis: '',
};

type Tab = 'daftar' | 'baru';

export default function EditorSikap() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('daftar');
  const [expandedNilai, setExpandedNilai] = useState<string | null>(null);
  const [form, setForm] = useState<FormSikap>(KOSONG);
  const [galat, setGalat] = useState('');
  const [menyimpan, setMenyimpan] = useState(false);
  const [sukses, setSukses] = useState('');

  function atur<K extends keyof FormSikap>(k: K, v: FormSikap[K]) {
    setForm(f => ({ ...f, [k]: v }));
    setGalat('');
    setSukses('');
  }

  function toggleNilai(n: NilaiAkar) {
    atur('nilai', form.nilai.includes(n)
      ? form.nilai.filter(x => x !== n)
      : [...form.nilai, n]);
  }

  function validasi(): string | null {
    if (!form.judul.trim()) return 'Judul wajib diisi.';
    if (!form.deskripsi.trim()) return 'Deskripsi wajib diisi.';
    if (form.nilai.length === 0) return 'Pilih minimal satu nilai Akar Keluarga.';
    if (form.fase_selesai < form.fase_mulai) return 'Fase selesai harus ≥ fase mulai.';
    return null;
  }

  const kataBemasalah = [
    ...pindaiKata(form.judul),
    ...pindaiKata(form.deskripsi),
  ];

  function bukaEditorDariMateri(item: MateriItem, nilaiItem: NilaiAkar, fase: number) {
    setForm({
      judul: item.judul,
      deskripsi: item.deskripsi,
      nilai: (item.nilai as string[]).includes(nilaiItem)
        ? (item.nilai as NilaiAkar[])
        : [...(item.nilai as NilaiAkar[]), nilaiItem],
      fase_mulai: fase,
      fase_selesai: fase,
      catatan_penulis: '',
    });
    setGalat('');
    setSukses('');
    setTab('baru');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bukaEditorBaru(nilaiItem: NilaiAkar, fase: number) {
    setForm({ ...KOSONG, nilai: [nilaiItem], fase_mulai: fase, fase_selesai: fase });
    setGalat('');
    setSukses('');
    setTab('baru');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function simpanDraf() {
    const err = validasi();
    if (err) { setGalat(err); return; }
    setMenyimpan(true);
    try {
      await buatDraf({
        jenis: 'sikap',
        judul: form.judul.trim(),
        isi: {
          judul:        form.judul.trim(),
          deskripsi:    form.deskripsi.trim(),
          nilai:        form.nilai,
          fase_mulai:   form.fase_mulai,
          fase_selesai: form.fase_selesai,
        },
        catatan_penulis: form.catatan_penulis.trim() || undefined,
      });
      setSukses('Draf disimpan. Ajukan bila sudah siap untuk ditinjau Fitri.');
    } catch (e) {
      setGalat((e as Error).message ?? 'Gagal menyimpan draf.');
    } finally {
      setMenyimpan(false);
    }
  }

  async function ajukan() {
    const err = validasi();
    if (err) { setGalat(err); return; }
    if (kataBemasalah.length > 0) {
      setGalat('Konten mengandung kata yang perlu ditinjau. Perbaiki sebelum mengajukan.');
      return;
    }
    setMenyimpan(true);
    try {
      await buatDanAjukan({
        jenis: 'sikap',
        judul: form.judul.trim(),
        isi: {
          judul:        form.judul.trim(),
          deskripsi:    form.deskripsi.trim(),
          nilai:        form.nilai,
          fase_mulai:   form.fase_mulai,
          fase_selesai: form.fase_selesai,
        },
        catatan_penulis: form.catatan_penulis.trim() || undefined,
      });
      setSukses('Konten berhasil diajukan untuk tinjauan Fitri.');
      setForm(KOSONG);
    } catch (e) {
      setGalat((e as Error).message ?? 'Gagal mengajukan konten.');
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <button
        type="button"
        onClick={() => navigate('/rekah-admin')}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-semibold text-pekat/50 transition hover:text-rekah"
      >
        <ArrowLeft className="h-4 w-4" /> Beranda Admin
      </button>

      <h1 className="mb-1 font-bricolage text-[22px] font-extrabold text-pekat">
        Kebiasaan Baik
      </h1>
      <p className="mb-5 text-[13px] text-pekat/50">
        12 nilai Akar Keluarga × 5 fase. Semua konten melewati tinjauan Fitri sebelum tayang.
      </p>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-rekah/10 pb-0">
        {([['daftar', 'Daftar Sumber'], ['baru', 'Ajukan Baru']] as const).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-t-xl px-5 py-2.5 text-[13px] font-semibold transition ${
              tab === t
                ? 'border-b-2 border-rekah bg-rekah/5 text-rekah'
                : 'text-pekat/50 hover:text-pekat'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Daftar ───────────────────────────────────────────────────── */}
      {tab === 'daftar' && (
        <div>
          <p className="mb-4 text-[12px] text-pekat/40">
            Klik "Edit &amp; Ajukan" pada item yang ingin direvisi, atau "+ Tambah" untuk membuat kebiasaan baru pada nilai dan fase tertentu.
          </p>

          {NILAI.map(nilai => {
            const penjelasan = PENJELASAN_NILAI[nilai];
            const isExpanded = expandedNilai === nilai;

            // Count items across all fase for this nilai
            const totalItems = [1,2,3,4,5].reduce((sum, fase) =>
              sum + getItemsForNilaiFase(nilai, fase).length, 0);

            return (
              <div key={nilai} className="mb-2 overflow-hidden rounded-2xl border border-rekah/10 bg-white">
                <button
                  type="button"
                  onClick={() => setExpandedNilai(isExpanded ? null : nilai)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-rekah/3"
                >
                  <div className="min-w-0">
                    <span className="font-bricolage text-[15px] font-bold text-pekat">{nilai}</span>
                    <span className="ml-2 text-[12px] text-pekat/40 italic">{penjelasan.tagline}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-rekah/10 px-2 py-0.5 text-[11px] font-bold text-rekah">
                      {totalItems} item
                    </span>
                    <ChevronDown className={`h-4 w-4 text-pekat/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-rekah/8 px-5 pb-5">
                    {/* Penjelasan nilai */}
                    <div className="my-4 rounded-xl bg-fajar px-4 py-3">
                      <p className="mb-1 text-[12px] text-pekat/60">{penjelasan.deskripsi}</p>
                      <p className="text-[11px] font-semibold text-rekah-tua">
                        Cara rawat: {penjelasan.caraRawat}
                      </p>
                    </div>

                    {/* 5 fase sections */}
                    {([1, 2, 3, 4, 5] as const).map(fase => {
                      const items = getItemsForNilaiFase(nilai, fase);
                      return (
                        <div key={fase} className="mb-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-pekat/35">
                              {LABEL_FASE[fase]}
                            </span>
                            <button
                              type="button"
                              onClick={() => bukaEditorBaru(nilai, fase)}
                              className="flex items-center gap-1 rounded-full bg-rekah/10 px-2.5 py-1 text-[11px] font-semibold text-rekah transition hover:bg-rekah/20"
                            >
                              <Plus className="h-3 w-3" /> Tambah
                            </button>
                          </div>

                          {items.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-rekah/15 px-3 py-2.5 text-[12px] italic text-pekat/30">
                              Belum ada kebiasaan untuk nilai ini di fase ini.
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              {items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start justify-between gap-3 rounded-xl border border-rekah/8 px-3 py-2.5"
                                >
                                  <div className="min-w-0">
                                    <p className="text-[13px] font-semibold text-pekat">{item.judul}</p>
                                    <p className="text-[12px] text-pekat/50">{item.deskripsi}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => bukaEditorDariMateri(item, nilai, fase)}
                                    className="flex shrink-0 items-center gap-1 rounded-full border border-rekah/30 px-2.5 py-1 text-[11px] font-semibold text-rekah transition hover:bg-rekah/10"
                                  >
                                    <Pencil className="h-3 w-3" /> Edit &amp; Ajukan
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab Ajukan Baru ──────────────────────────────────────────────── */}
      {tab === 'baru' && (
        <div>
          {/* Pemindai kata */}
          {kataBemasalah.length > 0 && (
            <div className="mb-5 rounded-xl border border-rekah/30 bg-rekah/8 px-5 py-4">
              <div className="flex items-center gap-2 text-rekah">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="text-[13px] font-bold">
                  Kata yang perlu ditinjau ({kataBemasalah.length})
                </span>
              </div>
              {kataBemasalah.map((t, i) => (
                <p key={i} className="mt-1 font-mono text-[12px] text-pekat/70">
                  "…{t.potongan}…"
                </p>
              ))}
            </div>
          )}

          {galat && (
            <div className="mb-5 rounded-xl bg-rekah/10 px-4 py-3 text-[13px] font-semibold text-rekah">
              {galat}
            </div>
          )}
          {sukses && (
            <div className="mb-5 rounded-xl bg-daun/15 px-4 py-3 text-[13px] font-semibold text-daun">
              {sukses}
            </div>
          )}

          <div className="flex flex-col gap-5 rounded-2xl border border-rekah/10 bg-white p-6">
            {/* Judul */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-pekat">Judul *</label>
              <input
                value={form.judul}
                onChange={e => atur('judul', e.target.value)}
                placeholder="cth: Berbagi mainan dengan teman"
                className="w-full rounded-xl border border-daun/30 px-4 py-3 text-[14px] text-pekat placeholder:text-pekat/30 focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-pekat">Deskripsi *</label>
              <textarea
                value={form.deskripsi}
                onChange={e => atur('deskripsi', e.target.value)}
                rows={4}
                placeholder="Jelaskan perilaku, konteks, dan cara mendorong kebiasaan ini…"
                className="w-full rounded-xl border border-daun/30 px-4 py-3 text-[14px] text-pekat placeholder:text-pekat/30 focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20"
              />
            </div>

            {/* Nilai Akar */}
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-pekat">
                Nilai Akar Keluarga *
              </label>
              <div className="flex flex-wrap gap-2">
                {NILAI.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleNilai(n)}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
                      form.nilai.includes(n)
                        ? 'bg-rekah text-white'
                        : 'border border-rekah/30 text-pekat/60 hover:border-rekah/60'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Rentang fase */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-[13px] font-semibold text-pekat">Fase Mulai *</label>
                <select
                  value={form.fase_mulai}
                  onChange={e => atur('fase_mulai', Number(e.target.value))}
                  className="w-full rounded-xl border border-daun/30 px-3 py-3 text-[14px] text-pekat focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20"
                >
                  {[1,2,3,4,5].map(f => <option key={f} value={f}>{LABEL_FASE[f]}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1.5 block text-[13px] font-semibold text-pekat">Fase Selesai *</label>
                <select
                  value={form.fase_selesai}
                  onChange={e => atur('fase_selesai', Number(e.target.value))}
                  className="w-full rounded-xl border border-daun/30 px-3 py-3 text-[14px] text-pekat focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20"
                >
                  {[1,2,3,4,5].filter(f => f >= form.fase_mulai).map(f => (
                    <option key={f} value={f}>{LABEL_FASE[f]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catatan penulis */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-pekat">
                Catatan untuk Fitri{' '}
                <span className="font-normal text-pekat/40">(opsional)</span>
              </label>
              <textarea
                value={form.catatan_penulis}
                onChange={e => atur('catatan_penulis', e.target.value)}
                rows={2}
                placeholder="Konteks tambahan, referensi sumber, atau hal yang perlu diperhatikan…"
                className="w-full rounded-xl border border-daun/30 px-4 py-3 text-[14px] text-pekat placeholder:text-pekat/30 focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20"
              />
            </div>

            {/* Tombol aksi */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rekah/8 pt-4">
              <button
                type="button"
                onClick={() => { setForm(KOSONG); setGalat(''); setSukses(''); }}
                className="text-[12px] font-semibold text-pekat/40 hover:text-pekat transition"
              >
                Kosongkan form
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={simpanDraf}
                  disabled={menyimpan}
                  className="flex items-center gap-2 rounded-full border border-pekat/20 bg-white px-5 py-2.5 text-[13px] font-semibold text-pekat/70 transition hover:border-pekat/40 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> Simpan Draf
                </button>
                <button
                  type="button"
                  onClick={ajukan}
                  disabled={menyimpan || kataBemasalah.length > 0}
                  className="flex items-center gap-2 rounded-full bg-rekah px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_3px_12px_rgba(224,82,107,0.25)] transition hover:bg-rekah-tua disabled:opacity-50"
                >
                  <Send className="h-4 w-4" /> Ajukan Tinjauan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
