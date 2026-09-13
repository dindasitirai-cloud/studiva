// Temani — longitudinal guidance (Phase 14, Model C). Perjalanan hari demi hari,
// satu fokus kecil per hari, "Saya akan coba" menulis ke Kelola. Additive.
// STATUS: DRAFT copy — menunggu review Psikolog Fitri Effendy. Tanpa skor/level/persen.
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronRight, Check } from 'lucide-react';
import { useAnakAktif } from '../../context/AnakContext';
import { useAkarStateSync } from '../akar-keluarga/state';
import type { NilaiAkar } from '../akar-keluarga/content';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { tanggalDariTimestampWIB } from '@studiva/shared';
import { tambahKustomKeTanggal, getPilihanHarianRentang, setSelesaiKustom } from '../../lib/supabase/rekah';
import { dispatchRekahError } from '../../utils/rekahApiError';
import { Btn } from '../rekah-journey/ui/brand';
import { TEMANI_JOURNEYS, journeysUntuk } from './temaniSeed';
import { kebiasaanById } from './temaniSeed';
import type { TemaniJourney, TemaniHari } from './temaniSeed';
import JurnalTemani from './JurnalTemani';
import { Ornament, Bloom } from './ornamen';

type Layar = 'beranda' | 'hari' | 'reflect' | 'selesai' | 'jurnal';
type HasilRefleksi = 'menyenangkan' | 'terlalu_sulit' | 'kurang_cocok';

interface Progres {
  slug: string;
  hari: number;
  status: 'aktif' | 'selesai';
  refleksi: Record<number, HasilRefleksi>;
  mulaiTanggal?: string;
}

function rentangTanggal(awal: string, akhir: string): string[] {
  const out: string[] = [];
  const d = new Date(`${awal}T00:00:00Z`);
  const end = new Date(`${akhir}T00:00:00Z`);
  let guard = 0;
  while (d.getTime() <= end.getTime() && guard < 120) { out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); guard++; }
  return out.length ? out : [akhir];
}

