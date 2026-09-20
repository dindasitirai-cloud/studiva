// Rekah Journey — Settings (S12). Minimal, calm (Phase 10C-3).
import { useNavigate } from 'react-router-dom';
import { useAnak } from '../../../context/AnakContext';
import { JourneyShell, Card, Btn } from '../ui/brand';

export default function SettingsScreen() {
  const nav = useNavigate();
  const { lepasAnakAktif } = useAnak();
  const rows: Array<{ label: string; onClick: () => void }> = [
    { label: 'Arah keluarga', onClick: () => nav('../direction') },
    { label: 'Anak dalam fokus', onClick: () => lepasAnakAktif() }, // existing Rekah picker
    { label: 'Riwayat perjalanan', onClick: () => nav('../history') },
  ];
  return (
    <JourneyShell eyebrow="pengaturan" botanical="sprig">
      <div className="mt-3 space-y-3">
        {rows.map((r) => (
          <Card key={r.label}>
            <button type="button" onClick={r.onClick} className="w-full min-h-[44px] flex items-center justify-between font-nunito font-bold text-pekat">
              {r.label}<span aria-hidden className="text-rekah">→</span>
            </button>
          </Card>
        ))}
      </div>
      <Btn variant="ghost" className="mt-4" onClick={() => nav('/dashboard/tier2/journey')}>Kembali</Btn>
    </JourneyShell>
  );
}
