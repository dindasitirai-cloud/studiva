// Rekah Journey — Add/Edit Child (S9). Reuses the existing WizardAnak flow via AnakContext (Phase 10C-3).
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnak } from '../../../context/AnakContext';
import { JourneyShell, EmptyState } from '../ui/brand';

export default function AddEditChild() {
  const { mintaTambahAnak } = useAnak();
  const nav = useNavigate();
  useEffect(() => { mintaTambahAnak(); }, [mintaTambahAnak]); // opens the existing wizard (no duplicate form)
  return <JourneyShell><EmptyState botanical="daisy" title="Menambahkan si kecil" body="Kami membuka formulir singkat untuk mengenal anakmu." cta="Kembali ke perjalanan" onCta={() => nav('/dashboard/tier2/journey')} /></JourneyShell>;
}
