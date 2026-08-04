import React from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import type { OnboardingData } from '../../../features/onboarding/types';
import Bekal from '../../../features/bekal/Bekal';
import type { TabId } from '../../../features/bekal/Bekal';
import { useAkarStateSync } from '../../../features/akar-keluarga/state';
import type { NilaiAkar } from '../../../features/akar-keluarga/content';

interface OutletCtx {
  onboardingData: OnboardingData;
  idAnak: string | null;
}

function parseTabParam(value: string | null): TabId {
  if (value === 'ajak-main') return 'ajak-main';
  if (value === 'wawasan-tumbuh') return 'wawasan-tumbuh';
  return 'kebiasaan-baik';
}

export default function BekalPage() {
  const { onboardingData: d, idAnak } = useOutletContext<OutletCtx>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabAwal = parseTabParam(searchParams.get('tab'));

  const [akarState, akarDispatch] = useAkarStateSync(idAnak);

  function handleTanam(nilai: NilaiAkar) {
    akarDispatch({ type: 'TANAM_NILAI', nilai });
    // TODO: kirim konfirmasi tanam ke backend
    navigate('/dashboard/tier2/irama-hari');
  }

  return (
    <Bekal
      nilaiFokus={akarState.nilai as NilaiAkar[]}
      onTanamNilai={handleTanam}
      tabAwal={tabAwal}
      namaAnak={d.namaAnak}
      tanggalLahir={d.tanggalLahir}
    />
  );
}
