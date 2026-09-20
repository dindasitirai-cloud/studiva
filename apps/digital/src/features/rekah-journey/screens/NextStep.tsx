// Rekah Journey — Next Step / Adapt (S6). Phase 10E-4: routes to the correct next screen based on the
// FROZEN adaptation outcome (system-derived or parent-selected). No decision here — the engine already
// chose the outcome; this only navigates to the matching next stage. Reversible where system-inferred.
import { useNavigate } from 'react-router-dom';
import { useJourney } from '../useJourney';
import { JourneyShell, Card, Btn, Botanical } from '../ui/brand';
import type { AdaptationOutcome } from '@studiva/shared/journey';

const HOME = '/dashboard/tier2/journey';
// Map the engine's adaptation outcome → the next screen (pure routing over the engine's decision).
function nextRoute(outcome: AdaptationOutcome): string {
  switch (outcome) {
    case 'REPEAT': case 'SIMPLIFY': case 'CHANGE_APPROACH': return '../do';   // try again, adapted
    case 'CHANGE_FOCUS': case 'EXPLORE_DEEPER': return '../focus';            // re-choose focus
    case 'PAUSE': return '../paused';
    case 'CONTINUE': case 'EXIT': default: return HOME;                       // rest / back to today
  }
}

export default function NextStep() {
  const { view, childName } = useJourney();
  const nav = useNavigate();
  if (!view) return <JourneyShell child={childName} />;

  const isAdapt = view.kind === 'ADAPT';
  const to = isAdapt ? nextRoute(view.outcome) : HOME;

  return (
    <JourneyShell child={childName} eyebrow="langkah berikutnya" botanical="foliage">
      <Card className="mt-3">
        <div className="flex items-center gap-3">
          <div className="w-12 shrink-0"><Botanical type="fivepetal" size={40} sway={false} /></div>
          <h1 className="font-fredoka font-bold text-xl text-pekat">{isAdapt ? view.copy.title : 'Kita lanjutkan pelan-pelan.'}</h1>
        </div>
        <Btn full className="mt-6" onClick={() => nav(to)}>{isAdapt ? view.copy.primaryCta : 'Oke, lanjutkan'}</Btn>
        {isAdapt && view.undoable && <Btn variant="ghost" className="mt-2" onClick={() => nav(HOME)}>Urungkan</Btn>}
      </Card>
    </JourneyShell>
  );
}
