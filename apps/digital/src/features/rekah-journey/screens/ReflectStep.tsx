// Rekah Journey — Reflect (S5). Navigation input, NOT a grade. One-tap, low pressure (Phase 10C-3).
// Phase 10D: the chips now build a REAL frozen Reflection (child response + difficulty + relevance)
// that is fed to the frozen adaptation resolver via the Application Service. Reflection is never a score.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '../useJourney';
import { useAnakAktif } from '../../../context/AnakContext';
import { reflectionFromInputs } from '../adapter/journeyInputAdapter';
import { JourneyShell, Card, Btn } from '../ui/brand';

const CHILD: Array<{ value: string; label: string }> = [
  { value: 'ENGAGED', label: 'Antusias' },
  { value: 'NEUTRAL', label: 'Biasa saja' },
  { value: 'RESISTANT', label: 'Belum tertarik' },
];
const CHIPS: Array<{ label: string; group: string; value: string }> = [
  { group: 'difficulty', value: 'EASY', label: 'Terasa mudah' },
  { group: 'difficulty', value: 'TOO_HARD', label: 'Cukup banyak' },
  { group: 'relevance', value: 'RELEVANT', label: 'Terasa pas' },
  { group: 'relevance', value: 'NOT_RELEVANT', label: 'Kurang pas' },
];

export default function ReflectStep() {
  const { advance, childName } = useJourney();
  const { anak } = useAnakAktif();
  const nav = useNavigate();
  const [picked, setPicked] = useState<Record<string, string>>({});
  const toggle = (g: string, v: string) => setPicked((p) => ({ ...p, [g]: p[g] === v ? '' : v }));

  const submit = () => {
    // Build the frozen Reflection from the parent's own chip choices (no fabrication; unset → null).
    const reflection = reflectionFromInputs(
      {
        difficulty: picked.difficulty || null,
        relevance: picked.relevance || null,
        childResponse: (picked.child || null) as any,
      },
      { idemSeed: `${anak.id}-${new Date().getTime()}`, threadId: anak.id, createdAt: new Date().toISOString() },
    );
    advance({ trigger: 'REFLECTED', reflection });
    nav('../next');
  };

  return (
    <JourneyShell child={childName} eyebrow="bagaimana rasanya?" botanical="daisy">
      <Card className="mt-3">
        <h1 className="font-fredoka font-bold text-xl text-pekat">Apa yang terjadi tadi?</h1>
        <p className="mt-1 font-nunito text-pekat/70 text-sm">Boleh dilewati. Ini bukan penilaian — hanya membantu langkah berikutnya.</p>

        <p className="mt-4 font-nunito text-sm text-pekat/70">Bagaimana si kecil menanggapinya?</p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Tanggapan anak">
          {CHILD.map((c) => {
            const on = picked.child === c.value;
            return (
              <button key={c.value} type="button" aria-pressed={on} onClick={() => toggle('child', c.value)}
                className={`min-h-[44px] rounded-full px-4 py-2 font-nunito text-sm font-bold transition ${on ? 'bg-rekah text-white' : 'bg-white border-2 border-rose-soft text-pekat'}`}>
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Refleksi">
          {CHIPS.map((c) => {
            const on = picked[c.group] === c.value;
            return (
              <button key={c.group + c.value} type="button" aria-pressed={on} onClick={() => toggle(c.group, c.value)}
                className={`min-h-[44px] rounded-full px-4 py-2 font-nunito text-sm font-bold transition ${on ? 'bg-rekah text-white' : 'bg-white border-2 border-rose-soft text-pekat'}`}>
                {c.label}
              </button>
            );
          })}
        </div>

        <Btn full className="mt-6" onClick={submit}>Selesai</Btn>
        <Btn variant="ghost" className="mt-2" onClick={submit}>Lewati</Btn>
      </Card>
    </JourneyShell>
  );
}
