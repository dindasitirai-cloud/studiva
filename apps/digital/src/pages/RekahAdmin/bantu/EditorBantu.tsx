// Editor situasi Bantu (admin). Mode:
//   /rekah-admin/bantu/baru          → situasi baru (bisa diisi awal lewat location.state.isi)
//   /rekah-admin/bantu/draf/:id      → lanjutkan draf
//   /rekah-admin/bantu/revisi/:slug  → revisi situasi yang tayang (versi tayang tetap dipakai
//                                      sampai revisi disetujui & diterapkan)
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowDown, ArrowLeft, ArrowUp, CheckCircle2, Plus, Save, Send, ShieldAlert, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  buatDrafBantu, perbaruiDrafBantu, muatSatuDrafBantu, muatDrafBantu, muatKatalogBantu,
  isiBantuKosong, isiDariSituasi, LABEL_KATEGORI,
} from '../../../lib/supabase/bantu';
import { labelUsia } from '../../../features/irama-hari/kebiasaanSeed';
import type { IsiBantu, DrafBantu, SituasiKatalog, KategoriBantu, ClarifyBantu } from '../../../lib/supabase/bantu';
import {
  periksaKelengkapanBantu, periksaKataBantu, catatanKeselamatan, MAKS_LANGKAH, MAKS_CLARIFY,
} from '../../../features/bantu/admin/bantuImport';
import { OPSI_MEMICU_B5 } from '../../../features/bantu/bantuSeed';
import PratinjauBantu from './PratinjauBantu';

const input = 'w-full rounded-xl border border-rekah/15 bg-white px-3.5 py-2.5 text-[14px] text-pekat placeholder:text-pekat/30 focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20 disabled:bg-pekat/5 disabled:text-pekat/50';
const btnKecil = 'inline-flex items-center gap-1 rounded-full border border-rekah/20 px-3 py-1.5 text-[12px] font-semibold text-pekat/70 disabled:opacity-40';

function Kolom({ label, bantuan, htmlFor, children }: { label: string; bantuan?: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[12px] font-bold text-pekat/70">{label}</span>
      {children}
      {bantuan && <span className="text-[12px] text-pekat/45">{bantuan}</span>}
    </label>
  );
}

