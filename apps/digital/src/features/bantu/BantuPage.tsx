// Bantu — situational support (Phase 14/14N/14R/14T). Design handoff `design_handoff_bantu`
// diterapkan ke HUB: hero gradasi + kebun botani, topic picker (accent stem, tanpa ikon),
// rail Panduan tersimpan + Konseling, panel forum full-width (prompt + sneak-peek + toggle
// "Isi forum"), footer quote. SEMUA SISTEM tetap: alur topik→cerita, panduan tersimpan,
// forum Supabase + moderasi, CTA WA, pemindai keselamatan. Sub-alur Clarify/Guide/Safety
// tidak termasuk handoff → dipertahankan. STATUS copy: DRAFT (menunggu Fitri); nomor WA: KONFIRMASI.
import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, Eye, Heart, ChevronRight, Bookmark, Share2, Lightbulb } from 'lucide-react';
import BotanicalStem from '../../components/BotanicalStem';
import type { BotanicalConfig } from '../../components/BotanicalStem';
import { useAnakAktif } from '../../context/AnakContext';
import { useDashboardTier2 } from '../../context/DashboardTier2Context';
import { useAuth } from '../../context/AuthContext';
import { useAkarStateSync } from '../akar-keluarga/state';
import type { NilaiAkar } from '../akar-keluarga/content';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { tanggalDariTimestampWIB } from '@studiva/shared';
import { tambahKustomKeTanggal } from '../../lib/supabase/rekah';
import { dispatchRekahError } from '../../utils/rekahApiError';
import {
  BANTU_SITUASI, adaSinyalBahaya, OPSI_MEMICU_B5, RUJUKAN_KESELAMATAN,
} from './bantuSeed';
import type { BantuSituasi } from './bantuSeed';

type Layar = 'hub' | 'clarify' | 'guide' | 'safety';
const PLUM = '#8E5FA6';       // aksen sub-alur (Clarify/Guide/Safety)
const PEONY = '#C6407F';      // aksen CTA hub (design handoff)

// TODO(KONFIRMASI): nomor WhatsApp resmi konseling Psikolog Fitri Effendy sebelum tayang.
const NOMOR_WA_KONSELING = '6281234567890';
const PESAN_WA_KONSELING = 'Halo, saya ingin konseling online dengan Psikolog Fitri Effendy tentang situasi anak saya.';

// Aksen per topik (design handoff — dibawa oleh stem berwarna, bukan ikon).
const TOPIC_INK: Record<string, string> = {
  tantrum: '#F06BA8', sulit_tidur: '#8B6FD6', tidak_mau_makan: '#E0A63A', memukul: '#D2559A',
  konflik_saudara: '#5F84E6', konflik_caregiver: '#6E9C4A', saya_mudah_marah: '#E07A4A',
};
const FORUM_ACCENTS = ['#8B6FD6', '#F06BA8', '#5F84E6', '#E0A63A', '#6E9C4A', '#E07A4A'];

