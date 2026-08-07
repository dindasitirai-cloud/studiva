import React from 'react';
import { Link } from 'react-router-dom';
import { useJurnalRekah } from '../../../../context/JurnalRekahContext';
import { RAIL_MOMEN } from '../../copy';

// MENUNGGU REVIEW PSIKOLOG FITRI
export default function KartuMomenTerakhir() {
  const { entri } = useJurnalRekah();
  const terbaru = entri[0] ?? null;

  return (
    <div className="rounded-[16px_16px_16px_4px] bg-white p-4 shadow-sm">
      <h3 className="mb-2 font-fredoka text-[0.95rem] font-semibold text-pekat">
        {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
        {RAIL_MOMEN.judul}
      </h3>
      {terbaru ? (
        <div>
          <p className="text-[12px] font-semibold text-pekat">{terbaru.judul}</p>
          {terbaru.catatan && (
            <p className="mt-0.5 line-clamp-2 text-[12px] text-pekat/55">
              {terbaru.catatan}
            </p>
          )}
          <p className="mt-1 text-[11px] text-pekat/35">{terbaru.tanggal}</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-2 text-[12.5px] text-pekat/50">
            {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
            {RAIL_MOMEN.kosong}
          </p>
          <Link
            to="/dashboard/tier2/jurnal-perkembangan"
            style={{ minHeight: 44 }}
            className="inline-flex items-center justify-center rounded-[10px_10px_10px_3px] bg-rekah/10 px-3 py-2 text-[12px] font-semibold text-rekah no-underline hover:bg-rekah/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
            {RAIL_MOMEN.tombolCatat}
          </Link>
        </div>
      )}
    </div>
  );
}
