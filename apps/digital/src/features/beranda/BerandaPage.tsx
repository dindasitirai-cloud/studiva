import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnakAktif } from '../../context/AnakContext';
import { useDashboardTier2 } from '../../context/DashboardTier2Context';
import { useAkarStateSync } from '../../features/akar-keluarga/state';
import type { NilaiAkar } from '../../features/akar-keluarga/content';
import { useChildProfile } from '../../features/beranda-usia/useChildProfile';
import { resolveTahapAktif } from '../../features/beranda-usia/resolveTahap';
import type { ProfilAnak } from '../../features/beranda-usia/resolveTahap';
import { rakitBekal } from '../../features/beranda-usia/adapter/rakitBekal';
import type { ItemBekal } from '../../features/beranda-usia/bekal';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';
import { formatUsia } from '../../types/anak';
import HeroGarden from './komponen/HeroGarden';
import RekomendasiArah from './komponen/RekomendasiArah';
import RencanaHariIni from './komponen/RencanaHariIni';
import ForumShortcut from './komponen/ForumShortcut';
import type { ForumPeek } from './komponen/ForumShortcut';
import KonsultasiOnlineCTA from './komponen/KonsultasiOnlineCTA';
import YangBaruDiRekah from './komponen/YangBaruDiRekah';
import PerjalananProgresCard from '../temani/PerjalananProgresCard';
import { plant, Tanaman } from './komponen/plant';
import type { SaranItem } from '../../components/beranda/types';
import { MOCK_PERAN, MOCK_NAMA_ANAK, MOCK_NILAI_DIPILIH, MOCK_SARAN, MOCK_KONSULTASI, pilihNilaiMingguIni } from '../../content/beranda-mock';
import { SAPAAN } from '../../content/beranda-copy';
import type { Waktu } from '../../content/beranda-copy';

// Beranda — desain design_handoff_beranda diterapkan (high-fidelity), memakai
// data/hook/rute yang sudah ada (profil anak, nilai fokus, Ajak Main/Wawasan sesuai
// usia, forum, WhatsApp konsultasi). Copy final dari handoff.
// Versi sebelumnya disimpan di BerandaPage.legacy.tsx (tidak dirute).

function deteksiWaktu(): Waktu {
  const h = new Date().getHours();
  if (h < 11) return 'pagi';
  if (h < 18) return 'sore';
  return 'malam';
}
function toSaran(k: ItemBekal, jenis: 'ajak_main' | 'wawasan_tumbuh'): SaranItem {
  return { id: k.id, jenis, judul: k.judul, ringkasan: k.deskripsiKustom ?? '', domain: '', nilai: k.nilai && k.nilai.length ? String(k.nilai[0]) : '', durasi: '', manfaat: '' };
}
function isiAtau(list: (string | undefined)[], seed: string[]): string[] {
  const v = list.filter(Boolean) as string[];
  return v.length ? v : seed;
}

