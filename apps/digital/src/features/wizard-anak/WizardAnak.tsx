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

// ── Bagian bersama (design handoff Tambah Anak, 2026-10-27) ──────────────────
// Bingkai lima langkah: Kembali · progres bunga · tutup, judul berlabel
// "LANGKAH N DARI 5", kebun yang tumbuh di dasar layar, dan kaki Lanjut.

/** Lima bunga kecil di satu tangkai; bagian yang sudah dilalui menghijau. */
function ProgresBunga({ langkahKe }: { langkahKe: number }) {
  return (
    <div
      className="relative flex items-center gap-2.5"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={JUMLAH_LANGKAH}
      aria-valuenow={langkahKe}
      aria-label={`Langkah ${langkahKe} dari ${JUMLAH_LANGKAH}`}
    >
      <span aria-hidden className="absolute left-3 right-3 top-1/2 -mt-[1.5px] h-[3px] rounded-sm bg-[#F8B9D4]" />
      <span
        aria-hidden
        className="wa-transisi absolute left-3 top-1/2 -mt-[1.5px] h-[3px] rounded-sm bg-[#8FB84A] transition-[width] duration-[400ms]"
        style={{ width: `calc((100% - 24px) * ${(langkahKe - 1) / (JUMLAH_LANGKAH - 1)})` }}
      />
      {Array.from({ length: JUMLAH_LANGKAH }, (_, i) => {
        const n = i + 1;
        const lewat = n <= langkahKe;
        const kelopak = lewat ? '#F06BA8' : '#F8B9D4';
        return (
          <svg
            key={n}
            aria-hidden
            width="24"
            height="24"
            viewBox="-12 -12 24 24"
            className="wa-transisi relative transition-transform duration-300"
            style={{ transform: `scale(${n === langkahKe ? 1.25 : 1})` }}
          >
            {[[0, -6], [5.7, -1.9], [3.5, 4.9], [-3.5, 4.9], [-5.7, -1.9]].map(([cx, cy], k) => (
              <circle key={k} cx={cx} cy={cy} r="4.6" fill={kelopak} />
            ))}
            <circle cx="0" cy="0" r="3.4" fill={lewat ? '#FFE29A' : '#FFF3E6'} />
          </svg>
        );
      })}
    </div>
  );
}

/** Kebun yang tumbuh: langkah N membuka N bunga; titik yang belum dicapai masih tunas daun. */
function KebunTumbuh({ langkahKe }: { langkahKe: number }) {
  const JENIS: NonNullable<BotanicalConfig['type']>[] = ['tulip', 'daisy', 'bell', 'fivepetal', 'sprig'];
  const WARNA = [
    { bloom: '#F06BA8', bloom2: '#F8B9D4', center: '#FFE29A' },
    { bloom: '#8FB8F7', bloom2: '#FFF3E6', center: '#FFE29A' },
    { bloom: '#FFE29A', bloom2: '#FFF3E6', center: '#F06BA8' },
    { bloom: '#C9B8F0', bloom2: '#FFF3E6', center: '#6E3B57' },
    { bloom: '#5F84E6', bloom2: '#8FB8F7', center: '#FFE29A' },
  ];
  const dasar = [4, 26, 50, 74, 96].map((x, k) => ({
    key: `d${k}`, left: x, w: 60, bottom: -6, dur: 6, delay: -k,
    cfg: { type: k % 2 ? 'leaf' : 'foliage', leaf: '#A7C63E' } as BotanicalConfig,
  }));
  const bunga = [8, 92, 20, 80, 33].map((x, k) => {
    const mekar = k < langkahKe;
    return {
      key: `b${k}`, left: x, w: mekar ? 100 : 54, bottom: mekar ? 30 : 20, dur: 5 + (k % 3), delay: -(k % 4),
      cfg: (mekar ? { type: JENIS[k], ...WARNA[k] } : { type: 'leaf', leaf: '#8FB84A' }) as BotanicalConfig,
    };
  });
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[200px] overflow-hidden">
      <div className="absolute rounded-[50%] bg-[#DCEBC4]" style={{ left: '-10%', right: '-10%', bottom: -150, height: 230 }} />
      <div className="absolute rounded-[50%] bg-[#EEFFD4]" style={{ left: '-20%', width: '62%', bottom: -170, height: 220 }} />
      <div className="absolute rounded-[50%] bg-[#EEFFD4]" style={{ right: '-20%', width: '62%', bottom: -176, height: 226 }} />
      {[...dasar, ...bunga].map(t => (
        <div
          key={t.key}
          className="wa-goyang wa-transisi absolute transition-[width,height] duration-500"
          style={{ left: `${t.left}%`, bottom: t.bottom, width: t.w, height: t.w * 1.5, marginLeft: -t.w / 2, animationDuration: `${t.dur}s`, animationDelay: `${t.delay}s` }}
        >
          <BotanicalStem cfg={t.cfg} />
        </div>
      ))}
    </div>
  );
}

