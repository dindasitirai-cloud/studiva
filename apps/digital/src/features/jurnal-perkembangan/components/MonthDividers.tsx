import React from 'react';
import { MONTHS_SHORT, MONTHS_FULL, TAB_BG, TAB_ACTIVE } from '../data/mockJurnalData';

interface Props {
  activeMonth: number;
  onSelect: (month: number) => void;
}

export default function MonthDividers({ activeMonth, onSelect }: Props) {
  return (
    <div
      className="absolute flex flex-col gap-[3px]"
      role="tablist"
      aria-label="Pilih bulan"
      style={{ right: -34, top: 26, zIndex: 8 }}
    >
      {MONTHS_SHORT.map((label, i) => {
        const isActive = i === activeMonth;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Bulan ${MONTHS_FULL[i]}`}
            onClick={() => onSelect(i)}
            className="jp-div-tab"
            style={{
              background: isActive ? TAB_ACTIVE[i] : TAB_BG[i],
              width: isActive ? 48 : undefined,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
