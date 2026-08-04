import React from 'react';

// TODO: review Fitri — label sub tahap usia
const OPSI_SUB_USIA = [
  { id: 'b03',  label: '0-3 bln',  minBulan: 0, maxBulan: 3  },
  { id: 'b36',  label: '3-6 bln',  minBulan: 3, maxBulan: 6  },
  { id: 'b69',  label: '6-9 bln',  minBulan: 6, maxBulan: 9  },
  { id: 'b912', label: '9-12 bln', minBulan: 9, maxBulan: 12 },
] as const;

export type IdSubUsia = (typeof OPSI_SUB_USIA)[number]['id'];

// Peta IdSubUsia → ageKey yang dipakai KnowledgeGallery / WawasanTumbuh
export const SUB_USIA_TO_AGE_KEY: Record<IdSubUsia, string> = {
  b03:  '0-3m',
  b36:  '3-6m',
  b69:  '6-9m',
  b912: '9-12m',
};

export { OPSI_SUB_USIA };

/** Kembalikan sub tahap yang sesuai dengan usia anak. */
export function resolveSubUsia(usiaBulan: number): IdSubUsia {
  if (usiaBulan < 3) return 'b03';
  if (usiaBulan < 6) return 'b36';
  if (usiaBulan < 9) return 'b69';
  return 'b912';
}

interface Props {
  nilai: IdSubUsia;
  onPilih: (id: IdSubUsia) => void;
}

/** Deretan pil filter sub tahap 0-1 tahun. Hanya ditampilkan bila usiaBulan < 12. */
export default function FilterSubUsia({ nilai, onPilih }: Props) {
  return (
    <div
      role="group"
      aria-label="Filter sub tahap usia"
      style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0 12px' }}
    >
      {OPSI_SUB_USIA.map(opsi => {
        const aktif = opsi.id === nilai;
        return (
          <button
            key={opsi.id}
            type="button"
            onClick={() => onPilih(opsi.id as IdSubUsia)}
            aria-pressed={aktif}
            style={{
              padding: '5px 14px',
              borderRadius: 999,
              border: aktif ? '1.5px solid #E0526B' : '1.5px solid rgba(224,82,107,.25)',
              background: aktif ? '#FFF3F6' : 'transparent',
              color: aktif ? '#E0526B' : '#8A7A80',
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 12,
              fontWeight: aktif ? 700 : 600,
              cursor: 'pointer',
              transition: 'background 140ms ease, color 140ms ease, border-color 140ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            {opsi.label}
          </button>
        );
      })}
    </div>
  );
}
