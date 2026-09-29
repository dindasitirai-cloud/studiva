// Editor perjalanan Temani (admin). Tiga mode:
//   /rekah-admin/temani/baru            → perjalanan baru (bisa diisi awal lewat location.state.isi)
//   /rekah-admin/temani/draf/:id        → lanjutkan draf yang ada
//   /rekah-admin/temani/revisi/:slug    → revisi perjalanan yang sedang tayang (versi tayang tetap
//                                          dilihat orang tua sampai revisi disetujui & diterapkan)
// Semua simpanan = draf di pipeline; tidak ada jalur tayang langsung.
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle, ArrowDown, ArrowLeft, ArrowUp, CheckCircle2, ChevronDown, ChevronUp, Copy, Plus, Save, Send, Trash2,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { NILAI } from '../../../features/akar-keluarga/content';
import { kebiasaanById } from '../../../features/temani/temaniSeed';
import {
  buatDrafTemani, perbaruiDrafTemani, muatSatuDrafTemani, muatDrafTemani, muatKatalogTemani,
  hariKosong, isiKosong, isiDariKatalog,
} from '../../../lib/supabase/temani';
import type { IsiTemani, IsiHariTemani, DrafTemani, JourneyKatalog } from '../../../lib/supabase/temani';
import { periksaKata, periksaKelengkapan } from '../../../features/temani/admin/temaniImport';
import PratinjauTemani from './PratinjauTemani';

const input = 'w-full rounded-xl border border-rekah/15 bg-white px-3.5 py-2.5 text-[14px] text-pekat placeholder:text-pekat/30 focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20 disabled:bg-pekat/5 disabled:text-pekat/50';

function Kolom({ label, bantuan, htmlFor, children }: { label: string; bantuan?: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[12px] font-bold text-pekat/70">{label}</span>
      {children}
      {bantuan && <span className="text-[12px] text-pekat/45">{bantuan}</span>}
    </label>
  );
}

