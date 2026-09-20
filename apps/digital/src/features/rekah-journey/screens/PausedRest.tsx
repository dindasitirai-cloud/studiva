// Rekah Journey — Paused / Rest (S11). Calm, reversible; resume returns to the stored state (Phase 10C-3).
import { useNavigate } from 'react-router-dom';
import { useJourney } from '../useJourney';
import { JourneyShell, EmptyState } from '../ui/brand';

export default function PausedRest() {
  const { advance, childName } = useJourney();
  const nav = useNavigate();
  const resume = () => { advance({ trigger: 'RESUME' }); nav('/dashboard/tier2/journey'); };
  return (
    <JourneyShell child={childName} eyebrow="tidak apa-apa untuk berhenti sejenak">
      <EmptyState botanical="leaf" title="Perjalanan dijeda" body="Lanjutkan kapan pun kamu siap. Semuanya tersimpan di tempat terakhir." cta="Lanjutkan" onCta={resume} />
    </JourneyShell>
  );
}
