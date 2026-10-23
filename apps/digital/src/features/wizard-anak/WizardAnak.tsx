// ============================================================================
// WizardAnak — satu-satunya alur pembuatan profil anak.
//
// Menggantikan dua wizard lama yang saling bertabrakan:
//   - features/onboarding/OnboardingFlow      (menulis ke tabel anak)
//   - features/rekah-onboarding/OnboardingFlow (menulis ke /rekah/profile)
//
// Wizard ini menulis SATU KALI ke AnakContext, yang menyimpannya ke tabel
// `anak`. Halaman Profil Anak membaca dari context yang sama, jadi apa pun
// yang diisi di sini langsung terlihat di sana.
//
// Dipakai di dua tempat:
//   - mode "pertama": akun baru, belum punya anak sama sekali
//   - mode "tambah":  dari layar Pilih Anak, menambah anak berikutnya
//
// Wizard v2 (2026-10-23): setelah Anak & Pendamping ada tiga langkah opsional
// yang memakai pertanyaan Peta yang SAMA dengan Kelola & Profil Anak
// (Kenali si kecil, Keadaan keluarga) + Nilai keluarga, lalu layar "Rekah
// sudah siap". Profil disimpan SEKALI di layar terakhir; jawaban Peta, nilai,
// dan fokus pekan ini ditulis lewat `setelahDibuat` sebelum dashboard terbuka.
// ============================================================================

import React, { useEffect, useReducer, useRef, useState } from 'react';
import { ArrowLeft, Camera, Check, ChevronRight, Heart, Lock, Plus, ShieldAlert, Sprout, Sun, Trash2, X } from 'lucide-react';
import { useAnak } from '../../context/AnakContext';
import { ringkasRentang } from '../beranda-usia/registry';
import {
  formatUsia,
  pendampingKosong,
  usiaDalamBulan,
  LABEL_JENIS_KELAMIN,
  MAKS_PENDAMPING,
  PERAN_PENDAMPING,
  type DraftAnak,
  type JenisKelamin,
  type Pendamping,
  type PeranPendamping,
} from '../../types/anak';
import { COPY, PERAN_COPY } from './copy';
import BotanicalStem, { type BotanicalConfig } from '../../components/BotanicalStem';
import { PETA_PERTANYAAN, bandPeta, lembarTerbuka, type PetaPertanyaan } from '../irama-hari/kehidupanData';
import { konfirmasiPeta } from '../irama-hari/KehidupanKeluarga';
import { NILAI, type NilaiAkar } from '../akar-keluarga/content';
import { BUNGA_DARI_NAMA } from '../akar-keluarga/registryBunga';
import BungaMekar from '../irama-hari/BungaMekar';
import { TAHAP_MAKS } from '../../lib/mekar';
import { tanamNilai } from '../../lib/supabase/rekah';
import { sapaanPendamping } from '../../types/anak';

const HARI_INI = new Date().toISOString().split('T')[0];
const JUMLAH_LANGKAH = 5;
const MAKS_NILAI = 3;
/** Bidang keluarga yang disalin dari anak lain saat menambah anak. */
const ID_KELUARGA = ['c_bunda', 'c_bahasa', 'c_ibu'] as const;
const MAKS_UKURAN_FOTO = 5 * 1024 * 1024; // 5 MB, sama dengan batas di rekah.ts

// ── State ────────────────────────────────────────────────────────────────────

type Langkah = 'sambutan' | 'anak' | 'pendamping' | 'kenali' | 'keluarga' | 'nilai' | 'siap';

interface State {
  langkah: Langkah;
  namaAnak: string;
  tanggalLahir: string;
  jenisKelamin: JenisKelamin | null;
  fileFoto: File | null;
  pendamping: Pendamping[];
  /** Jawaban Peta (id pertanyaan → pilihan), bentuk sama dengan usePetaStore. */
  jawaban: Record<string, string[]>;
  nilai: NilaiAkar[];
  /** Nama anak sumber salinan jawaban keluarga (mode tambah). */
  salinDari: string | null;
  disentuh: boolean;
}

type Aksi =
  | { type: 'MAJU' }
  | { type: 'MUNDUR' }
  | { type: 'KE'; langkah: Langkah }
  | { type: 'SENTUH' }
  | { type: 'SET_NAMA'; value: string }
  | { type: 'SET_TANGGAL'; value: string }
  | { type: 'SET_KELAMIN'; value: JenisKelamin | null }
  | { type: 'SET_FOTO'; value: File | null }
  | { type: 'TAMBAH_PENDAMPING' }
  | { type: 'HAPUS_PENDAMPING'; index: number }
  | { type: 'SET_PENDAMPING_PANGGILAN'; index: number; value: string }
  | { type: 'SET_PENDAMPING_PERAN'; index: number; value: PeranPendamping }
  | { type: 'PILIH_PETA'; q: PetaPertanyaan; value: string }
  | { type: 'TOGGLE_NILAI'; value: NilaiAkar };

const URUTAN: Langkah[] = ['sambutan', 'anak', 'pendamping', 'kenali', 'keluarga', 'nilai', 'siap'];

const AWAL: State = {
  langkah: 'sambutan',
  namaAnak: '',
  tanggalLahir: '',
  jenisKelamin: null,
  fileFoto: null,
  pendamping: [pendampingKosong()],
  jawaban: {},
  nilai: [],
  salinDari: null,
  disentuh: false,
};

function ubahPendamping(
  daftar: Pendamping[],
  index: number,
  patch: Partial<Pendamping>,
): Pendamping[] {
  return daftar.map((p, i) => (i === index ? { ...p, ...patch } : p));
}

