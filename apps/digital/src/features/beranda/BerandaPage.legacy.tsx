import LoopPerjalanan from '../../components/LoopPerjalanan';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TemaniEntryCard from '../temani/TemaniEntryCard';
import BotanicalStem from '../../components/BotanicalStem'; // Rekah-native entry card accent (Phase 10C-7)
import { useAnakAktif } from '../../context/AnakContext';
import { useAkarStateSync } from '../../features/akar-keluarga/state';
import type { NilaiAkar } from '../../features/akar-keluarga/content';
import { useChildProfile } from '../../features/beranda-usia/useChildProfile';
import { resolveTahapAktif } from '../../features/beranda-usia/resolveTahap';
import type { ProfilAnak } from '../../features/beranda-usia/resolveTahap';
import { rakitBekal } from '../../features/beranda-usia/adapter/rakitBekal';
import type { ItemBekal } from '../../features/beranda-usia/bekal';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';
import { tanggalDariTimestampWIB } from '@studiva/shared';
import type { CentangKebiasaan } from '@studiva/shared';
import { getCentangKebiasaan } from '../../lib/supabase/rekah';
import IramaMingguan from '../../features/irama-hari/IramaMingguan';
import BungaKebiasaan from '../../features/irama-hari/BungaKebiasaan';
import BerandaHeader from '../../components/beranda/BerandaHeader';
import LangitHatiPanel from '../../components/beranda/LangitHatiPanel';
import SaranCarousel from '../../components/beranda/SaranCarousel';
import KebiasaanBaikCard from '../../components/beranda/KebiasaanBaikCard';
import WajarAtauCekCard from '../../components/beranda/WajarAtauCekCard';
import KonsultasiCard from '../../components/beranda/KonsultasiCard';
import SediaCard from '../../components/beranda/SediaCard';
import LapisanTahunPertama from '../../components/beranda/LapisanTahunPertama';
import PanenCard from '../../components/beranda/PanenCard';
import type { Cuaca, Kebiasaan, SaranItem } from '../../components/beranda/types';
import {
  MOCK_PERAN,
  MOCK_NAMA_ANAK,
  MOCK_USIA_TEKS,
  MOCK_INISIAL,
  MOCK_USIA_BULAN,
  MOCK_ADA_PASANGAN,
  MOCK_LANGIT_PASANGAN,
  MOCK_SEDIA,
  MOCK_JUMLAH_CATATAN_PANEN,
  MOCK_NILAI_DIPILIH,
  MOCK_KEBIASAAN,
  MOCK_SARAN,
  MOCK_WAJAR,
  MOCK_KONSULTASI,
  pilihNilaiMingguIni,
  ambilSaranAcak,
} from '../../content/beranda-mock';
import type { Waktu } from '../../content/beranda-copy';

// TODO: ambil peran, nama anak, usia, dan daftar nilai dari profil aktif
// TODO: ambil langit hati dan pasangan dari Supabase
// TODO: ambil saran dari konten minggu berjalan sesuai age band anak
// TODO: ambil wajar-atau-cek dari konten Ruang Teduh sesuai age band

function deteksiWaktu(): Waktu {
  const h = new Date().getHours();
  if (h < 11) return 'pagi';
  if (h < 18) return 'sore';
  return 'malam';
}

