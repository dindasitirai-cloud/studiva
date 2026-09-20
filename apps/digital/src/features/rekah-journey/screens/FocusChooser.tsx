// Rekah Journey — Focus Chooser (S2). Parent agency + soft system suggestion, no scores.
// Phase 10E-2: adds an explicit parent value-picker. A parent-picked value flows through the
// Application Service as parentSelectedTargets → the frozen resolveFocus returns PARENT_SELECTED
// provenance (never SYSTEM_DERIVED). Accept / reject / select are persisted as ParentActionEvents.
// The UI never calls the engine directly and never chooses a focus itself.
import { useNavigate } from 'react-router-dom';
import { useJourney, useEnter } from '../useJourney';
import { JourneyShell, Card, Btn, ProvenanceTag, EmptyState } from '../ui/brand';
import type { FamilyValue } from '@studiva/shared/journey';

export default function FocusChooser() {
  const { view, advance, recordParentAction, childName, dataReady, focusChoices } = useJourney();
  const nav = useNavigate();
  useEnter(advance, { trigger: 'OBSERVED' }, dataReady);
  if (!view) return <JourneyShell child={childName} />;

  const acceptSystem = () => { recordParentAction('ACCEPT', 'system-suggested'); advance({ trigger: 'FOCUS_SELECTED' }); nav('../prepare'); };
  const pickValue = (value: FamilyValue) => {
    // Parent explicitly chooses — highest authority. resolveFocus returns PARENT_SELECTED.
    recordParentAction('ACCEPT', `parent-selected:${value}`);
    advance({ trigger: 'FOCUS_SELECTED', parentSelectedTargets: { value } });
    nav('../prepare');
  };
  const reject = () => { recordParentAction('REJECT', 'deferred'); nav('/dashboard/tier2/journey'); };

  const isSystem = view.kind === 'READY' && !!view.focus && view.focus.provenance !== 'PARENT';
  const choices = (focusChoices ?? []) as readonly FamilyValue[];

  return (
    <JourneyShell child={childName} eyebrow="sedang kita perhatikan" botanical="fivepetal">
      <h1 className="font-fredoka font-bold text-xl text-pekat mt-2">Apa yang paling penting sekarang?</h1>

      {view.kind === 'NO_FOCUS' && (
        <p className="mt-2 font-nunito text-pekat/70 text-sm">Belum ada yang perlu dipilih sistem hari ini — tapi kamu boleh memilih sendiri.</p>
      )}

      {view.kind === 'READY' && view.focus && (
        <Card className="mt-4">
          <ProvenanceTag provenance={view.focus.provenance} />
          <p className="mt-3 font-nunito text-pekat text-lg">
            {isSystem ? 'Mungkin ingin kita perhatikan ini. Kalau terasa sesuai, kita bisa mulai dari sini.' : view.whereWeAre}
          </p>
          <Btn full className="mt-5" onClick={acceptSystem}>{isSystem ? 'Ini cocok untuk kami' : 'Lanjutkan'}</Btn>
          <Btn variant="ghost" className="mt-2" onClick={reject}>Nanti saja</Btn>
        </Card>
      )}

      {/* Explicit parent value-picker (10E-2). Only shown when the family has real chosen values. */}
      {choices.length > 0 && (
        <Card className="mt-4">
          <p className="font-shantell text-rekah">atau pilih sendiri</p>
          <p className="mt-1 font-nunito text-pekat/70 text-sm">Nilai yang ingin kamu rawat bersama {childName} hari ini.</p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Pilih nilai fokus">
            {choices.map((v) => (
              <button key={v} type="button" onClick={() => pickValue(v)}
                className="min-h-[44px] rounded-full px-4 py-2 font-nunito text-sm font-bold bg-white border-2 border-rose-soft text-pekat transition hover:bg-fajar">
                {v}
              </button>
            ))}
          </div>
        </Card>
      )}

      {view.kind === 'NO_FOCUS' && choices.length === 0 && (
        <EmptyState botanical="daisy" title={view.copy.title} body={view.copy.body} cta={view.copy.primaryCta} onCta={() => nav('/dashboard/tier2/journey')} />
      )}
    </JourneyShell>
  );
}
