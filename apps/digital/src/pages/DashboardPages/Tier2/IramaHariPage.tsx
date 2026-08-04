import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import type { OnboardingData } from '../../../features/onboarding/types';
import { useAkarStateSync } from '../../../features/akar-keluarga/state';
import type { NilaiAkar } from '../../../features/akar-keluarga/content';
import IramaHari from '../../../features/irama-hari/IramaHari';
import IramaMingguan from '../../../features/irama-hari/IramaMingguan';
import type { PilihanHarian } from '../../../features/irama-hari/PilihanHarianContext';
import type { ItemBekal } from '../../../features/beranda-usia/bekal';
import { tanggalDariTimestampWIB, toggleCentang } from '@studiva/shared';
import type { CentangKebiasaan } from '@studiva/shared';

interface OutletCtx {
  onboardingData: OnboardingData;
  idAnak: string | null;
}

type TabId = 'hari-ini' | 'mingguan';

// TODO: review Fitri — label tab
const LABEL_TAB: Record<TabId, string> = {
  'hari-ini': 'Hari Ini',
  'mingguan': 'Minggu Ini',
};

export interface JadwalManualItem {
  id: string;
  judul: string;
  tipe: 'kegiatan' | 'buku';
  warnaCover?: string;
}

export default function IramaHariPage() {
  const { onboardingData: d, idAnak } = useOutletContext<OutletCtx>();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<TabId>('hari-ini');
  const [akarState] = useAkarStateSync(idAnak);
  const [pilihanHariIni, setPilihanHariIni] = useState<PilihanHarian | undefined>(undefined);
  const [kolamAnak, setKolamAnak] = useState<readonly ItemBekal[]>([]);
  const [centangKebiasaan, setCentangKebiasaan] = useState<CentangKebiasaan>({});
  const [jadwalManual, setJadwalManual] = useState<Record<string, JadwalManualItem[]>>({});
  const jadwalProcessedRef = useRef<string | null>(null);

  const tanggalHariIni = useMemo(() => tanggalDariTimestampWIB(new Date().toISOString()), []);
  const nilaiFokus = akarState.nilai as NilaiAkar[];

  // Baca item yang dijadwalkan dari navigasi Bekal → IramaHari
  useEffect(() => {
    const j = (location.state as { jadwalkan?: JadwalManualItem & { tanggal: string } } | null)?.jadwalkan;
    if (!j) return;
    const kunci = `${j.id}:${j.tanggal}`;
    if (jadwalProcessedRef.current === kunci) return;
    jadwalProcessedRef.current = kunci;
    setJadwalManual(prev => {
      const daftar = prev[j.tanggal] ?? [];
      if (daftar.some(d => d.id === j.id)) return prev;
      const { tanggal: _t, ...item } = j;
      return { ...prev, [j.tanggal]: [...daftar, item] };
    });
    setTab('mingguan');
  }, [location.state]);

  const handleCentangToggle = useCallback(
    (nilaiId: NilaiAkar, butirId: string) => {
      setCentangKebiasaan(prev => toggleCentang(prev, nilaiId, butirId, tanggalHariIni));
      // TODO: simpan ke backend
    },
    [tanggalHariIni],
  );

  const handlePilihanChange = useCallback(
    (pilihan: PilihanHarian, kolam: readonly ItemBekal[]) => {
      setPilihanHariIni(pilihan);
      setKolamAnak(kolam);
    },
    [],
  );

  const TAB_IDS: TabId[] = ['hari-ini', 'mingguan'];

  return (
    <div>
      {/* Tab switcher */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '16px 0 4px',
        }}
      >
        {TAB_IDS.map(id => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            style={{
              background: tab === id ? '#6E3B57' : '#fff',
              color: tab === id ? '#fff' : '#6E3B57',
              border: '1.5px solid #B98FAD',
              borderRadius: 999,
              padding: '7px 20px',
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 160ms ease, color 160ms ease',
            }}
          >
            {LABEL_TAB[id]}
          </button>
        ))}
      </div>

      {/* IramaHari — selalu terpasang; display:none menjaga PilihanHarianProvider tetap hidup */}
      <div style={{ display: tab === 'hari-ini' ? 'block' : 'none' }}>
        <IramaHari
          nilaiFokus={nilaiFokus}
          namaAnak={d.namaAnak}
          tanggalLahir={d.tanggalLahir}
          onPilihanChange={handlePilihanChange}
          centangKebiasaan={centangKebiasaan}
          tanggalHariIni={tanggalHariIni}
          onCentangToggle={handleCentangToggle}
          onBekal={() => navigate('/dashboard/tier2/bekal')}
        />
      </div>

      {/* IramaMingguan — selalu terpasang */}
      <div style={{ display: tab === 'mingguan' ? 'block' : 'none', padding: '20px 0' }}>
        <IramaMingguan
          idAnak={idAnak ?? 'anak-default'}
          tanggalHariIni={tanggalHariIni}
          kolam={kolamAnak}
          nilaiFokus={nilaiFokus}
          pilihanHariIni={pilihanHariIni}
          jadwalManual={jadwalManual}
          namaAnak={d.namaAnak}
          onBekalPress={() => navigate('/dashboard/tier2/bekal')}
        />
      </div>
    </div>
  );
}
