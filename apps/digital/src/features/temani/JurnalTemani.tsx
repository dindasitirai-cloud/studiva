// Jurnal perjalanan (Phase 14Q) — buku harian per tanggal.
// Phase 22: pindah ke Kelola sebagai tab "Jurnal" (prop `tertanam`) + "Yang terlihat hari ini"
// (pengganti checklist Kompas Perkembangan, bertanggal → menyetir saran Rekah 21 hari).
// Phase 22b: tampilan "Buku Jurnal" dari design handoff (Claude Design):
//   sampul plum + pita, kertas titik dua halaman + lipatan, navigasi hari di tengah bawah,
//   tab bulan di kanan (lama → baru, atas → bawah). Kiri: tanggal satu baris, musim, usia
//   pada tanggal halaman, kartu "Tercatat otomatis" per kategori. Kanan: "Yang terlihat"
//   (tertutup → panel pilih + tulis sendiri), "Ceritamu" bergaris (autosave), foto polaroid.
// Log otomatis (read-only) diturunkan dari data yang ada + cerita & foto pengguna.
// INVARIANT: tanpa skor/streak/emoji; bukan daftar target. Copy DRAFT → review Psikolog Fitri.
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  getPilihanHarianRentang, getRefleksiRentang, getJurnalHariRentang,
  simpanJurnalHari, unggahFotoJurnal, urlFotoJurnal, hapusFotoJurnal,
} from '../../lib/supabase/rekah';
import type { JurnalHari } from '../../lib/supabase/rekah';
import { bangunEntriHari, gabungEntri, normalisasiKategori } from './jurnalAgregator';
import type { EntriOtomatis, KategoriJurnal } from './jurnalAgregator';
import { katalogKelolaSeed } from '../irama-hari/HariIni';
import { bacaInboxSelesai } from '../irama-hari/inboxData';
import { dispatchRekahError } from '../../utils/rekahApiError';
import { tanggalDariTimestampWIB } from '@studiva/shared';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { usiaDalamBulan } from '../../types/anak';
import { promptsForAge } from '../rekah-journey/observation/observationPrompts';
import BotanicalStem from '../../components/BotanicalStem';
import {
  useTerlihat, terlihatDalam, JENDELA_PENYETIR_HARI, idTulis, adalahTulis, labelTerlihat,
} from '../irama-hari/terlihatData';

// ─── Token desain (handoff "Buku Jurnal") ─────────────────────────────────────
const C = {
  pink: '#F06BA8', pinkTinta: '#D2559A', plum: '#6E3B57', plumMuted: '#8A5A74',
  pucat: '#A98BA0', pucat2: '#B48DA3', sampul: '#7A3D5E', kertas: '#FFFCF6',
  garis: '#F2DDE7', hijauBg: '#EAF6E4', hijauBorder: '#A7C98A', hijauIsi: '#6E9C4A', hijauTeks: '#4E7533',
};

