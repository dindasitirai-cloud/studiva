import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnakAktif } from '../../context/AnakContext';
import { useDashboardTier2 } from '../../context/DashboardTier2Context';
import { useAkarStateSync } from '../../features/akar-keluarga/state';
import type { NilaiAkar } from '../../features/akar-keluarga/content';
import { useChildProfile } from '../../features/beranda-usia/useChildProfile';
import { usePetaStore, useKehidupanStore } from '../irama-hari/kehidupanData';
import { useInboxStore } from '../irama-hari/inboxData';
import { formatUsia } from '../../types/anak';
import HeroGarden from './komponen/HeroGarden';
import RencanaHariIni from './komponen/RencanaHariIni';
import { UntukmuHariIni } from '../irama-hari/KehidupanKeluarga';
import ForumShortcut from './komponen/ForumShortcut';
import type { ForumPeek } from './komponen/ForumShortcut';
import KonsultasiOnlineCTA from './komponen/KonsultasiOnlineCTA';
import YangBaruDiRekah from './komponen/YangBaruDiRekah';
import PerjalananProgresCard from '../temani/PerjalananProgresCard';
import { plant, Tanaman } from './komponen/plant';
import { MOCK_PERAN, MOCK_NAMA_ANAK, MOCK_KONSULTASI } from '../../content/beranda-mock';
import { useRingkasanPapanHari } from '../irama-hari/ringkasanPapanHari';
import { localISO } from '../irama-hari/rencanaData';
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
export default function BerandaPage() {
  const navigate = useNavigate();
  const { anak } = useAnakAktif();
  const idAnak = anak.id;
  const { threads } = useDashboardTier2();
  const [akarState] = useAkarStateSync(idAnak);
  const nilaiFokus = akarState.nilai as NilaiAkar[];
  const { profile, usiaBulan } = useChildProfile();
  const peta = usePetaStore(idAnak);
  const { aktif } = useKehidupanStore(idAnak);
  const inbox = useInboxStore(idAnak);

  const peran = MOCK_PERAN;
  const waktu = deteksiWaktu();
  const sapaan = SAPAAN[peran][waktu];
  const namaAnak = anak.namaAnak || profile.namaAnak || MOCK_NAMA_ANAK;
  const usiaTeks = formatUsia(usiaBulan);
  const inisial = (namaAnak.replace(/\s+/g, '').slice(0, 2) || 'AA').toUpperCase();

  // Rencana hari ini = ringkasan papan Kelola hari ini (Phase 21E) — isi & status sama
  // dengan Irama Keseharian: kebiasaan rutin, tambahanmu, saran Rekah (Ajak Main · Wawasan
  // Tumbuh · Temani), dan Untuk dikelola. Tanpa seed tiruan & tanpa status palsu.
  const papan = useRingkasanPapanHari(idAnak, localISO(new Date()), nilaiFokus);

  const forumPeek: ForumPeek[] = threads
    .filter(t => t.privasi !== 'privat' && t.status === 'aktif')
    .slice(0, 2)
    .map(t => ({ title: t.title, balasan: t.replies.length, privasi: t.privasi, isSupportRequest: t.isSupportRequest }));

  const keBantu = () => navigate('/dashboard/tier2/bantu');

  return (
    <div style={{ background: '#FFF3E6' }} className="-mx-5 sm:-mx-8 px-5 sm:px-[38px] pt-[30px] pb-11 min-h-screen">
      <HeroGarden baris1={sapaan.baris1} baris2={sapaan.baris2} namaAnak={namaAnak} usiaTeks={usiaTeks} inisial={inisial} />

      {/* Baris 1: Rencana hari ini + Fondasi/Rekomendasi (berdampingan) */}
      <div className="grid grid-cols-1 gap-[22px] items-stretch xl:grid-cols-[minmax(0,1fr)_360px]">
        <RencanaHariIni items={papan.items} status={papan.status} onBuka={() => navigate('/dashboard/tier2/kelola')} />
        <UntukmuHariIni idAnak={idAnak} nama={namaAnak} usiaBulan={usiaBulan ?? null} tanggalLahir={profile.tanggalLahir} peta={peta} aktif={aktif} inbox={inbox} onKeInbox={() => navigate('/dashboard/tier2/kelola')} onBuka={(to) => navigate(to)} />
      </div>

      {/* Baris 2: Progres Perjalanan + Forum (tanya jawab) + Konseling Online, berjejer */}
      <div className="grid grid-cols-1 gap-[22px] items-start mt-[22px] lg:grid-cols-3">
        <PerjalananProgresCard />
        <ForumShortcut threads={forumPeek} onBuka={keBantu} onTulis={keBantu} onTanya={keBantu} />
        <KonsultasiOnlineCTA nomorWhatsapp={MOCK_KONSULTASI.nomorWhatsapp} pesanAwal={MOCK_KONSULTASI.pesanAwal} />
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