export default function BerandaPage() {
  const navigate = useNavigate();
  const { anak } = useAnakAktif();
  const idAnak = anak.id;
  const { threads } = useDashboardTier2();
  const [akarState] = useAkarStateSync(idAnak);
  const nilaiFokus = akarState.nilai as NilaiAkar[];
  const { profile, usiaBulan } = useChildProfile();
  const { publishedDownloads } = useLearningStrategies();

  const peran = MOCK_PERAN;
  const waktu = deteksiWaktu();
  const sapaan = SAPAAN[peran][waktu];
  const namaAnak = anak.namaAnak || profile.namaAnak || MOCK_NAMA_ANAK;
  const usiaTeks = formatUsia(usiaBulan);
  const inisial = (namaAnak.replace(/\s+/g, '').slice(0, 2) || 'AA').toUpperCase();

  const nilaiList = nilaiFokus.length ? nilaiFokus.map(n => String(n)) : MOCK_NILAI_DIPILIH;
  const nilaiMingguIni = pilihNilaiMingguIni(nilaiList, new Date()) || 'Kemandirian';

  const { bekal: bekalRakit } = useMemo(() => rakitBekal(), []);
  const kolam = useMemo<readonly ItemBekal[]>(() => {
    if (usiaBulan === null) return [];
    const profilAnak: ProfilAnak | null = profile.tanggalLahir
      ? (() => { const tgl = new Date(profile.tanggalLahir as string); return isNaN(tgl.getTime()) ? null : { tanggalLahir: tgl }; })()
      : null;
    if (!profilAnak) return [];
    const statusTahap = resolveTahapAktif(profilAnak, new Date());
    if (!statusTahap || statusTahap.status !== 'ok') return [];
    const { hasil } = statusTahap;
    const usiaBulanOk = usiaBulan ?? hasil.usiaBulan;
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
  }, [usiaBulan, profile.tanggalLahir, bekalRakit, publishedDownloads]);

  const ajakReal = kolam.filter(k => k.tipe === 'aktivitas');
  const wawReal = kolam.filter(k => k.tipe !== 'aktivitas');
  const ajakList: SaranItem[] = ajakReal.length ? ajakReal.slice(0, 5).map(k => toSaran(k, 'ajak_main')) : MOCK_SARAN.filter(s => s.jenis === 'ajak_main');
  const wawasanList: SaranItem[] = wawReal.length ? wawReal.slice(0, 5).map(k => toSaran(k, 'wawasan_tumbuh')) : MOCK_SARAN.filter(s => s.jenis === 'wawasan_tumbuh');

  const kebiasaanJudul = `Kebiasaan baik untuk menumbuhkan ${nilaiMingguIni}`;

  // Rencana per slot: data nyata → seed handoff bila kosong. TODO(backend): status per-slot nyata.
  const rencanaItems = {
    pagi: isiAtau([kebiasaanJudul, ajakList[0]?.judul], ['Kebiasaan baik untuk menumbuhkan Syukur', 'Tummy Time Bertahap']),
    siang: isiAtau([ajakList[1]?.judul, wawasanList[0]?.judul, ajakList[2]?.judul], ['Main cermin bersama', 'Waktu makan tanpa drama', 'Pijat bayi sore']),
    malam: isiAtau([wawasanList[1]?.judul, ajakList[3]?.judul], ['Rutinitas tidur yang tenang', 'Cerita sebelum tidur']),
    dikelola: isiAtau([wawasanList[2]?.judul], ['Buku Kain Sensorik Bayi']),
  };
  const rencanaStatus = { pagi: '1 selesai', siang: '0 selesai', malam: '0 selesai', dikelola: 'Atur waktu' };

  const forumPeek: ForumPeek[] = threads
    .filter(t => t.privasi !== 'privat' && t.status === 'aktif')
    .slice(0, 2)
    .map(t => ({ title: t.title, balasan: t.replies.length, privasi: t.privasi, isSupportRequest: t.isSupportRequest }));

  const keBantu = () => navigate('/dashboard/tier2/bantu');

  return (
    <div style={{ background: '#FCEBD7' }} className="-mx-5 sm:-mx-8 px-5 sm:px-[38px] pt-[30px] pb-11 min-h-screen">
      <HeroGarden baris1={sapaan.baris1} baris2={sapaan.baris2} namaAnak={namaAnak} usiaTeks={usiaTeks} inisial={inisial} />

      {/* Untuk {anak} hari ini */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F06BA8', display: 'block' }} />
        <h2 style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 22, color: '#C6407F', margin: 0 }}>Untuk {namaAnak} hari ini</h2>
        <div style={{ flex: 1, height: 1.5, background: 'rgba(110,59,87,.1)' }} />
        <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#8A5A74' }}>sesuai usia &amp; nilai keluarga</span>
      </div>
      <div style={{ marginBottom: 30 }}>
        <RekomendasiArah ajakList={ajakList} wawasanList={wawasanList} onBaca={() => navigate('/dashboard/tier2/bekal')} />
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-1 gap-[22px] items-start lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-[22px] min-w-0">
          <RencanaHariIni items={rencanaItems} status={rencanaStatus} onBuka={() => navigate('/dashboard/tier2/kelola')} />
          <PerjalananProgresCard />
        </div>
        <div className="flex flex-col gap-[18px]">
          <ForumShortcut threads={forumPeek} onBuka={keBantu} onTulis={keBantu} onTanya={keBantu} />
          <KonsultasiOnlineCTA nomorWhatsapp={MOCK_KONSULTASI.nomorWhatsapp} pesanAwal={MOCK_KONSULTASI.pesanAwal} />
        </div>
      </div>

      <YangBaruDiRekah namaAnak={namaAnak} onOpenItem={(to) => navigate(to)} onBuka={() => navigate('/dashboard/tier2/bekal')} />

      {/* Footer quote */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '26px 0 0' }}>
        <Tanaman w="24px" h="36px" dur="10s" op={0.7} cfg={plant('daisy', { b: '#F8B9D4', b2: '#FFF3E6', c: '#FFE29A' })} />
        <div style={{ fontFamily: '"Shantell Sans", cursive', fontWeight: 600, fontSize: 15.5, color: '#B4477F', textAlign: 'center' }}>Semua saran bersifat lembut, bukan keharusan. Kamu yang paling mengenal anakmu.</div>
        <Tanaman w="24px" h="36px" dur="12s" op={0.7} cfg={plant('tulip', { b: '#C9B8F0', b2: '#EFE9FD' })} />
      </div>
    </div>
  );
}
