// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React, { useState } from 'react';
import type { ItemBekal } from '../beranda-usia/bekal';
import type { BlokWaktu } from './PilihanHarianContext';
import { usePilihanHarian } from './PilihanHarianContext';
import { KARTU_BELUM_DITARUH, SUSUNAN_HARI } from './content';

export default function KartuBelumDitaruh() {
  const { pilihanEfektif, penempatanEfektif, pindahBlok } = usePilihanHarian();

  const itemBelumDitaruh = pilihanEfektif.filter(i => !penempatanEfektif[i.id]);

  if (itemBelumDitaruh.length === 0) return null;

  return (
    <section aria-labelledby="belum-ditaruh-judul">
      <h2
        id="belum-ditaruh-judul"
        className="mb-2 font-bricolage text-[15px] font-semibold text-pekat"
      >
        {KARTU_BELUM_DITARUH.judul}
      </h2>

      <ul className="flex flex-col gap-2">
        {itemBelumDitaruh.map(item => (
          <ItemBelumDitaruh key={item.id} item={item} onPilihBlok={pindahBlok} />
        ))}
      </ul>
    </section>
  );
}

interface PropsItemBelumDitaruh {
  item: ItemBekal;
  onPilihBlok: (id: string, blok: BlokWaktu | null) => void;
}

function ItemBelumDitaruh({ item, onPilihBlok }: PropsItemBelumDitaruh) {
  const [pickerTerbuka, setPickerTerbuka] = useState(false);

  return (
    <li className="flex items-center justify-between rounded-[14px_14px_14px_4px] border border-dashed border-bordergray bg-white px-4 py-3">
      <span className="text-[14px] font-medium text-pekat">{item.judul}</span>

      <div className="relative">
        <button
          type="button"
          onClick={() => setPickerTerbuka(p => !p)}
          aria-expanded={pickerTerbuka}
          className="rounded-full bg-kanvas px-3 py-1.5 text-[12px] font-medium text-pekat"
        >
          {KARTU_BELUM_DITARUH.pilihBlokLabel}
        </button>

        {pickerTerbuka && (
          <div
            role="dialog"
            aria-label={KARTU_BELUM_DITARUH.pilihBlokLabel}
            className="absolute right-0 top-9 z-10 flex flex-col gap-1 rounded-[14px_14px_14px_4px] border border-bordergray bg-white p-2 shadow-md"
          >
            {(['pagi', 'siang', 'sore', 'jelangTidur'] as BlokWaktu[]).map(b => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  onPilihBlok(item.id, b);
                  setPickerTerbuka(false);
                }}
                className="rounded-lg px-4 py-2 text-left text-[13px] text-pekat hover:bg-kanvas"
              >
                {SUSUNAN_HARI.blokLabel[b]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPickerTerbuka(false)}
              className="mt-1 border-t border-bordergray pt-1 text-[12px] text-ink-soft"
            >
              {SUSUNAN_HARI.tutupPickerLabel}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
