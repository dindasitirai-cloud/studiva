// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React from 'react';
import type { ItemSikap } from '../beranda-usia/adapter/sikapAdapter';
import type { SapaanSet } from '../beranda-usia/useChildProfile';
import { KARTU_RUTINITAS } from './content';
import BotanicalStem from '../../components/BotanicalStem';
import FlowerMark from '../../components/FlowerMark';
import type { FlowerMarkConfig } from '../../components/FlowerMark';

interface PropsKartuRutinitas {
  sikap: ItemSikap | null;
  wizardBelumDiisi: boolean;
  sapaan: SapaanSet;
  onKeTamanAkar?: () => void;
}

const MARK_CFG: FlowerMarkConfig = {
  shape: 'bud', petalCount: 5, budIndices: [2, 3], petalW: 15, petalLen: 34,
  centerR: 15, jitter: 0.05, spin: 0, budColor: '#8FB8F7',
  petalColors: ['#fff', '#FFE29A', '#F8B9D4', '#fff', '#FFE29A'],
  centerColors: ['#6E3B57', '#F06BA8', '#FFE29A'],
};

const TULIP_CFG = { type: 'tulip' as const, bloom: '#fff', bloom2: '#FFE29A', center: '#C93F79' };

export default function KartuRutinitas({ sikap, wizardBelumDiisi, sapaan, onKeTamanAkar }: PropsKartuRutinitas) {
  return (
    <section
      className="relative overflow-hidden rounded-[26px] bg-rekah p-[26px_30px] text-white"
      style={{ boxShadow: '0 20px 40px -26px rgba(90,50,70,.55)' }}
      aria-labelledby="kartu-rutinitas-judul"
    >
      {/* Soft blob 1 */}
      <div aria-hidden className="pointer-events-none absolute -left-[30px] -top-[40px] h-[150px] w-[150px] rounded-full bg-white/[.14]" />
      {/* Soft blob 2 */}
      <div aria-hidden className="pointer-events-none absolute -bottom-[56px] left-[120px] h-[110px] w-[110px] rounded-full bg-white/[.14]" />

      {/* Botanical right — tulip with sway */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[26px] top-1/2 -translate-y-1/2 animate-sway"
        style={{ width: '96px', height: '150px' }}
      >
        <BotanicalStem cfg={TULIP_CFG} />
      </div>

      <div className="relative flex items-center gap-6">
        {/* Badge / flower mark */}
        <div
          className="flex h-[74px] w-[74px] flex-none items-center justify-center rounded-[22px] bg-white/[.22]"
          style={{ boxShadow: '0 10px 22px -14px rgba(90,50,70,.6)' }}
        >
          <div className="h-[52px] w-[52px]">
            <FlowerMark cfg={MARK_CFG} />
          </div>
        </div>

        {/* Text area */}
        <div className="min-w-0 flex-1 pr-[104px]">
          <div className="flex items-center gap-2.5">
            <p
              id="kartu-rutinitas-judul"
              className="font-nunito text-[12px] font-[800] uppercase tracking-[1.5px] text-white/90"
            >
              {KARTU_RUTINITAS.judul}
            </p>
            <span className="rounded-full bg-kuning px-[10px] py-[3px] font-nunito text-[11px] font-[800] text-[#8A5A14]">
              Latihan Bunda
            </span>
          </div>

          {wizardBelumDiisi ? (
            <WizardBelumDiisi onKeTamanAkar={onKeTamanAkar} />
          ) : sikap === null ? (
            <SikapKosong />
          ) : (
            <SikapAktif sikap={sikap} sapaan={sapaan} />
          )}
        </div>
      </div>
    </section>
  );
}

function WizardBelumDiisi({ onKeTamanAkar }: { onKeTamanAkar?: () => void }) {
  return (
    <div className="mt-2">
      <p className="font-fredoka text-[21px] font-semibold leading-snug text-white">
        {KARTU_RUTINITAS.wizardBelumDiisi.judul}
      </p>
      <p className="mt-1 font-nunito text-[13px] text-white/80">
        {KARTU_RUTINITAS.wizardBelumDiisi.ajakan}
      </p>
      <button
        type="button"
        onClick={onKeTamanAkar}
        className="mt-3 rounded-full bg-white px-4 py-1.5 font-nunito text-[13px] font-semibold text-rekah"
      >
        {KARTU_RUTINITAS.wizardBelumDiisi.tautanLabel}
      </button>
    </div>
  );
}

function SikapKosong() {
  return (
    <p className="mt-2 font-nunito text-[14px] text-white/80">{KARTU_RUTINITAS.sikapKosong}</p>
  );
}

interface PropsSikapAktif { sikap: ItemSikap; sapaan: SapaanSet; }

function SikapAktif({ sikap }: PropsSikapAktif) {
  const chips = ['Akar', ...sikap.nilai, 'Sepanjang hari · tanpa target'];
  return (
    <div>
      <p className="mt-2 font-fredoka text-[27px] font-semibold leading-[1.12] text-white">
        {sikap.judul}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map(c => (
          <span
            key={c}
            className="rounded-[20px] bg-white/20 px-[13px] py-[6px] font-nunito text-[12.5px] font-bold text-white"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
