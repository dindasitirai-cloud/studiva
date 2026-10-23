// =============================================================
// ProfilAnakPage — Profil Anak v2 (Phase 33), tampilan mengikuti
// design_handoff_profil_anak (2026-10-22).
//
// Potret yang MEMBACA dari store yang sudah ada — bukan form baru:
//   identitas (AnakContext) · Peta bidang Anak (usePetaStore) · Yang sedang
//   berubah (useKehidupanStore) · nilai (useAkarStateSync + useFokusMingguIni)
//   · Yang terlihat ≤21 hari (terlihatData) · Cara mengasuh · Peristiwa &
//   imunisasi (Buku KIA) · foto Jurnal. Satu-satunya data baru: kontak darurat.
// Store Peta dibuat SEKALI di sini dan dibagi lewat props (pelajaran Phase 32).
// INVARIANT: tanpa angka progres/skor/streak, tanpa perbandingan antar-anak,
// tanpa bahasa defisit, tanpa emoji. Dekorasi botani aria-hidden & tidak bisa
// diklik. Copy di profil-anak-copy.ts (DRAFT → Fitri).
// =============================================================
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ChevronRight, IdCard, Lock, Pencil, Plus, Share2, ShieldAlert, Trash2 } from 'lucide-react';
import { useAnak, useAnakAktif, useFotoAnak } from '../../context/AnakContext';
import { useAuth } from '../../context/AuthContext';
import { formatUsia, inisialAnak, type ProfilAnak } from '../../types/anak';
import { ModalEditProfil } from '../../pages/DashboardPages/Tier2/ProfilAnakTier2';
import BotanicalStem, { type BotanicalConfig } from '../../components/BotanicalStem';
import { useAkarStateSync } from '../akar-keluarga/state';
import { PENJELASAN_NILAI, type NilaiAkar } from '../akar-keluarga/content';
import { BUNGA_DARI_NAMA } from '../akar-keluarga/registryBunga';
import BungaMekar from '../irama-hari/BungaMekar';
import { TAHAP_MAKS } from '../../lib/mekar';
import { bandDariUsia } from '../akar-keluarga/bandUsia';
import { useFokusMingguIni } from '../../hooks/useFokusMingguIni';
import {
  usePetaStore, useKehidupanStore, useCaraStore, usePeristiwaStore, useImunisasiStore,
  PETA_PERTANYAAN, RINGKAS_LABEL, JENIS_LABEL, bandPeta, jadwalImunisasi,
} from '../irama-hari/kehidupanData';
import type { PetaPertanyaan } from '../irama-hari/kehidupanData';
import { useTerlihat, terlihatDalam, JENDELA_PENYETIR_HARI, adalahTulis, labelTerlihat } from '../irama-hari/terlihatData';
import { DOMAIN_OBS, DOMAIN_TULIS } from '../irama-hari/PerjalananKeluarga';
import { localISO } from '../irama-hari/rencanaData';
import { promptById } from '../rekah-journey/observation/observationPrompts';
import { getJurnalHariRentang, urlFotoJurnal } from '../../lib/supabase/rekah';
import { COPY_PROFIL, COPY_REDESIGN as R, TENANG_DALAM_KALIMAT } from './profil-anak-copy';
import { LaciTentangAnak } from './LaciTentangAnak';
import { ModalKartuPengasuh } from './KartuUntukPengasuh';
import { useKontakDaruratStore } from './kontakDarurat';
import type { InputKartu } from './isiKartuPengasuh';

const KELOLA = '/dashboard/tier2/kelola';

// ── Token handoff (Langit Peony, hi-fi) ──────────────────────────────────────
const kartuPutih = 'rounded-[28px] border-[1.5px] border-[#F6E6EE] bg-white px-6 py-[22px]';
const judulKartu = 'font-fredoka text-[21px] font-bold text-pekat';
const tautan = 'rounded font-nunito text-[13.5px] font-extrabold text-[#D2559A] transition hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah';
const fokusCincin = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2';

// Warna tile fakta per pertanyaan (handoff §4); sisanya bergilir dari palet yang sama.
const WARNA_FAKTA: Record<string, { soft: string; ink: string }> = {
  a_suasana: { soft: '#FDE9F2', ink: '#D2559A' },
  a_tenang: { soft: '#FFF4D6', ink: '#B07A1E' },
  a_main: { soft: '#F1EBFB', ink: '#7B5BB8' },
  a_menyusu: { soft: '#E8F1FC', ink: '#3F64A8' },
  a_tummy: { soft: '#EAF4E6', ink: '#4E8A3E' },
  a_khusus: { soft: '#F4F0FA', ink: '#7B5BB8' },
};
const PALET_FAKTA = [
  { soft: '#FFF4D6', ink: '#B07A1E' }, { soft: '#E8F1FC', ink: '#3F64A8' }, { soft: '#EAF4E6', ink: '#4E8A3E' },
  { soft: '#FDE9F2', ink: '#D2559A' }, { soft: '#F1EBFB', ink: '#7B5BB8' },
];
// Pertanyaan yang tidak tampil di grid: alergi punya strip sendiri, saudara sudah jadi pill.
const BUKAN_GRID = new Set(['a_alergi', 'a_saudara']);

// 5 area perkembangan (handoff §5). Domain lain dari Jurnal tetap ditampilkan bila ada catatan.
const AREA: { dom: string; nama: string; ink: string; bg: string }[] = [
  { dom: 'Gross Motor', nama: 'Motorik Kasar', ink: '#4E8A3E', bg: '#EAF4E6' },
  { dom: 'Fine Motor', nama: 'Motorik Halus', ink: '#B4612A', bg: '#FCEDE2' },
  { dom: 'Cognitive', nama: 'Kognitif', ink: '#3F64A8', bg: '#E8F1FC' },
  { dom: 'Language & Communication', nama: 'Bahasa', ink: '#9A7A2C', bg: '#FFF4D6' },
  { dom: 'Social-Emotional', nama: 'Sosial-Emosional', ink: '#C24A8A', bg: '#FDE9F2' },
];

