import React from 'react';
import { Link } from 'react-router-dom';
import { Flower2 } from 'lucide-react';
import { PANEN } from '../../content/beranda-copy';

// TODO: hitung jumlah catatan dari tabel jurnal_perkembangan

interface Props {
  jumlahCatatan: number;
}

export default function PanenCard({ jumlahCatatan }: Props) {
  return (
    <div className="rounded-[20px_20px_20px_4px] bg-ungu/30 p-5">
      {/* Badge petal */}
      <div
        aria-hidden="true"
        className="mb-3 flex h-10 w-10 items-center justify-center bg-ungu/50 text-pekat/60"
        style={{ borderRadius: '70% 70% 70% 4px' }}
      >
        <Flower2 className="h-5 w-5" />
      </div>

      <p className="mb-1 font-nunito text-[11px] font-[800] uppercase tracking-widest text-pekat/40">
        {PANEN.eyebrow}
      </p>
      <h2 className="mb-1 font-fredoka text-[1.1rem] font-semibold text-pekat">
        {PANEN.judulCatatan(jumlahCatatan)}
      </h2>
      <p className="mb-4 font-nunito text-[13px] leading-relaxed text-pekat/65">
        {PANEN.ajakan}
      </p>

      <Link
        to="/dashboard/tier2/jejak-mekar"
        className="font-nunito text-[13px] font-semibold text-pekat/60 hover:text-rekah hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
      >
        {PANEN.linkLihat}
      </Link>
    </div>
  );
}