export default function EditorBantu() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { peranStaf } = useAuth();
  const bolehEdit = peranStaf === 'admin';
  const mode: 'baru' | 'draf' | 'revisi' = id ? 'draf' : slug ? 'revisi' : 'baru';

  const [isi, setIsi] = useState<IsiBantu>(() => (location.state as { isi?: IsiBantu } | null)?.isi ?? isiBantuKosong());
  const [catatan, setCatatan] = useState('');
  const [draf, setDraf] = useState<DrafBantu | null>(null);
  const [live, setLive] = useState<SituasiKatalog | null>(null);
  const [semuaLive, setSemuaLive] = useState<SituasiKatalog[]>([]);
  const [semuaDraf, setSemuaDraf] = useState<DrafBantu[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'galat'; teks: string } | null>(null);
  const [kataOke, setKataOke] = useState(false); // kata tertandai sudah diperiksa & dipakai dengan sengaja

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const [kat, drafs] = await Promise.all([muatKatalogBantu({ sertakanArsip: true }), muatDrafBantu()]);
        if (batal) return;
        setSemuaLive(kat ?? []); setSemuaDraf(drafs);
        if (mode === 'draf' && id) {
          const d = await muatSatuDrafBantu(id);
          if (batal) return;
          if (!d) { setPesan({ tipe: 'galat', teks: 'Draf tidak ditemukan.' }); return; }
          setDraf(d); setIsi(d.isi); setCatatan(d.catatan_penulis ?? '');
          if (d.id_konten_sumber) setLive((kat ?? []).find(s => s.slug === d.id_konten_sumber) ?? null);
        } else if (mode === 'revisi' && slug) {
          const terbuka = drafs.find(d => d.id_konten_sumber === slug && ['draf', 'diajukan', 'disetujui'].includes(d.status));
          if (terbuka) { navigate(`/rekah-admin/bantu/draf/${terbuka.id}`, { replace: true }); return; }
          const s = (kat ?? []).find(x => x.slug === slug) ?? null;
          if (!s) { setPesan({ tipe: 'galat', teks: 'Situasi tayang tidak ditemukan.' }); return; }
          setLive(s); setIsi(isiDariSituasi(s));
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
    const k = periksaKelengkapanBantu(isi);
    if (!slugTerkunci && isi.slug) {
      if (semuaLive.some(s => s.slug === isi.slug)) k.unshift('Slug sudah dipakai situasi yang tayang. Gunakan Edit pada situasi itu untuk merevisi.');
      if (semuaDraf.some(d => d.id !== draf?.id && d.status !== 'tayang' && d.isi.slug === isi.slug)) k.unshift('Slug sudah dipakai draf lain.');
    }
    return k;
  }, [isi, slugTerkunci, semuaLive, semuaDraf, draf]);
  const kata = useMemo(() => periksaKataBantu(isi), [isi]);
  const catatanAman = useMemo(() => catatanKeselamatan(isi), [isi]);

  function atur<K extends keyof IsiBantu>(k: K, v: IsiBantu[K]) { setIsi(p => ({ ...p, [k]: v })); setPesan(null); }
  function aturLangkah(i: number, v: string) { atur('langkah', isi.langkah.map((l, j) => (j === i ? v : l))); }
  function geserLangkah(i: number, arah: -1 | 1) { const l = [...isi.langkah]; [l[i], l[i + arah]] = [l[i + arah], l[i]]; atur('langkah', l); }
  function aturClarify(i: number, c: Partial<ClarifyBantu>) { atur('clarify', isi.clarify.map((x, j) => (j === i ? { ...x, ...c } : x))); }
  function aturOpsi(i: number, teks: string) {
    const opsi = teks.split(';').map(s => s.trim());
    const bersih = opsi.filter(Boolean);
    aturClarify(i, { opsi, opsi_keselamatan: isi.clarify[i].opsi_keselamatan.filter(o => bersih.includes(o)) });
  }
  function toggleKeselamatan(i: number, o: string) {
    const c = isi.clarify[i];
    aturClarify(i, { opsi_keselamatan: c.opsi_keselamatan.includes(o) ? c.opsi_keselamatan.filter(x => x !== o) : [...c.opsi_keselamatan, o] });
  }

  async function simpan(ajukan: boolean) {
    const s = isi.slug.trim().toLowerCase();
    if (!/^[a-z0-9]+([_-][a-z0-9]+)*$/.test(s)) { setPesan({ tipe: 'galat', teks: 'Slug hanya boleh huruf kecil, angka, garis bawah, dan tanda-hubung.' }); return; }
    if (!isi.label.trim()) { setPesan({ tipe: 'galat', teks: 'Label wajib diisi.' }); return; }
    if (kurang.some(k => k.startsWith('Slug sudah'))) { setPesan({ tipe: 'galat', teks: kurang[0] }); return; }
    if (ajukan && kurang.length) { setPesan({ tipe: 'galat', teks: `Lengkapi dulu: ${kurang[0]}` }); return; }
    if (ajukan && kata.length && !kataOke) { setPesan({ tipe: 'galat', teks: 'Ada kata yang perlu ditinjau. Ubah kalimatnya, atau centang bahwa kata itu dipakai dengan sengaja.' }); return; }
    setMenyimpan(true);
    try {
      if (draf) {
        await perbaruiDrafBantu(draf.id, isi, { catatan, ajukan });
        setDraf({ ...draf, status: ajukan ? 'diajukan' : 'draf', isi });
      } else {
        const baru = await buatDrafBantu(isi, { idSumber: live?.slug ?? null, catatan, ajukan });
        setDraf(baru);
        navigate(`/rekah-admin/bantu/draf/${baru.id}`, { replace: true });
      }
      setPesan({ tipe: 'sukses', teks: ajukan ? 'Terkirim ke antrean tinjauan Psikolog Fitri.' : 'Draf tersimpan.' });
    } catch (e) {
      setPesan({ tipe: 'galat', teks: (e as Error).message ?? 'Gagal menyimpan.' });
    } finally {
      setMenyimpan(false);
    }
  }

  if (memuat) return <div className="flex h-48 items-center justify-center text-pekat/40">Memuat...</div>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <button type="button" onClick={() => navigate('/rekah-admin/bantu')} className="mb-5 flex items-center gap-1.5 text-[13px] font-semibold text-pekat/50 transition hover:text-rekah">
        <ArrowLeft className="h-4 w-4" /> Daftar Bantu
      </button>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-bricolage text-[22px] font-extrabold text-pekat">{mode === 'baru' ? 'Situasi baru' : live ? `Revisi · ${live.label}` : 'Edit draf'}</h1>
          <p className="mt-1 text-[13px] text-pekat/50">Satu situasi = pertanyaan singkat (opsional) + satu respons: validasi, 2–4 langkah, yang diamati.</p>
        </div>
        {bisaDiubah && (
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={menyimpan} onClick={() => simpan(false)} className="flex items-center gap-2 rounded-full border border-rekah/30 bg-white px-5 py-2.5 text-[13px] font-bold text-rekah hover:bg-rekah/5 disabled:opacity-50">
              <Save className="h-4 w-4" /> Simpan draf
            </button>
            <button type="button" disabled={menyimpan || kurang.length > 0 || (kata.length > 0 && !kataOke)} onClick={() => simpan(true)} className="flex items-center gap-2 rounded-full bg-rekah px-5 py-2.5 text-[13px] font-bold text-white hover:bg-rekah-tua disabled:opacity-40">
              <Send className="h-4 w-4" /> Simpan & ajukan
            </button>
          </div>
        )}
      </div>

      {pesan && <div className={`mb-4 rounded-xl px-5 py-3.5 text-[13px] font-semibold ${pesan.tipe === 'sukses' ? 'bg-daun/15 text-daun' : 'bg-rekah/15 text-rekah-tua'}`}>{pesan.teks}</div>}
      {live && (
        <div className="mb-4 rounded-xl bg-langit/15 px-5 py-3 text-[13px] text-pekat/80">
          Versi v{live.versi} sedang {live.status === 'tayang' ? 'dipakai orang tua' : 'diarsipkan'}. Revisi ini baru menggantikannya setelah disetujui dan diterapkan. Slug terkunci karena dipakai panduan tersimpan keluarga.
        </div>
      )}
      {draf?.status === 'diajukan' && bisaDiubah && (
        <div className="mb-4 rounded-xl bg-madu/15 px-5 py-3 text-[13px] text-pekat/80">Draf ini sedang di antrean tinjauan. Menyimpan tanpa mengajukan akan menariknya kembali menjadi draf.</div>
      )}
      {draf && !bisaDiubah && bolehEdit && (
        <div className="mb-4 rounded-xl bg-pekat/5 px-5 py-3 text-[13px] text-pekat/70">Draf berstatus “{draf.status}” tidak bisa diubah lagi. Gunakan Duplikat di daftar untuk membuat draf baru darinya.</div>
      )}
      {draf?.catatan_tinjauan && (
        <div className="mb-4 rounded-xl border border-madu/40 bg-madu/10 px-5 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-pekat/50">Catatan peninjau</p>
          <p className="mt-1 whitespace-pre-wrap text-[13px] text-pekat">{draf.catatan_tinjauan}</p>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <section className="flex flex-col gap-4 rounded-2xl border border-rekah/10 bg-white p-5">
            <h2 className="font-bricolage text-[16px] font-bold text-pekat">Tentang situasi</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Kolom label="Label (tampil di kartu)" htmlFor="b-label">
                <input id="b-label" className={input} value={isi.label} disabled={!bisaDiubah} onChange={e => atur('label', e.target.value)} placeholder="Anak tantrum" />
              </Kolom>
              <Kolom label="Slug" htmlFor="b-slug" bantuan={slugTerkunci ? 'Terkunci setelah pernah tayang.' : 'Huruf kecil, mis. sulit_tidur'}>
                <input id="b-slug" className={`${input} font-mono`} value={isi.slug} disabled={!bisaDiubah || slugTerkunci} onChange={e => atur('slug', e.target.value.toLowerCase())} />
              </Kolom>
            </div>
            <Kolom label="Ringkasan satu baris" htmlFor="b-ringkas" bantuan="Deskriptor di bawah label kartu.">
              <input id="b-ringkas" className={input} value={isi.ringkas} disabled={!bisaDiubah} onChange={e => atur('ringkas', e.target.value)} placeholder="Ledakan emosi, sulit menenangkan" />
            </Kolom>
            <div className="grid gap-4 sm:grid-cols-3">
              <Kolom label="Kategori" htmlFor="b-kat">
                <select id="b-kat" className={input} value={isi.kategori} disabled={!bisaDiubah} onChange={e => atur('kategori', e.target.value as KategoriBantu)}>
                  {(Object.keys(LABEL_KATEGORI) as KategoriBantu[]).map(k => <option key={k} value={k}>{LABEL_KATEGORI[k]}</option>)}
                </select>
              </Kolom>
              <Kolom label="Urutan tampil" htmlFor="b-urut" bantuan="Angka kecil tampil lebih dulu.">
                <input id="b-urut" type="number" className={input} value={isi.urutan} disabled={!bisaDiubah} onChange={e => atur('urutan', Number(e.target.value))} />
              </Kolom>
              <Kolom label="Usia anak dari (bulan)" htmlFor="b-umin" bantuan="0 = sejak lahir.">
                <input id="b-umin" type="number" min={0} max={71} className={input} value={isi.usia_min_bulan} disabled={!bisaDiubah} onChange={e => atur('usia_min_bulan', Number(e.target.value))} />
              </Kolom>
              <Kolom label="Sampai (bulan)" htmlFor="b-umax" bantuan={`71 = sampai 6 tahun. Tampil untuk: ${labelUsia(isi.usia_min_bulan, isi.usia_max_bulan)}.`}>
                <input id="b-umax" type="number" min={0} max={71} className={input} value={isi.usia_max_bulan} disabled={!bisaDiubah} onChange={e => atur('usia_max_bulan', Number(e.target.value))} />
              </Kolom>
              <label htmlFor="b-sensitif" className="flex items-start gap-2 pt-6 text-[13px] text-pekat/80">
                <input id="b-sensitif" type="checkbox" className="mt-0.5" checked={isi.sensitif_keselamatan} disabled={!bisaDiubah} onChange={e => atur('sensitif_keselamatan', e.target.checked)} />
                <span><b className="text-pekat">Sensitif keselamatan</b><br /><span className="text-[12px] text-pekat/55">Situasi yang bisa menyangkut cedera atau bahaya.</span></span>
              </label>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-rekah/10 bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-bricolage text-[16px] font-bold text-pekat">Pertanyaan singkat (opsional)</h2>
              <span className="text-[12px] text-pekat/45">Maksimal {MAKS_CLARIFY}. Orang tua selalu bisa melewatinya.</span>
            </div>
            {isi.clarify.length === 0 && <p className="text-[13px] text-pekat/50">Tanpa pertanyaan, orang tua langsung melihat saran.</p>}
            {isi.clarify.map((c, i) => {
              const opsiBersih = c.opsi.filter(Boolean);
              return (
                <div key={i} className="flex flex-col gap-3 rounded-xl border border-rekah/10 p-4">
                  <Kolom label={`Pertanyaan ${i + 1}`} htmlFor={`b-q-${i}`}>
                    <input id={`b-q-${i}`} className={input} value={c.pertanyaan} disabled={!bisaDiubah} onChange={e => aturClarify(i, { pertanyaan: e.target.value })} placeholder="Biasanya sebelum tantrum ada pemicunya?" />
                  </Kolom>
                  <Kolom label="Pilihan jawaban" htmlFor={`b-o-${i}`} bantuan="Pisahkan dengan titik koma (;).">
                    <input id={`b-o-${i}`} className={input} value={c.opsi.join('; ')} disabled={!bisaDiubah} onChange={e => aturOpsi(i, e.target.value)} placeholder="Lapar/lelah; Transisi; Tidak dituruti; Tidak yakin" />
                  </Kolom>
                  {opsiBersih.length > 0 && (
                    <div>
                      <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-pekat/70"><ShieldAlert className="h-3.5 w-3.5 text-rekah" /> Pilihan yang langsung membuka layar keselamatan</p>
                      <div className="flex flex-wrap gap-2">
                        {opsiBersih.map(o => {
                          const global = OPSI_MEMICU_B5.includes(o);
                          const aktif = global || c.opsi_keselamatan.includes(o);
                          return (
                            <button key={o} type="button" disabled={!bisaDiubah || global} onClick={() => toggleKeselamatan(i, o)}
                              title={global ? 'Sudah otomatis membuka layar keselamatan (daftar pengaman di kode)' : ''}
                              className={`rounded-full px-3 py-1 text-[12px] font-semibold transition disabled:cursor-not-allowed ${aktif ? 'bg-rekah text-white' : 'border border-rekah/20 text-pekat/60'}`}>
                              {o}{global ? ' · otomatis' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {bisaDiubah && (
                    <button type="button" onClick={() => atur('clarify', isi.clarify.filter((_, j) => j !== i))} className={`${btnKecil} self-start text-rekah`}>
                      <Trash2 className="h-3.5 w-3.5" /> Hapus pertanyaan
                    </button>
                  )}
                </div>
              );
            })}
            {bisaDiubah && isi.clarify.length < MAKS_CLARIFY && (
              <button type="button" onClick={() => atur('clarify', [...isi.clarify, { pertanyaan: '', opsi: [], opsi_keselamatan: [] }])}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-rekah/30 py-2.5 text-[13px] font-bold text-rekah hover:bg-rekah/5">
                <Plus className="h-4 w-4" /> Tambah pertanyaan
              </button>
            )}
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-rekah/10 bg-white p-5">
            <h2 className="font-bricolage text-[16px] font-bold text-pekat">Respons</h2>
            <Kolom label="Validasi" htmlFor="b-val" bantuan="Kalimat pembuka yang menenangkan, tanpa menilai orang tua atau anak.">
              <textarea id="b-val" rows={3} className={input} value={isi.validasi} disabled={!bisaDiubah} onChange={e => atur('validasi', e.target.value)} />
            </Kolom>
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-pekat/70">Langkah (idealnya 2–4)</span>
              {isi.langkah.map((l, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-2.5 w-5 shrink-0 text-right font-bricolage text-[14px] font-bold text-rekah">{i + 1}</span>
                  <textarea id={`b-l-${i}`} aria-label={`Langkah ${i + 1}`} rows={2} className={input} value={l} disabled={!bisaDiubah} onChange={e => aturLangkah(i, e.target.value)} />
                  {bisaDiubah && (
                    <div className="flex shrink-0 flex-col gap-1">
                      <button type="button" aria-label="Naikkan" disabled={i === 0} onClick={() => geserLangkah(i, -1)} className="rounded-lg border border-rekah/15 p-1 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                      <button type="button" aria-label="Turunkan" disabled={i === isi.langkah.length - 1} onClick={() => geserLangkah(i, 1)} className="rounded-lg border border-rekah/15 p-1 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                      <button type="button" aria-label="Hapus langkah" disabled={isi.langkah.length <= 1} onClick={() => atur('langkah', isi.langkah.filter((_, j) => j !== i))} className="rounded-lg border border-rekah/15 p-1 text-rekah disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </div>
              ))}
              {bisaDiubah && isi.langkah.length < MAKS_LANGKAH && (
                <button type="button" onClick={() => atur('langkah', [...isi.langkah, ''])} className={`${btnKecil} self-start`}><Plus className="h-3.5 w-3.5" /> Tambah langkah</button>
              )}
            </div>
            <Kolom label="Yang bisa diamati" htmlFor="b-diam">
              <textarea id="b-diam" rows={2} className={input} value={isi.yang_diamati} disabled={!bisaDiubah} onChange={e => atur('yang_diamati', e.target.value)} />
            </Kolom>
            <Kolom label="Kenapa? · sederhana" htmlFor="b-ken">
              <textarea id="b-ken" rows={2} className={input} value={isi.kenapa_sederhana} disabled={!bisaDiubah} onChange={e => atur('kenapa_sederhana', e.target.value)} />
            </Kolom>
            <Kolom label="Sumber" htmlFor="b-sum" bantuan="Kosongkan bila belum ada. Kosong = tidak ada klaim ilmiah yang ditampilkan.">
              <input id="b-sum" className={input} value={isi.kenapa_sumber} disabled={!bisaDiubah} onChange={e => atur('kenapa_sumber', e.target.value)} />
            </Kolom>
          </section>

          {bisaDiubah && (
            <section className="rounded-2xl border border-rekah/10 bg-white p-5">
              <Kolom label="Catatan untuk peninjau (opsional)" htmlFor="b-cat">
                <textarea id="b-cat" rows={2} className={input} value={catatan} onChange={e => setCatatan(e.target.value)} />
              </Kolom>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          {kurang.length ? (
            <div className="rounded-xl bg-madu/15 px-4 py-3 text-[13px] text-pekat/80">
              <p className="mb-1 font-bold text-pekat">Belum lengkap untuk diajukan</p>
              <ul className="list-disc space-y-0.5 pl-4">{kurang.map(k => <li key={k}>{k}</li>)}</ul>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-daun/15 px-4 py-3 text-[13px] font-semibold text-daun"><CheckCircle2 className="h-4 w-4 shrink-0" /> Lengkap, siap diajukan.</div>
          )}
          {kata.length > 0 && (
            <div className="rounded-xl border border-rekah/30 bg-rekah/5 px-4 py-3 text-[13px] text-pekat/80">
              <p className="mb-1 flex items-center gap-1.5 font-bold text-rekah-tua"><AlertTriangle className="h-4 w-4" /> Kata yang perlu ditinjau</p>
              <ul className="list-disc space-y-0.5 pl-4">{kata.map(k => <li key={k}>{k}</li>)}</ul>
              {bisaDiubah && (
                <label htmlFor="b-kata-oke" className="mt-2 flex items-start gap-2 text-[12px] font-semibold text-pekat/70">
                  <input id="b-kata-oke" type="checkbox" className="mt-0.5" checked={kataOke} onChange={e => setKataOke(e.target.checked)} />
                  Sudah saya periksa — kata ini dipakai dengan sengaja (mis. “bukan tanda anak nakal”). Peninjau tetap melihat tandanya.
                </label>
              )}
            </div>
          )}
          {catatanAman.length > 0 && (
            <div className="rounded-xl bg-langit/15 px-4 py-3 text-[13px] text-pekat/80">
              <p className="mb-1 font-bold text-pekat">Untuk diperhatikan</p>
              <ul className="list-disc space-y-0.5 pl-4">{catatanAman.map(k => <li key={k}>{k}</li>)}</ul>
            </div>
          )}
          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Pratinjau orang tua</p>
            <PratinjauBantu isi={isi} />
          </div>
        </aside>
      </div>
    </div>
  );
}