function getSeninMingguIni(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default function BerandaPage() {
  // ─── Data nyata untuk IramaMingguan ─────────────────────────────────────────
  const navigate = useNavigate();
  const { anak } = useAnakAktif();
  const idAnak = anak.id;
  const [akarState] = useAkarStateSync(idAnak);
  const nilaiFokus = akarState.nilai as NilaiAkar[];
  const { profile, usiaBulan: usiaBulanAnak } = useChildProfile();
  const { publishedDownloads } = useLearningStrategies();
  const tanggalHariIni = useMemo(() => tanggalDariTimestampWIB(new Date().toISOString()), []);
  const mulaiSenin = useMemo(() => getSeninMingguIni(), []);
  const [centangKebiasaan, setCentangKebiasaan] = useState<CentangKebiasaan>({});

  useEffect(() => {
    let batal = false;
    const sejak = new Date();
    sejak.setDate(sejak.getDate() - 14);
    const sejakTanggal = sejak.toISOString().slice(0, 10);
    void getCentangKebiasaan(idAnak, sejakTanggal)
      .then(hasil => { if (!batal) setCentangKebiasaan(hasil); })
      .catch(() => {});
    return () => { batal = true; };
  }, [idAnak]);

  const { bekal: bekalRakit } = useMemo(() => rakitBekal(), []);
  const kolam = useMemo<readonly ItemBekal[]>(() => {
    if (usiaBulanAnak === null) return [];
    const profilAnak: ProfilAnak | null = profile.tanggalLahir
      ? (() => { const tgl = new Date(profile.tanggalLahir); return isNaN(tgl.getTime()) ? null : { tanggalLahir: tgl }; })()
      : null;
    if (!profilAnak) return [];
    const statusTahap = resolveTahapAktif(profilAnak, new Date());
    if (!statusTahap || statusTahap.status !== 'ok') return [];
    const { hasil } = statusTahap;
    const usiaBulanOk = usiaBulanAnak ?? hasil.usiaBulan;
    const subTahapPopulated = bekalRakit.flatMap(b => b.subTahap).find(st => st.id === hasil.subTahap.id);
    const SUB_TAHAP_YEAR_ONE = ['b03', 'b36', 'b69', 'b912'];
    const isYearOneBand = usiaBulanOk < 12;
    const kolamBase: ItemBekal[] = isYearOneBand
      ? bekalRakit.flatMap(b => b.subTahap).filter(st => SUB_TAHAP_YEAR_ONE.includes(st.id)).flatMap(st => st.kegiatan.map(item => ({ ...item, subTahapId: st.id })))
      : (subTahapPopulated?.kegiatan ?? []);
    const unduhAnak: ItemBekal[] = publishedDownloads
      .filter(d => d.minBulan <= usiaBulanOk && d.maxBulan > usiaBulanOk && (d.pemilik ?? 'anak') === 'anak')
      .map(d => ({ id: `ls-dl-${d.id}`, judul: d.nama, tipe: 'unduhan' as const, domain: d.domain, nilai: [], tanpaTemaNilai: d.tanpaTemaNilai, pemilik: 'anak' as const, sumberId: `ls-dl-${d.id}` }));
    return [...kolamBase, ...unduhAnak];
  }, [usiaBulanAnak, profile.tanggalLahir, bekalRakit, publishedDownloads]);

  // ─── Waktu dan peran ────────────────────────────────────────────────────────
  const waktu = deteksiWaktu();
  const peran = MOCK_PERAN;
  const namaAnak = MOCK_NAMA_ANAK;
  const usiaTeks = MOCK_USIA_TEKS;
  const inisial = MOCK_INISIAL;
  const usiaBulan = MOCK_USIA_BULAN;

  // ─── Langit Hati ────────────────────────────────────────────────────────────
  const [langitSaya, setLangitSaya] = useState<Cuaca | null>(null);
  // TODO: ambil langitPasangan dari Supabase
  const langitPasangan = MOCK_LANGIT_PASANGAN;
  const adaPasangan = MOCK_ADA_PASANGAN;

  // ─── Saran carousel — acak SEKALI saat mount ────────────────────────────────
  const [slides, setSlides] = useState<SaranItem[]>(() => ambilSaranAcak(MOCK_SARAN));

  function handleAcakUlang() {
    setSlides(ambilSaranAcak(MOCK_SARAN));
  }

  // ─── Kebiasaan Baik — satu nilai saja (rotasi mingguan) ─────────────────────
  // TODO: ambil daftar nilai dari profil keluarga (useAkarStateSync)
  // TODO: pindahkan pilihNilaiMingguIni ke server agar konsisten lintas perangkat
  const nilaiMingguIni = pilihNilaiMingguIni(MOCK_NILAI_DIPILIH, new Date());
  const [kebiasaan, setKebiasaan] = useState<Kebiasaan[]>(MOCK_KEBIASAAN);

  function handleToggleKebiasaan(id: string) {
    setKebiasaan(prev =>
      prev.map(k => (k.id === id ? { ...k, tercatat: !k.tercatat } : k)),
    );
  }

  // ─── Data samping ────────────────────────────────────────────────────────────
  const sedia = MOCK_SEDIA;
  const jumlahPanen = MOCK_JUMLAH_CATATAN_PANEN;
  const tampilTahunPertama = usiaBulan < 12;
  const tampilPanen = jumlahPanen > 0;

  return (
    <div
      style={{ background: '#FCEBD7' }}
      className="-mx-5 sm:-mx-8 px-5 sm:px-[46px] pt-[34px] pb-12 min-h-screen"
    >
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <BerandaHeader
        peran={peran}
        waktu={waktu}
        namaAnak={namaAnak}
        usiaTeks={usiaTeks}
        inisial={inisial}
      />

      {/* ── Indikator loop perjalanan (siklus berputar) ── */}
      <LoopPerjalanan />

      {/* ── Bento grid ────────────────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.18fr]">

        {/* ===== KOLOM KIRI ===== */}
        <div className="flex flex-col gap-5">

          {/* Perjalanan hari ini — Family Journey additive entry point (Phase 10C-5, refined 10C-7 to
              match the Beranda's warm tinted card language instead of a plain bordered card). */}
          <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-fajar via-white to-white p-6 shadow-[0_10px_30px_-22px_rgba(90,50,70,0.5)]">
            <div aria-hidden className="pointer-events-none absolute -right-2 -top-1 h-24 w-16 opacity-60">
              <BotanicalStem cfg={{ type: 'sprig' }} />
            </div>
            <p className="font-shantell text-rekah text-lg">perjalanan hari ini</p>
            <p className="font-nunito text-pekat/80 mt-1 max-w-[82%]">Satu langkah kecil untuk hari ini bersama si kecil.</p>
            <Link
              to="journey"
              className="mt-4 inline-flex items-center rounded-[26px] bg-rekah px-6 py-3 min-h-[44px] font-nunito font-extrabold text-white shadow-[0_10px_20px_-10px_rgba(240,107,168,0.8)]"
            >
              Mulai
            </Link>
          </div>

          {/* Temani — entry kontekstual (Phase 14, Model C) */}
          <TemaniEntryCard />

          {/* 1. Ajakan Main hari ini (SaranCarousel) */}
          <SaranCarousel
            slides={slides}
            onJadwalkanHariIni={id => {
              // TODO: simpan jadwal ke Irama Hari
              void id;
            }}
            onJadwalkanNanti={id => {
              // TODO: simpan ke daftar simpan
              void id;
            }}
            onAcakUlang={handleAcakUlang}
          />

          {/* 2. Pita Kebiasaan */}
          <div
            style={{
              background: '#fff',
              borderRadius: 26,
              padding: '22px 26px 20px',
              boxShadow: '0 20px 46px -36px rgba(90,50,70,.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <p
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: '.6px',
                  textTransform: 'uppercase',
                  color: '#C88AAB',
                  margin: 0,
                }}
              >
                Pita Kebiasaan
              </p>
              <Link
                to="/dashboard/tier2/irama-hari"
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontWeight: 800,
                  fontSize: 13,
                  color: '#5F84E6',
                  textDecoration: 'none',
                }}
              >
                Semua ›
              </Link>
            </div>
            <div style={{ marginTop: 16 }}>
              <BungaKebiasaan
                nilaiFokus={nilaiFokus}
                centangKebiasaan={centangKebiasaan}
                mulaiSenin={mulaiSenin}
                tanggalHariIni={tanggalHariIni}
                onTanamNilai={() => navigate('/dashboard/tier2/irama-hari')}
                kompak
                noCard
              />
            </div>
          </div>

          {/* 3. Kebiasaan Baik Setiap Hari */}
          {nilaiMingguIni !== '' && (
            <KebiasaanBaikCard
              nilai={nilaiMingguIni}
              kebiasaan={kebiasaan}
              onToggle={handleToggleKebiasaan}
            />
          )}

          {/* 4. Ini Wajar atau Perlu Dicek */}
          <WajarAtauCekCard item={MOCK_WAJAR} />

          {/* 5. Langit Hati */}
          <LangitHatiPanel
            peranAktif={peran}
            langitSaya={langitSaya}
            langitPasangan={langitPasangan}
            adaPasangan={adaPasangan}
            onPilih={setLangitSaya}
          />
        </div>

        {/* ===== KOLOM KANAN ===== */}
        <div className="flex flex-col gap-5">

          {/* 1. Irama Hari (mingguan) */}
          <IramaMingguan
            idAnak={idAnak}
            tanggalHariIni={tanggalHariIni}
            kolam={kolam}
            nilaiFokus={nilaiFokus}
            centangKebiasaan={centangKebiasaan}
            namaAnak={anak.namaAnak}
            onBekalPress={() => navigate('/dashboard/tier2/bekal')}
          />

          {/* 2. Sedia */}
          {sedia !== null && <SediaCard sedia={sedia} />}

          {/* 3. Ruang Teduh / Konsultasi */}
          <KonsultasiCard
            nomorWhatsapp={MOCK_KONSULTASI.nomorWhatsapp}
            pesanAwal={MOCK_KONSULTASI.pesanAwal}
          />

          {/* 4. Lapisan Tahun Pertama — kondisional */}
          {tampilTahunPertama && <LapisanTahunPertama />}

          {/* 5. Panen — kondisional */}
          {tampilPanen && <PanenCard jumlahCatatan={jumlahPanen} />}
        </div>
      </div>

      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 12.5,
          color: '#C4A7B7',
          textAlign: 'center',
          margin: '28px 0 0',
          lineHeight: 1.5,
        }}
      >
        Rekah mendampingi Buku KIA, bukan menggantikannya.
      </p>
    </div>
  );
}
