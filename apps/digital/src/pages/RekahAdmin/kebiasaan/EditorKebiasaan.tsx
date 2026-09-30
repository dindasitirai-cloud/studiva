// Editor Kebiasaan Baik (admin). Mode:
//   /rekah-admin/sikap/baru          → kebiasaan baru (bisa diisi awal lewat location.state.isi)
//   /rekah-admin/sikap/draf/:id      → lanjutkan draf
//   /rekah-admin/sikap/revisi/:kid   → revisi kebiasaan yang tayang (versi tayang tetap dipakai
//                                      sampai revisi disetujui & diterapkan)
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, Repeat, Save, Send, Zap } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { NILAI } from '../../../features/akar-keluarga/content';
import type { NilaiAkar } from '../../../features/akar-keluarga/content';
import {
  buatDrafKebiasaan, perbaruiDrafKebiasaan, muatSatuDrafKebiasaan, muatDrafKebiasaan, muatKatalogKebiasaan, muatTemplateIrama,
  isiKebiasaanKosong, isiDariKebiasaan, idKebiasaanBerikutnya,
} from '../../../lib/supabase/kebiasaan';
import type { IsiKebiasaan, DrafKebiasaan, KebiasaanTayang } from '../../../lib/supabase/kebiasaan';
import { BAND_USIA, USIA_MAKS, TEMPLATE_SEED, LABEL_WAKTU } from '../../../features/irama-hari/kebiasaanSeed';
import type { TemplateIrama, Waktu, KategoriKebiasaan } from '../../../features/irama-hari/kebiasaanSeed';
import { periksaKelengkapanKeb, periksaKataKeb, POLA_ID } from '../../../features/irama-hari/admin/kebiasaanImport';
import { TEMA, BungaNilai } from '../tema/temaAdmin';
import PratinjauKebiasaan from './PratinjauKebiasaan';
import TautanSumber from '../../../components/TautanSumber';
import { sumberUntuk } from '../../../features/irama-hari/kebiasaanSeed';

const T = TEMA.sikap;
const input = 'w-full rounded-xl border border-rekah/15 bg-white px-3.5 py-2.5 text-[14px] text-pekat placeholder:text-pekat/30 focus:border-[color:var(--ra-aksen)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ra-tint)] disabled:bg-pekat/5 disabled:text-pekat/50';
const SARAN_KAPAN = ['saat anak kesal', 'saat rewel', 'saat bermain dengan teman', 'saat perlu menunggu', 'saat ada tamu', 'saat di luar rumah', 'sepekan sekali'];

function Kolom({ label, bantuan, htmlFor, children }: { label: string; bantuan?: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[12px] font-bold text-pekat/70">{label}</span>
      {children}
      {bantuan && <span className="text-[12px] text-pekat/45">{bantuan}</span>}
    </label>
  );
}

