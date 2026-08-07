import React from 'react';
import { Link } from 'react-router-dom';
import { BEKAL_SEKSI } from '../copy';

interface Props {
  tahapId: string | null;
}

// TODO: sambungkan ke bekalRegistry setelah kegiatan[] diisi per sub-tahap.
// Saat ini semua SubTahap.kegiatan = [] sehingga selalu tampil empty state.
// MENUNGGU REVIEW PSIKOLOG FITRI
export default function BekalMingguIni({ tahapId: _tahapId }: Props) {
  return (
    <section className="py-4">
      <h2 className="mb-3 font-fredoka text-[1.05rem] font-semibold text-pekat">
        {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
        {BEKAL_SEKSI.judul}
      </h2>
      <div className="rounded-[18px_18px_18px_4px] border border-rekah/10 bg-white p-5 text-center">
        <p className="mb-3 text-[14px] leading-relaxed text-pekat/55">
          {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
          {BEKAL_SEKSI.kosong}
        </p>
        <Link
          to="/dashboard/tier2/bekal"
          style={{ minHeight: 44 }}
          className="inline-flex items-center justify-center rounded-[12px_12px_12px_3px] bg-rekah px-5 py-2.5 text-[13px] font-semibold text-white no-underline transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah motion-reduce:transition-none"
        >
          {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
          {BEKAL_SEKSI.tautanBekal}
        </Link>
      </div>
    </section>
  );
}
