import React from 'react';
import { useAnakAktif, useFotoAnak } from '../../../../context/AnakContext';
import { inisialAnak } from '../../../../types/anak';
import { ringkasRentang } from '../../../beranda-usia/registry';
import { RAIL_ANAK } from '../../copy';

// MENUNGGU REVIEW PSIKOLOG FITRI
export default function KartuAnakAktif() {
  const { anak, usiaBulan, sapaan } = useAnakAktif();
  const foto = useFotoAnak(anak.fotoPath);
  const ringkas = ringkasRentang(usiaBulan);

  return (
    <div className="flex items-center gap-3 rounded-[16px_16px_16px_4px] bg-white p-4 shadow-sm">
      {/* Avatar */}
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden bg-rekah text-[14px] font-bold text-white"
        style={{ borderRadius: '70% 70% 70% 4px' }}
      >
        {foto ? (
          <img src={foto} alt="" className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden="true">{inisialAnak(anak.namaAnak)}</span>
        )}
      </div>

      {/* Nama + usia */}
      <div className="min-w-0">
        <p className="truncate font-fredoka text-[1rem] font-semibold text-pekat">
          {sapaan.cap}
        </p>
        {ringkas && (
          <p className="text-[12px] text-pekat/50">
            {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
            {RAIL_ANAK.labelUsiaRentang} {ringkas.rentang}
          </p>
        )}
      </div>
    </div>
  );
}
