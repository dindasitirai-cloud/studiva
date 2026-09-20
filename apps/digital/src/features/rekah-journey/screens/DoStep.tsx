// Rekah Journey — Do (S4). One small action; AM age-gap fallback stays HONEST (Phase 10C-3).
import { useNavigate } from 'react-router-dom';
import { useJourney } from '../useJourney';
import { JourneyShell, Card, Btn, EmptyState } from '../ui/brand';

export default function DoStep() {
  const { view, advance, childName } = useJourney();
  const nav = useNavigate();
  if (!view) return <JourneyShell child={childName} />;
  const done = () => { advance({ trigger: 'ACTED' }); nav('../reflect'); };

  return (
    <JourneyShell child={childName} eyebrow="langkah kecil hari ini" botanical="tulip">
      {view.kind === 'READY' && view.step && (
        <Card className="mt-3">
          <h1 className="font-fredoka font-bold text-xl text-pekat">Satu hal kecil untuk dicoba</h1>
          <p className="mt-2 font-nunito text-pekat/70 text-sm">Bisa dilakukan di momen sehari-hari.</p>
          <Btn full className="mt-6" onClick={done}>Kami melakukannya</Btn>
          <div className="mt-2 flex justify-between">
            <Btn variant="ghost" onClick={() => advance({ trigger: 'SKIP' })}>Nanti saja</Btn>
            <Btn variant="ghost" onClick={() => advance({ trigger: 'PAUSE' })}>Terlalu banyak hari ini</Btn>
          </div>
        </Card>
      )}
      {view.kind === 'FALLBACK' && (
        <Card className="mt-3">
          {/* HONEST fallback: a gentle habit, clearly not an activity */}
          <span className="inline-block rounded-full border-2 border-dashed border-ungu px-3 py-1 text-xs font-nunito font-bold text-pekat">Kebiasaan lembut</span>
          <h1 className="font-fredoka font-bold text-xl text-pekat mt-3">{view.copy.title}</h1>
          <p className="mt-2 font-nunito text-pekat/80">{view.copy.body}</p>
          <Btn full className="mt-6" onClick={done}>{view.copy.primaryCta}</Btn>
          <Btn variant="ghost" className="mt-2" onClick={() => advance({ trigger: 'SKIP' })}>Lewati</Btn>
        </Card>
      )}
      {(view.kind === 'NO_MATCH' || view.kind === 'UNAVAILABLE') && <EmptyState botanical="sprig" title={view.copy.title} body={view.copy.body} cta="Kembali" onCta={() => nav('/dashboard/tier2/journey')} />}
    </JourneyShell>
  );
}