export default function EditorKebiasaan() {
  const { id, kid } = useParams<{ id?: string; kid?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { peranStaf } = useAuth();
  const bolehEdit = peranStaf === 'admin';
  const mode: 'baru' | 'draf' | 'revisi' = id ? 'draf' : kid ? 'revisi' : 'baru';

  const [isi, setIsi] = useState<IsiKebiasaan>(() => (location.state as { isi?: IsiKebiasaan } | null)?.isi ?? isiKebiasaanKosong());
  const [catatan, setCatatan] = useState('');
  const [draf, setDraf] = useState<DrafKebiasaan | null>(null);
  const [live, setLive] = useState<KebiasaanTayang | null>(null);
  const [semuaLive, setSemuaLive] = useState<KebiasaanTayang[]>([]);
  const [semuaDraf, setSemuaDraf] = useState<DrafKebiasaan[]>([]);
  const [templates, setTemplates] = useState<TemplateIrama[]>(TEMPLATE_SEED);
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'galat'; teks: string } | null>(null);
  const [kataOke, setKataOke] = useState(false);

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const [kat, drafs, tpl] = await Promise.all([muatKatalogKebiasaan({ sertakanArsip: true }), muatDrafKebiasaan(), muatTemplateIrama()]);
        if (batal) return;
        setSemuaLive(kat ?? []); setSemuaDraf(drafs); if (tpl && tpl.length) setTemplates(tpl);
        if (mode === 'draf' && id) {
          const d = await muatSatuDrafKebiasaan(id);
          if (batal) return;
          if (!d) { setPesan({ tipe: 'galat', teks: 'Draf tidak ditemukan.' }); return; }
          setDraf(d); setIsi(d.isi); setCatatan(d.catatan_penulis ?? '');
          if (d.id_konten_sumber) setLive((kat ?? []).find(s => s.id === d.id_konten_sumber) ?? null);
        } else if (mode === 'revisi' && kid) {
          const terbuka = drafs.find(d => d.id_konten_sumber === kid && ['draf', 'diajukan', 'disetujui'].includes(d.status));
          if (terbuka) { navigate(`/rekah-admin/sikap/draf/${terbuka.id}`, { replace: true }); return; }
          const s = (kat ?? []).find(x => x.id === kid) ?? null;
          if (!s) { setPesan({ tipe: 'galat', teks: 'Kebiasaan tayang tidak ditemukan.' }); return; }
          setLive(s); { const isiLive = isiDariKebiasaan(s); setIsi({ ...isiLive, sumber: isiLive.sumber || sumberUntuk(isiLive.id) }); }
        } else if (!(location.state as { isi?: IsiKebiasaan } | null)?.isi) {
          setIsi(p => ({ ...p, id: idKebiasaanBerikutnya([...(kat ?? []).map(k => k.id), ...drafs.map(d => d.isi.id)]) }));
        }
      } catch (e) {
        if (!batal) setPesan({ tipe: 'galat', teks: (e as Error).message ?? 'Gagal memuat data.' });
      } finally {
        if (!batal) setMemuat(false);
      }
    })();
    return () => { batal = true; };
  }, [id, kid, mode, navigate, location.state]);

  const bisaDiubah = bolehEdit && (!draf || ['draf', 'diajukan'].includes(draf.status));
  const idTerkunci = !!live || mode === 'revisi' || !!draf?.id_konten_sumber;
  const kunciTemplate = useMemo(() => templates.map(t => t.key), [templates]);

  const kurang = useMemo(() => {
    const k = periksaKelengkapanKeb(isi, kunciTemplate);
    if (!idTerkunci && isi.id) {
      if (semuaLive.some(s => s.id === isi.id)) k.unshift('ID sudah dipakai kebiasaan yang tayang. Gunakan Edit pada kebiasaan itu untuk merevisi.');
      if (semuaDraf.some(d => d.id !== draf?.id && d.status !== 'tayang' && d.isi.id === isi.id)) k.unshift('ID sudah dipakai draf lain.');
    }
    return k;
  }, [isi, kunciTemplate, idTerkunci, semuaLive, semuaDraf, draf]);
  const kata = useMemo(() => periksaKataKeb(isi), [isi]);

  function atur<K extends keyof IsiKebiasaan>(k: K, v: IsiKebiasaan[K]) { setIsi(p => ({ ...p, [k]: v })); setPesan(null); }
  function aturKategori(k: KategoriKebiasaan) {
    setIsi(p => ({ ...p, kategori: k, template_key: k === 'rutin' ? (p.template_key ?? templates[0]?.key ?? null) : null, kapan: k === 'situasional' ? (p.kapan ?? '') : null }));
  }
  function toggleNilai(n: NilaiAkar) {
    atur('nilai', isi.nilai.includes(n) ? isi.nilai.filter(x => x !== n) : isi.nilai.length >= 3 ? isi.nilai : [...isi.nilai, n]);
  }

  async function simpan(ajukan: boolean) {
    if (!POLA_ID.test(isi.id)) { setPesan({ tipe: 'galat', teks: 'ID hanya boleh huruf kecil, angka, dan tanda-hubung (mis. kb-058).' }); return; }
    if (!isi.judul.trim()) { setPesan({ tipe: 'galat', teks: 'Judul wajib diisi.' }); return; }
    if (kurang.some(k => k.startsWith('ID sudah'))) { setPesan({ tipe: 'galat', teks: kurang[0] }); return; }
    if (ajukan && kurang.length) { setPesan({ tipe: 'galat', teks: `Lengkapi dulu: ${kurang[0]}` }); return; }
    if (ajukan && kata.length && !kataOke) { setPesan({ tipe: 'galat', teks: 'Ada kata yang perlu ditinjau. Ubah kalimatnya, atau centang bahwa kata itu dipakai dengan sengaja.' }); return; }
    setMenyimpan(true);
    try {
      if (draf) {
        await perbaruiDrafKebiasaan(draf.id, isi, { catatan, ajukan });
        setDraf({ ...draf, status: ajukan ? 'diajukan' : 'draf', isi });
      } else {
        const baru = await buatDrafKebiasaan(isi, { idSumber: live?.id ?? null, catatan, ajukan });
        setDraf(baru);
        navigate(`/rekah-admin/sikap/draf/${baru.id}`, { replace: true });
      }
      setPesan({ tipe: 'sukses', teks: ajukan ? 'Terkirim ke antrean tinjauan Psikolog Fitri.' : 'Draf tersimpan.' });
    } catch (e) {
      setPesan({ tipe: 'galat', teks: (e as Error).message ?? 'Gagal menyimpan.' });
    } finally {
      setMenyimpan(false);
    }
  }

  if (memuat) return <div className="flex h-48 items-center justify-center text-pekat/40">Memuat...</div>;

  const bandAktif = BAND_USIA.findIndex(b => b.min === isi.usia_min_bulan && b.max === isi.usia_max_bulan);
  const semuaUsia = isi.usia_min_bulan === 0 && isi.usia_max_bulan === USIA_MAKS;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <button type="button" onClick={() => navigate('/rekah-admin/sikap')} className="mb-5 flex items-center gap-1.5 text-[13px] font-semibold text-pekat/50 transition hover:text-[color:var(--ra-teks)]">
        <ArrowLeft className="h-4 w-4" /> Daftar Kebiasaan Baik
      </button>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-bricolage text-[24px] font-extrabold text-pekat">{mode === 'baru' ? 'Kebiasaan baru' : live ? `Revisi · ${live.judul}` : 'Edit draf'}</h1>
          <p className="mt-1 text-[13px] text-pekat/50">Satu kebiasaan kecil yang bisa dilakukan keluarga — rutin di satu kegiatan harian, atau situasional saat momennya datang.</p>
        </div>
        {bisaDiubah && (
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={menyimpan} onClick={() => simpan(false)} className="flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-[13px] font-bold disabled:opacity-50" style={{ borderColor: `${T.aksen}88`, color: T.teks }}>
              <Save className="h-4 w-4" /> Simpan draf
            </button>
            <button type="button" disabled={menyimpan || kurang.length > 0 || (kata.length > 0 && !kataOke)} onClick={() => simpan(true)} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-white disabled:opacity-40" style={{ background: T.teks }}>
              <Send className="h-4 w-4" /> Simpan & ajukan
            </button>
          </div>
        )}
      </div>

      {pesan && <div className={`mb-4 rounded-xl px-5 py-3.5 text-[13px] font-semibold ${pesan.tipe === 'sukses' ? 'bg-daun/15 text-daun' : 'bg-rekah/15 text-rekah-tua'}`}>{pesan.teks}</div>}
      {live && (
        <div className="mb-4 rounded-xl bg-langit/15 px-5 py-3 text-[13px] text-pekat/80">
          Versi v{live.versi} sedang {live.status === 'tayang' ? 'dipakai orang tua' : 'diarsipkan'}. Revisi ini baru menggantikannya setelah disetujui dan diterapkan. ID terkunci agar centang yang sudah tercatat tetap cocok.
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
          <section className="flex flex-col gap-3 rounded-2xl border border-rekah/10 bg-white p-5">
            <h2 className="font-bricolage text-[16px] font-bold text-pekat">Kategori</h2>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Kategori kebiasaan">
              {([
                ['rutin', Repeat, 'Rutin', 'Menempel di satu kegiatan Irama Hari, mis. “Sikat gigi sendiri” di Rutinitas sebelum tidur.'],
                ['situasional', Zap, 'Situasional', 'Muncul kapan saja saat momennya datang, mis. “Menamai emosi” saat anak kesal.'],
              ] as const).map(([k, Icon, j, d]) => {
                const aktif = isi.kategori === k;
                return (
                  <button key={k} type="button" role="radio" aria-checked={aktif} disabled={!bisaDiubah} onClick={() => aturKategori(k)}
                    className="flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition disabled:cursor-not-allowed"
                    style={{ borderColor: aktif ? T.aksen : 'rgba(240,107,168,0.12)', background: aktif ? T.tint : '#fff' }}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: aktif ? T.teks : T.tint, color: aktif ? '#fff' : T.teks }}><Icon className="h-[18px] w-[18px]" /></span>
                    <span><b className="block font-bricolage text-[15px] text-pekat">{j}</b><span className="text-[12.5px] leading-snug text-pekat/60">{d}</span></span>
                  </button>
                );
              })}
            </div>
            {isi.kategori === 'rutin' ? (
              <Kolom label="Menempel di kegiatan" htmlFor="k-tpl" bantuan="Kegiatan bisa ditambah atau diubah di tab “Kegiatan template”.">
                <select id="k-tpl" className={input} value={isi.template_key ?? ''} disabled={!bisaDiubah} onChange={e => atur('template_key', e.target.value || null)}>
                  <option value="">Pilih kegiatan…</option>
                  {(['pagi', 'siang', 'malam'] as Waktu[]).map(w => (
                    <optgroup key={w} label={LABEL_WAKTU[w]}>
                      {templates.filter(t => t.waktu === w).sort((a, b) => a.urutan - b.urutan).map(t => (
                        <option key={t.key} value={t.key}>{t.nama}{t.jam ? ` · ${t.jam}` : ''}{t.aktif ? '' : ' (disembunyikan)'}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Kolom>
            ) : (
              <Kolom label="Kapan momennya?" htmlFor="k-kapan" bantuan="Ditampilkan kecil di bawah judul. Mulai dengan “saat …”.">
                <input id="k-kapan" className={input} value={isi.kapan ?? ''} disabled={!bisaDiubah} onChange={e => atur('kapan', e.target.value)} placeholder="saat anak kesal" list="k-kapan-saran" maxLength={60} />
                <datalist id="k-kapan-saran">{SARAN_KAPAN.map(s => <option key={s} value={s} />)}</datalist>
              </Kolom>
            )}
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-rekah/10 bg-white p-5">
            <h2 className="font-bricolage text-[16px] font-bold text-pekat">Isi kebiasaan</h2>
            <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
              <Kolom label="Judul (tampil di papan)" htmlFor="k-judul" bantuan={`${isi.judul.length}/90 · kalimat ajakan singkat.`}>
                <input id="k-judul" className={input} value={isi.judul} disabled={!bisaDiubah} maxLength={90} onChange={e => atur('judul', e.target.value)} placeholder="Rapikan mainan bersama" />
              </Kolom>
              <Kolom label="ID" htmlFor="k-id" bantuan={idTerkunci ? 'Terkunci.' : 'Otomatis, bisa diubah.'}>
                <input id="k-id" className={`${input} font-mono`} value={isi.id} disabled={!bisaDiubah || idTerkunci} onChange={e => atur('id', e.target.value.toLowerCase())} />
              </Kolom>
            </div>
            <Kolom label="Deskripsi singkat" htmlFor="k-desk" bantuan="Satu kalimat: apa yang dilakukan dan bagaimana rasanya bagi anak.">
              <textarea id="k-desk" rows={2} className={input} value={isi.deskripsi} disabled={!bisaDiubah} onChange={e => atur('deskripsi', e.target.value)} />
            </Kolom>
            <Kolom label="Sumber" htmlFor="k-sumber" bantuan="Pisahkan beberapa sumber dengan titik koma (;). Tulis alamat web atau DOI agar tautan langsung ke halaman yang tepat.">
              <textarea id="k-sumber" rows={2} className={input} value={isi.sumber} disabled={!bisaDiubah} onChange={e => atur('sumber', e.target.value)}
                placeholder="mis. Yogman dkk. (2018). The Power of Play. Pediatrics. https://doi.org/10.1542/peds.2018-2058" />
              {isi.sumber.trim() && <span className="text-[12px] text-pekat/60">Pratinjau tautan: <TautanSumber sumber={isi.sumber} ringkas /></span>}
            </Kolom>
            <div>
              <p className="mb-1.5 text-[12px] font-bold text-pekat/70">Nilai yang ditanam <span className="font-normal text-pekat/45">· maksimal 3, yang pertama dipakai bila beberapa jadi fokus</span></p>
              <div className="flex flex-wrap gap-1.5">
                {NILAI.map(n => {
                  const aktif = isi.nilai.includes(n);
                  return (
                    <button key={n} type="button" disabled={!bisaDiubah} onClick={() => toggleNilai(n)} aria-pressed={aktif}
                      className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12.5px] font-semibold transition disabled:cursor-not-allowed"
                      style={aktif ? { background: T.tint, borderColor: T.aksen, color: T.teks } : { borderColor: 'rgba(240,107,168,0.18)', color: 'rgba(110,59,87,0.65)' }}>
                      <BungaNilai nilai={n} size={16} /> {n}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-rekah/10 bg-white p-5">
            <h2 className="font-bricolage text-[16px] font-bold text-pekat">Usia anak</h2>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" disabled={!bisaDiubah} onClick={() => setIsi(p => ({ ...p, usia_min_bulan: 0, usia_max_bulan: USIA_MAKS }))}
                className={`rounded-full px-3 py-1 text-[12.5px] font-semibold ${semuaUsia ? 'text-white' : 'border border-rekah/20 text-pekat/65'}`} style={semuaUsia ? { background: T.teks } : undefined}>Semua usia</button>
              {BAND_USIA.map((b, i) => (
                <button key={b.label} type="button" disabled={!bisaDiubah} onClick={() => setIsi(p => ({ ...p, usia_min_bulan: b.min, usia_max_bulan: b.max }))}
                  className={`rounded-full px-3 py-1 text-[12.5px] font-semibold ${bandAktif === i ? 'text-white' : 'border border-rekah/20 text-pekat/65'}`} style={bandAktif === i ? { background: T.teks } : undefined}>{b.label}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
              <Kolom label="Dari (bulan)" htmlFor="k-umin">
                <input id="k-umin" type="number" min={0} max={USIA_MAKS} className={input} value={isi.usia_min_bulan} disabled={!bisaDiubah} onChange={e => atur('usia_min_bulan', Number(e.target.value))} />
              </Kolom>
              <Kolom label="Sampai (bulan)" htmlFor="k-umax">
                <input id="k-umax" type="number" min={0} max={USIA_MAKS} className={input} value={isi.usia_max_bulan} disabled={!bisaDiubah} onChange={e => atur('usia_max_bulan', Number(e.target.value))} />
              </Kolom>
            </div>
            <Kolom label="Urutan dalam kegiatan" htmlFor="k-urut" bantuan="Angka kecil tampil lebih dulu.">
              <input id="k-urut" type="number" className={`${input} sm:max-w-[140px]`} value={isi.urutan} disabled={!bisaDiubah} onChange={e => atur('urutan', Number(e.target.value))} />
            </Kolom>
          </section>

          {bisaDiubah && (
            <section className="rounded-2xl border border-rekah/10 bg-white p-5">
              <Kolom label="Catatan untuk peninjau (opsional)" htmlFor="k-cat">
                <textarea id="k-cat" rows={2} className={input} value={catatan} onChange={e => setCatatan(e.target.value)} />
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
                <label htmlFor="k-kata-oke" className="mt-2 flex items-start gap-2 text-[12px] font-semibold text-pekat/70">
                  <input id="k-kata-oke" type="checkbox" className="mt-0.5" checked={kataOke} onChange={e => setKataOke(e.target.checked)} />
                  Sudah saya periksa — kata ini dipakai dengan sengaja. Peninjau tetap melihat tandanya.
                </label>
              )}
            </div>
          )}
          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Pratinjau orang tua</p>
            <PratinjauKebiasaan isi={isi} templates={templates} />
          </div>
        </aside>
      </div>
    </div>
  );
}
