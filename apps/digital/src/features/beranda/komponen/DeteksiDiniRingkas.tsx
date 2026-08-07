import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DETEKSI } from '../../beranda-usia/bands/tahun-pertama/content';
import { renderRichText } from '../../beranda-usia/renderRichText';
import type { SapaanSet } from '../../beranda-usia/useChildProfile';
import { DETEKSI_SEKSI } from '../copy';
import { useJurnalRekah } from '../../../context/JurnalRekahContext';

interface Props {
  sapaan: SapaanSet;
}

// MENUNGGU REVIEW PSIKOLOG FITRI
export default function DeteksiDiniRingkas({ sapaan }: Props) {
  const navigate = useNavigate();
  const { addEntri } = useJurnalRekah();

  function handleSimpanKeJurnal() {
    void addEntri({
      judul: DETEKSI.title,
      catatan: DETEKSI.reassure,
      tanggal: new Date().toISOString().slice(0, 10),
      tag: 'manual',
    });
    navigate('/dashboard/tier2/jurnal-perkembangan');
  }

  return (
    <section className="py-4" aria-labelledby="deteksi-heading">
      <div className="rounded-[18px_18px_18px_4px] border-l-4 border-daun bg-white p-5">
        <span className="mb-2 inline-block rounded-full bg-daun/10 px-3 py-1 text-[12px] font-semibold text-daun">
          {DETEKSI.eyebrow}
        </span>
        <h2
          id="deteksi-heading"
          className="mb-1 font-fredoka text-[1.05rem] font-semibold text-pekat"
        >
          {DETEKSI.title}
        </h2>
        <p className="mb-4 text-[13.5px] leading-relaxed text-pekat/60">
          {renderRichText(DETEKSI.sub, sapaan)}
        </p>

        <ul className="mb-4 grid gap-2 sm:grid-cols-2">
          {DETEKSI.flags.map(flag => (
            <li
              key={flag}
              className="rounded-[12px_12px_12px_3px] bg-daun/8 px-3.5 py-2.5 text-[13px] text-pekat"
            >
              🌱 {flag}
            </li>
          ))}
        </ul>

        <p className="mb-4 rounded-[14px_14px_14px_4px] bg-kanvas p-4 text-[13px] leading-relaxed text-pekat/60">
          {DETEKSI.reassure}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSimpanKeJurnal}
            style={{ minHeight: 44 }}
            className="flex-1 rounded-[12px_12px_12px_3px] bg-daun px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-daun/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun motion-reduce:transition-none"
          >
            {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
            {DETEKSI_SEKSI.tombolSimpan}
          </button>
          <Link
            to="/dashboard/tier2/panduan"
            style={{ minHeight: 44 }}
            className="flex flex-1 items-center justify-center rounded-[12px_12px_12px_3px] border border-daun/40 px-4 py-2.5 text-[13px] font-semibold text-daun no-underline transition hover:bg-daun/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun motion-reduce:transition-none"
          >
            {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
            {DETEKSI_SEKSI.tombolPanduan}
          </Link>
        </div>
      </div>
    </section>
  );
}
