// Rekah Journey — Child Switcher (S8). One family journey, per-child threads; explicit switch (Phase 10C-3).
import { useNavigate } from 'react-router-dom';
import { useAnak } from '../../../context/AnakContext';
import { useJourney } from '../useJourney';
import { JourneyShell, Card, Btn } from '../ui/brand';

export default function ChildSwitcher() {
  const { daftarAnak, anakAktif, pilihAnak, mintaTambahAnak } = useAnak();
  const { advance, childName } = useJourney();
  const nav = useNavigate();
  const choose = (id: string) => { pilihAnak(id); advance({ trigger: 'CHANGE_CHILD' }); nav('/dashboard/tier2/journey'); };

  return (
    <JourneyShell child={childName} eyebrow="anak dalam fokus" botanical="sprig">
      <p className="mt-2 font-nunito text-pekat/75">Satu perjalanan keluarga. Nilai & praktik pengasuhan tetap sama untuk semua anak.</p>
      <div className="mt-4 space-y-3">
        {daftarAnak.map((a) => {
          const active = anakAktif?.id === a.id;
          return (
            <Card key={a.id} className={active ? 'ring-2 ring-rekah' : ''}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-fredoka font-bold text-lg text-pekat">{a.namaAnak}</p>
                  {active && <p className="font-nunito text-xs text-rekah font-bold">Sedang dalam fokus</p>}
                </div>
                {!active && <Btn onClick={() => choose(a.id)}>Beralih</Btn>}
              </div>
            </Card>
          );
        })}
      </div>
      <Btn variant="secondary" full className="mt-5" onClick={mintaTambahAnak}>Tambah anak</Btn>
    </JourneyShell>
  );
}
