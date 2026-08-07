// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React from 'react';
import type { SubTahap, SubTahapId } from '../beranda-usia/bekal';
import type { SapaanSet } from '../beranda-usia/useChildProfile';
import { renderRichText } from '../beranda-usia/renderRichText';
import { LABEL_SUB_TAHAP } from '../beranda-usia/bekalContent';
import { PEMILIH_SUB_TAHAP } from './content';

interface PropsPemilihSubTahap {
  subTahapList:      readonly SubTahap[];
  /** null bila display bekal bukan bekal aktif anak — tidak ada posisi yang disorot. */
  subTahapAktifId:   SubTahapId | null;
  subTahapDilihatId: SubTahapId;
  onPilih:           (id: SubTahapId) => void;
  sapaan:            SapaanSet;
}

export default function PemilihSubTahap({
  subTahapList,
  subTahapAktifId,
  subTahapDilihatId,
  onPilih,
  sapaan,
}: PropsPemilihSubTahap) {
  const subTahapAktifDalamList =
    subTahapAktifId !== null &&
    subTahapList.some(st => st.id === subTahapAktifId);

  return (
    <div>
      {/* Pills sub-tahap */}
      <div
        role="tablist"
        aria-label="Pilih sub-tahap"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {subTahapList.map(st => {
          const sedangDilihat = st.id === subTahapDilihatId;
          const iniPosisiAnak = st.id === subTahapAktifId;

          return (
            <button
              key={st.id}
              type="button"
              role="tab"
              aria-selected={sedangDilihat}
              onClick={() => onPilih(st.id)}
              className={[
                'flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-colors',
                sedangDilihat
                  ? 'bg-rekah text-white'
                  : iniPosisiAnak
                  ? 'border-2 border-rekah bg-white text-rekah'
                  : 'border border-bordergray bg-white text-pekat',
              ].join(' ')}
            >
              {LABEL_SUB_TAHAP[st.id] ?? st.label}
              {iniPosisiAnak && !sedangDilihat && (
                <span className="ml-1 text-[11px] opacity-70">
                  {PEMILIH_SUB_TAHAP.tandaAktif}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Keterangan posisi anak */}
      {subTahapAktifDalamList && (
        <p className="mt-2 text-[12px] text-ink-soft">
          {renderRichText(PEMILIH_SUB_TAHAP.posisiAnak, sapaan)}
        </p>
      )}
    </div>
  );
}