export default function EditorTemani() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { peranStaf } = useAuth();
  const bolehEdit = peranStaf === 'admin';

  const [isi, setIsi] = useState<IsiTemani>(() => (location.state as { isi?: IsiTemani } | null)?.isi ?? isiKosong());
  const [catatan, setCatatan] = useState('');
  const [draf, setDraf] = useState<DrafTemani | null>(null);
  const [live, setLive] = useState<JourneyKatalog | null>(null);
  const [semuaLive, setSemuaLive] = useState<JourneyKatalog[]>([]);
  const [semuaDraf, setSemuaDraf] = useState<DrafTemani[]>([]);
  const [buka, setBuka] = useState(0);
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'galat'; teks: string } | null>(null);
  const [kataOke, setKataOke] = useState(false); // kata tertandai sudah diperiksa & dipakai dengan sengaja

  const mode: 'baru' | 'draf' | 'revisi' = id ? 'draf' : slug ? 'revisi' : 'baru';

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const [kat, drafs] = await Promise.all([muatKatalogTemani({ sertakanArsip: true }), muatDrafTemani()]);
        if (batal) return;
        setSemuaLive(kat ?? []);
        setSemuaDraf(drafs);
        if (mode === 'draf' && id) {
          const d = await muatSatuDrafTemani(id);
          if (batal) return;
          if (!d) { setPesan({ tipe: 'galat', teks: 'Draf tidak ditemukan.' }); return; }
          setDraf(d); setIsi(d.isi); setCatatan(d.catatan_penulis ?? '');
          if (d.id_konten_sumber) setLive((kat ?? []).find(j => j.slug === d.id_konten_sumber) ?? null);
        } else if (mode === 'revisi' && slug) {
          // Sudah ada revisi yang terbuka? Lanjutkan itu, jangan buat draf ganda.
          const terbuka = drafs.find(d => d.id_konten_sumber === slug && ['draf', 'diajukan', 'disetujui'].includes(d.status));
          if (terbuka) { navigate(`/rekah-admin/temani/draf/${terbuka.id}`, { replace: true }); return; }
          const j = (kat ?? []).find(x => x.slug === slug) ?? null;
          if (!j) { setPesan({ tipe: 'galat', teks: 'Perjalanan tayang tidak ditemukan.' }); return; }
          setLive(j);
          setIsi(isiDariKatalog(j));
        }
      } catch (e) {
        if (!batal) setPesan({ tipe: 'galat', teks: (e as Error).message ?? 'Gagal memuat data.' });
      } finally {
        if (!batal) setMemuat(false);
      }
    })();
    return () => { batal = true; };
  }, [id, slug, mode, navigate]);

  const bisaDiubah = bolehEdit && (!draf || ['draf', 'diajukan'].includes(draf.status));
  const slugTerkunci = !!live || mode === 'revisi' || !!draf?.id_konten_sumber;

  const kurang = useMemo(() => {
    const k = periksaKelengkapan(isi);
    if (!slugTerkunci) {
      const s = isi.slug.trim().toLowerCase();
      if (s && semuaLive.some(j => j.slug === s)) k.unshift('Slug sudah dipakai perjalanan yang tayang. Gunakan Edit pada perjalanan itu untuk merevisi.');
      if (s && semuaDraf.some(d => d.id !== draf?.id && d.status !== 'tayang' && d.isi.slug === s)) k.unshift('Slug sudah dipakai draf lain.');
    }
    return k;
  }, [isi, slugTerkunci, semuaLive, semuaDraf, draf]);
  const kata = useMemo(() => periksaKata(isi), [isi]);

  function atur<K extends keyof IsiTemani>(k: K, v: IsiTemani[K]) { setIsi(p => ({ ...p, [k]: v })); setPesan(null); }
  function aturHari<K extends keyof IsiHariTemani>(i: number, k: K, v: IsiHariTemani[K]) {
    setIsi(p => ({ ...p, hari: p.hari.map((h, j) => (j === i ? { ...h, [k]: v } : h)) }));
    setPesan(null);
  }
  function susunHari(daftar: IsiHariTemani[]) { return daftar.map((h, i) => ({ ...h, hari: i + 1 })); }
  function tambahHari() { setIsi(p => ({ ...p, hari: [...p.hari, hariKosong(p.hari.length + 1)] })); setBuka(isi.hari.length); }
  function hapusHari(i: number) { setIsi(p => ({ ...p, hari: susunHari(p.hari.filter((_, j) => j !== i)) })); setBuka(Math.max(0, i - 1)); }
  function duplikatHari(i: number) { setIsi(p => { const h = [...p.hari]; h.splice(i + 1, 0, { ...h[i] }); return { ...p, hari: susunHari(h) }; }); setBuka(i + 1); }
  function geserHari(i: number, arah: -1 | 1) {
    setIsi(p => { const h = [...p.hari]; const t = h[i]; h[i] = h[i + arah]; h[i + arah] = t; return { ...p, hari: susunHari(h) }; });
    setBuka(i + arah);
  }
  function toggleNilai(n: string) {
    atur('nilai_terkait', isi.nilai_terkait.includes(n) ? isi.nilai_terkait.filter(x => x !== n) : [...isi.nilai_terkait, n]);
  }

  async function simpan(ajukan: boolean) {
    const slugBersih = isi.slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slugBersih)) { setPesan({ tipe: 'galat', teks: 'Slug hanya boleh huruf kecil, angka, dan tanda-hubung.' }); return; }
    if (!isi.judul.trim()) { setPesan({ tipe: 'galat', teks: 'Judul wajib diisi.' }); return; }
    if (ajukan && kurang.length) { setPesan({ tipe: 'galat', teks: `Lengkapi dulu: ${kurang[0]}` }); return; }
    if (ajukan && kata.length && !kataOke) { setPesan({ tipe: 'galat', teks: 'Ada kata yang perlu ditinjau. Ubah kalimatnya, atau centang bahwa kata itu dipakai dengan sengaja.' }); return; }
    if (!slugTerkunci && kurang.some(k => k.startsWith('Slug sudah'))) { setPesan({ tipe: 'galat', teks: kurang[0] }); return; }
    setMenyimpan(true);
    try {
      if (draf) {
        await perbaruiDrafTemani(draf.id, isi, { catatan, ajukan });
        setDraf({ ...draf, status: ajukan ? 'diajukan' : 'draf', isi });
      } else {
        const baru = await buatDrafTemani(isi, { idSumber: live?.slug ?? null, catatan, ajukan });
        setDraf(baru);
        navigate(`/rekah-admin/temani/draf/${baru.id}`, { replace: true });
      }
      setPesan({ tipe: 'sukses', teks: ajukan ? 'Terkirim ke antrean tinjauan Psikolog Fitri.' : 'Draf tersimpan.' });
    } catch (e) {
      setPesan({ tipe: 'galat', teks: (e as Error).message ?? 'Gagal menyimpan.' });
    } finally {
      setMenyimpan(false);
    }
  }

  if (memuat) return <div className="flex h-48 items-center justify-center text-pekat/40">Memuat...</div>;

  const judulHalaman = mode === 'baru' ? 'Perjalanan baru' : live ? `Revisi · ${live.judul}` : 'Edit draf';

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <button type="button" onClick={() => navigate('/rekah-admin/temani')}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-semibold text-pekat/50 transition hover:text-rekah">
        <ArrowLeft className="h-4 w-4" /> Daftar Temani
      </button>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-bricolage text-[22px] font-extrabold text-pekat">{judulHalaman}</h1>
          <p className="mt-1 text-[13px] text-pekat/50">Semua perubahan disimpan sebagai draf dan baru tayang setelah disetujui peninjau.</p>
        </div>
        {bisaDiubah && (
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={menyimpan} onClick={() => simpan(false)}
              className="flex items-center gap-2 rounded-full border border-rekah/30 bg-white px-5 py-2.5 text-[13px] font-bold text-rekah transition hover:bg-rekah/5 disabled:opacity-50">
              <Save className="h-4 w-4" /> Simpan draf
            </button>
            <button type="button" disabled={menyimpan || kurang.length > 0 || (kata.length > 0 && !kataOke)} onClick={() => simpan(true)}
              className="flex items-center gap-2 rounded-full bg-rekah px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-rekah-tua disabled:opacity-40">
              <Send className="h-4 w-4" /> Simpan & ajukan
            </button>
          </div>
        )}
      </div>

      {pesan && (
        <div className={`mb-4 rounded-xl px-5 py-3.5 text-[13px] font-semibold ${pesan.tipe === 'sukses' ? 'bg-daun/15 text-daun' : 'bg-rekah/15 text-rekah-tua'}`}>
          {pesan.teks}
        </div>
      )}
      {live && (
        <div className="mb-4 rounded-xl bg-langit/15 px-5 py-3 text-[13px] text-pekat/80">
          Versi v{live.versi} sedang {live.status === 'tayang' ? 'tayang untuk orang tua' : 'diarsipkan'}. Revisi ini baru menggantikannya setelah disetujui dan diterapkan. Slug terkunci karena dipakai progres keluarga.
        </div>
      )}
      {draf?.status === 'diajukan' && bisaDiubah && (
        <div className="mb-4 rounded-xl bg-madu/15 px-5 py-3 text-[13px] text-pekat/80">
          Draf ini sedang di antrean tinjauan. Menyimpan tanpa mengajukan akan menariknya kembali menjadi draf.
        </div>
      )}
      {draf && !bisaDiubah && bolehEdit && (
        <div className="mb-4 rounded-xl bg-pekat/5 px-5 py-3 text-[13px] text-pekat/70">
          Draf berstatus “{draf.status}” tidak bisa diubah lagi. Gunakan Duplikat di daftar untuk membuat draf baru darinya.
        </div>
      )}
      {draf?.catatan_tinjauan && (
        <div className="mb-4 rounded-xl border border-madu/40 bg-madu/10 px-5 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-pekat/50">Catatan peninjau</p>
          <p className="mt-1 whitespace-pre-wrap text-[13px] text-pekat">{draf.catatan_tinjauan}</p>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          {/* Tentang perjalanan */}
          <section className="flex flex-col gap-4 rounded-2xl border border-rekah/10 bg-white p-5">
            <h2 className="font-bricolage text-[16px] font-bold text-pekat">Tentang perjalanan</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Kolom label="Judul" htmlFor="t-judul">
                <input id="t-judul" className={input} value={isi.judul} disabled={!bisaDiubah} onChange={e => atur('judul', e.target.value)} placeholder="7 Hari Membangun Kemandirian Kecil" />
              </Kolom>
              <Kolom label="Slug" htmlFor="t-slug" bantuan={slugTerkunci ? 'Terkunci setelah pernah tayang.' : 'Huruf kecil dan tanda-hubung, mis. tidur-tenang-5-hari'}>
                <input id="t-slug" className={`${input} font-mono`} value={isi.slug} disabled={!bisaDiubah || slugTerkunci} onChange={e => atur('slug', e.target.value.toLowerCase())} />
              </Kolom>
            </div>
            <Kolom label="Deskripsi" htmlFor="t-desk" bantuan="Satu kalimat: untuk keluarga yang sedang…">
              <textarea id="t-desk" rows={2} className={input} value={isi.deskripsi} disabled={!bisaDiubah} onChange={e => atur('deskripsi', e.target.value)} />
            </Kolom>
            <div>
              <p className="mb-2 text-[12px] font-bold text-pekat/70">Nilai yang ditumbuhkan</p>
              <div className="flex flex-wrap gap-2">
                {(NILAI as readonly string[]).map(n => (
                  <button key={n} type="button" disabled={!bisaDiubah} onClick={() => toggleNilai(n)}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition disabled:opacity-60 ${isi.nilai_terkait.includes(n) ? 'bg-rekah text-white' : 'border border-rekah/20 text-pekat/60 hover:border-rekah/50'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Kolom label="Usia minimal (bulan)" htmlFor="t-umin">
                <input id="t-umin" type="number" min={0} max={72} className={input} value={Number.isFinite(isi.usia_min_bulan) ? isi.usia_min_bulan : ''} disabled={!bisaDiubah} onChange={e => atur('usia_min_bulan', e.target.value === '' ? NaN : Number(e.target.value))} />
              </Kolom>
              <Kolom label="Usia maksimal (bulan)" htmlFor="t-umax">
                <input id="t-umax" type="number" min={0} max={72} className={input} value={Number.isFinite(isi.usia_max_bulan) ? isi.usia_max_bulan : ''} disabled={!bisaDiubah} onChange={e => atur('usia_max_bulan', e.target.value === '' ? NaN : Number(e.target.value))} />
              </Kolom>
              <Kolom label="Kebiasaan diadopsi di akhir" htmlFor="t-kbu" bantuan={isi.kebiasaan_utama ? (kebiasaanById(isi.kebiasaan_utama)?.judul ?? 'kb-id belum dikenali') : 'Opsional, mis. kb-030'}>
                <input id="t-kbu" className={`${input} font-mono`} value={isi.kebiasaan_utama} disabled={!bisaDiubah} onChange={e => atur('kebiasaan_utama', e.target.value.trim())} placeholder="kb-030" />
              </Kolom>
            </div>
          </section>

          {/* Hari */}
          <section className="flex flex-col gap-3 rounded-2xl border border-rekah/10 bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-bricolage text-[16px] font-bold text-pekat">Langkah per hari</h2>
              <span className="text-[12px] text-pekat/45">{isi.hari.length} hari · satu fokus kecil tiap hari</span>
            </div>
            {isi.hari.map((h, i) => {
              const terbuka = buka === i;
              const kb = h.jenis === 'target' ? kebiasaanById(h.kebiasaan_id) : undefined;
              return (
                <div key={i} className="rounded-xl border border-rekah/10">
                  <button type="button" onClick={() => setBuka(terbuka ? -1 : i)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <span className="w-14 shrink-0 font-bricolage text-[14px] font-bold text-pekat">Hari {h.hari}</span>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${h.jenis === 'target' ? 'bg-daun/15 text-daun' : 'bg-ungu/30 text-pekat/70'}`}>
                      {h.jenis === 'target' ? 'Target' : 'Perancah'}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-pekat/70">{h.fokus_hari || '(fokus belum diisi)'}</span>
                    {terbuka ? <ChevronUp className="h-4 w-4 text-pekat/40" /> : <ChevronDown className="h-4 w-4 text-pekat/40" />}
                  </button>
                  {terbuka && (
                    <div className="flex flex-col gap-4 border-t border-dashed border-rekah/15 px-4 py-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Kolom label="Jenis" htmlFor={`h-jn-${i}`} bantuan={h.jenis === 'target' ? 'Hari ini menunjuk satu Kebiasaan Baik.' : 'Langkah mengajar: jeda, amati, hargai, dampingi.'}>
                          <select id={`h-jn-${i}`} className={input} value={h.jenis} disabled={!bisaDiubah} onChange={e => aturHari(i, 'jenis', e.target.value as 'target' | 'perancah')}>
                            <option value="perancah">Perancah</option>
                            <option value="target">Target · Kebiasaan Baik</option>
                          </select>
                        </Kolom>
                        {h.jenis === 'target' && (
                          <Kolom label="kebiasaan_id" htmlFor={`h-kb-${i}`} bantuan={kb ? `→ ${kb.judul}` : 'kb-id belum dikenali di katalog Kebiasaan Baik'}>
                            <input id={`h-kb-${i}`} className={`${input} font-mono`} value={h.kebiasaan_id} disabled={!bisaDiubah} onChange={e => aturHari(i, 'kebiasaan_id', e.target.value.trim())} placeholder="kb-030" />
                          </Kolom>
                        )}
                      </div>
                      <Kolom label="Fokus hari ini" htmlFor={`h-fk-${i}`}>
                        <textarea id={`h-fk-${i}`} rows={2} className={input} value={h.fokus_hari} disabled={!bisaDiubah} onChange={e => aturHari(i, 'fokus_hari', e.target.value)} />
                      </Kolom>
                      <Kolom label="Contoh kalimat" htmlFor={`h-sc-${i}`}>
                        <textarea id={`h-sc-${i}`} rows={2} className={input} value={h.script} disabled={!bisaDiubah} onChange={e => aturHari(i, 'script', e.target.value)} />
                      </Kolom>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Kolom label="Kenapa? · sederhana" htmlFor={`h-ks-${i}`} bantuan="Selalu tampil ke orang tua.">
                          <textarea id={`h-ks-${i}`} rows={3} className={input} value={h.kenapa_sederhana} disabled={!bisaDiubah} onChange={e => aturHari(i, 'kenapa_sederhana', e.target.value)} />
                        </Kolom>
                        <Kolom label="Kenapa? · lebih dalam" htmlFor={`h-ke-${i}`} bantuan="Tampil sebagai draf sampai ditinjau.">
                          <textarea id={`h-ke-${i}`} rows={3} className={input} value={h.kenapa_evidence} disabled={!bisaDiubah} onChange={e => aturHari(i, 'kenapa_evidence', e.target.value)} />
                        </Kolom>
                      </div>
                      <Kolom label="Sumber" htmlFor={`h-su-${i}`} bantuan="Kosongkan bila belum ada. Kosong = lapisan sumber tidak ditampilkan.">
                        <input id={`h-su-${i}`} className={input} value={h.kenapa_sumber} disabled={!bisaDiubah} onChange={e => aturHari(i, 'kenapa_sumber', e.target.value)} />
                      </Kolom>
                      <Kolom label="Yang diamati" htmlFor={`h-dm-${i}`}>
                        <textarea id={`h-dm-${i}`} rows={2} className={input} value={h.yang_diamati} disabled={!bisaDiubah} onChange={e => aturHari(i, 'yang_diamati', e.target.value)} />
                      </Kolom>
                      {bisaDiubah && (
                        <div className="flex flex-wrap gap-2">
                          <button type="button" disabled={i === 0} onClick={() => geserHari(i, -1)} className="flex items-center gap-1 rounded-full border border-rekah/20 px-3 py-1.5 text-[12px] font-semibold text-pekat/70 disabled:opacity-40"><ArrowUp className="h-3.5 w-3.5" /> Naikkan</button>
                          <button type="button" disabled={i === isi.hari.length - 1} onClick={() => geserHari(i, 1)} className="flex items-center gap-1 rounded-full border border-rekah/20 px-3 py-1.5 text-[12px] font-semibold text-pekat/70 disabled:opacity-40"><ArrowDown className="h-3.5 w-3.5" /> Turunkan</button>
                          <button type="button" onClick={() => duplikatHari(i)} className="flex items-center gap-1 rounded-full border border-rekah/20 px-3 py-1.5 text-[12px] font-semibold text-pekat/70"><Copy className="h-3.5 w-3.5" /> Duplikat hari</button>
                          <button type="button" disabled={isi.hari.length === 1} onClick={() => hapusHari(i)} className="flex items-center gap-1 rounded-full border border-rekah/30 px-3 py-1.5 text-[12px] font-semibold text-rekah disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /> Hapus hari</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {bisaDiubah && isi.hari.length < 30 && (
              <button type="button" onClick={tambahHari} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-rekah/30 py-3 text-[13px] font-bold text-rekah hover:bg-rekah/5">
                <Plus className="h-4 w-4" /> Tambah hari
              </button>
            )}
          </section>

          {bisaDiubah && (
            <section className="rounded-2xl border border-rekah/10 bg-white p-5">
              <Kolom label="Catatan untuk peninjau (opsional)" htmlFor="t-cat">
                <textarea id="t-cat" rows={2} className={input} value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Mis. Hari 3 & 4 diubah mengikuti masukan sebelumnya." />
              </Kolom>
            </section>
          )}
        </div>

        {/* Panel samping */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          {kurang.length ? (
            <div className="rounded-xl bg-madu/15 px-4 py-3 text-[13px] text-pekat/80">
              <p className="mb-1 font-bold text-pekat">Belum lengkap untuk diajukan</p>
              <ul className="list-disc space-y-0.5 pl-4">{kurang.slice(0, 8).map(k => <li key={k}>{k}</li>)}</ul>
              {kurang.length > 8 && <p className="mt-1 text-pekat/50">+{kurang.length - 8} lainnya</p>}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-daun/15 px-4 py-3 text-[13px] font-semibold text-daun">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Lengkap, siap diajukan.
            </div>
          )}
          {kata.length > 0 && (
            <div className="rounded-xl border border-rekah/30 bg-rekah/5 px-4 py-3 text-[13px] text-pekat/80">
              <p className="mb-1 flex items-center gap-1.5 font-bold text-rekah-tua"><AlertTriangle className="h-4 w-4" /> Kata yang perlu ditinjau</p>
              <ul className="list-disc space-y-0.5 pl-4">{kata.map(k => <li key={k}>{k}</li>)}</ul>
              <p className="mt-1.5 text-[12px] text-pekat/55">Rekah menghindari bahasa yang menilai, membandingkan, atau terdengar seperti diagnosis.</p>
              {bisaDiubah && (
                <label htmlFor="t-kata-oke" className="mt-2 flex items-start gap-2 text-[12px] font-semibold text-pekat/70">
                  <input id="t-kata-oke" type="checkbox" className="mt-0.5" checked={kataOke} onChange={e => setKataOke(e.target.checked)} />
                  Sudah saya periksa — kata ini dipakai dengan sengaja (mis. “bukan tanda anak nakal”). Peninjau tetap melihat tandanya.
                </label>
              )}
            </div>
          )}
          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Pratinjau orang tua</p>
            <PratinjauTemani isi={isi} indeks={buka < 0 ? 0 : buka} onPilih={setBuka} />
          </div>
        </aside>
      </div>
    </div>
  );
}
