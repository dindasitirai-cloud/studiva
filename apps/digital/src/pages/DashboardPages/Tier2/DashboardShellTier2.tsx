import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RekahErrorBanner from '../../../components/RekahErrorBanner';
import OnboardingFlow from '../../../features/onboarding/OnboardingFlow';
import type { OnboardingData } from '../../../features/onboarding/types';
import SidebarRekah from '../../../components/SidebarRekah';
import HeaderMobileRekah from '../../../components/HeaderMobileRekah';
import NavigasiBawah from '../../../components/NavigasiBawah';
import { getAnakList, upsertAnak } from '../../../lib/supabase/rekah';
import { hitungBand } from '../../../lib/band';

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
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [idAnak, setIdAnak] = useState<string | null>(null);
  const [loadingAnak, setLoadingAnak] = useState(true);
  const { supabaseUser } = useAuth();

  // Muat data anak dari Supabase saat mount — hindari flash layar onboarding bagi pengguna lama.
  const muatAnak = useCallback(async () => {
    if (!supabaseUser) { setLoadingAnak(false); return; }
    try {
      const daftar = await getAnakList();
      if (daftar.length > 0) {
        const anak = daftar[0];
        const { band, diLuarRentang } = hitungBand(new Date(anak.tanggal_lahir));
        setIdAnak(anak.id);
        setOnboardingData({
          namaAnak: anak.nama_anak,
          tanggalLahir: anak.tanggal_lahir,
          band,
          diLuarRentang,
          // Nilai/fokus/tanah/visi dimuat oleh AkarKeluargaContext secara terpisah.
          nilai: [],
          fokus: [],
          tanah: [],
          visi: '',
        });
      }
    } catch {
      // Gagal muat anak — tampilkan onboarding agar pengguna bisa mengisi ulang.
    } finally {
      setLoadingAnak(false);
    }
  }, [supabaseUser]);

  useEffect(() => { muatAnak(); }, [muatAnak]);

  async function handleSelesai(data: OnboardingData) {
    // Simpan anak ke Supabase sebelum masuk ke dashboard.
    if (supabaseUser) {
      try {
        const baris = await upsertAnak({
          namaAnak: data.namaAnak,
          tanggalLahir: data.tanggalLahir,
        });
        setIdAnak(baris.id);
      } catch {
        // Tidak blokir masuk dashboard bila sinkronisasi gagal.
      }
    }
    setOnboardingData(data);
  }

  if (loadingAnak) {
    return (
      <Tier2Guard>
        <div className="flex h-48 items-center justify-center text-pekat/50">Memuat...</div>
      </Tier2Guard>
    );
  }

  if (!onboardingData) {
    return (
      <Tier2Guard>
        <OnboardingFlow onSelesai={handleSelesai} />
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

          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 pb-[80px] lg:pb-0">
              <Outlet context={{ onboardingData, idAnak }} />
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
