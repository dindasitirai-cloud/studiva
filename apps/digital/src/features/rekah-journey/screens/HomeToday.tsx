// Rekah Journey — Home / Today (S1). Brand-native (Phase 10C-3). Journey orientation, not a dashboard.
import { useNavigate } from 'react-router-dom';
import { useJourney, useEnter } from '../useJourney';
import { useAnak } from '../../../context/AnakContext';
import { JourneyShell, Card, Btn, EmptyState, Botanical } from '../ui/brand';

export default function HomeToday() {
  const { view, phase, advance, childName, dataReady } = useJourney();
  const { lepasAnakAktif } = useAnak(); // existing Rekah child picker (no duplicate switcher)
  const nav = useNavigate();
  useEnter(advance, { trigger: 'FOUNDATION_SET' }, dataReady);

  if (phase === 'AUTH_REQUIRED') return <JourneyShell><EmptyState botanical="daisy" title="Masuk dulu, ya" body="Silakan masuk untuk melanjutkan perjalanan keluargamu." cta="Masuk" onCta={() => nav('/login')} /></JourneyShell>;
  if (!view) return <JourneyShell><div className="flex flex-col items-center py-12"><Botanical type="daisy" size={72} /><p className="mt-3 font-nunito text-pekat/70">Menyiapkan hari ini…</p></div></JourneyShell>;

  return (
    <JourneyShell child={childName} eyebrow="hari ini" botanical="sprig">
      {view.kind === 'READY' && (
        <Card className="mt-3">
          <h1 className="font-fredoka font-bold text-2xl text-pekat leading-snug">{view.whereWeAre}</h1>
          <Btn full className="mt-6" onClick={() => nav('focus')}>{view.copy.primaryCta}</Btn>
          <Btn variant="ghost" full className="mt-2" onClick={() => nav('observe')}>Ceritakan yang Ibu lihat →</Btn>
          <div className="mt-3 flex justify-between">
            <Btn variant="ghost" onClick={() => lepasAnakAktif()}>Ganti anak</Btn>
            <Btn variant="ghost" onClick={() => advance({ trigger: 'PAUSE' })}>Jeda sejenak</Btn>
          </div>
        </Card>
      )}
      {view.kind === 'NO_FOCUS' && <EmptyState botanical="daisy" title={view.copy.title} body={view.copy.body} cta={view.copy.primaryCta} onCta={() => { /* rest */ }} secondary="Pilih sendiri" onSecondary={() => nav('focus')} />}
      {view.kind === 'PAUSED' && <EmptyState botanical="leaf" title={view.copy.title} body={view.copy.body} cta={view.copy.primaryCta} onCta={() => advance({ trigger: 'RESUME' })} />}
      {view.kind === 'CONFLICT' && <EmptyState botanical="sprig" title={view.copy.title} body={view.copy.body} cta={view.copy.primaryCta} onCta={() => advance({ trigger: 'FOUNDATION_SET' })} />}
      {(view.kind === 'NO_MATCH' || view.kind === 'UNAVAILABLE' || view.kind === 'INSUFFICIENT_CONTEXT') && <EmptyState botanical="sprig" title={view.copy.title} body={view.copy.body} cta={view.copy.primaryCta} onCta={() => nav('/dashboard/tier2/journey')} />}
    </JourneyShell>
  );
}
