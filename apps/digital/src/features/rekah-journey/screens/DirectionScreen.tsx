// Rekah Journey — Direction / GROUND (S7). Family-level Nilai Akar; optional; no scores (Phase 10C-3).
import { useNavigate } from 'react-router-dom';
import { JourneyShell, Card, Btn } from '../ui/brand';

// The 12 frozen Nilai Akar (family-value framework). Displayed as identity, never ranked/scored.
const NILAI_AKAR = ['Kejujuran', 'Syukur', 'Kasih Sayang', 'Empati', 'Kemandirian', 'Tanggung Jawab', 'Kesederhanaan', 'Cinta Ilmu', 'Sabar', 'Berbagi', 'Keberanian', 'Hormat pada Sesama'];

export default function DirectionScreen() {
  const nav = useNavigate();
  return (
    <JourneyShell eyebrow="arah keluarga" botanical="fivepetal">
      <h1 className="font-fredoka font-bold text-2xl text-pekat mt-2">Nilai yang menuntun keluargamu</h1>
      <p className="mt-2 font-nunito text-pekat/75">Pilih beberapa yang terasa penting — kapan pun kamu siap. Ini mewarnai perjalanan, bukan menilai.</p>
      <Card className="mt-4">
        <div className="flex flex-wrap gap-2" role="list">
          {NILAI_AKAR.map((v) => (
            <span key={v} role="listitem" className="rounded-full bg-pucuk px-3 py-1.5 font-nunito text-sm font-bold text-pekat">{v}</span>
          ))}
        </div>
      </Card>
      <p className="mt-3 font-nunito text-xs text-pekat/60">Arah keluarga bersifat opsional. Perjalanan tetap berjalan meski belum dipilih.</p>
      <Btn variant="secondary" full className="mt-5" onClick={() => nav('/dashboard/tier2/journey')}>Selesai</Btn>
    </JourneyShell>
  );
}