const CSS = `
.jb-wrap{position:relative;width:1246px;max-width:100%;margin:0 auto;padding-right:66px}
.jb-tabs{position:absolute;right:0;top:48px;display:flex;flex-direction:column;gap:8px}
.jb-mtab{padding:12px 0 12px 16px;border-radius:0 16px 16px 0;border:0;cursor:pointer;text-align:left;font-family:Nunito,sans-serif;font-weight:800;font-size:13px;letter-spacing:1px}
.jb-mtab.on{width:78px;background:${C.pink};color:#fff;box-shadow:0 12px 22px -14px rgba(240,107,168,.9)}
.jb-mtab.off{width:66px;background:#F9DCE9;color:#B05A86}
.jb-cover{position:relative;background:${C.sampul};border-radius:36px;padding:14px;box-shadow:0 40px 70px -46px rgba(90,40,70,.8)}
.jb-pita{position:absolute;right:90px;top:-6px;width:20px;height:50px;background:${C.pink};border-radius:4px 4px 0 0;clip-path:polygon(0 0,100% 0,100% 100%,50% 82%,0 100%);z-index:2}
.jb-nav{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:3;display:flex;align-items:center;gap:6px;background:#fff;border:1.5px solid ${C.garis};border-radius:999px;padding:5px;box-shadow:0 14px 26px -18px rgba(110,59,87,.55)}
.jb-nav button{width:38px;height:38px;border-radius:50%;background:#FFF4F9;border:0;display:flex;align-items:center;justify-content:center;cursor:pointer}
.jb-nav button:disabled{opacity:.35;cursor:default}
.jb-paper{display:grid;grid-template-columns:minmax(0,1fr) 22px minmax(0,1fr);background:${C.kertas};border-radius:26px;overflow:hidden;background-image:radial-gradient(#EADFD8 1.1px,transparent 1.2px);background-size:22px 22px;animation:jb-in .35s cubic-bezier(.2,.7,.2,1)}
@keyframes jb-in{from{opacity:.4}to{opacity:1}}
.jb-fold{background:linear-gradient(90deg,rgba(110,59,87,0) 0%,rgba(110,59,87,.09) 45%,rgba(110,59,87,.09) 55%,rgba(110,59,87,0) 100%)}
.jb-kiri{position:relative;padding:38px 40px 96px;min-height:760px;display:flex;flex-direction:column;container-type:inline-size}
.jb-kanan{position:relative;padding:38px 40px 80px;display:flex;flex-direction:column;gap:30px;min-width:0}
.jb-tanggal{margin-top:14px;font-family:Fredoka,sans-serif;font-weight:700;font-size:44px;font-size:clamp(26px,8.4cqi,44px);line-height:1.05;color:${C.plum};letter-spacing:-.5px;white-space:nowrap}
.jb-label{display:flex;align-items:center;gap:8px;font-family:Nunito,sans-serif;font-weight:800;font-size:12.5px;letter-spacing:1.4px;color:${C.pucat2};text-transform:uppercase}
.jb-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.jb-tap{transition:transform .16s cubic-bezier(.2,.7,.2,1),background .16s ease,border-color .16s ease,box-shadow .16s ease}
.jb-tap:active{transform:scale(.97)}
.jb-pop{animation:jb-pop .28s cubic-bezier(.2,.7,.2,1) both}
@keyframes jb-pop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.jb-cerita{margin-top:12px;border-radius:22px;background:#fff;border:1.5px solid ${C.garis};padding:4px 18px 10px;background-image:repeating-linear-gradient(#fff 0,#fff 33px,#F6E7EE 33px,#F6E7EE 34.5px);background-position:0 12px}
.jb-cerita textarea{width:100%;border:none;background:transparent;resize:none;font-family:'Shantell Sans',cursive;font-weight:500;font-size:16px;line-height:34.5px;color:${C.plum};padding:6px 0 0}
.jb-cerita textarea:focus,.jb-input:focus{outline:none}
.jb-polaroid{position:relative;width:120px;height:132px;background:#fff;padding:8px 8px 22px;border-radius:6px;box-shadow:0 14px 26px -18px rgba(110,59,87,.55);flex:none}
@media(max-width:1023px){
  .jb-wrap{padding-right:0}
  .jb-tabs{position:static;flex-direction:row;margin:0 0 -4px 24px}
  .jb-mtab{border-radius:16px 16px 0 0;padding:10px 16px}
  .jb-mtab.on,.jb-mtab.off{width:auto}
  .jb-paper{grid-template-columns:minmax(0,1fr)}
  .jb-fold{display:none}
  .jb-kiri{min-height:0;padding:28px 22px 88px}
  .jb-kanan{padding:8px 22px 88px;border-top:2px dashed #EBDCE3}
}
@media(max-width:560px){.jb-grid{grid-template-columns:1fr}.jb-cover{border-radius:28px;padding:10px}}
@media(prefers-reduced-motion:reduce){.jb-pop,.jb-paper{animation:none}.jb-tap{transition:none}}
`;

// ─── Utilitas tanggal ─────────────────────────────────────────────────────────

