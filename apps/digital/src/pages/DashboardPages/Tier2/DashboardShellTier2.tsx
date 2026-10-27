// ============================================================================
// DashboardShellTier2 — gerbang dashboard Rekah.
//
// Urutan gerbang:
//   1. memuat            → penanda muat
//   2. belum punya anak   → WizardAnak (mode "pertama")
//   3. sedang menambah    → WizardAnak (mode "tambah")
//   4. belum pilih anak   → PilihAnak
//   5. sudah pilih        → dashboard
//
// Shell TIDAK LAGI mengoper data anak lewat outlet context. Setiap layar
// mengambil sendiri dari useAnakAktif(), sehingga hanya ada satu sumber data.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useAnak } from '../../../context/AnakContext';
import RekahErrorBanner from '../../../components/RekahErrorBanner';
import WizardAnak from '../../../features/wizard-anak/WizardAnak';
import PilihAnak from '../../../features/pilih-anak/PilihAnak';
import SidebarRekah from '../../../components/SidebarRekah';
import HeaderMobileRekah from '../../../components/HeaderMobileRekah';
import NavigasiBawah from '../../../components/NavigasiBawah';
import { pasangSinkronKelola, pulihkanSimpananKelola } from '../../../lib/simpananKelola';

// Rencana mingguan & papan harian Kelola ikut tersimpan di akun (migration 035).
pasangSinkronKelola();

// Guard: tier2 users only
function Tier2Guard({ children }: { children: React.ReactNode }) {
  const { tier, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && tier && tier !== 'tier2') {
      navigate(tier === 'tier1' ? '/dashboard/tier1' : '/dashboard/parent', { replace: true });
    }
  }, [tier, loading, navigate]);

  if (loading || !tier) {
    return <div className="flex h-48 items-center justify-center text-pekat/50">Memuat dashboard...</div>;
  }

  return <>{children}</>;
}

export default function DashboardShellTier2() {
  const [melipat, setMelipat] = useState(false);
  // sedangTambahAnak pindah ke AnakContext supaya layar mana pun bisa
  // memintanya — bukan hanya PilihAnak, yang dilewati saat anaknya satu.
  const {
    daftarAnak, anakAktif, memuat,
    sedangTambahAnak, mintaTambahAnak, batalTambahAnak,
  } = useAnak();

  // Sebelum layar anak tampil, satukan rencana Kelola di akun & perangkat supaya
  // yang dibaca halaman sudah versi terbaru. Paling lama 3 detik (offline tetap jalan).
  const idAktif = anakAktif?.id ?? null;
  const [pulihUntuk, setPulihUntuk] = useState<string | null>(null);
  useEffect(() => {
    if (!idAktif) return;
    let batal = false;
    Promise.race([pulihkanSimpananKelola(idAktif), new Promise(r => setTimeout(r, 3000))])
      .then(() => { if (!batal) setPulihUntuk(idAktif); });
    return () => { batal = true; };
  }, [idAktif]);

  if (memuat) {
    return (
      <Tier2Guard>
        <div className="flex h-48 items-center justify-center text-pekat/50">Memuat...</div>
      </Tier2Guard>
    );
  }

  // Akun baru: belum ada anak sama sekali.
  if (daftarAnak.length === 0) {
    return (
      <Tier2Guard>
        <WizardAnak mode="pertama" />
      </Tier2Guard>
    );
  }

  // Menambah anak dari layar Pilih Anak.
  if (sedangTambahAnak) {
    return (
      <Tier2Guard>
        <WizardAnak
          mode="tambah"
          onSelesai={batalTambahAnak}
          onBatal={batalTambahAnak}
        />
      </Tier2Guard>
    );
  }

  // Punya anak tapi belum memilih yang mana.
  if (!anakAktif) {
    return (
      <Tier2Guard>
        <PilihAnak onTambahAnak={mintaTambahAnak} />
      </Tier2Guard>
    );
  }

  if (pulihUntuk !== anakAktif.id) {
    return (
      <Tier2Guard>
        <div className="flex h-48 items-center justify-center text-pekat/50">Memuat...</div>
      </Tier2Guard>
    );
  }

  return (
    <Tier2Guard>
      <div className="flex min-h-screen bg-kanvas">
        {/* Desktop: sidebar animasi */}
        <div className="hidden lg:block">
          <SidebarRekah melipat={melipat} onToggle={() => setMelipat(m => !m)} />
        </div>

        {/* Area konten utama */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Mobile: header atas dengan logo + avatar */}
          <HeaderMobileRekah />

          {/* relative + overflow-x-clip: hiasan halaman (mis. lingkaran di pojok Langganan) bisa
              menempel ke tepi kanan area konten di layar lebar tanpa memicu scroll horizontal. */}
          <main className="relative flex-1 overflow-x-clip">
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 pb-[80px] lg:pb-0">
              {/*
                Remount seluruh subtree saat anak aktif berganti. Tanpa ini,
                state lokal layar (pilihan harian, tab, kolam kegiatan) akan
                terbawa dari anak sebelumnya.
              */}
              <Outlet key={anakAktif.id} />
            </div>
          </main>
        </div>

        {/* Mobile: navigasi bawah */}
        <NavigasiBawah />
      </div>

      <RekahErrorBanner />
    </Tier2Guard>
  );
}