function tanggalPlus(awal: string, tambah: number): string {
  const d = new Date(`${awal}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + tambah);
  return d.toISOString().slice(0, 10);
}

function kunci(idAnak: string): string { return `rekah_temani_${idAnak}`; }
function bacaProgres(idAnak: string): Progres | null {
  try { const raw = window.localStorage.getItem(kunci(idAnak)); return raw ? (JSON.parse(raw) as Progres) : null; } catch { return null; }
}
function simpanProgres(idAnak: string, p: Progres | null) {
  try { if (p) window.localStorage.setItem(kunci(idAnak), JSON.stringify(p)); else window.localStorage.removeItem(kunci(idAnak)); } catch { /* abaikan */ }
}

const LABEL_REFLEKSI: Record<HasilRefleksi, string> = {
  menyenangkan: '🙂 Menyenangkan', terlalu_sulit: '😮‍💨 Terlalu sulit', kurang_cocok: '🤔 Kurang cocok',
};
const ADAPTASI: Record<HasilRefleksi, string> = {
  menyenangkan: 'Karena tadi menyenangkan, besok kita lanjutkan cara yang sama dan tambah sedikit.',
  terlalu_sulit: 'Karena tadi terasa berat, besok kita coba versi yang lebih ringan.',
  kurang_cocok: 'Tidak apa-apa. Besok kita coba pendekatan lain dengan tujuan yang sama.',
};

function Dots({ total, aktif, terang }: { total: number; aktif: number; terang?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Hari ${aktif} dari ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} aria-hidden className={`h-2.5 w-2.5 rounded-full ${i < aktif ? (terang ? 'bg-white' : 'bg-rekah') : (terang ? 'bg-white/40' : 'bg-rose-soft')}`} />
      ))}
    </span>
  );
}

const TMN_CSS = `
@keyframes tmnUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes tmnSway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
.tmn .rise{opacity:0;animation:tmnUp .5s cubic-bezier(.2,.7,.2,1) both}
.tmn .sway{animation-name:tmnSway;animation-duration:10s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;transform-origin:bottom center}
.tmn .card{transition:transform .22s cubic-bezier(.2,.7,.2,1),box-shadow .22s ease}
.tmn .lift:hover{transform:translateY(-3px);box-shadow:0 22px 44px -34px rgba(90,50,70,.55)}
.tmn .tap{transition:transform .16s cubic-bezier(.2,.7,.2,1)}
.tmn .tap:active{transform:scale(.97)}
.tmn .grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:22px;align-items:start}
.tmn .cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
@media(max-width:900px){.tmn .grid{grid-template-columns:1fr}}
@media(max-width:560px){.tmn .cards{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.tmn .rise{animation:none;opacity:1}.tmn .sway{animation:none}}
`;

const MODAL_CSS = `
@keyframes tmnVeil{from{opacity:0}to{opacity:1}}
@keyframes tmnPopIn{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
@keyframes tmnMSway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
.tmn-modal .veil{animation:tmnVeil .22s ease both}
.tmn-modal .pop{animation:tmnPopIn .28s cubic-bezier(.2,.7,.2,1) both}
.tmn-modal .msway{animation:tmnMSway 14s ease-in-out infinite;transform-origin:bottom center}
.tmn-modal .tap{transition:transform .16s cubic-bezier(.2,.7,.2,1)}
.tmn-modal .tap:active{transform:scale(.97)}
@media(prefers-reduced-motion:reduce){.tmn-modal .veil,.tmn-modal .pop,.tmn-modal .msway{animation:none}.tmn-modal .tap:active{transform:none}}
`;

function TopBar({ onClose, onBack }: { onClose: () => void; onBack?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <button type="button" className="tap font-nunito" onClick={onBack ?? onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, borderRadius: 999, padding: '8px 15px', background: 'rgba(255,255,255,.8)', border: 0, cursor: 'pointer', color: '#B4477F', fontWeight: 800, fontSize: 13.5 }}>
        <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>←</span> Kembali
      </button>
      <button type="button" aria-label="Tutup" className="tap font-nunito" onClick={onClose} style={{ width: 32, height: 32, flex: 'none', borderRadius: '50%', background: 'rgba(255,255,255,.8)', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#B4477F', cursor: 'pointer', lineHeight: 1 }}>×</button>
    </div>
  );
}

function ModalShell({ onClose, labelId, children }: { onClose: () => void; labelId?: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const pemicu = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const daftarFokus = () => node ? Array.from(node.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"]),input,textarea')).filter(el => !el.hasAttribute('disabled')) : [];
    const t = window.setTimeout(() => { (daftarFokus()[0] ?? node)?.focus(); }, 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'Tab') {
        const f = daftarFokus(); if (f.length === 0) return;
        const pertama = f[0], terakhir = f[f.length - 1], aktif = document.activeElement;
        if (e.shiftKey && (aktif === pertama || aktif === node)) { e.preventDefault(); terakhir.focus(); }
        else if (!e.shiftKey && aktif === terakhir) { e.preventDefault(); pertama.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.clearTimeout(t); document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; if (pemicu && typeof pemicu.focus === 'function') pemicu.focus(); };
  }, [onClose]);
  return (
    <div className="tmn-modal" role="dialog" aria-modal="true" aria-labelledby={labelId} style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', boxSizing: 'border-box' }}>
      <style>{MODAL_CSS}</style>
      <div className="veil" onClick={onClose} aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(90,46,71,.42)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }} />
      <div ref={ref} tabIndex={-1} className="pop" style={{ position: 'relative', width: 440, maxWidth: '100%', maxHeight: '100%', overflowX: 'hidden', overflowY: 'auto', boxSizing: 'border-box', borderRadius: 26, background: 'linear-gradient(160deg,#FFF6FB 0%,#FDEFF6 55%,#F7E9FA 100%)', boxShadow: '0 40px 90px -40px rgba(90,50,70,.75)', outline: 'none' }}>
        <div style={{ display: 'flex', height: 7 }}>
          <span style={{ flex: 2, background: '#F06BA8', display: 'block' }} />
          <span style={{ flex: 1, background: '#F8B9D4', display: 'block' }} />
          <span style={{ flex: 1.4, background: '#FFE29A', display: 'block' }} />
          <span style={{ flex: 1, background: '#C9B8F0', display: 'block' }} />
          <span style={{ flex: 1.6, background: '#8FB8F7', display: 'block' }} />
        </div>
        <span aria-hidden className="msway" style={{ position: 'absolute', right: -6, bottom: -8, width: 96, height: 140, opacity: 0.26, pointerEvents: 'none' }}>
          <Ornament type="sprig" bloom="#C9B8F0" bloom2="#EFE9FD" />
        </span>
        <div style={{ position: 'relative', padding: '13px 18px 16px' }}>{children}</div>
      </div>
    </div>
  );
}

export default function TemaniPage() {
  const { anak } = useAnakAktif();
  const idAnak = anak.id;
  const [akarState] = useAkarStateSync(idAnak);
  const { profile, sapaan, usiaBulan } = useChildProfile();
  const nama = profile.namaAnak || sapaan.cap || 'si kecil';
  const nilaiKeluarga = (akarState.nilai as NilaiAkar[]) ?? [];
  const tanggalHariIni = useMemo(() => tanggalDariTimestampWIB(new Date().toISOString()), []);

  const [progres, setProgres] = useState<Progres | null>(() => bacaProgres(idAnak));
  useEffect(() => { setProgres(bacaProgres(idAnak)); }, [idAnak]);
  const perbarui = useCallback((p: Progres | null) => { simpanProgres(idAnak, p); setProgres(p); }, [idAnak]);

  const [layar, setLayar] = useState<Layar>('beranda');
  const [whyOpen, setWhyOpen] = useState(false);
  const [refleksiPilih, setRefleksiPilih] = useState<HasilRefleksi | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [modalJ, setModalJ] = useState<TemaniJourney | null>(null);        // pratinjau hari-1 (kartu Perjalanan lain)
  const [konfirmJ, setKonfirmJ] = useState<TemaniJourney | null>(null);    // pop-up "Tambahkan ke Kelola?"
  const [daftarOpen, setDaftarOpen] = useState(false);                     // daftar hari 1..N (Lanjutkan)
  const [refleksiHari, setRefleksiHari] = useState<number | null>(null);   // refleksi terpisah untuk satu hari
  const [alasanOpen, setAlasanOpen] = useState(false);
  const [selesaiIds, setSelesaiIds] = useState<Set<string>>(() => new Set());

  const cocok = useMemo(() => journeysUntuk(usiaBulan, nilaiKeluarga), [usiaBulan, nilaiKeluarga]);
  const pratinjau = cocok.length === 0; // sementara: tampilkan semua agar bisa menata UI
  const saran = pratinjau ? TEMANI_JOURNEYS : cocok;

  const journeyAktif: TemaniJourney | null = useMemo(
    () => (progres ? TEMANI_JOURNEYS.find(j => j.slug === progres.slug) ?? null : null), [progres],
  );
  const hariIni: TemaniHari | null = useMemo(() => {
    if (!journeyAktif || !progres) return null;
    return journeyAktif.hari.find(h => h.hari === progres.hari) ?? null;
  }, [journeyAktif, progres]);

  // ── Pop-up detail perjalanan (design_handoff_temani_popup) ────────────────
  const idKegiatan = (slug: string, n: number) => `temani-${slug}-h${n}`;
  const itemKelola = (j: TemaniJourney, h: TemaniHari) => ({
    id: idKegiatan(j.slug, h.hari),
    judul: h.fokus.length > 64 ? `${h.fokus.slice(0, 62)}…` : h.fokus,
    tipe: 'aktivitas' as const, domain: 'sos', nilai: j.nilaiTerkait, pemilik: 'anak' as const,
    sumberId: idKegiatan(j.slug, h.hari), kustom: true, kategoriKustom: 'momen' as const,
    keteranganKapan: 'Dari Temani', deskripsiKustom: h.script,
  });

  const bukaModal = (j: TemaniJourney) => { setAlasanOpen(false); setModalJ(j); };

  // Status "selesai" per hari dibaca dari Kelola (sumber tunggal) sepanjang rentang perjalanan.
  const muatSelesai = useCallback(async () => {
    if (!journeyAktif || !progres) { setSelesaiIds(new Set()); return; }
    const mulai = progres.mulaiTanggal ?? tanggalHariIni;
    const tgls = rentangTanggal(mulai, tanggalPlus(mulai, journeyAktif.durasiHari - 1));
    try {
      const rows = await getPilihanHarianRentang(idAnak, tgls);
      const prefix = `temani-${journeyAktif.slug}-h`;
      const set = new Set<string>();
      for (const t of Object.keys(rows)) {
        const sel = (rows[t]?.diff as { selesai?: unknown } | null)?.selesai;
        if (Array.isArray(sel)) for (const id of sel) if (typeof id === 'string' && id.startsWith(prefix)) set.add(id);
      }
      setSelesaiIds(set);
    } catch (e) { console.error('[Temani] gagal memuat status selesai:', e); }
  }, [journeyAktif, progres, idAnak, tanggalHariIni]);
  useEffect(() => { void muatSelesai(); }, [muatSelesai]);

  // Mulai perjalanan; opsional tulis langkah hari-1 ke Kelola (pilihan pop-up "Tambahkan ke Kelola?").
  const mulaiPerjalanan = async (j: TemaniJourney, tulisKelola: boolean) => {
    perbarui({ slug: j.slug, hari: 1, status: 'aktif', refleksi: {}, mulaiTanggal: tanggalHariIni });
    setKonfirmJ(null); setModalJ(null);
    if (!tulisKelola) return;
    try {
      await Promise.all(j.hari.map(h => tambahKustomKeTanggal(idAnak, tanggalPlus(tanggalHariIni, h.hari - 1), itemKelola(j, h))));
      setToast('Perjalanan ditambahkan ke Kelola — hari ini dan hari-hari berikutnya.');
      void muatSelesai();
    } catch (e) { console.error('[Temani] gagal menambah ke Kelola:', e); dispatchRekahError('Koneksi terputus — perjalanan belum masuk Kelola. Coba lagi ya.'); }
  };

  // Tandai/lepas satu hari — dua arah dengan Kelola (sumber tunggal status selesai).
  const toggleTandai = async (j: TemaniJourney, h: TemaniHari) => {
    const id = idKegiatan(j.slug, h.hari);
    const tgl = tanggalPlus(progres?.mulaiTanggal ?? tanggalHariIni, h.hari - 1);
    const sudah = selesaiIds.has(id);
    try {
      if (!sudah) {
        await tambahKustomKeTanggal(idAnak, tgl, itemKelola(j, h));
        await setSelesaiKustom(idAnak, tgl, id, true);
        setSelesaiIds(prev => { const set = new Set(prev); set.add(id); return set; });
        setDaftarOpen(false); setRefleksiPilih(null); setRefleksiHari(h.hari);
      } else {
        await setSelesaiKustom(idAnak, tgl, id, false);
        setSelesaiIds(prev => { const set = new Set(prev); set.delete(id); return set; });
      }
      void muatSelesai();
    } catch (e) { console.error('[Temani] gagal menandai:', e); dispatchRekahError('Koneksi terputus — tanda selesai belum tersimpan. Coba lagi ya.'); }
  };

  const simpanRefleksi = (n: number, hasil: HasilRefleksi) => {
    if (!progres) return;
    perbarui({ ...progres, refleksi: { ...progres.refleksi, [n]: hasil } });
    setRefleksiPilih(null); setRefleksiHari(null); setDaftarOpen(true);
  };
  const tutupRefleksi = () => { setRefleksiPilih(null); setRefleksiHari(null); setDaftarOpen(true); };

  const coba = async () => {
    if (!journeyAktif || !hariIni) return;
    const item = {
      id: `temani-${journeyAktif.slug}-h${hariIni.hari}-${Date.now().toString(36)}`,
      judul: hariIni.fokus.length > 64 ? `${hariIni.fokus.slice(0, 62)}…` : hariIni.fokus,
      tipe: 'aktivitas' as const, domain: 'sos', nilai: journeyAktif.nilaiTerkait, pemilik: 'anak' as const,
      sumberId: `temani-${journeyAktif.slug}-h${hariIni.hari}`, kustom: true, kategoriKustom: 'momen' as const,
      keteranganKapan: 'Dari Temani', deskripsiKustom: hariIni.script,
    };
    try { await tambahKustomKeTanggal(idAnak, tanggalHariIni, item); setToast('Ditambahkan ke Kelola untuk hari ini.'); setRefleksiPilih(null); setLayar('reflect'); }
    catch (e) { console.error('[Temani] gagal menambah ke Kelola:', e); dispatchRekahError('Koneksi terputus — langkah tadi belum masuk Kelola. Coba lagi ya.'); }
  };

  const commitRefleksi = (hasil: HasilRefleksi) => {
    if (!journeyAktif || !progres) return;
    const refleksi = { ...progres.refleksi, [progres.hari]: hasil };
    const berikut = progres.hari + 1;
    if (berikut > journeyAktif.durasiHari) { perbarui({ ...progres, refleksi, status: 'selesai' }); setLayar('selesai'); }
    else { perbarui({ ...progres, refleksi, hari: berikut }); setWhyOpen(false); setLayar('beranda'); }
    setRefleksiPilih(null); setToast(null);
  };

  const jadikanRutinitas = async () => {
    if (!journeyAktif) return;
    const kb = kebiasaanById(journeyAktif.kebiasaanUtama);
    // Kelulusan mengADOPSI Kebiasaan Baik (satu sumber, bukan menyalin). Id di-key pada
    // praktik → guard dedupe di tambahKustomKeTanggal mencegah double lintas-sumber.
    const idPraktik = kb ? `kebiasaan-${kb.id}` : `temani-rutin-${journeyAktif.slug}`;
    const item = {
      id: idPraktik, judul: kb ? kb.judul : `Rutinitas: ${journeyAktif.judul}`,
      tipe: 'aktivitas' as const, domain: 'sos', nilai: journeyAktif.nilaiTerkait, pemilik: 'anak' as const,
      sumberId: idPraktik, kustom: true, kategoriKustom: 'rencana' as const, kebiasaanId: kb?.id,
      keteranganKapan: 'Dari Temani', deskripsiKustom: kb ? kb.deskripsi : 'Kebiasaan yang dipilih untuk dilanjutkan.',
    };
    try { await tambahKustomKeTanggal(idAnak, tanggalHariIni, item); perbarui(null); setToast('Disimpan sebagai rutinitas di Kelola.'); setLayar('beranda'); }
    catch (e) { console.error('[Temani] gagal menyimpan rutinitas:', e); dispatchRekahError('Koneksi terputus — rutinitas tadi belum tersimpan. Coba lagi ya.'); }
  };

  const Toast = () => toast ? (
    <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#c3ddba] bg-[#EAF6E4] px-3 py-2.5 text-[13px] font-bold text-[#4d7a47]"><Check className="h-4 w-4" aria-hidden /> {toast}</div>
  ) : null;

  // ── T1: Beranda perjalanan ────────────────────────────────────────────────
  const Beranda = () => {
    const jAktif = journeyAktif && progres ? journeyAktif : null;
    const hari = jAktif ? jAktif.hari.filter(h => selesaiIds.has(idKegiatan(jAktif.slug, h.hari))).length : 0;
    const lain = saran.filter(j => j.slug !== journeyAktif?.slug);
    const kebun: { type: 'sprig' | 'tulip' | 'leaf' | 'daisy' | 'foliage' | 'bell'; bloom?: string; bloom2?: string; center?: string; w: number; h: number; d: string }[] = [
      { type: 'sprig', bloom: '#C9B8F0', bloom2: '#EFE9FD', w: 34, h: 50, d: '8s' },
      { type: 'tulip', bloom: '#F06BA8', bloom2: '#F8B9D4', w: 42, h: 64, d: '11s' },
      { type: 'leaf', w: 30, h: 44, d: '9s' },
      { type: 'daisy', bloom: '#FFE29A', bloom2: '#FFF3E6', center: '#F06BA8', w: 46, h: 70, d: '12s' },
      { type: 'foliage', w: 32, h: 52, d: '10s' },
      { type: 'bell', bloom: '#8FB8F7', bloom2: '#DCEAFD', w: 38, h: 58, d: '9.5s' },
    ];
    const kartu = (i: number) => (i % 2 === 0
      ? { border: '#E4D8FA', ornType: 'sprig' as const, ornB: '#C9B8F0', ornB2: '#EFE9FD', d: '13s' }
      : { border: '#FBDDEC', ornType: 'tulip' as const, ornB: '#F8B9D4', ornB2: '#FFF1F7', d: '11s' });
    return (
      <div className="tmn">
        <style>{TMN_CSS}</style>

        {/* Hero */}
        <div className="rise" style={{ position: 'relative', overflow: 'hidden', borderRadius: 32, background: 'linear-gradient(120deg,#FBD9E9 0%,#F6DCF3 34%,#E6DDFB 62%,#DCEAFD 100%)', boxShadow: '0 26px 54px -40px rgba(90,50,70,.55)', marginBottom: 24 }}>
          <div style={{ display: 'flex', height: 7 }}>
            <span style={{ flex: 2, background: '#F06BA8' }} />
            <span style={{ flex: 1, background: '#F8B9D4' }} />
            <span style={{ flex: 1.4, background: '#FFE29A' }} />
            <span style={{ flex: 1, background: '#C9B8F0' }} />
            <span style={{ flex: 1.6, background: '#8FB8F7' }} />
          </div>
          <div aria-hidden style={{ position: 'absolute', right: 24, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 6, pointerEvents: 'none', opacity: 0.75 }}>
            {kebun.map((k, i) => (
              <span key={i} className="sway" style={{ width: k.w, height: k.h, display: 'block', animationDuration: k.d }}>
                <Ornament type={k.type} bloom={k.bloom} bloom2={k.bloom2} center={k.center} />
              </span>
            ))}
          </div>
          <div style={{ position: 'relative', padding: '26px 34px 30px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.75)', borderRadius: 999, padding: '6px 14px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F06BA8', display: 'block' }} />
              <span className="font-nunito" style={{ fontWeight: 800, fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', color: '#B4477F' }}>Temani</span>
            </span>
            <h1 className="font-shantell" style={{ fontWeight: 700, fontSize: 52, color: '#6E3B57', margin: '12px 0 0', letterSpacing: -1, lineHeight: 0.98 }}>Mari kita jalani bersama</h1>
            <div className="font-nunito" style={{ fontWeight: 600, fontSize: 17, color: '#7A4A64', marginTop: 8 }}>Pelan-pelan saja — satu langkah kecil tiap hari, bersama {nama}.</div>
          </div>
        </div>

        {/* Body */}
        <div className="grid">
          {/* Kolom kiri */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
            {/* Progres perjalanan */}
            <div className="rise" style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: 'linear-gradient(150deg,#FDF0F7 0%,#FBEAF4 52%,#F7E9FA 100%)', boxShadow: '0 22px 48px -40px rgba(90,50,70,.55)' }}>
              <span aria-hidden className="sway" style={{ position: 'absolute', right: -6, bottom: -10, width: 104, height: 150, opacity: 0.32, pointerEvents: 'none', animationDuration: '14s' }}>
                <Ornament type="daisy" bloom="#F8B9D4" bloom2="#FFF1F7" center="#FFE29A" />
              </span>
              <div style={{ position: 'relative', padding: '22px 26px 26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 6, height: 26, borderRadius: 999, background: '#F06BA8', display: 'block' }} />
                  <h2 className="font-fredoka" style={{ fontWeight: 600, fontSize: 24, color: '#C6407F', margin: 0 }}>Progres perjalanan</h2>
                </div>
                {jAktif ? (
                  <>
                    <div className="font-nunito" style={{ fontWeight: 700, fontSize: 14, color: '#7A4A64', marginTop: 9 }}>{jAktif.judul}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
                      <div aria-hidden style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        {Array.from({ length: jAktif.durasiHari }).map((_, i) => (
                          <span key={i} style={{ width: i < hari ? 13 : 11, height: i < hari ? 13 : 11, borderRadius: '50%', background: i < hari ? '#F0479B' : '#F8C4DC', display: 'block' }} />
                        ))}
                      </div>
                      <span className="font-nunito" style={{ fontWeight: 800, fontSize: 14.5, color: '#B4477F', background: '#FFF1F7', borderRadius: 999, padding: '5px 13px' }}>{hari} dari {jAktif.durasiHari} hari selesai</span>
                    </div>
                    <div style={{ height: 9, borderRadius: 999, background: '#FBDDEC', marginTop: 16, overflow: 'hidden', maxWidth: 420 }}>
                      <div style={{ width: `${Math.round((hari / jAktif.durasiHari) * 100)}%`, height: '100%', borderRadius: 999, background: '#F06BA8' }} />
                    </div>
                    <button onClick={() => setDaftarOpen(true)} className="tap font-nunito" style={{ display: 'inline-flex', alignItems: 'center', gap: 11, marginTop: 20, borderRadius: 999, padding: '15px 28px', cursor: 'pointer', border: 0, background: '#F0479B', boxShadow: '0 18px 32px -20px rgba(240,71,155,.95)' }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFE29A', display: 'block' }} />
                      <span style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>Lanjutkan</span>
                      <span style={{ fontWeight: 800, fontSize: 16, color: '#fff', lineHeight: 1 }}>→</span>
                    </button>
                  </>
                ) : (
                  <p className="font-nunito" style={{ fontWeight: 600, fontSize: 14, color: '#7A4A64', marginTop: 10, lineHeight: 1.5 }}>Belum ada perjalanan aktif. Pilih satu perjalanan di bawah untuk mulai ditemani, langkah demi langkah.</p>
                )}
              </div>
            </div>

            {/* Perjalanan lain */}
            <div className="rise">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#8B6FD6', display: 'block' }} />
                <h3 className="font-nunito" style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: '#8A5A74', margin: 0 }}>{journeyAktif ? 'Perjalanan lain' : 'Mulai perjalanan baru'}</h3>
                <div style={{ flex: 1, height: 1.5, background: 'rgba(110,59,87,.1)' }} />
                {pratinjau && <span className="font-nunito" style={{ fontWeight: 800, fontSize: 12.5, color: '#8A5510', background: '#FFE29A', borderRadius: 999, padding: '5px 13px' }}>Pratinjau</span>}
              </div>
              {lain.length === 0 ? (
                <p className="font-nunito" style={{ fontSize: 14, color: '#7A4A64' }}>Belum ada perjalanan lain yang cocok untuk saat ini.</p>
              ) : (
                <div className="cards">
                  {lain.map((j, i) => {
                    const k = kartu(i);
                    return (
                      <button key={j.slug} onClick={() => bukaModal(j)} className="card lift tap" style={{ position: 'relative', overflow: 'hidden', background: '#fff', borderRadius: 24, padding: '20px 22px 22px', boxShadow: '0 20px 42px -34px rgba(90,50,70,.55)', border: `2px solid ${k.border}`, cursor: 'pointer', textAlign: 'left' }}>
                        <span aria-hidden className="sway" style={{ position: 'absolute', right: -10, top: -6, width: 66, height: 100, opacity: 0.22, pointerEvents: 'none', animationDuration: k.d }}>
                          <Ornament type={k.ornType} bloom={k.ornB} bloom2={k.ornB2} />
                        </span>
                        <div style={{ position: 'relative' }}>
                          <div className="font-fredoka" style={{ fontWeight: 600, fontSize: 19, color: '#6E3B57', lineHeight: 1.25 }}>{j.judul}</div>
                          <p className="font-nunito" style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.55, color: '#7A4A64', margin: '9px 0 0' }}>{j.deskripsi}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 999, padding: '6px 13px', background: '#DCEAFD' }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5F84E6', display: 'block' }} />
                              <span className="font-nunito" style={{ fontWeight: 800, fontSize: 12.5, color: '#2F5BB7' }}>{j.durasiHari} hari</span>
                            </span>
                            {j.nilaiTerkait.map(n => (
                              <span key={n} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 999, padding: '6px 13px', background: '#E4F2C4' }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6E9C4A', display: 'block' }} />
                                <span className="font-nunito" style={{ fontWeight: 800, fontSize: 12.5, color: '#4A6E2E' }}>{n}</span>
                              </span>
                            ))}
                            {j.status !== 'disetujui' && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 999, padding: '6px 13px', background: '#FFE29A' }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E0A63A', display: 'block' }} />
                                <span className="font-nunito" style={{ fontWeight: 800, fontSize: 12.5, color: '#8A5510' }}>Draft</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <Toast />
          </div>

          {/* Rel kanan */}
          <div className="rise" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <button onClick={() => setLayar('jurnal')} aria-label="Buka Buku Perjalanan" className="card lift tap" style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: 'linear-gradient(165deg,#6E3B57 0%,#5A2E47 100%)', boxShadow: '0 26px 52px -34px rgba(90,50,70,.85)', cursor: 'pointer', border: 0, width: '100%', textAlign: 'left' }}>
              <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 9, background: 'linear-gradient(180deg,#F06BA8 0%,#F890BE 100%)' }} aria-hidden />
              <span aria-hidden className="sway" style={{ position: 'absolute', right: -14, bottom: -16, width: 120, height: 172, opacity: 0.18, pointerEvents: 'none', animationDuration: '15s' }}>
                <Ornament type="foliage" bloom="#F8B9D4" bloom2="#FFF1F7" />
              </span>
              <div style={{ position: 'relative', padding: '24px 24px 22px 30px' }}>
                <div className="font-shantell" style={{ fontWeight: 600, fontSize: 17, color: '#F8B9D4' }}>jurnal</div>
                <div className="font-fredoka" style={{ fontWeight: 600, fontSize: 22, color: '#fff', lineHeight: 1.2, marginTop: 5 }}>Buku Perjalanan {nama}</div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0 34px' }}>
                  <span className="sway" style={{ width: 104, height: 104, display: 'block', animationDuration: '9s' }}>
                    <img src="/images/logo-rekah-removebg.png" alt="Rekah" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 16, borderTop: '1.5px dashed rgba(248,185,212,.4)' }}>
                  <span className="font-nunito" style={{ fontWeight: 700, fontSize: 14, color: '#F8D8E6' }}>Catatan harian</span>
                  <span className="font-nunito" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, padding: '10px 18px', background: 'rgba(255,255,255,.16)', fontWeight: 800, fontSize: 14, color: '#fff' }}>Buka <span style={{ lineHeight: 1 }}>→</span></span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer quote */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '30px 0 0' }}>
          <span aria-hidden className="sway" style={{ width: 26, height: 40, opacity: 0.7, display: 'block', animationDuration: '10s' }}><Ornament type="daisy" bloom="#F8B9D4" bloom2="#FFF3E6" center="#FFE29A" /></span>
          <div className="font-shantell" style={{ fontWeight: 600, fontSize: 16, color: '#B4477F', textAlign: 'center' }}>Pelan-pelan saja — satu langkah kecil tiap hari.</div>
          <span aria-hidden className="sway" style={{ width: 26, height: 40, opacity: 0.7, display: 'block', animationDuration: '12s' }}><Ornament type="tulip" bloom="#C9B8F0" bloom2="#EFE9FD" /></span>
        </div>
      </div>
    );
  };


  // ── T3: Layar hari ────────────────────────────────────────────────────────
  const Hari = () => {
    if (!journeyAktif || !hariIni || !progres) return null;
    return (
      <>
        <button onClick={() => setLayar('beranda')} className="mb-3 inline-flex items-center gap-1 font-nunito text-[13px] text-pekat/70"><ArrowLeft className="h-4 w-4" /> Kembali</button>
        <div className="flex items-center justify-between">
          <Dots total={journeyAktif.durasiHari} aktif={progres.hari} />
          <span className="font-nunito text-[13px] font-extrabold text-pekat/70">Hari {progres.hari} dari {journeyAktif.durasiHari}</span>
        </div>
        <h1 className="mt-3 font-fredoka text-[24px] font-semibold leading-tight text-pekat">Hari ini cukup satu hal.</h1>

        <div className="mt-3 rounded-2xl border border-[#f4d8c2] bg-fajar p-4">
          <div className="font-fredoka text-[16px] font-semibold text-pekat">{hariIni.fokus}</div>
          {hariIni.jenis && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-white/70 px-1.5 py-0.5 font-nunito text-[10px] font-extrabold uppercase tracking-wide text-pekat/70">
                {hariIni.jenis === 'target' ? '🔁 Menuju kebiasaan' : '🧩 Langkah menemani'}
              </span>
              {hariIni.jenis === 'target' && kebiasaanById(hariIni.kebiasaanId) && (
                <span className="font-nunito text-[11.5px] text-pekat/70">{kebiasaanById(hariIni.kebiasaanId)!.judul}</span>
              )}
            </div>
          )}
          {hariIni.script && <div className="mt-3 rounded-2xl bg-rose-soft/60 px-4 py-3 font-shantell text-[15px] leading-snug text-pekat">"{hariIni.script}"</div>}

          {(hariIni.kenapaSederhana || hariIni.kenapaEvidence) && (
            <div className="mt-3 border-l-[3px] border-rekah pl-3">
              <button onClick={() => setWhyOpen(o => !o)} aria-expanded={whyOpen} className="flex items-center gap-1.5 font-nunito text-[12.5px] font-extrabold text-rekah">
                <ChevronRight className={`h-4 w-4 transition ${whyOpen ? 'rotate-90' : ''}`} aria-hidden /> Kenapa ini membantu?
              </button>
              {whyOpen && (
                <div className="mt-2 font-nunito text-[12.5px] leading-relaxed text-pekat/75">
                  {hariIni.kenapaSederhana}
                  {hariIni.kenapaEvidence && (
                    <div className="mt-2 flex items-start gap-2"><span className="rounded-md bg-langit/30 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-pekat">catatan</span><span>{hariIni.kenapaEvidence}</span></div>
                  )}
                  {hariIni.kenapaSumber ? (
                    <div className="mt-2 flex items-start gap-2"><span className="rounded-md bg-langit/30 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-pekat">sumber</span><span>{hariIni.kenapaSumber}</span></div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        <Btn full className="mt-4" onClick={() => { void coba(); }}>Saya akan coba</Btn>
        <p className="mt-2 text-center font-nunito text-[13px] text-pekat/70">Besok kita lihat bagaimana responsnya.</p>
        <button onClick={() => setLayar('beranda')} className="mx-auto mt-2 block font-nunito text-[12px] text-pekat/60 underline">Nanti saja</button>
      </>
    );
  };

  // ── T4: Refleksi harian ───────────────────────────────────────────────────
  const Reflect = () => {
    if (!journeyAktif || !progres) return null;
    const terakhir = progres.hari >= journeyAktif.durasiHari;
    return (
      <>
        <h1 className="font-fredoka text-[24px] font-semibold leading-tight text-pekat">Bagaimana tadi?</h1>
        <p className="mt-1 font-nunito text-[14px] text-pekat/70">Bukan penilaian — hanya supaya besok bisa menyesuaikan.</p>
        <Toast />
        <div className="mt-4 space-y-2">
          {(Object.keys(LABEL_REFLEKSI) as HasilRefleksi[]).map(h => {
            const dipilih = refleksiPilih === h;
            return (
              <button key={h} onClick={() => setRefleksiPilih(h)} aria-pressed={dipilih}
                className={`w-full rounded-2xl border px-4 py-3 text-left font-nunito text-[14px] font-bold transition ${dipilih ? 'bg-fajar text-pekat' : 'bg-white text-pekat'}`}
                style={{ borderColor: dipilih ? '#F2C6D8' : '#F0DCE6' }}>
                {LABEL_REFLEKSI[h]}
              </button>
            );
          })}
        </div>

        {refleksiPilih && (
          <div className="mt-4 rounded-2xl border border-[#c3ddba] bg-[#EAF6E4] p-4">
            <div className="font-nunito text-[12.5px] font-extrabold text-[#4d7a47]">Rekah menyesuaikan untuk besok</div>
            <div className="mt-1.5 font-nunito text-[13px] leading-relaxed text-[#3f6b3a]">{ADAPTASI[refleksiPilih]}</div>
            <Btn full className="mt-3" onClick={() => commitRefleksi(refleksiPilih)}>{terakhir ? 'Lihat ringkasan' : 'Lanjut ke besok'}</Btn>
          </div>
        )}
        <button onClick={() => { setRefleksiPilih(null); setLayar('beranda'); }} className="mx-auto mt-4 block font-nunito text-[12px] text-pekat/60 underline">Lewati</button>
      </>
    );
  };

  // ── T5: Selesai ───────────────────────────────────────────────────────────
  const Selesai = () => {
    if (!journeyAktif) return null;
    return (
      <>
        <h1 className="font-fredoka text-[24px] font-semibold leading-tight text-pekat">{journeyAktif.durasiHari} hari selesai 🌿</h1>
        <div className="mt-3 rounded-2xl border border-rose-soft bg-[#FFF1F7] p-4 font-nunito text-[14px] leading-relaxed text-pekat">
          Kalian melewatinya bersama. Kalau ada satu langkah yang paling cocok untuk {nama}, kamu bisa menjadikannya rutinitas.
        </div>
        <Btn full className="mt-4" onClick={() => { void jadikanRutinitas(); }}>Jadikan rutinitas di Kelola</Btn>
        <button onClick={() => { perbarui(null); setLayar('beranda'); }} className="mx-auto mt-3 block font-nunito text-[12px] text-pekat/60 underline">Selesai tanpa menyimpan</button>
      </>
    );
  };

  return (
    <div style={{ background: '#FCEBD7' }} className="-mx-5 min-h-screen px-5 pb-14 pt-[34px] sm:-mx-8 sm:px-[46px]">
      <section className={`mx-auto w-full ${layar === 'beranda' ? 'max-w-6xl' : layar === 'jurnal' ? 'max-w-5xl' : 'max-w-md'}`} aria-live="polite">
        {layar === 'beranda' && <Beranda />}
        {layar === 'jurnal' && <JurnalTemani idAnak={idAnak} nama={nama} onKembali={() => setLayar('beranda')} />}
        {layar === 'hari' && <Hari />}
        {layar === 'reflect' && <Reflect />}
        {layar === 'selesai' && <Selesai />}
      </section>

      {/* Pop-up pratinjau hari-1 (dari kartu Perjalanan lain) */}
      {modalJ && (() => {
        const mh = modalJ.hari[0];
        const total = modalJ.durasiHari;
        const alasanBody = mh?.kenapaEvidence || mh?.kenapaSederhana || '';
        return (
          <ModalShell onClose={() => setModalJ(null)} labelId="tmn-modal-title">
            <TopBar onClose={() => setModalJ(null)} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              <div aria-hidden style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {Array.from({ length: total }).map((_, i) => (
                  <span key={i} style={{ width: i < 1 ? 13 : 11, height: i < 1 ? 13 : 11, borderRadius: '50%', background: i < 1 ? '#F0479B' : '#F8C4DC', display: 'block' }} />
                ))}
              </div>
              <span className="font-nunito" style={{ fontWeight: 800, fontSize: 13.5, color: '#B4477F', background: '#FFF1F7', borderRadius: 999, padding: '6px 14px' }}>Hari 1 dari {total}</span>
            </div>
            <h2 id="tmn-modal-title" className="font-shantell" style={{ fontWeight: 700, fontSize: 22, color: '#6E3B57', margin: '12px 0 0', lineHeight: 1.15, letterSpacing: -0.3, overflowWrap: 'break-word' }}>{modalJ.judul}</h2>
            <div style={{ background: '#fff', borderRadius: 20, padding: '15px 17px 16px', marginTop: 12, boxShadow: '0 20px 44px -34px rgba(90,50,70,.55)', border: '2px solid #FBDDEC' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
                <span aria-hidden style={{ width: 5, height: 40, flex: 'none', borderRadius: 999, background: '#F06BA8', display: 'block' }} />
                <div className="font-nunito" style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.35, color: '#6E3B57', minWidth: 0, overflowWrap: 'break-word' }}>{mh?.fokus}</div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, borderRadius: 999, padding: '5px 12px', background: '#E4F2C4' }}>
                <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: '#6E9C4A', display: 'block' }} />
                <span className="font-nunito" style={{ fontWeight: 800, fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', color: '#4A6E2E' }}>Langkah menemani</span>
              </span>
              {mh?.script && (
                <div style={{ borderRadius: 16, padding: '13px 15px', marginTop: 11, background: '#FBDDEC' }}>
                  <div className="font-shantell" style={{ fontWeight: 600, fontSize: 14, color: '#6E3B57', lineHeight: 1.3, overflowWrap: 'break-word' }}>"{mh.script}"</div>
                </div>
              )}
              {alasanBody && (
                <>
                  <button type="button" className="tap" onClick={() => setAlasanOpen(o => !o)} aria-expanded={alasanOpen} aria-controls="tmn-modal-alasan" style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 12, paddingLeft: 12, border: 'none', borderLeft: '4px solid #C9B8F0', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                    <span aria-hidden className="font-nunito" style={{ fontWeight: 800, fontSize: 14, color: '#8B6FD6', lineHeight: 1 }}>{alasanOpen ? '⌄' : '›'}</span>
                    <span className="font-nunito" style={{ fontWeight: 800, fontSize: 15, color: '#7B58C9' }}>Kenapa ini membantu?</span>
                  </button>
                  {alasanOpen && (
                    <p id="tmn-modal-alasan" className="font-nunito" style={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.6, color: '#7A4A64', margin: '10px 0 0', borderRadius: 14, padding: '12px 14px', background: '#EFE9FD', overflowWrap: 'break-word' }}>{alasanBody}</p>
                  )}
                </>
              )}
            </div>
            <button type="button" className="tap" onClick={() => { setKonfirmJ(modalJ); setModalJ(null); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11, marginTop: 14, borderRadius: 999, padding: '14px 24px', cursor: 'pointer', background: '#F0479B', border: 0, width: '100%', boxSizing: 'border-box', boxShadow: '0 20px 34px -20px rgba(240,71,155,.95)' }}>
              <span aria-hidden style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFE29A', display: 'block' }} />
              <span className="font-nunito" style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>Saya akan coba</span>
            </button>
            <div className="font-nunito" style={{ fontWeight: 700, fontSize: 14, color: '#8A5A74', textAlign: 'center', marginTop: 9 }}>Besok kita lihat bagaimana responsnya.</div>
            <button type="button" className="font-nunito" onClick={() => setModalJ(null)} style={{ display: 'block', margin: '9px auto 0', fontWeight: 800, fontSize: 13.5, color: '#B4477F', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline', background: 'transparent', border: 0 }}>Nanti saja</button>
          </ModalShell>
        );
      })()}

      {/* Pop-up "Tambahkan ke Kelola?" */}
      {konfirmJ && (() => {
        const mh = konfirmJ.hari[0];
        const kembali = () => { setModalJ(konfirmJ); setKonfirmJ(null); };
        return (
          <ModalShell onClose={kembali} labelId="tmn-konfirm-title">
            <TopBar onClose={kembali} />
            <h2 id="tmn-konfirm-title" className="font-shantell" style={{ fontWeight: 700, fontSize: 22, color: '#6E3B57', margin: '12px 0 0', lineHeight: 1.15, letterSpacing: -0.3 }}>Tambahkan ke Kelola?</h2>
            <p className="font-nunito" style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.55, color: '#7A4A64', margin: '8px 0 0' }}>Setiap langkah perjalanan akan muncul di halaman Kelola pada harinya masing-masing, supaya mudah kamu tandai saat sudah dilakukan.</p>
            {mh && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '13px 15px', marginTop: 12, border: '2px solid #FBDDEC' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                  <span aria-hidden style={{ width: 5, height: 34, flex: 'none', borderRadius: 999, background: '#F06BA8', display: 'block' }} />
                  <div className="font-nunito" style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.35, color: '#6E3B57', minWidth: 0, overflowWrap: 'break-word' }}>{mh.fokus}</div>
                </div>
              </div>
            )}
            <button type="button" className="tap" onClick={() => { void mulaiPerjalanan(konfirmJ, true); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11, marginTop: 16, borderRadius: 999, padding: '14px 24px', cursor: 'pointer', background: '#F0479B', border: 0, width: '100%', boxSizing: 'border-box', boxShadow: '0 20px 34px -20px rgba(240,71,155,.95)' }}>
              <span aria-hidden style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFE29A', display: 'block' }} />
              <span className="font-nunito" style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>Ya, tambahkan ke Kelola</span>
            </button>
            <button type="button" className="font-nunito tap" onClick={() => { void mulaiPerjalanan(konfirmJ, false); }} style={{ display: 'block', margin: '12px auto 0', fontWeight: 800, fontSize: 14, color: '#B4477F', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline', background: 'transparent', border: 0 }}>Tidak, cukup mulai perjalanan</button>
          </ModalShell>
        );
      })()}

      {/* Pop-up daftar hari 1..N (Lanjutkan) */}
      {daftarOpen && journeyAktif && refleksiHari === null && (() => {
        const j = journeyAktif;
        const jumlahSelesai = j.hari.filter(h => selesaiIds.has(idKegiatan(j.slug, h.hari))).length;
        return (
          <ModalShell onClose={() => setDaftarOpen(false)} labelId="tmn-daftar-title">
            <TopBar onClose={() => setDaftarOpen(false)} />
            <h2 id="tmn-daftar-title" className="font-shantell" style={{ fontWeight: 700, fontSize: 22, color: '#6E3B57', margin: '12px 0 4px', lineHeight: 1.15, letterSpacing: -0.3, overflowWrap: 'break-word' }}>{j.judul}</h2>
            <div className="font-nunito" style={{ fontWeight: 700, fontSize: 13, color: '#8A5A74', marginBottom: 6 }}>{jumlahSelesai} dari {j.durasiHari} hari selesai — tandai tiap langkah, otomatis tersambung ke Kelola.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {j.hari.map(h => {
                const done = selesaiIds.has(idKegiatan(j.slug, h.hari));
                return (
                  <div key={h.hari} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#fff', borderRadius: 16, padding: '13px 14px', border: `2px solid ${done ? '#CDE9B8' : '#FBDDEC'}` }}>
                    <span aria-hidden style={{ width: 26, height: 26, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? '#EAF6E4' : '#FFF1F7', color: done ? '#4d7a47' : '#B4477F', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12.5 }}>{h.hari}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="font-nunito" style={{ fontWeight: 800, fontSize: 14.5, lineHeight: 1.35, color: '#6E3B57', overflowWrap: 'break-word' }}>{h.fokus}</div>
                    </div>
                    <button type="button" className="tap font-nunito" onClick={() => { void toggleTandai(j, h); }} aria-pressed={done} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '7px 13px', cursor: 'pointer', border: done ? 0 : '1.5px solid #F0B6D2', background: done ? '#4CAF7A' : '#fff', color: done ? '#fff' : '#B4477F', fontWeight: 800, fontSize: 12.5 }}>
                      {done ? <><span aria-hidden style={{ lineHeight: 1 }}>✓</span> Selesai</> : 'Tandai'}
                    </button>
                  </div>
                );
              })}
            </div>
            <button type="button" className="font-nunito" onClick={() => setDaftarOpen(false)} style={{ display: 'block', margin: '16px auto 0', fontWeight: 800, fontSize: 13.5, color: '#B4477F', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline', background: 'transparent', border: 0 }}>Tutup</button>
          </ModalShell>
        );
      })()}

      {/* Pop-up refleksi terpisah "Bagaimana tadi?" */}
      {refleksiHari !== null && journeyAktif && (() => {
        const n = refleksiHari;
        return (
          <ModalShell onClose={tutupRefleksi} labelId="tmn-refleksi-title">
            <TopBar onClose={tutupRefleksi} />
            <h2 id="tmn-refleksi-title" className="font-shantell" style={{ fontWeight: 700, fontSize: 22, color: '#6E3B57', margin: '12px 0 0', lineHeight: 1.15, letterSpacing: -0.3 }}>Bagaimana tadi?</h2>
            <p className="font-nunito" style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.5, color: '#7A4A64', margin: '6px 0 0' }}>Bukan penilaian — hanya supaya besok bisa menyesuaikan.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {(Object.keys(LABEL_REFLEKSI) as HasilRefleksi[]).map(h => {
                const dipilih = refleksiPilih === h;
                return (
                  <button key={h} type="button" className="tap font-nunito" onClick={() => setRefleksiPilih(h)} aria-pressed={dipilih} style={{ width: '100%', borderRadius: 14, padding: '12px 15px', textAlign: 'left', fontWeight: 800, fontSize: 14, cursor: 'pointer', background: dipilih ? '#FBDDEC' : '#fff', color: '#6E3B57', border: `2px solid ${dipilih ? '#F0B6D2' : '#F0DCE6'}` }}>
                    {LABEL_REFLEKSI[h]}
                  </button>
                );
              })}
            </div>
            {refleksiPilih && (
              <div style={{ marginTop: 14, borderRadius: 14, padding: '13px 15px', background: '#EAF6E4', border: '2px solid #CDE9B8' }}>
                <div className="font-nunito" style={{ fontWeight: 800, fontSize: 12.5, color: '#4d7a47' }}>Rekah menyesuaikan untuk besok</div>
                <div className="font-nunito" style={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.5, color: '#3f6b3a', marginTop: 6 }}>{ADAPTASI[refleksiPilih]}</div>
                <button type="button" className="tap" onClick={() => simpanRefleksi(n, refleksiPilih)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11, marginTop: 12, borderRadius: 999, padding: '13px 22px', cursor: 'pointer', background: '#F0479B', border: 0, width: '100%', boxSizing: 'border-box', boxShadow: '0 18px 30px -20px rgba(240,71,155,.95)' }}>
                  <span aria-hidden style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFE29A', display: 'block' }} />
                  <span className="font-nunito" style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>Simpan</span>
                </button>
              </div>
            )}
            <button type="button" className="font-nunito" onClick={tutupRefleksi} style={{ display: 'block', margin: '14px auto 0', fontWeight: 800, fontSize: 13.5, color: '#B4477F', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline', background: 'transparent', border: 0 }}>Lewati</button>
          </ModalShell>
        );
      })()}
    </div>
  );
}
