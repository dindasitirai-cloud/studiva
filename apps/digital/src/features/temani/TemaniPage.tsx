// Temani — longitudinal guidance (Phase 14, Model C). Perjalanan hari demi hari,
// satu fokus kecil per hari, "Saya akan coba" menulis ke Kelola. Additive.
// STATUS: DRAFT copy — menunggu review Psikolog Fitri Effendy. Tanpa skor/level/persen.
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight, Check, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnakAktif } from '../../context/AnakContext';
import { useAkarStateSync } from '../akar-keluarga/state';
import type { NilaiAkar } from '../akar-keluarga/content';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { tanggalDariTimestampWIB } from '@studiva/shared';
import { tambahKustomKeTanggal } from '../../lib/supabase/rekah';
import { dispatchRekahError } from '../../utils/rekahApiError';
import { Btn } from '../rekah-journey/ui/brand';
import { TEMANI_JOURNEYS, journeysUntuk } from './temaniSeed';
import { kebiasaanById } from './temaniSeed';
import type { TemaniJourney, TemaniHari } from './temaniSeed';
import JurnalTemani from './JurnalTemani';

type Layar = 'beranda' | 'hari' | 'reflect' | 'selesai' | 'jurnal';
type HasilRefleksi = 'menyenangkan' | 'terlalu_sulit' | 'kurang_cocok';