const ORANG_WARNA = [
  { bg: '#FDE9F2', ink: '#D2559A' }, { bg: '#FFF1C9', ink: '#B07A1E' }, { bg: '#F1EBFB', ink: '#7B5BB8' }, { bg: '#E3EEFC', ink: '#3F64A8' },
];

const BOT: Record<string, BotanicalConfig> = {
  star: { type: 'star', bloom: '#FFE29A' },
  dot: { type: 'dot', bloom: '#C9B8F0' },
  squiggle: { type: 'squiggle', bloom: '#8FB8F7' },
  foliage: { type: 'foliage' },
  tulip: { type: 'tulip', bloom: '#F06BA8', bloom2: '#F8B9D4' },
  sprig: { type: 'sprig', bloom: '#C9B8F0', bloom2: '#FFF3E6' },
  daisy: { type: 'daisy', bloom: '#FFE29A', center: '#F06BA8', bloom2: '#FFF3E6' },
  leaf: { type: 'leaf', leaf: '#8FB84A' },
  bell: { type: 'bell', bloom: '#F06BA8', bloom2: '#F8B9D4' },
  arch: { type: 'arch', bloom: '#8FB8F7' },
  fivepetal: { type: 'fivepetal', bloom: '#F8B9D4' },
  sprigJudul: { type: 'sprig', bloom: '#F06BA8', bloom2: '#FFE29A' },
};

/** Ornamen botani: dekoratif saja — aria-hidden & pointer-events:none. */
function Hias({ cfg, style, className = '' }: { cfg: BotanicalConfig; style: React.CSSProperties; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`} style={style}>
      <BotanicalStem cfg={cfg} />
    </div>
  );
}

function IkonPlus({ size = 12 }: { size?: number }) {
  return <Plus style={{ width: size, height: size }} strokeWidth={3} aria-hidden />;
}

function tanggalPendekPanjang(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
const tglPendek = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
const kecil = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const besar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
function daftarKalimat(xs: string[], kata = 'dan'): string {
  if (xs.length <= 1) return xs[0] ?? '';
  return `${xs.slice(0, -1).join(', ')} ${kata} ${xs[xs.length - 1]}`;
}

/** Ringkasan lengkap dari Peta bidang Anak. null bila jawaban belum cukup. */
function ringkasanLengkap(nama: string, j: Record<string, string[]>): string | null {
  const suasana = (j.a_suasana ?? []).map(kecil);
  const main = (j.a_main ?? []).map(v => kecil(v.replace(' & ', ' dan ')));
  const tenang = (j.a_tenang ?? []).map(v => TENANG_DALAM_KALIMAT[v] ?? kecil(v));
  const out: string[] = [];
  if (suasana.length) out.push(`${nama} sedang tumbuh sebagai anak yang ${daftarKalimat(suasana)}.`);
  if (main.length) out.push(`Paling suka ${daftarKalimat(main)}.`);
  if (tenang.length) out.push(`Saat rewel, paling cepat tenang bila ${daftarKalimat(tenang)}.`);
  return out.length ? out.join(' ') : null;
}

/** Ringkasan pendek (≤ 2 kalimat), diturunkan dari jawaban yang sama. */
function ringkasanPendek(j: Record<string, string[]>): string | null {
  const suasana = (j.a_suasana ?? []).slice(0, 2);
  const main = (j.a_main ?? []).slice(0, 2).map(v => kecil(v.replace(' & ', ' dan ')));
  const tenang = (j.a_tenang ?? []).slice(0, 2).map(v => TENANG_DALAM_KALIMAT[v] ?? kecil(v));
  const s1: string[] = [];
  if (suasana.length) s1.push(besar(daftarKalimat(suasana.map(kecil))));
  if (main.length) s1.push(`${s1.length ? 'suka' : 'Suka'} ${daftarKalimat(main)}`);
  const k1 = s1.length ? `${s1.join(', ')}.` : '';
  const k2 = tenang.length ? `Paling cepat tenang saat ${daftarKalimat(tenang, 'atau')}.` : '';
  const hasil = [k1, k2].filter(Boolean).join(' ');
  return hasil || null;
}

/**
 * Kartu profil menempel (sticky) saat berdampingan dengan kolom kanan, supaya
 * hanya kolom kanan yang bergulir. Bila kartu lebih tinggi dari layar, titik
 * tempelnya digeser ke atas agar tombol di bawah kartu tetap terlihat.
 * Saat bertumpuk (layar sempit) kartu tidak menempel.
 */
function useKartuMenempel(kartu: React.RefObject<HTMLElement>, kolomKanan: React.RefObject<HTMLElement>): React.CSSProperties {
  const [gaya, setGaya] = useState<React.CSSProperties>({});
  useEffect(() => {
    const a = kartu.current;
    const b = kolomKanan.current;
    if (!a || !b) return;
    const JARAK = 16;
    const hitung = () => {
      // Dibandingkan secara horizontal: offsetTop kartu berubah saat menempel.
      const berdampingan = b.offsetLeft >= a.offsetLeft + a.offsetWidth;
      if (!berdampingan) { setGaya({}); return; }
      const top = Math.min(JARAK, window.innerHeight - a.offsetHeight - JARAK);
      setGaya({ position: 'sticky', top });
    };
    hitung();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(hitung) : null;
    ro?.observe(a);
    ro?.observe(b);
    window.addEventListener('resize', hitung);
    return () => { ro?.disconnect(); window.removeEventListener('resize', hitung); };
  }, [kartu, kolomKanan]);
  return gaya;
}

// ── Header: pemilih anak ─────────────────────────────────────────────────────

function PemilihAnak() {
  const { daftarAnak, anakAktif, pilihAnak, mintaTambahAnak } = useAnak();
  return (
    <div role="group" aria-label={COPY_PROFIL.pemilih.label} className="flex flex-wrap gap-2">
      {daftarAnak.map(a => {
        const aktif = a.id === anakAktif?.id;
        return (
          <button key={a.id} type="button" aria-pressed={aktif} onClick={() => pilihAnak(a.id)}
            className={`flex items-center gap-2 rounded-full border-[1.5px] py-[5px] pl-[5px] pr-3.5 font-nunito text-[14px] font-extrabold text-pekat transition ${fokusCincin} ${aktif ? 'border-rekah bg-[#FFF4F9]' : 'border-[#F6E6EE] bg-white hover:border-[#F2C6DA]'}`}>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F8C9DE] font-fredoka text-[14px] text-[#D2559A]">{inisialAnak(a.namaAnak)}</span>
            {a.namaAnak}
          </button>
        );
      })}
      <button type="button" onClick={mintaTambahAnak}
        className={`flex items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-[#F2C6DA] px-3.5 py-2 font-nunito text-[14px] font-extrabold text-[#B48DA3] transition hover:border-rekah hover:text-[#D2559A] ${fokusCincin}`}>
        <IkonPlus size={13} /> {R.tambahAnak}
      </button>
    </div>
  );
}

// ── Kartu profil (kiri) ──────────────────────────────────────────────────────

function AvatarTetes({ anak, onGanti }: { anak: ProfilAnak; onGanti: (f: File) => void }) {
  const foto = useFotoAnak(anak.fotoPath);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="relative">
      <div className="flex h-[116px] w-[116px] items-center justify-center overflow-hidden bg-[#F6B9D5] font-fredoka text-[56px] font-bold text-[#D2559A]"
        style={{ borderRadius: '58px 58px 58px 18px' }}>
        {foto ? <img src={foto} alt="" className="h-full w-full object-cover" /> : inisialAnak(anak.namaAnak)}
      </div>
      <button type="button" onClick={() => ref.current?.click()} aria-label={COPY_PROFIL.potret.gantiFoto(anak.namaAnak)}
        className={`absolute -bottom-0.5 -right-1 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-pekat transition hover:bg-[#FFF4F9] ${fokusCincin}`}
        style={{ boxShadow: '0 4px 12px -6px #B48DA3' }}>
        <Camera className="h-4 w-4" strokeWidth={2.2} aria-hidden />
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onGanti(f); e.target.value = ''; }} />
    </div>
  );
}