function reducer(s: State, a: Aksi): State {
  switch (a.type) {
    case 'MAJU': {
      const i = URUTAN.indexOf(s.langkah);
      return { ...s, langkah: URUTAN[Math.min(URUTAN.length - 1, i + 1)], disentuh: false };
    }
    case 'MUNDUR': {
      const i = URUTAN.indexOf(s.langkah);
      return { ...s, langkah: URUTAN[Math.max(0, i - 1)], disentuh: false };
    }
    case 'KE':          return { ...s, langkah: a.langkah, disentuh: false };
    case 'SENTUH':      return { ...s, disentuh: true };
    case 'SET_NAMA':    return { ...s, namaAnak: a.value };
    case 'SET_TANGGAL': return { ...s, tanggalLahir: a.value };
    case 'SET_KELAMIN': return { ...s, jenisKelamin: a.value };
    case 'SET_FOTO':    return { ...s, fileFoto: a.value };

    case 'TAMBAH_PENDAMPING':
      if (s.pendamping.length >= MAKS_PENDAMPING) return s;
      return { ...s, pendamping: [...s.pendamping, pendampingKosong()] };

    case 'HAPUS_PENDAMPING': {
      const sisa = s.pendamping.filter((_, i) => i !== a.index);
      // Selalu sisakan satu baris kosong supaya form tidak pernah hampa.
      return { ...s, pendamping: sisa.length > 0 ? sisa : [pendampingKosong()] };
    }

    case 'SET_PENDAMPING_PANGGILAN':
      return { ...s, pendamping: ubahPendamping(s.pendamping, a.index, { panggilan: a.value }) };

    case 'SET_PENDAMPING_PERAN':
      return { ...s, pendamping: ubahPendamping(s.pendamping, a.index, { peran: a.value }) };

    // Sama persis dengan usePetaStore.pilih: multi = toggle, tunggal = pilih/lepas.
    case 'PILIH_PETA': {
      const cur = s.jawaban[a.q.id] ?? [];
      const next = a.q.multi
        ? (cur.includes(a.value) ? cur.filter(x => x !== a.value) : [...cur, a.value])
        : (cur.includes(a.value) ? [] : [a.value]);
      return { ...s, jawaban: { ...s.jawaban, [a.q.id]: next } };
    }

    case 'TOGGLE_NILAI': {
      if (s.nilai.includes(a.value)) return { ...s, nilai: s.nilai.filter(n => n !== a.value) };
      if (s.nilai.length >= MAKS_NILAI) return s;
      return { ...s, nilai: [...s.nilai, a.value] };
    }

    default:
      return s;
  }
}

// ── Bagian bersama ───────────────────────────────────────────────────────────

function KelopakProgres({ langkahKe }: { langkahKe: number }) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="status"
      aria-label={`Langkah ${langkahKe} dari ${JUMLAH_LANGKAH}`}
    >
      {Array.from({ length: JUMLAH_LANGKAH }, (_, i) => (
        <span
          key={i}
          aria-hidden
          style={{ borderRadius: '70% 70% 70% 4px', width: 13, height: 20 }}
          className={`transition-colors motion-reduce:transition-none ${
            i < langkahKe ? 'bg-rekah' : 'bg-mawar/60'
          }`}
        />
      ))}
    </div>
  );
}

