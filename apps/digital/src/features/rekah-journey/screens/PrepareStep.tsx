// Rekah Journey — Prepare (S3). Lightweight "why + how"; progressive disclosure of detail (Phase 10C-3).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '../useJourney';
import { JourneyShell, Card, Btn, EmptyState } from '../ui/brand';

export default function PrepareStep() {
  const { view, advance, childName } = useJourney();
  const nav = useNavigate();
  const [showDetail, setShowDetail] = useState(false);
  if (!view) return <JourneyShell child={childName} />;

  if (view.kind === 'READY' && view.step) {
    return (
      <JourneyShell child={childName} eyebrow="sebelum mulai" botanical="bell">
        <Card className="mt-3">
          <h1 className="font-fredoka font-bold text-xl text-pekat">Sedikit bekal dulu</h1>
          <p className="mt-2 font-nunito text-pekat/80">Hal kecil yang membantu kamu mendampingi momen ini.</p>
          <Btn variant="ghost" className="mt-3" onClick={() => setShowDetail((s) => !s)} aria-expanded={showDetail}>
            {showDetail ? 'Sembunyikan dasar ilmiahnya' : 'Lihat dasar ilmiahnya'}
          </Btn>
          {showDetail && <p className="mt-2 font-nunito text-sm text-pekat/70">Rekomendasi ini mengacu pada guideline tumbuh kembang. Rincian penuh tersedia di pustaka.</p>}
          <Btn full className="mt-6" onClick={() => { advance({ trigger: 'PREPARED' }); nav('../do'); }}>Siap — ayo coba</Btn>
          <Btn variant="ghost" className="mt-2" onClick={() => { advance({ trigger: 'PREPARED' }); nav('../do'); }}>Langsung saja</Btn>
        </Card>
      </JourneyShell>
    );
  }
  // No prep resource -> honest, go straight to Do
  return <JourneyShell child={childName}><EmptyState botanical="sprig" title="Belum ada bekal khusus" body="Tidak apa-apa — kita bisa langsung mencoba." cta="Ayo coba" onCta={() => { advance({ trigger: 'PREPARED' }); nav('../do'); }} /></JourneyShell>;
}