// ── Yang terlihat (5 area) ───────────────────────────────────────────────────

function YangTerlihat({ idAnak }: { idAnak: string }) {
  const terlihat = useTerlihat(idAnak);
  const hariIni = localISO(new Date());
  const perDom = useMemo(() => {
    const per: Record<string, { label: string; tgl: string }[]> = {};
    for (const [id, tgl] of Object.entries(terlihatDalam(terlihat.peta, hariIni, JENDELA_PENYETIR_HARI))) {
      const label = labelTerlihat(id);
      if (!label) continue;
      const dom = adalahTulis(id) ? '__tulis' : (promptById(id)?.domainOrArea ?? '__tulis');
      if (!per[dom]) per[dom] = [];
      per[dom].push({ label, tgl: tgl[0] });
    }
    Object.values(per).forEach(xs => xs.sort((a, b) => b.tgl.localeCompare(a.tgl)));
    return per;
  }, [terlihat.peta, hariIni]);

  // Area di luar 5 utama (Regulasi Diri, Bantu Diri, Catatan sendiri) tetap muncul bila ada catatan.
  const ekstra = Object.keys(perDom)
    .filter(d => !AREA.some(a => a.dom === d))
    .map(d => {
      const info = d === '__tulis' ? DOMAIN_TULIS : (DOMAIN_OBS[d] ?? DOMAIN_TULIS);
      return { dom: d, nama: info.label, ink: info.ink, bg: info.soft };
    });
  const tile = [...AREA, ...ekstra];
  const terisi = AREA.filter(a => (perDom[a.dom] ?? []).length > 0).length;

  return (
    <section aria-labelledby="terlihat-judul" className={kartuPutih}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="terlihat-judul" className={judulKartu}>{COPY_PROFIL.terlihat.judul}</h2>
          <p className="mt-0.5 font-nunito text-[13.5px] font-bold text-[#9A6F86]">{R.terlihatSub(terisi, AREA.length)}</p>
        </div>
        <Link to={`${KELOLA}?tab=jurnal`} className={tautan}>{COPY_PROFIL.terlihat.tautan}</Link>
      </div>
      <div className="mt-3.5 grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))' }}>
        {tile.map(a => {
          const isi = perDom[a.dom] ?? [];
          const ada = isi.length > 0;
          return (
            <div key={a.dom}
              className={`flex min-h-[104px] min-w-0 flex-col gap-2 rounded-[18px] border-[1.5px] px-3.5 py-[13px] ${ada ? '' : 'border-dashed border-[#F2DDE7] bg-white'}`}
              style={ada ? { background: a.bg, borderColor: a.bg } : undefined}>
              <div className="flex items-center gap-[7px]">
                <span aria-hidden="true" className="h-[9px] w-[9px] flex-none rounded-full" style={{ background: a.ink }} />
                <span className="font-nunito text-[13px] font-extrabold" style={{ color: a.ink }}>{a.nama}</span>
              </div>
              {ada ? (
                <>
                  <p className="font-nunito text-[14.5px] font-extrabold leading-[1.3] text-pekat">{isi[0].label}</p>
                  <p className="mt-auto font-nunito text-[12px] font-bold text-[#9A6F86]">
                    {tglPendek(isi[0].tgl)}{isi.length > 1 && ` · ${R.lainnya(isi.length - 1)}`}
                  </p>
                </>
              ) : (
                <Link to={`${KELOLA}?tab=jurnal`}
                  className="mt-auto flex items-center gap-[5px] self-start rounded font-nunito text-[13px] font-extrabold text-[#B48DA3] transition hover:text-[#D2559A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                  aria-label={`${R.catat} ${a.nama}`}>
                  <IkonPlus /> {R.catat}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Momen (foto Jurnal) ──────────────────────────────────────────────────────

function MomenDirayakan({ idAnak }: { idAnak: string }) {
  const [foto, setFoto] = useState<{ url: string; ket: string; tgl: string }[]>([]);
  useEffect(() => {
    let batal = false;
    const tgl: string[] = [];
    const d = new Date();
    for (let i = 0; i < 60; i += 1) { const x = new Date(d); x.setDate(d.getDate() - i); tgl.push(localISO(x)); }
    getJurnalHariRentang(idAnak, tgl)
      .then(async hasil => {
        const calon = Object.entries(hasil)
          .sort(([a], [b]) => b.localeCompare(a))
          .flatMap(([t, h]) => h.foto.map(p => ({ p, t, ket: h.cerita.trim() })))
          .slice(0, 7);
        const url = await Promise.all(calon.map(c => urlFotoJurnal(c.p)));
        if (!batal) setFoto(calon.map((c, i) => ({ url: url[i] ?? '', ket: c.ket, tgl: c.t })).filter(x => x.url));
      })
      .catch(() => { if (!batal) setFoto([]); });
    return () => { batal = true; };
  }, [idAnak]);

  return (
    <section aria-labelledby="momen-judul" className={kartuPutih}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="momen-judul" className={judulKartu}>{COPY_PROFIL.kenangan.judul}</h2>
        <Link to={`${KELOLA}?tab=jurnal`} className={tautan}>{COPY_PROFIL.kenangan.tautan}</Link>
      </div>
      <div className="mt-3.5 grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
        {foto.map(f => (
          <figure key={f.url} className="m-0 flex min-w-0 flex-col gap-1.5">
            <div className="aspect-square max-w-full overflow-hidden rounded-[18px] bg-[#F4EEE8]">
              <img src={f.url} alt={f.ket || tglPendek(f.tgl)} className="block h-full w-full object-cover" />
            </div>
            <figcaption className="truncate font-nunito text-[12.5px] font-bold text-[#9A6F86]">{f.ket || tglPendek(f.tgl)}</figcaption>
          </figure>
        ))}
        <Link to={`${KELOLA}?tab=jurnal`}
          className="flex aspect-square max-w-full flex-col items-center justify-center gap-1.5 rounded-[18px] border-[1.5px] border-dashed border-[#F2C6DA] font-nunito text-[13px] font-extrabold text-[#B48DA3] transition hover:border-rekah hover:text-[#D2559A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
          <IkonPlus size={18} /> {R.tambahMomen}
        </Link>
      </div>
    </section>
  );
}

// ── Halaman ──────────────────────────────────────────────────────────────────

export default function ProfilAnakPage() {
  const { gantiFoto, hapusAnak } = useAnak();
  const { anak, usiaBulan } = useAnakAktif();
  const { supabaseUser } = useAuth();
  const idAnak = anak.id;
  const nama = anak.namaAnak;
  const usiaTeks = formatUsia(usiaBulan);

  // Store dibuat SEKALI dan dibagi ke laci, tile fakta, ringkasan, kartu pengasuh.
  const peta = usePetaStore(idAnak);
  const kehidupan = useKehidupanStore(idAnak);
  const cara = useCaraStore(idAnak);
  const peristiwa = usePeristiwaStore(idAnak);
  const imun = useImunisasiStore(idAnak);
  const kontak = useKontakDaruratStore(supabaseUser?.id ?? 'lokal');
  const [akarState] = useAkarStateSync(idAnak);
  const nilai = useMemo(() => (akarState.nilai as NilaiAkar[]).filter(v => v in PENJELASAN_NILAI), [akarState.nilai]);
  const { fokus } = useFokusMingguIni(idAnak, nilai);

  const band = bandDariUsia(usiaBulan);
  const bandP = bandPeta(usiaBulan);
  const pertanyaanAnak: PetaPertanyaan[] = useMemo(
    () => PETA_PERTANYAAN.filter(q => q.bidang === 'anak' && (q.band === 'all' || q.band === bandP)),
    [bandP],
  );

  const [laci, setLaci] = useState<{ sorot: string | null } | null>(null);
  const [modalKartu, setModalKartu] = useState(false);
  const [ringkasLengkap, setRingkasLengkap] = useState(false);
  const [faktaBuka, setFaktaBuka] = useState<Record<string, boolean>>({});
  const snapshotRef = useRef('');
  const kartuRef = useRef<HTMLElement>(null);
  const kananRef = useRef<HTMLDivElement>(null);
  const gayaMenempel = useKartuMenempel(kartuRef, kananRef);
  const [toast, setToast] = useState('');
  const [editTerbuka, setEditTerbuka] = useState(false);
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);
  const [galatFoto, setGalatFoto] = useState('');

  const bukaLaci = (sorot: string | null) => { snapshotRef.current = JSON.stringify(peta.jawaban); setLaci({ sorot }); };
  const tutupLaci = useCallback(() => {
    setLaci(null);
    if (JSON.stringify(peta.jawaban) !== snapshotRef.current) setToast(COPY_PROFIL.laci.tersimpan);
  }, [peta.jawaban]);
  const tutupModal = useCallback(() => setModalKartu(false), []);

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { if (!galatFoto) return; const t = setTimeout(() => setGalatFoto(''), 6000); return () => clearTimeout(t); }, [galatFoto]);
  // Ganti anak → tutup semua panel & reset tampilan.
  useEffect(() => {
    setLaci(null); setModalKartu(false); setEditTerbuka(false); setKonfirmasiHapus(false);
    setRingkasLengkap(false); setFaktaBuka({});
  }, [idAnak]);

  async function tanganiGantiFoto(f: File) {
    try { await gantiFoto(idAnak, f); } catch (e) { setGalatFoto(e instanceof Error ? e.message : 'Foto belum tersimpan. Coba lagi ya.'); }
  }

  const j = peta.jawaban;
  const pendek = ringkasanPendek(j);
  const lengkap = ringkasanLengkap(nama, j);
  const ringkasan = ringkasLengkap ? lengkap : pendek;

  const pills: { teks: string; cls: string }[] = [
    band ? { teks: COPY_PROFIL.potret.tahap(band.judul), cls: 'bg-[#FFE08A] text-[#7A5410]' } : null,
    ...(j.a_saudara ?? []).map(v => ({ teks: v, cls: 'bg-[#DCE8FB] text-[#3F64A8]' })),
    (j.c_bahasa ?? []).length ? { teks: daftarKalimat(j.c_bahasa), cls: 'border-[1.5px] border-[#F2DDE7] bg-white text-pekat' } : null,
  ].filter((x): x is { teks: string; cls: string } => !!x);

  const alergi = (j.a_alergi ?? []).filter(v => v !== 'Tidak ada');
  const faktaTerisi = pertanyaanAnak.filter(q => !BUKAN_GRID.has(q.id) && (j[q.id] ?? []).length > 0);
  const faktaKosong = pertanyaanAnak.filter(q => !BUKAN_GRID.has(q.id) && (j[q.id] ?? []).length === 0);
  const berubahAnak = kehidupan.aktif.filter(k => k.bidang === 'anak');

  const hariIni = localISO(new Date());
  const mendatang = useMemo(() => {
    const a = peristiwa.items.filter(p => p.tanggal >= hariIni)
      .map(p => ({ id: p.id, tgl: p.tanggal, judul: p.judul, sub: JENIS_LABEL[p.jenis] }));
    const b = jadwalImunisasi(anak.tanggalLahir, usiaBulan)
      .map(x => ({ id: x.key, tgl: imun.jadwal[x.key]?.tgl ?? x.due, judul: x.label, sub: R.usiaBulan(x.bln) }))
      .filter(x => x.tgl >= hariIni);
    return [...a, ...b].sort((x, y) => x.tgl.localeCompare(y.tgl)).slice(0, 3);
  }, [peristiwa.items, imun.jadwal, anak.tanggalLahir, usiaBulan, hariIni]);

  const inputKartu: InputKartu = useMemo(() => ({
    jawaban: j,
    caraKita: cara.items.filter(c => c.dibagikan).map(c => c.teks),
    catatanKhusus: kontak.catatanKhusus(idAnak),
    kontak: kontak.kontak,
    faskes: kontak.faskes,
  }), [j, cara.items, kontak, idAnak]);

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-[18px] pb-14 pt-7">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-nunito text-[12px] font-extrabold tracking-[1.6px] text-[#B48DA3]">{R.eyebrow}</p>
          <div className="mt-0.5 flex items-end gap-2.5">
            <h1 className="font-fredoka text-[34px] font-bold leading-[1.1] text-pekat">{COPY_PROFIL.judul(nama)}</h1>
            <div aria-hidden="true" className="pointer-events-none mb-0.5 h-[39px] w-[26px] flex-none"><BotanicalStem cfg={BOT.sprigJudul} /></div>
          </div>
        </div>
        <PemilihAnak />
      </div>

      <div className="flex flex-wrap items-start gap-[18px]">
        {/* ── Kartu profil ── */}
        <section ref={kartuRef} aria-label={`Profil ${nama}`}
          className="relative z-[1] flex max-w-full flex-col items-center gap-3.5 overflow-hidden rounded-[28px] border-[1.5px] border-[#F8D7E6] px-6 pb-24 pt-6 text-center"
          style={{ flex: '1 1 300px', background: 'linear-gradient(170deg,#FDE3EF,#FFF7FB 70%)', ...gayaMenempel }}>
          <Hias cfg={BOT.star} style={{ left: 22, top: 20, width: 22, height: 33 }} />
          <Hias cfg={BOT.dot} style={{ right: 34, top: 40, width: 16, height: 24 }} />
          <Hias cfg={BOT.squiggle} style={{ right: 18, top: 120, width: 22, height: 33 }} />
          <Hias cfg={BOT.foliage} style={{ left: -6, bottom: -4, width: 56, height: 84 }} />
          <Hias cfg={BOT.tulip} style={{ left: 34, bottom: -4, width: 58, height: 87 }} />
          <Hias cfg={BOT.sprig} style={{ left: '50%', marginLeft: -30, bottom: -4, width: 56, height: 84 }} />
          <Hias cfg={BOT.daisy} style={{ right: 44, bottom: -4, width: 62, height: 93 }} />
          <Hias cfg={BOT.leaf} style={{ right: -4, bottom: -4, width: 40, height: 72 }} />

          <AvatarTetes anak={anak} onGanti={tanganiGantiFoto} />
          <div>
            <p className="font-fredoka text-[30px] font-bold leading-[1.1] text-pekat">{nama}</p>
            <p className="mt-1 font-nunito text-[14.5px] font-bold text-[#9A6F86]">{R.subUsia(usiaTeks, tanggalPendekPanjang(anak.tanggalLahir))}</p>
          </div>
          {pills.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {pills.map(p => <span key={p.teks} className={`rounded-full px-3 py-1.5 font-nunito text-[13px] font-extrabold ${p.cls}`}>{p.teks}</span>)}
            </div>
          )}

          <div className="relative w-full rounded-[20px] bg-white px-4 py-3.5 text-left">
            <p className="flex items-center gap-1.5 font-nunito text-[11.5px] font-extrabold tracking-[1.2px] text-[#7B5BB8]">
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="#C9B6F0"><path d="M12 2l2.2 6.3L20 10l-5.8 1.7L12 18l-2.2-6.3L4 10l5.8-1.7z" /></svg>
              {R.labelRangkuman}
            </p>
            <p className="mt-1.5 font-shantell text-[15px] font-medium leading-[1.5] text-pekat" style={{ textWrap: 'pretty' } as React.CSSProperties}>
              {ringkasan ?? COPY_PROFIL.potret.ajakan(nama)}
            </p>
            {pendek && lengkap && pendek !== lengkap && (
              <button type="button" onClick={() => setRingkasLengkap(v => !v)} aria-expanded={ringkasLengkap}
                className="mt-1.5 rounded font-nunito text-[13px] font-extrabold text-[#D2559A] hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
                {ringkasLengkap ? R.ringkas : R.bacaLengkap}
              </button>
            )}
          </div>

          <div className="relative flex w-full flex-col gap-2">
            <button type="button" onClick={() => bukaLaci(null)}
              className={`rounded-full bg-rekah px-[18px] py-[13px] font-nunito text-[15px] font-extrabold text-white transition hover:bg-[#D2559A] ${fokusCincin}`}
              style={{ boxShadow: '0 10px 20px -12px #D2559A' }}>
              {COPY_PROFIL.potret.perbarui(nama)}
            </button>
            <button type="button" onClick={() => setModalKartu(true)}
              className={`flex items-center justify-center gap-2 rounded-full border-[1.5px] border-[#F2C6DA] bg-white px-[18px] py-3 font-nunito text-[15px] font-extrabold text-pekat transition hover:border-rekah ${fokusCincin}`}>
              <Share2 className="h-4 w-4" strokeWidth={2.2} aria-hidden /> {R.kartuPengasuh}
            </button>
          </div>
          {galatFoto && <p role="alert" className="relative rounded-xl bg-white px-3 py-2 font-nunito text-[12.5px] font-bold text-[#D2559A]">{galatFoto}</p>}
        </section>

        {/* ── Kolom kanan ── */}
        <div ref={kananRef} className="flex min-w-0 flex-col gap-[18px]" style={{ flex: '999 1 480px' }}>
          {alergi.length > 0 && (
            <div className="flex items-center gap-3 rounded-[22px] border-[1.5px] border-[#F8C7CF] bg-[#FFEDEF] px-[18px] py-3.5">
              <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl bg-white">
                <ShieldAlert className="h-[19px] w-[19px] text-[#C8404F]" strokeWidth={2.3} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-nunito text-[11.5px] font-extrabold tracking-[1.2px] text-[#C8404F]">{R.alergiLabel}</p>
                <p className="mt-px font-nunito text-[15.5px] font-extrabold text-pekat">{alergi.join(' · ')}</p>
              </div>
              <button type="button" onClick={() => bukaLaci('a_alergi')} aria-label={R.ubahJawaban('alergi')}
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[#C8404F] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8404F]">
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          )}

          {/* Akhir-akhir ini */}
          <section aria-labelledby="akhir-judul" className={kartuPutih}>
            <div className="flex items-center justify-between gap-3">
              <h2 id="akhir-judul" className={judulKartu}>{COPY_PROFIL.tentang.judul(nama)}</h2>
              <Link to={`${KELOLA}?tab=keluarga`} className={tautan}>{R.petaKeluarga}</Link>
            </div>
            <div className="mt-3.5 grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,210px),1fr))' }}>
              {faktaTerisi.map((q, i) => {
                const w = WARNA_FAKTA[q.id] ?? PALET_FAKTA[i % PALET_FAKTA.length];
                const label = (RINGKAS_LABEL[q.id] ?? q.teks.replace(/\?$/, '')).toUpperCase();
                const semua = j[q.id] ?? [];
                const buka = !!faktaBuka[q.id];
                const chips = buka ? semua : semua.slice(0, 3);
                const sisa = semua.length - chips.length;
                const bisaBuka = semua.length > 3;
                return (
                  <div key={q.id} className="min-w-0 rounded-[20px] px-[15px] py-3.5" style={{ background: w.soft }}>
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true" className="h-[9px] w-[9px] flex-none rounded-full" style={{ background: w.ink }} />
                      <span className="flex-1 font-nunito text-[12px] font-extrabold tracking-[1px]" style={{ color: w.ink }}>{label}</span>
                      {q.sensitif && <Lock className="h-[13px] w-[13px]" style={{ color: w.ink }} strokeWidth={2.4} aria-label="privat" />}
                      <button type="button" onClick={() => bukaLaci(q.id)} aria-label={R.ubahJawaban(RINGKAS_LABEL[q.id] ?? 'jawaban')}
                        className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah" style={{ color: w.ink }}>
                        <Pencil className="h-3 w-3" aria-hidden />
                      </button>
                    </div>
                    <div
                      className={`mt-2.5 flex flex-wrap gap-[5px] ${bisaBuka ? 'cursor-pointer' : ''}`}
                      role={bisaBuka ? 'button' : undefined}
                      tabIndex={bisaBuka ? 0 : undefined}
                      aria-expanded={bisaBuka ? buka : undefined}
                      aria-label={bisaBuka ? R.lihatSemua(RINGKAS_LABEL[q.id] ?? '') : undefined}
                      onClick={bisaBuka ? () => setFaktaBuka(o => ({ ...o, [q.id]: !o[q.id] })) : undefined}
                      onKeyDown={bisaBuka ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFaktaBuka(o => ({ ...o, [q.id]: !o[q.id] })); } } : undefined}
                    >
                      {chips.map(c => <span key={c} className="rounded-full bg-white px-2.5 py-1 font-nunito text-[13px] font-extrabold text-pekat">{c}</span>)}
                      {sisa > 0 && <span className="rounded-full px-2.5 py-1 font-nunito text-[13px] font-extrabold" style={{ color: w.ink }}>+{sisa}</span>}
                    </div>
                  </div>
                );
              })}
              {faktaKosong.length > 0 && (
                <button type="button" onClick={() => bukaLaci(faktaKosong[0].id)}
                  className="flex min-w-0 flex-col items-start justify-between gap-2 rounded-[20px] border-[1.5px] border-dashed border-[#F2DDE7] bg-white px-[15px] py-3.5 text-left transition hover:border-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
                  <span className="font-nunito text-[13px] font-bold leading-snug text-[#9A6F86]">
                    {R.belumDiceritakan(faktaKosong.length)}: {faktaKosong.slice(0, 3).map(q => kecil(RINGKAS_LABEL[q.id] ?? q.id)).join(', ')}{faktaKosong.length > 3 ? '…' : ''}
                  </span>
                  <span className="flex items-center gap-[5px] font-nunito text-[13px] font-extrabold text-[#D2559A]"><IkonPlus /> {R.ceritakan}</span>
                </button>
              )}
            </div>
            {berubahAnak.length > 0 && (
              <div className="mt-3.5 flex flex-wrap items-center gap-2.5 border-t-[1.5px] border-dashed border-[#F2DDE7] pt-3.5">
                <span className="font-nunito text-[12px] font-extrabold tracking-[1.2px] text-[#B48DA3]">{R.sedangBerubah}</span>
                {berubahAnak.map(k => (
                  <span key={k.id} className="rounded-full bg-[#EDE4FB] px-3 py-[5px] font-nunito text-[13px] font-extrabold text-[#7B5BB8]">{k.judul}</span>
                ))}
                <Link to={`${KELOLA}?tab=keluarga`} className={`${tautan} ml-auto`}>{R.kelola}</Link>
              </div>
            )}
          </section>

          <YangTerlihat idAnak={idAnak} />

          {/* Banner kartu pengasuh */}
          <button type="button" onClick={() => setModalKartu(true)}
            className={`relative flex w-full flex-wrap items-center gap-4 overflow-hidden rounded-[28px] bg-[#FFF1C9] px-6 py-5 text-left transition hover:bg-[#FFEAB0] ${fokusCincin}`}>
            <Hias cfg={BOT.bell} style={{ right: -8, bottom: -14, width: 54, height: 81, opacity: 0.9 }} />
            <Hias cfg={BOT.arch} style={{ right: 44, top: -18, width: 30, height: 45 }} />
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white">
              <IdCard className="h-[22px] w-[22px] text-[#B07A1E]" strokeWidth={2.2} aria-hidden />
            </span>
            <span className="min-w-[200px] flex-1">
              <span className={`block ${judulKartu}`}>{R.bannerJudul(nama)}</span>
              <span className="mt-0.5 block font-nunito text-[13.5px] font-bold text-[#9A7A2C]">{R.bannerSub}</span>
            </span>
            <span className="relative mr-[30px] flex items-center gap-[7px] rounded-full bg-rekah px-[18px] py-[11px] font-nunito text-[14.5px] font-extrabold text-white"
              style={{ boxShadow: '0 10px 20px -12px #D2559A' }}>
              {R.bannerTombol} <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
            </span>
          </button>

          {/* Baris bawah */}
          <div className="grid items-start gap-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))' }}>
            <section aria-labelledby="mendatang-judul" className={kartuPutih}>
              <div className="flex items-center justify-between gap-3">
                <h2 id="mendatang-judul" className={judulKartu}>{COPY_PROFIL.mendatang.judul}</h2>
                <Link to={`${KELOLA}?tab=keluarga`} className={tautan}>{COPY_PROFIL.mendatang.tautan}</Link>
              </div>
              {mendatang.length === 0 ? (
                <p className="mt-3.5 font-nunito text-[13.5px] font-bold text-[#9A6F86]">{COPY_PROFIL.mendatang.kosong}</p>
              ) : (
                <ul className="mt-3.5 flex flex-col gap-3">
                  {mendatang.map(m => {
                    const d = new Date(`${m.tgl}T00:00:00`);
                    return (
                      <li key={m.id} className="flex items-center gap-3">
                        <span className="w-[50px] flex-none rounded-[14px] bg-[#E3EEFC] py-1.5 text-center text-[#3F64A8]">
                          <span className="block font-fredoka text-[20px] font-bold leading-none">{d.getDate()}</span>
                          <span className="mt-0.5 block font-nunito text-[10.5px] font-extrabold uppercase tracking-[1px]">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                        </span>
                        <span className="min-w-0">
                          <span className="block font-nunito text-[14.5px] font-extrabold leading-[1.3] text-pekat">{m.judul}</span>
                          <span className="mt-0.5 block font-nunito text-[12.5px] font-bold text-[#9A6F86]">{m.sub}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-3.5 font-nunito text-[12px] font-bold text-[#B48DA3]">{R.mendatangCatatan}</p>
            </section>

            <div className="flex min-w-0 flex-col gap-[18px]">
              <section aria-labelledby="orang-judul" className={kartuPutih}>
                <div className="flex items-center justify-between gap-3">
                  <h2 id="orang-judul" className={judulKartu}>{R.orangJudul}</h2>
                  <button type="button" onClick={() => setEditTerbuka(true)} className={tautan}>{COPY_PROFIL.orang.ubah}</button>
                </div>
                <div className="mt-3.5 flex flex-wrap gap-2.5">
                  {anak.pendamping.map((p, i) => {
                    const w = ORANG_WARNA[i % ORANG_WARNA.length];
                    return (
                      <span key={`${p.panggilan}-${i}`} className="flex items-center gap-2 rounded-full py-[5px] pl-[5px] pr-3.5 font-nunito text-[14px] font-extrabold text-pekat" style={{ background: w.bg }}>
                        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white font-fredoka" style={{ color: w.ink }}>{inisialAnak(p.panggilan)}</span>
                        {p.panggilan}
                      </span>
                    );
                  })}
                  <button type="button" onClick={() => setEditTerbuka(true)}
                    className="flex items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-[#F2C6DA] px-3.5 py-[5px] font-nunito text-[13.5px] font-extrabold text-[#B48DA3] transition hover:border-rekah hover:text-[#D2559A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
                    <IkonPlus /> {R.orangTambah}
                  </button>
                </div>
              </section>

              <section aria-labelledby="tanam-judul" className={kartuPutih}>
                <div className="flex items-center justify-between gap-3">
                  <h2 id="tanam-judul" className={judulKartu}>{R.tanamJudul}</h2>
                  <Link to={`${KELOLA}?tab=perjalanan`} className={tautan}>{R.tanamTautan}</Link>
                </div>
                {nilai.length === 0 ? (
                  <div className="mt-3 flex items-center gap-3 rounded-[18px] border-[1.5px] border-dashed border-[#F2C6DA] px-3.5 py-3">
                    <div aria-hidden="true" className="pointer-events-none h-[51px] w-[34px] flex-none opacity-[.55]"><BotanicalStem cfg={BOT.fivepetal} /></div>
                    <p className="font-nunito text-[13.5px] font-bold leading-[1.4] text-[#9A6F86]">{R.tanamKosong}</p>
                  </div>
                ) : (
                  <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
                    {nilai.map(v => {
                      const b = BUNGA_DARI_NAMA.get(v);
                      return (
                        <li key={v} className="flex flex-col items-center gap-1 text-center" title={PENJELASAN_NILAI[v]?.tagline}>
                          <span aria-hidden="true" className="pointer-events-none">{b && <BungaMekar bunga={b} mekar={TAHAP_MAKS} size={44} />}</span>
                          <span className="font-nunito text-[12.5px] font-extrabold text-pekat">{v}</span>
                          {v === fokus && <span className="font-nunito text-[11px] font-bold text-[#D2559A]">{R.fokusPekanIni}</span>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          </div>

          <MomenDirayakan idAnak={idAnak} />

          <div className="flex flex-col items-center gap-2">
            <button type="button" onClick={() => setEditTerbuka(true)} className={`${tautan} flex items-center gap-1.5 text-[14px]`}>
              <Pencil className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden /> {R.ubahData}
            </button>
            <p className="max-w-[70ch] text-center font-nunito text-[12px] font-semibold text-[#9A6F86]">{COPY_PROFIL.footer(nama)}</p>
            <button type="button" onClick={() => setKonfirmasiHapus(true)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-nunito text-[12px] font-semibold text-[#9A6F86] transition hover:text-[#D2559A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
              <Trash2 className="h-3 w-3" aria-hidden /> {COPY_PROFIL.hapus.tombol(nama)}
            </button>
          </div>
        </div>
      </div>

      {laci && (
        <LaciTentangAnak nama={nama} tahap={band?.judul ?? ''} pertanyaan={pertanyaanAnak} peta={peta} sorot={laci.sorot} onTutup={tutupLaci} />
      )}

      {modalKartu && (
        <ModalKartuPengasuh idAnak={idAnak} nama={nama} usiaTeks={usiaTeks} input={inputKartu} kontakStore={kontak}
          onIsiAlergi={() => { setModalKartu(false); bukaLaci('a_alergi'); }} onTutup={tutupModal} />
      )}

      {editTerbuka && <ModalEditProfil anak={anak} onTutup={() => setEditTerbuka(false)} />}

      {konfirmasiHapus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(110,59,87,.32)' }} role="dialog" aria-modal="true" aria-labelledby="hapus-judul">
          <div className="w-full max-w-[380px] rounded-[28px] bg-white p-6 shadow-xl">
            <h3 id="hapus-judul" className="font-fredoka text-[19px] font-bold text-pekat">{COPY_PROFIL.hapus.judul(nama)}</h3>
            <p className="mt-2 font-nunito text-[14px] leading-relaxed text-[#9A6F86]">{COPY_PROFIL.hapus.isi}</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setKonfirmasiHapus(false)} className="rounded-full border-[1.5px] border-[#F2C6DA] px-4 py-2 font-nunito text-[13px] font-extrabold text-pekat transition hover:bg-[#FFF4F9]">{COPY_PROFIL.hapus.batal}</button>
              <button type="button" onClick={async () => { await hapusAnak(idAnak); setKonfirmasiHapus(false); }} className="rounded-full bg-rekah px-4 py-2 font-nunito text-[13px] font-extrabold text-white transition hover:bg-[#D2559A]">{COPY_PROFIL.hapus.ya}</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-pekat px-4 py-2.5 font-nunito text-[13.5px] font-bold text-white shadow-lg lg:bottom-8">{toast}</div>
      )}
    </div>
  );
}
