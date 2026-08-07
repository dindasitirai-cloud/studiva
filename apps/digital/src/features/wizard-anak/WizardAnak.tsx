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
// ============================================================================

import React, { useEffect, useReducer, useRef, useState } from 'react';
import { ArrowLeft, Camera, Check, Plus, Trash2, X } from 'lucide-react';
import { useAnak } from '../../context/AnakContext';
import IlustrasiKelamin from '../../components/IlustrasiKelamin';
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

const HARI_INI = new Date().toISOString().split('T')[0];
const JUMLAH_LANGKAH = 2;
const MAKS_UKURAN_FOTO = 5 * 1024 * 1024; // 5 MB, sama dengan batas di rekah.ts

// ── State ────────────────────────────────────────────────────────────────────

type Langkah = 'sambutan' | 'anak' | 'pendamping' | 'perayaan';

interface State {
  langkah: Langkah;
  namaAnak: string;
  tanggalLahir: string;
  jenisKelamin: JenisKelamin | null;
  fileFoto: File | null;
  pendamping: Pendamping[];
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
  | { type: 'SET_PENDAMPING_PERAN'; index: number; value: PeranPendamping };

const URUTAN: Langkah[] = ['sambutan', 'anak', 'pendamping', 'perayaan'];

const AWAL: State = {
  langkah: 'sambutan',
  namaAnak: '',
  tanggalLahir: '',
  jenisKelamin: null,
  fileFoto: null,
  pendamping: [pendampingKosong()],
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
          style={{ borderRadius: '70% 70% 70% 4px', width: 18, height: 26 }}
          className={`transition-colors motion-reduce:transition-none ${
            i < langkahKe ? 'bg-rekah' : 'bg-mawar'
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
              className="flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-pekat/60 transition hover:bg-mawar hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
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

const GAYA_TOMBOL_UTAMA =
  'flex min-h-[48px] w-full items-center justify-center bg-rekah text-[15px] font-bold text-white transition hover:bg-rekah-tua disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2 motion-reduce:transition-none';

const GAYA_INPUT =
  'w-full rounded-[14px] border border-mawar bg-white px-4 py-3 text-[15px] text-pekat placeholder:text-pekat/30 transition focus:border-rekah/40 focus:outline-none focus:ring-2 focus:ring-rekah/20 min-h-[52px]';

const RADIUS_KELOPAK = { borderRadius: '100px 100px 100px 8px' } as const;

// ── Langkah 0 — Sambutan ─────────────────────────────────────────────────────

function Sambutan({ onMulai }: { onMulai: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-kanvas px-6 py-12">
      <div className="relative mb-8 h-28 w-28" aria-hidden>
        {[
          { deg: 0,   scale: 1.0,  delay: '0ms'   },
          { deg: 70,  scale: 0.85, delay: '80ms'  },
          { deg: 150, scale: 0.9,  delay: '160ms' },
          { deg: 215, scale: 0.8,  delay: '240ms' },
          { deg: 290, scale: 0.95, delay: '320ms' },
        ].map(({ deg, scale, delay }, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 36,
              height: 56,
              left: 'calc(50% - 18px)',
              bottom: '50%',
              transformOrigin: '50% 100%',
              transform: `rotate(${deg}deg) scale(${scale})`,
              borderRadius: '70% 70% 70% 4px',
              backgroundColor: '#E0526B',
              opacity: 0.9,
              animationDelay: delay,
            }}
            className="motion-safe:animate-rekah-bloom"
          />
        ))}
      </div>

      <h1
        className="mb-2 font-bricolage text-[2.2rem] font-extrabold tracking-tight text-pekat"
        style={{ letterSpacing: '-0.02em' }}
      >
        {COPY.sambutan.judul}
      </h1>
      <p className="mb-3 font-fraunces text-[1.15rem] italic text-rekah">
        {COPY.sambutan.tagline}
      </p>
      <p className="mb-10 max-w-xs text-center text-[14px] leading-relaxed text-pekat/60">
        {COPY.sambutan.body}
      </p>

      <button
        type="button"
        onClick={onMulai}
        style={RADIUS_KELOPAK}
        className={`${GAYA_TOMBOL_UTAMA} max-w-xs px-8`}
      >
        {COPY.sambutan.cta}
      </button>
    </div>
  );
}

// ── Pemilih foto ─────────────────────────────────────────────────────────────

function PemilihFoto({
  file,
  nama,
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
    if (!f.type.startsWith('image/')) {
      setGalat(COPY.anak.galatFotoBukanGambar);
      return;
    }
    if (f.size > MAKS_UKURAN_FOTO) {
      setGalat(COPY.anak.galatFotoTerlaluBesar);
      return;
    }
    setGalat(null);
    onPilih(f);
  }

  const inisial = nama.trim().charAt(0).toUpperCase() || '?';

  return (
    <div>
      <span className="mb-1.5 block text-[12px] font-semibold text-pekat/70">
        {COPY.anak.labelFoto}
      </span>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-mawar bg-mawar transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
        >
          {pratinjau ? (
            <img src={pratinjau} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-bricolage text-[28px] font-bold text-rekah">{inisial}</span>
          )}
          <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-madu text-white">
            <Camera className="h-3 w-3" aria-hidden />
          </span>
        </button>

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="self-start rounded-full border border-mawar bg-white px-4 py-1.5 text-[13px] font-semibold text-pekat/70 transition hover:bg-fajar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            {file ? COPY.anak.ctaGantiFoto : COPY.anak.ctaPilihFoto}
          </button>
          {file && (
            <button
              type="button"
              onClick={() => { onPilih(null); if (inputRef.current) inputRef.current.value = ''; }}
              className="flex items-center gap-1 self-start px-1 text-[12px] text-pekat/50 transition hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
            >
              <Trash2 className="h-3 w-3" aria-hidden />
              {COPY.anak.ctaHapusFoto}
            </button>
          )}
          <p className="max-w-[220px] text-[11px] leading-snug text-pekat/45">
            {COPY.anak.catatanFoto}
          </p>
        </div>
      </div>

      {galat && <p role="alert" className="mt-2 text-[12px] text-rekah">{galat}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={tangani}
      />
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
    siap:   'bg-pucuk/60',
    segera: 'bg-fajar',
    luar:   'bg-mawar/40',
  } as const;

  function lanjut() {
    dispatch({ type: 'SENTUH' });
    if (bolehLanjut) dispatch({ type: 'MAJU' });
  }

  return (
    <Cangkang langkahKe={1} onMundur={onMundur} onBatal={onBatal}>
      <div className="mb-6">
        <h2 className="mb-1 font-bricolage text-[1.4rem] font-extrabold leading-snug text-pekat">
          {COPY.anak.judul}
        </h2>
        <p className="text-[13px] leading-relaxed text-pekat/60">{COPY.anak.sub}</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Nama */}
        <div>
          <label htmlFor="wa-nama" className="mb-1.5 block text-[12px] font-semibold text-pekat/70">
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
            <p className="mt-1 text-[12px] text-rekah">{COPY.anak.galatNama}</p>
          )}
        </div>

        {/* Tanggal lahir */}
        <div>
          <label htmlFor="wa-tanggal" className="mb-1.5 block text-[12px] font-semibold text-pekat/70">
            {COPY.anak.labelTanggal}
          </label>
          <input
            id="wa-tanggal"
            type="date"
            max={HARI_INI}
            value={s.tanggalLahir}
            onChange={e => dispatch({ type: 'SET_TANGGAL', value: e.target.value })}
            className={GAYA_INPUT}
          />
          {masaDepan && <p className="mt-1 text-[12px] text-rekah">{COPY.anak.galatMasaDepan}</p>}
          {s.disentuh && !tanggalTerbaca && (
            <p className="mt-1 text-[12px] text-rekah">{COPY.anak.galatTanggal}</p>
          )}
          <p className="mt-1.5 text-[11px] leading-snug text-pekat/45">{COPY.anak.catatanKunci}</p>
        </div>

        {/* Jenis kelamin */}
        <fieldset>
          <legend className="mb-1.5 text-[12px] font-semibold text-pekat/70">
            {COPY.anak.labelKelamin}
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(LABEL_JENIS_KELAMIN) as JenisKelamin[]).map(key => {
              const dipilih = s.jenisKelamin === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={dipilih}
                  onClick={() => dispatch({ type: 'SET_KELAMIN', value: dipilih ? null : key })}
                  className={`flex min-h-[64px] items-center gap-3 rounded-2xl border-2 px-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-1 ${
                    dipilih ? 'border-rekah bg-mawar' : 'border-mawar/60 bg-white hover:border-rekah/40'
                  }`}
                >
                  <IlustrasiKelamin jenisKelamin={key} ukuran={36} />
                  <span className="text-[14px] font-bold text-pekat">
                    {LABEL_JENIS_KELAMIN[key]}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-pekat/45">{COPY.anak.catatanKelamin}</p>
        </fieldset>

        {/* Foto */}
        <PemilihFoto
          file={s.fileFoto}
          nama={s.namaAnak}
          onPilih={f => dispatch({ type: 'SET_FOTO', value: f })}
        />

        {/* Konfirmasi rentang usia */}
        {konfirmasi && (
          <div className={`rounded-[16px] px-4 py-3 ${LATAR_KONFIRMASI[konfirmasi.nada]}`}>
            <p className="text-[13px] leading-relaxed text-pekat/75">{konfirmasi.teks}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={lanjut}
        disabled={s.disentuh && !bolehLanjut}
        style={RADIUS_KELOPAK}
        className={`${GAYA_TOMBOL_UTAMA} mt-7`}
      >
        {COPY.nav.lanjut}
      </button>
    </Cangkang>
  );
}

// ── Langkah 2 — Pendamping ───────────────────────────────────────────────────

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

  return (
    <div className="rounded-[16px] border border-mawar/60 bg-white p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex-1">
          <label htmlFor={idNama} className="mb-1.5 block text-[12px] font-semibold text-pekat/70">
            {COPY.pendamping.labelNama}
          </label>
          <input
            ref={ref}
            id={idNama}
            type="text"
            value={pendamping.panggilan}
            autoComplete="off"
            maxLength={40}
            placeholder={COPY.pendamping.placeholderNama}
            onChange={e =>
              dispatch({ type: 'SET_PENDAMPING_PANGGILAN', index, value: e.target.value })
            }
            className={GAYA_INPUT}
          />
        </div>

        {bolehHapus && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'HAPUS_PENDAMPING', index })}
            aria-label={COPY.pendamping.ctaHapus(pendamping.panggilan)}
            className="mt-7 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-pekat/40 transition hover:bg-mawar hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      <fieldset>
        <legend className="mb-2 text-[12px] font-semibold text-pekat/70">
          {COPY.pendamping.labelPeran}
        </legend>
        <div className="flex flex-wrap gap-2">
          {PERAN_PENDAMPING.map(key => {
            const dipilih = pendamping.peran === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={dipilih}
                onClick={() => dispatch({ type: 'SET_PENDAMPING_PERAN', index, value: key })}
                className={`min-h-[40px] rounded-full border-2 px-3.5 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-1 ${
                  dipilih
                    ? 'border-rekah bg-rekah text-white'
                    : 'border-mawar/60 bg-white text-pekat hover:border-rekah/40'
                }`}
              >
                {PERAN_COPY[key]}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

function LangkahPendamping({
  s,
  dispatch,
  onSimpan,
  menyimpan,
  galat,
  onBatal,
}: {
  s: State;
  dispatch: React.Dispatch<Aksi>;
  onSimpan: () => void;
  menyimpan: boolean;
  galat: string | null;
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
      <div className="mb-6">
        <h2 className="mb-1 font-bricolage text-[1.4rem] font-extrabold leading-snug text-pekat">
          {COPY.pendamping.judul}
        </h2>
        <p className="text-[13px] leading-relaxed text-pekat/60">{COPY.pendamping.sub}</p>
      </div>

      <div className="flex flex-col gap-3">
        {s.pendamping.map((p, i) => (
          <BarisPendamping
            key={i}
            pendamping={p}
            index={i}
            bolehHapus={s.pendamping.length > 1}
            dispatch={dispatch}
            autoFocus={i === indexBaru}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={tambah}
        disabled={penuh}
        className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-[16px] border-2 border-dashed border-mawar text-[14px] font-semibold text-pekat/60 transition hover:border-rekah hover:text-rekah disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
      >
        <Plus className="h-4 w-4" aria-hidden />
        {COPY.pendamping.ctaTambah}
      </button>

      {penuh && (
        <p className="mt-2 text-[12px] text-pekat/50">{COPY.pendamping.batasTercapai}</p>
      )}

      <p className="mt-4 text-[11px] leading-snug text-pekat/45">{COPY.pendamping.catatan}</p>

      {galat && (
        <p role="alert" className="mt-5 rounded-[14px] bg-mawar px-4 py-3 text-[13px] font-semibold text-rekah-tua">
          {galat}
        </p>
      )}

      <button
        type="button"
        onClick={onSimpan}
        disabled={menyimpan}
        style={RADIUS_KELOPAK}
        className={`${GAYA_TOMBOL_UTAMA} mt-6`}
      >
        {menyimpan ? COPY.simpan.sedang : COPY.pendamping.cta}
      </button>
    </Cangkang>
  );
}

// ── Langkah 3 — Perayaan ─────────────────────────────────────────────────────

function Perayaan({ nama, onSelesai }: { nama: string; onSelesai: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-kanvas px-6 py-16 text-center">
      <style>{`
        @keyframes wizard-anak-mekar {
          from { opacity: 0; transform: scale(0.4) rotate(-15deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>

      <div
        className="relative mb-8 flex h-20 w-20 items-center justify-center motion-safe:[animation:wizard-anak-mekar_0.7s_cubic-bezier(0.34,1.56,0.64,1)_both]"
        aria-hidden
      >
        {[0, 72, 144, 216, 288].map(deg => (
          <span
            key={deg}
            style={{
              position: 'absolute',
              width: 24,
              height: 38,
              borderRadius: '70% 70% 70% 4px',
              background: '#F6B860',
              transform: `rotate(${deg}deg) translateY(-20px)`,
              opacity: 0.85,
            }}
          />
        ))}
        <span className="relative z-10 h-5 w-5 rounded-full bg-madu" />
      </div>

      <h1 className="font-fraunces text-[2rem] font-semibold italic leading-tight text-pekat">
        {COPY.perayaan.judul}
      </h1>
      <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-pekat/65">
        {COPY.perayaan.sub(nama)}
      </p>

      <button
        type="button"
        onClick={onSelesai}
        style={RADIUS_KELOPAK}
        className={`${GAYA_TOMBOL_UTAMA} mt-9 max-w-xs px-8`}
      >
        <Check className="mr-2 h-4 w-4" aria-hidden />
        {COPY.perayaan.cta}
      </button>
    </div>
  );
}

// ── Ekspor utama ─────────────────────────────────────────────────────────────

export interface WizardAnakProps {
  /**
   * "pertama" = akun baru tanpa anak, tampilkan layar sambutan.
   * "tambah"  = menambah anak dari layar Pilih Anak, langsung ke isian.
   */
  mode?: 'pertama' | 'tambah';
  /** Dipanggil setelah profil tersimpan dan orang tua menutup layar perayaan. */
  onSelesai?: () => void;
  /** Hanya untuk mode "tambah": keluar tanpa menyimpan. */
  onBatal?: () => void;
}

export default function WizardAnak({ mode = 'pertama', onSelesai, onBatal }: WizardAnakProps) {
  const { tambahAnak } = useAnak();
  const [s, dispatch] = useReducer(
    reducer,
    mode === 'tambah' ? { ...AWAL, langkah: 'anak' as Langkah } : AWAL,
  );
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
      await tambahAnak(draft);
      dispatch({ type: 'KE', langkah: 'perayaan' });
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
          onSimpan={simpan}
          menyimpan={menyimpan}
          galat={galat}
          onBatal={mode === 'tambah' ? onBatal : undefined}
        />
      );

    case 'perayaan':
      return (
        <Perayaan
          nama={s.namaAnak.trim()}
          onSelesai={() => onSelesai?.()}
        />
      );

    default:
      return null;
  }
}
