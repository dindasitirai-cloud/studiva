import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAnakAktif } from '../../../context/AnakContext';
import Bekal from '../../../features/bekal/Bekal';
import type { TabId } from '../../../features/bekal/Bekal';
import { useAkarStateSync } from '../../../features/akar-keluarga/state';
import type { NilaiAkar } from '../../../features/akar-keluarga/content';

function parseTabParam(value: string | null): TabId {
  if (value === 'ajak-main') return 'ajak-main';
  if (value === 'wawasan-tumbuh') return 'wawasan-tumbuh';
  return 'kebiasaan-baik';
}

export default function BekalPage() {
  // Anak aktif dari AnakContext, sumber tunggal data anak.
  const { anak } = useAnakAktif();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabAwal = parseTabParam(searchParams.get('tab'));

  const [akarState, akarDispatch] = useAkarStateSync(anak.id);

  function handleTanam(nilai: NilaiAkar) {
    akarDispatch({ type: 'TANAM_NILAI', nilai });
    navigate('/dashboard/tier2/irama-hari');
  }

  function handleCabut(nilai: NilaiAkar) {
    akarDispatch({ type: 'CABUT_NILAI', nilai });
  }

  return (
    <Bekal
      nilaiFokus={akarState.nilai as NilaiAkar[]}
      onTanamNilai={handleTanam}
      onCabutNilai={handleCabut}
      tabAwal={tabAwal}
    />
  );
}