// Kebun botani hero (6 tanaman) — memakai komponen BotanicalStem yang ada.
const KEBUN: { w: number; h: number; cfg: BotanicalConfig }[] = [
  { w: 34, h: 50, cfg: { type: 'sprig', bloom: '#C9B8F0', bloom2: '#EFE9FD', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' } },
  { w: 42, h: 64, cfg: { type: 'tulip', bloom: '#F06BA8', bloom2: '#F8B9D4', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' } },
  { w: 30, h: 44, cfg: { type: 'leaf', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' } },
  { w: 46, h: 70, cfg: { type: 'daisy', bloom: '#FFE29A', bloom2: '#FFF3E6', center: '#F06BA8', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' } },
  { w: 32, h: 52, cfg: { type: 'foliage', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' } },
  { w: 38, h: 58, cfg: { type: 'bell', bloom: '#8FB8F7', bloom2: '#DCEAFD', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' } },
];

// -- Ornamen kecil (dot / stem / tick) — status & kategori tanpa ikon flat/line. --
function Dot({ c, s = 9 }: { c: string; s?: number }) {
  return <span aria-hidden style={{ width: s, height: s, borderRadius: '50%', background: c, display: 'inline-block', flex: 'none' }} />;
}
function Stem({ c, h = 28 }: { c: string; h?: number }) {
  return <span aria-hidden style={{ width: 5, height: h, borderRadius: 999, background: c, display: 'inline-block', flex: 'none' }} />;
}
function Tick({ c, w }: { c: string; w: number }) {
  return <span aria-hidden style={{ width: w, height: 6, borderRadius: 999, background: c, display: 'inline-block' }} />;
}
function Sprig({ cfg, w, h, className = '' }: { cfg: BotanicalConfig; w: number; h: number; className?: string }) {
  return <div aria-hidden className={`animate-sway ${className}`} style={{ width: w, height: h }}><BotanicalStem cfg={cfg} /></div>;
}

// -- Panduan tersimpan (localStorage per anak). --
interface Tersimpan { slug: string; label: string; langkah: string[]; disimpanPada: string; }
const kunciSimpan = (idAnak: string) => `rekah_bantu_tersimpan_${idAnak}`;
function bacaTersimpan(idAnak: string): Tersimpan[] {
  try { const raw = window.localStorage.getItem(kunciSimpan(idAnak)); return raw ? (JSON.parse(raw) as Tersimpan[]) : []; } catch { return []; }
}
function tulisTersimpan(idAnak: string, list: Tersimpan[]) {
  try { window.localStorage.setItem(kunciSimpan(idAnak), JSON.stringify(list)); } catch { /* abaikan */ }
}
function tanggalPendek(iso: string): string {
  try { return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); } catch { return ''; }
}

export default function BantuPage() {
  const { anak } = useAnakAktif();
  const idAnak = anak.id;
  const [akarState] = useAkarStateSync(idAnak);
  const { profile, sapaan, usiaBulan } = useChildProfile();
  const { threads, addThread, addReply, reportThread, psychologist } = useDashboardTier2();
  const { supabaseUser, user } = useAuth();
  const nama = profile.namaAnak || sapaan.cap || 'si kecil';
  const nilaiKeluarga = (akarState.nilai as NilaiAkar[]) ?? [];
  const tanggalHariIni = useMemo(() => tanggalDariTimestampWIB(new Date().toISOString()), []);

  const [layar, setLayar] = useState<Layar>('hub');
  const [pilih, setPilih] = useState<BantuSituasi | null>(null);
  const [whyOpen, setWhyOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [savedTick, setSavedTick] = useState(0);

  // Forum
  const [forumJudul, setForumJudul] = useState('');
  const [forumIsi, setForumIsi] = useState('');
  const [pakaiNama, setPakaiNama] = useState(true);
  const [namaManual, setNamaManual] = useState('');
  const [forumMode, setForumMode] = useState<'forum' | 'psikolog'>('forum');
  const [privasi, setPrivasi] = useState<'publik' | 'privat'>('publik');
  const [forumComposerOpen, setForumComposerOpen] = useState(false);
  const [isiForumOpen, setIsiForumOpen] = useState(false);
  const [forumOpen, setForumOpen] = useState<string | null>(null);
  const [balasDraft, setBalasDraft] = useState('');
  const [forumMsg, setForumMsg] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tersimpan = useMemo(() => bacaTersimpan(idAnak), [idAnak, savedTick]);
  const namaAkun = ((supabaseUser?.user_metadata?.name as string | undefined) || (user as any)?.name || 'Orang tua').toString();
  const authorForum = pakaiNama ? (namaManual.trim() || namaAkun) : 'Anonim';
  const namaToggle = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-xl border p-0.5" style={{ borderColor: '#E4D8FA' }}>
        <button type="button" onClick={() => setPakaiNama(true)} className="rounded-lg px-2.5 py-1 font-nunito text-[11.5px] font-bold" style={pakaiNama ? { background: PEONY, color: '#fff' } : { color: '#8A5A74' }}>Nama saya</button>
        <button type="button" onClick={() => setPakaiNama(false)} className="rounded-lg px-2.5 py-1 font-nunito text-[11.5px] font-bold" style={!pakaiNama ? { background: PEONY, color: '#fff' } : { color: '#8A5A74' }}>Anonim</button>
      </div>
      {pakaiNama ? (
        <input value={namaManual} onChange={e => setNamaManual(e.target.value)} placeholder={namaAkun} aria-label="Nama tampilan (opsional)" className="rounded-xl border px-2.5 py-1 font-nunito text-[11.5px] font-bold" style={{ borderColor: '#E4D8FA', color: '#6E3B57', maxWidth: 160 }} />
      ) : (
        <span className="font-nunito text-[11px]" style={{ color: '#8A5A74' }}>Tampil sebagai <b style={{ color: '#6E3B57' }}>Anonim</b></span>
      )}
    </div>
  );
  const threadsTampil = useMemo(
    () => threads.filter(t => t.status !== 'disembunyikan').slice().sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || (b.createdAt < a.createdAt ? -1 : 1)),
    [threads],
  );

  const usiaTeks = useMemo(() => {
    if (usiaBulan === null) return null;
    const th = Math.floor(usiaBulan / 12); const bl = usiaBulan % 12;
    if (th <= 0) return `${bl} bln`;
    return bl === 0 ? `${th} thn` : `${th} thn ${bl} bln`;
  }, [usiaBulan]);

  const keHub = () => { setLayar('hub'); setWhyOpen(false); setToast(null); setSavedTick(t => t + 1); };

  const keGuideAtauClarify = (s: BantuSituasi) => {
    setPilih(s); setWhyOpen(false); setToast(null);
    setLayar(s.clarify.length > 0 ? 'clarify' : 'guide');
  };

  const pilihOpsiClarify = (opsi: string) => {
    if (OPSI_MEMICU_B5.includes(opsi)) { setLayar('safety'); return; }
    setLayar('guide');
  };

  const bukaTersimpan = (slug: string) => {
    const s = BANTU_SITUASI.find(x => x.slug === slug);
    if (!s) return;
    setPilih(s); setWhyOpen(false); setToast(null); setLayar('guide');
  };
  const hapusTersimpan = (slug: string) => {
    tulisTersimpan(idAnak, bacaTersimpan(idAnak).filter(x => x.slug !== slug));
    setSavedTick(t => t + 1);
  };

  // Forum — pemindai keselamatan berjalan pada judul+isi & komentar.
  const ajukanPertanyaan = () => {
    const judul = forumJudul.trim(); const isi = forumIsi.trim();
    if (!judul || !isi) return;
    if (adaSinyalBahaya(`${judul} ${isi}`)) { setLayar('safety'); return; }
    addThread(judul, isi, authorForum, forumMode === 'psikolog', false, privasi);
    setForumJudul(''); setForumIsi(''); setForumComposerOpen(false); setIsiForumOpen(true);
    setForumMsg(forumMode === 'psikolog'
      ? (privasi === 'privat'
          ? 'Pertanyaanmu terkirim ke Psikolog secara privat — hanya kamu & tim yang bisa melihatnya.'
          : 'Pertanyaanmu terkirim ke Psikolog. Tim akan menjawab di sini.')
      : 'Pertanyaanmu terkirim. Orang tua lain bisa membalas — ditinjau tim untuk menjaga ruang tetap aman.');
  };
  const kirimBalasan = (threadId: string) => {
    const isi = balasDraft.trim();
    if (!isi) return;
    if (adaSinyalBahaya(isi)) { setLayar('safety'); return; }
    addReply(threadId, isi, authorForum);
    setBalasDraft('');
  };
  const laporkan = (id: string) => { reportThread(id); setForumMsg('Terima kasih. Laporanmu membantu kami menjaga ruang ini tetap aman.'); };

  const tambahKeKelola = async () => {
    if (!pilih) return;
    const item = {
      id: `bantu-${pilih.slug}-${Date.now().toString(36)}`,
      judul: `Strategi: ${pilih.label}`,
      tipe: 'aktivitas' as const,
      domain: 'sos',
      nilai: [] as NilaiAkar[],
      pemilik: 'anak' as const,
      sumberId: `bantu-${pilih.slug}`,
      kustom: true,
      kategoriKustom: 'rencana' as const,
      keteranganKapan: 'Dari Bantu',
      deskripsiKustom: pilih.respons.langkah.join(' · '),
    };
    try {
      await tambahKustomKeTanggal(idAnak, tanggalHariIni, item);
      setToast('Tersimpan sebagai rencana di Kelola.');
    } catch (e) {
      console.error('[Bantu] gagal menambah ke Kelola:', e);
      dispatchRekahError('Koneksi terputus — strategi tadi belum masuk Kelola. Coba lagi ya.');
    }
  };

  const simpanStrategi = () => {
    if (!pilih) return;
    const entry: Tersimpan = { slug: pilih.slug, label: pilih.label, langkah: pilih.respons.langkah, disimpanPada: new Date().toISOString() };
    const next = [entry, ...bacaTersimpan(idAnak).filter(x => x.slug !== pilih.slug)].slice(0, 50);
    tulisTersimpan(idAnak, next);
    setSavedTick(t => t + 1);
    setToast('Panduan disimpan. Ada di "Panduan tersimpan".');
  };

  const bagikan = async () => {
    if (!pilih) return;
    const r = pilih.respons;
    const teksBagikan = `Bantu — ${pilih.label}\n\n${r.validasi}\n\nCoba:\n${r.langkah.map((l, i) => `${i + 1}. ${l}`).join('\n')}\n\n— dari Rekah`;
    const nav = navigator as Navigator & { share?: (d: { title?: string; text?: string }) => Promise<void> };
    try {
      if (typeof nav.share === 'function') { await nav.share({ title: `Bantu — ${pilih.label}`, text: teksBagikan }); return; }
      await navigator.clipboard.writeText(teksBagikan);
      setToast('Panduan disalin. Tinggal tempel untuk dibagikan.');
    } catch { /* dibatalkan pengguna */ }
  };

  // Kelas util sub-alur (tema plum, di luar handoff).
  const plumBtn = 'rounded-2xl px-6 py-3 font-nunito font-extrabold text-white shadow-[0_10px_20px_-10px_rgba(142,95,166,0.8)]';
  const plumOutlineBtn = 'inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 bg-white px-4 py-2.5 font-nunito text-[13px] font-extrabold';
  const inputCls = 'w-full rounded-2xl border bg-white px-3.5 py-2.5 font-nunito text-[13.5px] focus:outline-none focus:ring-2 focus:ring-langit';

  const situasiTampil = BANTU_SITUASI.filter(s => s.kategori !== 'meta');
  const waHref = `https://wa.me/${NOMOR_WA_KONSELING}?text=${encodeURIComponent(PESAN_WA_KONSELING)}`;
  const sneakPeek = threadsTampil.slice(0, 2);

  // Kartu utas (dipakai Isi forum).
  const KartuUtas = (t: typeof threadsTampil[number], accent: string) => {
    const terbuka = forumOpen === t.id;
    return (
      <div key={t.id} className="rounded-[24px] bg-white p-4" style={{ border: '2px solid #E4D8FA', boxShadow: '0 20px 42px -32px rgba(91,63,175,.6)' }}>
        <div className="flex items-center gap-1.5"><Tick c="#8B6FD6" w={26} /><Tick c="#F8B9D4" w={14} /><Tick c="#FFE29A" w={9} /></div>
        <div className="mt-2.5 flex items-start gap-2.5">
          <Stem c={accent} h={34} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {t.pinned && <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: '#FFF1CF', color: '#8A5A18' }}>Disematkan</span>}
              {t.isAnnouncement && <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: '#EFE9FD', color: '#5B3FAF' }}>Tim Studiva</span>}
              {t.isSupportRequest && <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: '#EFE9FD', color: '#5B3FAF' }}>Untuk Psikolog</span>}
              {t.privasi === 'privat' && <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: '#F1ECF0', color: '#8A5A74' }}>Privat</span>}
              <h3 className="font-fredoka text-[14.5px] font-semibold" style={{ color: '#6E3B57' }}>{t.title}</h3>
            </div>
            <p className="mt-0.5 font-nunito text-[11.5px] font-bold" style={{ color: '#8A5A74' }}>{t.author} · {tanggalPendek(t.createdAt)} · {t.replies.length} balasan</p>
          </div>
        </div>
        <p className="mt-2.5 font-nunito text-[14px] leading-relaxed" style={{ color: '#7A4A64' }}>{t.content}</p>
        <div className="mt-3 border-t pt-2.5" style={{ borderStyle: 'dashed', borderColor: '#F0DCE7' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => { setForumOpen(terbuka ? null : t.id); setBalasDraft(''); }} className="inline-flex items-center gap-1.5 font-nunito text-[12.5px] font-extrabold" style={{ color: accent }}>
              <Dot c={accent} s={8} /> {t.replies.length} balasan
            </button>
            <button onClick={() => laporkan(t.id)} className="font-nunito text-[11.5px] font-bold hover:underline" style={{ color: '#8A5A74' }}>Laporkan</button>
          </div>
          {terbuka && (
            <div className="mt-3 space-y-2">
              {t.replies.map(r => (
                <div key={r.id} className="rounded-xl p-2.5" style={{ background: r.isSupport ? '#EFE9FD' : '#FBF1F7' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="font-nunito text-[12px] font-bold" style={{ color: '#6E3B57' }}>{r.author}</span>
                    {r.isSupport && <span className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold" style={{ background: '#DCEAFD', color: '#5B3FAF' }}>Tim Studiva</span>}
                    <span className="font-nunito text-[10.5px]" style={{ color: '#8A5A74' }}>· {tanggalPendek(r.createdAt)}</span>
                  </div>
                  <p className="mt-1 font-nunito text-[12.5px] leading-relaxed" style={{ color: '#7A4A64' }}>{r.content}</p>
                </div>
              ))}
              <div className="pt-1">
                <div className="mb-2">{namaToggle}</div>
                <div className="flex items-start gap-2">
                  <textarea value={balasDraft} onChange={e => setBalasDraft(e.target.value)} rows={2} placeholder="Tulis balasan yang membantu…" className={inputCls} style={{ borderColor: '#E4D8FA', color: '#6E3B57' }} />
                  <button onClick={() => kirimBalasan(t.id)} disabled={!balasDraft.trim()} className="mt-0.5 inline-flex flex-none items-center gap-1.5 rounded-2xl px-4 py-2.5 font-nunito text-[12.5px] font-extrabold text-white disabled:opacity-50" style={{ background: accent }}><Dot c="#fff" s={7} /> Balas</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // -- HUB (landing) — design handoff --
  const Hub = () => (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[32px]" style={{ background: 'linear-gradient(120deg,#FBD9E9 0%,#F6DCF3 34%,#E6DDFB 62%,#DCEAFD 100%)', boxShadow: '0 26px 54px -40px rgba(90,50,70,.55)' }}>
        <div className="flex h-[7px] w-full">
          <span style={{ flexGrow: 2, background: '#F06BA8' }} /><span style={{ flexGrow: 1, background: '#F8B9D4' }} /><span style={{ flexGrow: 1.4, background: '#FFE29A' }} /><span style={{ flexGrow: 1, background: '#C9B8F0' }} /><span style={{ flexGrow: 1.6, background: '#8FB8F7' }} />
        </div>
        <div className="pointer-events-none absolute bottom-0 right-6 hidden items-end gap-1 sm:flex" style={{ opacity: 0.75 }}>
          {KEBUN.map((k, i) => <Sprig key={i} cfg={k.cfg} w={k.w} h={k.h} />)}
        </div>
        <div className="relative px-[34px] pb-[30px] pt-[26px]">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,.75)' }}>
            <Dot c="#F06BA8" s={8} /><span className="font-nunito text-[11.5px] font-extrabold uppercase" style={{ letterSpacing: '1px', color: '#B4477F' }}>Ruang Dukungan</span>
          </span>
          <h1 className="mt-2 font-shantell font-bold leading-none" style={{ fontSize: 52, color: '#6E3B57' }}>Bantu</h1>
          <p className="mt-2 font-nunito text-[17px] font-semibold" style={{ color: '#7A4A64' }}>Dukungan saat kamu membutuhkannya. Kami ada di sini.</p>
        </div>
      </div>

      {/* Body dua kolom */}
      <div className="mt-6 grid grid-cols-1 items-start gap-[22px] md:grid-cols-[minmax(0,1fr)_340px]">
        {/* Kiri — Apa yang sedang terjadi? */}
        <section className="relative overflow-hidden rounded-[28px] px-[26px] py-6" style={{ background: 'linear-gradient(150deg,#F7E9FA,#FBEFF7 55%,#FDF3F8)' }}>
          <div className="pointer-events-none absolute -right-1.5 top-2.5" style={{ opacity: 0.35 }}><Sprig cfg={{ type: 'fivepetal', bloom: '#C9B8F0', bloom2: '#EFE9FD', stem: '#A7C63E', stemDark: '#8FB84A', leaf: '#A7C63E' }} w={54} h={80} /></div>
          <h2 className="font-fredoka text-[25px] font-semibold" style={{ color: '#C6407F' }}>Apa yang sedang terjadi?</h2>
          <p className="mt-1 font-nunito text-[14px] font-semibold" style={{ color: '#8A5A74' }}>Pilih topik yang paling sesuai dengan situasimu.</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-nunito text-[11px] font-extrabold uppercase" style={{ letterSpacing: '1px', color: '#B4477F' }}>Rekah tahu</span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold" style={{ background: '#FCE3EE', color: '#B4477F' }}><Dot c="#F06BA8" s={7} />{nama}{usiaTeks ? ` · ${usiaTeks}` : ''}</span>
            {nilaiKeluarga.slice(0, 1).map(n => (
              <span key={n} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold" style={{ background: '#EFE9FD', color: '#5B3FAF' }}><Dot c="#8B6FD6" s={7} />Fokus: {n}</span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {situasiTampil.map(s => {
              const ink = TOPIC_INK[s.slug] ?? '#F06BA8';
              return (
                <button key={s.slug} onClick={() => keGuideAtauClarify(s)}
                  className="group flex flex-col items-start gap-2 rounded-[20px] bg-white px-4 pb-[15px] pt-4 text-left transition hover:-translate-y-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ boxShadow: '0 18px 40px -34px rgba(90,50,70,.55)', outlineColor: ink }}>
                  <Stem c={ink} h={28} />
                  <span className="font-fredoka text-[16.5px] font-semibold" style={{ color: '#6E3B57' }}>{s.label}</span>
                  {s.ringkas && <span className="font-nunito text-[12.5px] font-semibold leading-snug" style={{ color: '#8A5A74' }}>{s.ringkas}</span>}
                </button>
              );
            })}
          </div>

        </section>

        {/* Kanan — rail */}
        <div className="space-y-5">
          {/* Panduan tersimpan */}
          <section>
            <h2 className="flex items-center gap-2 font-fredoka text-[18px] font-semibold" style={{ color: '#6E3B57' }}><Dot c="#F06BA8" /> Panduan tersimpan</h2>
            {tersimpan.length === 0 ? (
              <div className="mt-3 rounded-[18px] bg-white p-4 text-center font-nunito text-[12.5px] leading-relaxed" style={{ border: '2px dashed #E4D8FA', color: '#8A5A74' }}>
                Belum ada panduan tersimpan. Tekan <b style={{ color: '#6E3B57' }}>Simpan</b> pada panduan agar mudah dibuka lagi.
              </div>
            ) : (
              <div className="mt-3 space-y-2.5">
                {tersimpan.map((t, i) => {
                  const ink = TOPIC_INK[t.slug] ?? FORUM_ACCENTS[i % FORUM_ACCENTS.length];
                  return (
                    <div key={t.slug} className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3.5" style={{ boxShadow: '0 18px 40px -34px rgba(90,50,70,.55)' }}>
                      <Stem c={ink} h={32} />
                      <button onClick={() => bukaTersimpan(t.slug)} className="min-w-0 flex-1 text-left">
                        <span className="block font-nunito text-[14.5px] font-extrabold" style={{ color: '#6E3B57' }}>{t.label}</span>
                        <span className="block font-nunito text-[12px] font-bold" style={{ color: '#8A5A74' }}>Disimpan {tanggalPendek(t.disimpanPada)}</span>
                      </button>
                      <button onClick={() => bukaTersimpan(t.slug)} aria-label={`Buka ${t.label}`} className="flex-none font-fredoka text-[18px]" style={{ color: '#F06BA8' }}>›</button>
                      <button onClick={() => hapusTersimpan(t.slug)} aria-label={`Hapus ${t.label}`} className="flex-none font-fredoka text-[16px] leading-none" style={{ color: '#C6A6BA' }}>×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Konseling online */}
          <section>
            <h2 className="flex items-center gap-2 font-fredoka text-[18px] font-semibold" style={{ color: '#6E3B57' }}><Dot c="#2FA86A" /> Konseling online</h2>
            <div className="relative mt-3 overflow-hidden rounded-[24px] p-5" style={{ background: 'linear-gradient(160deg,#F3EBFC,#FBF1F7)' }}>
              <div className="pointer-events-none absolute -bottom-1 right-1" style={{ opacity: 0.3 }}><Sprig cfg={{ type: 'sprig', bloom: '#C9B8F0', bloom2: '#EFE9FD', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' }} w={44} h={66} /></div>
              <p className="font-nunito text-[11px] font-extrabold uppercase" style={{ letterSpacing: '1px', color: '#7B58C9' }}>Pendampingan personal</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-full font-fredoka text-[15px] font-semibold" style={{ background: '#DDD0F6', color: '#5B3FAF' }} aria-hidden>FE</span>
                <div className="min-w-0">
                  <p className="font-fredoka text-[17px] font-semibold" style={{ color: '#6E3B57' }}>{psychologist?.name ?? 'Psikolog Fitri Effendy'}</p>
                  <p className="font-nunito text-[12.5px] font-bold" style={{ color: '#7A4A64' }}>{psychologist?.specialization ?? 'Psikologi Anak & Tumbuh Kembang'}</p>
                </div>
              </div>
              <p className="mt-3 font-nunito text-[13.5px] leading-relaxed" style={{ color: '#7A4A64' }}>Butuh pendampingan lebih personal untuk situasi anakmu? Bicara langsung dengan Psikolog Fitri lewat WhatsApp.</p>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full font-nunito text-[14.5px] font-extrabold text-white" style={{ background: '#2FA86A', boxShadow: '0 16px 30px -20px rgba(47,168,106,.9)' }}>
                <Dot c="#BFF0D6" s={9} /> Konseling via WhatsApp
              </a>
              <p className="mt-3 font-nunito text-[11.5px] leading-relaxed" style={{ color: '#8A5A74' }}>Nomor WhatsApp sedang dikonfirmasi. Konseling adalah layanan berbayar terpisah; Bantu bukan layanan krisis.</p>
            </div>
          </section>
        </div>
      </div>

      {/* Panel forum full-width */}
      <div className="relative mt-[22px] overflow-hidden rounded-[30px] pb-6" style={{ background: 'linear-gradient(140deg,#EFE7FD 0%,#F7ECFA 48%,#FDEFF6 100%)', boxShadow: '0 24px 50px -40px rgba(90,50,70,.55)' }}>
        <div className="flex h-[6px] w-full">
          <span style={{ flexGrow: 1.6, background: '#8B6FD6' }} /><span style={{ flexGrow: 1, background: '#C9B8F0' }} /><span style={{ flexGrow: 1.2, background: '#F8B9D4' }} /><span style={{ flexGrow: 0.9, background: '#FFE29A' }} /><span style={{ flexGrow: 1.3, background: '#8FB8F7' }} />
        </div>
        <div className="pointer-events-none absolute -bottom-2 -left-2.5 hidden sm:block" style={{ opacity: 0.28 }}><Sprig cfg={{ type: 'daisy', bloom: '#C9B8F0', bloom2: '#EFE9FD', center: '#8B6FD6', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' }} w={96} h={140} /></div>

        <div className="relative px-[26px] pt-[22px]">
          {/* Row 1 */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,.7)' }}>
                <Dot c="#8B6FD6" s={8} /><span className="font-nunito text-[11px] font-extrabold uppercase" style={{ letterSpacing: '1px', color: '#5B3FAF' }}>Ruang bersama</span>
              </span>
              <h2 className="mt-2 font-shantell font-bold" style={{ fontSize: 30, color: '#5B3FAF' }}>Tanya jawab bersama orang tua lain</h2>
              <p className="mt-2.5 font-nunito text-[14px] font-semibold leading-relaxed" style={{ color: '#7A4A64', maxWidth: '52ch' }}>Ajukan pertanyaan, atau bantu orang tua lain lewat pengalamanmu. Ruang ini ditinjau tim agar tetap aman &amp; saling menghormati.</p>
            </div>
            {/* Prompt card */}
            <div className="rounded-[22px] px-[18px] pb-5 pt-[18px]" style={{ background: '#FFF1F7', border: '2.5px dashed #F6A9CB' }}>
              <div className="flex items-center gap-1.5"><Tick c="#F06BA8" w={26} /><Tick c="#FFE29A" w={14} /></div>
              <p className="mt-2.5 font-shantell font-bold" style={{ fontSize: 20, color: '#B4477F' }}>Ada yang ingin ditanyakan atau dibagikan?</p>
              <p className="mt-1 font-nunito text-[13px] font-semibold" style={{ color: '#8A5A74' }}>Tulis pertanyaan atau ceritamu — orang tua lain bisa menanggapi.</p>
              <div className="mt-3.5 grid grid-cols-1 gap-2">
                <button onClick={() => { setForumMode('forum'); setPrivasi('publik'); setForumComposerOpen(true); setForumMsg(null); }} className="flex w-full items-center justify-center gap-2 rounded-full py-3 font-nunito text-[14px] font-extrabold text-white" style={{ background: PEONY, boxShadow: '0 16px 30px -20px rgba(198,64,127,.9)' }}>
                  <Dot c="#FFE29A" s={9} /> Tulis di forum
                </button>
                <button onClick={() => { setForumMode('psikolog'); setPrivasi('privat'); setForumComposerOpen(true); setForumMsg(null); }} className="flex w-full items-center justify-center gap-2 rounded-full py-3 font-nunito text-[14px] font-extrabold" style={{ background: '#EFE9FD', color: '#5B3FAF', border: '2px solid #C9B8F0' }}>
                  <Dot c="#8B6FD6" s={9} /> Tanya ke Psikolog
                </button>
              </div>
            </div>
          </div>

          {/* Composer (muncul setelah "Tulis di forum") */}
          {forumComposerOpen && (
            <div className="mt-4 rounded-[22px] bg-white p-4" style={{ border: '2px solid', borderColor: forumMode === 'psikolog' ? '#C9B8F0' : '#F6A9CB' }}>
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <span className="font-fredoka text-[15px] font-semibold" style={{ color: forumMode === 'psikolog' ? '#5B3FAF' : '#B4477F' }}>{forumMode === 'psikolog' ? 'Tanya ke Psikolog' : 'Tulis di forum'}</span>
                <div className="inline-flex rounded-xl border p-0.5" style={{ borderColor: '#E4D8FA' }}>
                  <button type="button" onClick={() => setPrivasi('publik')} className="rounded-lg px-2.5 py-1 font-nunito text-[11.5px] font-bold" style={privasi === 'publik' ? { background: PEONY, color: '#fff' } : { color: '#8A5A74' }}>Publik</button>
                  <button type="button" onClick={() => setPrivasi('privat')} className="rounded-lg px-2.5 py-1 font-nunito text-[11.5px] font-bold" style={privasi === 'privat' ? { background: '#8B6FD6', color: '#fff' } : { color: '#8A5A74' }}>Privat</button>
                </div>
              </div>
              <input value={forumJudul} onChange={e => setForumJudul(e.target.value)} placeholder={forumMode === 'psikolog' ? 'Pertanyaan untuk Psikolog Fitri…' : 'Judul — mis. Tips transisi antar aktivitas?'} className={inputCls} style={{ borderColor: forumMode === 'psikolog' ? '#C9B8F0' : '#F6A9CB', color: '#6E3B57' }} autoFocus />
              <textarea value={forumIsi} onChange={e => setForumIsi(e.target.value)} rows={3} placeholder="Ceritakan sedikit konteksnya…" className={`mt-2 ${inputCls}`} style={{ borderColor: forumMode === 'psikolog' ? '#C9B8F0' : '#F6A9CB', color: '#6E3B57' }} />
              <p className="mt-1.5 font-nunito text-[11px]" style={{ color: '#8A5A74' }}>{privasi === 'privat' ? 'Privat — hanya kamu dan tim/psikolog yang bisa melihat.' : 'Publik — terlihat oleh orang tua lain di forum.'}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {namaToggle}
                <div className="ml-auto flex items-center gap-3">
                  <button onClick={() => { setForumComposerOpen(false); setForumJudul(''); setForumIsi(''); }} className="font-nunito text-[12.5px] font-bold" style={{ color: '#8A5A74' }}>Batal</button>
                  <button onClick={ajukanPertanyaan} disabled={!forumJudul.trim() || !forumIsi.trim()} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-nunito text-[13px] font-extrabold text-white disabled:opacity-50" style={{ background: forumMode === 'psikolog' ? '#5B3FAF' : PEONY }}><Dot c="#FFE29A" s={8} /> Kirim</button>
                </div>
              </div>
            </div>
          )}
          {forumMsg && <p className="mt-2.5 font-nunito text-[12px] font-bold" style={{ color: '#2FA86A' }}>{forumMsg}</p>}

          {/* Row 2 — sneak-peek (kotak terpisah) + toggle selebar kotak */}
          <p className="mt-4 font-nunito text-[10.5px] font-extrabold uppercase" style={{ letterSpacing: '1px', color: '#5B3FAF' }}>Sneak-peek isi forum</p>
          <div className="mt-2 flex flex-wrap gap-4">
            {sneakPeek.map((t, i) => (
              <div key={t.id} className="w-[264px] rounded-[24px] bg-white px-[18px] pb-[18px] pt-4" style={{ border: '2px solid #E4D8FA', boxShadow: '0 20px 42px -32px rgba(91,63,175,.6)' }}>
                <div className="flex items-center gap-1.5"><Tick c="#8B6FD6" w={26} /><Tick c="#F8B9D4" w={14} /><Tick c="#FFE29A" w={9} /></div>
                <div className="mt-2.5 flex items-start gap-2.5">
                  <Stem c={FORUM_ACCENTS[i % FORUM_ACCENTS.length]} h={34} />
                  <div className="min-w-0">
                    <p className="font-fredoka text-[14.5px] font-semibold" style={{ color: '#6E3B57' }}>{t.title}</p>
                    <p className="font-nunito text-[11.5px] font-bold" style={{ color: '#8A5A74' }}>{t.author} · {tanggalPendek(t.createdAt)} · {t.replies.length} balasan</p>
                  </div>
                </div>
              </div>
            ))}
            {sneakPeek.length === 0 && (
              <div className="w-[264px] rounded-[24px] bg-white px-[18px] py-5 text-center font-nunito text-[12px] font-semibold" style={{ border: '2px dashed #E4D8FA', color: '#8A5A74' }}>Belum ada utas. Jadilah yang pertama menulis.</div>
            )}
            <button onClick={() => setIsiForumOpen(o => !o)} className="flex w-[264px] items-center justify-center gap-2 rounded-[24px] bg-white px-[22px] py-3.5 font-nunito text-[13.5px] font-extrabold" style={{ border: '2.5px solid #8B6FD6', color: '#5B3FAF' }}>
              <Dot c="#8B6FD6" /> {isiForumOpen ? 'Tutup isi forum' : 'Lihat isi forum selengkapnya'}
            </button>
          </div>

          {/* Isi forum */}
          {isiForumOpen && (
            <div className="mt-5">
              <div className="flex items-center gap-2">
                <Dot c="#8B6FD6" />
                <h3 className="font-fredoka text-[19px] font-semibold" style={{ color: '#6E3B57' }}>Isi forum</h3>
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-extrabold" style={{ background: '#EFE9FD', color: '#5B3FAF' }}>{threadsTampil.length} utas</span>
              </div>
              <div className="mt-3 space-y-3">
                {threadsTampil.length ? threadsTampil.map((t, i) => KartuUtas(t, FORUM_ACCENTS[i % FORUM_ACCENTS.length]))
                  : <div className="rounded-[24px] bg-white p-5 text-center font-nunito text-[12.5px] font-semibold" style={{ border: '2px dashed #E4D8FA', color: '#8A5A74' }}>Belum ada pertanyaan. Jadilah yang pertama bertanya.</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer quote */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <Sprig cfg={{ type: 'daisy', bloom: '#FFE29A', bloom2: '#FFF3E6', center: '#F06BA8', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E' }} w={26} h={40} />
        <span className="text-center font-shantell font-semibold" style={{ fontSize: 16, color: '#B4477F' }}>Kamu tidak sendiri. Setiap tantangan adalah kesempatan untuk tumbuh.</span>
        <Sprig cfg={{ type: 'tulip', bloom: '#F06BA8', bloom2: '#F8B9D4', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E' }} w={26} h={40} />
      </div>
    </>
  );

  // -- B2: Clarify --
  const Clarify = () => {
    if (!pilih) return null;
    return (
      <div className="mx-auto w-full max-w-xl">
        <button onClick={keHub} className="mb-3 inline-flex items-center gap-1 font-nunito text-[13px] text-pekat/70"><ArrowLeft className="h-4 w-4" /> Kembali</button>
        <h1 className="font-fredoka text-[24px] font-semibold leading-tight text-pekat">Boleh cerita sedikit?</h1>
        <p className="mt-1 font-nunito text-[14px] text-pekat/70">Supaya saran lebih pas. Usia {nama} sudah kami tahu, jadi tenang saja.</p>
        {pilih.clarify.map((c, i) => (
          <div key={i} className="mt-4 rounded-2xl border p-3" style={{ borderColor: '#E0CBE9', background: '#F6EEFA' }}>
            <div className="font-nunito text-[13px] font-bold text-pekat">{c.pertanyaan}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.opsi.map(o => (
                <button key={o} onClick={() => pilihOpsiClarify(o)} className="rounded-xl border bg-white px-3 py-2 font-nunito text-[12.5px] font-bold text-pekat" style={{ borderColor: '#F0DCE6' }}>{o}</button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={() => setLayar('guide')} className={`mt-4 w-full ${plumBtn}`} style={{ background: PLUM }}>Lanjut</button>
        <button onClick={() => setLayar('guide')} className="mx-auto mt-3 block font-nunito text-[12px] text-pekat/60 underline">Lewati — langsung saran saja</button>
      </div>
    );
  };

  // -- B3/B4: Guide + Action --
  const Guide = () => {
    if (!pilih) return null;
    const r = pilih.respons;
    return (
      <div className="mx-auto w-full max-w-5xl">
        <button onClick={keHub} className="mb-3 inline-flex items-center gap-1 font-nunito text-[13px] text-pekat/70"><ArrowLeft className="h-4 w-4" /> Kembali</button>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="font-shantell text-base" style={{ color: PLUM }}>{pilih.label}</p>
            <div className="mt-2 rounded-2xl border p-4" style={{ borderColor: '#E0CBE9', background: '#F6EEFA' }}>
              <p className="font-nunito text-[13.5px] leading-relaxed text-pekat">{r.validasi}</p>
            </div>

            <p className="mt-4 font-nunito text-[13px] font-extrabold text-pekat">Coba sekarang</p>
            <ol className="mt-1 space-y-2">
              {r.langkah.map((l, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full text-[12px] font-extrabold text-white" style={{ background: PLUM }}>{i + 1}</span>
                  <span className="font-nunito text-[13.5px] leading-snug text-pekat">{l}</span>
                </li>
              ))}
            </ol>

            {r.yangDiamati && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl border border-[#cfe2f2] bg-langit/20 px-3 py-2.5 text-[12.5px] text-pekat">
                <Eye className="mt-0.5 h-4 w-4 flex-none" aria-hidden /> <span>Yang diamati: {r.yangDiamati}</span>
              </div>
            )}

            {r.kenapaSederhana && (
              <div className="mt-3 border-l-[3px] pl-3" style={{ borderColor: PLUM }}>
                <button onClick={() => setWhyOpen(o => !o)} aria-expanded={whyOpen} className="flex items-center gap-1.5 font-nunito text-[12.5px] font-extrabold" style={{ color: PLUM }}>
                  <ChevronRight className={`h-4 w-4 transition ${whyOpen ? 'rotate-90' : ''}`} aria-hidden /> Kenapa ini membantu?
                </button>
                {whyOpen && (
                  <div className="mt-2 font-nunito text-[12.5px] leading-relaxed text-pekat/75">
                    {r.kenapaSederhana}
                    {r.kenapaSumber ? <div className="mt-2"><span className="rounded-md bg-langit/30 px-1.5 py-0.5 text-[9px] font-extrabold uppercase">sumber</span> {r.kenapaSumber}</div> : null}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-3">
            {toast && (
              <div className="flex items-center gap-2 rounded-2xl border border-[#c3ddba] bg-[#EAF6E4] px-3 py-2.5 text-[13px] font-bold text-[#4d7a47]"><Check className="h-4 w-4" /> {toast}</div>
            )}
            <button onClick={() => { void tambahKeKelola(); }} className={`w-full ${plumBtn}`} style={{ background: PLUM }}>Tambahkan ke Kelola</button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={simpanStrategi} className={plumOutlineBtn} style={{ borderColor: PLUM, color: PLUM }}><Bookmark className="h-4 w-4" aria-hidden /> Simpan</button>
              <button onClick={() => { void bagikan(); }} className={plumOutlineBtn} style={{ borderColor: PLUM, color: PLUM }}><Share2 className="h-4 w-4" aria-hidden /> Bagikan</button>
            </div>
            <div className="rounded-2xl border p-3" style={{ borderColor: '#E0CBE9', background: '#F6EEFA' }}>
              <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4" style={{ color: PLUM }} aria-hidden /><span className="font-nunito text-[12.5px] font-extrabold text-pekat">Tips cepat</span></div>
              <p className="mt-1.5 font-nunito text-[12px] leading-relaxed text-pekat/75">Tenangkan dirimu dulu sebelum merespons — satu tarikan napas sering cukup untuk mengubah reaksi menjadi respons.</p>
            </div>
          </aside>
        </div>
      </div>
    );
  };

  // -- B5: Safety --
  const Safety = () => (
    <div className="mx-auto w-full max-w-xl">
      <button onClick={keHub} className="mb-3 inline-flex items-center gap-1 font-nunito text-[13px] text-pekat/70"><ArrowLeft className="h-4 w-4" /> Kembali</button>
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5" style={{ color: PLUM }} aria-hidden />
        <h1 className="font-fredoka text-[23px] font-semibold text-pekat">Kamu tidak sendiri</h1>
      </div>
      <div className="mt-3 rounded-2xl border p-4 font-nunito text-[14px] leading-relaxed text-pekat" style={{ borderColor: '#E0CBE9', background: '#F6EEFA' }}>
        Apa yang kamu rasakan berat, dan kamu berani mengatakannya. Untuk hal seperti ini, berbicara dengan orang yang tepat akan lebih menolong daripada melewatinya sendiri.
      </div>
      <p className="mt-4 font-nunito text-[13px] font-extrabold" style={{ color: PLUM }}>Bantuan yang bisa dihubungi</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {RUJUKAN_KESELAMATAN.map(r => (
          <div key={r.nama} className="rounded-2xl border bg-white p-3" style={{ borderColor: '#F0DCE6' }}>
            <div className="font-nunito text-[13.5px] font-bold text-pekat">{r.nama}</div>
            <div className="font-nunito text-[12px] text-pekat/70">{r.untuk}</div>
            <div className="mt-1 font-nunito text-[13px] font-extrabold text-pekat">{r.kontak}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 font-nunito text-[11.5px] italic leading-relaxed text-pekat/60">
        Bantu bukan layanan krisis. Daftar ini sedang diverifikasi; pastikan nomor terbaru saat menghubungi.
      </p>
    </div>
  );

  return (
    <div style={{ background: '#FCEBD7' }} className="-mx-5 min-h-screen px-5 pb-16 pt-[30px] sm:-mx-8 sm:px-[46px]">
      <section className="mx-auto w-full max-w-[1240px]" aria-live="polite">
        {layar === 'hub' && Hub()}
        {layar === 'clarify' && Clarify()}
        {layar === 'guide' && Guide()}
        {layar === 'safety' && Safety()}
      </section>
    </div>
  );
}