function isoMundur(n: number): string[] {
  const today = tanggalDariTimestampWIB(new Date().toISOString());
  const base = new Date(`${today}T00:00:00Z`);
  const out: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
function fmt(iso: string, opt: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('id-ID', { ...opt, timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
}
/** "1 tahun 3 bulan" / "7 bulan" — usia pada tanggal halaman (bukan hari ini). */
function teksUsiaPada(tanggalLahir: string | null, iso: string): string | null {
  const b = usiaDalamBulan(tanggalLahir, new Date(`${iso}T12:00:00`));
  if (b == null || b < 0) return null;
  const th = Math.floor(b / 12); const bl = b % 12;
  if (th === 0) return `${bl} bulan`;
  return bl === 0 ? `${th} tahun` : `${th} tahun ${bl} bulan`;
}

// ─── Kategori "Tercatat otomatis" ─────────────────────────────────────────────

const KAT_INFO: Record<KategoriJurnal, { label: string; tinta: string; lembut: string }> = {
  kebiasaan:   { label: 'Kebiasaan Baik',        tinta: '#5E8C3E', lembut: '#EEF6E8' },
  main:        { label: 'Ajak Main',             tinta: '#D2559A', lembut: '#FDEAF3' },
  wawasan:     { label: 'Wawasan Tumbuh',        tinta: '#7B63C9', lembut: '#F1ECFC' },
  dikelola:    { label: 'Untuk Dikelola',        tinta: '#2F8C7E', lembut: '#E4F4F1' },
  situasional: { label: 'Kebiasaan Situasional', tinta: '#B7791F', lembut: '#FFF3D6' },
  temani:      { label: 'Langkah Temani',        tinta: '#C2477F', lembut: '#FCE6F0' },
  bantu:       { label: 'Dukungan Situasional',  tinta: '#8E5FA6', lembut: '#F4ECF8' },
  refleksi:    { label: 'Refleksi',              tinta: '#4C74D6', lembut: '#EAF0FC' },
  lainnya:     { label: 'Lainnya',               tinta: '#8A7385', lembut: '#F4EEF1' },
};
const KATEGORI_URUT: KategoriJurnal[] = ['kebiasaan', 'main', 'wawasan', 'dikelola', 'situasional', 'temani', 'bantu', 'refleksi', 'lainnya'];

// Baca tanda "selesai" untuk Ajak main / buku / lainnya dari store lokal Kelola
// Hari Ini (di-simpan per tanggal). Kebiasaan & situasional tidak di sini —
// keduanya lewat kolom centang (Supabase), sudah ditangani agregator.
function bacaKelolaLokal(idAnak: string, iso: string, seed: Map<string, { judul: string; kategori: string }>): EntriOtomatis[] {
  try {
    const raw = window.localStorage.getItem(`rekah_hariini_v3_${idAnak}_${iso}`);
    if (!raw) return [];
    const store = JSON.parse(raw) as { extra?: Record<string, { id: string; t: string; tipe: string }[]>; doneExtra?: string[] };
    const done = store.doneExtra ?? [];
    if (done.length === 0) return [];
    const map = new Map<string, { judul: string; kategori: string }>();
    for (const [id, m] of seed) map.set(id, m);
    for (const key of Object.keys(store.extra ?? {})) for (const it of store.extra![key]) map.set(it.id, { judul: it.t, kategori: it.tipe });
    const out: EntriOtomatis[] = [];
    for (const id of done) { const m = map.get(id); if (m) out.push({ kategori: normalisasiKategori(m.kategori), teks: m.judul }); }
    return out;
  } catch { return []; }
}

// ─── Ikon kecil (garis, sesuai handoff) ──────────────────────────────────────

const Svg = ({ size, stroke, sw = 2.2, children, style }: { size: number; stroke: string; sw?: number; children: React.ReactNode; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={style}>{children}</svg>
);
const Centang = ({ size, stroke, sw = 3 }: { size: number; stroke: string; sw?: number }) => <Svg size={size} stroke={stroke} sw={sw}><path d="m5 12 4.5 4.5L19 7" /></Svg>;
const Plus = ({ size, stroke, sw = 2.6 }: { size: number; stroke: string; sw?: number }) => <Svg size={size} stroke={stroke} sw={sw}><path d="M12 5v14M5 12h14" /></Svg>;

// ─── Komponen ─────────────────────────────────────────────────────────────────

interface Props {
  idAnak: string;
  nama: string;
  onKembali?: () => void;
  /** Tampil di dalam tab Kelola (tanpa tombol kembali & judul halaman). */
  tertanam?: boolean;
  /** Buka langsung di tanggal ini (mis. dari "Catat hari ini" di Irama Keseharian). */
  tanggalAwal?: string;
  /** Baris musim di bawah tanggal (mis. "musim Kemandirian & Empati"). */
  keteranganMusim?: string;
}

const JUMLAH_HARI = 60;

export default function JurnalTemani({ idAnak, nama, onKembali, tertanam, tanggalAwal, keteranganMusim }: Props) {
  const { usiaBulan, profile } = useChildProfile();
  const prompts = useMemo(() => promptsForAge(usiaBulan ?? null), [usiaBulan]);
  const terlihat = useTerlihat(idAnak);
  const dates = useMemo(() => isoMundur(JUMLAH_HARI), []); // [0] = hari ini, makin besar makin lama
  const hariIni = dates[0];
  const katalogSeed = useMemo(() => katalogKelolaSeed(), []);
  const [loading, setLoading] = useState(true);
  const [entriMap, setEntriMap] = useState<Record<string, EntriOtomatis[]>>({});
  const [cur, setCur] = useState(() => {
    const i = tanggalAwal ? dates.indexOf(tanggalAwal) : -1;
    return i >= 0 ? i : 0;
  });
  const [jurnalMap, setJurnalMap] = useState<Record<string, JurnalHari>>({});
  const [draft, setDraft] = useState('');
  const [urlMap, setUrlMap] = useState<Record<string, string>>({});
  const [bukaPilih, setBukaPilih] = useState(false);
  const [tulisan, setTulisan] = useState('');
  const [fotoBesar, setFotoBesar] = useState<number | null>(null); // indeks foto yang dibuka penuh
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        setLoading(true);
        // Inti (log otomatis) = pilihan_harian. Refleksi & jurnal_hari TIDAK fatal.
        const rows = await getPilihanHarianRentang(idAnak, dates);
        let refleksi: { tanggal: string; hasil: string }[] = [];
        try { refleksi = await getRefleksiRentang(idAnak, dates[dates.length - 1], dates[0]); }
        catch (er) { console.warn('[Jurnal] refleksi gagal (diabaikan):', er); }
        let jmap: Record<string, JurnalHari> = {};
        try { jmap = await getJurnalHariRentang(idAnak, dates); }
        catch (ej) { console.warn('[Jurnal] jurnal_hari gagal — pastikan migration 020 dijalankan & bucket "jurnal-foto" dibuat:', ej); }
        const refByDate = new Map<string, { hasil: string }[]>();
        for (const r of refleksi) {
          const a = refByDate.get(r.tanggal) ?? [];
          a.push({ hasil: r.hasil });
          refByDate.set(r.tanggal, a);
        }
        const inboxByDate = new Map<string, string[]>();
        for (const it of bacaInboxSelesai(idAnak)) {
          const a = inboxByDate.get(it.tanggal) ?? [];
          a.push(it.judul);
          inboxByDate.set(it.tanggal, a);
        }
        const emap: Record<string, EntriOtomatis[]> = {};
        for (const iso of dates) {
          const row = rows[iso];
          const centang = (row?.centang ?? undefined) as Record<string, string[]> | undefined;
          const entriSupabase = bangunEntriHari(row?.diff, centang, refByDate.get(iso) ?? [], katalogSeed);
          const entriLokal = bacaKelolaLokal(idAnak, iso, katalogSeed);
          const entriInbox = (inboxByDate.get(iso) ?? []).map(t => ({ kategori: 'dikelola' as const, teks: t }));
          const entri = gabungEntri(entriSupabase, entriLokal, entriInbox);
          if (entri.length > 0) emap[iso] = entri;
        }
        if (batal) return;
        setEntriMap(emap);
        setJurnalMap(jmap);
      } catch (e) {
        console.error('[Jurnal] gagal memuat:', e);
        dispatchRekahError('Koneksi terputus — jurnal belum bisa dimuat. Coba lagi ya.');
      } finally {
        if (!batal) setLoading(false);
      }
    })();
    return () => { batal = true; };
  }, [idAnak, dates, katalogSeed]);

  const iso = dates[cur];
  const adalahHariIni = iso === hariIni;
  const kataHari = adalahHariIni ? 'hari ini' : 'hari itu';
  const entri = entriMap[iso] ?? [];
  const jurnalCur: JurnalHari = jurnalMap[iso] || { cerita: '', foto: [] };

  // Ganti halaman → muat cerita, tutup panel pilih.
  useEffect(() => {
    setDraft(jurnalCur.cerita);
    setBukaPilih(false);
    setTulisan('');
    setFotoBesar(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso, loading]);

  useEffect(() => {
    let batal = false;
    (async () => {
      for (const p of jurnalCur.foto) {
        if (urlMap[p]) continue;
        const u = await urlFotoJurnal(p);
        if (!batal && u) setUrlMap(m => ({ ...m, [p]: u }));
      }
    })();
    return () => { batal = true; };
    /* eslint-disable-next-line */
  }, [iso, jurnalCur.foto.length]);

  const simpan = useCallback(async (tgl: string, isi: JurnalHari) => {
    setJurnalMap(m => ({ ...m, [tgl]: isi }));
    try { await simpanJurnalHari(idAnak, tgl, isi); }
    catch (e) { console.error('[Jurnal] simpan gagal:', e); dispatchRekahError('Catatan belum tersimpan. Coba lagi ya.'); }
  }, [idAnak]);

  // Autosave cerita (debounce ±800ms) + saat blur.
  const ceritaTersimpan = jurnalCur.cerita;
  useEffect(() => {
    if (loading || draft === ceritaTersimpan) return undefined;
    const tgl = iso; const foto = jurnalCur.foto;
    const t = window.setTimeout(() => { void simpan(tgl, { cerita: draft, foto }); }, 800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);
  const onBlurCerita = () => { if (draft !== ceritaTersimpan) void simpan(iso, { cerita: draft, foto: jurnalCur.foto }); };

  const onPilihFoto = async (f: File | undefined) => {
    if (!f) return;
    const tgl = iso;
    try {
      const path = await unggahFotoJurnal(idAnak, tgl, f);
      await simpan(tgl, { cerita: draft, foto: [...jurnalCur.foto, path] });
    } catch (e) { console.error('[Jurnal] unggah gagal:', e); const m = (e as { message?: string })?.message; dispatchRekahError(`Foto belum bisa diunggah${m ? `: ${m}` : ''}. Pastikan bucket "jurnal-foto" ada & policy storage (migration 020) terpasang.`); }
  };
  const onHapusFoto = async (path: string) => {
    await simpan(iso, { cerita: draft, foto: jurnalCur.foto.filter(p => p !== path) });
    try { await hapusFotoJurnal(path); } catch (e) { console.error('[Jurnal] hapus foto:', e); }
  };

  // ── Tab bulan: lama → baru (atas → bawah). Lompat ke hari terakhir berisi, atau tanggal 1.
  const adaIsi = useCallback((d: string) => (entriMap[d]?.length ?? 0) > 0
    || (terlihat.peta[d]?.length ?? 0) > 0
    || !!(jurnalMap[d] && (jurnalMap[d].cerita.trim() !== '' || jurnalMap[d].foto.length > 0)), [entriMap, terlihat.peta, jurnalMap]);
  const bulanList = useMemo(() => {
    const kunci: string[] = [];
    for (const d of dates) { const k = d.slice(0, 7); if (!kunci.includes(k)) kunci.push(k); }
    return kunci.reverse().map(k => {
      const diBulan = dates.map((d, i) => ({ d, i })).filter(x => x.d.startsWith(k)); // terbaru dulu
      const berisi = diBulan.find(x => adaIsi(x.d));
      const tujuan = berisi ?? diBulan[diBulan.length - 1]; // tanggal 1 (atau hari tertua dalam jangkauan)
      return { key: k, label: fmt(`${k}-01`, { month: 'short' }).replace('.', '').toUpperCase().slice(0, 3), idx: tujuan.i };
    });
  }, [dates, adaIsi]);
  const bulanAktif = iso.slice(0, 7);

  // ── Yang terlihat
  const diHari = useMemo(() => new Set(terlihat.diHari(iso)), [terlihat, iso]);
  const chips = useMemo(() => {
    const out: { id: string; label: string }[] = prompts.map(p => ({ id: p.id, label: p.label }));
    const ada = new Set(out.map(c => c.id));
    // Tulisan sendiri: dari hari ini + 3 minggu sebelumnya (agar bisa ditandai lagi).
    const jendela = terlihatDalam(terlihat.peta, iso, JENDELA_PENYETIR_HARI);
    const tulis = [...new Set([...diHari, ...Object.keys(jendela)])].filter(adalahTulis);
    for (const id of tulis) if (!ada.has(id)) { const l = labelTerlihat(id); if (l) { out.push({ id, label: l }); ada.add(id); } }
    // Tanda lama dari prompt di luar rentang usia tetap tampil bila ditandai hari ini.
    for (const id of diHari) if (!ada.has(id)) { const l = labelTerlihat(id); if (l) { out.push({ id, label: l }); ada.add(id); } }
    return out;
  }, [prompts, terlihat.peta, iso, diHari]);
  const dipilih = chips.filter(c => diHari.has(c.id));
  const tambahTulisan = () => {
    const t = tulisan.trim();
    if (!t) return;
    const cocok = prompts.find(p => p.label.toLowerCase() === t.toLowerCase());
    const id = cocok ? cocok.id : idTulis(t);
    if (!diHari.has(id)) terlihat.toggle(iso, id);
    setTulisan('');
  };

  // Lihat foto ukuran penuh: Esc tutup, ← → pindah foto.
  const jmlFoto = jurnalCur.foto.length;
  useEffect(() => {
    if (fotoBesar == null) return undefined;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFotoBesar(null);
      else if (e.key === 'ArrowLeft') setFotoBesar(i => (i == null ? i : (i - 1 + jmlFoto) % jmlFoto));
      else if (e.key === 'ArrowRight') setFotoBesar(i => (i == null ? i : (i + 1) % jmlFoto));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [fotoBesar, jmlFoto]);
  const pathBesar = fotoBesar != null ? jurnalCur.foto[fotoBesar] : undefined;

  const teksUsia = teksUsiaPada(profile.tanggalLahir ?? null, iso);

  return (
    <>
      <style>{CSS}</style>
      {!tertanam && (
        <>
          {onKembali && <button onClick={onKembali} className="mb-3 inline-flex items-center gap-1 font-nunito text-[13px] text-pekat/70"><ArrowLeft className="h-4 w-4" /> Kembali</button>}
          <p className="font-shantell text-lg text-rekah">jurnal</p>
          <h1 className="mt-1 font-fredoka text-[26px] font-semibold leading-tight text-pekat">Buku perjalanan {nama}</h1>
          <p className="mb-4 mt-2 font-nunito text-[15px] text-pekat/70">Tercatat otomatis tiap hari. Kamu tinggal menandai yang terlihat, menambah cerita, atau foto.</p>
        </>
      )}

      {loading ? (
        <div className="rounded-3xl border border-[#F0DCE6] bg-white/70 p-8 text-center font-nunito text-[13px] text-pekat/60">Memuat buku…</div>
      ) : (
        <div className="jb-wrap">
          {/* Tab bulan */}
          <div className="jb-tabs" role="tablist" aria-label="Pilih bulan">
            {bulanList.map(b => (
              <button key={b.key} type="button" role="tab" aria-selected={b.key === bulanAktif}
                className={`jb-mtab jb-tap ${b.key === bulanAktif ? 'on' : 'off'}`} onClick={() => setCur(b.idx)}>{b.label}</button>
            ))}
          </div>

          {/* Sampul */}
          <div className="jb-cover">
            <div className="jb-pita" aria-hidden />
            <div className="jb-nav">
              <button type="button" className="jb-tap" aria-label="Hari sebelumnya" disabled={cur >= dates.length - 1}
                onClick={() => setCur(c => Math.min(dates.length - 1, c + 1))}>
                <Svg size={16} stroke={C.pinkTinta} sw={2.6}><path d="m15 5-7 7 7 7" /></Svg>
              </button>
              <button type="button" className="jb-tap" aria-label="Hari berikutnya" disabled={cur === 0}
                onClick={() => setCur(c => Math.max(0, c - 1))}>
                <Svg size={16} stroke={C.pinkTinta} sw={2.6}><path d="m9 5 7 7-7 7" /></Svg>
              </button>
            </div>

            <div className="jb-paper" key={iso}>
              {/* ===== Halaman kiri ===== */}
              <div className="jb-kiri">
                <div style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: 12, letterSpacing: 2, color: C.pucat2, textTransform: 'uppercase' }}>
                  Buku perjalanan {nama}
                </div>
                <h2 className="jb-tanggal">{fmt(iso, { weekday: 'long' })}, {fmt(iso, { day: 'numeric', month: 'long' })}</h2>
                {keteranganMusim && (
                  <div style={{ marginTop: 12, fontFamily: "'Shantell Sans',cursive", fontWeight: 600, fontSize: 18, lineHeight: 1.45, color: C.pinkTinta }}>{keteranganMusim}</div>
                )}
                {teksUsia && (
                  <div style={{ marginTop: 6, fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 15, color: C.plumMuted }}>
                    {nama} {adalahHariIni ? 'hari ini' : 'hari itu'} berusia <strong style={{ fontWeight: 800, color: C.plum }}>{teksUsia}</strong>
                  </div>
                )}

                <div style={{ margin: '26px 0 22px', borderTop: '2px dashed #EBDCE3' }} />

                <div className="jb-label" style={{ marginBottom: 14 }}>
                  <Svg size={16} stroke={C.pucat2}><path d="m4 6 1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M12 6h8M12 12h8M12 18h8" /></Svg>
                  Tercatat otomatis
                </div>

                {entri.length === 0 ? (
                  <p style={{ margin: 0, fontFamily: 'Nunito,sans-serif', fontWeight: 600, fontSize: 14, lineHeight: 1.55, color: C.pucat }}>
                    Belum ada yang tercatat {kataHari}. Saat kamu menandai kegiatan atau kebiasaan di Irama Keseharian, atau menjalani langkah Temani, catatannya muncul di sini.
                  </p>
                ) : (
                  <div className="jb-grid">
                    {KATEGORI_URUT.map(kat => {
                      const items = entri.filter(e => e.kategori === kat);
                      if (items.length === 0) return null;
                      const k = KAT_INFO[kat];
                      return (
                        <div key={kat} style={{ background: k.lembut, borderRadius: 20, padding: '14px 16px 15px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: k.tinta, flex: 'none' }} />
                            <span style={{ flex: 1, fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: 11.5, letterSpacing: 1, color: k.tinta, textTransform: 'uppercase' }}>{k.label}</span>
                            <span style={{ minWidth: 22, height: 22, padding: '0 7px', borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: 11.5, color: k.tinta }}>{items.length}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
                            {items.map((e, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <span style={{ flex: 'none', marginTop: 3 }}><Centang size={13} stroke={k.tinta} /></span>
                                <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 14.5, lineHeight: 1.35, color: C.plum }}>{e.teks}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ position: 'absolute', left: 30, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 4, opacity: 0.75, pointerEvents: 'none' }} aria-hidden>
                  <div style={{ width: 40, height: 62 }}><BotanicalStem cfg={{ type: 'tulip', bloom: '#F06BA8', bloom2: '#F8B9D4' }} /></div>
                  <div style={{ width: 30, height: 46 }}><BotanicalStem cfg={{ type: 'leaf', leaf: '#A7C63E' }} /></div>
                  <div style={{ width: 34, height: 54 }}><BotanicalStem cfg={{ type: 'daisy', bloom: '#FFFFFF', bloom2: '#FFE29A', center: '#F2A71B' }} /></div>
                </div>
              </div>

              {/* Lipatan */}
              <div className="jb-fold" aria-hidden />

              {/* ===== Halaman kanan ===== */}
              <div className="jb-kanan">
                {/* A. Yang terlihat */}
                <div>
                  <div className="jb-label">
                    <Svg size={17} stroke={C.pucat2}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></Svg>
                    <span style={{ flex: 1 }}>Yang terlihat {kataHari}</span>
                    {dipilih.length > 0 && (
                      <span style={{ borderRadius: 999, padding: '3px 10px', background: C.hijauBg, fontWeight: 800, fontSize: 11.5, letterSpacing: 0, color: '#5E8C3E', textTransform: 'none' }}>{dipilih.length} ditandai</span>
                    )}
                  </div>
                  <p style={{ margin: '8px 0 0', fontFamily: 'Nunito,sans-serif', fontWeight: 600, fontSize: 14.5, lineHeight: 1.5, color: C.plumMuted }}>
                    Tandai yang kamu lihat {nama} lakukan. Ini bukan daftar yang harus dicapai, hanya catatan.
                  </p>

                  {!bukaPilih && dipilih.length > 0 && (
                    <div className="jb-pop" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                      {dipilih.map(c => (
                        <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 7, borderRadius: 999, padding: '8px 14px 8px 11px', background: C.hijauBg }}>
                          <Centang size={13} stroke="#5E8C3E" sw={3.2} />
                          <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 14, color: C.hijauTeks }}>{c.label}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {!bukaPilih ? (
                    <button type="button" className="jb-tap" onClick={() => setBukaPilih(true)} aria-expanded={false}
                      style={{ width: '100%', textAlign: 'left', marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 20, background: '#fff', border: '2px dashed #F4C6DC', cursor: 'pointer' }}>
                      <span style={{ width: 38, height: 38, flex: 'none', borderRadius: '50%', background: C.pink, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 18px -12px rgba(240,107,168,.9)' }}>
                        <Plus size={18} stroke="#fff" sw={2.8} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontFamily: 'Fredoka,sans-serif', fontWeight: 600, fontSize: 16.5, color: C.plum }}>
                          {dipilih.length ? 'Ubah yang terlihat' : `Isi yang terlihat ${kataHari}`}
                        </span>
                        <span style={{ display: 'block', fontFamily: 'Nunito,sans-serif', fontWeight: 600, fontSize: 12.5, color: C.pucat, marginTop: 1 }}>Pilih dari saran atau tulis sendiri</span>
                      </span>
                      <Svg size={16} stroke={C.pinkTinta} sw={2.6}><path d="m6 9 6 6 6-6" /></Svg>
                    </button>
                  ) : (
                    <div className="jb-pop" style={{ marginTop: 14, background: '#fff', border: `1.5px solid ${C.garis}`, borderRadius: 24, padding: '16px 16px 14px', boxShadow: '0 22px 40px -34px rgba(110,59,87,.6)' }}>
                      {chips.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {chips.map(c => {
                            const on = diHari.has(c.id);
                            return (
                              <button key={c.id} type="button" className="jb-tap" aria-pressed={on} onClick={() => terlihat.toggle(iso, c.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 15px 9px 11px', borderRadius: 999, cursor: 'pointer', textAlign: 'left',
                                  background: on ? C.hijauBg : '#fff', border: `1.5px solid ${on ? C.hijauBorder : '#E3EFDC'}` }}>
                                <span style={{ width: 18, height: 18, flex: 'none', borderRadius: '50%', border: `2px solid ${on ? C.hijauIsi : '#D9D2D6'}`, background: on ? C.hijauIsi : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Centang size={10} stroke="#fff" sw={3.6} />
                                </span>
                                <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 14, color: on ? C.hijauTeks : C.plum }}>{c.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: chips.length > 0 ? 12 : 0, padding: '6px 6px 6px 14px', borderRadius: 999, background: '#FFF8FB', border: '1.5px dashed #F4C6DC' }}>
                        <Svg size={15} stroke={C.pinkTinta} sw={2.4}><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></Svg>
                        <input className="jb-input" value={tulisan} onChange={e => setTulisan(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); tambahTulisan(); } }}
                          placeholder="Tulis sendiri, mis. Tertawa saat cilukba" aria-label="Tulis sendiri yang terlihat" maxLength={80}
                          style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', fontFamily: 'Nunito,sans-serif', fontWeight: 600, fontSize: 14, color: C.plum, padding: '6px 0' }} />
                        <button type="button" className="jb-tap" onClick={tambahTulisan} disabled={!tulisan.trim()}
                          style={{ flex: 'none', padding: '8px 16px', borderRadius: 999, border: 'none', cursor: tulisan.trim() ? 'pointer' : 'default',
                            background: tulisan.trim() ? C.pink : '#F5E6EE', color: tulisan.trim() ? '#fff' : C.pucat2, fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: 13 }}>
                          Tambah
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                        <Svg size={14} stroke={C.pucat2} style={{ flex: 'none' }}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></Svg>
                        <span style={{ flex: 1, fontFamily: 'Nunito,sans-serif', fontWeight: 600, fontSize: 12, lineHeight: 1.45, color: C.pucat }}>
                          Yang kamu tandai membantu Rekah memilih kegiatan dan bacaan untuk sekitar 3 minggu ke depan.
                        </span>
                        <button type="button" className="jb-tap" onClick={() => { tambahTulisan(); setBukaPilih(false); }}
                          style={{ flex: 'none', padding: '9px 18px', borderRadius: 999, border: 'none', background: C.pink, cursor: 'pointer', boxShadow: '0 10px 18px -12px rgba(240,107,168,.9)', fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: 13, color: '#fff' }}>
                          Selesai
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* B. Ceritamu */}
                <div>
                  <div className="jb-label">
                    <Svg size={17} stroke={C.pucat2}><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.5Z" /></Svg>
                    Ceritamu {kataHari}
                  </div>
                  <div className="jb-cerita">
                    <textarea rows={5} value={draft} onChange={ev => setDraft(ev.target.value)} onBlur={onBlurCerita}
                      aria-label={`Ceritamu ${kataHari}`}
                      placeholder="Apa yang terjadi? Hal kecil yang lucu, yang baru, atau yang membuatmu tersenyum..." />
                  </div>
                </div>

                {/* C. Foto */}
                <div>
                  <div className="jb-label">
                    <Svg size={17} stroke={C.pucat2}><path d="M4 8h3l2-2.5h6L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.4" /></Svg>
                    Foto
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12, paddingLeft: 4 }}>
                    {jurnalCur.foto.map((path, i) => (
                      <div key={path} className="jb-polaroid" style={{ transform: `rotate(${i % 2 === 0 ? -3 : 3}deg)` }}>
                        {urlMap[path]
                          ? (
                            <button type="button" onClick={() => setFotoBesar(i)} aria-label="Lihat foto ukuran penuh"
                              style={{ display: 'block', width: '100%', height: '100%', padding: 0, border: 'none', background: 'none', cursor: 'zoom-in' }}>
                              <img src={urlMap[path]} alt={`Foto jurnal ${fmt(iso, { day: 'numeric', month: 'long' })}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3, display: 'block' }} />
                            </button>
                          )
                          : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontFamily: 'Nunito,sans-serif', fontSize: 11, color: C.pucat, background: '#FFF8FB', borderRadius: 3 }}>memuat…</div>}
                        <button type="button" onClick={() => { void onHapusFoto(path); }} aria-label="Hapus foto"
                          style={{ position: 'absolute', right: 2, top: 2, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(110,59,87,.55)', color: '#fff', fontSize: 13, lineHeight: '22px', cursor: 'pointer' }}>×</button>
                      </div>
                    ))}
                    <button type="button" className="jb-polaroid jb-tap" onClick={() => fileRef.current?.click()} aria-label="Tambah foto"
                      style={{ transform: `rotate(${jurnalCur.foto.length % 2 === 0 ? -3 : 3}deg)`, border: 'none', cursor: 'pointer' }}>
                      <span style={{ width: '100%', height: '100%', borderRadius: 3, border: '2px dashed #F4C6DC', background: '#FFF8FB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Plus size={22} stroke={C.pinkTinta} sw={2.4} />
                        <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: 11.5, color: C.pinkTinta }}>Tambah</span>
                      </span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={ev => { void onPilihFoto(ev.target.files?.[0]); ev.target.value = ''; }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Foto ukuran penuh */}
      {pathBesar && (
        <div role="dialog" aria-modal="true" aria-label="Foto jurnal" onClick={() => setFotoBesar(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(40,18,32,.86)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 16px 24px' }}>
          <button type="button" onClick={() => setFotoBesar(null)} aria-label="Tutup foto"
            style={{ position: 'absolute', top: 14, right: 14, width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.16)', color: '#fff', fontSize: 22, lineHeight: '40px', cursor: 'pointer' }}>×</button>
          {urlMap[pathBesar]
            ? <img src={urlMap[pathBesar]} alt={`Foto jurnal ${fmt(iso, { day: 'numeric', month: 'long' })}`} onClick={e => e.stopPropagation()}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 30px 60px -20px rgba(0,0,0,.6)', background: '#fff' }} />
            : <span style={{ color: '#fff', fontFamily: 'Nunito,sans-serif' }}>memuat…</span>}
          {jmlFoto > 1 && (
            <>
              <button type="button" aria-label="Foto sebelumnya" onClick={e => { e.stopPropagation(); setFotoBesar(i => (i == null ? i : (i - 1 + jmlFoto) % jmlFoto)); }}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.16)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Svg size={20} stroke="#fff" sw={2.6}><path d="m15 5-7 7 7 7" /></Svg>
              </button>
              <button type="button" aria-label="Foto berikutnya" onClick={e => { e.stopPropagation(); setFotoBesar(i => (i == null ? i : (i + 1) % jmlFoto)); }}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.16)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Svg size={20} stroke="#fff" sw={2.6}><path d="m9 5 7 7-7 7" /></Svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