const TOMBOL_UTAMA =
  'wa-transisi inline-flex h-[60px] items-center gap-2.5 rounded-full bg-rekah pl-[34px] pr-[30px] font-fredoka text-[20px] font-bold text-white shadow-[0_16px_26px_-16px_#F06BA8] transition hover:-translate-y-0.5 hover:bg-[#E0559A] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2';

/** Bingkai setiap langkah 1–5. */
function Cangkang({
  children,
  langkahKe,
  judul,
  sub,
  onMundur,
  onBatal,
  onLanjut,
  onLewati,
  labelLanjut = COPY.nav.lanjut,
  lanjutNonaktif = false,
}: {
  children: React.ReactNode;
  langkahKe: number;
  judul: string;
  sub: string;
  /** Kosong = tombol Kembali tampil redup dan tidak bisa dipakai (langkah 1 saat menambah anak). */
  onMundur?: () => void;
  onBatal?: () => void;
  onLanjut: () => void;
  onLewati?: () => void;
  labelLanjut?: string;
  lanjutNonaktif?: boolean;
}) {
  // Judul baru → mulai dari atas lagi.
  useEffect(() => { window.scrollTo(0, 0); }, [langkahKe]);
  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[linear-gradient(180deg,#FFF3E6_0%,#FFF3E6_62%,#FCE3EE_100%)] font-nunito text-pekat">
      <style>{GAYA_GERAK}</style>
      <KebunTumbuh langkahKe={langkahKe} />

      <div className="relative z-[1] flex w-full max-w-[960px] flex-col px-5 pb-[230px] pt-6 sm:px-8 sm:pt-7">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onMundur}
            disabled={!onMundur}
            className="flex min-h-[44px] items-center gap-2 rounded-full py-2.5 pl-2 pr-3.5 text-[16px] font-extrabold text-pekat transition hover:bg-[#FCE3EE] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.4} aria-hidden />
            {COPY.nav.kembali}
          </button>

          <div className="flex items-center gap-4">
            <ProgresBunga langkahKe={langkahKe} />
            {onBatal && (
              <button
                type="button"
                onClick={onBatal}
                aria-label="Tutup, batalkan penambahan anak"
                className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white text-pekat shadow-[0_8px_18px_-14px_#6E3B57] transition hover:bg-[#FCE3EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
              >
                <X className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden />
              </button>
            )}
          </div>
        </div>

        <p className="mt-10 text-[13px] font-extrabold tracking-[.16em] text-[#8A5A73] sm:mt-12">
          LANGKAH {langkahKe} DARI {JUMLAH_LANGKAH}
        </p>
        <h2 className="mt-2.5 font-fredoka text-[clamp(30px,4.6vw,42px)] font-bold leading-[1.12] text-pekat [text-wrap:balance]">{judul}</h2>
        <p className="mt-2 max-w-[640px] text-[17px] font-semibold leading-normal text-[#8A5A73] [text-wrap:pretty]">{sub}</p>

        {children}

        <div className="mt-10 flex items-center justify-between gap-4">
          <div>
            {onLewati && (
              <button
                type="button"
                onClick={onLewati}
                className="flex h-[52px] items-center rounded-full px-3.5 text-[16px] font-extrabold text-pekat transition hover:bg-[#FCE3EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
              >
                {COPY.nav.lewati}
              </button>
            )}
          </div>
          <button type="button" onClick={onLanjut} disabled={lanjutNonaktif} className={TOMBOL_UTAMA}>
            {labelLanjut}
            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={3} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Chip pilihan bersama (jenis kelamin, peran, jawaban Peta). */
function Chip({
  on,
  onClick,
  role,
  tinggi = 46,
  children,
}: {
  on: boolean;
  onClick: () => void;
  role: 'radio' | 'checkbox';
  tinggi?: 44 | 46 | 52;
  children: React.ReactNode;
}) {
  const ukuran = tinggi === 52 ? 'h-[52px] px-[22px] text-[16px]' : tinggi === 44 ? 'h-11 px-4 text-[15px]' : 'h-[46px] px-[18px] text-[15.5px]';
  return (
    <button
      type="button"
      role={role}
      aria-checked={on}
      onClick={onClick}
      className={`wa-transisi inline-flex items-center gap-1.5 rounded-full border-2 font-extrabold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-1 ${ukuran} ${
        on ? 'border-rekah bg-rekah text-white' : 'border-[#FCE3EE] bg-white text-pekat hover:border-rekah'
      }`}
    >
      {on && <Check className="h-[15px] w-[15px]" strokeWidth={3.2} aria-hidden />}
      {children}
    </button>
  );
}

const GAYA_INPUT =
  'wa-transisi h-[60px] w-full rounded-[22px] border-2 border-[#FCE3EE] bg-white px-[22px] font-nunito text-[18px] font-extrabold text-pekat placeholder:text-[#B98CA3] transition-colors focus:border-rekah focus:outline-none';

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
@keyframes waSway{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
@keyframes waFloaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.wa-goyang{transform-origin:50% 100%;animation:waSway 6s ease-in-out infinite}
.wa-apung{animation:waFloaty 6s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){.wa-goyang,.wa-apung{animation:none!important}.wa-transisi{transition:none!important}.wa-transisi:hover{transform:none!important}}
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
    <div className="flex flex-none flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={file ? COPY.anak.ctaGantiFoto : `${COPY.anak.ctaPilihFoto} (opsional)`}
        title={COPY.anak.catatanFoto}
        style={{ borderRadius: '52px 52px 52px 16px' }}
        className={`wa-transisi relative flex h-[104px] w-[104px] items-center justify-center overflow-hidden text-rekah transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2 ${pratinjau ? 'bg-mawar' : 'border-2 border-dashed border-[#F8B9D4] bg-white hover:border-rekah'}`}
      >
        {pratinjau ? <img src={pratinjau} alt="" className="h-full w-full object-cover" /> : <Camera className="h-[30px] w-[30px]" strokeWidth={2} aria-hidden />}
      </button>
      {file ? (
        <button type="button" onClick={() => { onPilih(null); if (inputRef.current) inputRef.current.value = ''; }}
          className="min-h-[32px] rounded-full px-2 text-[13px] font-bold text-[#8A5A73] hover:text-[#D2478A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
          {COPY.anak.ctaHapusFoto}
        </button>
      ) : (
        <span className="text-[13px] font-bold text-[#8A5A73]">Foto</span>
      )}
      {galat && <p role="alert" className="max-w-[130px] text-center text-[12.5px] font-bold text-[#D2478A]">{galat}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={tangani} />
    </div>
  );
}

const GALAT = 'mt-1 text-[14px] font-bold text-[#D2478A]';
const BANTU = 'text-[14px] font-semibold leading-normal text-[#8A5A73]';

// ── Langkah 1 — Siapa yang akan kita temani ──────────────────────────────────

function LangkahAnak({
  s,
  dispatch,
  onMundur,
  onBatal,
}: {
  s: State;
  dispatch: React.Dispatch<Aksi>;
  onMundur?: () => void;
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

  // Kotak usia muncul begitu tanggal lahir terbaca. Tiga keadaan: rentang
  // siap, rentang masih disiapkan, atau usia di luar jangkauan Rekah.
  const konfirmasi = (() => {
    if (!tanggalValid) return null;
    const nama = s.namaAnak.trim() || 'Si kecil';
    const usiaBulan = usiaDalamBulan(s.tanggalLahir);
    const ringkas = ringkasRentang(usiaBulan);
    if (!ringkas) return COPY.anak.diLuarRentang(nama);
    const usia = formatUsia(usiaBulan);
    return ringkas.siap ? COPY.anak.rentangSiap(nama, usia, ringkas.rentang) : COPY.anak.rentangSegera(nama, usia, ringkas.rentang);
  })();

  function lanjut() {
    dispatch({ type: 'SENTUH' });
    if (bolehLanjut) dispatch({ type: 'MAJU' });
  }

  return (
    <Cangkang
      langkahKe={1}
      judul={COPY.anak.judul}
      sub={COPY.anak.sub}
      onMundur={onMundur}
      onBatal={onBatal}
      onLanjut={lanjut}
      lanjutNonaktif={s.disentuh && !bolehLanjut}
    >
      <div className="mt-9 grid items-start gap-x-10 gap-y-7 [grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))]">
        <div className="flex flex-col gap-7">
          {/* Foto + nama panggilan */}
          <div className="flex items-start gap-5">
            <PemilihFoto file={s.fileFoto} nama={s.namaAnak} onPilih={f => dispatch({ type: 'SET_FOTO', value: f })} />
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <label htmlFor="wa-nama" className="text-[16px] font-extrabold text-pekat">{COPY.anak.labelNama}</label>
              <input
                ref={namaRef}
                id="wa-nama"
                type="text"
                value={s.namaAnak}
                autoComplete="off"
                placeholder={COPY.anak.placeholderNama}
                onChange={e => dispatch({ type: 'SET_NAMA', value: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && lanjut()}
                aria-invalid={s.disentuh && !namaValid}
                className={GAYA_INPUT}
              />
              {s.disentuh && !namaValid && <p className={GALAT}>{COPY.anak.galatNama}</p>}
            </div>
          </div>

          {/* Tanggal lahir */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="wa-tanggal" className="text-[16px] font-extrabold text-pekat">{COPY.anak.labelTanggal}</label>
              <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#8A5A73]">
                <Lock className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden /> dikunci setelah tersimpan
              </span>
            </div>
            <input
              id="wa-tanggal"
              type="date"
              max={HARI_INI}
              value={s.tanggalLahir}
              onChange={e => dispatch({ type: 'SET_TANGGAL', value: e.target.value })}
              aria-invalid={masaDepan || (s.disentuh && !tanggalTerbaca)}
              className={GAYA_INPUT}
            />
            {masaDepan && <p className={GALAT}>{COPY.anak.galatMasaDepan}</p>}
            {s.disentuh && !tanggalTerbaca && <p className={GALAT}>{COPY.anak.galatTanggal}</p>}
            <p className={BANTU}>{COPY.anak.catatanKoreksi}</p>
          </div>
        </div>

        <div className="flex flex-col gap-7">
          {konfirmasi && (
            <div className="flex items-start gap-3.5 rounded-[24px] bg-[#FFF3D0] px-[22px] py-5" role="status">
              <div aria-hidden className="-mt-0.5 h-[45px] w-[30px] flex-none">
                <BotanicalStem cfg={{ type: 'sprig', bloom: '#F06BA8', bloom2: '#FFE29A' }} />
              </div>
              <p className="text-[15.5px] font-bold leading-[1.55] text-[#6B4A00] [text-wrap:pretty]">{konfirmasi}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <span id="wa-label-kelamin" className="text-[16px] font-extrabold text-pekat">{COPY.anak.labelKelamin}</span>
            <div role="radiogroup" aria-labelledby="wa-label-kelamin" className="flex flex-wrap gap-2.5">
              {(Object.keys(LABEL_JENIS_KELAMIN) as JenisKelamin[]).map(key => {
                const dipilih = s.jenisKelamin === key;
                return (
                  <Chip key={key} role="radio" tinggi={52} on={dipilih}
                    onClick={() => dispatch({ type: 'SET_KELAMIN', value: dipilih ? null : key })}>
                    {LABEL_JENIS_KELAMIN[key]}
                  </Chip>
                );
              })}
            </div>
            <p className={BANTU}>{COPY.anak.catatanKelamin}</p>
          </div>
        </div>
      </div>
    </Cangkang>
  );
}

// ── Langkah 2 — Pendamping ───────────────────────────────────────────────────

const WARNA_AVATAR = ['#FCE3EE', '#FFF3D0', '#F1ECFB', '#E4EFFD'];

function KartuPendamping({
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
  const inisial = pendamping.panggilan.trim().charAt(0).toUpperCase();

  return (
    <div className="flex items-start gap-4 rounded-[28px] border-2 border-[#FCE3EE] bg-white p-[18px]">
      <span
        aria-hidden="true"
        className="flex h-14 w-14 flex-none items-center justify-center font-fredoka text-[24px] font-bold text-pekat"
        style={{ background: WARNA_AVATAR[index % WARNA_AVATAR.length], borderRadius: '28px 28px 28px 10px' }}
      >
        {inisial || <Plus className="h-[22px] w-[22px] text-rekah" strokeWidth={2.6} />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-1.5">
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
            className="wa-transisi h-[52px] w-full min-w-0 flex-1 rounded-[18px] border-2 border-[#FCE3EE] bg-[#FFF9F3] px-[18px] text-[17px] font-extrabold text-pekat placeholder:text-[#B98CA3] transition-colors focus:border-rekah focus:bg-white focus:outline-none"
          />
          {bolehHapus && (
            <button type="button" onClick={() => dispatch({ type: 'HAPUS_PENDAMPING', index })}
              aria-label={COPY.pendamping.ctaHapus(pendamping.panggilan)}
              className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-[#8A5A73] transition hover:bg-[#FCE3EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
              <Trash2 className="h-[19px] w-[19px]" strokeWidth={2.2} aria-hidden />
            </button>
          )}
        </div>
        <div role="radiogroup" aria-label={`${COPY.pendamping.labelPeran} ${pendamping.panggilan || 'pendamping'}`} className="flex flex-wrap gap-2">
          {PERAN_PENDAMPING.map(key => (
            <Chip key={key} role="radio" tinggi={44} on={pendamping.peran === key}
              onClick={() => dispatch({ type: 'SET_PENDAMPING_PERAN', index, value: key })}>
              {PERAN_COPY[key]}
            </Chip>
          ))}
        </div>
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
  // Kartu yang baru ditambah mendapat fokus, supaya tidak perlu klik lagi.
  const [indexBaru, setIndexBaru] = useState<number | null>(null);
  const penuh = s.pendamping.length >= MAKS_PENDAMPING;

  function tambah() {
    setIndexBaru(s.pendamping.length);
    dispatch({ type: 'TAMBAH_PENDAMPING' });
  }

  return (
    <Cangkang
      langkahKe={2}
      judul={COPY.pendamping.judul}
      sub={COPY.pendamping.sub}
      onMundur={() => dispatch({ type: 'MUNDUR' })}
      onBatal={onBatal}
      onLanjut={() => dispatch({ type: 'MAJU' })}
    >
      <div className="mt-8 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,400px),1fr))]">
        {s.pendamping.map((p, i) => (
          <KartuPendamping key={i} pendamping={p} index={i} bolehHapus={s.pendamping.length > 1} dispatch={dispatch} autoFocus={i === indexBaru} />
        ))}
      </div>

      <button type="button" onClick={tambah} disabled={penuh}
        className="wa-transisi mt-4 inline-flex h-[52px] items-center gap-2 self-start rounded-full border-2 border-dashed border-[#F8B9D4] px-[22px] text-[16px] font-extrabold text-pekat transition-colors hover:border-rekah hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
        <Plus className="h-[18px] w-[18px] text-rekah" strokeWidth={2.8} aria-hidden /> {COPY.pendamping.ctaTambah}
      </button>
      {penuh && <p className={`mt-3 ${BANTU}`}>{COPY.pendamping.batasTercapai}</p>}
      <p className={`mt-3.5 ${BANTU}`}>{COPY.pendamping.catatan}</p>
    </Cangkang>
  );
}

// ── Langkah 3–5 — pertanyaan Peta & nilai (opsional) ─────────────────────────

/** Satu pertanyaan Peta sebagai kartu chip. Data & konfirmasi sama dengan Kelola. */
function KartuTanya({ q, sel, onPilih, inisial }: { q: PetaPertanyaan; sel: string[]; onPilih: (v: string) => void; inisial: string }) {
  const pesan = konfirmasiPeta(q.id, sel);
  const idJudul = `wa-tanya-${q.id}`;
  return (
    <div className="flex flex-col gap-3.5 rounded-[28px] border-2 border-[#FCE3EE] bg-white px-[22px] pb-6 pt-[22px]">
      <div className="flex flex-wrap items-baseline gap-2.5">
        <span aria-hidden className="flex h-[30px] w-[30px] flex-none items-center justify-center self-center bg-[#FCE3EE] font-fredoka text-[15px] font-bold text-[#D2478A]" style={{ borderRadius: '15px 15px 15px 5px' }}>
          {inisial}
        </span>
        <span id={idJudul} className="text-[17px] font-extrabold text-pekat">{q.teks}</span>
        {q.multi && <span className="text-[13.5px] font-bold text-[#8A5A73]">(boleh lebih dari satu)</span>}
        {q.sensitif && <span className="rounded-[6px] bg-[#FFF3D0] px-2 py-0.5 text-[11px] font-extrabold tracking-[.06em] text-[#6B4A00]">OPSIONAL</span>}
      </div>
      <div role={q.multi ? 'group' : 'radiogroup'} aria-labelledby={idJudul} className="flex flex-wrap gap-2">
        {q.opsi.map(op => (
          <Chip key={op.v} role={q.multi ? 'checkbox' : 'radio'} on={sel.includes(op.v)} onClick={() => onPilih(op.v)}>
            {op.v}
          </Chip>
        ))}
      </div>
      {pesan && <p role="status" className="rounded-[16px] bg-[#F1ECFB] px-4 py-3 text-[14.5px] font-bold text-[#5B3FA0]">{pesan}</p>}
    </div>
  );
}

const usiaBulanDari = (s: State) => usiaDalamBulan(s.tanggalLahir);
const tanya = (id: string) => PETA_PERTANYAAN.find(q => q.id === id);
const inisialAnak = (s: State) => (s.namaAnak.trim().charAt(0) || 'S').toUpperCase();

/** Pertanyaan bidang Anak di wizard: 3 umum + 1 sesuai tahap usia. */
function pertanyaanKenali(usiaBulan: number | null): PetaPertanyaan[] {
  const band = bandPeta(usiaBulan);
  const khusus = band === 'bayi' ? 'a_menyusu' : band === 'batita' ? 'a_makan_bt' : 'a_sekolah';
  return ['a_suasana', 'a_tenang', 'a_alergi', khusus].flatMap(id => { const q = tanya(id); return q ? [q] : []; });
}

/** Pertanyaan keluarga: kondisi ibu hanya untuk anak di bawah 1 tahun. */
function pertanyaanKeluarga(usiaBulan: number | null): PetaPertanyaan[] {
  const ids = ['c_bunda', 'c_bahasa', ...((usiaBulan ?? 99) < 12 ? ['c_ibu'] : [])];
  return ids.flatMap(id => { const q = tanya(id); return q ? [q] : []; });
}

const GRID_TANYA = 'grid items-start gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr))]';

function LangkahKenali({ s, dispatch, onBatal }: { s: State; dispatch: React.Dispatch<Aksi>; onBatal?: () => void }) {
  const nama = s.namaAnak.trim() || 'si kecil';
  return (
    <Cangkang
      langkahKe={3}
      judul={COPY.kenali.judul(nama)}
      sub={COPY.kenali.sub}
      onMundur={() => dispatch({ type: 'MUNDUR' })}
      onBatal={onBatal}
      onLanjut={() => dispatch({ type: 'MAJU' })}
    >
      <div className={`mt-6 ${GRID_TANYA}`}>
        {pertanyaanKenali(usiaBulanDari(s)).map(q => (
          <KartuTanya key={q.id} q={q} inisial={inisialAnak(s)} sel={s.jawaban[q.id] ?? []} onPilih={v => dispatch({ type: 'PILIH_PETA', q, value: v })} />
        ))}
      </div>
    </Cangkang>
  );
}

function LangkahKeluarga({ s, dispatch, onBatal }: { s: State; dispatch: React.Dispatch<Aksi>; onBatal?: () => void }) {
  const usia = usiaBulanDari(s);
  return (
    <Cangkang
      langkahKe={4}
      judul={COPY.keluarga.judul}
      sub={COPY.keluarga.sub}
      onMundur={() => dispatch({ type: 'MUNDUR' })}
      onBatal={onBatal}
      onLanjut={() => dispatch({ type: 'MAJU' })}
      onLewati={() => dispatch({ type: 'MAJU' })}
    >
      {s.salinDari && (
        <p className="mt-7 flex items-center gap-3 rounded-[20px] bg-[#FFF3D0] px-5 py-3.5 text-[15.5px] font-bold text-[#6B4A00]">
          <Check className="h-5 w-5 flex-none" strokeWidth={2.4} aria-hidden />
          {COPY.keluarga.catatanSalin(s.salinDari)}
        </p>
      )}
      <div className={`mt-6 ${GRID_TANYA}`}>
        {pertanyaanKeluarga(usia).map(q => (
          <KartuTanya key={q.id} q={q} inisial={inisialAnak(s)} sel={s.jawaban[q.id] ?? []} onPilih={v => dispatch({ type: 'PILIH_PETA', q, value: v })} />
        ))}
      </div>
      <p className={`mt-4 ${BANTU}`}>{(usia ?? 99) < 12 ? COPY.keluarga.catatanIbu : COPY.keluarga.catatanNanti}</p>
    </Cangkang>
  );
}

/** Warna lembut kartu nilai saat dipilih (handoff). */
const WARNA_NILAI: Record<NilaiAkar, string> = {
  'Kejujuran': '#E6ECFC', 'Syukur': '#FFF3D0', 'Kasih Sayang': '#F1ECFB', 'Empati': '#FCE7F0',
  'Kemandirian': '#FFF3D0', 'Tanggung Jawab': '#F1ECFB', 'Kesederhanaan': '#FCE3EE', 'Cinta Ilmu': '#E4EFFD',
  'Sabar': '#E4EFFD', 'Berbagi': '#E6ECFC', 'Keberanian': '#FCE3EE', 'Hormat pada Sesama': '#FFF3D0',
};

function LangkahNilai({ s, dispatch, onBatal }: { s: State; dispatch: React.Dispatch<Aksi>; onBatal?: () => void }) {
  const penuh = s.nilai.length >= MAKS_NILAI;
  return (
    <Cangkang
      langkahKe={5}
      judul={COPY.nilai.judul}
      sub={COPY.nilai.sub}
      onMundur={() => dispatch({ type: 'MUNDUR' })}
      onBatal={onBatal}
      onLanjut={() => dispatch({ type: 'MAJU' })}
      onLewati={() => dispatch({ type: 'MAJU' })}
      labelLanjut={COPY.nav.selesai}
    >
      <div className="mt-[30px] grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,190px),1fr))] max-[440px]:grid-cols-2">
        {NILAI.map(n => {
          const urut = s.nilai.indexOf(n);
          const on = urut > -1;
          const redup = !on && penuh;
          const bunga = BUNGA_DARI_NAMA.get(n);
          return (
            <button key={n} type="button" role="checkbox" aria-checked={on} aria-disabled={redup}
              onClick={() => dispatch({ type: 'TOGGLE_NILAI', value: n })}
              className={`wa-transisi relative flex flex-col items-center gap-2 rounded-[26px] border-2 px-2.5 pb-[18px] pt-[22px] text-center transition duration-200 hover:-translate-y-[3px] hover:border-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${on ? 'border-rekah' : 'border-[#FCE3EE] bg-white'} ${redup ? 'opacity-[.55]' : ''}`}
              style={on ? { background: WARNA_NILAI[n] } : undefined}>
              {on && (
                <span aria-hidden className="absolute right-2.5 top-2.5 flex h-[26px] w-[26px] items-center justify-center bg-rekah font-fredoka text-[14px] font-bold text-white" style={{ borderRadius: '13px 13px 13px 4px' }}>
                  {urut + 1}
                </span>
              )}
              <span aria-hidden className="wa-transisi pointer-events-none flex h-[58px] w-[58px] items-center justify-center transition-transform duration-300" style={{ transform: `scale(${on ? 1.12 : 1})` }}>
                {bunga && <BungaMekar bunga={bunga} mekar={TAHAP_MAKS} size={58} />}
              </span>
              <span className="text-[15.5px] font-extrabold text-pekat">{n}</span>
              {urut === 0 && <span className="-mt-1 font-shantell text-[13px] font-semibold text-pekat">{COPY.nilai.fokus}</span>}
            </button>
          );
        })}
      </div>
      <p className={`mt-4 ${BANTU}`} role="status">{penuh ? COPY.nilai.maks : COPY.nilai.catatan}</p>
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
          // Langkah 1 saat menambah anak: Kembali redup (handoff); keluar lewat tombol tutup.
          onMundur={mode === 'tambah' ? undefined : () => dispatch({ type: 'MUNDUR' })}
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
