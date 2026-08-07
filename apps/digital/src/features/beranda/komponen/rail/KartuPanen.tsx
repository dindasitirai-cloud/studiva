import React from 'react';
import { Link } from 'react-router-dom';
import { useRekahRefleksi } from '../../../../context/RekahRefleksiContext';
import { JEJAK_COPY } from '../../../rekah-jejak/rekahJejakCopy';
import { RAIL_PANEN } from '../../copy';

// MENUNGGU REVIEW PSIKOLOG FITRI
export default function KartuPanen() {
  const { entries } = useRekahRefleksi();
  const isEmpty = entries.length === 0;

  return (
    <div className="rounded-[16px_16px_16px_4px] bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-fredoka text-[0.95rem] font-semibold text-pekat">
          {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
          {RAIL_PANEN.judul}
        </h3>
        <Link
          to="/dashboard/tier2/jejak-mekar"
          className="text-[12px] font-semibold text-rekah hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
          {RAIL_PANEN.tautanLihat}
        </Link>
      </div>
      <p className="text-[12.5px] text-pekat/55">
        {isEmpty
          ? JEJAK_COPY.musimSebelumnyaEmpty
          : JEJAK_COPY.polaBelumCukup
        }
      </p>
    </div>
  );
}