interface Progres {
  slug: string;
  hari: number;
  status: 'aktif' | 'selesai';
  refleksi: Record<number, HasilRefleksi>;
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
function TagDraft() {
  return <span className="inline-flex items-center rounded-full bg-kuning px-2.5 py-1 text-[11px] font-bold text-pekat">Draft</span>;
}
function Pil({ tone, children }: { tone: 'nilai' | 'durasi'; children: React.ReactNode }) {
  const c = tone === 'nilai' ? 'bg-pucuk text-[#5C8A55]' : 'bg-langit/30 text-pekat';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${c}`}>{children}</span>;
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
  const navigate = useNavigate();
  const [whyOpen, setWhyOpen] = useState(false);
  const [refleksiPilih, setRefleksiPilih] = useState<HasilRefleksi | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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

  const mulai = (j: TemaniJourney) => { perbarui({ slug: j.slug, hari: 1, status: 'aktif', refleksi: {} }); setWhyOpen(false); setLayar('hari'); };

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
  const AKSES_CEPAT = [
    { emoji: '🏡', label: 'Kelola', to: '/dashboard/tier2/kelola' },
    { emoji: '🎒', label: 'Bekal', to: '/dashboard/tier2/bekal' },
    { emoji: '🆘', label: 'Bantu', to: '/dashboard/tier2/bantu' },
    { emoji: '🧭', label: 'Arah', to: '/dashboard/tier2/kompas-keluarga' },
  ];

  const Beranda = () => (
    <>
      <p className="font-shantell text-lg text-rekah">temani</p>
      <h1 className="mt-1 font-fredoka text-[26px] font-semibold leading-tight text-pekat">Mari kita jalani bersama 🌸</h1>
      <p className="mt-2 font-nunito text-[15px] text-pekat/70">Pelan-pelan saja — satu langkah kecil tiap hari, bersama {nama}.</p>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[7fr_3fr]">
        {/* Kolom utama — daftar perjalanan */}
        <div>
          <div className="flex items-center justify-between">
            <p className="font-nunito text-[13px] font-extrabold uppercase tracking-wide text-pekat/70">{journeyAktif ? 'Perjalanan lain' : 'Mulai perjalanan baru'}</p>
            {pratinjau && <span className="rounded-full bg-kuning px-2.5 py-0.5 text-[10.5px] font-bold text-pekat">Pratinjau</span>}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {saran.filter(j => j.slug !== journeyAktif?.slug).map(j => (
              <button key={j.slug} onClick={() => mulai(j)} className="flex h-full flex-col gap-2 rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-22px_rgba(240,107,168,0.9)]" style={{ borderColor: '#F0DCE6' }}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-soft/25"><Heart className="h-5 w-5 text-rekah" aria-hidden /></span>
                <div className="font-fredoka text-[15.5px] font-semibold leading-snug text-pekat">{j.judul}</div>
                <div className="font-nunito text-[13px] leading-snug text-pekat/70">{j.deskripsi}</div>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                  <Pil tone="durasi">{j.durasiHari} hari</Pil>
                  {j.nilaiTerkait.map(n => <Pil key={n} tone="nilai">{n}</Pil>)}
                  {j.status !== 'disetujui' && <TagDraft />}
                </div>
              </button>
            ))}
          </div>
          <Toast />
        </div>

        {/* Rel samping — progres & akses cepat */}
        <aside className="space-y-4">
          <div className="rounded-3xl border p-5" style={{ borderColor: '#F0DCE6', background: 'linear-gradient(180deg,#FFF1F7,#FFFFFF)' }}>
            <h2 className="font-fredoka text-[16px] font-semibold text-pekat">Progres perjalanan</h2>
            {journeyAktif && progres ? (
              <>
                <p className="mt-1 font-nunito text-[13px] leading-snug text-pekat/70">{journeyAktif.judul}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <Dots total={journeyAktif.durasiHari} aktif={progres.hari} />
                  <span className="font-nunito text-[12px] font-extrabold text-pekat/70">Hari {progres.hari} dari {journeyAktif.durasiHari}</span>
                </div>
                <button onClick={() => { setWhyOpen(false); setLayar('hari'); }} className="mt-3.5 inline-flex items-center gap-1.5 rounded-2xl bg-rekah px-4 py-2 font-nunito text-[13px] font-extrabold text-white shadow-[0_12px_22px_-14px_rgba(240,107,168,0.95)]">Lanjutkan <ArrowRight className="h-4 w-4" aria-hidden /></button>
              </>
            ) : (
              <p className="mt-1 font-nunito text-[13px] leading-snug text-pekat/60">Belum ada perjalanan aktif. Pilih satu perjalanan di samping untuk mulai ditemani, langkah demi langkah.</p>
            )}
          </div>

          <button onClick={() => setLayar('jurnal')} className="flex w-full items-center gap-3 rounded-3xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-22px_rgba(240,107,168,0.9)]" style={{ borderColor: '#F0DCE6' }}>
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl text-[20px]" style={{ background: 'rgba(248,185,212,0.25)' }}>📖</span>
            <span>
              <span className="block font-fredoka text-[15px] font-semibold text-pekat">Buku perjalanan</span>
              <span className="block font-nunito text-[12px] leading-snug text-pekat/60">Catatan harian yang tercatat otomatis</span>
            </span>
          </button>

          <div className="rounded-3xl border bg-white p-5" style={{ borderColor: '#F0DCE6' }}>
            <h2 className="font-fredoka text-[16px] font-semibold text-pekat">Akses cepat</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {AKSES_CEPAT.map(t => (
                <button key={t.to} onClick={() => navigate(t.to)} className="flex flex-col items-start gap-1.5 rounded-2xl border bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_22px_-18px_rgba(90,50,70,0.6)]" style={{ borderColor: '#F0DCE6' }}>
                  <span className="text-[18px]" aria-hidden>{t.emoji}</span>
                  <span className="font-nunito text-[12.5px] font-extrabold text-pekat">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );

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
      <section className={`mx-auto w-full ${layar === 'beranda' || layar === 'jurnal' ? 'max-w-5xl' : 'max-w-md'}`} aria-live="polite">
        {layar === 'beranda' && <Beranda />}
        {layar === 'jurnal' && <JurnalTemani idAnak={idAnak} nama={nama} onKembali={() => setLayar('beranda')} />}
        {layar === 'hari' && <Hari />}
        {layar === 'reflect' && <Reflect />}
        {layar === 'selesai' && <Selesai />}
      </section>
    </div>
  );
}
