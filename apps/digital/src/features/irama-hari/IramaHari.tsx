// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { X, Check, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NilaiAkar } from '../akar-keluarga/content';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { useAnak } from '../../context/AnakContext';
import { renderRichText } from '../beranda-usia/renderRichText';
import { resolveTahapAktif } from '../beranda-usia/resolveTahap';
import type { ProfilAnak } from '../beranda-usia/resolveTahap';
import { rakitBekal } from '../beranda-usia/adapter/rakitBekal';
import { PilihanHarianProvider, usePilihanHarian } from './PilihanHarianContext';
import type { PilihanHarian } from './PilihanHarianContext';
import type { ItemBekal } from '../beranda-usia/bekal';
import type { SapaanSet } from '../beranda-usia/useChildProfile';
import KartuKebiasaanBaik from './KartuKebiasaanBaik';
import type { CentangKebiasaan } from '@studiva/shared';
import type { ItemSikap } from '../beranda-usia/adapter/sikapAdapter';
import PilihanHariIni from './PilihanHariIni';
import SusunanHari from './SusunanHari';
import CatatanHari from './CatatanHari';
import WawasanTumbuh from './WawasanTumbuh';
import FokusMingguIni from './FokusMingguIni';
import BotanicalStem from '../../components/BotanicalStem';
import {
  DRAF_BANNER,
  LAYAR_BELUM_LAHIR,
  LAYAR_DATA_BELUM_DIISI,
  LAYAR_MELEWATI_RENTANG,
  LAYAR_KONTEN_BELUM_SIAP,
} from './content';
import FilterSubUsia, { resolveSubUsia } from '../../components/FilterSubUsia';
import type { IdSubUsia } from '../../components/FilterSubUsia';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';

// ─── Utilitas tanggal (Indonesia) ────────────────────────────────────────────

const HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatTanggalHero(): string {
  const d = new Date();
  return `${HARI_ID[d.getDay()]}, ${d.getDate()} ${BULAN_ID[d.getMonth()]}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PropsIramaHari {
  nilaiFokus?: readonly NilaiAkar[];
  // Nama dan tanggal lahir anak diambil dari AnakContext lewat useChildProfile,
  // bukan dioper lewat props.
  /** Dipanggil tiap kali state PilihanHarian berubah — dipakai IramaMingguan sebagai jembatan data. */
  onPilihanChange?: (pilihan: PilihanHarian, kolamAnak: readonly ItemBekal[]) => void;
  /** Status centang kebiasaan harian; dikelola oleh IramaHariPage. */
  centangKebiasaan: CentangKebiasaan;
  /** Tanggal hari ini YYYY-MM-DD (WIB), dihitung sekali di IramaHariPage. */
  tanggalHariIni: string;
  /** Toggle satu butir sikap untuk nilai tertentu hari ini. */
  onCentangToggle: (nilaiId: NilaiAkar, butirId: string) => void;
  /** Navigasi ke halaman Bekal. */
  onBekal: () => void;
}

// ─── Hero banner ──────────────────────────────────────────────────────────────

const DECO1 = { type: 'tulip' as const, bloom: '#F06BA8', bloom2: '#F8B9D4', center: '#6E3B57' };
const DECO2 = { type: 'daisy' as const, bloom: '#5F84E6', bloom2: '#8FB8F7', center: '#FFE29A' };
const DECO3 = { type: 'sprig' as const, bloom: '#5F84E6', bloom2: '#FFE29A' };

function HeroBanner({ sapaan, usiaBulan }: { sapaan: SapaanSet; usiaBulan: number | null }) {
  const infoAnak = sapaan.cap
    ? `${sapaan.cap.toUpperCase()}${usiaBulan !== null ? ` · ${usiaBulan} BULAN` : ''}`
    : null;

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#FCE3EE] px-[28px] py-[22px]">
      {/* Tanggal + info anak */}
      <p className="mb-1 font-nunito text-[10px] font-[800] uppercase tracking-widest text-rekah/60">
        {formatTanggalHero()}
        {infoAnak && <span className="text-pekat/40"> · {infoAnak}</span>}
      </p>

      {/* Judul */}
      <h1 className="font-fredoka text-[34px] font-semibold leading-none text-pekat sm:text-[40px]">
        Irama Hari
      </h1>
      {/* TODO: review Fitri */}
      <p className="mt-1 font-nunito text-[13px] leading-snug text-rekah/70">
        Irama Hari menjadi tempat kamu mengatur kegiatanmu dari Bekal - Ajak Main dan Wawasan Tumbuh, serta checklist Kebiasaan Baik dari nilai yang ingin kamu tanamkan kepada anak
      </p>

      {/* Botanical decorations — positions tuned for 1280px viewport */}
      <div aria-hidden className="pointer-events-none select-none">
        {/* deco1: tulip — top-right */}
        <div
          className="absolute animate-sway"
          style={{ top: '-6px', right: '28px', width: '56px', height: '88px' }}
        >
          <BotanicalStem cfg={DECO1} />
        </div>
        {/* deco3: sprig cornflower — middle-right */}
        <div
          className="absolute animate-sway"
          style={{ top: '22px', right: '96px', width: '36px', height: '58px' }}
        >
          <BotanicalStem cfg={DECO3} />
        </div>
        {/* deco2: daisy cornflower — bottom-right */}
        <div
          className="absolute animate-sway2"
          style={{ bottom: '-10px', right: '86px', width: '44px', height: '72px' }}
        >
          <BotanicalStem cfg={DECO2} />
        </div>
      </div>
    </div>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

// ─── Strip langkah "Kelola" ───────────────────────────────────────────────────
// Membuat peran Irama Hari dalam Family Journey Map terbaca jelas:
// Fokus → Ambil Bekal → KELOLA → Jalani. Additive, murni penanda alur.
function StripKelola({ onBekal }: { onBekal: () => void }) {
  const langkah = [
    { n: 1, judul: 'Fokus', ket: 'Fokus dari Kompas', warna: '#F06BA8', aksi: undefined as undefined | (() => void), kunci: false },
    { n: 2, judul: 'Ambil Bekal', ket: 'Tarik ide kegiatan', warna: '#8FB8F7', aksi: onBekal, kunci: false },
    { n: 3, judul: 'Kelola', ket: 'Susun ke hari & minggu', warna: '#D04595', aksi: undefined, kunci: true },
    { n: 4, judul: 'Jalani', ket: 'Temani & bantu', warna: '#4E9C6E', aksi: undefined, kunci: false },
  ];
  return (
    <section className="px-6 sm:px-10 mt-5" aria-label="Alur mengelola hari">
      <div className="rounded-[20px] border border-rekah/10 bg-white/70 px-4 py-4 sm:px-5">
        <p className="mb-3 font-shantell text-[15px] text-rekah">di sinilah kamu mengelola hari</p>
        <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {langkah.map(l => {
            const inner = (
              <>
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] font-fredoka text-[14px] font-semibold text-white"
                  style={{ background: l.warna, boxShadow: l.kunci ? '0 0 0 4px rgba(208,69,149,.16)' : undefined }}
                >
                  {l.n}
                </span>
                <span className="min-w-0 text-left">
                  <span className="block font-nunito text-[14px] font-extrabold leading-tight" style={{ color: l.kunci ? '#D04595' : '#6E3B57' }}>
                    {l.judul}
                  </span>
                  <span className="block font-nunito text-[11.5px] leading-tight text-pekat/55">{l.ket}</span>
                  {l.kunci && <span className="mt-0.5 block font-shantell text-[11px] text-rekah-tua">langkah kunci</span>}
                </span>
              </>
            );
            const base = 'flex items-center gap-2.5 rounded-[14px] border p-2.5';
            const border = l.kunci ? 'border-rekah/30 bg-fajar/50' : 'border-rekah/10 bg-white';
            return (
              <li key={l.n}>
                {l.aksi ? (
                  <button type="button" onClick={l.aksi} className={base + ' w-full ' + border + ' text-left transition hover:border-rekah/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah motion-reduce:transition-none'}>
                    {inner}
                  </button>
                ) : (
                  <div className={base + ' h-full ' + border}>{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default function IramaHari({ nilaiFokus = [], onPilihanChange, centangKebiasaan, tanggalHariIni, onCentangToggle, onBekal }: PropsIramaHari) {
  const { profile, sapaan, usiaBulan } = useChildProfile();
  const { anakAktif } = useAnak();
  const isDev = process.env.NODE_ENV !== 'production';

  const { bekal: bekalRakit, katalogSikap } = useMemo(() => rakitBekal(), []);
  // TODO: review Fitri — unduhan dari Ajak Main disertakan dalam pilih kegiatan
  const { publishedDownloads } = useLearningStrategies();

  const profilAnak = useMemo<ProfilAnak | null>(() => {
    if (!profile.tanggalLahir) return null;
    const tgl = new Date(profile.tanggalLahir);
    if (isNaN(tgl.getTime())) return null;
    return { tanggalLahir: tgl };
  }, [profile.tanggalLahir]);

  const statusTahap = useMemo(
    () => (profilAnak ? resolveTahapAktif(profilAnak, new Date()) : null),
    [profilAnak],
  );

  // ─── Edge cases ───────────────────────────────────────────────────────────

  if (profilAnak === null || statusTahap === null) {
    return (
      <LayarEdge isDev={isDev} sapaan={sapaan}>
        <h1 className="mb-2 font-bricolage text-[22px] font-bold text-pekat">
          {renderRichText(LAYAR_DATA_BELUM_DIISI.judul, sapaan)}
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          {renderRichText(LAYAR_DATA_BELUM_DIISI.badan, sapaan)}
        </p>
      </LayarEdge>
    );
  }

  if (statusTahap.status === 'belumLahir') {
    return (
      <LayarEdge isDev={isDev} sapaan={sapaan}>
        <h1 className="mb-2 font-bricolage text-[22px] font-bold text-pekat">
          {LAYAR_BELUM_LAHIR.judul}
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          {renderRichText(LAYAR_BELUM_LAHIR.badan, sapaan)}
        </p>
      </LayarEdge>
    );
  }

  if (statusTahap.status === 'melewatiRentang') {
    return (
      <LayarEdge isDev={isDev} sapaan={sapaan}>
        <h1 className="mb-2 font-bricolage text-[22px] font-bold text-pekat">
          {renderRichText(LAYAR_MELEWATI_RENTANG.judul, sapaan)}
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          {renderRichText(LAYAR_MELEWATI_RENTANG.badan, sapaan)}
        </p>
      </LayarEdge>
    );
  }

  if (statusTahap.status === 'kontenBelumSiap') {
    return (
      <LayarEdge isDev={isDev} sapaan={sapaan}>
        <h1 className="mb-2 font-bricolage text-[22px] font-bold text-pekat">
          {LAYAR_KONTEN_BELUM_SIAP.judul}
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          {renderRichText(LAYAR_KONTEN_BELUM_SIAP.badan, sapaan)}
        </p>
      </LayarEdge>
    );
  }

  // ─── Status 'ok' ──────────────────────────────────────────────────────────

  const { hasil } = statusTahap;
  const usiaBulanOk = usiaBulan ?? hasil.usiaBulan;

  const subTahapPopulated = bekalRakit
    .flatMap(b => b.subTahap)
    .find(st => st.id === hasil.subTahap.id);

  // Untuk band 0-1 tahun, perluas kolam ke semua sub tahap agar orang tua
  // bisa menjadwalkan kegiatan dari sub tahap lain melalui filter.
  // TODO: validasi klinis oleh Psikolog Fitri bahwa lintas sub tahap diizinkan
  const SUB_TAHAP_YEAR_ONE = ['b03', 'b36', 'b69', 'b912'];
  const isYearOneBand = usiaBulanOk < 12;
  const kolamBase: ItemBekal[] = isYearOneBand
    ? bekalRakit
        .flatMap(b => b.subTahap)
        .filter(st => SUB_TAHAP_YEAR_ONE.includes(st.id))
        .flatMap(st => st.kegiatan.map(item => ({ ...item, subTahapId: st.id })))
    : (subTahapPopulated?.kegiatan ?? []);

  const unduhAnak: ItemBekal[] = publishedDownloads
    .filter(d => d.minBulan <= usiaBulanOk && d.maxBulan > usiaBulanOk && (d.pemilik ?? 'anak') === 'anak')
    .map(d => ({
      id: `ls-dl-${d.id}`,
      judul: d.nama,
      tipe: 'unduhan' as const,
      domain: d.domain,
      nilai: [],
      tanpaTemaNilai: d.tanpaTemaNilai,
      pemilik: 'anak' as const,
      sumberId: `ls-dl-${d.id}`,
    }));

  const kolam: ItemBekal[] = [...kolamBase, ...unduhAnak];
  const kolamOrangTua = subTahapPopulated?.panduan ?? [];
  const maksItem = subTahapPopulated?.maksItemPerHari ?? hasil.subTahap.maksItemPerHari;
  // ID anak asli dari AnakContext. Dulu memakai nama anak sebagai kunci,
  // yang menabrakkan data dua anak dengan nama sama.
  const idAnak = anakAktif?.id ?? 'anak-default';
  const wizardBelumDiisi = nilaiFokus.length === 0;

  return (
    <article className="pt-5 text-pekat sm:pt-6">
      {isDev && (
        <div className="px-6 pt-3">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-[12px] font-semibold text-amber-800">
            {DRAF_BANNER}
          </span>
        </div>
      )}

      <HeroBanner sapaan={sapaan} usiaBulan={usiaBulanOk} />

      <StripKelola onBekal={onBekal} />

      <PilihanHarianProvider
        key={idAnak}
        idAnak={idAnak}
        kolam={kolam}
        kolamOrangTua={kolamOrangTua}
        usiaBulan={usiaBulanOk}
        nilaiFokus={nilaiFokus}
        katalogSikap={katalogSikap}
        maksItem={maksItem}
      >
        <IramaHariIsi
          sapaan={sapaan}
          wizardBelumDiisi={wizardBelumDiisi}
          namaAnak={profile.namaAnak}
          usiaBulan={usiaBulanOk}
          idAnak={idAnak}
          onPilihanChange={onPilihanChange}
          nilaiFokus={nilaiFokus}
          katalogSikap={katalogSikap}
          centangKebiasaan={centangKebiasaan}
          tanggalHariIni={tanggalHariIni}
          onCentangToggle={onCentangToggle}
          onBekal={onBekal}
        />
      </PilihanHarianProvider>
    </article>
  );
}

// ─── Domain color map (same as PilihanHariIni) ───────────────────────────────

const DOMAIN_STYLE_POPUP: Record<string, { bg: string; ink: string; label: string }> = {
  mh:  { bg: '#FCE3EE', ink: '#E0518F', label: 'Motorik Halus' },
  mk:  { bg: '#E4EFFD', ink: '#5F84E6', label: 'Motorik Kasar' },
  kog: { bg: '#F1ECFB', ink: '#8A6DC7', label: 'Kognitif' },
  bhs: { bg: '#FFF3D9', ink: '#C79020', label: 'Bahasa' },
  sos: { bg: '#E4EFFD', ink: '#5F84E6', label: 'Sosial' },
  sen: { bg: '#F1ECFB', ink: '#8A6DC7', label: 'Sensorik' },
};

const TIPE_LABEL: Record<string, string> = {
  aktivitas:   'Aktivitas',
  alatEdukasi: 'Alat Bermain',
  unduhan:     'Unduhan',
  panduan:     'Panduan',
};

// ─── KartuPilih ──────────────────────────────────────────────────────────────
// Didefinisikan DI LUAR PopupPilihKegiatan agar React tidak membuat tipe
// komponen baru di setiap render parent (yang menyebabkan unmount paksa).

function KartuPilih({ item }: { item: ItemBekal }) {
  const { pilihanEfektif, tambah, hapus } = usePilihanHarian();
  const sudahDipilih = pilihanEfektif.some(i => i.id === item.id);
  const ds = DOMAIN_STYLE_POPUP[item.domain] ?? { bg: '#F1ECFB', ink: '#8A6DC7', label: item.domain };

  return (
    <div
      className={[
        'flex flex-col gap-2 rounded-[18px] border p-3 transition',
        sudahDipilih ? 'border-daun/40 bg-daun/5' : 'border-mawar/20 bg-white',
      ].join(' ')}
    >
      <div
        className="flex h-14 items-center justify-center rounded-[12px]"
        style={{ background: ds.bg }}
      >
        <span className="font-nunito text-[10px] font-[800] uppercase tracking-wider" style={{ color: ds.ink }}>
          {ds.label}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <span className="rounded-full bg-kanvas px-2 py-0.5 font-nunito text-[10px] text-pekat/55">
          {TIPE_LABEL[item.tipe] ?? item.tipe}
        </span>
      </div>
      <p className="font-bricolage text-[12px] font-semibold leading-snug text-pekat">
        {item.judul}
      </p>
      {!!item.perkiraanDurasiMenit && item.perkiraanDurasiMenit > 0 && (
        <p className="text-[11px] text-pekat/45">{item.perkiraanDurasiMenit} mnt</p>
      )}
      <button
        type="button"
        onClick={() => sudahDipilih ? hapus(item.id) : tambah(item)}
        className={[
          'mt-auto flex w-full items-center justify-center gap-1.5 rounded-full py-1.5 font-nunito text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah',
          sudahDipilih
            ? 'bg-daun/10 text-daun hover:bg-daun/20'
            : 'bg-rekah/8 text-rekah hover:bg-rekah/15',
        ].join(' ')}
      >
        {sudahDipilih
          ? <><Check className="h-3.5 w-3.5" strokeWidth={3} /> Dijadwalkan</>
          : <><Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> Tambahkan</>
        }
      </button>
    </div>
  );
}

// ─── PopupPilihKegiatan ───────────────────────────────────────────────────────

export function PopupPilihKegiatan({ usiaBulan, onTutup }: { usiaBulan: number; onTutup: () => void }) {
  const { kolamAnak } = usePilihanHarian();
  const elRef = useRef<HTMLDivElement>(null);
  const isYearOne = usiaBulan < 12;
  const [subUsia, setSubUsia] = useState<IdSubUsia>(
    () => resolveSubUsia(usiaBulan),
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onTutup(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onTutup]);

  useEffect(() => { elRef.current?.focus(); }, []);

  const kolamFiltered = useMemo(() => {
    if (!isYearOne) return kolamAnak;
    return kolamAnak.filter(item => item.subTahapId === subUsia);
  }, [kolamAnak, isYearOne, subUsia]);

  const grouped = useMemo(() => {
    const aktivitas = kolamFiltered.filter(i => i.tipe === 'aktivitas');
    const alat      = kolamFiltered.filter(i => i.tipe === 'alatEdukasi');
    const unduhan   = kolamFiltered.filter(i => i.tipe === 'unduhan');
    return { aktivitas, alat, unduhan };
  }, [kolamFiltered]);

  const sections = [
    { label: 'Aktivitas', items: grouped.aktivitas },
    { label: 'Alat Bermain', items: grouped.alat },
    { label: 'Unduhan', items: grouped.unduhan },
  ].filter(s => s.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(110,59,87,0.28)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onTutup(); }}
    >
      <div
        ref={elRef}
        role="dialog"
        aria-modal="true"
        aria-label="Pilih kegiatan dari Ajak Main"
        tabIndex={-1}
        className="flex w-full max-w-lg flex-col rounded-t-[28px] bg-white shadow-[0_-8px_40px_rgba(110,59,87,0.18)] sm:max-h-[80vh] sm:rounded-[24px] sm:shadow-[0_8px_40px_rgba(110,59,87,0.18)] focus:outline-none"
        style={{ maxHeight: '88dvh' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-2">
          <div className="flex items-center justify-between pb-1">
            <div>
              <p className="font-bricolage text-[17px] font-bold text-pekat">Pilih kegiatan</p>
              <p className="text-[12px] text-pekat/50">dari koleksi Ajak Main</p>
            </div>
            <button
              type="button"
              aria-label="Tutup"
              onClick={onTutup}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[18px] text-pekat/40 hover:bg-mawar/20 hover:text-pekat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Filter sub tahap usia */}
          {isYearOne && (
            <FilterSubUsia nilai={subUsia} onPilih={setSubUsia} />
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {kolamFiltered.length === 0 ? (
            <p className="py-10 text-center text-[14px] text-pekat/45">
              Belum ada kegiatan tersedia untuk saat ini.
            </p>
          ) : (
            sections.map(sec => (
              <div key={sec.label} className="mb-5">
                <p className="mb-3 font-nunito text-[11px] font-[800] uppercase tracking-widest text-pekat/40">
                  {sec.label}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {sec.items.map(item => <KartuPilih key={item.id} item={item} />)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Konten dalam provider ────────────────────────────────────────────────────

interface PropsIramaHariIsi {
  sapaan: SapaanSet;
  wizardBelumDiisi: boolean;
  namaAnak?: string;
  usiaBulan: number;
  idAnak: string;
  onPilihanChange?: (pilihan: PilihanHarian, kolamAnak: readonly ItemBekal[]) => void;
  nilaiFokus: readonly NilaiAkar[];
  katalogSikap: readonly ItemSikap[];
  centangKebiasaan: CentangKebiasaan;
  tanggalHariIni: string;
  onCentangToggle: (nilaiId: NilaiAkar, butirId: string) => void;
  onBekal: () => void;
}

function IramaHariIsi({ sapaan, wizardBelumDiisi, namaAnak, usiaBulan, idAnak, onPilihanChange, nilaiFokus, katalogSikap, centangKebiasaan, tanggalHariIni, onCentangToggle, onBekal }: PropsIramaHariIsi) {
  const navigate = useNavigate();
  const { pilihanHarianRaw, kolamAnak } = usePilihanHarian();
  const [showTambahPopup, setShowTambahPopup] = useState(false);

  useEffect(() => {
    onPilihanChange?.(pilihanHarianRaw, kolamAnak);
  }, [pilihanHarianRaw, kolamAnak, onPilihanChange]);

  return (
    <div className="bg-kanvas">
      {/* Poin 1 — Fokus minggu ini: ide Ajak Main tersaring sesuai Current Focus */}
      <div className="px-6 pt-6 sm:px-10">
        <FokusMingguIni idAnak={idAnak} nilaiKeluarga={nilaiFokus} namaAnak={namaAnak ?? ''} usiaBulan={usiaBulan} />
      </div>

      {/* 2 kolom: Kegiatan + Jalur OT (kiri) | Susunan + Catatan (kanan) */}
      <div className="grid gap-6 px-6 pt-6 sm:px-10 lg:grid-cols-[1fr_1fr] lg:items-start">
        {/* Kolom kiri */}
        <div className="flex flex-col gap-6">
          <PilihanHariIni
            onLihatSemua={() => navigate('/dashboard/tier2/bekal?tab=ajak-main')}
            onTambah={() => setShowTambahPopup(true)}
          />
          <WawasanTumbuh usiaBulan={usiaBulan} idAnak={idAnak} />
        </div>

        {/* Kolom kanan */}
        <div className="flex flex-col gap-6">
          <SusunanHari />
          <CatatanHari namaAnak={namaAnak} />
        </div>
      </div>

      {/* Kebiasaan Baik — lebar penuh, paling bawah */}
      <div className="px-6 pt-6 pb-12 sm:px-10">
        <KartuKebiasaanBaik
          nilaiFokus={nilaiFokus}
          usiaBulan={usiaBulan}
          katalogSikap={katalogSikap}
          centangKebiasaan={centangKebiasaan}
          tanggalHariIni={tanggalHariIni}
          sapaan={sapaan}
          onCentangToggle={onCentangToggle}
          onBekal={onBekal}
        />
      </div>

      {showTambahPopup && (
        <PopupPilihKegiatan usiaBulan={usiaBulan} onTutup={() => setShowTambahPopup(false)} />
      )}
    </div>
  );
}

// ─── Layar edge case ──────────────────────────────────────────────────────────

function LayarEdge({
  isDev,
  sapaan,
  children,
}: {
  isDev: boolean;
  sapaan: SapaanSet;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-5 sm:pt-6">
      <HeroBanner sapaan={sapaan} usiaBulan={null} />
      <div className="px-6 py-10 text-pekat sm:px-10">
        {isDev && (
          <div className="mb-5">
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-[12px] font-semibold text-amber-800">
              {DRAF_BANNER}
            </span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