function Cangkang({
  children,
  langkahKe,
  onMundur,
  onBatal,
}: {
  children: React.ReactNode;
  langkahKe: number;
  onMundur?: () => void;
  onBatal?: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-kanvas">
      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          {onMundur ? (
            <button
              type="button"
              onClick={onMundur}
              className="flex min-h-[40px] items-center gap-1.5 rounded-full px-3 font-nunito text-[13.5px] font-extrabold text-[#9A6F86] transition hover:bg-mawar/40 hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {COPY.nav.kembali}
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-3">
            <KelopakProgres langkahKe={langkahKe} />
            {onBatal && (
              <button
                type="button"
                onClick={onBatal}
                aria-label="Batalkan penambahan anak"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-pekat/50 transition hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

const GAYA_INPUT =
  'w-full rounded-[16px] border-[1.5px] border-[#F2DDE7] bg-white px-4 py-3 font-nunito text-[15px] font-extrabold text-pekat placeholder:text-pekat/30 transition focus:border-rekah/40 focus:outline-none focus:ring-2 focus:ring-rekah/20 min-h-[52px]';


// ── Langkah 0 — Sambutan ─────────────────────────────────────────────────────

const ORNAMEN_SAMBUTAN: { cfg: BotanicalConfig; style: React.CSSProperties }[] = [
  { cfg: { type: 'star', bloom: '#FFE29A' }, style: { left: '8%', top: '9%', width: 24, height: 36 } },
  { cfg: { type: 'dot', bloom: '#C9B8F0' }, style: { right: '12%', top: '13%', width: 16, height: 24 } },
  { cfg: { type: 'squiggle', bloom: '#8FB8F7' }, style: { right: '7%', top: '30%', width: 24, height: 36 } },
  { cfg: { type: 'arch', bloom: '#F8B9D4' }, style: { left: '9%', top: '36%', width: 26, height: 39 } },
];

/** Kebun kecil di dasar layar (pola Pilih Anak): bukit + dua baris tanaman. */
function KebunKecil({ n = 5 }: { n?: number }) {
  const JENIS: NonNullable<BotanicalConfig['type']>[] = ['tulip', 'daisy', 'bell', 'fivepetal', 'sprig'];
  const WARNA = [
    { bloom: '#F06BA8', bloom2: '#F8B9D4', center: '#FFE29A' },
    { bloom: '#8FB8F7', bloom2: '#FFF3E6', center: '#FFE29A' },
    { bloom: '#FFE29A', bloom2: '#FFF3E6', center: '#F06BA8' },
    { bloom: '#C9B8F0', bloom2: '#FFF3E6', center: '#6E3B57' },
    { bloom: '#F8B9D4', bloom2: '#FFF3E6', center: '#F06BA8' },
  ];
  const belakang = Array.from({ length: n }, (_, i) => ({ left: ((i + 0.5) / n) * 100, cfg: { type: JENIS[i % 5], ...WARNA[i % 5] } as BotanicalConfig }));
  const depan = Array.from({ length: n + 1 }, (_, i) => ({
    left: (i / n) * 100,
    cfg: (i % 2 ? { type: JENIS[(i + 2) % 5], ...WARNA[(i + 3) % 5] } : { type: i % 4 ? 'leaf' : 'foliage' }) as BotanicalConfig,
  }));
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[150px] overflow-hidden">
      <div className="absolute rounded-[50%]" style={{ left: '-15%', right: '-15%', bottom: -90, height: 170, background: '#DCEBC4' }} />
      <div className="absolute rounded-[50%]" style={{ left: '-25%', width: '75%', bottom: -110, height: 160, background: '#EEFFD4' }} />
      <div className="absolute rounded-[50%]" style={{ right: '-25%', width: '75%', bottom: -115, height: 165, background: '#EEFFD4' }} />
      {belakang.map((t, i) => (
        <div key={`b${i}`} className="wa-goyang absolute" style={{ left: `${t.left}%`, bottom: 34, width: 70, height: 105, marginLeft: -35, animationDelay: `${-i}s` }}>
          <BotanicalStem cfg={t.cfg} />
        </div>
      ))}
      {depan.map((t, i) => (
        <div key={`d${i}`} className="wa-goyang absolute" style={{ left: `${t.left}%`, bottom: -4, width: 56, height: 84, marginLeft: -28, animationDelay: `${-(i % 4)}s` }}>
          <BotanicalStem cfg={t.cfg} />
        </div>
      ))}
    </div>
  );
}

const GAYA_GERAK = `
@keyframes waSway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes waFloaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.wa-goyang{transform-origin:50% 100%;animation:waSway 6s ease-in-out infinite}
.wa-apung{animation:waFloaty 6s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){.wa-goyang,.wa-apung{animation:none}}
`;

function Sambutan({ onMulai }: { onMulai: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-kanvas px-6 pb-[170px] pt-12 text-center">
      <style>{GAYA_GERAK}</style>
      {ORNAMEN_SAMBUTAN.map((o, i) => (
        <div key={i} aria-hidden="true" className="wa-apung pointer-events-none absolute" style={{ ...o.style, animationDelay: `${-i * 1.3}s` }}>
          <BotanicalStem cfg={o.cfg} />
        </div>
      ))}
      <div aria-hidden="true" className="mb-3 h-[132px] w-[88px]">
        <BotanicalStem cfg={{ type: 'tulip', bloom: '#F06BA8', bloom2: '#F8B9D4' }} />
      </div>
      <p className="font-shantell text-[20px] text-pekat">{COPY.sambutan.salam}</p>
      <h1 className="mt-1 font-fredoka text-[46px] font-bold leading-none text-pekat">{COPY.sambutan.judul}</h1>
      <p className="mt-2 font-shantell text-[17px] text-[#D2559A]">{COPY.sambutan.tagline}</p>
      <p className="mt-4 max-w-[30ch] font-nunito text-[15px] font-bold leading-relaxed text-[#9A6F86]">{COPY.sambutan.body}</p>
      <button type="button" onClick={onMulai}
        className="mt-7 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-rekah px-7 font-nunito text-[15px] font-extrabold text-white transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
        style={{ boxShadow: '0 10px 20px -12px #D2559A' }}>
        {COPY.sambutan.cta} <ChevronRight className="h-4 w-4" strokeWidth={3} aria-hidden />
      </button>
      <KebunKecil n={5} />
    </div>
  );
}

// ── Pemilih foto ─────────────────────────────────────────────────────────────
function PemilihFoto({
  file,
  onPilih,
}: {
  file: File | null;
  nama: string;
  onPilih: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  // Object URL harus dicabut supaya tidak bocor memori.
  useEffect(() => {
    if (!file) { setPratinjau(null); return; }
    const url = URL.createObjectURL(file);
    setPratinjau(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function tangani(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith('image/')) { setGalat(COPY.anak.galatFotoBukanGambar); return; }
    if (f.size > MAKS_UKURAN_FOTO) { setGalat(COPY.anak.galatFotoTerlaluBesar); return; }
    setGalat(null);
    onPilih(f);
  }

  return (
    <div className="flex flex-none flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={file ? COPY.anak.ctaGantiFoto : `${COPY.anak.ctaPilihFoto} (opsional)`}
        title={COPY.anak.catatanFoto}
        style={{ borderRadius: '36px 36px 36px 11px' }}
        className={`relative flex h-[72px] w-[72px] items-center justify-center overflow-hidden text-rekah transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2 ${pratinjau ? 'bg-mawar' : 'border-2 border-dashed border-[#F8B9D4] bg-white'}`}
      >
        {pratinjau ? <img src={pratinjau} alt="" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6" strokeWidth={2.2} aria-hidden />}
      </button>
      {file ? (
        <button type="button" onClick={() => { onPilih(null); if (inputRef.current) inputRef.current.value = ''; }}
          className="rounded font-nunito text-[11.5px] font-extrabold text-[#B48DA3] hover:text-[#D2559A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
          {COPY.anak.ctaHapusFoto}
        </button>
      ) : (
        <span className="font-nunito text-[11.5px] font-bold text-[#B48DA3]">Foto</span>
      )}
      {galat && <p role="alert" className="max-w-[120px] text-center font-nunito text-[11.5px] font-bold text-[#D2559A]">{galat}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={tangani} />
    </div>
  );
}

// ── Langkah 1 — Profil anak ──────────────────────────────────────────────────

function LangkahAnak({
  s,
  dispatch,
  onMundur,
  onBatal,
}: {
  s: State;
  dispatch: React.Dispatch<Aksi>;
  onMundur: () => void;
  onBatal?: () => void;
}) {
  const namaRef = useRef<HTMLInputElement>(null);
  useEffect(() => { namaRef.current?.focus(); }, []);

  const namaValid = s.namaAnak.trim().length >= 2;
  const tanggalTerisi = Boolean(s.tanggalLahir);
  const tanggalTerbaca = tanggalTerisi && !isNaN(new Date(s.tanggalLahir).getTime());
  const masaDepan = tanggalTerbaca && s.tanggalLahir > HARI_INI;
  const tanggalValid = tanggalTerbaca && !masaDepan;
  const bolehLanjut = namaValid && tanggalValid;

  // Pesan konfirmasi bergantung tiga keadaan: rentang siap, rentang masih
  // disiapkan, atau usia di luar jangkauan Rekah.
  const konfirmasi = (() => {
    if (!tanggalValid || !namaValid) return null;
    const nama = s.namaAnak.trim();
    const usiaBulan = usiaDalamBulan(s.tanggalLahir);
    const usia = formatUsia(usiaBulan);
    const ringkas = ringkasRentang(usiaBulan);

    if (!ringkas) {
      return { nada: 'luar' as const, teks: COPY.anak.diLuarRentang(nama) };
    }
    if (ringkas.siap) {
      return { nada: 'siap' as const, teks: COPY.anak.rentangSiap(nama, usia, ringkas.rentang) };
    }
    return { nada: 'segera' as const, teks: COPY.anak.rentangSegera(nama, usia, ringkas.rentang) };
  })();

  const LATAR_KONFIRMASI = {
    siap:   'bg-[#F1EBFB] text-[#7B5BB8]',
    segera: 'bg-[#FFF1C9] text-[#9A7A2C]',
    luar:   'bg-[#FDE9F2] text-[#9A4F78]',
  } as const;

  function lanjut() {
    dispatch({ type: 'SENTUH' });
    if (bolehLanjut) dispatch({ type: 'MAJU' });
  }

  return (
    <Cangkang langkahKe={1} onMundur={onMundur} onBatal={onBatal}>
      <JudulLangkah eyebrow="LANGKAH 1" judul={COPY.anak.judul} sub={COPY.anak.sub} />

      <div className="flex flex-col gap-4">
        {/* Foto (kiri) + nama */}
        <div className="flex items-start gap-3.5">
          <PemilihFoto file={s.fileFoto} nama={s.namaAnak} onPilih={f => dispatch({ type: 'SET_FOTO', value: f })} />
          <div className="min-w-0 flex-1">
            <label htmlFor="wa-nama" className="mb-1.5 block font-nunito text-[13px] font-extrabold text-pekat">
              {COPY.anak.labelNama}
            </label>
            <input
              ref={namaRef}
              id="wa-nama"
              type="text"
              value={s.namaAnak}
              autoComplete="off"
              placeholder={COPY.anak.placeholderNama}
              onChange={e => dispatch({ type: 'SET_NAMA', value: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && lanjut()}
              className={GAYA_INPUT}
            />
            {s.disentuh && !namaValid && (
              <p className="mt-1 font-nunito text-[12px] font-bold text-[#D2559A]">{COPY.anak.galatNama}</p>
            )}
          </div>
        </div>

        {/* Tanggal lahir */}
        <div>
          <label htmlFor="wa-tanggal" className="mb-1.5 flex items-center justify-between font-nunito text-[13px] font-extrabold text-pekat">
            {COPY.anak.labelTanggal}
            <span className="flex items-center gap-1 text-[11.5px] font-bold text-[#B48DA3]">
              <Lock className="h-3 w-3" strokeWidth={2.4} aria-hidden /> dikunci setelah tersimpan
            </span>
          </label>
          <input
            id="wa-tanggal"
            type="date"
            max={HARI_INI}
            value={s.tanggalLahir}
            onChange={e => dispatch({ type: 'SET_TANGGAL', value: e.target.value })}
            className={GAYA_INPUT}
          />
          {masaDepan && <p className="mt-1 font-nunito text-[12px] font-bold text-[#D2559A]">{COPY.anak.galatMasaDepan}</p>}
          {s.disentuh && !tanggalTerbaca && (
            <p className="mt-1 font-nunito text-[12px] font-bold text-[#D2559A]">{COPY.anak.galatTanggal}</p>
          )}
          <p className="mt-1.5 font-nunito text-[11.5px] font-semibold leading-snug text-[#B48DA3]">{COPY.anak.catatanKoreksi}</p>
        </div>

        {/* Konfirmasi rentang usia */}
        {konfirmasi && (
          <div className={`rounded-[14px] px-3.5 py-2.5 ${LATAR_KONFIRMASI[konfirmasi.nada]}`}>
            <p className="font-nunito text-[13px] font-bold leading-relaxed">{konfirmasi.teks}</p>
          </div>
        )}

        {/* Jenis kelamin: chip */}
        <fieldset>
          <legend className="mb-1.5 font-nunito text-[13px] font-extrabold text-pekat">{COPY.anak.labelKelamin}</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(LABEL_JENIS_KELAMIN) as JenisKelamin[]).map(key => {
              const dipilih = s.jenisKelamin === key;
              return (
                <button key={key} type="button" aria-pressed={dipilih}
                  onClick={() => dispatch({ type: 'SET_KELAMIN', value: dipilih ? null : key })}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border-[1.5px] px-4 font-nunito text-[14px] font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-1 ${dipilih ? 'border-[#D2559A] bg-[#D2559A] text-white' : 'border-[#F2DDE7] bg-white text-pekat hover:border-rekah'}`}>
                  {dipilih && <Check className="h-3.5 w-3.5" strokeWidth={3.4} aria-hidden />}
                  {LABEL_JENIS_KELAMIN[key]}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 font-nunito text-[11.5px] font-semibold leading-snug text-[#B48DA3]">{COPY.anak.catatanKelamin}</p>
        </fieldset>
      </div>

      <KakiLanjut onLanjut={lanjut} nonaktif={s.disentuh && !bolehLanjut} />
    </Cangkang>
  );
}

// ── Langkah 2 — Pendamping ───────────────────────────────────────────────────

const WARNA_AVATAR = [
  { bg: '#FDE9F2', ink: '#D2559A' }, { bg: '#FFF1C9', ink: '#B07A1E' }, { bg: '#F1EBFB', ink: '#7B5BB8' }, { bg: '#E3EEFC', ink: '#3F64A8' },
];

function BarisPendamping({
  pendamping,
  index,
  bolehHapus,
  dispatch,
  autoFocus,
}: {
  pendamping: Pendamping;
  index: number;
  bolehHapus: boolean;
  dispatch: React.Dispatch<Aksi>;
  autoFocus: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);
  const idNama = `wa-pendamping-nama-${index}`;
  const w = WARNA_AVATAR[index % WARNA_AVATAR.length];
  const inisial = pendamping.panggilan.trim().charAt(0).toUpperCase();

  return (
    <div className="flex items-start gap-3 rounded-[22px] border-[1.5px] border-[#F6E6EE] bg-white p-3.5">
      <span aria-hidden="true" className="mt-0.5 flex h-[42px] w-[42px] flex-none items-center justify-center rounded-full font-fredoka text-[17px] font-bold" style={{ background: w.bg, color: w.ink }}>
        {inisial || <Plus className="h-4 w-4" strokeWidth={2.6} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <label htmlFor={idNama} className="sr-only">{COPY.pendamping.labelNama}</label>
          <input
            ref={ref}
            id={idNama}
            type="text"
            value={pendamping.panggilan}
            autoComplete="off"
            maxLength={40}
            placeholder={COPY.pendamping.placeholderNama}
            onChange={e => dispatch({ type: 'SET_PENDAMPING_PANGGILAN', index, value: e.target.value })}
            className="min-h-[40px] w-full min-w-0 rounded-[12px] border-[1.5px] border-transparent bg-[#FFF8FB] px-3 font-nunito text-[15px] font-extrabold text-pekat placeholder:text-pekat/30 focus:border-[#F2DDE7] focus:outline-none focus:ring-2 focus:ring-rekah/20"
          />
          {bolehHapus && (
            <button type="button" onClick={() => dispatch({ type: 'HAPUS_PENDAMPING', index })}
              aria-label={COPY.pendamping.ctaHapus(pendamping.panggilan)}
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-pekat/40 transition hover:bg-mawar/40 hover:text-[#D2559A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
        <fieldset className="mt-2">
          <legend className="sr-only">{COPY.pendamping.labelPeran}</legend>
          <div className="flex flex-wrap gap-1.5">
            {PERAN_PENDAMPING.map(key => {
              const dipilih = pendamping.peran === key;
              return (
                <button key={key} type="button" aria-pressed={dipilih}
                  onClick={() => dispatch({ type: 'SET_PENDAMPING_PERAN', index, value: key })}
                  className={`inline-flex min-h-[34px] items-center gap-1 rounded-full border-[1.5px] px-3 font-nunito text-[12.5px] font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-1 ${dipilih ? 'border-[#D2559A] bg-[#D2559A] text-white' : 'border-[#F2DDE7] bg-white text-pekat hover:border-rekah'}`}>
                  {dipilih && <Check className="h-3 w-3" strokeWidth={3.4} aria-hidden />}
                  {PERAN_COPY[key]}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

function LangkahPendamping({
  s,
  dispatch,
  onBatal,
}: {
  s: State;
  dispatch: React.Dispatch<Aksi>;
  onBatal?: () => void;
}) {
  // Baris yang baru ditambah mendapat fokus, supaya tidak perlu klik lagi.
  const [indexBaru, setIndexBaru] = useState<number | null>(null);
  const penuh = s.pendamping.length >= MAKS_PENDAMPING;

  function tambah() {
    setIndexBaru(s.pendamping.length);
    dispatch({ type: 'TAMBAH_PENDAMPING' });
  }

  return (
    <Cangkang langkahKe={2} onMundur={() => dispatch({ type: 'MUNDUR' })} onBatal={onBatal}>
      <JudulLangkah eyebrow="LANGKAH 2" judul={COPY.pendamping.judul} sub={COPY.pendamping.sub} />

      <div className="flex flex-col gap-2.5">
        {s.pendamping.map((p, i) => (
          <BarisPendamping key={i} pendamping={p} index={i} bolehHapus={s.pendamping.length > 1} dispatch={dispatch} autoFocus={i === indexBaru} />
        ))}
      </div>

      <button type="button" onClick={tambah} disabled={penuh}
        className="mt-3 inline-flex min-h-[38px] items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-[#F2C6DA] px-4 font-nunito text-[13.5px] font-extrabold text-[#B48DA3] transition hover:border-rekah hover:text-[#D2559A] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
        <Plus className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> {COPY.pendamping.ctaTambah}
      </button>
      {penuh && <p className="mt-2 font-nunito text-[12px] font-semibold text-[#B48DA3]">{COPY.pendamping.batasTercapai}</p>}
      <p className="mt-3 font-nunito text-[11.5px] font-semibold leading-snug text-[#B48DA3]">{COPY.pendamping.catatan}</p>

      <KakiLanjut onLanjut={() => dispatch({ type: 'MAJU' })} />
    </Cangkang>
  );
}

// ── Langkah 3–5 — pertanyaan Peta & nilai (opsional) ─────────────────────────

/** Satu pertanyaan Peta sebagai kartu chip. Data & konfirmasi sama dengan Kelola. */
function KartuTanya({ q, sel, onPilih, sesuaiUsia }: { q: PetaPertanyaan; sel: string[]; onPilih: (v: string) => void; sesuaiUsia?: boolean }) {
  const pesan = konfirmasiPeta(q.id, sel);
  return (
    <fieldset className="rounded-[22px] border-[1.5px] border-[#F6E6EE] bg-white px-4 py-3.5">
      <legend className="sr-only">{q.teks}</legend>
      <p aria-hidden="true" className="flex flex-wrap items-center gap-2 font-nunito text-[14.5px] font-extrabold text-pekat">
        <span className="flex h-[22px] w-[22px] flex-none items-center justify-center bg-[#FDE9F2] font-fredoka text-[11px] font-bold text-[#D2559A]" style={{ borderRadius: '70% 70% 70% 5px' }}>R</span>
        {q.teks}
        {sesuaiUsia && <span className="rounded-[5px] bg-[#F1EBFB] px-1.5 py-0.5 text-[10px] tracking-[.06em] text-[#7B5BB8]">SESUAI USIA</span>}
        {q.sensitif && <span className="rounded-[5px] bg-[#FFF1C9] px-1.5 py-0.5 text-[10px] tracking-[.06em] text-[#9A7A2C]">OPSIONAL</span>}
        {q.multi && <span className="font-bold text-[12px] text-[#9A6F86]">(boleh lebih dari satu)</span>}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {q.opsi.map(op => {
          const on = sel.includes(op.v);
          return (
            <button key={op.v} type="button" aria-pressed={on} onClick={() => onPilih(op.v)}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full border-[1.5px] px-3.5 font-nunito text-[13.5px] font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-1 ${on ? 'border-[#D2559A] bg-[#D2559A] text-white' : 'border-[#F2DDE7] bg-white text-pekat hover:border-rekah'}`}>
              {on && <Check className="h-3 w-3" strokeWidth={3.4} aria-hidden />}
              {op.v}
            </button>
          );
        })}
      </div>
      {pesan && <p className="mt-2.5 rounded-xl bg-[#F1EBFB] px-3 py-2 font-nunito text-[12.5px] font-bold leading-snug text-[#7B5BB8]">{pesan}</p>}
    </fieldset>
  );
}

function JudulLangkah({ judul, sub, eyebrow }: { judul: string; sub: string; eyebrow?: string }) {
  return (
    <div className="mb-5">
      {eyebrow && <p className="mb-1 font-nunito text-[12px] font-extrabold tracking-[1.4px] text-[#B48DA3]">{eyebrow}</p>}
      <h2 className="mb-1 font-fredoka text-[1.55rem] font-bold leading-snug text-pekat">{judul}</h2>
      <p className="font-nunito text-[14px] font-bold leading-relaxed text-[#9A6F86]">{sub}</p>
    </div>
  );
}

function KakiLanjut({ onLanjut, nonaktif = false }: { onLanjut: () => void; nonaktif?: boolean }) {
  return (
    <div className="mt-7 flex justify-end">
      <button type="button" onClick={onLanjut} disabled={nonaktif}
        className="inline-flex min-h-[48px] items-center gap-1.5 rounded-full bg-rekah px-7 font-nunito text-[15px] font-extrabold text-white transition hover:bg-rekah-tua disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
        style={{ boxShadow: '0 10px 20px -12px #D2559A' }}>
        {COPY.nav.lanjut} <ChevronRight className="h-4 w-4" strokeWidth={3} aria-hidden />
      </button>
    </div>
  );
}

function KakiOpsional({ onLewati, onLanjut }: { onLewati: () => void; onLanjut: () => void }) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <button type="button" onClick={onLewati}
        className="min-h-[44px] rounded-full px-2 font-nunito text-[14px] font-extrabold text-[#B48DA3] transition hover:text-[#D2559A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
        {COPY.nav.lewati}
      </button>
      <button type="button" onClick={onLanjut}
        className="inline-flex min-h-[48px] items-center gap-1.5 rounded-full bg-rekah px-7 font-nunito text-[15px] font-extrabold text-white transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
        style={{ boxShadow: '0 10px 20px -12px #D2559A' }}>
        {COPY.nav.lanjut} <ChevronRight className="h-4 w-4" strokeWidth={3} aria-hidden />
      </button>
    </div>
  );
}

const usiaBulanDari = (s: State) => usiaDalamBulan(s.tanggalLahir);
const tanya = (id: string) => PETA_PERTANYAAN.find(q => q.id === id);

/** Pertanyaan bidang Anak di wizard: 3 umum + 1 sesuai tahap usia. */
function pertanyaanKenali(usiaBulan: number | null): { q: PetaPertanyaan; usia: boolean }[] {
  const band = bandPeta(usiaBulan);
  const khusus = band === 'bayi' ? 'a_menyusu' : band === 'batita' ? 'a_makan_bt' : 'a_sekolah';
  return [
    ...['a_suasana', 'a_tenang', 'a_alergi'].map(id => ({ id, usia: false })),
    { id: khusus, usia: true },
  ].flatMap(({ id, usia }) => { const q = tanya(id); return q ? [{ q, usia }] : []; });
}

/** Pertanyaan keluarga: kondisi ibu hanya untuk anak di bawah 1 tahun. */
function pertanyaanKeluarga(usiaBulan: number | null): PetaPertanyaan[] {
  const ids = ['c_bunda', 'c_bahasa', ...((usiaBulan ?? 99) < 12 ? ['c_ibu'] : [])];
  return ids.flatMap(id => { const q = tanya(id); return q ? [q] : []; });
}

function LangkahKenali({ s, dispatch, onBatal }: { s: State; dispatch: React.Dispatch<Aksi>; onBatal?: () => void }) {
  const nama = s.namaAnak.trim();
  return (
    <Cangkang langkahKe={3} onMundur={() => dispatch({ type: 'MUNDUR' })} onBatal={onBatal}>
      <JudulLangkah eyebrow="LANGKAH 3" judul={COPY.kenali.judul(nama)} sub={COPY.kenali.sub} />
      <div className="flex flex-col gap-3">
        {pertanyaanKenali(usiaBulanDari(s)).map(({ q, usia }) => (
          <KartuTanya key={q.id} q={q} sel={s.jawaban[q.id] ?? []} sesuaiUsia={usia} onPilih={v => dispatch({ type: 'PILIH_PETA', q, value: v })} />
        ))}
      </div>
      <KakiOpsional onLewati={() => dispatch({ type: 'MAJU' })} onLanjut={() => dispatch({ type: 'MAJU' })} />
    </Cangkang>
  );
}

function LangkahKeluarga({ s, dispatch, onBatal }: { s: State; dispatch: React.Dispatch<Aksi>; onBatal?: () => void }) {
  const usia = usiaBulanDari(s);
  return (
    <Cangkang langkahKe={4} onMundur={() => dispatch({ type: 'MUNDUR' })} onBatal={onBatal}>
      <JudulLangkah eyebrow="LANGKAH 4" judul={COPY.keluarga.judul} sub={COPY.keluarga.sub} />
      {s.salinDari && (
        <p className="mb-3 rounded-xl bg-[#FFF1C9] px-3.5 py-2.5 font-nunito text-[13px] font-bold text-[#9A7A2C]">{COPY.keluarga.catatanSalin(s.salinDari)}</p>
      )}
      <div className="flex flex-col gap-3">
        {pertanyaanKeluarga(usia).map(q => (
          <KartuTanya key={q.id} q={q} sel={s.jawaban[q.id] ?? []} onPilih={v => dispatch({ type: 'PILIH_PETA', q, value: v })} />
        ))}
      </div>
      <p className="mt-3 font-nunito text-[12px] font-semibold leading-snug text-[#B48DA3]">
        {(usia ?? 99) < 12 ? COPY.keluarga.catatanIbu : COPY.keluarga.catatanNanti}
      </p>
      <KakiOpsional onLewati={() => dispatch({ type: 'MAJU' })} onLanjut={() => dispatch({ type: 'MAJU' })} />
    </Cangkang>
  );
}

function LangkahNilai({ s, dispatch, onBatal }: { s: State; dispatch: React.Dispatch<Aksi>; onBatal?: () => void }) {
  const penuh = s.nilai.length >= MAKS_NILAI;
  return (
    <Cangkang langkahKe={5} onMundur={() => dispatch({ type: 'MUNDUR' })} onBatal={onBatal}>
      <JudulLangkah eyebrow="LANGKAH 5" judul={COPY.nilai.judul} sub={COPY.nilai.sub} />
      <div className="grid grid-cols-3 gap-2">
        {NILAI.map(n => {
          const urut = s.nilai.indexOf(n);
          const on = urut > -1;
          const bunga = BUNGA_DARI_NAMA.get(n);
          return (
            <button key={n} type="button" aria-pressed={on} onClick={() => dispatch({ type: 'TOGGLE_NILAI', value: n })}
              aria-disabled={!on && penuh}
              className={`relative flex min-h-[96px] flex-col items-center justify-center gap-1 rounded-[18px] border-[1.5px] px-1 py-2 text-center font-nunito text-[12.5px] font-extrabold leading-tight text-pekat transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${on ? 'border-rekah bg-[#FFF4F9]' : 'border-[#F2DDE7] bg-white hover:border-rekah'} ${!on && penuh ? 'opacity-50' : ''}`}>
              {on && <span className="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-rekah text-[10.5px] text-white">{urut + 1}</span>}
              <span aria-hidden="true" className="pointer-events-none">{bunga && <BungaMekar bunga={bunga} mekar={TAHAP_MAKS} size={40} />}</span>
              {n}
            </button>
          );
        })}
      </div>
      <p className="mt-3 font-nunito text-[12px] font-semibold leading-snug text-[#B48DA3]" role="status">
        {penuh ? COPY.nilai.maks : COPY.nilai.catatan}
      </p>
      <KakiOpsional onLewati={() => dispatch({ type: 'MAJU' })} onLanjut={() => dispatch({ type: 'MAJU' })} />
    </Cangkang>
  );
}

// ── Langkah 6 — Rekah sudah siap (menyimpan) ─────────────────────────────────

function LangkahSiap({ s, dispatch, onSimpan, menyimpan, galat, onBatal }: {
  s: State; dispatch: React.Dispatch<Aksi>; onSimpan: () => void; menyimpan: boolean; galat: string | null; onBatal?: () => void;
}) {
  const nama = s.namaAnak.trim();
  const C = COPY.siap;
  const watak = (s.jawaban.a_suasana ?? []).map(v => v.toLowerCase());
  const alergi = (s.jawaban.a_alergi ?? []).filter(v => v !== 'Tidak ada');
  const lembar = lembarTerbuka(s.jawaban);
  const namaLembar = [lembar.nifas && 'Lembar Nifas', lembar.piring && 'Piring Ibu'].filter(Boolean).join(' dan ');
  const sapaan = sapaanPendamping(s.pendamping);
  const baris: { ikon: React.ReactNode; judul: string; isi: string; cls: string }[] = [
    { ikon: <Sun className="h-[17px] w-[17px] text-[#D2559A]" strokeWidth={2.3} />, judul: C.untukmuJudul, isi: C.untukmu(nama, watak.length ? watak.join(' dan ') : null), cls: 'bg-[#FDE9F2]' },
  ];
  if (s.nilai.length) baris.push({ ikon: <Sprout className="h-[17px] w-[17px] text-[#4E8A3E]" strokeWidth={2.3} />, judul: C.nilaiJudul, isi: C.nilai(s.nilai.join(', '), s.nilai[0]), cls: 'bg-[#EAF4E6]' });
  if (alergi.length) baris.push({ ikon: <ShieldAlert className="h-[17px] w-[17px] text-[#C8404F]" strokeWidth={2.3} />, judul: C.alergiJudul(alergi.join(', ')), isi: C.alergi, cls: 'border-[1.5px] border-[#F8C7CF] bg-[#FFEDEF]' });
  if (namaLembar) baris.push({ ikon: <Heart className="h-[17px] w-[17px] text-[#7B5BB8]" strokeWidth={2.3} />, judul: C.lembarJudul(namaLembar), isi: C.lembar, cls: 'bg-[#F1EBFB]' });

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-kanvas">
      <style>{GAYA_GERAK}</style>
      <div className="relative z-[1] mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-[170px] pt-8 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => dispatch({ type: 'MUNDUR' })}
            className="flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-pekat/60 transition hover:bg-mawar hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
            <ArrowLeft className="h-4 w-4" aria-hidden /> {COPY.nav.kembali}
          </button>
          {onBatal && (
            <button type="button" onClick={onBatal} aria-label="Batalkan penambahan anak"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-pekat/50 transition hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
        <div className="text-center">
          <p className="font-shantell text-[18px] text-pekat">{C.salam(sapaan)}</p>
          <h1 className="mt-1 font-fredoka text-[1.75rem] font-bold leading-tight text-pekat">{C.judul(nama)}</h1>
        </div>
        <ul className="mt-6 flex flex-col gap-2.5">
          {baris.map(b => (
            <li key={b.judul} className={`flex items-start gap-3 rounded-[18px] px-4 py-3 ${b.cls}`}>
              <span aria-hidden="true" className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-white">{b.ikon}</span>
              <span>
                <span className="block font-nunito text-[14.5px] font-extrabold leading-snug text-pekat">{b.judul}</span>
                <span className="mt-0.5 block font-nunito text-[13px] font-bold leading-snug text-[#9A6F86]">{b.isi}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center font-nunito text-[12.5px] font-semibold text-[#B48DA3]">{C.catatan}</p>
        {galat && (
          <p role="alert" className="mt-4 rounded-[14px] bg-mawar px-4 py-3 text-[13px] font-semibold text-rekah-tua">{galat}</p>
        )}
        <button type="button" onClick={onSimpan} disabled={menyimpan}
          className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-rekah font-nunito text-[15px] font-extrabold text-white transition hover:bg-rekah-tua disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
          style={{ boxShadow: '0 10px 20px -12px #D2559A' }}>
          {menyimpan ? COPY.simpan.sedang : C.cta}
          {!menyimpan && <ChevronRight className="h-4 w-4" strokeWidth={3} aria-hidden />}
        </button>
      </div>
      <KebunKecil n={4} />
    </div>
  );
}

/** Jawaban keluarga dari anak lain (mode tambah), supaya tidak ditanya ulang. */
function salinJawabanKeluarga(daftar: { id: string; namaAnak: string }[]): { jawaban: Record<string, string[]>; dari: string | null } {
  for (const a of daftar) {
    try {
      const raw = localStorage.getItem(`rekah_peta_${a.id}`);
      if (!raw) continue;
      const j = (JSON.parse(raw) as { jawaban?: Record<string, string[]> }).jawaban ?? {};
      const salin: Record<string, string[]> = {};
      for (const id of ID_KELUARGA) if (j[id]?.length) salin[id] = j[id];
      if (Object.keys(salin).length) return { jawaban: salin, dari: a.namaAnak };
    } catch { /* abaikan */ }
  }
  return { jawaban: {}, dari: null };
}

/** Tulis jawaban Peta, tanam nilai, set fokus pekan ini — sebelum anak jadi aktif. */
async function tulisIsianAwal(idAnak: string, s: State) {
  const usia = usiaDalamBulan(s.tanggalLahir);
  // Kondisi ibu tidak ditanyakan untuk anak ≥ 1 tahun: jangan ikut tersalin diam-diam.
  const jawaban = Object.fromEntries(
    Object.entries(s.jawaban).filter(([id, v]) => v.length > 0 && (id !== 'c_ibu' || (usia ?? 99) < 12)),
  );
  try {
    if (Object.keys(jawaban).length) localStorage.setItem(`rekah_peta_${idAnak}`, JSON.stringify({ jawaban }));
    if (s.nilai.length) localStorage.setItem(`rekah_fokus_minggu_${idAnak}`, s.nilai[0]);
  } catch { /* penyimpanan lokal tidak tersedia */ }
  // Berurutan supaya urutan tanam = urutan pilihan (nilai pertama = saran fokus).
  for (const n of s.nilai) {
    try { await tanamNilai(idAnak, n); } catch { /* nilai bisa ditanam ulang dari Bekal */ }
  }
}

// ── Ekspor utama ─────────────────────────────────────────────────────────────

export interface WizardAnakProps {
  /**
   * "pertama" = akun baru tanpa anak, tampilkan layar sambutan.
   * "tambah"  = menambah anak dari layar Pilih Anak, langsung ke isian.
   */
  mode?: 'pertama' | 'tambah';
  /** Dipanggil setelah profil (beserta jawaban Peta & nilai) tersimpan. */
  onSelesai?: () => void;
  /** Hanya untuk mode "tambah": keluar tanpa menyimpan. */
  onBatal?: () => void;
}

export default function WizardAnak({ mode = 'pertama', onSelesai, onBatal }: WizardAnakProps) {
  const { tambahAnak, daftarAnak } = useAnak();
  const [s, dispatch] = useReducer(reducer, undefined, (): State => {
    if (mode !== 'tambah') return AWAL;
    const salin = salinJawabanKeluarga(daftarAnak);
    return { ...AWAL, langkah: 'anak', jawaban: salin.jawaban, salinDari: salin.dari };
  });
  const [menyimpan, setMenyimpan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function simpan() {
    if (menyimpan) return;
    setMenyimpan(true);
    setGalat(null);

    const draft: DraftAnak = {
      namaAnak: s.namaAnak.trim(),
      tanggalLahir: s.tanggalLahir,
      jenisKelamin: s.jenisKelamin,
      // Baris kosong dibuang di AnakContext, jadi orang tua boleh melewati
      // langkah ini tanpa mengisi apa pun.
      pendamping: s.pendamping,
      fileFoto: s.fileFoto,
    };

    try {
      // Jawaban & nilai ditulis sebelum anak jadi aktif; setelah itu dashboard
      // mengambil alih layar (gerbang DashboardShellTier2), jadi tidak ada layar sesudahnya.
      await tambahAnak(draft, profil => tulisIsianAwal(profil.id, s));
      onSelesai?.();
    } catch {
      setGalat(COPY.simpan.gagal);
    } finally {
      setMenyimpan(false);
    }
  }

  switch (s.langkah) {
    case 'sambutan':
      return <Sambutan onMulai={() => dispatch({ type: 'MAJU' })} />;

    case 'anak':
      return (
        <LangkahAnak
          s={s}
          dispatch={dispatch}
          onMundur={() => (mode === 'tambah' ? onBatal?.() : dispatch({ type: 'MUNDUR' }))}
          onBatal={mode === 'tambah' ? onBatal : undefined}
        />
      );

    case 'pendamping':
      return (
        <LangkahPendamping
          s={s}
          dispatch={dispatch}
          onBatal={mode === 'tambah' ? onBatal : undefined}
        />
      );

    case 'kenali':
      return <LangkahKenali s={s} dispatch={dispatch} onBatal={mode === 'tambah' ? onBatal : undefined} />;

    case 'keluarga':
      return <LangkahKeluarga s={s} dispatch={dispatch} onBatal={mode === 'tambah' ? onBatal : undefined} />;

    case 'nilai':
      return <LangkahNilai s={s} dispatch={dispatch} onBatal={mode === 'tambah' ? onBatal : undefined} />;

    case 'siap':
      return (
        <LangkahSiap
          s={s}
          dispatch={dispatch}
          onSimpan={simpan}
          menyimpan={menyimpan}
          galat={galat}
          onBatal={mode === 'tambah' ? onBatal : undefined}
        />
      );

    default:
      return null;
  }
}
