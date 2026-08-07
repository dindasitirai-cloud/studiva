// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React from 'react';
import { usePilihanHarian } from './PilihanHarianContext';
import { CATATAN_HARI } from './content';

interface PropsCatatanHari {
  namaAnak?: string;
}

const TORN_CLIP = 'polygon(0% 0%,100% 0%,100% 90%,95% 93.5%,90% 89%,84% 94%,78% 90%,71% 95%,64% 90%,57% 94%,50% 90%,43% 95%,36% 90%,29% 94%,22% 90%,15% 94.5%,9% 90%,4% 94%,0% 90%)';

export default function CatatanHari({ namaAnak }: PropsCatatanHari) {
  const { catatan, tulisCatatan } = usePilihanHarian();
  const labelJurnal = namaAnak ? `Tersimpan ke Jurnal ${namaAnak}` : 'Tersimpan ke Jurnal';

  return (
    <section aria-labelledby="catatan-hari-judul" className="relative mt-4">
      {/* Washi tape — pink */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: '-12px', left: '26px',
          width: '70px', height: '22px',
          borderRadius: '4px',
          background: 'rgba(240,107,168,.42)',
          transform: 'rotate(-7deg)',
        }}
      />
      {/* Washi tape — sky */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: '-9px', right: '38px',
          width: '64px', height: '22px',
          borderRadius: '4px',
          background: 'rgba(143,184,247,.5)',
          transform: 'rotate(6deg)',
        }}
      />

      {/* Card with torn bottom edge */}
      <div
        className="bg-[#FFFDF8] px-5 pb-14 pt-6"
        style={{ clipPath: TORN_CLIP }}
      >
        <p
          id="catatan-hari-judul"
          className="mb-2 font-nunito text-[11px] font-[800] uppercase tracking-widest text-rekah/70"
          style={{ fontVariant: 'small-caps' }}
        >
          {CATATAN_HARI.judul}
        </p>

        <textarea
          value={catatan}
          onChange={e => tulisCatatan(e.target.value)}
          placeholder="Tulis satu hal kecil tentang hari ini..."
          rows={4}
          className="w-full resize-none rounded-[12px] border-none bg-transparent font-shantell text-[18px] italic text-pekat placeholder:font-shantell placeholder:text-[18px] placeholder:italic placeholder:text-ink-soft/50 focus:outline-none"
          aria-label={CATATAN_HARI.judul}
        />

        <p className="mt-1.5 font-nunito text-[12px] text-ink-soft/60">{labelJurnal}</p>
      </div>
    </section>
  );
}
