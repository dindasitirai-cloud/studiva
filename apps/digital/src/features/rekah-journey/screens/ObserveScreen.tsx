// Rekah Journey — Observe (Phase 10G, Track A). "Apa yang Ibu lihat?" — the parent reports what they
// noticed about THIS child. Warm, parent-led, non-diagnostic, non-scoring, optional. A picked prompt
// becomes a frozen PARENT_OBSERVATION (via the adapter) held for the session; the frozen resolveFocus
// then proposes a SYSTEM_SUGGESTED focus. The UI never calls the engine or chooses a focus.
import { useNavigate } from 'react-router-dom';
import { useJourney } from '../useJourney';
import { useAnakAktif } from '../../../context/AnakContext';
import { JourneyShell, Card, Btn, EmptyState } from '../ui/brand';
import { promptsForAge } from '../observation/observationPrompts';
import { observationFromPrompt } from '../adapter/journeyInputAdapter';

export default function ObserveScreen() {
  const { childName, ageMonths, recordObservation } = useJourney();
  const { anak } = useAnakAktif();
  const nav = useNavigate();
  const prompts = promptsForAge(ageMonths);

  const pick = (promptId: string, domainOrArea: string, capabilityOrTopic: string, label: string) => {
    const obs = observationFromPrompt(
      { promptId, domainOrArea, capabilityOrTopic, parentWording: label },
      { threadId: anak.id, childId: anak.id, observedAt: new Date().toISOString(), idemSeed: `${anak.id}-${new Date().getTime()}` },
    );
    recordObservation(obs);
    // Return to Focus — the observation now informs a SYSTEM_SUGGESTED proposal (parent still confirms).
    nav('../focus');
  };

  return (
    <JourneyShell child={childName} eyebrow="apa yang Ibu lihat?" botanical="daisy">
      <h1 className="font-fredoka font-bold text-xl text-pekat mt-2">Ada yang Ibu perhatikan hari ini?</h1>
      <p className="mt-1 font-nunito text-pekat/70 text-sm">Pilih yang paling terasa. Ini bukan penilaian — hanya membantu kita menemani {childName}.</p>
      {prompts.length === 0 ? (
        <EmptyState botanical="sprig" title="Belum ada pilihan untuk usia ini" body="Tidak apa-apa — Ibu tetap bisa memilih fokus sendiri." cta="Kembali" onCta={() => nav('../focus')} />
      ) : (
        <>
          <div className="mt-4 space-y-2">
            {prompts.map((p) => (
              <button key={p.id} type="button" onClick={() => pick(p.id, p.domainOrArea, p.capabilityOrTopic, p.label)}
                className="w-full text-left rounded-[18px] border-2 border-rose-soft bg-white px-4 py-3 transition hover:bg-fajar min-h-[44px]">
                <span className="font-nunito font-bold text-pekat">{p.label}</span>
                {p.hint && <span className="block font-nunito text-sm text-pekat/60 mt-0.5">{p.hint}</span>}
              </button>
            ))}
          </div>
          <Btn variant="ghost" full className="mt-4" onClick={() => nav('../focus')}>Nanti saja</Btn>
        </>
      )}
    </JourneyShell>
  );
}
